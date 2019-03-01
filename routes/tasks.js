import buildFormObj from '../lib/formObjectBuilder';
import buildFilter from '../lib/filterBuilder';
import userAuth from '../lib/middlewares';
import { getFilteredTasks, findOrCreateTags } from '../lib/util';
import getPaginationObject from '../lib/pagination';
import {
  User, Task, TaskStatus, Tag,
} from '../models';

export default (router, { logger }) => {
  router
    .get('tasks', '/tasks', async (ctx) => {
      const { query } = ctx.request;
      console.log('query', query);
      const { userId: currentUser } = ctx.session;
      const filter = buildFilter(query);
      console.log('filter', filter);
      try {
        await getFilteredTasks(filter);
      } catch (err) {
        console.error(err);
      }
      const { tasks, count } = await getFilteredTasks(filter);
      const users = await User.findAll();
      const statuses = await TaskStatus.findAll();
      const tags = await Tag.findAll();
      const paginationObject = await getPaginationObject(query, count);
      console.log('pagination', paginationObject);
      try {
        ctx.render('tasks', {
          tasks,
          users: [{ id: 'any', fullName: 'any' }, ...users],
          statuses: [{ id: 'any', name: 'any' }, ...statuses],
          currentUser,
          tags,
          filter,
          paginationObject,
        });
      } catch (err) {
        console.error(err);
      }
    })
    .get('newTask', '/tasks/new', userAuth, async (ctx) => {
      const users = await User.findAll();
      const statuses = await TaskStatus.findAll();
      const tags = await Tag.findAll();
      const task = Task.build();
      ctx.render('tasks/new', { f: buildFormObj(task), users, statuses, tags }); // eslint-disable-line
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
      console.log(task);
      const tags = task.Tags.map(tag => tag.name).join(' ');
      console.log(await task.getTags());
      ctx.render('tasks/edit', { f: buildFormObj(task), users, statuses, tags }); // eslint-disable-line
    })
    .post('createTask', '/tasks', userAuth, async (ctx) => {
      const { form } = ctx.request.body;
      const { userId: creatorId } = ctx.session;
      const taskForm = { ...form, creatorId };
      const tags = await findOrCreateTags(form.tagsQuery);
      const task = Task.build(taskForm);
      try {
        await task.save();
        await task.setTags(tags);
        ctx.flash.set('Task has been created');
        logger('task created: %s', JSON.stringify(task));
        ctx.redirect(router.url('tasks'));
      } catch (err) {
        logger('task save error: %s', JSON.stringify(err));
        const users = await User.findAll();
        const statuses = await TaskStatus.findAll();
        ctx.render('tasks/new', { f: buildFormObj(task, err), users, statuses, tags }); // eslint-disable-line
      }
    })
    .patch('updateTask', '/tasks/:id', userAuth, async (ctx) => {
      const { id } = ctx.params;
      const { form: updatedTask } = ctx.request.body;
      const task = await Task.findByPk(id);
      const tags = await findOrCreateTags(updatedTask.tagsQuery);
      console.log(updatedTask.tagsQuery);
      console.log(tags);
      try {
        await task.update(updatedTask);
        await task.setTags(tags);
        logger('task updated with data: %s', task);
        ctx.flash.set('The task was updated');
        ctx.redirect(router.url('showTask', { id }));
      } catch (err) {
        logger('task update error: %s', JSON.stringify(err));
        const users = await User.findAll();
        const statuses = await TaskStatus.findAll();
        ctx.render('tasks/edit', { f: buildFormObj(task, err), users, statuses, tags }); // eslint-disable-line
      }
    })
    .delete('deleteTask', '/tasks/:id/delete', userAuth, async (ctx) => {
      const { id } = ctx.params;
      const task = await Task.findByPk(id);
      try {
        await task.destroy();
        ctx.flash.set('The task was deleted');
        ctx.redirect(router.url('tasks'));
      } catch (err) {
        ctx.flash.set('An error occured on deleting the task. Try again');
        ctx.redirect(router.url('root'));
      }
    });
};
