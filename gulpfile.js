// system
const fs = require( "fs" );
const path = require( "path" );

// parameters
const config = JSON.parse(
    fs.readFileSync( path.join( process.cwd(), ".hugulprc" ) )
);

// common
const gulp = require( "gulp" );
const size = require( "gulp-size" );
const pump = require( "pump" );

// styles
const cleancss = require( "gulp-clean-css" );

// revision
const del = require( "del" );

const critical = require( "critical" ).stream;
// reference
const replace = require( "gulp-rev-replace" );

// minify html
const htmlmin = require( "gulp-htmlmin" );

gulp.task( "clean", function () {
    return del( [ config.build.target ] );
} );

gulp.task( "assets:img", function () {
    return gulp
        .src( path.join( config.watch.source, config.path.img, "**", "*.*" ) )
        .pipe( size( { title: "images: " } ) )
        .pipe( gulp.dest( path.join( config.watch.target, config.path.img ) ) );
} );

gulp.task( "assets:scripts", function () {
    return gulp
        .src( path.join( config.watch.source, config.path.scripts, "**", "*.js" ) )
        .pipe( size( { title: "scripts: " } ) )
        .pipe( gulp.dest( path.join( config.watch.target, config.path.scripts ) ) );
} );

gulp.task( "watch:img", function () {
    return gulp
        .watch( path.join( config.watch.source, config.path.img, "**", "*.*" ), gulp.parallel( "assets:img" ) );
} );

gulp.task( "watch:scripts", function () {
    return gulp
        .watch( path.join( config.watch.source, config.path.scripts, "**", "*.js" ), gulp.parallel( "assets:scripts" ) );
} );

gulp.task( "watch:styles", function () {
    return gulp
        .watch( [
            path.join( config.watch.source, config.path.styles, "**", "*.css" )
        ], gulp.parallel( "assets:styles" ) );
} );

gulp.task( "watch", gulp.parallel( "watch:scripts", "watch:styles", "watch:img" ) );

// .pipe(changed('staging/img'))
gulp.task( "images", function () {
    return gulp
        .src( [
            path.join( config.build.source, "**", "*.png" ),
            path.join( config.build.source, "**", "*.gif" ),
            path.join( config.build.source, "**", "*.jpg" ),
            path.join( config.build.source, "**", "*.jpeg" ),
            path.join( config.build.source, "**", "*.svg" ),
        ] )
        .pipe( gulp.dest( config.build.target ) ); // i.e.: public/images
} );

// default styles task
gulp.task( "styles", function ( cb ) {
    return gulp
        .src( path.join( config.build.source, "**", "*.css" ) )
        .pipe( size( { title: "styles before: " } ) )
        .pipe( cleancss() )
        .pipe( size( { title: "styles: " } ) )
        .pipe( gulp.dest( config.build.target ) );
} );

gulp.task( "scripts", function () {
    return gulp
        .src( path.join( config.build.source, "**", "*.js" ) )
        //.pipe( uglify() )
        .pipe( size( { title: "scripts: " } ) )
        .pipe( gulp.dest( config.build.target ) );
} );

gulp.task( "html", function ( cb ) {
    pump(
        [
            gulp.src( [
                path.join( config.build.source, "**", "*.html" ),
                path.join( config.build.source, "**", "*.xml" ),
                path.join( config.build.source, "**", "*.ttf" ),
                path.join( config.build.source, "**", "*.eot" ),
                path.join( config.build.source, "**", "*.woff2" ),
                path.join( config.build.source, "**", "*.woff" ),
                path.join( config.build.source, "**", "*.svg" ),
            ] ),
            size( { title: "html: " } ),
            gulp.dest( config.build.target )
        ],
        cb );
} );

gulp.task( "critical", function () {
    return gulp
        .src( [
            path.join( config.build.target, "**", "*.html" )
        ] )
        .pipe( critical( {
                base:       config.build.target,
                inline:     true,
                minify:     false,
                css:        [ path.join( config.build.target, "styles", "style.css" ) ],
                dimensions: [ {
                    height: 498,
                    width:  280
                } ],
                ignore:     [ "@font-face", "content", "font-family", "clearfix", "@import" ]
            } )
                .on( "error", console.log )
        )
        .pipe( size( { title: "html critical css: " } ) )
        .pipe( gulp.dest( config.build.target ) );
} );

gulp.task( "minify", function () {
    return gulp
        .src( path.join( config.build.target, "**", "*.html" ) )
        .pipe( htmlmin( {
            collapseWhitespace:          true,
            collapseInlineTagWhitespace: false,
            minifyCSS:                   true,
            minifyJS:                    true,
            removeComments:              true,
            removeEmptyAttributes:       false,
            removeEmptyElements:         false,
            removeRedundantAttributes:   true,
            useShortDoctype:             true
        } ) )
        .pipe( size( { title: "html minified: " } ) )
        .pipe( gulp.dest( config.build.target ) );
} );

const build = gulp.series( "clean", gulp.parallel( "images", "styles", "scripts", "html" ), "minify", "critical" );

gulp.task( "build", build );

gulp.task( "default", build );
