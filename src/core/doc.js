"use strict";

import { dateToISOString, beautifyHTML, normalizeBase64 } from "../libs/utilities.js";
import { toObj, toStr } from "../libs/dom.mjs";
import { queryObject } from "../libs/utils.mjs";
import { ePubFile } from "./file.js";
import { ePubView } from "./view.js";
import { ePubStyle } from "./style.js";
import { ePubScript } from "./script.js";
import { ePubImage } from "./image.js";

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
    // this._ncxPath = "EPUB/nav.ncx";
    // this._coverViewName = "cover";
    // this._coverViewPath = "EPUB/cover.xhtml";
    // this._coverImageName = "cover";
    // this._coverImagePath = "EPUB/cover.png";
    // this._navViewName = "nav";
    // this._navViewPath = "EPUB/nav.xhtml";
    
    // TODO: add more _files
    // mimetype, container.xml, package.opf

    // mimetype
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

    // ePub2 compatibility
    // Use NCX navigation
    this.legacy = false;

    // Beatify HTML, CSS, JS
    this.beautify = true;

    // Encrypt filenames
    this.encrypt = false;

    this.views = [];
    this.styles = [];
    this.scripts = [];
    this.images = [];
    this.audios = [];
    this.videos = [];

    // Import data
    Object.assign(this, obj || {});
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
  ],
  HTML: [
    "application/xhtml+xml",
  ],
  NCX: [
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

ePubDoc.prototype.generateId = function() {
  return Math.floor((new Date()).getTime() / 1e3).toString(16) + "xxxxxx".replace(/x/g, function(v) {
    return Math.floor(Math.random() * 16).toString(16);
  }) + (this._uniq++).toString(16).padStart(6, "0");
}

ePubDoc.prototype.generateMimetype = function() {
  return {
    path: this._mimetypePath,
    data: this._type,
    encoding: "utf8",
  }
}

ePubDoc.prototype.generateContainer = function() {
  let data = "";
  data += `<?xml version="1.0"?>`;
  data += `<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">`;
  data += `<rootfiles>`;
  data += `<rootfile full-path="${this._packagePath}" media-type="${this._packageType}"/>`;
  data += `</rootfiles>`;
  data += `</container>`;

  return {
    path: this._containerPath,
    data: this.beautify ? beautifyHTML(data) : data,
    encoding: "utf8",
  }
}

ePubDoc.prototype.generatePackage = function() {

  function A() {
    let result = "";
    result += `<dc:identifier id="uid">${this._id}</dc:identifier>`;
    result += `<dc:title id="title">${this.title}</dc:title>`;
  
    const authors = this.authors.length > 0 ? this.authors : ["Anonymous"];
    for (let i = 0; i < authors.length; i++) {
      result += `<dc:creator id="author-${i}">${authors[i]}</dc:creator>`;
    }
  
    result += `<dc:type>${this.category}</dc:type>`;
    result += `<dc:publisher>${this.publisher}</dc:publisher>`;
    result += `<dc:language>${this.language}</dc:language>`;
    result += `<dc:date>${dateToISOString(this.publishedAt)}</dc:date>`;
    result += `<meta property="dcterms:modified">${dateToISOString(this.modifiedAt)}</meta>`;
  
    for (let i = 0; i < this.tags.length; i++) {
      result += `<dc:subject>${this.tags[i]}</dc:subject>`;
    }
  
    // for EPUB 2 compatibility
    result += `<meta name="cover" content="cover-image"/>`;
  
    result += `<meta refines="#title" property="title-type">main</meta>`;
    result += `<meta refines="#title" property="file-as">${this.title}</meta>`;
  
    for (let i = 0; i < authors.length; i++) {
      result += `<meta refines="#author-${i}" property="role" scheme="marc:relators">aut</meta>` +
        `<meta refines="#author-${i}" property="file-as">${authors[i]}</meta>`;
    }
  
    for (let [k, v] of Object.entries(this.rendition)) {
      if (v) {
        result += `<meta property="rendition:${k}">${v}</meta>`;
      }
    }

    return result;
  }

  // manifest
  function B() {
    let result = "";

    // images
    for (let i = 0; i < this.images.length; i++) {
      result += this.images[i].toManifest();
    }

    // styles
    for (let i = 0; i < this.styles.length; i++) {
      result += this.styles[i].toManifest();
    }

    // scripts
    for (let i = 0; i < this.scripts.length; i++) {
      result += this.scripts[i].toManifest();
    }

    // views
    for (let i = 0; i < this.views.length; i++) {
      result += this.views[i].toManifest();
    }

    return result;
  }

  // spine
  function C() {
    let result = "";

    // views
    for (let i = 0; i < this.views.length; i++) {
      result += this.views[i].toSpine();
    }

    return result;
  }

  const packageAttr = objToAttr({
    "xmlns": "http://www.idpf.org/2007/opf",
    "version": "3.0",
    "unique-identifier": "uid",
    "xml:lang": this.language,
    "dir": this.textDirection,
  });

  const metadataAttr = objToAttr({
    // for calibre
    "xmlns:dc": "http://purl.org/dc/elements/1.1/", 
  });
  
  const manifestAttr = objToAttr({
    // id[optional]
    // "id": ...
  });

  const spineAttr = objToAttr({
    // id[optional]
    // "id": ...
    // EPUB 2 compatibility
    "toc": this.legacy ? "ncx" : null,
    // flow direction
    "page-progression-direction": this.pageDirection, 
  });

  let data = "";
  data += `<?xml version="1.0" encoding="utf-8"?>`;
  data += `<package${packageAttr}>`;
  data += `<metadata${metadataAttr}>${A.apply(this)}</metadata>`;
  data += `<manifest${manifestAttr}>${B.apply(this)}</manifest>`;
  data += `<spine${spineAttr}>${C.apply(this)}</spine>`;
  data += `</package>`;

  return {
    path: this._packagePath,
    type: this._packageType,
    data: this.beautify ? beautifyHTML(data) : data,
    encoding: "utf8",
  }
}

ePubDoc.prototype.generateNCX = function(navView) {

  function A() {
    let result = "";
    result += `<meta name="dtb:uid" content="${this._id}"/>`;
    result += `<meta name="dtb:depth" content="1"/>`;
    result += `<meta name="dtb:totalPageCount" content="0"/>`;
    result += `<meta name="dtb:maxPageNumber" content="0"/>`;
    return result;
  }

  function B() {
    let result = "";
    result += `<docTitle><text>${this.title}</text></docTitle>`;
    const authors = this.authors.length > 0 ? this.authors : ["Anonymous"];
    for (const author of authors) {
      result += `<docAuthor><text>${author}</text></docAuthor>`;
    }
    return result;
  }

  // pages or nodes
  function C(items) {
    let result = "";
    for (const item of items) {
      if (!item.index) {
        result += C(item.nodes);
      } else {
        result += `<navPoint${objToAttr({ id: item._id })}>`;
        result += `<navLabel><text>${item.name}</text></navLabel>`;
        result += `<content src="${item.getRelativePath()}"/>`;
        result += C(item.nodes);
        result += `</navPoint>`;
      }
    }
    return result;
  }

  const ncxAttr = objToAttr({
    "xmlns:m": "http://www.w3.org/1998/Math/MathML",
    "xmlns": "http://www.daisy.org/z3986/2005/ncx/",
    "version": "2005-1",
    "xml:lang": this.language,
  });

  let data = "";
  data += `<?xml version="1.0" encoding="utf-8"?>`;
  data += `<ncx${ncxAttr}>`;
  data += `<head>${A.apply(this)}</head>`;
  data += `${B.apply(this)}`;
  data += `<navMap>${C.apply(this, [this.pages])}</navMap>`;
  data += `</ncx>`;

  return {
    path: this._ncxPath,
    data: this.beautify ? beautifyHTML(data) : data,
    encoding: "utf8",
  }
}

ePubDoc.prototype.generateCover = function(data) {
  const image = this.addImage({
    name: "cover",
    path: "EPUB/cover.png",
    data: data || "",
    encoding: "base64",
    menifest: {
      properties: "cover-image",
    },
  });

  const view = this.addView({
    name: "cover",
    path: "EPUB/cover.xhtml",
    manifest: {
      properties: "cover", // ?
    },
    spine: {
      linear: "no",
    },
  });

  const headNode = view.getNode({ tag: "head" });
  const bodyNode = view.getNode({ tag: "body" });

  const titleNode = headNode.addNode({
    tag: "title", 
    attributes: {},
    children: [{
      content: "Cover", 
    }]
  });

  const charsetNode = headNode.addNode({
    tag: "meta",
    closer: " /",
    attributes: {
      charset: "utf-8"
    },
  });

  const styleNode = headNode.addNode({
    tag: "style",
    children: [{
      content: "img{max-width: 100%;}",
    }]
  });

  const figureNode = bodyNode.addNode({
    tag: "figure",
  });

  const imgNode = figureNode.addNode({
    tag: "img",
    closer: " /",
    attributes: {
      id: "cover-image",
      role: "doc-cover",
      src: image.getRelativePath(),
      alt: `Cover image of ePub document.`,
    },
  });

  return {
    image,
    view,
    headNode,
    bodyNode,
    titleNode,
    charsetNode,
    styleNode,
    figureNode,
    imgNode,
  }
}

ePubDoc.prototype.generateNav = function() {
  const view = this.addView({
    name: "nav",
    path: "EPUB/nav.xhtml",
    manifest: {
      properties: "nav"
    },
    spine: {
      linear: "yes",
    },
  });

  const headNode = view.getNode({ tag: "head" });
  const bodyNode = view.getNode({ tag: "body" });

  const titleNode = headNode.addNode({
    tag: "title",
    attributes: {},
    children: [{
      content: "Navigation", 
    }]
  });

  const charsetNode = headNode.addNode({
    tag: "meta",
    closer: " /",
    attributes: {
      charset: "utf-8"
    },
  });

  const styleNode = headNode.addNode({
    tag: "style",
  });

  const tocNode = bodyNode.addNode({
    name: "toc",
    tag: "nav",
    attributes: {
      "epub:type": "toc",
      "id": "toc",
      "role": "doc-toc",
    }
  });

  const landmarkNode = bodyNode.addNode({
    name: "landmarks",
    tag: "nav",
    attributes: {
      "epub:type": "landmarks",
      "id": "landmarks",
      "hidden": "",
    }
  });

  const pageListNode = bodyNode.addNode({
    name: "page-list",
    tag: "nav",
    attributes: {
      "epub:type": "page-list",
      "id": "page-list",
      "hidden": "",
    }
  });

  return {
    view,
    headNode,
    bodyNode,
    titleNode,
    charsetNode,
    styleNode,
    tocNode,
    landmarkNode,
    pageListNode,
  }
}

/**
 * 
 * @param {object} obj 
 * _id: String|undefined,  
 * manifest: Object|undefined,  
 * path: String,  
 * data: String,  
 * encoding: "base64"|"utf8"|undefined,  
 * attributes: Object|undefined,  
 * @returns {ePubImage}
 */
ePubDoc.prototype.addImage = function(obj) {
  const image = new ePubImage(this, obj);
  this.images.push(image);
  return image;
}

ePubDoc.prototype.getImage = function(query) {
  return this.images.find(item => queryObject(item, query));
}

ePubDoc.prototype.getImages = function(query) {
  return this.images.filter(item => queryObject(item, query));
}

/**
 * 
 * @param {object} obj 
 * _id: String|undefined,  
 * manifest: Object|undefined,  
 * path: String,  
 * data: String,  
 * encoding: "base64"|"utf8"|undefined,  
 * attributes: Object|undefined,  
 * @returns {ePubStyle}
 */
ePubDoc.prototype.addStyle = function(obj) {
  const style = new ePubStyle(this, obj);
  this.styles.push(style);
  return style;
}

ePubDoc.prototype.getStyle = function(query) {
  return this.styles.find(item => queryObject(item, query));
}

ePubDoc.prototype.getStyles = function(query) {
  return this.styles.filter(item => queryObject(item, query));
}

/**
 * 
 * @param {object} obj 
 * _id: String|undefined,  
 * manifest: Object|undefined,  
 * path: String,  
 * data: String,  
 * encoding: "base64"|"utf8"|undefined,  
 * attributes: Object|undefined,  
 * @returns {ePubScript}
 */
ePubDoc.prototype.addScript = function(obj) {
  const script = new ePubScript(this, obj);
  this.scripts.push(script);
  return script;
}

ePubDoc.prototype.getScript = function(query) {
  return this.scripts.find(item => queryObject(item, query));
}

ePubDoc.prototype.getScripts = function(query) {
  return this.scripts.filter(item => queryObject(item, query));
}

/**
 * 
 * @param {object} obj 
 * _id: String|undefined,  
 * manifest: Object|undefined,  
 * spine: Object|undefined,  
 * path: String,  
 * data: String,  
 * children: String[],  
 * styles: String[],  
 * scripts: String[],  
 * encoding: "base64"|"utf8"|undefined,  
 * attributes: Object|undefined,  
 * @returns {ePubView}
 */
ePubDoc.prototype.addView = function(obj) {
  const view = new ePubView(this, obj);
  this.views.push(view);
  return view;
}

ePubDoc.prototype.getView = function(query) {
  return this.views.find(item => queryObject(item, query));
}

ePubDoc.prototype.getViews = function(query) {
  return this.views.filter(item => queryObject(item, query));
}

ePubDoc.prototype.toFiles = function() {
  let files = [
    this.generateMimetype(),
    this.generateContainer(),
    this.generatePackage(),
  ];

  // document.files
  for (const file of this.files) {
    files.push({
      path: file.getAbsolutePath(),
      data: typeof file.data === "function" ? file.data() : file.data,
      encoding: file.encoding,
    });
  }

  // document.pages
  for (const page of this.pages) {
    files.push({
      path: page.getAbsolutePath(),
      data: page.toString(),
      encoding: "utf8",
    });
  }

  return files;
}

export { ePubDoc }