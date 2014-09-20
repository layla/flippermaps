'use strict';

var gulp = require('gulp');

module.exports = function() {
  gulp.watch('src/*', ['browserify']);
  gulp.watch('assets/stylesheets/*', ['sass']);
};
