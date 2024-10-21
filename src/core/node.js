"use strict";

import { copyObject } from "../libs/utils.mjs";
import { ePubFile } from "./file.js";

class ePubNode {
  constructor(document, rootNode, parentNode, obj) {
    this._id = document.generateUUID();
    this.document = document;
    this.rootNode = rootNode;
    this.parentNode = parentNode;

    this.tag = null;
    this.closer = null;
    this.content = null;
    this.attributes = {};

    /**
     * @type {object[]}  
     * @property {string|undefined} tag   
     * @property {string|undefined} closer   
     * @property {string|undefined} content   
     * @property {object} attributes   
     */
    this.children = [];

    // Import data
    Object.assign(this, copyObject(obj || {}));

    // Convert children to ePubNode
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

ePubNode.prototype.init = function() {
  for (let i = 0; i < this.children.length; i++) {
    if (!(this.children[i] instanceof ePubNode)) {
      this.children[i] = new ePubNode(this.document, this.rootNode, this, this.children[i]);
    }
  }
}

ePubNode.prototype.getIndex = function() {
  return this.parentNode.children.findIndex(item => item._id == this._id);
}

ePubNode.prototype.getPreviousNode = function() {
  return this.parentNode.children[this.getIndex() - 1];
}

ePubNode.prototype.getNextNode = function() {
  return this.parentNode.children[this.getIndex() + 1];
}

ePubNode.prototype.getAbsolutePath = function() {
  let result = this.parentNode.getAbsolutePath();
  if (this.attributes?.id) {
    result += `#${this.attributes.id}`;
  }
  return result;
}

ePubNode.prototype.getRelativePath = function() {
  let result = this.parentNode.getRelativePath();
  if (this.attributes?.id) {
    result += `#${this.attributes.id}`;
  }
  return result;
}

ePubNode.prototype.move = function(index) {
  if (this.parentNode) {
    const currentIndex = this.getIndex();
    if (currentIndex > -1) {
      if (index > currentIndex) {
        index = index - 1;
      } else if (index < 0) {
        index = this.parentNode.children.length + index;
      }
      this.parentNode.children.splice(index, 0, this.parentNode.children.splice(currentIndex, 1)[0]);
    }
  }

  return this;
}

ePubNode.prototype.remove = function() {
  if (this.parentNode) {
    let i = this.parentNode.children.findIndex(item => item._id == this._id);
    if (i > -1) {
      this.parentNode.children.splice(i, 1);
    }
  }

  // Convert to object
  Object.assign(this, this.toObject());

  delete this.document;
  delete this.rootNode;
  delete this.parentNode;

  return this;
}

ePubNode.prototype.toObject = function() {
  const obj = Object.assign({}, this, {
    children: (this.children || []).map(item => item.toObject()),
  });
  delete obj.document;
  delete obj.rootNode;
  delete obj.parentNode;
  return copyObject(obj);
}

ePubNode.prototype.update = ePubFile.prototype.update;
ePubNode.prototype.addNode = ePubFile.prototype.addNode;
ePubNode.prototype.addNodes = ePubFile.prototype.addNodes;
ePubNode.prototype.getChild = ePubFile.prototype.getChild;
ePubNode.prototype.getChildren = ePubFile.prototype.getChildren;
ePubNode.prototype.updateChild = ePubFile.prototype.updateChild;
ePubNode.prototype.updateChildren = ePubFile.prototype.updateChildren;
ePubNode.prototype.removeChild = ePubFile.prototype.removeChild;
ePubNode.prototype.removeChildren = ePubFile.prototype.removeChildren;
ePubNode.prototype.getNode = ePubFile.prototype.getNode;
ePubNode.prototype.getNodes = ePubFile.prototype.getNodes;
ePubNode.prototype.updateNode = ePubFile.prototype.updateNode;
ePubNode.prototype.updateNodes = ePubFile.prototype.updateNodes;
ePubNode.prototype.removeNode = ePubFile.prototype.removeNode;
ePubNode.prototype.removeNodes = ePubFile.prototype.removeNodes;
ePubNode.prototype.getContent = ePubFile.prototype.getContent;
ePubNode.prototype.getContents = ePubFile.prototype.getContents;
ePubNode.prototype.toNode = ePubFile.prototype.toNode;
ePubNode.prototype.toString = ePubFile.prototype.toString;

export { ePubNode }