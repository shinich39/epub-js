"use strict";

import { copyObject, generateUUID, getRelativePath, getDirectoryPath, isArray, isNumber, isObject, isString } from "../libs/utils.mjs";
import { ePubDoc, ePubFile } from "../index.js";
import { normalizeIndex } from "../libs/utilities.js";

class ePubNode {
  constructor(obj) {
    // Reference properties
    this.parentNode = null;

    // Object properties

    // Common properties
    this._id = generateUUID();
    this.tag = null;
    this.closer = null;
    this.content = null;
    this.attributes = {};
    this.data = null; // Convert to DOM on intialization
    this.children = [];

    // Import data
    if (isObject(obj)) {
      Object.assign(this, copyObject(obj));
    }

    this.init();
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

  // Set path
  const rootNode = this.getRootNode();
  const nodeId = this.getAttribute("id");
  if (rootNode && nodeId) {
    this.path = rootNode.getAbsolutePath() + "#" + nodeId;
  } else {
    this.path = null;
  }

  return this;
}

ePubNode.prototype.isAppended = function() {
  return this.parentNode instanceof ePubNode;
}

ePubNode.prototype.getRootNode = function() {
  let parentNode = this.parentNode;
  while(parentNode instanceof ePubNode) {
    parentNode = parentNode.parentNode;
  }
  return parentNode;
}

ePubNode.prototype.getIndex = function() {
  if (!this.isAppended()) {
    return -1;
  }
  return this.parentNode.children.findIndex(item => item._id == this._id);
}
/**
 * 
 * @returns {string|undefined}
 */
ePubNode.prototype.getAbsolutePath = function() {
  const rootNode = this.getRootNode();
  if (!rootNode) {
    return;
  } else if (this.getAttribute("id")) {
    return rootNode.getAbsolutePath() + "#" + this.getAttribute("id");
  } else {
    return rootNode.getAbsolutePath();
  }
}
/**
 * 
 * @param {ePubFile|string} from 
 * @returns {string|undefined}
 */
ePubNode.prototype.getRelativePath = function(from) {
  const absPath = this.getAbsolutePath();
  if (!absPath) {
    return;
  } 
  if (from instanceof ePubFile) {
    from = from.getAbsolutePath();
  }
  return getRelativePath(getDirectoryPath(from), absPath);
}

ePubNode.prototype.remove = function() {
  const currentIndex = this.getIndex();
  if (currentIndex > -1) {
    this.parentNode.children.splice(currentIndex, 1);
  }

  this.parentNode = null;

  return this;
}
/**
 * 
 * @param {object} attributes 
 * @returns 
 */
ePubFile.prototype.toSpineChild = function(attributes) {
  if (!isObject(attributes)) {
    attributes = {};
  }
  return {
    tag: "itemref",
    closer: " /",
    attributes: Object.assign(
      {
        "idref": this.getAttribute("id"),
      },
      attributes,
    ),
  }
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
ePubNode.prototype.createFile = ePubDoc.prototype.createFile;
ePubNode.prototype.createNode = ePubDoc.prototype.createNode;

ePubNode.prototype.getAbsolutePath = ePubFile.prototype.getAbsolutePath;
ePubNode.prototype.getRelativePath = ePubFile.prototype.getRelativePath;

ePubNode.prototype.appendChild = ePubFile.prototype.appendChild;
ePubNode.prototype.appendChildren = ePubFile.prototype.appendChildren;
ePubNode.prototype.prependChild = ePubFile.prototype.prependChild;
ePubNode.prototype.prependChildren = ePubFile.prototype.prependChildren;
ePubNode.prototype.insertChild = ePubFile.prototype.insertChild;
ePubNode.prototype.insertChildren = ePubFile.prototype.insertChildren;

ePubNode.prototype.appendNode = ePubFile.prototype.appendNode;
ePubNode.prototype.appendNodes = ePubFile.prototype.appendNodes;
ePubNode.prototype.prependNode = ePubFile.prototype.prependNode;
ePubNode.prototype.prependNodes = ePubFile.prototype.prependNodes;
ePubNode.prototype.insertNode = ePubFile.prototype.insertNode;
ePubNode.prototype.insertNodes = ePubFile.prototype.insertNodes;

ePubNode.prototype.getContent = ePubFile.prototype.getContent;
ePubNode.prototype.setContent = ePubFile.prototype.setContent;
ePubNode.prototype.getAttribute = ePubFile.prototype.getAttribute;
ePubNode.prototype.setAttribute = ePubFile.prototype.setAttribute;
ePubNode.prototype.findNode = ePubFile.prototype.findNode;
ePubNode.prototype.findNodes = ePubFile.prototype.findNodes;
ePubNode.prototype.updateNode = ePubFile.prototype.updateNode;
ePubNode.prototype.updateNodes = ePubFile.prototype.updateNodes;
ePubNode.prototype.removeNode = ePubFile.prototype.removeNode;
ePubNode.prototype.removeNodes = ePubFile.prototype.removeNodes;
ePubNode.prototype.findChild = ePubFile.prototype.findChild;
ePubNode.prototype.findChildren = ePubFile.prototype.findChildren;
ePubNode.prototype.updateChild = ePubFile.prototype.updateChild;
ePubNode.prototype.updateChildren = ePubFile.prototype.updateChildren;
ePubNode.prototype.removeChild = ePubFile.prototype.removeChild;
ePubNode.prototype.removeChildren = ePubFile.prototype.removeChildren;

export { ePubNode }