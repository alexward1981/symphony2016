var gulp = require('gulp');
    browserSync = require('browser-sync'),
    concat     = require('gulp-concat'),
    imagemin   = require('gulp-imagemin'),
    pngquant = require('imagemin-pngquant'),
    plumber    = require('gulp-plumber'),
    jshint     = require('gulp-jshint'),
    notify     = require('gulp-notify'),
    autoprefixer = require('autoprefixer-stylus'),
    minifycss = require('gulp-minify-css'),
    rename = require('gulp-rename'),
    jsonlint = require('gulp-json-lint'),
    del = require('del'),
    stylus = require('gulp-stylus'),
    jeet = require("jeet"),
    rupture = require("rupture"),
    cmq = require('gulp-combine-media-queries');


var reload     = browserSync.reload;

// watch files for changes and reload
gulp.task('serve', function() {
    browserSync({
        proxy: "lxword.localhost"
    });
    // Perform the site init
    gulp.start('styles', 'scripts');

    // Compile Stylus
    gulp.watch('src/styles/**/*.styl', ['styles']);

    // Compile Standard JS
    gulp.watch('src/scripts/*.js', ['scripts']);

    gulp.watch('*.php', { cwd: 'dist/wp-content/themes/clarity' }, reload);
});

// Combine styles
gulp.task('styles', function() {
    gulp.src('src/styles/core.styl')
        .pipe(stylus({use: [jeet(), rupture(), autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4')]}))
        .pipe(plumber())
        .pipe(concat('style.css'))
        .pipe(gulp.dest('dist/wp-content/themes/clarity'))
        .pipe(reload({stream:true}))
        .pipe(notify({ message: 'Styles task complete' }));
});

// Combine JS
gulp.task('scripts', function() {
    return gulp.src('src/scripts/*.js')
        .pipe(plumber())
        .pipe(jshint('.jshintrc'))
        .pipe(jshint.reporter('default'))
        .pipe(concat('core.min.js'))
        .pipe(gulp.dest('dist/wp-content/themes/clarity/scripts'))
        .pipe(reload({stream:true}))
        .pipe(notify({ message: 'Scripts task complete' }));
});

// combine media queries (Not done by default, should be called before deployment to production)
gulp.task('cmq', function () {
    gulp.src('dist/wp-content/themes/clarity/*.css')
        .pipe(cmq({
            log: true
        }))
        .pipe(gulp.dest('dist/wp-content/themes/clarity'));
});

// Some extra things should happen before the site is deployed.
// this task performs those subtasks.
gulp.task('deploy', function () {
    gulp.start('styles', 'scripts','images', 'cmq');
});

var jsonLinter = function (lint, file) {
    console.log(file.path + ': ' + lint.error);
};

// Compress and minify images to reduce their file size
gulp.task('images', function() {
    var imgSrc = 'src/images/**/*',
        imgDst = 'dist/wp-content/themes/clarity/images';

    return gulp.src(imgSrc)
        .pipe(plumber())
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()]
        }))
        .pipe(gulp.dest(imgDst))
        .pipe(notify({ message: 'Images task complete' }));
});

gulp.task('clean', function(cb) {
    del(['dist/wp-content/themes/clarity/images', 'dist/wp-content/themes/clarity/scripts'], cb)
});