"use strict";

import { objToAttr } from "../libs/utilities.js";
import { toStr } from "../libs/dom.mjs";
import { ePubFile } from "./file.js";

class ePubImage extends ePubFile {
  constructor(document, obj) {
    super(document);

    this.encoding = "base64";

    // Import data
    Object.assign(this, obj || {});
  }
}

ePubImage.prototype.remove = function() {
  let i = this.document.images.findIndex(item => item._id == this._id);
  if (i > -1) {
    this.document.images.splice(i, 1);
  }
  return this;
}

ePubImage.prototype.toNode = function() {
  return {
    tag: "img",
    closer: " /",
    attributes: Object.assign(
      {
        src: this.getRelativePath(),
      },
      (typeof this.attributes === "object" ? this.attributes : {}),
    ),
  }
}

// ePubImage.prototype.toString = function() {
//   return toStr(this.toNode());
// }

export { ePubImage }