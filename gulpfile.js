const gulp = require('gulp');

gulp.task('build:icons', function (done) {
	// Copy icons from all nodes to dist/nodes, preserving directory structure
	gulp.src('nodes/**/*.svg')
		.pipe(gulp.dest('dist/nodes'));

	// Copy icons to credentials (flat, assume they are needed there too)
	gulp.src('nodes/**/*.svg')
		.pipe(gulp.dest('dist/credentials'));

	done();
});

