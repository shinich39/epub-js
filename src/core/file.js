"use strict";

import { getFilename, getExtension, getRelativePath, getDirname, extToMime, } from "../libs/utilities.js";
import { ePubDoc } from "./doc.js";

class ePubFile {
  constructor(document) {
    this.document = document;
    this._id = this.document.generateId();
    this.manifest = {};
    /**
     * https://www.w3.org/TR/epub-33/#layout  
     * layout: "pre-paginated", "reflowable"  
     * orientation: "landscape", "portrait", "auto"  
     * spread: "none", "landscape", "both", "auto"  
     * pageSpread: "left", "center", "right"
     * flow: "paginated", "scrolled-continuous", "scrolled-doc", "auto"  
     */
    this.spine = null;
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

/**
 * 
 * @param {object|boolean} obj { fallback, *href, *id, media-overlay, *media-type, properties }
 * @returns 
 */
ePubFile.prototype.setManifest = function(obj) {
  this.manifest = typeof obj === "object" ? obj : {};
  return this;
}

ePubFile.prototype.unsetManifest = function() {
  this.manifest = null;
  return this;
}

/**
 * 
 * @param {object|boolean} obj { id, *idref, linear, properties }
 * @returns 
 */
ePubFile.prototype.setSpine = function(obj) {
  this.spine = typeof obj === "object" ? obj : {};
  return this;
}

ePubFile.prototype.unsetSpine = function() {
  this.spine = null;
  return this;
}

ePubFile.prototype.setPath = function(str) {
  this.path = str;
  return this;
}

ePubFile.prototype.setData = function(str) {
  this.data = str;
  return this;
}

ePubFile.prototype.setEncoding = function(str) {
  this.encoding = str;
  return this;
}

ePubFile.prototype.setAttribute = function(key, value) {
  this.attributes[key] = value;
  return this;
}

ePubFile.prototype.toManifest = function() {
  return this.manifest ? `<item${
    objToAttr(
      Object.assign(
        {
          "id": this._id,
          "href": this.getRelativePath(),
          "media-type": this.getMimetype(),
        },
        (typeof this.manifest === "object" ? this.manifest : {}),
      )
    )
  }/>` : "";
}

ePubFile.prototype.toSpine = function() {
  const rendition = Object.entries(this.rendition).reduce((acc, [key, value]) => {
    return value ? `${acc} rendition:${key.replace(/[A-Z]/g, function(str) {
      return `-${str.toLowerCase()}`;
    })}-${value}` : acc;
  }, "");

  const obj = Object.assign(
    {
      "idref": this._id,
    },
    (typeof this.spine === "object" ? this.spine : {}),
  );

  // https://www.w3.org/TR/epub-33/#flow-overrides
  // Spine overrides 
  if (rendition !== "") {
    if (obj.properties) {
      obj.properties += rendition;
    } else {
      obj.properties = rendition;
    }
  }

  return this.spine ? `<item${objToAttr(obj)}/>` : "";
}

ePubFile.prototype.toObject = function() {
  const obj = Object.assign({}, this);
  
  delete obj.document;

  return obj;
}

export { ePubFile }