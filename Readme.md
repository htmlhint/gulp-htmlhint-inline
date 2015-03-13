gulp-htmlhint-inline
================

[![NPM](https://nodei.co/npm/gulp-htmlhint-inline.png)](https://nodei.co/npm/gulp-htmlhint-inline/)

## Usage

First, install `gulp-htmlhint-inline` as a development dependency:

```shell
npm install --save-dev gulp-htmlhint-inline
```

Then, add it to your `gulpfile.js`:

```javascript
var gulp = require('gulp'),
    htmlhint_inline = require('gulp-htmlhint-inline');

gulp.task('htmlhint', function () {
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

  gulp.src('test/*.phtml')
      .pipe(htmlhint_inline(options))
      .pipe(htmlhint_inline.reporter())
      .pipe(htmlhint_inline.reporter('fail'));
});
```

## Options

#### htmlhintrc
Type: String Default value: null

```htmlhintrc``` file must be a valid JSON.
If you specify this file, options that have been defined in it will be used in the global.
If there is specified in the task options, the options in this file will be overwritten.

```json
{
  "tagname-lowercase": true
}
```

#### ignores
Type: Object Default: {}

Remove program tag pairs.

#### patterns
Type: Array Default: []

Enable the replacement by the pattern

##### patterns.match

Type: RegExp|String

Indicates the matching expression.

##### patterns.replacement

Type: String | Function

#### reporter

##### Default Reporter

```js
var gulp = require('gulp'),
    htmlhint_inline = require('gulp-htmlhint-inline');

gulp.task('htmlhint', function () {
  var options = {
        htmlhintrc: './.htmlhintrc',
        ignores: {
          '<?php': '?>'
        }
    };

  gulp.src('test/*.phtml')
      .pipe(htmlhint_inline(options))
      .pipe(htmlhint_inline.reporter());
});
```

##### Fail Reporter

In order to end the task when your task happened error of HTMLHint, please use this reporter.

```js
var gulp = require('gulp'),
    htmlhint_inline = require('gulp-htmlhint-inline');

gulp.task('htmlhint', function () {
  var options = {
        htmlhintrc: './.htmlhintrc',
        ignores: {
          '<?php': '?>'
        }
    };

  gulp.src('test/*.phtml')
      .pipe(htmlhint_inline(options))
      .pipe(htmlhint_inline.reporter('fail'));
});
```

##### Custom Reporter

You can also use the custom reporter that you have created.

```js

var gulp = require('gulp'),
    htmlhint_inline = require('gulp-htmlhint-inline');

gulp.task('htmlhint', function () {
  var options = {
        htmlhintrc: './.htmlhintrc',
        ignores: {
          '<?php': '?>'
        }
    };

    var cutomReporter = function (file) {
        if (!file.htmlhint_inline.success) {
            console.log('custom reporter: htmlhint-inline fail in '+ file.path);
        }
    }

    return gulp.src('test/*.phtml')
                .pipe(htmlhint_inline(options))
                .pipe(htmlhint_inline.reporter())
                .pipe(htmlhint_inline.reporter(cutomReporter));
});

```

## License

[MIT License](http://en.wikipedia.org/wiki/MIT_License)

[npm-url]: https://npmjs.org/package/gulp-htmlhint-inline
[npm-image]: https://badge.fury.io/js/gulp-htmlhint-inline.png
