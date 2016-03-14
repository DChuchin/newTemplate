/*------------ plugins -----------------*/
var
	gulp         = require('gulp'),
	jade         = require('gulp-jade'),
	sass         = require('gulp-sass'),
	sourcemaps   = require('gulp-sourcemaps'),
	del          = require('del'),
	autoprefixer = require('gulp-autoprefixer'),
	runSequence  = require('run-sequence'),
	browserSync  = require('browser-sync').create(),
	plumber      = require('gulp-plumber'),
	imageMin     = require('gulp-imagemin'),
	spritesmith  = require('gulp.spritesmith'),
	rename       = require('gulp-rename'),
	uglify       = require('gulp-uglify'),
	pngquant     = require('imagemin-pngquant'),
	concat       = require('gulp-concat');

/*---------------- paths ----------------------*/

var
	paths = {
		jade : {
			locations   : '- src/jade/**/*.jade',
			compiled    : '- src/jade/pages/*.jade',
			destination : 'dist'
		},

		scss : {
			locations   : '- src/styles/**/*.scss',
			compiled    : '- src/styles/main.scss',
			destination : 'dist/css'
		},

		js : {
			locations   : '-src/scripts/main.js',
			plugins     : '-src/scripts/_plugins/*.js',
			destination : 'dist/js'
		},

		img : {
			locations   : '- src/img/**/*.jpg',
			sprite      : '- src/img/**/*.png',
			destination : 'dist/img/'
		},

		browserSync : {
			baseDir   : 'dist/',
			watchPaths : ['dist/*.html', 'dist/css/*.css', 'dist/js/*.js' ]
		},

		build : 'dist/*'
	};

/*---------------- jade ------------------------*/

gulp.task('jade', function() {
	gulp.src(paths.jade.compiled)
		.pipe(plumber())
		.pipe(jade({
			pretty: '\t',
		}))
		.pipe(gulp.dest(paths.jade.destination));
});

/*-------------- sass -------------------*/

gulp.task('sass', function() {
	gulp.src(paths.scss.compiled)
		.pipe(sourcemaps.init())
		.pipe(plumber())
		.pipe(sass().on('error', sass.logError))
		.pipe(autoprefixer({
			browsers : [ '> 1%', 'last 2 versions', 'ie >=9']
		}))
		.pipe(concat('main.css'))
		.pipe(sourcemaps.write())
		.pipe(gulp.dest(paths.scss.destination))
});

/*---------- browser-sync -----------*/

gulp.task('sync', function () {
	browserSync.init({
		server: {
			baseDir: paths.browserSync.baseDir
		}
	});
});

/*-------------- plugins ------------------*/
gulp.task('plugins', function() {
	gulp.src(paths.js.plugins)
		.pipe(plumber())
		.pipe(concat('plugins.min.js'))
		.pipe(uglify())
		.pipe(gulp.dest(paths.js.destination))
});

/*---------------- scripts -----------*/

gulp.task('scripts', function() {
	gulp.src(paths.js.locations)
		.pipe(sourcemaps.init())
		.pipe(plumber())
		.pipe(uglify())
		.pipe(rename('main.min.js'))
		.pipe(sourcemaps.write())
		.pipe(gulp.dest(paths.js.destination))
});

/*------------ images -----------------*/

gulp.task('img-min', function() {
	gulp.src(paths.img.locations)
		.pipe(imageMin())
		.pipe(gulp.dest(paths.img.destination))
	});

gulp.task('sprite', function() {
	gulp.src(paths.img.sprite)
		.pipe(spritesmith({
			imgName : 'sprite.png',
			cssName : 'sprite.scss',
			padding : 70,
			algorithm: 'top-down',
			use:[pngquant({quality: '65-80'})]
			}))
		.pipe(gulp.dest(paths.img.destination));
	});
/*---------------- clean ------------*/

gulp.task('clean', function () {
	del(paths.build);
});

/*--------------- build -----------*/

gulp.task('buld', function() {
	runSequence('clean', ['jade','sass','scripts', 'plugins', 'img-min', 'sprite']);
});

/*-------------- watch ---------------*/

gulp.task('watch', function() {
	gulp.watch(paths.jade.locations, ['jade']);
	gulp.watch(paths.scss.locations, ['sass']);
	gulp.watch(paths.js.locations, ['scripts']);
	gulp.watch(paths.img.sprite, ['img']);
	gulp.watch(paths.img.locations, ['img']);
	gulp.watch(paths.browserSync.watchPaths).on('change', browserSync.reload);
});

/*------------------ default ------------*/

gulp.task('default', ['buld', 'sync', 'watch']); 