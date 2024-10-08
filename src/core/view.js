"use strict";

import { objToAttr, beautifyHTML } from "../libs/utilities.js";
import { toStr, toObj } from "../libs/dom.mjs";
import { queryObject } from "../libs/utils.mjs";
import { ePubFile } from "./file.js";
import { ePubNode } from "./node.js";

class ePubView extends ePubFile {
  constructor(document, obj) {
    super(document, obj);

    this.document = document;
    this._id = this.document.generateId();
    this.manifest = {};
    this.spine = {};
    this.encoding = "utf8";
    this.attributes = {};
    /**
     * https://www.w3.org/TR/epub-33/#layout  
     * layout: "pre-paginated", "reflowable"  
     * orientation: "landscape", "portrait", "auto"  
     * spread: "none", "landscape", "both", "auto"  
     * pageSpread: "left", "center", "right"
     * flow: "paginated", "scrolled-continuous", "scrolled-doc", "auto"  
     */
    this.rendition = {
      layout: null,
      orientation: null,
      spread: null,
      pageSpread: null,
      flow: null,
    };
    this.children = [{
      tag: "?xml",
      closer: "?",
      attributes: {
        version: "1.0",
        encoding: "utf-8",
      },
    }, {
      tag: "html",
      attributes: {
        "xmlns": "http://www.w3.org/1999/xhtml",
        "xmlns:epub": "http://www.idpf.org/2007/ops",
        "xml:lang": this.document.language,
        "lang": this.document.language,
        "dir": this.document.textDirection,
      },
      children: [{
        tag: "head",
      }, {
        tag: "body",
      }],
    }];

    // Import data
    Object.assign(this, obj || {});

    // Convert children to ePubNode
    for (let i = 0; i < this.children.length; i++) {
      this.children[i] = new ePubNode(this.document, this, null, this.children[i]);
    }
  }
}

ePubView.prototype.getIndex = function() {
  return this.document.views.findIndex(item => item._id == this._id);
}

ePubView.prototype.remove = function() {
  let i = this.document.views.findIndex(item => item._id == this._id);
  if (i > -1) {
    this.document.views.splice(i, 1);
  }

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
ePubView.prototype.addNode = function(obj) {
  const node = new ePubNode(this.document, this, null, obj || {});
  this.children.push(node);
  return node;
}

ePubView.prototype.getChild = function(query) {
  for (const child of this.children) {
    if (queryObject(child, query)) {
      return child;
    }
  }
}

ePubView.prototype.getChildren = function(query) {
  const result = [];
  for (const child of this.children) {
    if (queryObject(child, query)) {
      result.push(child);
    }
  }
  return result;
}

ePubView.prototype.removeChild = function(query) {
  const node = this.getChild(query);
  if (node) {
    node.remove();
  }
  return this;
}

ePubView.prototype.removeChildren = function(query) {
  const nodes = this.getChildren(query);
  for (const node of nodes) {
    node.remove();
  }
  return this;
}

ePubView.prototype.getNode = function(query) {
  for (const node of this.children) {
    if (queryObject(node, query)) {
      return node;
    }
    const item = node.getNode(query)
    if (item) {
      return item;
    }
  }
}

ePubView.prototype.getNodes = function(query) {
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

ePubView.prototype.getNode = function(query) {
  for (const node of this.children) {
    if (queryObject(node, query)) {
      return node;
    }
    const item = node.getNode(query)
    if (item) {
      return item;
    }
  }
}

ePubView.prototype.getNodes = function(query) {
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

ePubView.prototype.removeNode = function(query) {
  const node = this.getNode(query);
  if (node) {
    node.remove();
  }
  return this;
}

ePubView.prototype.removeNodes = function(query) {
  const nodes = this.getNodes(query);
  for (const node of nodes) {
    node.remove();
  }
  return this;
}

ePubView.prototype.toString = function() {
  return this.document.beautify ? beautifyHTML(toStr(this)) : toStr(this);
}

ePubView.prototype.toObject = function() {
  const obj = Object.assign({}, this, {
    children: (this.children || []).map(item => item.toObject()),
  });
  
  delete obj.document;

  return obj;
}

export { ePubView }