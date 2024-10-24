"use strict";

import { toStr, toObj } from "../libs/dom.mjs";
import { extToMime, normalizeBase64, beautifyHTML, normalizePath, } from "../libs/utilities.js";
import { copyObject, generateUUID, getDirectoryPath, getExtension, getFilename, getRelativePath, isArray, isNumber, isObject, isString, queryObject } from "../libs/utils.mjs";
import { ePubDoc, ePubNode } from "../index.js";

class ePubFile {
  constructor(document, obj) {
    this.document = document;

    /**
     * https://www.w3.org/TR/epub-33/#sec-item-elem
     * @type {object|null}
     * @property {string|null} id
     * @property {string|null} href
     * @property {string|null} media-overlay
     * @property {string|null} media-type
     * @property {string|null} properties
     * @property {string|null} fallback
     */
    this.manifest = null;
    
    /**
     * https://www.w3.org/TR/epub-33/#sec-itemref-elem
     * @type {object|null}
     * @property {string|null} id
     * @property {string|null} idref
     * @property {"yes"|"no"|null} linear
     * @property {string|null} properties
     */
    this.spine = null;

    // Common properties
    this._id = generateUUID();
    this.type = null;
    this.path = null;
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
    this.validate();
  }
}
/**
 * 
 * @returns 
 */
ePubFile.prototype.init = function() {
  // Normalize file path
  if (isString(this.path)) {
    this.path = normalizePath(this.path);
  }

  // Parse imported by string DOM
  if (this.type === "node" || this.type === "page") {
    if (isString(this.data)) {
      this.children = toObj(this.data).children;
      this.data = null;
    }
  }

  // Convert children to ePubNode  
  if (isArray(this.children)) {
    for (let i = 0; i < this.children.length; i++) {
      if (!(this.children[i] instanceof ePubNode)) {
        this.children[i] = new ePubNode(this.document, this, this, this.children[i]);
      }
    }
  }
  
  // Remove base64 header
  if (this.encoding === "base64") {
    if (isString(this.data)) {
      this.data = normalizeBase64(this.data);
    }
  }

  return this;
}
/**
 * 
 * @returns 
 */
ePubFile.prototype.validate = function() {
  if (!isString(this._id)) {
    throw new Error("_id must be a string");
  }
  if (!isString(this.type)) {
    throw new Error("type must be a string");
  }
  if (!isString(this.path)) {
    throw new Error("path must be a string");
  }
  for (const child of this.children) {
    if (!(child instanceof ePubNode)) {
      throw new Error("children must be a ePubNode-array");
    }
  }
  return this;
}

ePubFile.prototype.move = function(index) {
  if (this.document) {
    const currentIndex = this.getIndex();
    if (currentIndex > -1) {
      if (index > currentIndex) {
        index = index - 1;
      } else if (index < 0) {
        index = this.document.files.length + index;
      }
      this.document.files.splice(index, 0, this.document.files.splice(currentIndex, 1)[0]);
    }
  }
  return this;
}

ePubFile.prototype.remove = function() {
  if (this.document) {
    let i = this.document.files.findIndex(item => item._id == this._id);
    if (i > -1) {
      this.document.files.splice(i, 1);
    }
  }

  // Convert to object
  Object.assign(this, this.toObject());

  delete this.document;

  return this;
}


ePubFile.prototype.getIndex = function() {
  return this.document.files.findIndex(item => item._id == this._id);
}

ePubFile.prototype.getPrevious = function() {
  return this.document.files[this.getIndex() - 1];
}

ePubFile.prototype.getNext = function() {
  return this.document.files[this.getIndex() + 1];
}

ePubFile.prototype.getBasename = function() {
  return getFilename(this.path);
}

ePubFile.prototype.getExtension = function() {
  return getExtension(this.path);
}

ePubFile.prototype.getFilename = function() {
  return getFilename(this.path, getExtension(this.path));
}

ePubFile.prototype.getDirname = function() {
  return getDirectoryPath(this.path);
}

ePubFile.prototype.getMimetype = function() {
  return extToMime(this.path);
}

ePubFile.prototype.getAbsolutePath = function() {
  return this.path;
}

ePubFile.prototype.getRelativePath = function() {
  return getRelativePath("EPUB", this.path);
}

ePubFile.prototype.getContent = function() {
  const query = {
    tag: null,
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
  const node = new ePubNode(this.document, this, this, obj || {});
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

// Export methods

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
        "href": this.getRelativePath(),
        "media-type": this.getMimetype(),
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
  return this.type === "dom" ? 
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
    path: this.getAbsolutePath(),
    data: this.toString(),
    encoding: this.encoding,
  }
}

ePubFile.prototype.update = ePubDoc.prototype.update;

export { ePubFile }