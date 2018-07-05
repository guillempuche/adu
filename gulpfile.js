/*
    Create the sourcemap file to allow VSCode to debug all server files.
*/

const gulp = require("gulp");
const sourcemaps = require("gulp-sourcemaps");
const babel = require("gulp-babel");
const concat = require("gulp-concat");

gulp.task("vscode-sourcemap", () =>
    // src: where we put the name of the file we want to work with and use as an input
    // pipe: will take output of the previous command as pipe it as an input for the next
    // dest: writes the output of previous commands to the folder we specify
    // All plugins between sourcemaps.init() and sourcemaps.write() need to have support for gulp-sourcemaps
    gulp
        .src("src/**/*.js") // Globbing https://css-tricks.com/gulp-for-beginners/#article-header-id-7
        // /**/* ensures that files in sub-folders are also processed.
        .pipe(sourcemaps.init())
        .pipe(
            babel({
                presets: ["env"]
            })
        )
        .pipe(concat("all.js"))
        .pipe(sourcemaps.write("."))
        .pipe(gulp.dest("dev/vscode"))
);
