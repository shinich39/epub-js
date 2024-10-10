"use strict";

import { objToAttr } from "../libs/utilities.js";
import { toStr } from "../libs/dom.mjs";
import { ePubFile } from "./file.js";

class ePubAudio extends ePubFile {
  constructor(document, obj) {
    super(document);

    this.encoding = "base64";

    // Import data
    Object.assign(this, obj || {});
  }
}

ePubAudio.prototype.remove = function() {
  let i = this.document.audios.findIndex(item => item._id == this._id);
  if (i > -1) {
    this.document.audios.splice(i, 1);
  }
  return this;
}

ePubAudio.prototype.toNode = function() {
  return {
    tag: "audio",
    attributes: Object.assign({}, this.attributes),
    children: [{
      tag: "source",
      closer: " /",
      attributes: {
        type: this.getMimetype(),
        src: this.getRelativePath(),
      }
    }],
  }
}

// ePubAudio.prototype.toString = function() {
//   return toStr(this.toNode());
// }

export { ePubAudio }