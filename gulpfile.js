var gulp         = require('gulp');
var browserSync  = require('browser-sync');
var scss         = require('gulp-sass');
var prefix       = require('gulp-autoprefixer');
var pug          = require('gulp-pug');
var coffeescript = require('gulp-coffee');


gulp.task('browser-sync', function() {
    browserSync({
        server: {
            baseDir: 'site'
        }
    });
});

gulp.task('reload-browser', function () {
    browserSync.reload();
});

gulp.task('vendorJS', function() {
    return gulp.src([
        'node_modules/angular/angular.js',
        'node_modules/angular-route/angular-route.js',
        'node_modules/angular-resource/angular-resource.js',
        'node_modules/foundation-sites/dist/js/foundation.min.js',
        'node_modules/jquery/dist/jquery.min.js'
    ]).pipe(gulp.dest('site/vendor_js'));
});

gulp.task('vendorCSS', function() {
    return gulp.src([
        'node_modules/foundation-sites/dist/css/foundation.min.css',
        'node_modules/foundation-sites/dist/css/foundation-float.min.css',
        'node_modules/foundation-sites/dist/css/foundation-prototype.min.css',
    ]).pipe(gulp.dest('site/vendor_css'));
});

gulp.task('pugcompile', function() {
    return gulp.src('_pug/*.pug')
        .pipe(pug({
            pretty: true,
            includePaths: ['_pug'],
            onError: browserSync.notify
        }))
        .pipe(gulp.dest('site'))
});

gulp.task('coffeeCompile', function() {
    return gulp.src('_coffee/app.coffee')
    //.pipe(concat('main.coffee'))
        .pipe(coffeescript({bare: true}))
        .pipe(gulp.dest('site'));
});

gulp.task('scss', function () {
    return gulp.src('_scss/main.scss')
        .pipe(scss({

            includePaths: ['scss'],
            onError: browserSync.notify
        }))
        .pipe(prefix(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true }))
        .pipe(gulp.dest('site'))
});

gulp.task('watch', function () {
    gulp.watch('_scss/**/*.scss', ['scss']);
    gulp.watch('_coffee/*.coffee', ['coffeeCompile']);
    gulp.watch('_pug/**/*.pug', ['pugcompile']);
    gulp.watch('_coffee/*.js', ['coffeeCompile']);
    gulp.watch('_pug/**/*.html', ['pugcompile']);
    gulp.watch(['site/*'], ['reload-browser']);
});



gulp.task('default', ['browser-sync', 'scss', 'vendorCSS', 'vendorJS', 'coffeeCompile','pugcompile', 'watch']);
