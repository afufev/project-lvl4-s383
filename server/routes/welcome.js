export default (router) => {
  router.get('root', '/', (ctx) => {
    ctx.redirect(router.url('tasks'));
    // ctx.render('welcome/index');
  });
};
