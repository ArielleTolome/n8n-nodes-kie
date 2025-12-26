const gulp = require('gulp');

gulp.task('build:icons', function (done) {
	// Copy icons flat to dist/nodes/Seedream
	gulp.src('nodes/Seedream/*.svg')
		.pipe(gulp.dest('dist/nodes/Seedream'));

	// Copy icons flat to dist/credentials
	gulp.src('nodes/Seedream/*.svg')
		.pipe(gulp.dest('dist/credentials'));

	done();
});

