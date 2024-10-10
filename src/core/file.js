"use strict";

import { getFilename, getExtension, getRelativePath, getDirname, extToMime, } from "../libs/utilities.js";
import { ePubDoc } from "./doc.js";

class ePubFile {
  constructor(document) {
    this.document = document;
    this._id = this.document.generateId();
    /**
     * All value is optional.  
     * { fallback, *href, *id, media-overlay, *media-type, properties }
     */
    this.manifest = {};
    this.path = null;
    this.data = null;
    this.encoding = "utf8";
    this.attributes = {};
  }
}

ePubFile.prototype.getBasename = function() {
  return getFilename(this.path);
}

ePubFile.prototype.getExtension = function() {
  return getExtension(this.path);
}

ePubFile.prototype.getFilename = function() {
  return getFilename(this.path, this.getExtension());
}

ePubFile.prototype.getDirname = function() {
  return getDirname(this.path);
}

ePubFile.prototype.getMimetype = function() {
  return extToMime(this.path);
}

ePubFile.prototype.getAbsolutePath = function() {
  return this.path;
}

ePubFile.prototype.getRelativePath = function() {
  return getRelativePath("EPUB", this.path);
}

ePubFile.prototype.toManifest = function() {
  if (!this.manifest) {
    return null;
  }

  return {
    tag: "item",
    closer: " /",
    attributes: Object.assign(
      {
        "id": this._id,
        "href": this.getRelativePath(),
        "media-type": this.getMimetype(),
      },
      (typeof this.manifest === "object" ? this.manifest : {}),
    )
  };

  // Deprecated
  // return `<item${
  //   objToAttr(
  //     Object.assign(
  //       {
  //         "id": this._id,
  //         "href": this.getRelativePath(),
  //         "media-type": this.getMimetype(),
  //       },
  //       (typeof this.manifest === "object" ? this.manifest : {}),
  //     )
  //   )
  // }/>`;
}

ePubFile.prototype.toSpine = function() {
  if (!this.spine) {
    return null;
  }

  const attributes = Object.assign(
    {
      "idref": this._id,
    },
    (typeof this.spine === "object" ? this.spine : {}),
  );

  // https://www.w3.org/TR/epub-33/#flow-overrides
  // Spine overrides 
  const properties = Object.entries(this.rendition).reduce((acc, [key, value]) => {
    return value ? `${acc} rendition:${key.replace(/[A-Z]/g, function(str) {
      return `-${str.toLowerCase()}`;
    })}-${value}` : acc;
  }, attributes.properties || "");

  if (properties !== "") {
    attributes.properties = properties;
  }

  return {
    tag: "itemref",
    closer: " /",
    attributes: attributes,
  }
}

ePubFile.prototype.toObject = function() {
  const obj = Object.assign({}, this);
  
  delete obj.document;

  return obj;
}

ePubFile.prototype.toFile = function() {
  return {
    path: this.getAbsolutePath(),
    data: this.data,
    encoding: this.encoding,
  }
}

export { ePubFile }