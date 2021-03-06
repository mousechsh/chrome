var path = require('path');
var gulp = require('gulp');
var zip = require('gulp-zip');
var js = require('js-bundler');
var notifier = require('node-notifier');
var through = require('through2');
var pkg = require('./package.json');

var production = process.argv.indexOf('--production') !== -1;
var dest = './out';
var src = {
	js: './scripts/*.js',
	assets: ['./{icon,styles}/**', './*.{html,png}', './manifest.json', './third-party/advisor-media.js'],
	options: {base: './'}
};

function cleanup() {
	return through.obj(function(file, enc, next) {
		var str = file.contents.toString();
		if (str.indexOf(__dirname)) {
			file.contents = new Buffer(str.replace(__dirname, ''));
		}
		next(null, file);
	});
}

function np(lib) {
	return path.join(__dirname, 'node_modules', lib);
}

gulp.task('js', function() {
	return gulp.src(src.js, src.options)
		.pipe(js({
			standalone: true,
			sourceMap: !production,
			noParse: [np('livestyle-cssom-patcher/out/livestyle-cssom.js')],
			detectGlobals: false
		}))
		.pipe(cleanup())
		.pipe(gulp.dest(dest))
});

gulp.task('assets', function() {
	return gulp.src(src.assets, src.options)
	.pipe(through.obj(function(file, enc, next) {
		if (path.basename(file.path) === 'manifest.json') {
			var data = JSON.parse(file.contents.toString());
			data.version = pkg.version;
			file.contents = new Buffer(JSON.stringify(data), null, '\t');
		}
		next(null, file);
	}))
	.pipe(gulp.dest(dest));
});

gulp.task('pack', ['build'], function() {
	return gulp.src(['**', '!*.zip'], {cwd: dest})
		.pipe(zip('livestyle.zip'))
		.pipe(gulp.dest(dest));
});

gulp.task('watch', ['build'], function() {
	js.watch({sourceMap: true, uglify: false});
	gulp.watch('./scripts/**/*.js', ['js']);
	gulp.watch(src.assets, ['assets']);
});

gulp.task('build', ['js', 'assets']);
gulp.task('default', ['build']);
