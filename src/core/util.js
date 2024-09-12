import beautify from "js-beautify";
import { lookup } from "mime-types";
import { id } from "../libs/util.mjs";
import path from "node:path";
import { ePubFile } from "./file.js";

function getRelativePath(p) {
  return p.replace(/^EPUB\//, "");
}

function dateToISOString(v) {
  return new Date(v).toISOString().replace(/\.[0-9]+Z$/, "Z");
}

function objToProps(obj = {}) {
  let result = "";
  for (const [k, v] of Object.entries(obj)) {
    if (v) {
      if (v instanceof ePubFile) {
        result += ` ${k}="${v.path}"`;
      } else {
        result += ` ${k}="${v}"`;
      }
    }
  }
  return result;
}

function objToStyle(obj = {}) {
  let result = "";
  for (const [k, v] of Object.entries(obj)) {
    if (v) {
      result += `${k}: ${v};`;
    }
  }
  return result;
}

function getMimetype(str) {
  return lookup(str);
}

function getExtension(str) {
  return path.extname(str);
}

function generateId() {
  return id();
}

function beautifyHTML(str) {
  return beautify.html(str, {
    indent_size: 2,
  });
}

function beautifyCSS(str) {
  return beautify.css(str, {
    indent_size: 2,
  });
}

function beautifyJS(str) {
  return beautify.js(str, {
    indent_size: 2,
  });
}

export {
  getRelativePath,
  dateToISOString,
  objToProps,
  objToStyle,
  getMimetype,
  getExtension,
  generateId,
  beautifyHTML,
  beautifyCSS,
  beautifyJS,
}