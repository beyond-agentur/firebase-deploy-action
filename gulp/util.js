// system
const fs = require('fs');
const path = require('path');

// common
const gulp = require('gulp');

// styles
const concat = require('gulp-concat');

// parameters
const config = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), '.hugulprc'))
)

// helper functions
function getStylesStreams() {
    const scssStream = gulp
        .src(path.join(config.build.source, config.path.styles, 'style.css')) // i.e.: assets/styles/**/*.s[a|c]ss
        .pipe(concat('scss-files.css'));

    return [scssStream]
}

module.exports = { getStylesStreams };
