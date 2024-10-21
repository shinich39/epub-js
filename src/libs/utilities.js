"use strict";

import beautify from "js-beautify";
import mime from 'mime';
import path from "path";
import { parseTemplate } from "./utils.mjs";

function dateToISOString(v) {
  return new Date(v).toISOString().replace(/\.[0-9]+Z$/, "Z");
}

function ISOStringToDate(v) {
  return new Date(v);
}

function normalizeBase64(str) {
  return str.replace(/^data\:.*?\,/, "");
}

function toKebabCase(str) {
  return str.replace(/[A-Z]/g, function(ch) {
    return `-${ch.toLowerCase()}`;
  });
}

function parseProperties(obj, target) {
  if (Array.isArray(obj)) {
    for (const _obj of obj) {
      parseProperties(_obj);
    }
  } else if (typeof obj === "object" && obj !== null) {
    for (const key of Object.keys(obj)) {
      if (typeof obj[key] === "string") {
        obj[key] = parseTemplate(obj[key], target)
      }
    }
  }
  return obj;
}

function objToAttr(obj = {}) {
  let result = "";
  for (const [k, v] of Object.entries(obj)) {
    if (typeof v === "string") {
      result += ` ${k}="${v}"`;
    }
  }
  return result;
}

function objToStyle(obj = {}) {
  let result = "";
  for (const [k, v] of Object.entries(obj)) {
    if (typeof v === "string") {
      result += `${k}: ${v};`;
    }
  }
  return result;
}

function mimeToExt(type) {
  return mime.getExtension(type);
}

function extToMime(ext) {
  return mime.getType(ext);
}

function getFilename(p, ext) {
  return path.basename(p, ext);
}

function getExtension(p) {
  return path.extname(p);
}

function changeFilename(p, n) {
  return path.join(path.dirname(p), n + path.extname(p));
}

function getRelativePath(from, to) {
  return path.relative(from, to);
}

function getDirname(p, ext) {
  return path.dirname(p, ext);
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
  dateToISOString,
  ISOStringToDate,
  normalizeBase64,
  objToAttr,
  objToStyle,
  parseProperties,
  mimeToExt,
  extToMime,
  getFilename,
  getExtension,
  getRelativePath,
  getDirname,
  changeFilename,
  beautifyHTML,
  beautifyCSS,
  beautifyJS,
}