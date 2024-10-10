"use strict";

import { objToAttr, dateToISOString, beautifyHTML, normalizeBase64 } from "../libs/utilities.js";
import { toObj, toStr } from "../libs/dom.mjs";
import { queryObject } from "../libs/utils.mjs";
import { ePubFile } from "./file.js";
import { ePubView } from "./view.js";
import { ePubStyle } from "./style.js";
import { ePubScript } from "./script.js";
import { ePubImage } from "./image.js";
import { ePubAudio } from "./audio.js";
import { ePubVideo } from "./video.js";

class ePubDoc {
  constructor(obj) {
    const now = new Date();

    this._uniq = 0;
    this._id = this.generateId();
    this._type = "application/epub+zip";
    this._mimetypePath = "mimetype";
    this._containerPath = "META-INF/container.xml";
    this._packagePath = "EPUB/package.opf";
    this._packageType = "application/oebps-package+xml";
    this._ncxPath = "EPUB/nav.ncx";
    this._navPath = "EPUB/nav.xhtml";
    this._coverPath = "EPUB/cover.xhtml";
    
    // ePub2 compatibility
    // Use NCX navigation
    this._legacy = false;

    // Beatify HTML, CSS, JS
    this._beautify = true;

    // Encrypt filenames
    this._encrypt = false;


    // TODO: add more _files
    // META-INF/container.xml
    // META-INF/encryption.xml
    // META-INF/manifest.xml
    // META-INF/metadata.xml
    // META-INF/rights.xml
    // META-INF/signatures.xml

    // ePub options
    this.title = "No Title";
    this.authors = [];
    this.category = "No Category";
    this.tags = [];
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

    this.views = [];
    this.styles = [];
    this.scripts = [];
    this.images = [];
    this.audios = [];
    this.videos = [];

    // Import data
    Object.assign(this, obj || {});

    // Convert constructor to ePub object
    this.convertViews();
    this.convertStyles();
    this.convertScripts();
    this.convertImages();
    this.convertAudios();
    this.convertVideos();
  }
}

ePubDoc.prototype.utils = {};

ePubDoc.prototype.utils.MIMETYPES = {
  ALL: [
    "image/gif",
    "image/jpeg",
    "image/png",
    "image/svg+xml",
    "image/webp",
  
    "audio/mpeg",
    "audio/mp4",
    "audio/ogg",
  
    "text/css",
    
    "font/ttf",
    "application/font-sfnt",
  
    "font/otf",
    "application/font-sfnt",
    "application/vnd.ms-opentype",
  
    "font/woff",
    "application/font-woff",
  
    "font/woff2",
  
    "application/xhtml+xml",
  
    "application/javascript",
    "application/ecmascript",
    "text/javascript",
  
    "application/x-dtbncx+xml",
  
    "application/smil+xml",
  ],
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
  XML: [
    "application/x-dtbncx+xml",
    "application/smil+xml",
    "application/xhtml+xml",
    "application/x-dtbncx+xml",
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

ePubDoc.prototype.convertStyles = function() {
  for (let i = 0; i < this.styles.length; i++) {
    if (!(this.styles[i] instanceof ePubStyle)) {
      this.styles[i] = new ePubStyle(this, this.styles[i]);
    }
  }
}

ePubDoc.prototype.convertScripts = function() {
  for (let i = 0; i < this.scripts.length; i++) {
    if (!(this.scripts[i] instanceof ePubScript)) {
      this.scripts[i] = new ePubScript(this, this.scripts[i]);
    }
  }
}

ePubDoc.prototype.convertImages = function() {
  for (let i = 0; i < this.images.length; i++) {
    if (!(this.images[i] instanceof ePubImage)) {
      this.images[i] = new ePubImage(this, this.images[i]);
    }
  }
}

ePubDoc.prototype.convertAudios = function() {
  for (let i = 0; i < this.audios.length; i++) {
    if (!(this.audios[i] instanceof ePubAudio)) {
      this.audios[i] = new ePubAudio(this, this.audios[i]);
    }
  }
}

ePubDoc.prototype.convertVideos = function() {
  for (let i = 0; i < this.videos.length; i++) {
    if (!(this.videos[i] instanceof ePubVideo)) {
      this.videos[i] = new ePubVideo(this, this.videos[i]);
    }
  }
}

ePubDoc.prototype.convertViews = function() {
  for (let i = 0; i < this.views.length; i++) {
    if (!(this.views[i] instanceof ePubView)) {
      this.views[i] = new ePubView(this, this.views[i]);
    }
  }
}

ePubDoc.prototype.generateId = function() {
  return Math.floor((new Date()).getTime() / 1e3).toString(16) + "xxxxxx".replace(/x/g, function(v) {
    return Math.floor(Math.random() * 16).toString(16);
  }) + (this._uniq++).toString(16).padStart(6, "0");
}

ePubDoc.prototype.generateMimetype = function() {
  return this.addView({
    path: this._mimetypePath,
    manifest: false,
    spine: false,
    children: [{
      content: this._type
    }]
  }, 0);
}

ePubDoc.prototype.generateContainer = function() {
  return this.addView({
    path: this._containerPath,
    manifest: false,
    spine: false,
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
            "full-path": this._packagePath,
            "media-type": this._packageType,
          }
        }]
      }]
    }, 1]
  });

  // Deprecated
  // let data = "";
  // data += `<?xml version="1.0"?>`;
  // data += `<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">`;
  // data += `<rootfiles>`;
  // data += `<rootfile full-path="${this._packagePath}" media-type="${this._packageType}"/>`;
  // data += `</rootfiles>`;
  // data += `</container>`;
}

ePubDoc.prototype.generatePackage = function() {
  const authors = this.authors.length > 0 ? this.authors : ["Anonymous"];

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
        authors.map((author, i) => {
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
        authors.reduce((acc, author, i) => {
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
    children: [].concat(
      this.images, 
      this.audios,
      this.videos,
      this.styles,
      this.scripts,
      this.views,
    )
    .map(item => item.toManifest())
    .filter(item => !!item),
  }

  const spine = {
    tag: "spine",
    attributes: {
      // EPUB 2 compatibility
      ...(this._legacy ? { toc: "ncx" } : {}),
      // Flow direction
      "page-progression-direction": this.pageDirection, 
    },
    children: this.views.map(view => view.toSpine()),
  }

  return this.addView({
    path: this._packagePath,
    manifest: false,
    spine: false,
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
    }]
  }, 2);
}

ePubDoc.prototype.generateCover = function(image) {
  return this.addView({
    path: this._coverPath,
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
  });
}

ePubDoc.prototype.generateNav = function() {
  return this.addView({
    path: this._navPath,
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
  });
}

/**
 * The method require a navigation view with TOC node.
 * @returns 
 */
ePubDoc.prototype.generateNCX = function(tocNode) {
  const authors = this.authors.length > 0 ? this.authors : ["Anonymous"];

  const view = this.addView({
    path: this._ncxPath,
    manifest: {
      properties: "ncx"
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
        ...authors.map(author => {
          return {
            tag: "docAuthor",
            children: [{
              tag: "text",
              children: [{
                content: author,
              }],
            }],
          }
        })
      ],
    }]
  });

  function create(ncxNode, navNode) {
    const a = navNode.getChild({ tag: "a" });
    const list = navNode.getChild({ tag: { $in: ["ol", "ul"] }});
    let newNode;

    if (a) {
      const href = a.attributes?.href;
      const text = a.getTexts();
      newNode = ncxNode.addNode({
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
      });
    }

    if (list) {
      const children = list.getChildren({ tag: "li" });
      for (const child of children) {
        create(newNode || ncxNode, child);
      }
    }

    // for (const child of children) {
    //   if (child.tag === "a") {
    //     const href = child.attributes?.href;
    //     const text = child.getTexts();
    //     if (href && text) {
    //       const newNode = target.addNode({
    //         tag: "navPoint",
    //         children: [{
    //           tag: "navLabel",
    //           children: [{
    //             tag: "text",
    //             children: [{
    //               content: text,
    //             }]
    //           }]
    //         }, {
    //           tag: "content",
    //           closer: " /",
    //           attributes: {
    //             src: href,
    //           }
    //         }]
    //       });

    //       create(newNode, child.children);
    //     }
    //   } else if (child.tag === "ol" || child.tag === "ul" || child.tag === "li") {
    //     create(target, child.children);
    //   }
    // }
  }

  const mapNode = view.getNode({ tag: "ncx" }).addNode({ tag: "navMap" });
  const tocList = tocNode.getChild({ tag: { $in: ["ol", "ul"] } });
  const tocItems = tocList.getChildren({ tag: "li" });

  for (const item of tocItems) {
    create(mapNode, item);
  }

  return view;
}

/**
 * 
 * @param {object} obj 
 * path: string  
 * data: string  
 * attributes: object  
 * @param {number|undefined} index default -1
 * @returns {ePubImage}
 */
ePubDoc.prototype.addImage = function(obj, idx) {
  if (typeof idx !== "number") {
    idx = -1;
  }
  if (idx < 0) {
    idx += this.images.length + 1;
  }

  const image = new ePubImage(this, obj);
  this.images.splice(idx, 0, image);
  return image;
}

ePubDoc.prototype.getImage = function(query = {}) {
  return this.images.find(item => queryObject(item, query));
}

ePubDoc.prototype.getImages = function(query = {}) {
  return this.images.filter(item => queryObject(item, query));
}

ePubDoc.prototype.removeImage = function(query = {}) {
  const image = this.getImage(query);
  if (image) {
    image.remove();
  }
  return this;
}

ePubDoc.prototype.removeImages = function(query = {}) {
  const images = this.getImages(query);
  for (const image of images) {
    image.remove();
  }
  return this;
}

/**
 * 
 * @param {object} obj 
 * path: string  
 * data: string  
 * attributes: object  
 * @param {number|undefined} idx default -1
 * @returns {ePubAudio}
 */
ePubDoc.prototype.addAudio = function(obj, idx) {
  if (typeof idx !== "number") {
    idx = -1;
  }
  if (idx < 0) {
    idx += this.audios.length + 1;
  }

  const audio = new ePubAudio(this, obj);
  this.audios.splice(idx, 0, audio);
  return audio;
}

ePubDoc.prototype.getAudio = function(query = {}) {
  return this.audios.find(item => queryObject(item, query));
}

ePubDoc.prototype.getAudios = function(query = {}) {
  return this.audios.filter(item => queryObject(item, query));
}

ePubDoc.prototype.removeAudio = function(query = {}) {
  const audio = this.getAudio(query);
  if (audio) {
    audio.remove();
  }
  return this;
}

ePubDoc.prototype.removeAudios = function(query = {}) {
  const audios = this.getAudios(query);
  for (const audio of audios) {
    audio.remove();
  }
  return this;
}

/**
 * 
 * @param {object} obj 
 * path: string  
 * data: string  
 * attributes: object  
 * @param {number|undefined} idx default -1 
 * @returns {ePubVideo}
 */
ePubDoc.prototype.addVideo = function(obj, idx) {
  if (typeof idx !== "number") {
    idx = -1;
  }
  if (idx < 0) {
    idx += this.videos.length + 1;
  }

  const video = new ePubVideo(this, obj);
  this.videos.splice(idx, 0, video);
  return video;
}

ePubDoc.prototype.getVideo = function(query = {}) {
  return this.videos.find(item => queryObject(item, query));
}

ePubDoc.prototype.getVideos = function(query = {}) {
  return this.videos.filter(item => queryObject(item, query));
}

ePubDoc.prototype.removeVideo = function(query = {}) {
  const video = this.getVideo(query);
  if (video) {
    video.remove();
  }
  return this;
}

ePubDoc.prototype.removeVideos = function(query = {}) {
  const videos = this.getVideos(query);
  for (const video of videos) {
    video.remove();
  }
  return this;
}

/**
 * 
 * @param {object} obj 
 * path: string  
 * data: string  
 * attributes: object  
 * @param {number|undefined} idx default -1 
 * @returns {ePubStyle}
 */
ePubDoc.prototype.addStyle = function(obj, idx) {
  if (typeof idx !== "number") {
    idx = -1;
  }
  if (idx < 0) {
    idx += this.styles.length + 1;
  }

  const style = new ePubStyle(this, obj);
  this.styles.splice(idx, 0, style);
  return style;
}

ePubDoc.prototype.getStyle = function(query = {}) {
  return this.styles.find(item => queryObject(item, query));
}

ePubDoc.prototype.getStyles = function(query = {}) {
  return this.styles.filter(item => queryObject(item, query));
}

ePubDoc.prototype.removeStyle = function(query = {}) {
  const style = this.getStyle(query);
  if (style) {
    style.remove();
  }
  return this;
}

ePubDoc.prototype.removeStyles = function(query = {}) {
  const styles = this.getStyles(query);
  for (const style of styles) {
    style.remove();
  }
  return this;
}

/**
 * 
 * @param {object} obj 
 * path: string  
 * data: string  
 * attributes: object  
 * @param {number|undefined} idx default -1 
 * @returns {ePubScript}
 */
ePubDoc.prototype.addScript = function(obj, idx) {
  if (typeof idx !== "number") {
    idx = -1;
  }
  if (idx < 0) {
    idx += this.scripts.length + 1;
  }

  const script = new ePubScript(this, obj);
  this.scripts.splice(idx, 0, script);
  return script;
}

ePubDoc.prototype.getScript = function(query = {}) {
  return this.scripts.find(item => queryObject(item, query));
}

ePubDoc.prototype.getScripts = function(query = {}) {
  return this.scripts.filter(item => queryObject(item, query));
}

ePubDoc.prototype.removeScript = function(query = {}) {
  const script = this.getScript(query);
  if (script) {
    script.remove();
  }
  return this;
}

ePubDoc.prototype.removeScripts = function(query = {}) {
  const scripts = this.getScripts(query);
  for (const script of scripts) {
    script.remove();
  }
  return this;
}

/**
 * 
 * @param {object} obj 
 * path: string  
 * spine: object|undefined  
 * children: object[]|string|undefined  
 * attributes: object  
 * @param {number|undefined} idx default -1 
 * @returns {ePubView}
 */
ePubDoc.prototype.addView = function(obj, idx) {
  if (typeof idx !== "number") {
    idx = -1;
  }
  if (idx < 0) {
    idx += this.views.length + 1;
  }

  const view = new ePubView(this, obj);
  this.views.splice(idx, 0, view);
  return view;
}

ePubDoc.prototype.getView = function(query = {}) {
  return this.views.find(item => queryObject(item, query));
}

ePubDoc.prototype.getViews = function(query = {}) {
  return this.views.filter(item => queryObject(item, query));
}

ePubDoc.prototype.removeView = function(query = {}) {
  const view = this.getView(query);
  if (view) {
    view.remove();
  }
  return this;
}

ePubDoc.prototype.removeViews = function(query = {}) {
  const views = this.getViews(query);
  for (const view of views) {
    view.remove();
  }
  return this;
}

// Export methods

ePubDoc.prototype.toObject = function() {
  const obj = Object.assign({}, this, {
    views: (this.views || []).map(item => item.toObject()),
    styles: (this.styles || []).map(item => item.toObject()),
    scripts: (this.scripts || []).map(item => item.toObject()),
    images: (this.images || []).map(item => item.toObject()),
    audios: (this.audios || []).map(item => item.toObject()),
    videos: (this.videos || []).map(item => item.toObject()),
  });
  
  return obj;
}

ePubDoc.prototype.toFiles = function() {
  const files = [].concat(
    (this.views || []).map(item => item.toFile()),
    (this.styles || []).map(item => item.toFile()),
    (this.scripts || []).map(item => item.toFile()),
    (this.images || []).map(item => item.toFile()),
    (this.audios || []).map(item => item.toFile()),
    (this.videos || []).map(item => item.toFile()),
  );

  return files;
}

export { ePubDoc }