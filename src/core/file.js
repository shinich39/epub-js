"use strict";

import {
  extToMime,
  beautifyHTML,
  normalizePath,
  isDOM,
  deepcopy,
  isFile,
  isNode,
  isDoc,
} from "../libs/utilities.js";
import {
  domToStr,
  generateUUID,
  getContainedNumber,
  getRelativePath,
  isArray,
  isNumber,
  isObject,
  isString,
  parsePath,
  queryObject,
  strToDom,
} from "../libs/utils.mjs";

import { ePubNode } from "./node.js";

export class ePubFile {
  /**
   *
   * @param {object[]} arr
   * @property {string} _id - Default value is UUID
   * @property {string} path - Required
   * @property {string} data
   * @property {string} encoding - "base64", "utf8",
   * @property {object[]} children
   * @property {object} attributes
   * @returns {ePubFile[]}
   */
  constructor(obj) {
    // Reference properties
    this.document = null;

    // Common properties
    this._id = generateUUID();
    this.path = null; // Required
    this.basename = null;
    this.filename = null;
    this.dirname = null;
    this.extension = null;
    this.mimetype = null;
    this.data = null;
    this.encoding = null; // "utf8", "base64"

    // DOM properties
    this.tag = null;
    this.closer = null;
    this.content = null;
    this.attributes = {};
    this.children = [];

    // Import data
    if (isObject(obj)) {
      Object.assign(this, deepcopy(obj, true));
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
    const fullPath = normalizePath(this.path);
    const parsedPath = parsePath(fullPath);
    this.basename = parsedPath.basename;
    this.extname = parsedPath.extname;
    this.filename = parsedPath.filename;
    this.dirname = parsedPath.dirname;
    this.mimetype = extToMime(parsedPath.extname);
  } else {
    this.basename = null;
    this.extname = null;
    this.filename = null;
    this.dirname = null;
    this.mimetype = null;
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
        this.children[i] = new ePubNode(
          Object.assign({}, this.children[i], { parentNode: this })
        );
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
 * @param {ePubNode|object|string} node
 * @returns
 */
ePubFile.prototype.appendNode = function (node) {
  this.children.push(node);
  this.init();
  return this;
};
/**
 *
 * @param {ePubNode[]|object[]|string[]} nodes
 * @returns
 */
ePubFile.prototype.appendNodes = function (nodes) {
  this.children = this.children.concat(nodes);
  this.init();
  return this;
};
/**
 *
 * @param {ePubNode|object} node
 * @returns
 */
ePubFile.prototype.prependNode = function (node) {
  this.children.unshift(node);
  this.init();
  return this;
};
/**
 *
 * @param {ePubNode[]|object[]} nodes
 * @returns
 */
ePubFile.prototype.prependNodes = function (nodes) {
  this.children = [].concat(nodes, this.children);
  this.init();
  return this;
};
/**
 *
 * @param {ePubNode|object} node
 * @param {number} idx - Default value is -1
 * @returns
 */
ePubFile.prototype.insertNode = function (node, idx) {
  idx = getContainedNumber(idx, 0, this.children.length);
  this.children.splice(idx, 0, node);
  this.init();
  return this;
};
/**
 *
 * @param {ePubNode[]|object[]} nodes
 * @param {number} idx - Default value is -1
 * @returns
 */
ePubFile.prototype.insertNodes = function (nodes, idx) {
  idx = getContainedNumber(idx, 0, this.children.length);
  this.children.splice(idx, 0, ...nodes);
  this.init();
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

ePubFile.prototype.toString = function () {
  if (isDOM(this.mimetype)) {
    // Beautify DOM
    return beautifyHTML(domToStr(this));
  } else {
    return this.data;
  }
};

ePubFile.prototype.toObject = function () {
  const obj = Object.assign({}, this, {
    children: (this.children || []).map((item) => item.toObject()),
  });

  delete obj.document;

  return deepcopy(obj);
};

ePubFile.prototype.toFile = function () {
  return {
    path: this.getAbsolutePath(),
    data: this.toString(),
    encoding: this.encoding,
  };
};

ePubFile.prototype.getAbsPath = ePubFile.prototype.getAbsolutePath;
ePubFile.prototype.getRelPath = ePubFile.prototype.getRelativePath;

ePubFile.prototype.appendChild = ePubFile.prototype.appendNode;
ePubFile.prototype.appendChildren = ePubFile.prototype.appendNodes;
ePubFile.prototype.prependChild = ePubFile.prototype.prependNode;
ePubFile.prototype.prependChildren = ePubFile.prototype.prependNodes;
ePubFile.prototype.insertChild = ePubFile.prototype.insertNode;
ePubFile.prototype.insertChildren = ePubFile.prototype.insertNodes;
ePubFile.prototype.findChild = ePubFile.prototype.findNode;
ePubFile.prototype.findChildren = ePubFile.prototype.findNodes;
ePubFile.prototype.updateChild = ePubFile.prototype.updateNode;
ePubFile.prototype.updateChildren = ePubFile.prototype.updateNodes;
ePubFile.prototype.removeChild = ePubFile.prototype.removeNode;
ePubFile.prototype.removeChildren = ePubFile.prototype.removeNodes;
