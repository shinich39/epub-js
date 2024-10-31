"use strict";

import { copyObject, generateUUID, getRelativePath, getDirectoryPath, isArray, isNumber, isObject, isString } from "../libs/utils.mjs";
import { ePubDoc, ePubFile } from "../index.js";

class ePubNode {
  constructor(parentNode, obj) {
    this.parentNode = parentNode;

    // Object properties

    // Common properties
    this._id = generateUUID();
    this.tag = null;
    this.closer = null;
    this.content = null;
    this.attributes = {};

    /**
     * @type {string} data - Convert to DOM on intialization
     */
    this.data = null;

    /**
     * @type {object[]}  
     * @property {string|undefined} tag   
     * @property {string|undefined} closer   
     * @property {string|undefined} content   
     * @property {object} attributes   
     */
    this.children = [];

    // Import data
    Object.assign(this, copyObject(isObject(obj) ? obj : {}));

    this.preValidate();
    this.init();
    this.postValidate();
  }
  // Deprecated
  // get id() { return this.attributes.id; }
  // set id(v) { this.attributes.id = v; }
  // get class() { return this.attributes.class; }
  // set class(v) { this.attributes.class = v; }
  // get style() { return this.attributes.style; }
  // set style(v) { this.attributes.style = v; }
  // get innerHTML() { return this.content; }
  // set innerHTML(v) { this.content = v; }
  // get innerText() { return this.content; }
  // set innerText(v) { this.content = v; }
}
/**
 * 
 * @returns 
 */
ePubNode.prototype.init = function() {
  // Parse imported by string DOM
  if (isString(this.data)) {
    this.children = toObj(this.data).children;
    this.data = null;
  }
  
  // Convert text node
  if (isString(this.tag)) {
    this.content = null;
  } else if (isString(this.content)) {
    this.tag = null;
    this.closer = null;
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
ePubNode.prototype.preValidate = function() {
  if (!(this.parentNode instanceof ePubFile) && !(this.parentNode instanceof ePubNode)) {
    throw new Error("parentNode must be a ePubFile or ePubNode");
  }
  if (!isString(this._id)) {
    throw new Error("_id must be a string");
  }
  if (!isObject(this.attributes)) {
    throw new Error("attributes must be a object");
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
ePubNode.prototype.postValidate = function() {
  return this;
}

ePubNode.prototype.getRootNode = function() {
  let parentNode = this.parentNode;
  while(parentNode instanceof ePubNode) {
    parentNode = parentNode.parentNode;
  }
  return parentNode;
}

ePubNode.prototype.getAbsolutePath = function() {
  const rootNode = this.getRootNode();
  if (!rootNode) {
    return "";
  } else if (!isString(this.attributes.id)) {
    return rootNode.getAbsolutePath();
  } else {
    return rootNode.getAbsolutePath() + "#" + this.attributes.id;
  }
}

ePubNode.prototype.getRelativePath = function(from) {
  if (from instanceof ePubFile) {
    from = from.getAbsolutePath();
  } else if (from instanceof ePubNode) {
    from = from.getAbsolutePath();
  } else if (!isString(from)) {
    throw new Error("from must be an ePubFile or ePubNode or string"); 
  }
  return getRelativePath(getDirectoryPath(from), this.getAbsolutePath());
}

ePubNode.prototype.getIndex = function() {
  if (!this.parentNode) {
    return -1;
  }
  return this.parentNode.children.findIndex(item => item._id == this._id);
}

ePubNode.prototype.move = function(index) {
  const currentIndex = this.getIndex();
  if (currentIndex > -1) {
    if (index > currentIndex) {
      index -= 1;
    } else if (index < 0) {
      index += this.parentNode.children.length;
    }
    this.parentNode.children.splice(index, 0, this.parentNode.children.splice(currentIndex, 1)[0]);
  }

  return this;
}

ePubNode.prototype.remove = function() {
  const currentIndex = this.getIndex();
  if (currentIndex > -1) {
    this.parentNode.children.splice(currentIndex, 1);
  }

  delete this.parentNode;

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
 * @property {string} properties - "nav", "ncx", "cover-image"
 * @property {string} fallback
 * @returns {ePubNode}
 */
ePubNode.prototype.appendManifestChild = function(file, attributes) {
  const rootNode = this.getRootNode();
  if (!rootNode) {
    return;
  }

  return this.appendNode({
    tag: "item",
    closer: " /",
    attributes: Object.assign(
      {
        "id": file._id,
        "href": file.getRelativePath(rootNode.getAbsolutePath()),
        "media-type": file.mimetype,
      }, 
      (isObject(attributes) ? attributes : {}),
    ),
  });
}
/**
 * https://www.w3.org/TR/epub-33/#sec-item-elem
 * @param {ePubFile[]} files 
 * @param {object|undefined} attributes - attributes of item node
 * @property {string} id
 * @property {string} href
 * @property {string} media-overlay
 * @property {string} media-type
 * @property {string} properties - "nav", "ncx", "cover-image"
 * @property {string} fallback
 * @returns {ePubNode[]}
 */
ePubNode.prototype.appendManifestChildren = function(files, attributes) {
  let result = [];
  for (const file of files) {
    result.push(this.appendManifestChild(file, attributes));
  }
  return result;
}
/**
 * https://www.w3.org/TR/epub-33/#sec-item-elem
 * @param {object} query - attributes 
 * @property {string} id
 * @property {string} href
 * @property {string} media-overlay
 * @property {string} media-type
 * @property {string} properties - "nav", "ncx", "cover-image"
 * @property {string} fallback
 * @returns 
 */
ePubNode.prototype.removeManifestChild = function(query) {
  const node = this.findChild({
    tag: "item",
    attributes: (isObject(query) ? query : {}),
  });

  if (node) {
    node.remove();
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
 * @property {string} properties - "nav", "ncx", "cover-image"
 * @property {string} fallback
 * @returns 
 */
ePubNode.prototype.removeManifestChildren = function(query) {
  const nodes = this.findChildren({
    tag: "item",
    attributes: (isObject(query) ? query : {}),
  });

  for (const node of nodes) {
    node.remove();
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
 * @returns {ePubNode}
 */
ePubNode.prototype.appendSpineChild = function(file, attributes) {
  return this.appendNode({
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
 * https://www.w3.org/TR/epub-33/#sec-itemref-elem
 * @param {ePubFile[]} files 
 * @param {object|undefined} attributes - attributes of itemref node
 * @property {string} id 
 * @property {string} idref 
 * @property {string} linear "yes" or "no"
 * @property {string} properties 
 * @returns {ePubNode[]}
 */
ePubNode.prototype.appendSpineChildren = function(files, attributes) {
  let result = [];
  for (const file of files) {
    result.push(this.appendSpineChild(file, attributes));
  }
  return result;
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
ePubNode.prototype.removeSpineChild = function(query) {
  const node = this.findChild({
    tag: "itemref",
    attributes: (isObject(query) ? query : {}),
  });

  if (node) {
    node.remove();
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
ePubNode.prototype.removeSpineChildren = function(query) {
  const nodes = this.findChildren({
    tag: "itemref",
    attributes: (isObject(query) ? query : {}),
  });

  for (const node of nodes) {
    node.remove();
  }

  return this;
}

ePubNode.prototype.toString = function() {
  return beautifyHTML(toStr(this));
}

ePubNode.prototype.toObject = function() {
  const obj = Object.assign({}, this, {
    children: (this.children || []).map(item => item.toObject()),
  });

  delete obj.parentNode;

  return copyObject(obj);
}

ePubNode.prototype.update = ePubDoc.prototype.update;
ePubNode.prototype.getContent = ePubFile.prototype.getContent;
ePubNode.prototype.setContent = ePubFile.prototype.setContent;
ePubNode.prototype.getAttribute = ePubFile.prototype.getAttribute;
ePubNode.prototype.setAttribute = ePubFile.prototype.setAttribute;
ePubNode.prototype.appendNode = ePubFile.prototype.appendNode;
ePubNode.prototype.appendNodes = ePubFile.prototype.appendNodes;
ePubNode.prototype.findNode = ePubFile.prototype.findNode;
ePubNode.prototype.findNodes = ePubFile.prototype.findNodes;
ePubNode.prototype.updateNode = ePubFile.prototype.updateNode;
ePubNode.prototype.updateNodes = ePubFile.prototype.updateNodes;
ePubNode.prototype.removeNode = ePubFile.prototype.removeNode;
ePubNode.prototype.removeNodes = ePubFile.prototype.removeNodes;
ePubNode.prototype.appendChild = ePubFile.prototype.appendChild;
ePubNode.prototype.appendChildren = ePubFile.prototype.appendChildren;
ePubNode.prototype.findChild = ePubFile.prototype.findChild;
ePubNode.prototype.findChildren = ePubFile.prototype.findChildren;
ePubNode.prototype.updateChild = ePubFile.prototype.updateChild;
ePubNode.prototype.updateChildren = ePubFile.prototype.updateChildren;
ePubNode.prototype.removeChild = ePubFile.prototype.removeChild;
ePubNode.prototype.removeChildren = ePubFile.prototype.removeChildren;
ePubNode.prototype.toNode = ePubFile.prototype.toNode;

export { ePubNode }