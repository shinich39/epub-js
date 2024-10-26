"use strict";

import { toStr, toObj } from "../libs/dom.mjs";
import { extToMime, normalizeBase64, beautifyHTML, normalizePath, isDOM, } from "../libs/utilities.js";
import { copyObject, generateUUID, getDirectoryPath, getExtension, getFilename, getRelativePath, isArray, isNumber, isObject, isString, queryObject } from "../libs/utils.mjs";
import { ePubDoc, ePubNode } from "../index.js";

class ePubFile {
  constructor(document, obj) {
    this.document = document;

    /**
     * https://www.w3.org/TR/epub-33/#sec-item-elem
     * @type {object|undefined}
     * @property {string|undefined} id
     * @property {string|undefined} href
     * @property {string|undefined} media-overlay
     * @property {string|undefined} media-type
     * @property {string|undefined} properties
     * @property {string|undefined} fallback
     */
    this.manifest = null;
    
    /**
     * https://www.w3.org/TR/epub-33/#sec-itemref-elem
     * @type {object|undefined}
     * @property {string|undefined} id
     * @property {string|undefined} idref
     * @property {string|undefined} linear "yes" or "no"
     * @property {string|undefined} properties
     */
    this.spine = null;

    // Common properties
    this._id = generateUUID();
    this.path = null;
    this.basename = null;
    this.filename = null;
    this.dirname = null;
    this.extension = null;
    this.mimetype = null;
    this.absolutePath = null;
    this.relativePath = null;
    this.data = null;
    this.encoding = "utf8";
    this.attributes = {};

    // Page properties
    this.tag = null;
    this.closer = null;
    this.content = null;
    this.children = [];

    // Import data
    Object.assign(this, copyObject(obj || {}));

    this.init();
  }
}
/**
 * 
 * @returns 
 */
ePubFile.prototype.init = function() {
  this.validate();

  this.tag = null;
  this.closer = null;
  this.content = null;
  this.path = normalizePath(this.path);
  this.basename = getFilename(this.path);
  this.filename = getFilename(this.path, getExtension(this.path));
  this.dirname = getDirectoryPath(this.path);
  this.extension = getExtension(this.path);
  this.mimetype = extToMime(this.path);
  this.absolutePath = this.path;
  this.relativePath = getRelativePath("EPUB", this.path);

  // Parse imported by string DOM
  if (isDOM(this.mimetype)) {
    if (isString(this.data)) {
      Object.assign(this, toObj(this.data));
      this.data = null;
    }
  }

  // Remove base64 prefix
  if (this.encoding === "base64") {
    if (isString(this.data)) {
      this.data = normalizeBase64(this.data);
    }
  }

  // Convert children to ePubNode
  for (let i = 0; i < this.children.length; i++) {
    if (this.children[i] instanceof ePubNode) {
      this.children[i].init();
    } else {
      this.children[i] = new ePubNode(this.document, this, this, this.children[i]);
    }
  }

  return this;
}
/**
 * 
 * @returns 
 */
ePubFile.prototype.validate = function() {
  if (!(this.document instanceof ePubDoc)) {
    throw new Error("document must be a ePubDoc");
  }
  if (!isString(this._id)) {
    throw new Error("_id must be a string");
  }
  if (!isString(this.path)) {
    throw new Error("path must be a string");
  }
  if (!isArray(this.children)) {
    throw new Error("children must be a array");
  }
  for (const child of this.children) {
    if (!(child instanceof ePubNode) && !isObject(child)) {
      throw new Error("children[] elements must be a ePubNode or object");
    }
  }
  return this;
}

ePubFile.prototype.move = function(index) {
  const currentIndex = this.getIndex();
  if (currentIndex > -1) {
    if (index > currentIndex) {
      index = index - 1;
    } else if (index < 0) {
      index = this.document.files.length + index;
    }
    this.document.files.splice(index, 0, this.document.files.splice(currentIndex, 1)[0]);
  }

  return this;
}

ePubFile.prototype.remove = function() {
  const currentIndex = this.getIndex();
  if (currentIndex > -1) {
    this.document.files.splice(currentIndex, 1);
  }

  // Convert to object
  Object.assign(this, this.toObject());

  delete this.document;

  return this;
}

ePubFile.prototype.getIndex = function() {
  if (!this.document) {
    return -1;
  }
  return this.document.files.findIndex(item => item._id == this._id);
}

ePubFile.prototype.getNextSibling = function() {
  if (!this.document) {
    return -1;
  }
  return this.document.files.findIndex(item => item._id == this._id);
}

ePubFile.prototype.getPreviousSibling = function() {
  if (!this.document) {
    return -1;
  }
  return this.document.files.findIndex(item => item._id == this._id);
}

ePubFile.prototype.getContent = function() {
  const query = {
    content: {
      $exists: true,
    }
  }

  const result = [];
  for (const child of this.children) {
    if (queryObject(child, query)) {
      result.push(child);
    }
    const nodes = child.findNodes(query);
    for (const node of nodes) {
      result.push(node);
    }
  }
  return result.map(node => node?.content || "").join("");
}
/**
 * 
 * @param {object} obj  
 * @property {string|undefined} tag
 * @property {string|undefined} closer
 * @property {string|undefined} content
 * @property {object|undefined} attributes
 * @property {object[]|undefined} children
 * @param {number|undefined} idx default -1
 * @returns {ePubNode}
 */
ePubFile.prototype.appendNode = function(obj, idx) {
  if (!isNumber(idx)) {
    idx = -1;
  }
  if (idx < 0) {
    idx += this.children.length + 1;
  }
  const node = new ePubNode(this.document, this.rootNode || this, this, obj || {});
  this.children.splice(idx, 0, node);
  return node;
}
/**
 * 
 * @param {object[]} arr  
 * @property {string|undefined} tag
 * @property {string|undefined} closer
 * @property {string|undefined} content
 * @property {object|undefined} attributes
 * @property {object[]|undefined} children
 * @param {number|undefined} idx default -1
 * @returns {ePubNode}
 */
ePubFile.prototype.appendNodes = function(arr, idx) {
  if (!isNumber(idx)) {
    idx = -1;
  }
  if (idx < 0) {
    idx += this.children.length + 1;
  }
  const result = [];
  for (const item of arr) {
    result.push(this.appendNode(item, idx));
    idx++;
  }
  return result;
}

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

ePubFile.prototype.findNodes = function(query) {
  const result = [];
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

ePubFile.prototype.updateNode = function(query, updates) {
  const node = this.findNode(query);
  if (node) {
    node.update(updates);
  }
  return this;
}

ePubFile.prototype.updateNodes = function(query, updates) {
  const nodes = this.findNodes(query);
  for (const node of nodes) {
    node.update(updates);
  }
  return this;
}

ePubFile.prototype.removeNode = function(query) {
  const node = this.findNode(query);
  if (node) {
    node.remove();
  }
  return this;
}

ePubFile.prototype.removeNodes = function(query) {
  const nodes = this.findNodes(query);
  for (const node of nodes) {
    node.remove();
  }
  return this;
}

ePubFile.prototype.appendChild = ePubFile.prototype.appendNode;
ePubFile.prototype.appendChildren = ePubFile.prototype.appendNodes;

ePubFile.prototype.findChild = function(query) {
  for (const child of this.children) {
    if (queryObject(child, query)) {
      return child;
    }
  }
}

ePubFile.prototype.findChildren = function(query) {
  const result = [];
  for (const child of this.children) {
    if (queryObject(child, query)) {
      result.push(child);
    }
  }
  return result;
}

ePubFile.prototype.updateChild = function(query, updates) {
  const child = this.findChild(query);
  if (child) {
    child.update(updates);
  }
  return this;
}

ePubFile.prototype.updateChildren = function(query, updates) {
  const children = this.findChildren(query);
  for (const child of children) {
    child.update(updates);
  }
  return this;
}

ePubFile.prototype.removeChild = function(query) {
  const child = this.findChild(query);
  if (child) {
    child.remove();
  }
  return this;
}

ePubFile.prototype.removeChildren = function(query) {
  const children = this.findChildren(query);
  for (const child of children) {
    child.remove();
  }
  return this;
}

ePubFile.prototype.toNode = function() {
  return {
    tag: this.tag,
    closer: this.closer,
    content: this.content,
    attributes: this.attributes,
    children: this.children.map(child => child.toNode()),
  }
}

ePubFile.prototype.toManifestNode = function(obj) {
  return {
    tag: "item",
    closer: " /",
    attributes: Object.assign(
      {
        "id": this._id,
        "href": this.relativePath,
        "media-type": this.mimetype,
      },
      (isObject(this.manifest) ? this.manifest : {}),
      (isObject(this.obj) ? obj : {}),
    )
  }
}

ePubFile.prototype.toSpineNode = function(obj) {
  return {
    tag: "itemref",
    closer: " /",
    attributes: Object.assign(
      {
        "idref": this._id,
      },
      (isObject(this.spine) ? this.spine : {}),
      (isObject(this.obj) ? obj : {}),
    ),
  }
}

ePubFile.prototype.toString = function() {
  return isDOM(this.mimetype) ? 
    beautifyHTML(toStr(this)) : 
    this.data;
}

ePubFile.prototype.toObject = function() {
  const obj = Object.assign({}, this, {
    children: (this.children || []).map(item => item.toObject()),
  });

  delete obj.document;

  return copyObject(obj);
}

ePubFile.prototype.toFile = function() {
  return {
    path: this.absolutePath,
    data: this.toString(),
    encoding: this.encoding,
  }
}

ePubFile.prototype.update = ePubDoc.prototype.update;

export { ePubFile }