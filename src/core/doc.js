"use strict";

import { copyObject, generateUUID, isArray, isBoolean, isNull, isNumber, isObject, isObjectArray, isString, isStringArray, queryObject } from "../libs/utils.mjs";
import { ePubFile, ePubNode } from "../index.js";

class ePubDoc {
  constructor(obj) {
    // Required
    this._id = generateUUID();
    this.language = "en";
    this.title = "No Title";
    this.authors = ["Anonymous"];
    this.updatedAt = Date.now();
    this.files = [];

    // Optional
    this.createdAt = null;
    this.textDirection = null;
    this.pageDirection = null;
    this.rendition = {
      layout: null,
      orientation: null,
      spread: null,
    }

    // Import data
    Object.assign(this, copyObject(obj || {}));

    this.init();
  }
}
/**
 * 
 * @returns 
 */
ePubDoc.prototype.init = function() {
  this.validate();

  // Convert files to ePubFile
  for (let i = 0; i < this.files.length; i++) {
    if (this.files[i] instanceof ePubFile) {
      this.files[i].init();
    } else {
      this.files[i] = new ePubFile(this, this.files[i]);
    }
  }

  return this;
}
/**
 * 
 * @returns 
 */
ePubDoc.prototype.validate = function() {
  if (!isString(this._id)) {
    throw new Error("_id must be a string");
  }
  if (!isString(this.language)) {
    throw new Error("language must be a string");
  }
  if (!isString(this.title)) {
    throw new Error("title must be a string");
  }
  if (!isStringArray(this.authors)) {
    throw new Error("authors must be a string-array");
  }
  if (!isNumber(this.updatedAt)) {
    throw new Error("updatedAt must be a number");
  }
  if (!isNumber(this.createdAt) && !isNull(this.createdAt)) {
    throw new Error("createdAt must be a number or null");
  }
  if (!isString(this.textDirection) && !isNull(this.textDirection)) {
    throw new Error("textDirection must be a string or null");
  }
  if (!isString(this.pageDirection) && !isNull(this.pageDirection)) {
    throw new Error("pageDirection must be a string or null");
  }
  if (!isObject(this.rendition)) {
    throw new Error("rendition must be a object");
  }
  if (!isArray(this.files)) {
    throw new Error("files must be a array");
  }
  for (const file of this.files) {
    if (!(file instanceof ePubFile) && !isObject(file)) {
      throw new Error("files[] elements must be ePubFile or object");
    }
  }
  return this;
}
/**
 * 
 * @param {object} updates 
 * @returns 
 */
ePubDoc.prototype.update = function(updates) {
  for (const operator of Object.keys(updates)) {
    for (let [keys, value] of Object.entries(updates[operator])) {
      keys = keys.split(".");

      let target = this;
      let key = keys.pop();

      while(isObject(target) && keys.length > 0) {
        target = target[keys.shift()];
      }

      if (!isObject(target)) {
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
/**
 * 
 * @param {object} obj
 * @property {string} type
 * @property {string} path
 * @property {string|undefined} data 
 * @property {object|undefined} manifest
 * @property {object|undefined} spine
 * @property {object|undefined} attributes
 * @param {number|undefined} idx default -1
 * @returns {ePubFile}
 */
ePubDoc.prototype.appendFile = function(obj, idx) {
  if (!isNumber(idx)) {
    idx = -1;
  }
  if (idx < 0) {
    idx += this.files.length + 1;
  }
  const file = new ePubFile(this, obj);
  this.files.splice(idx, 0, file);
  return file;
}
/**
 * 
 * @param {object[]} arr
 * @property {string} type
 * @property {string} path
 * @property {string|undefined} data 
 * @property {object|undefined} manifest
 * @property {object|undefined} spine
 * @property {object|undefined} attributes
 * @param {number|undefined} idx default -1
 * @returns {ePubFile}
 */
ePubDoc.prototype.appendFiles = function(arr, idx) {
  if (!isNumber(idx)) {
    idx = -1;
  }
  if (idx < 0) {
    idx += this.files.length + 1;
  }
  const result = [];
  for (const item of arr) {
    result.push(this.appendFile(item, idx));
    idx++;
  }
  return result;
}
/**
 * 
 * @param {object} obj
 * @property {string} path
 * @property {string} data 
 * @property {object|undefined} manifest
 * @property {object|undefined} attributes
 * @param {number|undefined} idx default -1
 * @returns {ePubFile}
 */
ePubDoc.prototype.appendText = function(obj, idx) {
  const file = this.appendFile(Object.assign({
    manifest: {},
    encoding: "utf8",
  }, obj || {}), idx);

  return file;
}
/**
 * 
 * @param {object} obj
 * @property {string} path
 * @property {array|undefined} children 
 * @property {object|undefined} manifest
 * @property {object|undefined} spine
 * @property {object|undefined} attributes
 * @param {number|undefined} idx default -1
 * @returns {ePubFile}
 */
ePubDoc.prototype.appendPage = function(obj, idx) {
  const file = this.appendFile(Object.assign({
    manifest: {},
    spine: {},
    tag: null,
    closer: null,
    content: null,
    children: [{
      tag: "?xml",
      closer: "?",
      attributes: {
        "version": "1.0",
        "encoding": "utf-8",
      },
    }, {
      tag: "!DOCTYPE",
      closer: "",
      attributes: {
        "html": true,
      },
    }, {
      tag: "html",
      attributes: {
        "xmlns": "http://www.w3.org/1999/xhtml",
        "xmlns:epub": "http://www.idpf.org/2007/ops",
        "xml:lang": this.language,
        "lang": this.language,
        "dir": this.textDirection,
      },
      children: [{
        tag: "head",
        children: [{
          tag: "title",
          children: [{
            content: this.title,
          }]
        }, {
          tag: "meta",
          closer: " /",
          attributes: {
            "charset": "utf-8",
          }
        }],
      }, {
        tag: "body",
      }],
    }],
    encoding: "utf8",
  }, obj || {}), idx);

  return file;
}
/**
 * 
 * @param {object} obj
 * @property {string} path
 * @property {string} data 
 * @property {object|undefined} manifest
 * @property {object|undefined} attributes
 * @param {number|undefined} idx default -1
 * @returns {ePubFile}
 */
ePubDoc.prototype.appendStyle = function(obj, idx) {
  const file = this.appendFile(Object.assign({
    manifest: {},
    encoding: "utf8",
  }, obj || {}), idx);

  return file;
}
/**
 * 
 * @param {object} obj
 * @property {string} path
 * @property {string} data 
 * @property {object|undefined} manifest
 * @property {object|undefined} attributes
 * @param {number|undefined} idx default -1
 * @returns {ePubFile}
 */
ePubDoc.prototype.appendScript = function(obj, idx) {
  const file = this.appendFile(Object.assign({
    manifest: {},
    encoding: "utf8",
  }, obj || {}), idx);

  return file;
}
/**
 * 
 * @param {object} obj
 * @property {string} path
 * @property {string} data 
 * @property {object|undefined} manifest
 * @property {object|undefined} attributes
 * @param {number|undefined} idx default -1
 * @returns {ePubFile}
 */
ePubDoc.prototype.appendImage = function(obj, idx) {
  const file = this.appendFile(Object.assign({
    manifest: {},
    encoding: "base64",
  }, obj || {}), idx);

  return file;
}
/**
 * 
 * @param {object} obj
 * @property {string} path
 * @property {string} data 
 * @property {object|undefined} manifest
 * @property {object|undefined} attributes
 * @param {number|undefined} idx default -1
 * @returns {ePubFile}
 */
ePubDoc.prototype.appendAudio = function(obj, idx) {
  const file = this.appendFile(Object.assign({
    manifest: {},
    encoding: "base64",
  }, obj || {}), idx);

  return file;
}
/**
 * 
 * @param {object} obj
 * @property {string} path
 * @property {string} data 
 * @property {object|undefined} manifest
 * @property {object|undefined} attributes
 * @param {number|undefined} idx default -1
 * @returns {ePubFile}
 */
ePubDoc.prototype.appendVideo = function(obj, idx) {
  const file = this.appendFile(Object.assign({
    manifest: {},
    encoding: "base64",
  }, obj || {}), idx);

  return file;
}
/**
 * 
 * @param {object} obj
 * @property {string} path
 * @property {string} data 
 * @property {object|undefined} manifest
 * @property {object|undefined} attributes
 * @param {number|undefined} idx default -1
 * @returns {ePubFile}
 */
ePubDoc.prototype.appendFont = function(obj, idx) {
  const file = this.appendFile(Object.assign({
    manifest: {},
    encoding: "base64",
  }, obj || {}), idx);

  return file;
}
/**
 * 
 * @param {object} obj
 * @param {number|undefined} idx default -1
 * @returns {ePubFile}
 */
ePubDoc.prototype.appendMimetpye = function(obj, idx) {
  const file = this.appendFile(Object.assign({
    path: "mimetype",
    data: "application/epub+zip",
    encoding: "utf8",
  }, obj || {}), idx);

  return file;
}
/**
 * 
 * @param {object} obj
 * @param {number|undefined} idx default -1
 * @returns {ePubFile}
 */
ePubDoc.prototype.appendContainer = function(obj, idx) {
  const file = this.appendFile(Object.assign({
    path: "META-INF/container.xml",
    encoding: "utf8",
    children: [{
      tag: "?xml",
      closer: "?",
      attributes: {
        "version": "1.0",
        "encoding": "utf-8",
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
  }, obj || {}), idx);
  
  return file;
}
/**
 * 
 * @param {object} obj
 * @param {number|undefined} idx default -1
 * @returns {ePubFile}
 */
ePubDoc.prototype.appendPackage = function(obj, idx) {
  const file = this.appendFile(Object.assign({
    path: "EPUB/package.opf",
    encoding: "utf8",
    children: [{
      tag: "?xml",
      closer: "?",
      attributes: {
        "version": "1.0",
        "encoding": "utf-8",
      },
    }, {
      tag: "package",
      attributes: {
        "xmlns": "http://www.idpf.org/2007/opf",
        "version": "3.0",
        "unique-identifier": "bookid",
        "xml:lang": this.language,
        "dir": this.textDirection,
      },
      children: [{
        tag: "metadata",
        attributes: {
          "xmlns:opf": "http://www.idpf.org/2007/opf",
          "xmlns:dc": "http://purl.org/dc/elements/1.1/",
          "xmlns:dcterms": "http://purl.org/dc/terms/",
        },
        children: [
          {
            tag: "dc:identifier",
            attributes: {
              "id": "bookid",
            },
            children: [{
              content: this._id,
            }],
          }, {
            tag: "dc:language",
            children: [{
              content: this.language,
            }],
          }, {
            tag: "dc:title",
            attributes: {
              "id": `title`,
            },
            children: [{
              content: this.title,
            }],
          },
          ...(
            this.authors.map((item, i) => {
              return {
                tag: "dc:creator",
                attributes: {
                  "id": `author-${i}`,
                },
                children: [{
                  content: item,
                }],
              }
            })
          ),
          ...(
            isNumber(this.createdAt) ? [{
              tag: "dc:date",
              children: [{
                content: new Date(this.createdAt).toISOString(),
              }],
            }] : []
          ),
          {
            tag: "meta",
            attributes: {
              "property": "dcterms:modified",
            },
            children: [{
              content: new Date(this.updatedAt).toISOString(),
            }],
          },
          ...Object.entries(this.rendition)
            .filter((key, value) => {
              return isString(value);
            })
            .map(([key, value]) => {
              return {
                tag: "meta",
                attributes: {
                  property: `rendition:${key}`,
                },
                children: [{
                  content: value,
                }],
              }
            })
        ],
      }, {
        tag: "manifest",
      }, {
        tag: "spine",
        attributes: {
          // Set page direction value to "ltr" or "rtl"
          "page-progression-direction": this.pageDirection,
        },
      }],
    }],
  }, obj || {}), idx);

  return file;
}
/**
 * 
 * @param {object} obj
 * @property {string} path
 * @param {number|undefined} idx default -1
 * @returns {ePubFile}
 */
ePubDoc.prototype.appendNav = function(obj, idx) {
  const file = this.appendFile(Object.assign({
    path: "EPUB/nav.xhtml",
    manifest: {
      properties: "nav",
    },
    spine: {
      linear: "yes",
    },
    encoding: "utf8",
    tag: null,
    closer: null,
    content: null,
    children: [{
      tag: "?xml",
      closer: "?",
      attributes: {
        "version": "1.0",
        "encoding": "utf-8",
      },
    }, {
      tag: "!DOCTYPE",
      closer: "",
      attributes: {
        "html": true,
      },
    }, {
      tag: "html",
      attributes: {
        "xmlns": "http://www.w3.org/1999/xhtml",
        "xmlns:epub": "http://www.idpf.org/2007/ops",
        "xml:lang": this.language,
        "lang": this.language,
        "dir": this.textDirection,
      },
      children: [{
        tag: "head",
        children: [{
          tag: "title",
          children: [{
            content: this.title,
          }]
        }, {
          tag: "meta",
          closer: " /",
          attributes: {
            "charset": "utf-8",
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
          },
          children: [{
            tag: "h2",
            children: [{
              content: "Landmarks"
            }]
          }, {
            tag: "ol",
            children: [{
              tag: "li",
              children: [{
                tag: "a",
                attributes: {
                  "epub:type": "toc",
                  "href": "#toc",
                },
                children: [{
                  content: "Table of Contents",
                }]
              }]
            }]
          }]
        }],
      }],
    }],
  }, obj || {}), idx);

  return file;
}
/**
 * 
 * @param {object} obj
 * @property {string} path
 * @param {number|undefined} idx default -1
 * @returns {ePubFile}
 */
ePubDoc.prototype.appendNCX = function(obj, idx) {
  const file = this.appendFile(Object.assign({
    path: "EPUB/toc.ncx",
    manifest: {
      properties: "ncx",
    },
    encoding: "utf8",
    children: [{
      tag: "?xml",
      closer: "?",
      attributes: {
        "version": "1.0",
        "encoding": "utf-8",
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
        "xml:lang": this.language,
      },
      children: [{
        tag: "head",
        children: [{
          tag: "meta",
          closer: " /",
          attributes: {
            "name": "dtb:uid",
          },
          children: [{
            "content": this._id,
          }],
        }, {
          tag: "meta",
          closer: " /",
          attributes: {
            "name": "dtb:depth",
          },
          children: [{
            "content": "1",
          }],
        }, {
          tag: "meta",
          closer: " /",
          attributes: {
            "name": "dtb:totalPageCount",
          },
          children: [{
            "content": "0",
          }],
        }, {
          tag: "meta",
          closer: " /",
          attributes: {
            "name": "dtb:maxPageNumber",
          },
          children: [{
            "content": "0",
          }],
        }]
      }, {
        tag: "docTitle",
        children: [{
          tag: "text",
          children: [{
            "content": this.title,
          }]
        }],
      },
      ...(
        this.authors.map((item, i) => {
          return {
            tag: "docAuthor",
            children: [{
              tag: "text",
              chlidren: [{
                content: item,
              }]
            }]
          }
        })
      ),
      {
        tag: "navMap",
      }],
    }]
  }, obj || {}), idx);
  
  return file;
}
/**
 * 
 * @param {object} obj
 * @property {string} path
 * @property {string} data base64
 * @param {number|undefined} idx default -1
 * @returns {ePubFile}
 */
ePubDoc.prototype.appendCover = function(obj, idx) {
  const file = this.appendFile(Object.assign({
    manifest: {
      properties: "cover-image",
    },
    encoding: "base64",
  }, obj || {}), idx);

  return file;
}

ePubDoc.prototype.findFile = function(query) {
  const file = this.files.find(item => queryObject(item, query));
  return file;
}

ePubDoc.prototype.findFiles = function(query) {
  const file = this.files.filter(item => queryObject(item, query));
  return file;
}

ePubDoc.prototype.updateFile = function(query, updates) {
  const file = this.findFile(query);
  if (file) {
    file.update(updates);
  }
  return this;
}

ePubDoc.prototype.updateFiles = function(query, updates) {
  const files = this.findFiles(query);
  for (const file of files) {
    file.update(updates);
  }
  return this;
}

ePubDoc.prototype.removeFile = function(query) {
  const file = this.findFile(query);
  if (file) {
    file.remove();
  }
  return this;
}

ePubDoc.prototype.removeFiles = function(query) {
  const files = this.findFiles(query);
  for (const file of files) {
    file.remove();
  }
  return this;
}

ePubDoc.prototype.findChild = function(query) {
  for (const file of this.files) {
    const child = file.findChild(query);
    if (child) {
      return child;
    }
  }
}

ePubDoc.prototype.findChildren = function(query) {
  let result = [];
  for (const file of this.files) {
    const children = file.findChildren(query);
    result = result.concat(children);
  }
  return result;
}

ePubDoc.prototype.updateChild = function(query, updates) {
  const child = this.findChild(query);
  if (child) {
    child.update(updates);
  }
  return this;
}

ePubDoc.prototype.updateChildren = function(query, updates) {
  const children = this.findChildren(query);
  for (const child of children) {
    child.update(updates);
  }
  return this;
}

ePubDoc.prototype.removeChild = function(query) {
  const child = this.findChild(query);
  if (child) {
    child.remove();
  }
  return this;
}

ePubDoc.prototype.removeChildren = function(query) {
  const children = this.findChildren(query);
  for (const child of children) {
    child.remove();
  }
  return this;
}

ePubDoc.prototype.findNode = function(query) {
  for (const file of this.files) {
    const node = file.findNode(query);
    if (node) {
      return node;
    }
  }
}

ePubDoc.prototype.findNodes = function(query) {
  let result = [];
  for (const file of this.files) {
    const nodes = file.findNodes(query);
    result = result.concat(nodes);
  }
  return result;
}

ePubDoc.prototype.updateNode = function(query, updates) {
  const node = this.findNode(query);
  if (node) {
    node.update(updates);
  }
  return this;
}

ePubDoc.prototype.updateNodes = function(query, updates) {
  const nodes = this.findNodes(query);
  for (const node of nodes) {
    node.update(updates);
  }
  return this;
}

ePubDoc.prototype.removeNode = function(query) {
  const node = this.findNode(query);
  if (node) {
    node.remove();
  }
  return this;
}

ePubDoc.prototype.removeNodes = function(query) {
  const nodes = this.findNodes(query);
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