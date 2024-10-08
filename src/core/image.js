"use strict";

import { objToAttr } from "../libs/utilities.js";
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
  // remove image in document.images
  let i = this.document.images.findIndex(item => item._id == this._id);
  if (i > -1) {
    this.document.images.splice(i, 1);
  }

  return this;
}

ePubImage.prototype.toString = function() {
  return `<img${objToAttr(
    Object.assign(
      {
        src: this.getRelativePath(),
      },
      (typeof this.attributes === "object" ? this.attributes : {}),
    )
  )} />`;
}

export { ePubImage }