"use strict";

import { objToAttr, beautifyHTML } from "../libs/utilities.js";
import { toObj, toStr } from "../libs/dom.mjs";
import { queryObject } from "../libs/utils.mjs";
import { ePubFile } from "./file.js";

class ePubNode {
  constructor(document, rootNode, parentNode, obj) {
    this._id = document.generateId();
    this.document = document;
    this.rootNode = rootNode;
    this.parentNode = parentNode || null;

    this.tag = null;
    this.closer = null;
    this.content = null;
    this.attributes = {};

    /**
     * object[]  
     * tag: string|undefined  
     * closer: string|undefined  
     * content: string|undefined  
     * attributes: object  
     */
    this.children = [];

    // Import data
    Object.assign(this, obj || {});

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
  const parentNode = this.parentNode;
  const currentIndex = this.getIndex();
  if (currentIndex > -1) {
    if (index > currentIndex) {
      index = index - 1;
    } else if (index < 0) {
      index = parentNode.children.length + index;
    }
    parentNode.children.splice(index, 0, parentNode.children.splice(currentIndex, 1)[0]);
  }
  return this;
}

ePubNode.prototype.remove = function() {
  // remove children nodes
  for (const child of this.children) {
    child.remove();
  }

  // remove node in parent
  const parentNode = this.parentNode;
  const i = parentNode.children.findIndex(item => item._id == this._id);
  if (i > -1) {
    parentNode.children.splice(i, 1);
  }

  return this;
}

ePubNode.prototype.toObject = function() {
  const obj = Object.assign({}, this, {
    children: (this.children || []).map(item => item.toObject()),
  });
  delete obj.document;
  delete obj.rootNode;
  delete obj.parentNode;
  return obj;
}

ePubNode.prototype.addNode = ePubFile.prototype.addNode;
ePubNode.prototype.addNodes = ePubFile.prototype.addNodes;
ePubNode.prototype.getChild = ePubFile.prototype.getChild;
ePubNode.prototype.getChildren = ePubFile.prototype.getChildren;
ePubNode.prototype.removeChild = ePubFile.prototype.removeChild;
ePubNode.prototype.removeChildren = ePubFile.prototype.removeChildren;
ePubNode.prototype.getNode = ePubFile.prototype.getNode;
ePubNode.prototype.getNodes = ePubFile.prototype.getNodes;
ePubNode.prototype.removeNode = ePubFile.prototype.removeNode;
ePubNode.prototype.removeNodes = ePubFile.prototype.removeNodes;
ePubNode.prototype.getText = ePubFile.prototype.getText;
ePubNode.prototype.getTexts = ePubFile.prototype.getTexts;
ePubNode.prototype.toNode = ePubFile.prototype.toNode;
ePubNode.prototype.toString = ePubFile.prototype.toString;

export { ePubNode }