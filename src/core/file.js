"use strict";

import { toStr, toObj } from "../libs/dom.mjs";
import { extToMime, normalizeBase64, beautifyHTML, normalizePath, isDOM, } from "../libs/utilities.js";
import { copyObject, generateUUID, getDirectoryPath, getExtension, getFilename, getRelativePath, isArray, isNumber, isObject, isString, queryObject } from "../libs/utils.mjs";
import { ePubDoc, ePubNode } from "../index.js";

class ePubFile {
  constructor(document, obj) {
    this.document = document;

    // Common properties
    this._id = generateUUID();
    this.path = null;
    this.basename = null;
    this.filename = null;
    this.dirname = null;
    this.extension = null;
    this.mimetype = null;
    this.data = null;
    this.encoding = "utf8";
    this.attributes = {};

    // DOM properties
    this.tag = null;
    this.closer = null;
    this.content = null;
    this.children = [];

    // Import data
    Object.assign(this, copyObject(isObject(obj) ? obj : {}));

    this.preValidate();
    this.init();
    this.postValidate();
  }
}
/**
 * 
 * @returns 
 */
ePubFile.prototype.init = function() {
  this.tag = null;
  this.closer = null;
  this.content = null;
  this.path = normalizePath(this.path);
  this.basename = getFilename(this.path);
  this.filename = getFilename(this.path, getExtension(this.path));
  this.dirname = getDirectoryPath(this.path);
  this.extension = getExtension(this.path);
  this.mimetype = extToMime(this.path);

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
      this.children[i] = new ePubNode(this, this.children[i]);
    }
  }

  return this;
}
/**
 * 
 * @returns 
 */
ePubFile.prototype.preValidate = function() {
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
/**
 * 
 * @returns 
 */
ePubFile.prototype.postValidate = function() {
  return this;
}

ePubFile.prototype.getAbsolutePath = function() {
  return this.path;
}

ePubFile.prototype.getRelativePath = function(from) {
  if (from instanceof ePubFile) {
    from = from.getAbsolutePath();
  } else if (from instanceof ePubNode) {
    from = from.getAbsolutePath();
  } else if (!isString(from)) {
    throw new Error("from must be an ePubFile or ePubNode or string"); 
  }
  return getRelativePath(getDirectoryPath(from), this.getAbsolutePath());
}

ePubFile.prototype.getIndex = function() {
  if (!this.document) {
    return -1;
  }
  return this.document.files.findIndex(item => item._id == this._id);
}

ePubFile.prototype.move = function(index) {
  const currentIndex = this.getIndex();
  if (currentIndex > -1) {
    if (index > currentIndex) {
      index -= 1;
    } else if (index < 0) {
      index += this.document.files.length;
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

  delete this.document;

  return this;
}

ePubFile.prototype.getContent = function() {
  const query = {
    closer: null,
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
  const node = new ePubNode(this, isObject(obj) ? obj : {});
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
  let result = [];
  for (const obj of arr) {
    result.push(this.appendNode(obj, idx));
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
  let result = [];
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
/**
 * https://www.w3.org/TR/epub-33/#sec-item-elem
 * @param {ePubFile} file 
 * @param {object|undefined} attributes - attributes of item node
 * @property {string} id
 * @property {string} href
 * @property {string} media-overlay
 * @property {string} media-type
 * @property {string} properties
 * @property {string} fallback
 * @returns {ePubNode|undefined}
 */
ePubFile.prototype.appendManifestChild = function(file, attributes) {
  const manifestNode = this.findNode({ tag: "manifest" });
  if (!manifestNode) {
    return;
  } else {
    return manifestNode.appendManifestChild(file, attributes);
  }
}
/**
 * https://www.w3.org/TR/epub-33/#sec-item-elem
 * @param {ePubFile[]} files 
 * @param {object|undefined} attributes - attributes of item node
 * @property {string} id
 * @property {string} href
 * @property {string} media-overlay
 * @property {string} media-type
 * @property {string} properties
 * @property {string} fallback
 * @returns {ePubNode[]}
 */
ePubFile.prototype.appendManifestChildren = function(files, attributes) {
  const manifestNode = this.findNode({ tag: "manifest" });
  if (!manifestNode) {
    return [];
  } else {
    return manifestNode.appendManifestChildren(files, attributes);
  }
}
/**
 * https://www.w3.org/TR/epub-33/#sec-item-elem
 * @param {object} query - attributes 
 * @property {string} id
 * @property {string} href
 * @property {string} media-overlay
 * @property {string} media-type
 * @property {string} properties
 * @property {string} fallback
 * @returns 
 */
ePubFile.prototype.removeManifestChild = function(query) {
  const manifestNode = this.findNode({ tag: "manifest" });
  if (manifestNode) {
    manifestNode.removeManifestChild(query);
  }
  return this;
}
/**
 * https://www.w3.org/TR/epub-33/#sec-item-elem
 * @param {object} query - attributes 
 * @property {string} id
 * @property {string} href
 * @property {string} media-overlay
 * @property {string} media-type
 * @property {string} properties
 * @property {string} fallback
 * @returns 
 */
ePubFile.prototype.removeManifestChildren = function(query) {
  const manifestNode = this.findNode({ tag: "manifest" });
  if (manifestNode) {
    manifestNode.removeManifestChildren(query);
  }
  return this;
}
/**
 * https://www.w3.org/TR/epub-33/#sec-itemref-elem
 * @param {ePubFile} file
 * @param {object|undefined} attributes - attributes of itemref node
 * @property {string} id 
 * @property {string} idref 
 * @property {string} linear "yes" or "no"
 * @property {string} properties 
 * @returns {ePubNode|undefined}
 */
ePubFile.prototype.appendSpineChild = function(file, attributes) {
  const spineNode = this.findNode({ tag: "spine" });
  if (!spineNode) {
    return;
  } else {
    return spineNode.appendSpineChild(file, attributes);
  }
}
/**
 * https://www.w3.org/TR/epub-33/#sec-itemref-elem
 * @param {ePubFile[]} files 
 * @param {object|undefined} attributes - attributes of itemref node
 * @property {string} id 
 * @property {string} idref 
 * @property {string} linear "yes" or "no"
 * @property {string} properties 
 * @returns {ePubNode[]}
 */
ePubFile.prototype.appendSpineChildren = function(files, attributes) {
  const spineNode = this.findNode({ tag: "spine" });
  if (!spineNode) {
    return [];
  } else {
    return spineNode.appendSpineChildren(files, attributes);
  }
}
/**
 * https://www.w3.org/TR/epub-33/#sec-itemref-elem
 * @param {object} query - attributes
 * @property {string} id 
 * @property {string} idref
 * @property {string} linear "yes" or "no"
 * @property {string} properties 
 * @returns 
 */
ePubFile.prototype.removeSpineChild = function(query) {
  const spineNode = this.findNode({ tag: "spine" });
  if (spineNode) {
    spineNode.removeSpineChild(query);
  }
  return this;
}
/**
 * https://www.w3.org/TR/epub-33/#sec-itemref-elem
 * @param {object} query - attributes
 * @property {string} id 
 * @property {string} idref 
 * @property {string} linear "yes" or "no"
 * @property {string} properties 
 * @returns 
 */
ePubFile.prototype.removeSpineChildren = function(query) {
  const spineNode = this.findNode({ tag: "spine" });
  if (spineNode) {
    spineNode.removeSpineChildren(query);
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
    path: this.getAbsolutePath(),
    data: this.toString(),
    encoding: this.encoding,
  }
}

ePubFile.prototype.update = ePubDoc.prototype.update;

export { ePubFile }