import gulp from 'gulp';
// import gulpif from 'gulp-if';
import repl from 'repl';
import container from './server/container';
import getServer from './server';
// import getDevServer from 'src/server';
// import getServer from '/dist/server';

// gulp.task('default', console.log('hello!'));

gulp.task('console', () => {
  // gutil.log = gutil.noop;
  const replServer = repl.start({
    prompt: 'Application console > ',
  });

  Object.keys(container).forEach((key) => {
    replServer.context[key] = container[key];
  });
});

// const env = process.env.NODE_ENV;

gulp.task('server', (cb) => {
  getServer().listen(process.env.PORT || 4000, cb);
});
