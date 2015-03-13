'use strict';

var gulp = require('gulp'),
    jshint = require('gulp-jshint'),
    htmlhint_inline = require('./index.js');

gulp.task('lint', function () {
    return gulp.src('./*.js')
                .pipe(jshint())
                .pipe(jshint.reporter('default', { verbose: true }))
                .pipe(jshint.reporter('fail'));
});

gulp.task('test', ['lint'], function () {
    var options = {
        htmlhintrc: './.htmlhintrc',
        ignores: {
            '<?php': '?>'
        },
        patterns: [
            {
                match: /hoge/g,
                replacement: 'fuga'
            }
        ]
    };
    return gulp.src('test/*.phtml')
                .pipe(htmlhint_inline(options))
                .pipe(htmlhint_inline.reporter())
                .pipe(htmlhint_inline.reporter('fail'));
});
