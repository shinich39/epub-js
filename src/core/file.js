"use strict";

import { toStr, toObj } from "../libs/dom.mjs";
import { getFilename, getExtension, getRelativePath, getDirname, extToMime, normalizeBase64, beautifyHTML, } from "../libs/utilities.js";
import { queryObject } from "../libs/utils.mjs";
import { ePubDoc } from "./doc.js";
import { ePubNode } from "./node.js";

class ePubFile {
  constructor(document, obj) {
    // TODO: obj validation

    this._id = document.generateId();
    this.document = document;

    // package.opf properties
    /**
     * { fallback, *href, *id, media-overlay, *media-type, properties }|null
     */
    this.manifest = {};

    /**
     * { id, *idref, linear, properties }|null  
     * https://www.w3.org/TR/epub-33/#flow-overrides
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

    // Font properties
    this.fontFamily = null;
    this.fontStyle = null;
    this.fontWeight = null;

    // Import data
    Object.assign(this, obj || {});

    this.init();
  }
}

ePubFile.prototype.init = function() {
  if (this.type === "page") {
    // Parse imported by string DOM
    if (typeof this.data === "string") {
      this.children = toObj(this.data);
      this.data = null;
    }

    // Convert children to ePubNode
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
 * tag: String|undefined  
 * content: String|undefined  
 * closer: String|undefined  
 * attributes: Object|undefined  
 * children: Object[]|undefined  
 * @returns {ePubNode}
 */
ePubFile.prototype.addNode = function(obj) {
  const node = new ePubNode(this.document, this.view, this, obj || {});
  this.children.push(node);  
  return node;
}

ePubFile.prototype.addNodes = function(arr) {
  const result = [];
  for (const item of arr) {
    result.push(this.addNode(item));
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

ePubFile.prototype.getText = function() {
  const query = {
    tag: null,
    content: {
      $exists: true,
    }
  }

  for (const child of this.children) {
    if (queryObject(child, query)) {
      return child;
    }
    const node = child.getNode(query);
    if (node) {
      return node?.content || "";
    }
  }
  return "";
}

ePubFile.prototype.getTexts = function() {
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

ePubFile.prototype.toNode = function() {
  return {
    tag: this.tag,
    closer: this.closer,
    content: this.content,
    attributes: this.attributes,
    children: this.children.map(child => child.toNode()),
  }
}

ePubFile.prototype.toString = function() {
  if (this.type === "page") {
    const str = toStr(this);
    return this.document.beautify ? beautifyHTML(str) : str;
  } else {
    return this.data;
  }
}

ePubFile.prototype.toObject = function() {
  const obj = Object.assign({}, this, {
    children: (this.children || []).map(item => item.toObject()),
  });
  delete obj.document;
  return obj;
}

ePubFile.prototype.toFile = function() {
  return {
    path: this.getAbsolutePath(),
    data: this.toString(),
    encoding: this.encoding,
  }
}

export { ePubFile }