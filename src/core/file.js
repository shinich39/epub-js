"use strict";

import { ePubNode } from "./node.js";
import {
  extToMime,
  beautifyHTML,
  normalizePath,
  isDOM,
  deepcopy,
  isFile,
  isNode,
  isDoc,
  generateId,
} from "../libs/utilities.js";
import {
  domToStr,
  getContainedNumber,
  getRelativePath,
  isArray,
  isEmpty,
  isNumber,
  isObject,
  isObjectArray,
  isString,
  parsePath,
  queryObject,
  strToDom,
} from "utils-js";

export class ePubFile {
  /**
   *
   * @param {...object} objs
   * @property {string} objs[].path - Required
   * @property {string} objs[].data
   * @property {object} objs[].attributes
   * @property {(ePubNode[]|object[])} objs[].children
   * @returns {ePubFile}
   */
  constructor(...objs) {
    // Reference properties
    this.document = null;

    // Common properties
    this._id = generateId();
    this.path = null; // Required
    this.data = null;

    // Read only properties
    this.basename = null;
    this.filename = null;
    this.dirname = null;
    this.extension = null;
    this.mimetype = null;

    // DOM properties
    this.tag = null;
    this.closer = null;
    this.content = null;
    this.attributes = {};
    this.children = [];

    // Import data
    if (isObjectArray(objs)) {
      Object.assign(this, ...objs.map((item) => deepcopy(item, true)));
    }

    this.init();
  }
}
/**
 *
 * @returns
 */
ePubFile.prototype.init = function () {
  // tag, closer, and content values must be null
  this.tag = null;
  this.closer = null;
  this.content = null;

  // Parse path
  if (isString(this.path)) {
    const normalizedPath = normalizePath(this.path);
    const parsedPath = parsePath(normalizedPath);
    this.basename = parsedPath.basename;
    this.extname = parsedPath.extname;
    this.filename = parsedPath.filename;
    this.dirname = parsedPath.dirname;
    this.mimetype = extToMime(parsedPath.extname);
  } else {
    throw new Error(`ePubFile must have a path parameter`);
    // this.basename = null;
    // this.extname = null;
    // this.filename = null;
    // this.dirname = null;
    // this.mimetype = null;
  }

  // Parse imported by string DOM
  if (isDOM(this.mimetype) && isString(this.data)) {
    this.children = strToDom(this.data).children;
    this.data = null;
  }

  // Convert children to ePubNode
  if (isArray(this.children)) {
    for (let i = 0; i < this.children.length; i++) {
      if (isNode(this.children[i])) {
        if (!this.children[i].parentNode) {
          this.children[i].parentNode = this;
          this.children[i].init();
        } else if (this.children[i].parentNode != this) {
          this.children[i].remove();
          this.children[i].parentNode = this;
          this.children[i].init();
        }
      } else if (isObject(this.children[i])) {
        this.children[i] = new ePubNode(this.children[i], { parentNode: this });
      } else if (isString(this.children[i])) {
        this.children[i] = new ePubNode({
          parentNode: this,
          content: this.children[i],
        });
      } else {
        this.children[i] = new ePubNode({
          parentNode: this,
          content: this.children[i].toString(),
        });
      }
    }
  }

  return this;
};
/**
 *
 * @returns {number}
 */
ePubFile.prototype.getIndex = function () {
  if (!this.document) {
    return -1;
  }
  return this.document.files.findIndex((item) => item._id == this._id);
};
/**
 *
 * @returns {string}
 */
ePubFile.prototype.getAbsolutePath = function () {
  return normalizePath(this.path);
};
/**
 *
 * @param {ePubFile|ePubNode|string} from
 * @returns {string}
 */
ePubFile.prototype.getRelativePath = function (from) {
  if (isFile(from) || isNode(from)) {
    from = from.getAbsolutePath();
  }
  from = parsePath(from).dirname;
  return getRelativePath(from, this.getAbsolutePath());
};
/**
 *
 * @returns
 */
ePubFile.prototype.remove = function () {
  const currentIndex = this.getIndex();
  if (currentIndex > -1) {
    this.document.files.splice(currentIndex, 1);
  }

  delete this.document;

  return this;
};
/**
 *
 * @returns
 */
ePubFile.prototype.getContent = function () {
  const query = {
    content: {
      $exists: true,
    },
  };

  let result = [];
  for (const node of this.children) {
    if (queryObject(node, query)) {
      result.push(node.content);
    }
    const nodes = node.findNodes(query);
    for (const node of nodes) {
      result.push(node.content);
    }
  }
  return result.join("");
};
/**
 *
 * @param {string} str
 * @returns
 */
ePubFile.prototype.setContent = function (str) {
  return this.update({
    $set: {
      closer: null,
      children: [
        {
          content: str,
        },
      ],
    },
  });
};
/**
 *
 * @param {string} key
 * @returns
 */
ePubFile.prototype.getAttribute = function (key) {
  if (!isObject(this.attributes)) {
    return;
  }
  return this.attributes[key];
};
/**
 *
 * @param {string} key
 * @param {*} value
 * @returns
 */
ePubFile.prototype.setAttribute = function (key, value) {
  return this.update({
    $set: {
      ["attributes." + key]: value,
    },
  });
};
/**
 *
 * @param {ePubNode|object|string} nodes
 * @returns
 */
ePubFile.prototype.append = function (...nodes) {
  this.children = this.children.concat(nodes);
  this.init();
  return this;
};
/**
 *
 * @param {ePubNode|object} nodes
 * @returns
 */
ePubFile.prototype.prepend = function (...nodes) {
  this.children = [].concat(nodes, this.children);
  this.init();
  return this;
};
/**
 *
 * @param {number} idx
 * @param {ePubNode|object} nodes
 * @returns
 */
ePubFile.prototype.insert = function (idx, ...nodes) {
  idx = getContainedNumber(idx, 0, this.children.length);
  this.children.splice(idx, 0, ...nodes);
  this.init();
  return this;
};
/**
 *
 * @param {ePubFile|object} files
 * @returns
 */
ePubFile.prototype.before = function (...files) {
  const idx = this.getIndex();
  if (idx > -1) {
    this.document.files.splice(idx, 0, ...files);
    this.document.init();
  }
  return this;
};
/**
 *
 * @param {ePubFile|object} files
 * @returns
 */
ePubFile.prototype.after = function (...files) {
  const idx = this.getIndex();
  if (idx > -1) {
    this.document.files.splice(idx + 1, 0, ...files);
    this.document.init();
  }
  return this;
};
/**
 *
 * @param {object} query
 * @returns
 */
ePubFile.prototype.findNode = function (query) {
  for (const node of this.children) {
    if (queryObject(node, query)) {
      return node;
    }
    const _node = node.findNode(query);
    if (_node) {
      return _node;
    }
  }
};
/**
 *
 * @param {object} query
 * @returns
 */
ePubFile.prototype.findNodes = function (query) {
  let result = [];
  for (const node of this.children) {
    if (queryObject(node, query)) {
      result.push(node);
    }
    const nodes = node.findNodes(query);
    for (const _node of nodes) {
      result.push(_node);
    }
  }
  return result;
};
/**
 *
 * @param {object} query
 * @param {object} updates
 * @property {object} $set
 * @property {object} $unset
 * @property {object} $push
 * @property {object} $pushAll
 * @property {object} $pull
 * @property {object} $pullAll
 * @property {object} $addToSet
 * @property {object} $addToSetAll
 * @returns
 */
ePubFile.prototype.updateNode = function (query, updates) {
  const node = this.findNode(query);
  if (node) {
    node.update(updates);
  }
  return this;
};
/**
 *
 * @param {object} query
 * @param {object} updates
 * @property {object} $set
 * @property {object} $unset
 * @property {object} $push
 * @property {object} $pushAll
 * @property {object} $pull
 * @property {object} $pullAll
 * @property {object} $addToSet
 * @property {object} $addToSetAll
 * @returns
 */
ePubFile.prototype.updateNodes = function (query, updates) {
  const nodes = this.findNodes(query);
  for (const node of nodes) {
    node.update(updates);
  }
  return this;
};
/**
 *
 * @param {object} query
 * @returns
 */
ePubFile.prototype.removeNode = function (query) {
  const node = this.findNode(query);
  if (node) {
    node.remove();
  }
  return this;
};
/**
 *
 * @param {object} query
 * @returns
 */
ePubFile.prototype.removeNodes = function (query) {
  const nodes = this.findNodes(query);
  for (const node of nodes) {
    node.remove();
  }
  return this;
};
/**
 *
 * @param {object} options
 * @property {boolean} beautify - Defalut value is false
 * @property {boolean} escape - Defalut value is false
 * @returns
 */
ePubFile.prototype.toString = function (options) {
  if (!options) {
    options = {};
  }

  let str;
  if (isDOM(this.mimetype)) {
    str = this.children
      .map((item) => item.toString({ escape: options.escape }))
      .join("");

    if (options.beautify) {
      str = beautifyHTML(str);
    }
  } else {
    str = this.data;
  }
  return str;
};
/**
 *
 * @returns
 */
ePubFile.prototype.toObject = function () {
  const clone = deepcopy(this);
  clone.children = (this.children || []).map((item) => item.toObject());
  return clone;
};
/**
 *
 * @param {object} options
 * @property {boolean} beautify - Defalut value is false
 * @property {boolean} escape - Defalut value is false
 * @returns
 */
ePubFile.prototype.toFile = function (options) {
  if (!options) {
    options = {};
  }

  const clone = deepcopy(this);
  clone.data = this.toString(options);
  delete clone.children;
  return clone;
};
