var gulp = require('gulp');
var browserSync = require('browser-sync');
var watch = require("gulp-watch");

var paths = {
  html:['*.html'],
  css:['css/*.css'],
  script:['js/*.js']
};

gulp.task("watcher", function() {
    browserSync.init({
      server: {
          baseDir: "./"
      }
    });
    gulp.watch(paths.script).on("change", browserSync.reload);
    gulp.watch(paths.css).on("change", browserSync.reload);
    gulp.watch(paths.html).on("change", browserSync.reload);
});

gulp.task('default', ['watcher']);
