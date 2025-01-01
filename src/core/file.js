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
   * @param {string} objs[].path - required
   * @param {any} objs[].data - if file is xhtml, data will changed to children after initialize
   * @param {object} objs[].attributes
   * @param {(ePubNode[]|object[])} objs[].children
   * @returns {ePubFile}
   */
  constructor(...objs) {
    // reference properties
    this.document = null;

    // common properties
    this._id = generateId();
    this.path = null;
    this.data = null;

    // dom properties
    this.attributes = {};
    this.children = [];

    // import data
    if (isObjectArray(objs)) {
      Object.assign(this, ...objs.map((item) => deepcopy(item, true)));
    }

    this.init();
  }
  get basename() {
    return parsePath(this.path).basename;
  }
  set basename(v) {
    throw new Error(`'basename' property is read only`);
  }
  get filename() {
    return parsePath(this.path).filename;
  }
  set filename(v) {
    throw new Error(`'filename' property is read only`);
  }
  get dirname() {
    return parsePath(this.path).dirname;
  }
  set dirname(v) {
    throw new Error(`'dirname' property is read only`);
  }
  get extname() {
    return parsePath(this.path).extname;
  }
  set extname(v) {
    throw new Error(`'extname' property is read only`);
  }
  get mimetype() {
    return parsePath(this.path).mimetype;
  }
  set mimetype(v) {
    throw new Error(`'mimetype' property is read only`);
  }
}
/**
 *
 * @returns
 */
ePubFile.prototype.init = function () {
  // parse path
  if (!isString(this.path)) {
    throw new Error(`ePubFile must have a path property as a string`);
  }

  // parse data
  if (isDOM(this.mimetype) && isString(this.data)) {
    this.children = strToDom(this.data).children;
    this.data = null;
  }

  // convert children to ePubNode
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
 * @param {object} updates.$set
 * @param {object} updates.$unset
 * @param {object} updates.$push
 * @param {object} updates.$pushAll
 * @param {object} updates.$pull
 * @param {object} updates.$pullAll
 * @param {object} updates.$addToSet
 * @param {object} updates.$addToSetAll
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
 * @param {object} updates.$set
 * @param {object} updates.$unset
 * @param {object} updates.$push
 * @param {object} updates.$pushAll
 * @param {object} updates.$pull
 * @param {object} updates.$pullAll
 * @param {object} updates.$addToSet
 * @param {object} updates.$addToSetAll
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
 * @property {boolean} beautify - defalut value is true
 * @property {boolean} escape - defalut value is true
 * @returns
 */
ePubFile.prototype.toString = function (options) {
  options = Object.assign(
    {
      beautify: true,
      escape: true,
    },
    options || {}
  );

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
  return str || "";
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
 * @property {boolean} beautify - defalut value is true
 * @property {boolean} escape - defalut value is true
 * @returns
 */
ePubFile.prototype.toFile = function (options) {
  options = Object.assign(
    {
      beautify: true,
      escape: true,
    },
    options || {}
  );

  const clone = deepcopy(this);
  clone.data = this.toString(options);
  delete clone.children;
  return clone;
};
