"use strict";

import { copyObject, generateUUID, isArray, isBoolean, isNull, isNumber, isObject, isObjectArray, isString, isStringArray, queryObject } from "../libs/utils.mjs";
import { ePubFile, ePubNode } from "../index.js";
import { normalizeIndex } from "../libs/utilities.js";

class ePubDoc {
  constructor(obj) {
    this.files = [
      this.createMimetype(),
      this.createContainer(),
      this.createPackage(),
    ];

    // Import data
    if (isObject(obj)) {
      Object.assign(this, copyObject(obj));
    }

    this.init();
  }
}
/**
 * 
 * @returns 
 */
ePubDoc.prototype.init = function() {
  // Convert files to ePubFile
  if (isArray(this.files)) {
    for (let i = 0; i < this.files.length; i++) {
      if (this.files[i] instanceof ePubFile) {
        // ...
      } else if (isObject(this.files[i])) {
        this.files[i] = this.createFile(this.files[i]);
      }
      this.files[i].document = this;
      this.files[i].init();
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
  if (isObject(updates)) {
    for (const operator of Object.keys(updates)) {
      for (let [keys, value] of Object.entries(updates[operator])) {
        keys = keys.split(".");
  
        let target = this,
            key = keys.pop();
  
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
  }
  
  this.init();

  return this;
}
/**
 * 
 * @param {ePubFile|object} file
 * @returns 
 */
ePubDoc.prototype.appendChild = function(file) {
  this.files.push(file);
  this.init();
  return this;
}
/**
 * 
 * @param {ePubFile[]|object[]} files 
 * @returns 
 */
ePubDoc.prototype.appendChildren = function(files) {
  this.files = this.files.concat(files);
  this.init();
  return this;
}
/**
 * 
 * @param {ePubFile|object} file
 * @returns 
 */
ePubDoc.prototype.prependChild = function(file) {
  this.files.unshift(file);
  this.init();
  return this;
}
/**
 * 
 * @param {ePubFile[]|object[]} files
 * @returns 
 */
ePubDoc.prototype.prependChildren = function(files) {
  this.files = [].concat(files, this.files);
  this.init();
  return this;
}
/**
 * 
 * @param {ePubFile|object} file
 * @param {number} idx - Default value is -1
 * @returns 
 */
ePubDoc.prototype.insertChild = function(file, idx) {
  idx = normalizeIndex(this.files.length, idx);
  this.files.splice(idx, 0, file);
  this.init();
  return this;
}
/**
 * 
 * @param {ePubFile[]|object[]} files
 * @param {number} idx - Default value is -1
 * @returns 
 */
ePubDoc.prototype.insertChildren = function(files, idx) {
  idx = normalizeIndex(this.files.length, idx);
  this.files.splice(idx, 0, ...files);
  this.init();
  return this;
}
/**
 * 
 * @param {object} obj
 * @property {string} _id - Default value is UUID
 * @property {string} path - Required
 * @property {string} data 
 * @property {string} encoding - "base64", "utf8", 
 * @property {object[]} children 
 * @property {object} attributes
 * @returns {ePubFile}
 */
ePubDoc.prototype.createFile = function(obj) {
  return new ePubFile(obj);
}
/**
 * 
 * @param {object[]} arr
 * @property {string} _id - Default value is UUID
 * @property {string} path - Required
 * @property {string} data 
 * @property {string} encoding - "base64", "utf8", 
 * @property {object[]} children 
 * @property {object} attributes
 * @returns {ePubFile}
 */
ePubDoc.prototype.createFiles = function(arr) {
  let result = [];
  for (const obj of arr) {
    result.push(new ePubFile(obj));
  }
  return result;
}
/**
 * 
 * @param {object} obj
 * @property {string} path
 * @property {string} data 
 * @returns {ePubFile}
 */
ePubDoc.prototype.createText = function(obj) {
  if (!isObject(obj)) {
    obj = {};
  }
  return this.createFile(Object.assign({
    encoding: "utf8",
  }, obj));
}
/**
 * 
 * @param {object} obj
 * @property {string} path
 * @property {string} data 
 * @returns {ePubFile}
 */
ePubDoc.prototype.createStyle = function(obj) {
  if (!isObject(obj)) {
    obj = {};
  }
  return this.createFile(Object.assign({
    encoding: "utf8",
  }, obj));
}
/**
 * 
 * @param {object} obj
 * @property {string} path
 * @property {string} data 
 * @returns {ePubFile}
 */
ePubDoc.prototype.createScript = function(obj) {
  if (!isObject(obj)) {
    obj = {};
  }
  return this.createFile(Object.assign({
    encoding: "utf8",
  }, obj));
}
/**
 * 
 * @param {object} obj
 * @property {string} path
 * @property {string} data "<div></div>"
 * @property {array} children 
 * @property {object} attributes
 * @returns {ePubFile}
 */
ePubDoc.prototype.createPage = function(obj) {
  if (!isObject(obj)) {
    obj = {};
  }
  return this.createFile(Object.assign({
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
        "html": true,
      },
    }, {
      tag: "html",
      attributes: {
        "xmlns": "http://www.w3.org/1999/xhtml",
        "xmlns:epub": "http://www.idpf.org/2007/ops",
        "xml:lang": null,
        "lang": null,
        "dir": null,
      },
      children: [{
        tag: "head",
        children: [{
          tag: "title",
          children: [{
            content: "",
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
  }, obj));
}
/**
 * 
 * @param {object} obj
 * @property {string} path
 * @property {string} data 
 * @returns {ePubFile}
 */
ePubDoc.prototype.createImage = function(obj) {
  if (!isObject(obj)) {
    obj = {};
  }
  return this.createFile(Object.assign({
    encoding: "base64",
  }, obj));
}
/**
 * 
 * @param {object} obj
 * @property {string} path
 * @property {string} data 
 * @returns {ePubFile}
 */
ePubDoc.prototype.createAudio = function(obj) {
  if (!isObject(obj)) {
    obj = {};
  }
  return this.createFile(Object.assign({
    encoding: "base64",
  }, obj));
}
/**
 * 
 * @param {object} obj
 * @property {string} path
 * @property {string} data 
 * @returns {ePubFile}
 */
ePubDoc.prototype.createVideo = function(obj) {
  if (!isObject(obj)) {
    obj = {};
  }
  return this.createFile(Object.assign({
    encoding: "base64",
  }, obj));
}
/**
 * 
 * @param {object} obj
 * @property {string} path
 * @property {string} data 
 * @returns {ePubFile}
 */
ePubDoc.prototype.createFont = function(obj) {
  if (!isObject(obj)) {
    obj = {};
  }
  return this.createFile(Object.assign({
    encoding: "base64",
  }, obj));
}
/**
 * 
 * @param {object} obj
 * @returns {ePubFile}
 */
ePubDoc.prototype.createMimetype = function(obj) {
  if (!isObject(obj)) {
    obj = {};
  }
  return this.createFile(Object.assign({
    encoding: "utf8",
    path: "mimetype",
    data: "application/epub+zip",
  }, obj));
}
/**
 * 
 * @param {object} obj
 * @returns {ePubFile}
 */
ePubDoc.prototype.createContainer = function(obj) {
  if (!isObject(obj)) {
    obj = {};
  }
  return this.createFile(Object.assign({
    encoding: "utf8",
    path: "META-INF/container.xml",
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
          },
        }]
      }]
    }],
  }, obj));
}
/**
 * 
 * @param {object} obj
 * @returns {ePubFile}
 */
ePubDoc.prototype.createPackage = function(obj) {
  if (!isObject(obj)) {
    obj = {};
  }
  return this.createFile(Object.assign({
    encoding: "utf8",
    path: "EPUB/package.opf",
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
        "xml:lang": null,
        // https://www.w3.org/TR/epub-33/#attrdef-dir
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
            "id": "bookid",
          },
          children: [{
            content: "urn:uuid:"+generateUUID(),
          }],
        }, {
          tag: "dc:language",
          children: [{
            content: "en",
          }],
        }, {
          tag: "dc:title",
          attributes: {
            "id": "title",
          },
          children: [{
            content: "Untitled",
          }],
        }, {
          tag: "meta",
          attributes: {
            "property": "dcterms:modified",
          },
          children: [{
            content: new Date().toISOString(),
          }],
        },
        // Example
        // {
        //   tag: "meta",
        //   attributes: {
        //     property: "rendition:layout",
        //   },
        //   children: [{
        //     content: "pre-paginated"|"reflowable"
        //   }]
        // }, {
        //   tag: "meta",
        //   attributes: {
        //     property: "rendition:orientation",
        //   },
        //   children: [{
        //     content: "auto"|"landscape"|"portrait"
        //   }]
        // }, {
        //   tag: "meta",
        //   attributes: {
        //     property: "rendition:spread",
        //   },
        //   children: [{
        //     content: "auto"|"both"|"landscape"|"none"
        //   }]
        // }
        ],
      }, {
        tag: "manifest",
      }, {
        tag: "spine",
        attributes: {
          // https://www.w3.org/TR/epub-33/#attrdef-spine-page-progression-direction
          "page-progression-direction": null,
        },
      }],
    }],
  }, obj));
}
/**
 * 
 * @param {object} obj
 * @returns {ePubFile}
 */
ePubDoc.prototype.createNav = function(obj) {
  if (!isObject(obj)) {
    obj = {};
  }
  return this.createFile(Object.assign({
    encoding: "utf8",
    path: "EPUB/nav.xhtml",
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
        "xml:lang": null,
        "lang": null,
        "dir": null,
      },
      children: [{
        tag: "head",
        children: [{
          tag: "title",
          children: [{
            content: "Untitled",
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
  }, obj));
}
/**
 * 
 * @param {object} obj
 * @returns {ePubFile}
 */
ePubDoc.prototype.createNCX = function(obj) {
  if (!isObject(obj)) {
    obj = {};
  }
  return this.createFile(Object.assign({
    encoding: "utf8",
    path: "EPUB/toc.ncx",
    children: [{
      tag: "?xml",
      closer: "?",
      attributes: {
        "version": "1.0",
        "encoding": "utf-8",
      },
    }, {
      tag: "ncx",
      attributes: {
        "xmlns:m": "http://www.w3.org/1998/Math/MathML",
        "xmlns": "http://www.daisy.org/z3986/2005/ncx/",
        "version": "2005-1",
        "xml:lang": null,
      },
      children: [{
        tag: "head",
        children: [{
          tag: "meta",
          closer: " /",
          attributes: {
            "name": "dtb:uid",
            "content": "",
          },
        }, {
          tag: "meta",
          closer: " /",
          attributes: {
            "name": "dtb:depth",
            "content": "1",
          },
        }, {
          tag: "meta",
          closer: " /",
          attributes: {
            "name": "dtb:totalPageCount",
            "content": "0",
          },
        }, {
          tag: "meta",
          closer: " /",
          attributes: {
            "name": "dtb:maxPageNumber",
            "content": "0",
          },
        }]
      }, {
        tag: "docTitle",
        children: [{
          tag: "text",
          children: [{
            "content": "Untitled",
          }]
        }],
      }, {
        tag: "navMap",
      }],
    }]
  }, obj));
}

ePubDoc.prototype.findFile = function(query) {
  return this.files.find(item => queryObject(item, query));
}

ePubDoc.prototype.findFiles = function(query) {
  return this.files.filter(item => queryObject(item, query));
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

/**
 * 
 * @param {object} obj
 * @property {string} _id - Default value is UUID
 * @property {string|null} tag - Required
 * @property {string|null} closer - "/"
 * @property {string} content - You must set the tag to null
 * @property {object} attributes
 * @property {object[]} children 
 * @returns {ePubNode}
 */
ePubDoc.prototype.createNode = function(obj) {
  return new ePubNode(obj);
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

ePubDoc.prototype.appendFile = ePubDoc.prototype.appendChild;
ePubDoc.prototype.appendFiles = ePubDoc.prototype.appendChildren;
ePubDoc.prototype.prependFile = ePubDoc.prototype.prependChild;
ePubDoc.prototype.prependFiles = ePubDoc.prototype.prependChildren;
ePubDoc.prototype.insertFile = ePubDoc.prototype.insertChild;
ePubDoc.prototype.insertFiles = ePubDoc.prototype.insertChildren;

export { ePubDoc }