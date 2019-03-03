export default async (ctx, next) => {
  if (!ctx.state.isSignedIn()) {
    ctx.flash.set('You must be very brave to do so. Please, log in and come back');
    ctx.redirect('/');
    return;
  }
  await next();
};
