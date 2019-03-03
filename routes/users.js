import buildFormObj from '../lib/formObjectBuilder';
import { encrypt } from '../lib/secure';
import { User } from '../models';
import userAuth from '../lib/middlewares';
import { sanitizeQuery } from '../lib/util';
import getPaginationObject from '../lib/pagination';

export default (router) => {
  router
    .get('users', '/users', async (ctx) => {
      const { query = {} } = ctx.request;
      const { offset } = sanitizeQuery(query);
      const { rows: users, count } = await User.findAndCountAll({ offset, limit: 10 });
      const paginationObject = getPaginationObject({ offset }, count);
      ctx.render('users', { users, paginationObject });
    })
    .get('newUser', '/users/new', (ctx) => {
      const user = User.build();
      ctx.render('users/new', { f: buildFormObj(user) });
    })
    .get('userProfile', '/account/profile/edit', userAuth, async (ctx) => {
      const { userId: id } = ctx.session;
      const user = await User.findByPk(id);
      ctx.render('users/profile', { f: buildFormObj(user) });
    })
    .get('userSettings', '/account/settings/edit', userAuth, (ctx) => {
      ctx.render('users/account', { f: buildFormObj({}) });
    })
    .get('showUser', '/users/:id', async (ctx) => {
      const { id } = ctx.params;
      const user = await User.findByPk(id);
      ctx.render('users/show', { user });
    })
    .post('createUser', '/users', async (ctx) => {
      const { form } = ctx.request.body;
      const user = User.build(form);
      try {
        await user.save();
        ctx.flash.set('User has been created');
        ctx.session.userId = user.id;
        console.log(user);
        ctx.redirect(router.url('root'));
      } catch (err) {
        console.log(err);
        ctx.render('users/new', { f: buildFormObj(user, err) });
      }
    })
    .patch('updateUserProfile', '/account/profile', async (ctx) => {
      const { form: updatedUser } = ctx.request.body;
      const { userId: id } = ctx.session;
      const user = await User.findByPk(id);
      try {
        await user.update({ ...updatedUser });
        ctx.flash.set('Your profile was updated');
        ctx.redirect(router.url('userProfile'));
      } catch (err) {
        ctx.render('users/profile', { f: buildFormObj(user, err) });
      }
    })
    .patch('changePassword', '/account/settings/change_password', async (ctx) => {
      const { currentPassword, newPassword, confirmPassword } = ctx.request.body.form;
      const { userId: id } = ctx.session;
      const user = await User.findByPk(id);
      const errorCheckings = [
        {
          check: () => !(user && user.passwordDigest === encrypt(currentPassword)),
          message: 'Wrong password',
          path: 'currentPassword',
        },
        {
          check: () => (newPassword !== confirmPassword),
          message: 'Passwords don\'t concur',
          path: 'newPassword',
        },
      ];
      const errors = errorCheckings
        .map(el => (el.check() ? { ...el } : ''))
        .filter(el => el);
      if (errors.length === 0) {
        await user.update({ password: newPassword });
        ctx.flash.set('Your password was updated');
        ctx.redirect(router.url('userProfile'));
        return;
      }
      ctx.render('users/account', { f: buildFormObj({}, { errors }) });
    })
    .delete('deleteUser', '/account/settings/delete', async (ctx) => {
      const { userId: id } = ctx.session;
      const user = await User.findByPk(id);
      await user.destroy();
      ctx.flash.set('Your profile was deleted. Good bye!');
      ctx.session = {};
      ctx.redirect(router.url('root'));
    });
};
