import buildFormObj from '../lib/formObjectBuilder';
import userAuth from '../lib/middlewares';
import { TaskStatus } from '../models';

export default (router) => {
  router
    .get('taskStatuses', '/taskStatuses', async (ctx) => {
      const taskStatuses = await TaskStatus.findAll();
      ctx.render('taskStatuses', { taskStatuses });
    })
    .get('newStatus', '/taskStatuses/new', userAuth, (ctx) => {
      const status = TaskStatus.build();
      ctx.render('taskStatuses/new', { f: buildFormObj(status) });
    })
    .get('statusSettings', '/taskStatuses/:id/settings', userAuth, async (ctx) => {
      const { id } = ctx.params;
      const status = await TaskStatus.findByPk(id);
      ctx.render('taskStatuses/settings', { f: buildFormObj(status) });
    })
    .post('createStatus', '/taskStatuses', userAuth, async (ctx) => {
      const { form } = ctx.request.body;
      const status = TaskStatus.build(form);
      try {
        await status.save();
        ctx.flash.set('Status has been created');
        ctx.redirect(router.url('taskStatuses'));
      } catch (err) {
        ctx.render('taskStatuses/new', { f: buildFormObj(status, err) });
      }
    })
    .patch('modifyStatus', '/taskStatuses/:id', userAuth, async (ctx) => {
      const { id } = ctx.params;
      const { form: updatedStatus } = ctx.request.body;
      const status = await TaskStatus.findByPk(id);
      try {
        await status.update({ ...updatedStatus });
        ctx.flash.set('Task Status was modified');
        ctx.redirect(router.url('taskStatuses'));
      } catch (err) {
        ctx.render('taskStatuses/settings', { f: buildFormObj(status, err) });
      }
    })
    .delete('deleteStatus', '/taskStatuses/:id/delete', userAuth, async (ctx) => {
      const { id } = ctx.params;
      const status = await TaskStatus.findByPk(id);
      try {
        await status.destroy();
        ctx.flash.set(`Task status ${status.name} was deleted`);
        ctx.redirect(router.url('taskStatuses'));
      } catch (err) {
        const taskStatuses = await TaskStatus.findAll();
        ctx.flash.set('An error occured on deleting task status. Try again');
        ctx.render('taskStatuses', { taskStatuses });
      }
    });
};
