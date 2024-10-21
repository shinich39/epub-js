"use strict";

import { copyObject, queryObject } from "../libs/utils.mjs";
import { ePubFile } from "./file.js";
import { ePubNode } from "./node.js";

class ePubDoc {
  constructor(obj) {
    this._id = this.generateUUID();

    // Beatify HTML, CSS, JS
    this.beautify = true;

    // Default attributes of ePubFile
    this.defaults = {
      text: {
        type: "text",
        manifest: {},
        encoding: "utf8",
      },
      page: {
        type: "page",
        manifest: {},
        spine: {},
        tag: null,
        closer: null,
        content: null,
        children: [{
          tag: "?xml",
          closer: "?",
          attributes: {
            version: "1.0",
            encoding: "utf-8",
          },
        }, {
          tag: "!DOCTYPE",
          closer: "",
          attributes: {
            html: true,
          },
        }, {
          tag: "html",
          attributes: {
            "xmlns": "http://www.w3.org/1999/xhtml",
            "xmlns:epub": "http://www.idpf.org/2007/ops",
            "xml:lang": "en",
            "lang": "en",
            "dir": null,
          },
          children: [{
            tag: "head",
            children: [{
              tag: "title",
              children: [{
                content: "No Title",
              }]
            }, {
              tag: "meta",
              closer: " /",
              attributes: {
                charset: "utf-8",
              }
            }],
          }, {
            tag: "body",
          }],
        }],
        encoding: "utf8",
      },
      style: {
        type: "style",
        manifest: {},
        encoding: "utf8",
      },
      script: {
        type: "script",
        manifest: {},
        encoding: "utf8",
      },
      image: {
        type: "image",
        manifest: {},
        encoding: "base64",
      },
      cover: {
        type: "image",
        manifest: {
          properties: "cover-image",
        },
        encoding: "base64",
      },
      audio: {
        type: "audio",
        manifest: {},
        encoding: "base64",
      },
      video: {
        type: "video",
        manifest: {},
        encoding: "base64",
      },
      font: {
        type: "font",
        manifest: {},
        encoding: "base64",
      },

      mimetype: {
        type: "mimetype",
        path: "mimetype",
        manifest: null,
        spine: null,
        data: "application/epub+zip",
        encoding: "utf8",
      },
      container: {
        type: "container",
        path: "META-INF/container.xml",
        manifest: null,
        spine: null,
        children: [{
          tag: "?xml",
          closer: "?",
          attributes: {
            version: "1.0",
            encoding: "utf-8",
          },
        }, {
          tag: "container",
          attributes: {
            "version": "1.0",
            "xmlns": "urn:oasis:names:tc:opendocument:xmlns:container",
          },
          children: [{
            tag: "rootfiles",
            children: [{
              tag: "rootfile",
              closer: " /",
              attributes: {
                "full-path": "EPUB/package.opf",
                "media-type": "application/oebps-package+xml",
              }
            }],
          }],
        }],
      },
      package: {
        type: "package",
        path: "EPUB/package.opf",
        manifest: null,
        spine: null,
        children: [{
          tag: "?xml",
          closer: "?",
          attributes: {
            version: "1.0",
            encoding: "utf-8",
          },
        }, {
          tag: "package",
          attributes: {
            "xmlns": "http://www.idpf.org/2007/opf",
            "version": "3.0",
            "unique-identifier": "bookid",
            "xml:lang": "en",
            "dir": null,
          },
          children: [{
            tag: "metadata",
            attributes: {
              "xmlns:opf": "http://www.idpf.org/2007/opf",
              "xmlns:dc": "http://purl.org/dc/elements/1.1/",
              "xmlns:dcterms": "http://purl.org/dc/terms/",
            },
            children: [{
              tag: "dc:identifier",
              attributes: {
                id: "bookid",
              },
              children: [{
                content: `urn:uuid:${this._id}`,
              }],
            }, {
              tag: "dc:language",
              children: [{
                content: "en",
              }],
            }, {
              tag: "dc:title",
              attributes: {
                id: "title",
              },
              children: [{
                content: "No Title",
              }],
            }, {
              tag: "meta",
              attributes: {
                property: "dcterms:modified",
              },
              children: [{
                content: new Date().toISOString(),
              }],
            }],
          }, {
            tag: "manifest",
            attributes: {},
          }, {
            tag: "spine",
            attributes: {
              // Set toc to "ncx" for legacy mode
              "toc": null,
              // Set page direction value to "ltr" or "rtl"
              "page-progression-direction": null,
            },
          }],
        }],
      },
      nav: {
        type: "nav",
        path: "EPUB/nav.xhtml",
        manifest: {
          properties: "nav",
        },
        spine: {
          linear: "no",
        },
        tag: null,
        closer: null,
        content: null,
        children: [{
          tag: "?xml",
          closer: "?",
          attributes: {
            version: "1.0",
            encoding: "utf-8",
          },
        }, {
          tag: "!DOCTYPE",
          closer: "",
          attributes: {
            html: true,
          },
        }, {
          tag: "html",
          attributes: {
            "xmlns": "http://www.w3.org/1999/xhtml",
            "xmlns:epub": "http://www.idpf.org/2007/ops",
            "xml:lang": "en",
            "lang": "en",
            "dir": null,
          },
          children: [{
            tag: "head",
            children: [{
              tag: "title",
              children: [{
                content: "No Title",
              }]
            }, {
              tag: "meta",
              closer: " /",
              attributes: {
                charset: "utf-8",
              }
            }],
          }, {
            tag: "body",
            children: [{
              tag: "nav",
              attributes: {
                "epub:type": "toc",
                "id": "toc",
                "role": "doc-toc",
              }
            }, {
              tag: "nav",
              attributes: {
                "epub:type": "landmarks",
                "id": "landmarks",
                "hidden": "",
              }
            }, {
              tag: "nav",
              attributes: {
                "epub:type": "page-list",
                "id": "page-list",
                "hidden": "",
              }
            }],
          }],
        }],
        encoding: "utf8",
      },
      ncx: {
        type: "ncx",
        path: "EPUB/toc.ncx",
        manifest: {
          properties: "ncx",
        },
        children: [{
          tag: "?xml",
          closer: "?",
          attributes: {
            version: "1.0",
            encoding: "utf-8",
          },
        }, {
          tag: "!DOCTYPE",
          closer: "",
          attributes: {
            "ncx": true,
            "PUBLIC": true,
            '"-//NISO//DTD ncx 2005-1//EN"': true,
            '"http://www.daisy.org/z3986/2005/ncx-2005-1.dtd"': true,
          },
        }, {
          tag: "ncx",
          attributes: {
            "xmlns:m": "http://www.w3.org/1998/Math/MathML",
            "xmlns": "http://www.daisy.org/z3986/2005/ncx/",
            "version": "2005-1",
            "xml:lang": "en",
          },
          children: [{
            tag: "head",
            children: [{
              tag: "meta",
              closer: " /",
              attributes: {
                name: "dtb:uid",
                content: `urn:uuid:${this._id}`,
              }
            }, {
              tag: "meta",
              closer: " /",
              attributes: {
                name: "dtb:depth",
                content: "1",
              }
            }, {
              tag: "meta",
              closer: " /",
              attributes: {
                name: "dtb:totalPageCount",
                content: "0",
              }
            }, {
              tag: "meta",
              closer: " /",
              attributes: {
                name: "dtb:maxPageNumber",
                content: "0",
              }
            }]
          }, {
            tag: "docTitle",
            children: [{
              tag: "text",
              children: [{
                content: "No Title",
              }]
            }],
          }, {
            tag: "navMap",
          }],
        }]
      },
    }

    this.files = [];

    // Import data
    Object.assign(this, copyObject(obj || {}));

    this.init();
  }
}

/**
 * Convert files to ePubFile
 */
ePubDoc.prototype.init = function() {
  for (let i = 0; i < this.files.length; i++) {
    if (!(this.files[i] instanceof ePubFile)) {
      this.files[i] = new ePubFile(this, this.files[i]);
    }
  }
}

ePubDoc.prototype.generateUUID = function() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, 
        v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

ePubDoc.prototype.update = function(updates) {
  for (const operator of Object.keys(updates)) {
    for (let [keys, value] of Object.entries(updates[operator])) {
      keys = keys.split(".");

      let target = this;
      let key = keys.pop();

      while(typeof target === "object" && keys.length > 0) {
        target = target[keys.shift()];
      }

      if (typeof target !== "object") {
        continue;
      }

      if (operator === "$set") {
        if (target[key] !== value) {
          target[key] = value;
        }
      } else if (operator === "$unset") {
        if (!!value) {
          delete target[key];
        }
      } else if (operator === "$push") {
        target[key].push(value);
      } else if (operator === "$pushAll") {
        target[key].concat(value);
      } else if (operator === "$pull") {
        for (let i = target[key].length; i >= 0; i--) {
          if (target[key][i] === value) {
            target[key].splice(i, 1);
            break;
          }
        }
      } else if (operator === "$pullAll") {
        target[key] = target[key].filter(item => value.indexOf(item) === -1);
      } else if (operator === "$addToSet") {
        if (target[key].indexOf(value) === -1) {
          target[key].push(value);
        }
      } else if (operator === "$addToSetAll") {
        for (const v of value) {
          if (target[key].indexOf(v) === -1) {
            target[key].push(v);
          }
        }
      } 
    }
  }

  this.init();

  return this;
}

// ePubFile methods

/**
 * 
 * @param {object} obj
 * @property {string} path
 * @property {string|undefined} data
 * @property {object|undefined} attributes
 * @param {number|undefined} idx default -1
 * @returns {ePubFile}
 */
ePubDoc.prototype.addFile = function(obj, idx) {
  if (typeof idx !== "number") {
    idx = -1;
  }
  if (idx < 0) {
    idx += this.files.length + 1;
  }
  const file = new ePubFile(this, obj);
  this.files.splice(idx, 0, file);
  return file;
}

ePubDoc.prototype.addText = function(obj, idx) {
  const file = this.addFile(Object.assign({}, this.defaults.text, obj), idx);
  return file;
}

ePubDoc.prototype.addPage = function(obj, idx) {
  const file = this.addFile(Object.assign({}, this.defaults.page, obj), idx);
  return file;
}

ePubDoc.prototype.addStyle = function(obj, idx) {
  const file = this.addFile(Object.assign({}, this.defaults.style, obj), idx);
  return file;
}

ePubDoc.prototype.addScript = function(obj, idx) {
  const file = this.addFile(Object.assign({}, this.defaults.script, obj), idx);
  return file;
}

ePubDoc.prototype.addImage = function(obj, idx) {
  const file = this.addFile(Object.assign({}, this.defaults.image, obj), idx);
  return file;
}

ePubDoc.prototype.addVideo = function(obj, idx) {
  const file = this.addFile(Object.assign({}, this.defaults.video, obj), idx);
  return file;
}

ePubDoc.prototype.addAudio = function(obj, idx) {
  const file = this.addFile(Object.assign({}, this.defaults.audio, obj), idx);
  return file;
}

ePubDoc.prototype.addFont = function(obj, idx) {
  const file = this.addFile(Object.assign({}, this.defaults.font, obj), idx);
  return file;
}

ePubDoc.prototype.addMimetpye = function(obj, idx) {
  const file = this.addFile(Object.assign({}, this.defaults.mimetype, obj), idx);
  return file;
}

ePubDoc.prototype.addContainer = function(obj, idx) {
  const file = this.addFile(Object.assign({}, this.defaults.container, obj), idx);
  return file;
}

ePubDoc.prototype.addPackage = function(obj, idx) {
  const file = this.addFile(Object.assign({}, this.defaults.package, obj), idx);
  return file;
}

ePubDoc.prototype.addNav = function(obj, idx) {
  const file = this.addFile(Object.assign({}, this.defaults.nav, obj), idx);
  return file;
}

ePubDoc.prototype.addNCX = function(obj, idx) {
  const file = this.addFile(Object.assign({}, this.defaults.ncx, obj), idx);
  return file;
}

ePubDoc.prototype.addCover = function(obj, idx) {
  const file = this.addFile(Object.assign({}, this.defaults.cover, obj), idx);
  return file;
}

ePubDoc.prototype.getFile = function(query = {}) {
  const file = this.files.find(item => queryObject(item, query));
  return file;
}

ePubDoc.prototype.getFiles = function(query = {}) {
  const file = this.files.filter(item => queryObject(item, query));
  return file;
}

ePubDoc.prototype.updateFile = function(query = {}, updates) {
  const file = this.getFile(query);
  if (file) {
    file.update(updates);
  }
  return this;
}

ePubDoc.prototype.updateFiles = function(query = {}, updates) {
  const files = this.getFiles(query);
  for (const file of files) {
    file.update(updates);
  }
  return this;
}

ePubDoc.prototype.removeFile = function(query = {}) {
  const file = this.getFile(query);
  if (file) {
    file.remove();
  }
  return this;
}

ePubDoc.prototype.removeFiles = function(query = {}) {
  const files = this.getFiles(query);
  for (const file of files) {
    file.remove();
  }
  return this;
}

// ePubNode methods

ePubDoc.prototype.getChild = function(query = {}) {
  for (const file of this.files) {
    const child = file.getChild(query);
    if (child) {
      return child;
    }
  }
}

ePubDoc.prototype.getChildren = function(query = {}) {
  let result = [];
  for (const file of this.files) {
    const children = file.getChildren(query);
    result = result.concat(children);
  }
  return result;
}

ePubDoc.prototype.updateChild = function(query = {}, updates) {
  const child = this.getChild(query);
  if (child) {
    child.update(updates);
  }
  return this;
}

ePubDoc.prototype.updateChildren = function(query = {}, updates) {
  const children = this.getChildren(query);
  for (const child of children) {
    child.update(updates);
  }
  return this;
}

ePubDoc.prototype.removeChild = function(query = {}) {
  const child = this.getChild(query);
  if (child) {
    child.remove();
  }
  return this;
}

ePubDoc.prototype.removeChildren = function(query = {}) {
  const children = this.getChildren(query);
  for (const child of children) {
    child.remove();
  }
  return this;
}

ePubDoc.prototype.getNode = function(query = {}) {
  for (const file of this.files) {
    const node = file.getNode(query);
    if (node) {
      return node;
    }
  }
}

ePubDoc.prototype.getNodes = function(query = {}) {
  let result = [];
  for (const file of this.files) {
    const nodes = file.getNodes(query);
    result = result.concat(nodes);
  }
  return result;
}

ePubDoc.prototype.updateNode = function(query = {}, updates) {
  const node = this.getNode(query);
  if (node) {
    node.update(updates);
  }
  return this;
}

ePubDoc.prototype.updateNodes = function(query = {}, updates) {
  const nodes = this.getNodes(query);
  for (const node of nodes) {
    node.update(updates);
  }
  return this;
}

ePubDoc.prototype.removeNode = function(query = {}) {
  const node = this.getNode(query);
  if (node) {
    node.remove();
  }
  return this;
}

ePubDoc.prototype.removeNodes = function(query = {}) {
  const nodes = this.getNodes(query);
  for (const node of nodes) {
    node.remove();
  }
  return this;
}

// Export methods

ePubDoc.prototype.toObject = function() {
  const obj = Object.assign({}, this, {
    files: this.files.map(item => item.toObject()),
  });
  return copyObject(obj);
}

ePubDoc.prototype.toFiles = function() {
  const files = this.files.map(item => item.toFile());
  return files;
}

export { ePubDoc }