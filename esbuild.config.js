import fs from "node:fs";
import * as esbuild from "esbuild";

const pkg = JSON.parse(fs.readFileSync("./package.json", "utf8"));

function camelize(str) {
  return str.replace(/[_.-](\w|$)/g, function (_, x) {
    return x.toUpperCase();
  });
}

const ENTRY_POINTS = ["index.js"];
const MODULE_NAME = pkg.name.replace(/\W/g, "-").replace(/-?js$/, "");
// const MODULE_VERSION = pkg.version;
const GLOBAL_NAME = camelize(MODULE_NAME); // For IIFE

pkg.main = `./dist/${MODULE_NAME}.min.mjs`;
pkg.exports = {
  ".": {
    "import": `./dist/${MODULE_NAME}.min.cjs`,
    "require": `./dist/${MODULE_NAME}.min.mjs`,
  }
};

const ESM = [
  {
    entryPoints: ENTRY_POINTS,
    bundle: true,
    minify: false,
    platform: "node",
    format: "esm",
    outfile: `dist/${MODULE_NAME}.mjs`,
  }, {
    entryPoints: ENTRY_POINTS,
    bundle: true,
    minify: true,
    platform: "node",
    format: "esm",
    outfile: `dist/${MODULE_NAME}.min.mjs`,
  }
];

const CJS = [
  {
    entryPoints: ENTRY_POINTS,
    bundle: true,
    minify: false,
    platform: "node",
    format: "cjs",
    outfile: `dist/${MODULE_NAME}.cjs`,
  }, {
    entryPoints: ENTRY_POINTS,
    bundle: true,
    minify: true,
    platform: "node",
    format: "cjs",
    outfile: `dist/${MODULE_NAME}.min.cjs`,
  }
];

const BROWSERIFY = [
  {
    entryPoints: ENTRY_POINTS,
    bundle: true,
    minify: false,
    platform: "browser",
    format: "iife",
    globalName: GLOBAL_NAME,
    outfile: `dist/${MODULE_NAME}.js`,
  }, {
    entryPoints: ENTRY_POINTS,
    bundle: true,
    minify: true,
    platform: "browser",
    format: "iife",
    globalName: GLOBAL_NAME,
    outfile: `dist/${MODULE_NAME}.min.js`,
  }
];

;(async function () {
  if (fs.existsSync("./dist")) {
    fs.rmSync("./dist", { recursive: true });
  }

  const options = [
    ...ESM,
    ...CJS,
    ...BROWSERIFY,
  ];

  for (const option of options) {
    await esbuild.build(option);
  }

  // Write package.json
  fs.writeFileSync("package.json", JSON.stringify(pkg, null, 2), "utf8");
})();