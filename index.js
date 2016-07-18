var fs = require('fs'),
    through2 = require('through2'),
    gutil = require('gulp-util'),
    HTMLHint = require('htmlhint').HTMLHint,
    PluginError = gutil.PluginError;

var  PLUGIN_NAME = 'gulp-htmlhint-inline';

var log = gutil.log,
    color = gutil.colors;

var escape = function(string) {
    'use strict';
    return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}

var removeTagEachLIne = function(lines, start, end) {
    'use strict';

    var tagSection = false;

    lines.forEach(function (line, i) {
        var startTag = escape(start),
            stopTag = escape(end),
            starts = new RegExp(startTag, 'i').test(line),
            stops = new RegExp(stopTag, 'i').test(line),
            inline = new RegExp(startTag + '.+?' + stopTag, 'ig');

        if(starts && (starts && stops)) {
          lines[i] = line.replace(inline, '');
        }
        else if(starts && !stops) {
          tagSection = true;
          lines[i] = '';
        }
        else if(stops) {
          if(tagSection) { lines[i] = ''; }
          tagSection = false;
        }

        if(tagSection) { lines[i] = ''; }
    });
}

var removeTags = function(source, ignores) {
    'use strict';

    var lines = source.split('\n');
    for (var key in ignores) {
        if (ignores.hasOwnProperty(key)) {
            removeTagEachLIne(lines, key, ignores[key]);
        }
    }
    return lines.join('\n');
}

var removePatterns = function (source, patterns) {
    'use strict';
    return patterns.reduce(function (content, pattern){
        return content.replace(pattern.match, pattern.replacement || '');
    }, source);
}

var removeStrings = function(file, ignores, patterns) {
    'use strict';

    var source = file.contents.toString();

    if(ignores && Object.keys(ignores).length !== 0) {
        source = removeTags(source, ignores);
    }

    if(patterns && Array.isArray(patterns)) {
        source = removePatterns(source, patterns);
    }

    return source;
}

var hint = function(file, options) {
    'use strict';

    var ignores, patterns, htmlhintrcRuleset;

    if(options.ignores) { ignores = options.ignores || {} }

    if(options.patterns) { patterns = options.patterns || []; }

    if (options.htmlhintrc && typeof options.htmlhintrc === 'string') {
        try {
            var htmlhintrc = fs.readFileSync(options.htmlhintrc);
            htmlhintrcRuleset = JSON.parse(htmlhintrc);
        } catch (err) {
            throw new Error( PLUGIN_NAME + ': Cannot parse .htmlhintrc' );
        }
    }

    var ruleset = HTMLHint.defaultRuleset,
        html = removeStrings(file, ignores, patterns);

    for(var rule in htmlhintrcRuleset) {
        ruleset[rule] = htmlhintrcRuleset[rule];
    }

    return HTMLHint.verify(html, ruleset);
}

var gulpHtmlhintInline = function(options) {
    'use strict';

    var transform = function(file, enc, callback) {
        if(file.isNull()) {
            this.psuh(file);
            return callback();
        }

        if (file.isStream()) {
            this.emit('error', new PluginError(PLUGIN_NAME, 'Streams are not supported!'));
            return callback(null, file);
        }

        if(file.isBuffer()) {
            file.htmlhint_inline = hint(file, options);
            return callback(null, file);
        }

        this.push(file);
        callback();
    }

    return through2.obj(transform);
}

gulpHtmlhintInline.defaultReporter = function(file) {
    'use strict';

    var report = file.htmlhint_inline;

        report.success = false;

    if(report.length === 0) { report.success = true; }

    if(report.success) { log(color.green(file.path + ' lint free.')); }

    if(!report.success) {
        log(color.cyan(report.length) + ' error' + (report.length === 1 ? '' : 's') + ' found');

        report.forEach(function(message) {
            var evidence = message.evidence,
                line = message.line,
                col = message.col,
                msg = '';

                if (col === 0) {
                    evidence = color.red('?') + evidence;
                } else if(col > evidence.length) {
                    evidence = evidence + color.red(' ');
                } else {
                    evidence = evidence.slice(0, col - 1) + color.red(evidence[col - 1]) + evidence.slice(col);
                }

                msg = color.red('[') + color.yellow('L ' + message.line) + color.red(':') + color.yellow('C' + message.col) + color.red(']') + ' ' + color.yellow(message.message);
                log(msg);
                log(evidence);
        });
    }
}

gulpHtmlhintInline.failReporter = function() {
    'use strict';

    var error = null,
        fails = false;

    var transform = function(file, encoding, callback) {
        (fails = fails || []).push(file.path);

        if(file.htmlhint_inline && file.htmlhint_inline.length !== 0) {
            error =  new PluginError(PLUGIN_NAME, {
                message: PLUGIN_NAME + ' failed for: ' + fails.join(', '),
                showStack: false
            });
        }

        callback(null, file);
    }

    var flush = function(callback) {
        callback(error);
    }

    return through2.obj(transform, flush);
}

gulpHtmlhintInline.reporter = function(customReporter) {
    'use strict';

    var reporter = gulpHtmlhintInline.defaultReporter,
         result = null;

    if(typeof customReporter === 'function') { reporter = customReporter; }

    if(typeof customReporter === 'object' && typeof customReporter.reporter === 'function') {
        reporter = customReporter.reporter;
    }

    if(customReporter === 'fail') { return gulpHtmlhintInline.failReporter(); }

    var stream = through2.obj(function(file, enc, callback) {
        if (file.htmlhint_inline) { reporter(file); }
        callback(null, file);
    });

    return stream;
}

if (exports && typeof exports === 'object') { module.exports = gulpHtmlhintInline; }
