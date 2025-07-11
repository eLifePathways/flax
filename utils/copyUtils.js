const path = require("path")

// #region helpers -------------------------------------------------
const getUniqueName = inputPath => {
    const dir = path.dirname(inputPath);
    const ext = path.extname(inputPath);
    const filename = path.basename(inputPath, ext);
    const uniqueId = Date.now();
    const newFilename = `${filename}_${uniqueId}${ext}`;

    return path.join(dir, newFilename);
};
// #endregion helpers ----------------------------------------------

// #region constants -----------------------------------------------
// IDEA: Go further and centralize here all paths. this way it will be easier to change 'em (in case we need to)
const PATHS = {
    GLOB: {
        IMAGES: "src/**/*.+(jpg|jpeg|png|gif|svg)",
        JAVASCRIPT: "src/**/*.js",
        FONTS: "src/**/*.+(woff|woff2|ttf|otf)",
        CSS_PUBLIC: "public/**/*.css",
        CSS_STATIC: "static/**/*.css",
    },
    SRC: {
        BASE: "/app/src/",
        STATIC: "static/",
        ASSETS: "assets/",
    },
    DEST: {
        IMAGES: "assets/images/",
        JAVASCRIPT: "assets/js/",
        FONTS: "assets/fonts/",
    },
};
/**
 * Util to pass prebuilt 'copyOptions' for the recursive-copy library used by 11ty (Added in v2.0.0).
 * 
 * @see [11ty Documentation](https://www.11ty.dev/docs/copy/#change-the-output-directory)
 * @see [recursive-copy Documentation](https://www.npmjs.com/package/recursive-copy#arguments)
 */
const COPY_OPTIONS = {
	expandSymLinks: { expand: true },
	overwriteFile: { overwrite: true },
	expandAndOverwrite: { expand: true, overwrite: true }, // not used yet
    uniqueName: { rename: getUniqueName } // as an alternative to overwriteFile (not used yet)
}
// #endregion constants --------------------------------------------

module.exports = {
    COPY_OPTIONS,
    PATHS,
}