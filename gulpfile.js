// generated on 2017-04-15 using generator-webapp 2.4.1
const gulp = require('gulp');
const gulpLoadPlugins = require('gulp-load-plugins');
const browserSync = require('browser-sync').create();
const del = require('del');
const runSequence = require('run-sequence');
const vinylPaths = require('vinyl-paths');

const $ = gulpLoadPlugins();
const reload = browserSync.reload;
const run = $.runCommand.default;

var dev = true;

gulp.task('styles', () => {
  return gulp.src(['app/*/*.css', 'app/**/*.css'])
    .pipe($.if(dev, $.sourcemaps.init()))
    .pipe($.autoprefixer({browsers: ['> 1%', 'last 2 versions', 'Firefox ESR']}))
    .pipe($.if(dev, $.sourcemaps.write()))
    .pipe(gulp.dest('.tmp'))
    .pipe(reload({stream: true}));
});

gulp.task('scripts', () => {
  return gulp.src(['app/*/*.js', 'app/**/*.js'])
    .pipe($.plumber())
    .pipe($.if(dev, $.sourcemaps.init()))
    .pipe($.babel())
    .pipe($.if(dev, $.sourcemaps.write('.')))
    .pipe(gulp.dest('.tmp'))
    .pipe(reload({stream: true}));
});

function lint(files) {
  return gulp.src(files)
    .pipe($.eslint({ fix: true }))
    .pipe(reload({stream: true, once: true}))
    .pipe($.eslint.format())
    .pipe($.if(!browserSync.active, $.eslint.failAfterError()));
}

gulp.task('lint', () => {
  return lint(['app/*/*.js', 'app/**/*.js'])
    .pipe(gulp.dest('app'));
});
gulp.task('lint:test', () => {
  return lint('test/spec/**/*.js')
    .pipe(gulp.dest('test/spec'));
});

gulp.task('html', ['styles', 'scripts'], () => {
  return gulp.src(['app/*.html', 'app/**.html'])
    .pipe($.useref({searchPath: ['.tmp', 'app', '.']}))
    .pipe($.if(/\.js$/, $.uglify({compress: {drop_console: true}})))
    .pipe($.if(/\.css$/, $.cssnano({safe: true, autoprefixer: false})))
    .pipe($.if(/\.html$/, $.htmlmin({
      collapseWhitespace: true,
      minifyCSS: true,
      minifyJS: {compress: {drop_console: true}},
      processConditionalComments: true,
      removeComments: true,
      removeEmptyAttributes: true,
      removeScriptTypeAttributes: true,
      removeStyleLinkTypeAttributes: true
    })))
    .pipe(gulp.dest('dist'));
});

gulp.task('extras', () => {
  return gulp.src([
    'app/*',
    'app/**',
    '!app/*.html'
  ], {
    dot: true
  }).pipe(gulp.dest('dist'));
});

gulp.task('gapps-rename', () => {
  return gulp.src('dist/**')
    .pipe($.gappsRename())
    .pipe(gulp.dest('dist'));
});

gulp.task('gapps-rename-cleanup', () => {
  return del([
    'dist/**.js',
    'dist/**/**.js',

    'dist/**.css',
    'dist/**/**.css',
  ]);
});

gulp.task('clean', del.bind(null, ['.tmp', 'dist']));

gulp.task('serve', () => {
  runSequence('clean', ['styles', 'scripts'], () => {
    browserSync.init({
      notify: false,
      port: 9000,
      server: {
        baseDir: ['.tmp', 'app'],
        routes: {
          '/bower_components': 'bower_components'
        }
      }
    });

    gulp.watch([
      'app/*.html',
    ]).on('change', reload);

    gulp.watch('app/**/*.css', ['styles']);
    gulp.watch('app/**/*.js', ['scripts']);
  });
});

gulp.task('serve:dist', ['default'], () => {
  browserSync.init({
    notify: false,
    port: 9000,
    server: {
      baseDir: ['dist']
    }
  });
});

gulp.task('serve:test', ['scripts'], () => {
  browserSync.init({
    notify: false,
    port: 9000,
    ui: false,
    server: {
      baseDir: 'test',
      routes: {
        '/': '.tmp/',
      }
    }
  });

  gulp.watch('app/**/*.js', ['scripts']);
  gulp.watch(['test/spec/**/*.js', 'test/index.html']).on('change', reload);
  gulp.watch('test/spec/**/*.js', ['lint:test']);
});

gulp.task('build', ['lint', 'html', 'extras'], () => {
  return gulp.src('dist/**/*').pipe($.size({title: 'build', gzip: true}));
});

gulp.task('build-gapps', () => {
  return new Promise(resolve => {
    dev = false;
    runSequence('clean', 'build', 'gapps-rename', 'gapps-rename-cleanup', resolve);
  });
});

gulp.task('upload-gapps', run('gapps upload'));

gulp.task('deploy-gapps', () => {
  return new Promise(resolve => {
    runSequence('build-gapps', 'upload-gapps', resolve);
  });
});

gulp.task('default', () => {
  return new Promise(resolve => {
    runSequence('deploy-gapps', resolve);
  });
});
