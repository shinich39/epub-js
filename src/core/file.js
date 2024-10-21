"use strict";

import { toStr, toObj } from "../libs/dom.mjs";
import { getFilename, getExtension, getRelativePath, getDirname, extToMime, normalizeBase64, beautifyHTML, } from "../libs/utilities.js";
import { copyObject, queryObject } from "../libs/utils.mjs";
import { ePubDoc } from "./doc.js";
import { ePubNode } from "./node.js";

class ePubFile {
  constructor(document, obj) {
    this._id = document.generateUUID();
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
    this.type = "text";
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

    // TODO: validation
    // Validation
    if (!this.path) {
      throw new Error("ePubFile must have a path property");
    }

    this.init();
  }
}

ePubFile.prototype.init = function() {
  // Parse imported by string DOM
  if (["container", "package", "nav", "ncx", "page"].indexOf(this.type) > -1) {
    if (typeof this.data === "string") {
      this.children = toObj(this.data).children;
      this.data = null;
    }
  }

  // Convert children to ePubNode
  if (Array.isArray(this.children)) {
    for (let i = 0; i < this.children.length; i++) {
      if (!(this.children[i] instanceof ePubNode)) {
        this.children[i] = new ePubNode(this.document, this, this, this.children[i]);
      }
    }
  }
  
  // Remove base64 header
  if (this.encoding === "base64") {
    this.data = normalizeBase64(this.data);
  }
}

ePubFile.prototype.getIndex = function() {
  return this.document.files.findIndex(item => item._id == this._id);
}

ePubFile.prototype.getBasename = function() {
  return getFilename(this.path);
}

ePubFile.prototype.getExtension = function() {
  return getExtension(this.path);
}

ePubFile.prototype.getFilename = function() {
  return getFilename(this.path, this.getExtension());
}

ePubFile.prototype.getDirname = function() {
  return getDirname(this.path);
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

/**
 * 
 * @param {object} obj  
 * @property {string|undefined} tag
 * @property {string|undefined} content
 * @property {string|undefined} closer
 * @property {object|undefined} attributes
 * @property {object[]|undefined} children
 * @param {number|undefined} idx default -1
 * @returns {ePubNode}
 */
ePubFile.prototype.addNode = function(obj, idx) {
  if (typeof idx !== "number") {
    idx = -1;
  }
  if (idx < 0) {
    idx += this.children.length + 1;
  }
  const node = new ePubNode(this.document, this, this, obj || {});
  this.children.splice(idx, 0, node);
  return node;
}

ePubFile.prototype.addNodes = function(arr, idx) {
  if (typeof idx !== "number") {
    idx = -1;
  }
  if (idx < 0) {
    idx += this.children.length + 1;
  }
  const result = [];
  for (const item of arr) {
    result.push(this.addNode(item, idx));
    idx++;
  }
  return result;
}

ePubFile.prototype.getChild = function(query = {}) {
  for (const child of this.children) {
    if (queryObject(child, query)) {
      return child;
    }
  }
}

ePubFile.prototype.getChildren = function(query = {}) {
  const result = [];
  for (const child of this.children) {
    if (queryObject(child, query)) {
      result.push(child);
    }
  }
  return result;
}

ePubFile.prototype.updateChild = function(query = {}, updates) {
  const child = this.getChild(query);
  if (child) {
    child.update(updates);
  }
  return this;
}

ePubFile.prototype.updateChildren = function(query = {}, updates) {
  const children = this.getChildren(query);
  for (const child of children) {
    child.update(updates);
  }
  return this;
}

ePubFile.prototype.removeChild = function(query = {}) {
  const child = this.getChild(query);
  if (child) {
    child.remove();
  }
  return this;
}

ePubFile.prototype.removeChildren = function(query = {}) {
  const children = this.getChildren(query);
  for (const child of children) {
    child.remove();
  }
  return this;
}

ePubFile.prototype.getNode = function(query = {}) {
  for (const child of this.children) {
    if (queryObject(child, query)) {
      return child;
    }
    const node = child.getNode(query);
    if (node) {
      return node;
    }
  }
}

ePubFile.prototype.getNodes = function(query = {}) {
  const result = [];
  for (const child of this.children) {
    if (queryObject(child, query)) {
      result.push(child);
    }
    const nodes = child.getNodes(query);
    for (const node of nodes) {
      result.push(node);
    }
  }
  return result;
}

ePubFile.prototype.updateNode = function(query = {}, updates) {
  const node = this.getNode(query);
  if (node) {
    node.update(updates);
  }
  return this;
}

ePubFile.prototype.updateNodes = function(query = {}, updates) {
  const nodes = this.getNodes(query);
  for (const node of nodes) {
    node.update(updates);
  }
  return this;
}

ePubFile.prototype.removeNode = function(query = {}) {
  const node = this.getNode(query);
  if (node) {
    node.remove();
  }
  return this;
}

ePubFile.prototype.removeNodes = function(query = {}) {
  const nodes = this.getNodes(query);
  for (const node of nodes) {
    node.remove();
  }
  return this;
}

ePubFile.prototype.getContent = function() {
  const query = {
    tag: null,
    content: {
      $exists: true,
    }
  }

  for (const child of this.children) {
    if (queryObject(child, query)) {
      return child.content || "";
    }
    const node = child.getNode(query);
    if (node) {
      return node?.content || "";
    }
  }
  return "";
}

ePubFile.prototype.getContents = function() {
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
    const nodes = child.getNodes(query);
    for (const node of nodes) {
      result.push(node);
    }
  }
  return result.map(node => node?.content || "").join("");
}

ePubFile.prototype.update = function(updates) {
  for (const operator of Object.keys(updates)) {
    for (let [keys, value] of Object.entries(updates[operator])) {
      keys = keys.split(".");

      let target = this;
      let key = keys.pop();

      while(typeof target === "object" && keys.length > 0) {
        target = target[keys.shift()];
      }

      if (typeof target !== "object") {
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
        target[key].concat(value);
      } else if (operator === "$pull") {
        for (let i = target[key].length; i >= 0; i--) {
          if (target[key][i] === value) {
            target[key].splice(i, 1);
            break;
          }
        }
      } else if (operator === "$pullAll") {
        target[key] = target[key].filter(item => value.indexOf(item) === -1);
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

  this.init();

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
      (typeof this.manifest === "object" && this.manifest !== null ? this.manifest : {}),
      (typeof obj === "object" && obj !== null ? obj : {}),
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
      (typeof this.spine === "object" && this.spine !== null ? this.spine : {}),
      (typeof obj === "object" && obj !== null ? obj : {}),
    ),
  }
}

ePubFile.prototype.toString = function() {
  let str;
  if (["container", "package", "nav", "ncx", "page"].indexOf(this.type) > -1) {
    str = this.document.beautify ? beautifyHTML(toStr(this)) : toStr(this);
  } else {
    str = this.data;
  }
  return str;
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

export { ePubFile }