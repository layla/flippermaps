'use strict';

var gulp = require('gulp')
  , sass = require('gulp-sass')
  , concat = require('gulp-concat')
  , replace = require('gulp-replace')
  , livereload = require('gulp-livereload');

module.exports = function() {
  console.log('Executing \'sass\' task for');

  gulp.src([
      './node_modules/leaflet/dist/leaflet.css',
      // './node_modules/leaflet.markercluster/dist/MarkerCluster.Default.css',
      './bower_components/sidebar-v2/css/leaflet-sidebar.css',
      './node_modules/font-awesome/css/font-awesome.css',
      './node_modules/leaflet.usermarker/src/leaflet.usermarker.css'
    ])
    .pipe(replace('url(img/bluedot.png);', 'url(../images/bluedot.png);'))
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
