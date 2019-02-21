import buildFormObj from '../lib/formObjectBuilder';
import { User, Task, TaskStatus, Tag } from '../models';
import { getFilteredTasks, buildFilter, findOrCreateTags } from '../lib/util';

export default (router) => {
  router
    .get('tasks', '/tasks', async (ctx) => {
      const { query } = ctx.request;
      console.log(query);
      const filter = buildFilter(query);
      const tasks = await getFilteredTasks(filter);
      console.log(JSON.stringify(tasks));
      ctx.render('tasks', { tasks });
    })
    .get('newTask', '/tasks/new', async (ctx) => {
      const users = await User.findAll();
      const statuses = await TaskStatus.findAll();
      const tags = await Tag.findAll();
      const task = Task.build();
      ctx.render('tasks/new', { f: buildFormObj(task), users, statuses, tags }); // eslint-disable-line
    })
    .get('showTask', '/tasks/:id', async (ctx) => {
      const { id } = ctx.params;
      const task = await Task.findByPk(id);
      ctx.render('tasks/show', { task });
    })
    .get('taskSettings', '/tasks/:id/settings', async (ctx) => {
      const { id } = ctx.params;
      const task = await Task.findByPk(id);
      const users = await User.findAll();
      const statuses = await TaskStatus.findAll();
      const tags = await Tag.findAll();
      ctx.render('tasks/edit', { f: buildFormObj(task), users, statuses, tags }); // eslint-disable-line
    })
    .post('createTask', '/tasks', async (ctx) => {
      const { form } = ctx.request.body;
      const tags = await findOrCreateTags(form.tags);
      const task = Task.build(form);
      try {
        await task.save();
        await task.setTags(tags);
        ctx.flash.set('Task has been created');
        ctx.redirect(router.url('root'));
      } catch (err) {
        const users = await User.findAll();
        const statuses = await TaskStatus.findAll();
        ctx.render('tasks/new', { f: buildFormObj(task, err), users, statuses, tags }); // eslint-disable-line
      }
    })
    .patch('updateTask', '/tasks/:id', async (ctx) => {
      const { id } = ctx.params;
      const { form: updatedtask } = ctx.request.body;
      const task = await Task.findByPk(id);
      const tags = await findOrCreateTags(updatedtask.tags);
      try {
        await task.update({ ...updatedtask });
        await task.setTags(tags);
        ctx.flash.set('The task was updated');
        ctx.redirect(`/tasks/${id}`);
      } catch (err) {
        const users = await User.findAll();
        const statuses = await TaskStatus.findAll();
        ctx.render('tasks/edit', { f: buildFormObj(task, err), users, statuses, tags }); // eslint-disable-line
      }
    })
    .delete('deleteTask', '/tasks/:id/delete', async (ctx) => {
      const { id } = ctx.params;
      const task = await Task.findByPk(id);
      try {
        await task.destroy();
        ctx.flash.set('The task was deleted');
        ctx.redirect(router.url('root'));
      } catch (err) {
        ctx.flash.set('An error occured on deleting the task. Try again');
        ctx.redirect(router.url('root'));
      }
    });
};
