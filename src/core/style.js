"use strict";

import { ePubFile } from "./file.js";

class ePubStyle extends ePubFile {
  constructor(document, obj) {
    super(document);

    this.encoding = "utf8";

    // Import data
    Object.assign(this, obj || {});
  }
}

ePubStyle.prototype.remove = function() {
  let i = this.document.styles.findIndex(item => item._id == this._id);
  if (i > -1) {
    this.document.styles.splice(i, 1);
  }
  return this;
}

ePubStyle.prototype.toNode = function() {
  return {
    tag: "link",
    closer: " /",
    attributes: Object.assign(
      {
        rel: "stylesheet",
        type: "text/css",
        href: this.getRelativePath(),
      },
      (typeof this.attributes === "object" ? this.attributes : {})
    ),
  }
}

// ePubStyle.prototype.toString = function() {
//   return toStr(this.toNode());
// }

export { ePubStyle }