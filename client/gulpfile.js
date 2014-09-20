var gulp = require('gulp');

gulp.task('browserify', require('./src/tasks/browserify'));
gulp.task('sass', require('./src/tasks/sass'));
gulp.task('watch', require('./src/tasks/watch'));

gulp.task('default', ['browserify', 'sass', 'watch']);
