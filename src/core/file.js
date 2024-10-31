"use strict";

import { toStr, toObj } from "../libs/dom.mjs";
import { extToMime, normalizeBase64, normalizeIndex, beautifyHTML, normalizePath, isDOM, } from "../libs/utilities.js";
import { copyObject, generateUUID, getDirectoryPath, getExtension, getFilename, getRelativePath, isArray, isNumber, isObject, isString, queryObject } from "../libs/utils.mjs";
import { ePubDoc, ePubNode } from "../index.js";

class ePubFile {
  constructor(obj) {
    // Reference properties
    this.document = undefined;
    this.head = undefined;
    this.body = undefined;
    
    // Common properties
    this._id = generateUUID();
    this.path = null; // Required
    this.basename = null;
    this.filename = null;
    this.dirname = null;
    this.extension = null;
    this.mimetype = null;
    this.data = null;
    this.encoding = "base64";
    this.attributes = {};

    // DOM properties

    this.tag = null;
    this.closer = null;
    this.content = null;
    this.children = [];

    // Import data
    if (isObject(obj)) {
      Object.assign(this, copyObject(obj));
    }

    this.init();
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
    }
    this.encoding = "utf8";
    this.data = null;
  }

  // Remove base64 prefix
  if (this.encoding === "base64") {
    if (isString(this.data)) {
      this.data = normalizeBase64(this.data);
    }
  }

  // Convert children to ePubNode
  if (isArray(this.children)) {
    for (let i = 0; i < this.children.length; i++) {
      if (this.children[i] instanceof ePubNode) {
        // ...
      } else if (isObject(this.children[i])) {
        this.children[i] = this.createNode(this.children[i]);
      } else if (isString(this.children[i])) {
        this.children[i] = this.createNode({ content: this.children[i] });
      } else if (isNumber(this.children[i])) {
        this.children[i] = this.createNode({ content: "" + this.children[i] });
      }
      this.children[i].parentNode = this;
      this.children[i].init();
    }
  }

  // Find head, body nodes
  if (isDOM(this.mimetype)) {
    const html = this.findChild({ tag: "html" });
    if (html) {
      this.head = html.findChild({ tag: "head" });
      this.body = html.findChild({ tag: "body" });
    } else {
      delete this.head;
      delete this.body;
    }
  } else {
    delete this.head;
    delete this.body;
  }

  return this;
}
/**
 * 
 * @returns {boolean}
 */
ePubFile.prototype.isAppended = function() {
  return this.document instanceof ePubDoc;
}
/**
 * 
 * @returns {number}
 */
ePubFile.prototype.getIndex = function() {
  if (!this.isAppended()) {
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
  if (from instanceof ePubFile) {
    from = from.getAbsolutePath();
  } else if (from instanceof ePubNode) {
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
 * @param {ePubNode|object} node
 * @returns 
 */
ePubFile.prototype.appendChild = function(node) {
  this.children.push(node);
  this.init();
  return this;
}
/**
 * 
 * @param {ePubNode[]|object[]} nodes
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
 * @returns {ePubNode}
 */
ePubFile.prototype.appendManifestChild = function(file, attributes) {
  return this.createNode({
    tag: "item",
    closer: " /",
    attributes: Object.assign(
      {
        "id": file._id,
        "href": file.getRelativePath(this.getAbsolutePath()),
        "media-type": file.mimetype,
      }, 
      (isObject(attributes) ? attributes : {}),
    ),
  });
}
/**
 * https://www.w3.org/TR/epub-33/#sec-itemref-elem
 * @param {ePubFile} file
 * @param {object|undefined} attributes - attributes of itemref node
 * @property {string} id 
 * @property {string} idref 
 * @property {string} linear "yes" or "no"
 * @property {string} properties 
 * @returns {ePubNode}
 */
ePubFile.prototype.appendSpineChild = function(file, attributes) {
  return this.createNode({
    tag: "itemref",
    closer: " /",
    attributes: Object.assign(
      {
        "idref": file._id,
      },
      (isObject(attributes) ? attributes : {}),
    ),
  });
}
/**
 * 
 * @param {ePubFile} packageFile 
 * @param {object} attributes 
 * @returns 
 */
ePubFile.prototype.toManifestChild = function(packageFile, attributes) {
  if (!isObject(attributes)) {
    attributes = {};
  }
  return this.createNode({
    tag: "item",
    closer: " /",
    attributes: Object.assign(
      {
        "id": this._id,
        "href": this.getRelativePath(packageFile.getAbsolutePath()),
        "media-type": this.mimetype,
      }, 
      attributes,
    ),
  });
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
  delete obj.head;
  delete obj.body;

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
ePubFile.prototype.createFile = ePubDoc.prototype.createFile;
ePubFile.prototype.createNode = ePubDoc.prototype.createNode;

ePubFile.prototype.appendNode = ePubFile.prototype.appendChild;
ePubFile.prototype.appendNodes = ePubFile.prototype.appendChildren;
ePubFile.prototype.prependNode = ePubFile.prototype.prependChild;
ePubFile.prototype.prependNodes = ePubFile.prototype.prependChildren;
ePubFile.prototype.insertNode = ePubFile.prototype.insertChild;
ePubFile.prototype.insertNodes = ePubFile.prototype.insertChildren;

export { ePubFile }