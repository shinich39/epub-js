"use strict";

import { objToAttr, } from "../libs/utilities.js";
import { ePubFile } from "./file.js";

class ePubScript extends ePubFile {
  constructor(document, obj) {
    super(document);

    this.encoding = "utf8";

    // Import data
    Object.assign(this, obj || {});
  }
}

ePubScript.prototype.remove = function() {
  let i = this.document.scripts.findIndex(item => item._id == this._id);
  if (i > -1) {
    this.document.scripts.splice(i, 1);
  }
  return this;
}

ePubScript.prototype.toString = function() {
  return `<script${objToAttr(
    Object.assign(
      {
        type: "text/javascript",
        src: this.getRelativePath(),
      },
      (typeof this.attributes === "object" ? this.attributes : {}),
    )
  )}</script>`;
}

export { ePubScript }