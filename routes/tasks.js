import buildFormObj from '../lib/formObjectBuilder';
import buildFilter from '../lib/filterBuilder';
import userAuth from '../lib/middlewares';
import { findAndCountAllTasks, findOrCreateTags, sanitizeQuery } from '../lib/util';
import getPaginationObject from '../lib/pagination';
import {
  User, Task, TaskStatus, Tag,
} from '../models';

export default (router, { logger }) => {
  router
    .get('tasks', '/tasks', async (ctx) => {
      const { query } = ctx.request;
      const sanitizedQuery = sanitizeQuery(query);
      const filter = buildFilter(sanitizedQuery);
      const { tasks, count } = await findAndCountAllTasks(filter);
      const users = await User.findAll();
      const statuses = await TaskStatus.findAll();
      const tags = await Tag.findAll();
      const paginationObject = await getPaginationObject(sanitizedQuery, count);
      ctx.render('tasks', {
        tasks,
        users: [{ id: 'any', fullName: 'any' }, ...users],
        statuses: [{ id: 'any', name: 'any' }, ...statuses],
        tags,
        searchForm: sanitizedQuery,
        paginationObject,
      });
    })
    .get('newTask', '/tasks/new', userAuth, async (ctx) => {
      const users = await User.findAll();
      const statuses = await TaskStatus.findAll();
      // const tags = await Tag.findAll();
      const task = Task.build();
      ctx.render('tasks/new', { f: buildFormObj(task), users, statuses });
    })
    .get('showTask', '/tasks/:id', async (ctx) => {
      const { id } = ctx.params;
      const task = await Task.scope({ method: ['findByPk', id] }).findOne();
      ctx.render('tasks/show', { task });
    })
    .get('taskEdit', '/tasks/:id/edit', userAuth, async (ctx) => {
      const { id } = ctx.params;
      const task = await Task.scope({ method: ['findByPk', id] }).findOne();
      const users = await User.findAll();
      const statuses = await TaskStatus.findAll();
      // const tags = task.Tags.map(tag => tag.name).join(' ');
      ctx.render('tasks/edit', { f: buildFormObj(task), users, statuses });
    })
    .post('createTask', '/tasks', userAuth, async (ctx) => {
      const { form } = ctx.request.body;
      const { userId: creatorId } = ctx.session;
      const taskForm = { ...form, creatorId };
      const tags = await findOrCreateTags(form.tagsQuery);
      const task = Task.build(taskForm);
      logger('createing task: %o', task);
      try {
        await task.save();
        await task.setTags(tags);
        ctx.flash.set('Task has been created');
        ctx.redirect(router.url('tasks'));
      } catch (err) {
        logger('task save error: %o', err);
        const users = await User.findAll();
        const statuses = await TaskStatus.findAll();
        ctx.render('tasks/new', { f: buildFormObj(task, err), users, statuses });
      }
    })
    .patch('updateTask', '/tasks/:id', userAuth, async (ctx) => {
      const { id } = ctx.params;
      const { form: updatedTask } = ctx.request.body;
      const task = await Task.findByPk(id);
      const tags = await findOrCreateTags(updatedTask.tagsQuery);
      logger('updating task with data: %s', updatedTask);
      try {
        await task.update(updatedTask);
        await task.setTags(tags);
        // ctx.flash.set('Task was updated');
        ctx.redirect(router.url('showTask', { id }));
      } catch (err) {
        logger('task update error: %o', err);
        const users = await User.findAll();
        const statuses = await TaskStatus.findAll();
        ctx.render('tasks/edit', { f: buildFormObj(task, err), users, statuses });
      }
    })
    .delete('deleteTask', '/tasks/:id/delete', userAuth, async (ctx) => {
      const { id } = ctx.params;
      const task = await Task.findByPk(id);
      try {
        await task.destroy();
        ctx.flash.set('The task was deleted');
      } catch (err) {
        ctx.flash.set('An error occured on deleting the task. Try again');
      }
      ctx.redirect(router.url('tasks'));
    });
};
