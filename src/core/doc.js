"use strict";

import { objToAttr, dateToISOString, beautifyHTML, normalizeBase64 } from "../libs/utilities.js";
import { toObj, toStr } from "../libs/dom.mjs";
import { queryObject } from "../libs/utils.mjs";
import { ePubNode } from "./node.js";
import { ePubFile } from "./file.js";

class ePubDoc {
  constructor(obj) {
    const now = new Date();

    this._uniq = 0;
    this._id = this.generateId();

    // TODO: add more files
    // META-INF/encryption.xml
    // META-INF/manifest.xml
    // META-INF/metadata.xml
    // META-INF/rights.xml
    // META-INF/signatures.xml

    // Deprecated
    // this._mimetypePath = "mimetype";
    // this._mimetypeData = "application/epub+zip";
    // this._containerPath = "META-INF/container.xml";
    // this._packagePath = "EPUB/package.opf";
    // this._packageType = "application/oebps-package+xml";
    // this._ncxPath = "EPUB/nav.ncx";
    // this._navPath = "EPUB/nav.xhtml";
    // this._coverPath = "EPUB/cover.xhtml";
    
    // ePub2 compatibility
    // Use NCX navigation
    this.legacy = false;

    // Beatify HTML, CSS, JS
    this.beautify = true;

    // Encrypt filenames
    this.encrypt = false;

    // Default options of ePubFile
    this.defaults = {
      text: {
        type: "text",
        encoding: "utf8",
      },
      page: {
        type: "page",
        spine: {},
        tag: null,
        closer: null,
        content: null,
        children: [],
        encoding: "utf8",
      },
      style: {
        type: "style",
        encoding: "utf8",
      },
      script: {
        type: "script",
        encoding: "utf8",
      },
      image: {
        type: "image",
        encoding: "base64",
      },
      audio: {
        type: "audio",
        encoding: "base64",
      },
      video: {
        type: "video",
        encoding: "base64",
      },
      font: {
        type: "font",
        fontFamily: "font-name",
        fontStyle: "normal",
        fontWeight: "normal",
        encoding: "base64",
      },
    }

    // ePub options
    this.title = "No Title";
    this.authors = ["Anonymous"];
    this.category = "No Category";
    this.tags = ["Created by epub-js"];
    this.publisher = "No Publisher";
    this.language = "en";
    /**
     * "ltr", "rtl", "auto"
     */
    this.textDirection = "auto";
    /**
     * "ltr", "rtl"
     */
    this.pageDirection = null;

    /**
     * https://www.w3.org/TR/epub-33/#layout  
     * layout: "pre-paginated", "reflowable"  
     * orientation: "landscape", "portrait", "auto"  
     * spread: "none", "landscape", "both", "auto"  
     * flow: "paginated", "scrolled-continuous", "scrolled-doc", "auto"  
     */
    this.rendition = {
      layout: null,
      orientation: null,
      spread: null,
      flow: null,
    };

    this.createdAt = now.valueOf();
    this.modifiedAt = now.valueOf();
    this.publishedAt = now.valueOf();

    this.files = [];

    // Import data
    Object.assign(this, obj || {});

    this.init();
  }
}

ePubDoc.prototype.MIMETYPES = {
  IMAGE: [
    "image/gif",
    "image/jpeg",
    "image/png",
    "image/svg+xml",
    "image/webp",
  ],
  AUDIO: [
    "audio/mpeg",
    "audio/mp4",
    "audio/ogg",
  ],
  VIDEO: [
    "video/mp4",
  ],
  STYLE: [
    "text/css",
  ],
  SCRIPT: [
    "application/javascript",
    "application/ecmascript",
    "text/javascript",
  ],
  PAGE: [
    "application/x-dtbncx+xml",
    "application/xhtml+xml",
    "application/x-dtbncx+xml",
    "application/smil+xml",
  ],
  FONT: [
    "font/ttf",
    "application/font-sfnt",
    "font/otf",
    "application/font-sfnt",
    "application/vnd.ms-opentype",
    "font/woff",
    "application/font-woff",
    "font/woff2",
  ],
}

ePubDoc.prototype.init = function() {
  // Convert files to ePubFile
  for (let i = 0; i < this.files.length; i++) {
    if (!(this.files[i] instanceof ePubFile)) {
      this.files[i] = new ePubFile(this, this.files[i]);
    }
  }
}

ePubDoc.prototype.generateId = function() {
  return Math.floor((new Date()).getTime() / 1e3).toString(16) + "xxxxxx".replace(/x/g, function(v) {
    return Math.floor(Math.random() * 16).toString(16);
  }) + (this._uniq++).toString(16).padStart(6, "0");
}

ePubDoc.prototype.generateMimetype = function() {
  return {
    type: "text",
    path: "mimetype",
    manifest: null,
    spine: null,
    data: "application/epub+zip",
    encoding: "utf8",
  }
}

ePubDoc.prototype.generateContainer = function() {
  return {
    type: "page",
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
  }
}

ePubDoc.prototype.generatePackage = function() {
  const metadata = {
    tag: "metadata",
    attributes: {
      // for calibre
      "xmlns:dc": "http://purl.org/dc/elements/1.1/", 
    },
    children: [
      {
        tag: "dc:identifier",
        attributes: {
          id: "uid",
        },
        children: [{
          content: this._id,
        }],
      }, {
        tag: "dc:title",
        attributes: {
          id: "title",
        },
        children: [{
          content: this.title,
        }],
      },
      ...(
        this.authors.map((author, i) => {
          return {
            tag: "dc:creator",
            attributes: {
              id: `author-${i}`,
            },
            children: [{
              content: author
            }]
          }
        })
      ), {
        tag: "dc:type",
        children: [{
          content: this.category,
        }]
      }, {
        tag: "dc:publisher",
        children: [{
          content: this.publisher,
        }]
      }, {
        tag: "dc:language",
        children: [{
          content: this.language,
        }]
      }, {
        tag: "dc:date",
        children: [{
          content: dateToISOString(this.publishedAt),
        }]
      }, {
        tag: "meta",
        attributes: {
          property: "dcterms:modified",
        },
        children: [{
          content: dateToISOString(this.modifiedAt),
        }]
      }, 
      ...(
        this.tags.map((tag, i) => {
          return {
            tag: "dc:subject",
            children: [{
              content: tag,
            }]
          }
        })
      ), {
        tag: "meta",
        closer: " /",
        attributes: {
          name: "cover",
          content: "cover-image",
        }
      }, {
        tag: "meta",
        attributes: {
          refines: "#title",
          property: "title-type",
        },
        children: [{
          content: "main"
        }]
      }, {
        tag: "meta",
        attributes: {
          refines: "#title",
          property: "file-as",
        },
        children: [{
          content: this.title,
        }]
      },
      ...(
        this.authors.reduce((acc, author, i) => {
          return [...acc, {
            tag: "meta",
            attributes: {
              refines: `#author-${i}`,
              property: "role",
              scheme: "marc:relators",
            },
            children: [{
              content: "aut",
            }]
          }, {
            tag: "meta",
            attributes: {
              refines: `#author-${i}`,
              property: "file-as",
            },
            children: [{
              content: author,
            }]
          }];
        }, [])
      ), 
      ...(
        Object.entries(this.rendition)
          .filter(([key, value]) => !!value)
          .map(([key, value]) => {
            return {
              tag: "meta",
              attributes: {
                property: `rendition:${key}`
              },
              children: [{
                content: value
              }]
            }
          })
      )
    ]
  }

  const manifest = {
    tag: "manifest",
    attributes: {
      // ...
    },
    children: this.files
      .filter(item => !!item.manifest)
      .map(item => {
        return {
          tag: "item",
          closer: " /",
          attributes: Object.assign(
            {
              "id": item._id,
              "href": item.getRelativePath(),
              "media-type": item.getMimetype(),
            },
            (typeof item.manifest === "object" ? item.manifest : {}),
          )
        };
      })
  }

  const spine = {
    tag: "spine",
    attributes: Object.assign(
      // EPUB 2 compatibility
      (this.legacy ? { toc: "ncx" } : {}),
      // Flow direction
      {"page-progression-direction": this.pageDirection}, 
    ),
    children: this.files
      .filter(item => !!item.spine)
      .map(item => {
        return {
          tag: "itemref",
          closer: " /",
          attributes: Object.assign(
            {
              "idref": item._id,
            },
            (typeof item.spine === "object" ? item.spine : {}),
          ),
        }
      })
  }

  return {
    type: "page",
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
        "unique-identifier": "uid",
        "xml:lang": this.language,
        "dir": this.textDirection,
      },
      children: [
        metadata,
        manifest,
        spine,
      ],
    }],
  }
}

ePubDoc.prototype.generateNav = function() {
  return {
    type: "page",
    path: "EPUB/nav.xhtml",
    manifest: {
      properties: "nav"
    },
    spine: {
      linear: "yes",
    },
    children: [{
      tag: "?xml",
      closer: "?",
      attributes: {
        version: "1.0",
        encoding: "utf-8",
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
            content: "Navigation",
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
  }
}

ePubDoc.prototype.generateNCX = function() {
  const navFile = this.getFile({
    manifest: {
      properties: "nav"
    },
  });

  if (!navFile) {
    throw new Error("Navigation file not found");
  }

  const tocNode = navFile.getNode({
    attributes: {
      "epub:type": "toc",
    }
  });

  if (!tocNode) {
    throw new Error("TOC node not found");
  }

  function create(ncxNode, navNode) {
    const a = navNode.getChild({
      tag: "a"
    });
    const list = navNode.getChild({
      tag: {
        $in: ["ol",  "ul"]
      }
    });
    let newNode;

    if (a) {
      const href = a.attributes?.href;
      const text = a.getTexts();
      newNode = {
        tag: "navPoint",
        children: [{
          tag: "navLabel",
          children: [{
            tag: "text",
            children: [{
              content: text,
            }]
          }]
        }, {
          tag: "content",
          closer: " /",
          attributes: {
            src: href,
          }
        }]
      };

      ncxNode.children.push(newNode);
    }

    if (list) {
      const children = list.getChildren({
        tag: "li"
      });
      for (const child of children) {
        create(newNode || ncxNode, child);
      }
    }
  }

  const mapNode = {
    tag: "navMap",
    children: [],
  }
  
  const tocList = tocNode.getChild({
    tag: {
      $in: ["ol", "ul"] 
    }
  });
  if (tocList) {
    const tocItems = tocList.getChildren({
      tag: "li"
    });

    for (const item of tocItems) {
      create(mapNode, item);
    }
  }

  return {
    type: "page",
    path: "EPUB/nav.ncx",
    manifest: {
      properties: "ncx",
    },
    spine: null,
    children: [{
      tag: "?xml",
      closer: "?",
      attributes: {
        version: "1.0",
        encoding: "utf-8",
      },
    }, {
      tag: "ncx",
      attributes: {
        "xmlns:m": "http://www.w3.org/1998/Math/MathML",
        "xmlns": "http://www.daisy.org/z3986/2005/ncx/",
        "version": "2005-1",
        "xml:lang": this.language,
      },
      children: [
        {
          tag: "head",
          children: [{
            tag: "meta",
            closer: " /",
            attributes: {
              name: "dtb:uid",
              content: this._id,
            }
          }, {
            tag: "meta",
            closer: " /",
            attributes: {
              name: "dtb:depth",
              content: "0",
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
        }, 
        {
          tag: "docTitle",
          children: [{
            tag: "text",
            children: [{
              content: this.title,
            }]
          }],
        },
        ...this.authors.map(author => {
          return {
            tag: "docAuthor",
            children: [{
              tag: "text",
              children: [{
                content: author,
              }],
            }],
          }
        }),
        mapNode,
      ],
    }]
  };
}

ePubDoc.prototype.generateCoverImage = function(data) {
  return {
    type: "image",
    path: "EPUB/cover.png",
    manifest: {
      properties: "cover-image",
    },
    data: data,
    encoding: "base64",
  }
}

ePubDoc.prototype.generateCoverPage = function(image) {
  return {
    type: "page",
    path: "EPUB/cover.xhtml",
    manifest: {
      properties: "cover", // ?
    },
    spine: {
      // If linear value is set to "no", the cover page will not be displayed on the first page of ePub.
      linear: "no",
    },
    children: [{
      tag: "?xml",
      closer: "?",
      attributes: {
        version: "1.0",
        encoding: "utf-8",
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
            content: "Cover",
          }]
        }, {
          tag: "meta",
          closer: " /",
          attributes: {
            charset: "utf-8",
          }
        }, {
          tag: "style",
          children: [{
            content: "img{max-width: 100%;}",
          }]
        }],
      }, {
        tag: "body",
        children: [{
          tag: "figure",
          children: [{
            tag: "img",
            closer: " /",
            attributes: {
              id: "cover-image",
              role: "doc-cover",
              src: image.getRelativePath(),
              alt: `Cover image of ePub document.`,
            },
          }]
        }],
      }],
    }],
  };
}

// ePubFile methods

/**
 * 
 * @param {object} obj 
 * path: string  
 * data: string  
 * attributes: object  
 * @param {number|undefined} index default -1
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
  return this.addFile(Object.assign({}, this.defaults.text, obj), idx);
}

ePubDoc.prototype.addPage = function(obj, idx) {
  return this.addFile(Object.assign({}, this.defaults.page, obj), idx);
}

ePubDoc.prototype.addStyle = function(obj, idx) {
  return this.addFile(Object.assign({}, this.defaults.style, obj), idx);
}

ePubDoc.prototype.addScript = function(obj, idx) {
  return this.addFile(Object.assign({}, this.defaults.script, obj), idx);
}

ePubDoc.prototype.addImage = function(obj, idx) {
  return this.addFile(Object.assign({}, this.defaults.image, obj), idx);
}

ePubDoc.prototype.addVideo = function(obj, idx) {
  return this.addFile(Object.assign({}, this.defaults.video, obj), idx);
}

ePubDoc.prototype.addAudio = function(obj, idx) {
  return this.addFile(Object.assign({}, this.defaults.audio, obj), idx);
}

ePubDoc.prototype.addFont = function(obj, idx) {
  return this.addFile(Object.assign({}, this.defaults.font, obj), idx);
}

ePubDoc.prototype.getFile = function(query = {}) {
  return this.files.find(item => queryObject(item, query));
}

ePubDoc.prototype.getFiles = function(query = {}) {
  return this.files.filter(item => queryObject(item, query));
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
  
  return obj;
}

ePubDoc.prototype.toFiles = function() {
  const files = this.files.map(item => item.toFile());

  return files;
}

export { ePubDoc }