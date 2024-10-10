"use strict";

import { toStr } from "../libs/dom.mjs";
import { ePubFile } from "./file.js";

class ePubVideo extends ePubFile {
  constructor(document, obj) {
    super(document);

    this.encoding = "base64";

    // Import data
    Object.assign(this, obj || {});
  }
}

ePubVideo.prototype.remove = function() {
  let i = this.document.videos.findIndex(item => item._id == this._id);
  if (i > -1) {
    this.document.videos.splice(i, 1);
  }
  return this;
}

ePubVideo.prototype.toNode = function() {
  return {
    tag: "video",
    attributes: Object.assign({}, this.attributes),
    children: [{
      tag: "source",
      closer: " /",
      attributes: {
        type: this.getMimetype(),
        src: this.getRelativePath(),
      }
    }]
  }
}

// ePubVideo.prototype.toString = function() {
//   return toStr(this.toNode());
// }

export { ePubVideo }