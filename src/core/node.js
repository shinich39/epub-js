"use strict";

import { ePubDoc } from "./doc.js";
import {
  domToStr,
  getRelativePath,
  isArray,
  isNumber,
  isObject,
  isObjectArray,
  isString,
  parsePath,
  strToDom,
} from "utils-js";
import {
  beautifyHTML,
  deepcopy,
  deepescape,
  generateId,
  isFile,
  isNode,
  isNodeType,
} from "../libs/utilities.js";

export class ePubNode {
  /**
   *
   * @param {...object} objs
   * @param {string} objs[].tag - required
   * @param {string} objs[].closer - e.g. "/"
   * @param {string} objs[].content - the property will change as text node
   * @param {string} objs[].data - the property will change as tag node or text node
   * @param {object} objs[].attributes
   * @param {(ePubNode[]|object[])} objs[].children
   * @returns {ePubNode}
   */
  constructor(...objs) {
    // reference properties
    this.parentNode = null;

    // common properties
    this._id = generateId();
    this.tag = null;
    this.closer = null;
    this.content = null;
    this.attributes = {};
    this.content = null;
    this.data = null;
    this.children = [];

    // import data
    if (isObjectArray(objs)) {
      Object.assign(this, ...objs.map((item) => deepcopy(item, true)));
    }

    this.init();
  }
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
  // parse content
  if (isString(this.tag) && isString(this.content)) {
    this.children = [{ content: this.content }];
    this.content = null;
  }

  // prase data
  if (isString(this.data)) {
    this.children = strToDom(this.data).children;
    this.data = null;
  }

  // convert children to ePubNode
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
        this.children[i] = new ePubNode(this.children[i], { parentNode: this });
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
/**
 *
 * @param {ePubNode|object} nodes
 * @returns
 */
ePubNode.prototype.before = function (...nodes) {
  const idx = this.getIndex();
  if (idx > -1) {
    this.parentNode.children.splice(idx, 0, ...nodes);
    this.parentNode.init();
  }
  return this;
};
/**
 *
 * @param {ePubNode|object} nodes
 * @returns
 */
ePubNode.prototype.after = function (...nodes) {
  const idx = this.getIndex();
  if (idx > -1) {
    this.parentNode.children.splice(idx + 1, 0, ...nodes);
    this.parentNode.init();
  }
  return this;
};
/**
 *
 * @returns
 */
ePubNode.prototype.remove = function () {
  const currentIndex = this.getIndex();
  if (currentIndex > -1) {
    this.parentNode.children.splice(currentIndex, 1);
  }

  delete this.parentNode;

  return this;
};
/**
 *
 * @param {object} options
 * @param {boolean} options.beautify - defalut value is true
 * @param {boolean} options.escape - defalut value is true
 * @returns
 */
ePubNode.prototype.toString = function (options) {
  options = Object.assign(
    {
      beautify: true,
      escape: true,
    },
    options || {}
  );

  let clone = this.toObject();
  if (options.escape) {
    clone = deepescape(clone);
  }

  let str = domToStr(clone);
  if (options.beautify) {
    str = beautifyHTML(str);
  }

  return str || "";
};
/**
 *
 * @returns
 */
ePubNode.prototype.toObject = function () {
  const clone = deepcopy(this);
  clone.children = (this.children || []).map((item) => item.toObject());
  return clone;
};
