'use strict';

var gulp = require('gulp')
  , sass = require('gulp-sass')
  , concat = require('gulp-concat')
  , livereload = require('gulp-livereload');

module.exports = function() {
  console.log('Executing \'sass\' task for');

  gulp.src('./node_modules/leaflet/dist/leaflet.css')
    .pipe(concat('plugins.css'))
    .pipe(gulp.dest('./dist/css'));

  gulp.src('./assets/stylesheets/style.scss')
    .pipe(sass({
      includePaths: [
        './node_modules/'
      ]
    }))
    .pipe(concat('style.css'))
    .pipe(gulp.dest('./dist/css'))
    .pipe(livereload());
};
