"use strict";

import { js_beautify, css_beautify, html_beautify } from "js-beautify";
import mime from "mime";
import {
  parseTemplate,
  isNumber,
  isObject,
  isNull,
  isArray,
  isFunction,
  isString,
} from "utils-js";
import { ePubDoc } from "../core/doc.js";
import { ePubFile } from "../core/file.js";
import { ePubNode } from "../core/node.js";
import { customAlphabet } from "nanoid/non-secure";
import escapeHTML from "escape-html";
const randAlpha = customAlphabet("abcdefghijklmnopqrstuvwxyz", 6);
const randHex = customAlphabet("0123456789abcdefghijklmnopqrstuvwxyz", 10);

export function dateToHex(date) {
  return Math.floor(new Date(date).valueOf() / 1000).toString(16);
}

/**
 * abcvvef51bb4362e00000020
 * 6 lower case latin: alphabets
 * 10 lower case hex: f51bb4362e
 * 8 timestamp hex: 00000020
 * @returns {string} - 24 characters
 */
export function generateId() {
  return randAlpha() + randHex() + dateToHex(new Date());
}

export function isDOM(str) {
  return /[/+](xml|html)$/.test(str);
}

export function isInstance(obj) {
  return (
    obj instanceof ePubDoc || obj instanceof ePubFile || obj instanceof ePubNode
  );
}

export function isDoc(obj) {
  return obj instanceof ePubDoc;
}

export function isFile(obj) {
  return obj instanceof ePubFile;
}

export function isNode(obj) {
  return obj instanceof ePubNode;
}

export function isNativeBuffer(obj) {
  return Buffer && Buffer.isBuffer && Buffer.isBuffer(obj);
}

export function isArrayBuffer(obj) {
  return ArrayBuffer && ArrayBuffer.isView && ArrayBuffer.isView(obj);
}

export function isBuffer(obj) {
  return isNativeBuffer(obj) || isArrayBuffer(obj);
}

export function dateToISOString(v) {
  return new Date(v).toISOString().replace(/\.[0-9]+Z$/, "Z");
}

export function normalizeBase64(str) {
  return str.replace(/^data\:.*?\,/, "");
}

export function normalizePath(str) {
  return str.replace(/[\\\/]+/g, "/").replace(/^\.?\//, "");
}

export function toKebabCase(str) {
  return str.replace(/[A-Z]/g, function (ch) {
    return `-${ch.toLowerCase()}`;
  });
}

export function parsePropertyValues(obj, target) {
  if (isArray(obj)) {
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

export function updatePropertyValues(obj, targetKey, newValue) {
  if (isArray(obj)) {
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

export function objToAttr(obj = {}) {
  let result = "";
  for (const [k, v] of Object.entries(obj)) {
    if (typeof v === "string") {
      result += ` ${k}="${v}"`;
    }
  }
  return result;
}

export function objToStyle(obj = {}) {
  let result = "";
  for (const [k, v] of Object.entries(obj)) {
    if (typeof v === "string") {
      result += `${k}: ${v};`;
    }
  }
  return result;
}

export function mimeToExt(type) {
  return mime.getExtension(type);
}

export function extToMime(ext) {
  return mime.getType(ext);
}

export function beautifyHTML(str) {
  return html_beautify(str, {
    indent_size: 2,
  });
}

export function beautifyCSS(str) {
  return css_beautify(str, {
    indent_size: 2,
  });
}

export function beautifyJS(str) {
  return js_beautify(str, {
    indent_size: 2,
  });
}

export function updateObject(obj, updates) {
  for (const operator of Object.keys(updates)) {
    for (let [keys, value] of Object.entries(updates[operator])) {
      keys = keys.split(".");

      let target = obj,
        key = keys.pop();

      while (isObject(target) && keys.length > 0) {
        target = target[keys.shift()];
      }

      if (!isObject(target)) {
        continue;
      }

      if (operator === "$set") {
        if (target[key] !== value) {
          target[key] = value;
        }
      } else if (operator === "$unset") {
        if (!!value) {
          delete target[key];
        }
      } else if (operator === "$push") {
        target[key].push(value);
      } else if (operator === "$pushAll") {
        for (const v of value) {
          target[key].push(v);
        }
      } else if (operator === "$pull") {
        for (let i = target[key].length; i >= 0; i--) {
          if (target[key][i] === value) {
            target[key].splice(i, 1);
            break;
          }
        }
      } else if (operator === "$pullAll") {
        const prev = target[key];
        target[key] = [];
        for (const v of prev) {
          if (value.indexOf(v) === -1) {
            target[key].push(v);
          }
        }
      } else if (operator === "$addToSet") {
        if (target[key].indexOf(value) === -1) {
          target[key].push(value);
        }
      } else if (operator === "$addToSetAll") {
        for (const v of value) {
          if (target[key].indexOf(v) === -1) {
            target[key].push(v);
          }
        }
      }
    }
  }
}

export function deepcopy(obj, keepInstances) {
  let result;
  if (isArray(obj)) {
    result = [];
  } else {
    result = {};
  }
  for (const [key, value] of Object.entries(obj)) {
    if (key == "data") {
      // Prevent copy buffer
      result[key] = value;
    } else if (isInstance(value)) {
      if (keepInstances) {
        result[key] = value;
      } else {
        delete result[key];
      }
    } else if (isFunction(value)) {
      delete result[key];
    } else if (isObject(value) && !isNull(value)) {
      result[key] = deepcopy(value, keepInstances);
    } else {
      result[key] = value;
    }
  }
  return result;
}

export function deepescape(obj) {
  if (isArray(obj)) {
    for (const item of obj) {
      if (isObject(item)) {
        deepescape(item);
      }
    }
  } else if (isObject(obj)) {
    if (isString(obj.content)) {
      obj.content = escapeHTML(obj.content);
    }
    if (isArray(obj.children)) {
      deepescape(obj.children);
    }
  }

  return obj;
}
