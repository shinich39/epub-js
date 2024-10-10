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
    /**
     * All values is optional.  
     * { fallback, *href, *id, media-overlay, *media-type, properties }
     */
    this.manifest = {};
    /**
     * All values is optional.  
     * { id, *idref, linear, properties }  
     * https://www.w3.org/TR/epub-33/#flow-overrides
     */
    this.spine = {};
    this.encoding = "utf8";
    this.attributes = {};

    this.tag = null;
    this.closer = null;
    this.content = null;

    /**
     * object[]  
     * tag: string|undefined  
     * closer: string|undefined  
     * content: string|undefined  
     * attributes: object  
     */
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
        children: [{
          tag: "title",
          children: [{
            content: "No Title",
          }]
        }, {
          tag: "meta",
          closer: " /",
          attributes: {
            charset: "utf-8",
          }
        }]
      }, {
        tag: "body",
      }],
    }];

    // Import data
    Object.assign(this, obj || {});

    // Parse DOM
    if (typeof this.data === "string") {
      this.children = toObj(this.data).children;
      delete this.data;
    }

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

ePubView.prototype.addNode = ePubNode.prototype.addNode;
ePubView.prototype.addNodes = ePubNode.prototype.addNodes;
ePubView.prototype.getNode = ePubNode.prototype.getNode;
ePubView.prototype.getNodes = ePubNode.prototype.getNodes;
ePubView.prototype.removeNode = ePubNode.prototype.removeNode;
ePubView.prototype.removeNodes = ePubNode.prototype.removeNodes;

ePubView.prototype.getText = ePubNode.prototype.getText;
ePubView.prototype.getTexts = ePubNode.prototype.getTexts;

ePubView.prototype.getChild = ePubNode.prototype.getChild;
ePubView.prototype.getChildren = ePubNode.prototype.getChildren;
ePubView.prototype.removeChild = ePubNode.prototype.removeChild;
ePubView.prototype.removeChildren = ePubNode.prototype.removeChildren;

ePubView.prototype.toString = ePubNode.prototype.toString;
ePubView.prototype.toNode = ePubNode.prototype.toNode;

ePubView.prototype.toObject = function() {
  const obj = Object.assign({}, this, {
    children: (this.children || []).map(item => item.toObject()),
  });
  
  delete obj.document;

  return obj;
}

ePubView.prototype.toFile = function() {
  return {
    path: this.getAbsolutePath(),
    data: this.toString(),
    encoding: this.encoding,
  }
}

export { ePubView }