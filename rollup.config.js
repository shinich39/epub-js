import fs from "node:fs";
import path from "node:path";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from '@rollup/plugin-commonjs';
import terser from "@rollup/plugin-terser";

const pkg = JSON.parse(fs.readFileSync("./package.json", "utf8"));

const ESM = true;
const CJS = true;
const BROWSER = true;
const INPUT = "index.js";
const OUTPUT_PATH = "./dist";
const MODULE_NAME = pkg.name.replace(/\W/g, "-").replace(/-?js$/, "");
const MODULE_VERSION = pkg.version;
const GLOBAL_NAME = camelize(MODULE_NAME); // For browser

function camelize(str) {
  return str.replace(/[_.-](\w|$)/g, function (_, x) {
    return x.toUpperCase();
  });
}
function compareFilename(src, dst) {
  return path.basename(src).split(".")[0] == dst;
}
function changeFilename(src, dst) {
  return "./" + path.join(
    path.dirname(src),
    dst + "." + path.basename(src).split(".").slice(1).join(".")
  );
}
function clean(dirPath) {
  if (fs.existsSync(dirPath)) {
    fs.rmSync(dirPath, { recursive: true });
  }
  // fs.mkdirSync(dirPath, { recursive: true });
}

clean(OUTPUT_PATH);

// Update package.json
if (pkg.main && !compareFilename(pkg.main, MODULE_NAME)) {
  pkg.main = changeFilename(pkg.main, MODULE_NAME)
}
if (pkg.exports?.["."]?.["import"] && !compareFilename(pkg.exports["."]["import"], MODULE_NAME)) {
  pkg.exports["."]["import"] = changeFilename(pkg.exports["."]["import"], MODULE_NAME);
}
if (pkg.exports?.["."]?.["require"] && !compareFilename(pkg.exports["."]["require"], MODULE_NAME)) {
  pkg.exports["."]["require"] = changeFilename(pkg.exports["."]["require"], MODULE_NAME);
}
fs.writeFileSync("package.json", JSON.stringify(pkg, null, 2), "utf8");

export default {
  plugins: [
    nodeResolve(),
    commonjs(),
  ],
  onwarn(warning, warn) {
    if (warning.code === 'CIRCULAR_DEPENDENCY') return;
    if (warning.code === 'THIS_IS_UNDEFINED') return;
    warn(warning);
  },
  input: INPUT,
  output: [
    ...(ESM ? 
      [{
        file: "./" + path.join(OUTPUT_PATH, `${MODULE_NAME}.mjs`),
        format: "es",
        strict: true,
      }, {
        file: "./" + path.join(OUTPUT_PATH, `${MODULE_NAME}.min.mjs`),
        format: "es",
        strict: true,
        plugins: [
          terser({ maxWorkers: 4 })
        ],
      }] : []
    ), 
    ...(CJS ? 
      [{
        file: "./" + path.join(OUTPUT_PATH, `${MODULE_NAME}.cjs`),
        format: "cjs",
        strict: true,
      }, {
        file: "./" + path.join(OUTPUT_PATH, `${MODULE_NAME}.min.cjs`),
        format: "cjs",
        strict: true,
        plugins: [
          terser({ maxWorkers: 4 })
        ],
      }] : []
    ), 
    ...(BROWSER ? 
      [{
        file: "./" + path.join(OUTPUT_PATH, `${MODULE_NAME}.js`),
        format: "umd",
        name: GLOBAL_NAME,
        strict: true,
      }, {
        file: "./" + path.join(OUTPUT_PATH, `${MODULE_NAME}.min.js`),
        format: "umd",
        name: GLOBAL_NAME,
        strict: true,
        plugins: [
          terser({ maxWorkers: 4 })
        ],
      }] : []
    ), 
  ]
}