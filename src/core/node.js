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
import { beautifyHTML, deepcopy, isFile, isNode } from "../libs/utilities.js";

import { ePubDoc } from "./doc.js";

export class ePubNode {
  /**
   *
   * @param {object} obj
   * @property {string} _id - Default value is UUID
   * @property {string|null} tag - Required
   * @property {string|null} closer - "/"
   * @property {string} content - You must set the tag to null
   * @property {object} attributes
   * @property {object[]} children
   * @returns {ePubNode}
   */
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
        this.children[i] = new ePubNode(
          Object.assign({}, this.children[i], { parentNode: this })
        );
      } else if (isString(this.children[i])) {
        this.children[i] = new ePubNode({
          parentNode: this,
          content: this.children[i],
        });
      } else {
        this.children[i] = new ePubNode({
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
