"use strict";

import { toStr, toObj } from "../libs/dom.mjs";
import { extToMime, normalizeBase64, normalizeIndex, beautifyHTML, normalizePath, isDOM, deepcopy, isFile, isNode, isDoc, } from "../libs/utilities.js";
import { generateUUID, getDirectoryPath, getExtension, getFilename, getRelativePath, isArray, isNumber, isObject, isString, queryObject } from "../libs/utils.mjs";
import { ePubDoc, ePubNode } from "../index.js";

class ePubFile {
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
ePubFile.prototype.init = function() {
  // File is root node
  // tag, closer, and content values must be null
  this.tag = null;
  this.closer = null;
  this.content = null;

  // Parse path
  if (isString(this.path)) {
    this.path = normalizePath(this.path);
    this.basename = getFilename(this.path);
    this.filename = getFilename(this.path, getExtension(this.path));
    this.dirname = getDirectoryPath(this.path);
    this.extension = getExtension(this.path);
    this.mimetype = extToMime(this.path);
  }

  // Parse imported by string DOM
  if (isDOM(this.mimetype) && isString(this.data)) {
    this.children = toObj(this.data).children;
    this.data = null;
  }

  // Parse attributes when a file is appended
  if (isDoc(this.document) && isObject(this.attributes)) {
    for (const [key, value] of Object.entries(this.attributes)) {
      if (isFile(value) || isNode(value)) {
        this.attributes[key] = value.getRelativePath(this);
      }
    }
  }

  // Convert children to ePubNode
  if (isArray(this.children)) {
    for (let i = 0; i < this.children.length; i++) {
      if (isNode(this.children[i])) {
        if (
          !this.children[i].parentNode ||
          this.children[i].parentNode._id !== this._id
        ) {
          this.children[i].remove();
          this.children[i].parentNode = this;
          this.children[i].init();
        }
      } else if (isObject(this.children[i])) {
        this.children[i] = this.createNode(
          Object.assign(
            {},
            this.children[i],
            { parentNode: this },
          )
        );
      } else if (isString(this.children[i])) {
        this.children[i] = this.createNode({
          parentNode: this,
          content: this.children[i],
        });
      } else if (isNumber(this.children[i])) {
        this.children[i] = this.createNode({
          parentNode: this,
          content: "" + this.children[i],
        });
      }
    }
  }

  return this;
}
/**
 * 
 * @returns {number}
 */
ePubFile.prototype.getIndex = function() {
  if (!this.document) {
    return -1;
  }
  return this.document.files.findIndex(item => item._id == this._id);
}
/**
 * 
 * @returns {string}
 */
ePubFile.prototype.getAbsolutePath = function() {
  return this.path;
}
/**
 * 
 * @param {ePubFile|ePubNode|string} from 
 * @returns {string}
 */
ePubFile.prototype.getRelativePath = function(from) {
  if (isFile(from) || isNode(from)) {
    from = from.getAbsolutePath();
  }
  return getRelativePath(getDirectoryPath(from), this.getAbsolutePath());
}
/**
 * 
 * @returns 
 */
ePubFile.prototype.remove = function() {
  const currentIndex = this.getIndex();
  if (currentIndex > -1) {
    this.document.files.splice(currentIndex, 1);
  }

  delete this.document;

  return this;
}
/**
 * 
 * @returns 
 */
ePubFile.prototype.getContent = function() {
  const query = {
    content: {
      $exists: true,
    }
  }

  let result = [];
  for (const child of this.children) {
    if (queryObject(child, query)) {
      result.push(child.content);
    }
    const nodes = child.findNodes(query);
    for (const node of nodes) {
      result.push(node.content);
    }
  }
  return result.join("");
}
/**
 * 
 * @param {string} str 
 * @returns 
 */
ePubFile.prototype.setContent = function(str) {
  return this.update({
    $set: {
      closer: null,
      children: [{
        content: str
      }]
    }
  });
}
/**
 * 
 * @param {string} key 
 * @returns 
 */
ePubFile.prototype.getAttribute = function(key) {
  if (!isObject(this.attributes)) {
    return;
  }
  return this.attributes[key];
}
/**
 * 
 * @param {string} key 
 * @param {*} value 
 * @returns 
 */
ePubFile.prototype.setAttribute = function(key, value) {
  return this.update({
    $set: {
      ["attributes."+key]: value
    }
  });
}
/**
 * 
 * @param {ePubNode|object|string} node
 * @returns 
 */
ePubFile.prototype.appendChild = function(node) {
  this.children.push(node);
  this.init();
  return this;
}
/**
 * 
 * @param {ePubNode[]|object[]|string[]} nodes
 * @returns 
 */
ePubFile.prototype.appendChildren = function(nodes) {
  this.children = this.children.concat(nodes);
  this.init();
  return this;
}
/**
 * 
 * @param {ePubNode|object} node
 * @returns 
 */
ePubFile.prototype.prependChild = function(node) {
  this.children.unshift(node);
  this.init();
  return this;
}
/**
 * 
 * @param {ePubNode[]|object[]} nodes
 * @returns 
 */
ePubFile.prototype.prependChildren = function(nodes) {
  this.children = [].concat(nodes, this.children);
  this.init();
  return this;
}
/**
 * 
 * @param {ePubNode|object} node
 * @param {number} idx - Default value is -1
 * @returns 
 */
ePubFile.prototype.insertChild = function(node, idx) {
  idx = normalizeIndex(this.children.length, idx);
  this.children.splice(idx, 0, node);
  this.init();
  return this;
}
/**
 * 
 * @param {ePubNode[]|object[]} nodes
 * @param {number} idx - Default value is -1
 * @returns 
 */
ePubFile.prototype.insertChildren = function(nodes, idx) {
  idx = normalizeIndex(this.children.length, idx);
  this.children.splice(idx, 0, ...nodes);
  this.init();
  return this;
}
/**
 * 
 * @param {object} query 
 * @returns 
 */
ePubFile.prototype.findChild = function(query) {
  for (const child of this.children) {
    if (queryObject(child, query)) {
      return child;
    }
  }
}
/**
 * 
 * @param {object} query 
 * @returns 
 */
ePubFile.prototype.findChildren = function(query) {
  let result = [];
  for (const child of this.children) {
    if (queryObject(child, query)) {
      result.push(child);
    }
  }
  return result;
}
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
ePubFile.prototype.updateChild = function(query, updates) {
  const child = this.findChild(query);
  if (child) {
    child.update(updates);
  }
  return this;
}
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
ePubFile.prototype.updateChildren = function(query, updates) {
  const children = this.findChildren(query);
  for (const child of children) {
    child.update(updates);
  }
  return this;
}
/**
 * 
 * @param {object} query 
 * @returns 
 */
ePubFile.prototype.removeChild = function(query) {
  const child = this.findChild(query);
  if (child) {
    child.remove();
  }
  return this;
}
/**
 * 
 * @param {object} query 
 * @returns 
 */
ePubFile.prototype.removeChildren = function(query) {
  const children = this.findChildren(query);
  for (const child of children) {
    child.remove();
  }
  return this;
}
/**
 * 
 * @param {object} query 
 * @returns 
 */
ePubFile.prototype.findNode = function(query) {
  for (const child of this.children) {
    if (queryObject(child, query)) {
      return child;
    }
    const node = child.findNode(query);
    if (node) {
      return node;
    }
  }
}
/**
 * 
 * @param {object} query 
 * @returns 
 */
ePubFile.prototype.findNodes = function(query) {
  let result = [];
  for (const child of this.children) {
    if (queryObject(child, query)) {
      result.push(child);
    }
    const nodes = child.findNodes(query);
    for (const node of nodes) {
      result.push(node);
    }
  }
  return result;
}
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
ePubFile.prototype.updateNode = function(query, updates) {
  const node = this.findNode(query);
  if (node) {
    node.update(updates);
  }
  return this;
}
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
ePubFile.prototype.updateNodes = function(query, updates) {
  const nodes = this.findNodes(query);
  for (const node of nodes) {
    node.update(updates);
  }
  return this;
}
/**
 * 
 * @param {object} query 
 * @returns 
 */
ePubFile.prototype.removeNode = function(query) {
  const node = this.findNode(query);
  if (node) {
    node.remove();
  }
  return this;
}
/**
 * 
 * @param {object} query 
 * @returns 
 */
ePubFile.prototype.removeNodes = function(query) {
  const nodes = this.findNodes(query);
  for (const node of nodes) {
    node.remove();
  }
  return this;
}
/**
 * https://www.w3.org/TR/epub-33/#sec-item-elem
 * @param {object} obj - Attributes of manifest node
 * @property {string} id
 * @property {string} href - Path of file
 * @property {string} media-overlay
 * @property {string} media-type 
 * @property {string} properties "cover-image"|"nav"|"ncx"|...
 * @property {string} fallback
 * @returns 
 */
ePubFile.prototype.toManifestChild = function(obj) {
  if (!isObject(obj)) {
    obj = {};
  }
  return this.createNode({
    tag: "item",
    closer: " /",
    attributes: Object.assign(
      {
        "id": this._id,
        // "href": this.getRelativePath(packagePath),
        "href": this,
        "media-type": this.mimetype,
      }, 
      obj,
    ),
  });
}
/**
 * 
 * @param {string} content - Attributes of a tag 
 * @param {object} attributes - Attributes of a tag 
 * @property {string} id
 * @property {string} class
 * @property {string} style
 * @property {string} href - Path of file
 * @returns 
 */
ePubFile.prototype.toAnchorNode = function(content, attributes) {
  if (!isString(content)) {
    content = "";
  }
  if (!isObject(attributes)) {
    attributes = {};
  }
  return this.createNode({
    tag: "a",
    attributes: Object.assign({
      "href": this,
    }, attributes),
    children: [{
      content: content,
    }],
  });
}

ePubFile.prototype.toString = function() {
  if (isDOM(this.mimetype)) {
    // Beautify DOM
    return beautifyHTML(toStr(this));
  } else {
    return this.data;
  }
}

ePubFile.prototype.toObject = function() {
  const obj = Object.assign({}, this, {
    children: (this.children || []).map(item => item.toObject()),
  });

  delete obj.document;

  return deepcopy(obj);
}

ePubFile.prototype.toFile = function() {
  return {
    path: this.getAbsolutePath(),
    data: this.toString(),
    encoding: this.encoding,
  }
}

ePubFile.prototype.update = ePubDoc.prototype.update;
ePubFile.prototype.createFile = ePubDoc.prototype.createFile;
ePubFile.prototype.createNode = ePubDoc.prototype.createNode;

ePubFile.prototype.appendNode = ePubFile.prototype.appendChild;
ePubFile.prototype.appendNodes = ePubFile.prototype.appendChildren;
ePubFile.prototype.prependNode = ePubFile.prototype.prependChild;
ePubFile.prototype.prependNodes = ePubFile.prototype.prependChildren;
ePubFile.prototype.insertNode = ePubFile.prototype.insertChild;
ePubFile.prototype.insertNodes = ePubFile.prototype.insertChildren;

export { ePubFile }