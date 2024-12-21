"use strict";

import {
  domToStr,
  generateUUID,
  getRelativePath,
  isArray,
  isNumber,
  isObject,
  isString,
  parsePath,
  strToDom,
} from "../libs/utils.mjs";
import { ePubDoc, ePubFile } from "../index.js";
import { beautifyHTML, deepcopy, isFile, isNode } from "../libs/utilities.js";

class ePubNode {
  constructor(obj) {
    // Reference properties
    this.parentNode = null;

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
      Object.assign(this, deepcopy(obj, true));
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
ePubNode.prototype.init = function () {
  // Parse node properties
  if (isString(this.tag)) {
    if (isString(this.content)) {
      this.children = [
        {
          content: this.content,
        },
      ];
    }

    this.content = null;
  } else {
    if (!isString(this.content)) {
      this.content = "";
    }

    this.tag = null;
    this.closer = null;
  }

  // Parse imported by string DOM
  if (isString(this.data)) {
    this.children = strToDom(this.data).children;
    this.data = null;
  }

  // Convert children to ePubNode
  if (isArray(this.children)) {
    for (let i = 0; i < this.children.length; i++) {
      if (isNode(this.children[i])) {
        if (!this.children[i].parentNode) {
          this.children[i].parentNode = this;
          this.children[i].init();
        } else if (this.children[i].parentNode != this) {
          this.children[i].remove();
          this.children[i].parentNode = this;
          this.children[i].init();
        }
      } else if (isObject(this.children[i])) {
        this.children[i] = this.createNode(
          Object.assign({}, this.children[i], { parentNode: this })
        );
      } else if (isString(this.children[i])) {
        this.children[i] = this.createNode({
          parentNode: this,
          content: this.children[i],
        });
      } else {
        this.children[i] = this.createNode({
          parentNode: this,
          content: this.children[i].toString(),
        });
      }
    }
  }

  return this;
};
/**
 *
 * @returns {ePubDoc|undefined}
 */
ePubNode.prototype.getDocument = function () {
  const rootNode = this.getRootNode();
  if (rootNode) {
    return rootNode.document;
  }
  return;
};
/**
 *
 * @returns {ePubFile|undefined}
 */
ePubNode.prototype.getRootNode = function () {
  let parentNode = this.parentNode;
  while (isNode(parentNode)) {
    parentNode = parentNode.parentNode;
  }
  return parentNode;
};
/**
 *
 * @returns {number}
 */
ePubNode.prototype.getIndex = function () {
  if (!this.parentNode) {
    return -1;
  }
  return this.parentNode.children.findIndex((item) => item._id == this._id);
};
/**
 *
 * @returns {string}
 */
ePubNode.prototype.getAbsolutePath = function () {
  const rootNode = this.getRootNode();
  if (!rootNode) {
    return "";
  } else if (this.getAttribute("id")) {
    return rootNode.getAbsolutePath() + "#" + this.getAttribute("id");
  } else {
    return rootNode.getAbsolutePath();
  }
};
/**
 *
 * @param {ePubFile|ePubNode|string} from
 * @returns {string}
 */
ePubNode.prototype.getRelativePath = function (from) {
  if (isFile(from) || isNode(from)) {
    from = from.getAbsolutePath();
  }
  from = parsePath(from).dirname;
  return getRelativePath(from, this.getAbsolutePath());
};

ePubNode.prototype.remove = function () {
  const currentIndex = this.getIndex();
  if (currentIndex > -1) {
    this.parentNode.children.splice(currentIndex, 1);
  }

  delete this.parentNode;

  return this;
};

ePubNode.prototype.toString = function () {
  return beautifyHTML(domToStr(this));
};

ePubNode.prototype.toObject = function () {
  const obj = Object.assign({}, this, {
    children: (this.children || []).map((item) => item.toObject()),
  });

  delete obj.parentNode;

  return deepcopy(obj);
};

ePubNode.prototype.getFile = ePubNode.prototype.getRootNode;
ePubNode.prototype.getAbsPath = ePubNode.prototype.getAbsolutePath;
ePubNode.prototype.getRelPath = ePubNode.prototype.getRelativePath;

ePubNode.prototype.update = ePubDoc.prototype.update;
ePubNode.prototype.createFile = ePubDoc.prototype.createFile;
ePubNode.prototype.createNode = ePubDoc.prototype.createNode;

ePubNode.prototype.appendNode = ePubFile.prototype.appendNode;
ePubNode.prototype.appendNodes = ePubFile.prototype.appendNodes;
ePubNode.prototype.prependNode = ePubFile.prototype.prependNode;
ePubNode.prototype.prependNodes = ePubFile.prototype.prependNodes;
ePubNode.prototype.insertNode = ePubFile.prototype.insertNode;
ePubNode.prototype.insertNodes = ePubFile.prototype.insertNodes;

ePubNode.prototype.appendChild = ePubFile.prototype.appendChild;
ePubNode.prototype.appendChildren = ePubFile.prototype.appendChildren;
ePubNode.prototype.prependChild = ePubFile.prototype.prependChild;
ePubNode.prototype.prependChildren = ePubFile.prototype.prependChildren;
ePubNode.prototype.insertChild = ePubFile.prototype.insertChild;
ePubNode.prototype.insertChildren = ePubFile.prototype.insertChildren;

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

export { ePubNode };
