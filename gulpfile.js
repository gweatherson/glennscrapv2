var gulp        = require('gulp');
var browserSync = require('browser-sync');
var sass        = require('gulp-sass');
var prefix      = require('gulp-autoprefixer');
var cp          = require('child_process');
var responsive  = require('gulp-responsive');
var $           = require('gulp-load-plugins')();
var newer       = require('gulp-newer');
var jekyll   = process.platform === 'win32' ? 'jekyll.bat' : 'jekyll';
var messages = {
    jekyllBuild: '<span style="color: grey">Running:</span> $ jekyll build'
};

/**
 * Build the Jekyll Site
 */
gulp.task('jekyll-build', function (done) {
    browserSync.notify(messages.jekyllBuild);
    return cp.spawn( jekyll , ['build'], {stdio: 'inherit'})
        .on('close', done);
});

/**
 * Rebuild Jekyll & do page reload
 */
gulp.task('jekyll-rebuild', ['jekyll-build'], function () {
    browserSync.reload();
});

/**
 * Wait for jekyll-build, then launch the Server
 */
gulp.task('browser-sync', ['sass', 'jekyll-build'], function() {
    browserSync({
        server: {
            baseDir: '_site'
        }
    });
});

/**
 * Compile files from _scss into both _site/css (for live injecting) and site (for future jekyll builds)
 */
gulp.task('sass', function () {
    return gulp.src('_sass/glennscrap.scss')
        .pipe(sass({
            includePaths: ['scss'],
            onError: browserSync.notify
        }))
        .pipe(prefix(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true }))
        .pipe(gulp.dest('_site/css'))
        .pipe(browserSync.reload({stream:true}))
        .pipe(gulp.dest('css'));
});

/**
 * Watch scss files for changes & recompile
 * Watch html/md files, run jekyll & reload BrowserSync
 */
gulp.task('watch', function () {
    gulp.watch(['_sass/*.scss', '_sass/**/*.scss', '*.html', '_layouts/*.html', '_posts/*'], ['jekyll-rebuild']);
});

gulp.task('images', function() {
  return gulp.src('assets/posts/*/*.jpg')
    .pipe(responsive({
      '**/*.*': [{
        width: 1600,
        format: 'jpg',
        rename: {
          suffix: '-large'
        }
        }, {
          width: 1024,
          format: 'jpg',
          rename: {
            suffix: '-small'
          }
        },
        {
          quality: 100,
          withMetadata: true,
          errorOnUnusedConfig: false,
          withoutEnlargement: true,
          skipOnEnlargement: false,
          errorOnEnlargement: false
        }
      ]
    }))
  .pipe(gulp.dest('assets/posts/edited/.'));
});

gulp.task('default', ['browser-sync', 'sass', 'watch']);