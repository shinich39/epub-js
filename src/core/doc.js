"use strict";

import { copyObject, generateUUID, isArray, isBoolean, isNull, isNumber, isObject, isObjectArray, isString, isStringArray, queryObject } from "../libs/utils.mjs";
import { ePubFile, ePubNode } from "../index.js";

class ePubDoc {
  constructor(obj) {
    this.files = [{
      path: "mimetype",
      data: "application/epub+zip",
      encoding: "utf8",
    }, {
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
            },
          }]
        }]
      }],
    }, {
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
          }],
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
    }];

    // Import data
    Object.assign(this, copyObject(isObject(obj) ? obj : {}));

    this.preValidate();
    this.init();
    this.postValidate();
  }
}
/**
 * 
 * @returns 
 */
ePubDoc.prototype.init = function() {
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
ePubDoc.prototype.preValidate = function() {
  if (!isArray(this.files)) {
    throw new Error("files must be a array");
  }
  for (const file of this.files) {
    if (!(file instanceof ePubFile) && !isObject(file)) {
      throw new Error("files[] elements must be ePubFile");
    }
  }
  return this;
}
/**
 * 
 * @returns 
 */
ePubDoc.prototype.postValidate = function() {
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
  
  this.preValidate();
  this.init();
  this.postValidate();

  return this;
}
/**
 * 
 * @param {object} obj
 * @property {string} type
 * @property {string} path
 * @property {string|undefined} data 
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
 * @property {object|undefined} attributes
 * @param {number|undefined} idx - default -1
 * @returns {ePubFile}
 */
ePubDoc.prototype.appendFiles = function(arr, idx) {
  if (!isNumber(idx)) {
    idx = -1;
  }
  if (idx < 0) {
    idx += this.files.length + 1;
  }
  let result = [];
  for (const obj of arr) {
    result.push(this.appendFile(obj, idx));
    idx++;
  }
  return result;
}
/**
 * 
 * @param {object} obj
 * @property {string} path
 * @property {string} data 
 * @property {object|undefined} attributes
 * @param {number|undefined} idx default -1
 * @returns {ePubFile}
 */
ePubDoc.prototype.appendText = function(obj, idx) {
  const file = this.appendFile(Object.assign({
    encoding: "utf8",
  }, isObject(obj) ? obj : {}), idx);

  return file;
}
/**
 * 
 * @param {object} obj
 * @property {string} path
 * @property {array|undefined} children 
 * @property {object|undefined} attributes
 * @param {number|undefined} idx default -1
 * @returns {ePubFile}
 */
ePubDoc.prototype.appendPage = function(obj, idx) {
  const file = this.appendFile(Object.assign({
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
    encoding: "utf8",
  }, isObject(obj) ? obj : {}), idx);

  return file;
}
/**
 * 
 * @param {object} obj
 * @property {string} path
 * @property {string} data 
 * @property {object|undefined} attributes
 * @param {number|undefined} idx default -1
 * @returns {ePubFile}
 */
ePubDoc.prototype.appendStyle = function(obj, idx) {
  const file = this.appendFile(Object.assign({
    encoding: "utf8",
  }, isObject(obj) ? obj : {}), idx);

  return file;
}
/**
 * 
 * @param {object} obj
 * @property {string} path
 * @property {string} data 
 * @property {object|undefined} attributes
 * @param {number|undefined} idx default -1
 * @returns {ePubFile}
 */
ePubDoc.prototype.appendScript = function(obj, idx) {
  const file = this.appendFile(Object.assign({
    encoding: "utf8",
  }, isObject(obj) ? obj : {}), idx);

  return file;
}
/**
 * 
 * @param {object} obj
 * @property {string} path
 * @property {string} data 
 * @property {object|undefined} attributes
 * @param {number|undefined} idx default -1
 * @returns {ePubFile}
 */
ePubDoc.prototype.appendImage = function(obj, idx) {
  const file = this.appendFile(Object.assign({
    encoding: "base64",
  }, isObject(obj) ? obj : {}), idx);

  return file;
}
/**
 * 
 * @param {object} obj
 * @property {string} path
 * @property {string} data 
 * @property {object|undefined} attributes
 * @param {number|undefined} idx default -1
 * @returns {ePubFile}
 */
ePubDoc.prototype.appendAudio = function(obj, idx) {
  const file = this.appendFile(Object.assign({
    encoding: "base64",
  }, isObject(obj) ? obj : {}), idx);

  return file;
}
/**
 * 
 * @param {object} obj
 * @property {string} path
 * @property {string} data 
 * @property {object|undefined} attributes
 * @param {number|undefined} idx default -1
 * @returns {ePubFile}
 */
ePubDoc.prototype.appendVideo = function(obj, idx) {
  const file = this.appendFile(Object.assign({
    encoding: "base64",
  }, isObject(obj) ? obj : {}), idx);

  return file;
}
/**
 * 
 * @param {object} obj
 * @property {string} path
 * @property {string} data 
 * @property {object|undefined} attributes
 * @param {number|undefined} idx default -1
 * @returns {ePubFile}
 */
ePubDoc.prototype.appendFont = function(obj, idx) {
  const file = this.appendFile(Object.assign({
    encoding: "base64",
  }, isObject(obj) ? obj : {}), idx);

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
  }, isObject(obj) ? obj : {}), idx);

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
          },
        }]
      }]
    }],
  }, isObject(obj) ? obj : {}), idx);
  
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
  }, isObject(obj) ? obj : {}), idx);

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
  }, isObject(obj) ? obj : {}), idx);

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
    encoding: "utf8",
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
  }, isObject(obj) ? obj : {}), idx);
  
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