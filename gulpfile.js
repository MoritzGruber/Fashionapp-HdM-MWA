/* var gulp = require('gulp');
var gutil = require('gulp-util');
var bower = require('bower');
var concat = require('gulp-concat');
var sass = require('gulp-sass');
var minifyCss = require('gulp-minify-css');
var rename = require('gulp-rename');
var sh = require('shelljs');
var livereload = require('gulp-livereload');

var paths = {
 // sass: ['./scss/**///*.scss']
//};
/*
gulp.task('default', ['sass']);

gulp.task('sass', function(done) {
  gulp.src('./scss/ionic.app.scss')
    .pipe(sass())
    .on('error', sass.logError)
    .pipe(gulp.dest('./www/css/'))
    .pipe(minifyCss({
      keepSpecialComments: 0
    }))
    .pipe(rename({ extname: '.min.css' }))
    .pipe(gulp.dest('./www/css/'))
    .pipe(livereload())
    .on('end', done);
});

 /*

/*  livereload.listen({ start: true });
/* gulp.watch(paths.sass, ['sass']);

  // Watch any files in dist/, reload on change
  gulp.watch(['dist/**']).on('change', livereload.changed);

});
/*
gulp.task('install', ['git-check'], function() {
  return bower.commands.install()
    .on('log', function(data) {
      gutil.log('bower', gutil.colors.cyan(data.id), data.message);
    });
});

gulp.task('git-check', function(done) {
  if (!sh.which('git')) {
    console.log(
      '  ' + gutil.colors.red('Git is not installed.'),
      '\n  Git, the version control system, is required to download Ionic.',
      '\n  Download git here:', gutil.colors.cyan('http://git-scm.com/downloads') + '.',
      '\n  Once git is installed, run \'' + gutil.colors.cyan('gulp install') + '\' again.'
    );
    process.exit(1);
  }
  done();
});
*/

'use strict';

var gulp 		  	= require('gulp'),
  concat 		  	= require('gulp-concat'),
  sourcemaps 		= require('gulp-sourcemaps'),
  jshint			= require('gulp-jshint'),
  stylish			= require('jshint-stylish'),
  uglify 		 	= require('gulp-uglify'),
  ngAnnotate 		= require('gulp-ng-annotate'),
  bower 		  	= require('gulp-bower'),
  connect 	  	= require('gulp-connect'),
  minifyHTML 		= require('gulp-minify-html'),
  gulpif 		  	= require('gulp-if'),
  sass        	= require('gulp-sass'),
  notify 			= require('gulp-notify'),
  plumber			= require('gulp-plumber'),
  fileinclude 	= require('gulp-file-include'),
  uncss = require('gulp-uncss');


var debug = false;

var onError = function(err) {
  notify.onError({
    title:    "Gulp",
    subtitle: "Failure!",
    message:  "Error: <%= error.message %>",
    sound:    "Beep"
  })(err);

  this.emit('end');
};

gulp.task('bower', function() {
  return bower()
    .pipe(gulp.dest('./dist//lib'));
});


gulp.task('js', function () {
  gulp.src(['./www/js/*.js', './www/js/**/controller.js', './www/js/**/*.js'])
    .pipe(gulpif(debug, sourcemaps.init()))
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'))
    .pipe(plumber({errorHandler: onError}))
    .pipe(concat('app.js'))
    .pipe(ngAnnotate())
    .pipe(gulpif(!debug, uglify()))
    .pipe(gulpif(debug, sourcemaps.write()))
    .pipe(gulp.dest('./dist/js/'))
    .pipe(connect.reload());
});


gulp.task('html', function () {
  var opts = {
    empty: true,
    spare: true
  };

  gulp.src(['./www/**/*.html', './www/*.html'])
    .pipe(fileinclude({
      prefix: '@@',
      basepath: '@file'
    }))
    .pipe(gulpif(!debug, minifyHTML(opts)))
    .pipe(gulp.dest('./dist/'))
    .pipe(connect.reload());
});
gulp.task('pdf', function () {
  gulp.src(['./www/**/*.pdf', './www/*.pdf'])
    .pipe(gulp.dest('./dist/'));
});

gulp.task('ico', function () {
  gulp.src(['./www/*.ico'])
    .pipe(gulp.dest('./dist/'));
});

gulp.task('sass', function () {
  var opts = {
    outputStyle: "compressed"
  };

  var debugOpts = {
    outputStyle: "expanded"
  };

  gulp.src('./www/scss/**/*.scss')
    .pipe(plumber({errorHandler: onError}))
    .pipe(sass())
    .pipe(uncss({html: ['./www/index.html', './www/**/*.html', 'http://fittshot.com']}))
    .on('error', sass.logError)
    .pipe(gulpif(debug, sass(debugOpts).on('error', sass.logError)))
    .pipe(gulpif(!debug, sass(opts).on('error', sass.logError)))
    .pipe(concat('style.css'))
    .pipe(gulp.dest('./dist/css'))
    .pipe(connect.reload());

});



gulp.task('img', function () {
  gulp.src(['./www/img/**', '!./src/assets/sass{,/**}'])
    .pipe(gulp.dest('./dist/img'))
    .pipe(connect.reload());
});


gulp.task('watch', ['js', 'sass', 'html', 'img'], function () {
  gulp.watch(['./www/*.js', './www/**/*.js'], ['js']);
  gulp.watch(['./www/**/*.scss', './www/*.scss', './www/**/*.css', './www/**/*.scss'], ['sass']);
  gulp.watch(['./www/*.html', './www/**/*.html'], ['html']);
  gulp.watch(['./www/img/**'], ['img']);
});


gulp.task('connect', function() {
  connect.server({
    root: './dist',
    livereload: true,
    port: 8888
  });
});

gulp.task('setdebug', function() {
  debug = true;
});

gulp.task('debug', ['setdebug', 'default'], function() {

});

gulp.task('build', ['bower', 'pdf', 'js', 'ico', 'sass', 'html', 'img'], function() {

});

gulp.task('default', ['build', 'connect', 'watch'], function() {

});
