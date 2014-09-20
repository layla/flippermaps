'use strict';

var gulp = require('gulp'),
  browserify = require('browserify'),
  watchify = require('watchify'),
  source = require('vinyl-source-stream'),
  livereload = require('gulp-livereload');

module.exports = function() {
  console.log('Executing \'browserify\' task');

  var b = browserify({
    cache: {},
    packageCache: {},
    fullPaths: true,
    insertGlobals: false,
    debug: true
  });

  b = watchify(b);

  b.on('update', function() {
    bundleShare(b);
  });

  b.on('error', console.log);

  b.add('./src/index.js');
  bundleShare(b);

  function bundleShare(b) {
    b.bundle()
      .pipe(source('app.js'))
      .pipe(gulp.dest('./dist/js'))
      .pipe(livereload());
  }
};
