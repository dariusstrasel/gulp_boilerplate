/**
 * Created by siruk on 2/9/2017.
 */

// browser-sync start --proxy http://127.0.0.1:8080/ --files "**/*.html,**/*.js,**/*.css"
// Gulp.js configuration

    // modules
    var gulp = require('gulp');
    var newer = require('gulp-newer');
    var imagemin = require('gulp-imagemin');
    var htmlclean = require('gulp-htmlclean');
    var concat = require('gulp-concat');
    var deporder = require('gulp-deporder');
    var stripdebug = require('gulp-strip-debug');
    var uglify = require('gulp-uglify');
    var sass = require('gulp-sass');
    var postcss = require('gulp-postcss');
    var assets = require('postcss-assets');
    var autoprefixer = require('autoprefixer');
    var mqpacker = require('css-mqpacker');

    // development mode?
    devBuild = (process.env.NODE_ENV !== 'production'),

    // folders
    folder = {
        src: 'src/',
        build: 'build/'
    };

// image processing
    gulp.task('images', function () {
        var out = folder.build + 'images/';
        return gulp.src(folder.src + 'images/**/*')
            .pipe(newer(out))
            .pipe(imagemin({ optimizationLevel: 5}))
            .pipe(gulp.dest(out));
    });

// HMTL processing
    gulp.task('html', ['images'], function () {
        var
            out = folder.build + 'html/',
            page = gulp.src(folder.src + 'html/**/*')
                .pipe(newer(out));
        if (!devBuild) {
            page = page.pipe(htmlclean());
        }

        return page.pipe(gulp.dest(out));
    });

// JavaScript processing
gulp.task('js', function () {

    var jsbuild = gulp.src(folder.src + 'js/**/*')
        .pipe(deporder())
        .pipe(concat('main.js'));

    if (!devBuild) {
        jsbuild = jsbuild
            .pipe(stripdebug())
            .pipe(uglify());
    }

    return jsbuild.pipe(gulp.dest(folder.build + 'js'));
});

// CSS processing
gulp.task('css', ['images'], function () {

    var postCssOpts = [
        assets({ loadPaths: ['images/'] }),
        autoprefixer({ browsers: ['last 2 versions', '> 2%'] }),
        mqpacker
    ];

    if (!devBuild) {
        postCssOpts.push(cssnano);
    }

    return gulp.src(folder.src + 'scss/main.scss')
        .pipe(sass({
            outputStyle: 'nested',
            imagePath: 'images/',
            precision: 3,
            errLogToConsole: true
        }))
        .pipe(postcss(postCssOpts))
        .pipe(gulp.dest(folder.build + 'css/'));

});

gulp.task('run', ['html', 'css', 'js']);

gulp.task('watch', function () {

    // image changes
    gulp.watch(folder.src + 'images/**/*', ['images']);

    // html changes
    gulp.watch(folder.src + 'html/**/*', ['html']);

    // javascript changes
    gulp.watch(folder.src + 'js/**/*', ['js']);

    // css changes
    gulp.watch(folder.src + 'scss/**/*', ['css']);

});

gulp.task('default', ['run', 'watch']);