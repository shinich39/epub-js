"use strict";

import { toObj, toStr } from "../libs/dom.mjs";
import { objToAttr } from "../libs/utilities.js";
import { queryObject } from "../libs/utils.mjs";

class ePubNode {
  constructor(document, view, parentNode, obj) {
    this.document = document;
    this.view = view;
    this.parentNode = parentNode || null;
    this._id = this.document.generateId();
    this.tag = null;
    this.closer = null;
    this.content = null;
    this.attributes = {};
    this.children = [];

    // Import data
    Object.assign(this, obj || {});

    // Convert children to ePubNode
    for (let i = 0; i < this.children.length; i++) {
      this.children[i] = new ePubNode(this.document, this.view, this, this.children[i]);
    }
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

ePubNode.prototype.getIndex = function() {
  return (this.parentNode || this.view).children.findIndex(item => item._id == this._id);
}

ePubNode.prototype.getPreviousNode = function() {
  return (this.parentNode || this.view).children[this.getIndex() - 1];
}

ePubNode.prototype.getNextNode = function() {
  return (this.parentNode || this.view).children[this.getIndex() + 1];
}

ePubNode.prototype.getAbsolutePath = function() {
  let result = this.view.getAbsolutePath();
  if (this.attributes.id) {
    result += `#${this.attributes.id}`;
  }
  return result;
}

ePubNode.prototype.getRelativePath = function() {
  let result = this.view.getRelativePath();
  if (this.attributes.id) {
    result += `#${this.attributes.id}`;
  }
  return result;
}

ePubNode.prototype.setTag = function(str) {
  this.tag = str;
  return this;
}

ePubNode.prototype.setContent = function(str) {
  this.content = str;
  return this;
}

ePubNode.prototype.setAttribute = function(key, value) {
  this.attributes[key] = value;
  return this;
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
ePubNode.prototype.addNode = function(obj) {
  const node = new ePubNode(this.document, this.view, this, obj || {});
  this.children.push(node);  
  return node;
}

ePubNode.prototype.getChild = function(query) {
  for (const child of this.children) {
    if (queryObject(child, query)) {
      return child;
    }
  }
}

ePubNode.prototype.getChildren = function(query) {
  const result = [];
  for (const child of this.children) {
    if (queryObject(child, query)) {
      result.push(child);
    }
  }
  return result;
}

ePubNode.prototype.removeChild = function(query) {
  const child = this.getChild(query);
  if (child) {
    child.remove();
  }
  return this;
}

ePubNode.prototype.removeChildren = function(query) {
  const children = this.getChildren(query);
  for (const child of children) {
    child.remove();
  }
  return this;
}

ePubNode.prototype.getNode = function(query) {
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

ePubNode.prototype.getNodes = function(query) {
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

ePubNode.prototype.removeNode = function(query) {
  const node = this.getNode(query);
  if (node) {
    node.remove();
  }
  return this;
}

ePubNode.prototype.removeNodes = function(query) {
  const nodes = this.getNodes(query);
  for (const node of nodes) {
    node.remove();
  }
  return this;
}

ePubNode.prototype.move = function(index) {
  const parent = this.parentNode || this.view;
  const currentIndex = this.getIndex();
  if (currentIndex > -1) {
    if (index > currentIndex) {
      index = index - 1;
    } else if (index < 0) {
      index = parent.children.length + index;
    }
    parent.children.splice(index, 0, parent.children.splice(currentIndex, 1)[0]);
  }
  return this;
}

ePubNode.prototype.remove = function() {
  // remove children nodes
  for (const child of this.children) {
    child.remove();
  }

  // remove node in parent
  const parent = this.parentNode || this.view;
  const i = parent.children.findIndex(item => item._id == this._id);
  if (i > -1) {
    parent.children.splice(i, 1);
  }

  return this;
}

ePubNode.prototype.toString = function() {
  return this.document.beautify ? beautifyHTML(toStr(this)) : toStr(this);
}

ePubNode.prototype.toObject = function() {
  const obj = Object.assign({}, this, {
    children: (this.children || []).map(item => item.toObject()),
  });
  
  delete obj.document;
  delete obj.view;
  delete obj.parentNode;

  return obj;
}

export { ePubNode }