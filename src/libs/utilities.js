"use strict";

import beautify from "js-beautify";
import mime from 'mime';
import { parseTemplate, isNumber } from "./utils.mjs";

function isDOM(str) {
  return /[/+](xml|html)$/.test(str);
}

function dateToISOString(v) {
  return new Date(v).toISOString().replace(/\.[0-9]+Z$/, "Z");
}

function normalizeIndex(max, idx) {
  if (!isNumber(idx)) {
    idx = -1;
  }
  if (idx < 0) {
    idx += max + 1;
  }
  return Math.floor(idx);
}

function normalizeBase64(str) {
  return str.replace(/^data\:.*?\,/, "");
}

function normalizePath(str) {
  return str.replace(/[\\\/]/, "\/")
    .replace(/^\.?\//, "");
}

function toKebabCase(str) {
  return str.replace(/[A-Z]/g, function(ch) {
    return `-${ch.toLowerCase()}`;
  });
}

function parsePropertyValues(obj, target) {
  if (Array.isArray(obj)) {
    for (const _obj of obj) {
      parsePropertyValues(_obj, target);
    }
  } else if (typeof obj === "object" && obj !== null) {
    for (const key of Object.keys(obj)) {
      if (typeof obj[key] === "string") {
        obj[key] = parseTemplate(obj[key], target);
      } else if (typeof obj[key] === "object" && obj[key] !== null) {
        parsePropertyValues(obj[key], target);
      }
    }
  }
  return obj;
}

function updatePropertyValues(obj, targetKey, newValue) {
  if (Array.isArray(obj)) {
    for (const _obj of obj) {
      updatePropertyValues(_obj, targetKey, newValue);
    }
  } else if (typeof obj === "object" && obj !== null) {
    for (const key of Object.keys(obj)) {
      if (key === targetKey) {
        obj[key] = newValue;
      } else if (typeof obj[key] === "object" && obj[key] !== null) {
        updatePropertyValues(obj[key], targetKey, newValue);
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
  isDOM,
  dateToISOString,
  normalizeIndex,
  normalizeBase64,
  normalizePath,
  toKebabCase,
  objToAttr,
  objToStyle,
  parsePropertyValues,
  updatePropertyValues,
  mimeToExt,
  extToMime,
  beautifyHTML,
  beautifyCSS,
  beautifyJS,
}