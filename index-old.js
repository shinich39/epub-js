"use strict";

import * as util from "./libs/util.mjs";

const DEFAULT_TITLE = "No title";
const DEFAULT_CHAPTER_TITLE = "No title";
const DEFAULT_AUTHOR = "Anonymous";

const MIME_TYPES = {
  epub: "application/epub+zip",
  ncx: "application/x-dtbncx+xml",
  xml: "application/xml", // https://datatracker.ietf.org/doc/html/rfc7303#section-4.1
  xhtml: "application/xhtml+xml",
  doc: "application/msword",
  json: "application/json",
  txt: "text/plain",
  html: "text/html",
  htm: "text/html",
  js: "text/javascript",
  csv: "text/csv",
  css: "text/css",
  bmp: "image/bmp",
  avif: "image/avif",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
  tiff: "image/tiff",
  tif: "image/tiff",
  webp: "image/webp",
  svg: "image/svg+xml",
  wav: "audio/wav",
  weba: "audio/webm",
  mp3: "audio/mpeg",
  ogg: "audio/ogg",
  ttf: "font/ttf",
  avi: "video/x-msvideo",
  webm: "video/webm",
  mp4: "video/mp4",
};

function getMimetype(p) {
  return MIME_TYPES[p.split(".").pop()];
}

function getISOString(v) {
  return new Date(v).toISOString().replace(/\.[0-9]+Z$/, "Z");
}

function getRelativePath(p) {
  return p.replace(/^EPUB\//, "");
}

function renderProps(obj) {
  if (!obj) {
    obj = {};
  }
  let result = "",
    entries = Object.entries(obj);
  for (const [key, value] of entries) {
    if (value) {
      result += ` ${key}="${value}"`;
    }
  }
  return result;
}

function removeHeaderFromBase64(base64) {
  return base64.replace(/^data:([A-Za-z-+\/]+);base64,/, "");
}

function getMimetypeFromBase64(base64) {
  const res = /^data:([A-Za-z-+\/]+);base64,/.exec(base64);
  return res ? res[1] : null;
}

function getExtensionFromMimetype(mime) {
  if (!mime) {
    return null;
  }
  for (const [key, value] of Object.entries(MIME_TYPES)) {
    if (value === mime) {
      return "." + key;
    }
  }
  return null;
}

/**
 * ePub Version: 3.0  
 * ref: https://www.w3.org/TR/epub-33/
 */
class ePub {
  constructor() {
    this.id = util.id();
    this.title = null;
    this.category = null;
    this.authors = [];
    this.publisher = null;
    this.language = null; // en

    this.__data__ = {
      // triggers
      isTitleChanged: false,
      isAuthorChanged: false,

      // book options
      id: util.id(),
      title: DEFAULT_TITLE,
      category: null,
      authors: [DEFAULT_AUTHOR],
      publisher: null,
      language: "en",
      textDirection: "auto", // ltr, rtl, auto
      pageDirection: null, // ltr, rtl
      cover: "data:image/jpeg;base64,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",
      styles: [], // default style src
      tags: [],
      publishedAt: null,
      createdAt: new Date(),
      modifiedAt: new Date(),

      // https://www.w3.org/TR/epub-33/#layout
      // spine options
      enableNCX: false, // legacy, EPUB 2 compatibility
      renditionLayout: null, // pre-paginated, reflowable(default)
      renditionOrientation: null, // landscape, portrait, auto(default)
      renditionSpread: null, // none, landscape, both, auto(default)
      renditionFlow: null, // paginated, scrolled-continuous, scrolled-doc, auto(default)

      // epub options
      containerPath: `META-INF/container.xml`,
      packagePath: `EPUB/${util.id()}.opf`,
      ncxPath: `EPUB/${util.id()}.ncx`,
      navPath: `EPUB/${util.id()}.xhtml`,
      navTitle: `Index`,
      navId: `navigation`, // manifest, spine
      coverPath: `EPUB/${util.id()}.jpg`,
      coverId: `cover-image`, // manifest, package.meta
    };

    this.__files__ = [
      {
        path: "mimetype",
        data: "application/epub+zip",
        encoding: "utf8", // or "base64"

        // package.opf
        manifest: null, // object
        spine: null, // object

        // nav.xhtml
        toc: null, // array
        landmarks: null, // array
      },
    ];

    // initialize
    this.update();
  }

  get data() {
    return this.__data__;
  }
}
/**
 *
 * @param {string} path
 * @returns
 */
EPUB.prototype.getFile = function(path) {
  return this.__files__.find(function(item) {
    return item.path === path;
  });
};
/**
 *
 * @param {object} newFile { path, data, encoding, manifest, spine, toc, landmark }
 */
EPUB.prototype.setFile = function({
  path,
  data,
  encoding,
  manifest,
  spine,
  toc,
  landmarks,
}) {
  encoding = encoding || "utf8";
  manifest = manifest || null;
  spine = spine || null;
  toc = toc || [];
  landmarks = landmarks || [];

  if (manifest) {
    manifest.mediaType = manifest.mediaType || getMimetype(manifest.href);
  }

  const file = this.getFile(path);
  if (file) {
    file.data = data;
    file.encoding = encoding;
    file.manifest = manifest;
    file.spine = spine;
    file.toc = toc;
    file.landmarks = landmarks;
  } else {
    this.__files__.push({
      path,
      data,
      encoding,
      manifest,
      spine,
      toc,
      landmarks,
    });
  }
};
/**
 *
 */
EPUB.prototype.update = function() {
  this.updateContainer();
  this.updateCover();
  this.updateNav();
  this.updateNCX();
  this.updatePackage();
};
EPUB.prototype.updateContainer = function() {
  const data = `
<?xml version="1.0"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
<rootfiles>
<rootfile full-path="${this.__data__.packagePath}" media-type="application/oebps-package+xml"/>
</rootfiles>
</container>
  `;

  this.setFile({
    path: this.__data__.containerPath,
    data: data.trim(),
  });
};
EPUB.prototype.updateCover = function() {
  this.setFile({
    path: this.__data__.coverPath,
    data: removeHeaderFromBase64(this.__data__.cover),
    encoding: "base64",

    manifest: {
      id: this.__data__.coverId,
      href: getRelativePath(this.__data__.coverPath),
      mediaType: "image/jpeg",
      properties: "cover-image",
    },
  });
};
EPUB.prototype.updateNav = function() {
  function createTOC(arr) {
    return arr.reduce((prev, curr) => {
      return prev + createTOCItem(curr);
    }, "\n");
  }

  function createTOCItem(arr) {
    return arr.reduce((prev, { id, title, href, toc }) => {
      return (
        prev +
        `<li><a href="${href}">${title}</a>${toc && toc.length > 0 ? createTOCItem(toc) : ""}</li>\n`
      );
    }, "");
  }

  function createLandmarks(arr) {
    return arr.reduce((prev, curr) => {
      return prev + createLandmarkItem(curr);
    }, "\n");
  }

  function createLandmarkItem(arr) {
    return arr.reduce((prev, { id, title, href, epubType }) => {
      return (
        prev +
        `<li><a epub:type="${epubType || ""}" href="${href}">${title}</a></li>\n`
      );
    }, "");
  }

  const data = `
<?xml version="1.0" encoding="UTF-8"?>
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="${this.__data__.language}" lang="${this.__data__.language}" dir="${this.__data__.textDirection}" xmlns:epub="http://www.idpf.org/2007/ops">
<head>
<meta charset="utf-8"/>
<title>${this.__data__.navTitle}</title>${this.__data__.style}
</head>
<body>
<nav epub:type="toc" id="toc">			
<h1>${this.__data__.navTitle}</h1>
<ol>${createTOC(this.__files__.filter((e) => e.toc).map((e) => e.toc))}</ol>
</nav>
<!--
<nav epub:type="landmarks" id="landmarks">
<h1>Landmarks</h1>
<ol>${createLandmarks(this.__files__.filter((e) => e.landmarks).map((e) => e.landmarks))}</ol>
</nav>
-->
</body>
</html>
  `;

  this.setFile({
    path: this.__data__.navPath,
    data: data.trim(),

    manifest: {
      id: this.__data__.navId,
      href: getRelativePath(this.__data__.navPath),
      mediaType: "application/xhtml+xml",
      properties: "nav",
    },

    spine: {
      id: this.__data__.navId,
      linear: true,
    },

    toc: [
      {
        href: getRelativePath(this.__data__.navPath),
        title: this.__data__.navTitle,
      },
    ],
  });
};

// legacy, EPUB 2 compatibility
EPUB.prototype.updateNCX = function() {
  if (!this.__data__.enableNCX) {
    return;
  }

  function createNavMap(arr) {
    return arr.reduce((prev, curr) => {
      return prev + createNavPoint(curr);
    }, "\n");
  }

  function createNavPoint(arr) {
    return arr.reduce((prev, { id, title, href, toc }) => {
      return (
        prev +
        `
<navPoint id="${id || ""}">
<navLabel>
<text>${title}</text>
</navLabel>
<content src="${href}"/>${toc && toc.length > 0 ? createNavPoint(toc) : ""}
</navPoint>
      `.trim() +
        "\n"
      );
    }, "");
  }

  const data = `
<?xml version="1.0" encoding="utf-8"?>
<ncx xmlns:m="http://www.w3.org/1998/Math/MathML" xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1" xml:lang="${this.__data__.language}">
<head>
<meta name="dtb:uid" content="${this.__data__.id}"/>
<meta name="dtb:depth" content="1"/>
<meta name="dtb:totalPageCount" content="0"/>
<meta name="dtb:maxPageNumber" content="0"/>
</head>
<docTitle><text>${this.__data__.title}</text></docTitle>
${this.__data__.authors.map((e) => "<docAuthor><text>" + e + "</text></docAuthor>").join("\n")}
<navMap>${createNavMap(this.__files__.filter((e) => e.toc).map((e) => e.toc))}</navMap>
</ncx>
  `;

  this.setFile({
    path: this.__data__.ncxPath,
    data: data.trim(),

    manifest: {
      id: "ncx",
      href: getRelativePath(this.__data__.ncxPath),
      mediaType: "application/x-dtbncx+xml",
    },
  });
};
EPUB.prototype.updatePackage = function() {
  function createMetadata({
    id,
    title,
    category,
    authors,
    publisher,
    language,
    publishedAt,
    modifiedAt,
    cover,
    coverId,
    tags,
    renditionLayout,
    renditionOrientation,
    renditionSpread,
    renditionFlow,
  }) {
    let _id = id ? `<dc:identifier id="uid">${id}</dc:identifier>\n` : ""; // required
    let _title = title ? `<dc:title id="title">${title}</dc:title>\n` : ""; // required
    let _authors = authors
      .map((e, i) => `<dc:creator id="author-${i}">${e}</dc:creator>\n`)
      .join(""); // 1 item required
    let _publisher = publisher
      ? `<dc:publisher>${publisher}</dc:publisher>\n`
      : "";
    let _category = category ? `<dc:type>${category}</dc:type>\n` : "";
    let _language = language ? `<dc:language>${language}</dc:language>\n` : "";
    let _publishedAt = publishedAt
      ? `<dc:date>${getISOString(publishedAt)}</dc:date>\n`
      : "";
    let _modifiedAt = modifiedAt
      ? `<meta property="dcterms:modified">${getISOString(modifiedAt)}</meta>\n`
      : ""; // required
    let _tags = tags ? tags.map((e) => `<dc:subject>${e}</dc:subject>\n`) : "";
    let _meta = "";
    _meta += cover ? `<meta name="cover" content="${coverId}"/>\n` : ""; // for EPUB 2 compatibility
    _meta += title
      ? `<meta refines="#title" property="title-type">main</meta>\n`
      : "";
    _meta += title
      ? `<meta refines="#title" property="file-as">${title}</meta>\n`
      : "";
    _meta += authors
      .map(
        (e, i) =>
          `<meta refines="#author-${i}" property="role" scheme="marc:relators">aut</meta>\n<meta refines="#author-${i}" property="file-as">${e}</meta>\n`,
      )
      .join("");
    _meta += renditionLayout
      ? `<meta property="rendition:layout">${renditionLayout}</meta>\n`
      : "";
    _meta += renditionOrientation
      ? `<meta property="rendition:orientation">${renditionOrientation}</meta>\n`
      : "";
    _meta += renditionSpread
      ? `<meta property="rendition:spread">${renditionSpread}</meta>\n`
      : "";
    _meta += renditionFlow
      ? `<meta property="rendition:flow">${renditionFlow}</meta>\n`
      : "";
    return `\n${_id}${_title}${_authors}${_publisher}${_category}${_language}${_tags}${_publishedAt}${_modifiedAt}${_meta}`;
  }

  function createManifest(arr) {
    return arr.reduce((prev, { id, href, mediaType, properties }) => {
      id = id ? ` id="${id}"` : "";
      href = href ? ` href="${href}"` : "";
      mediaType = mediaType ? ` media-type="${mediaType}"` : "";
      properties =
        properties && properties.trim() !== ""
          ? ` properties="${properties}"`
          : "";
      return prev + `<item${id}${href}${mediaType}${properties} />\n`;
    }, "\n");
  }

  function createSpine(arr) {
    return arr.reduce((prev, { id, linear, properties }) => {
      id = id ? ` idref="${id}"` : "";
      linear = linear ? "" : ` linear=no`; // boolean
      properties =
        properties && properties.trim() !== ""
          ? ` properties="${properties}"`
          : "";
      return prev + `<itemref${id}${linear}${properties} />\n`;
    }, "\n");
  }

  const metadata = createMetadata(this.__data__);
  const metadataProperties = {
    "xmlns:dc": "http://purl.org/dc/elements/1.1/", // fix calibre
  };

  const manifest = createManifest(
    this.__files__.filter((e) => e.manifest).map((e) => e.manifest),
  );
  const manifestProperties = {};

  const spine = createSpine(
    this.__files__.filter((e) => e.spine).map((e) => e.spine),
  );
  const spineProperties = {
    toc: this.__data__.enableNCX ? "ncx" : null, // legacy, EPUB 2 compatibility
    "page-progression-direction": this.__data__.pageDirection, // flow direction
  };

  const data = `
<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="uid" xml:lang="${this.__data__.language}" dir="${this.__data__.textDirection}">
<metadata${renderProps(metadataProperties)}>${metadata}</metadata>
<manifest${renderProps(manifestProperties)}>${manifest}</manifest>
<spine${renderProps(spineProperties)}>${spine}</spine>
</package>
  `;

  this.setFile({
    path: this.__data__.packagePath,
    data: data.trim(),
  });
};
/**
 *
 * @param {string} str
 * @returns
 */
EPUB.prototype.id = function(str) {
  this.__data__.id = str;
  return this;
};
/**
 *
 * @param {string} str
 * @returns
 */
EPUB.prototype.title = function(str) {
  this.__data__.title = str || DEFAULT_TITLE;
  this.isTitleChanged = true;
  return this;
};
/**
 *
 * @param {string} str
 * @returns
 */
EPUB.prototype.author = function(str) {
  if (!this.isAuthorChanged) {
    this.__data__.authors = [str || DEFAULT_AUTHOR];
  } else {
    this.__data__.authors.push(str || DEFAULT_AUTHOR);
  }
  this.isAuthorChanged = true;
  return this;
};
/**
 *
 * @param {string} str
 * @returns
 */
EPUB.prototype.publisher = function(str) {
  this.__data__.publisher = str;
  return this;
};
/**
 *
 * @param {string} str
 * @returns
 */
EPUB.prototype.category = function(str) {
  this.__data__.category = str;
  return this;
};
/**
 *
 * @param {string} str
 * @returns
 */
EPUB.prototype.language = function(str) {
  this.__data__.language = str;
  return this;
};
/**
 *
 * @param {string} str ltr, rtl, auto
 * @returns
 */
EPUB.prototype.textDirection = function(str) {
  this.__data__.textDirection = str || "auto";
  return this;
};
/**
 *
 * @param {string} str ltr, rtl
 * @returns
 */
EPUB.prototype.pageDirection = function(str) {
  this.__data__.pageDirection = str || null;
  return this;
};
/**
 *
 * @param {string} str reflowable, pre-paginated
 * @returns
 */
EPUB.prototype.layout = function(str) {
  this.__data__.renditionLayout = str || null;
  return this;
};
/**
 *
 * @param {string} str auto, landscape, portrait
 * @returns
 */
EPUB.prototype.orientation = function(str) {
  this.__data__.renditionOrientation = str || null;
  return this;
};
/**
 *
 * @param {string} str auto, none, landscape, both
 * @returns
 */
EPUB.prototype.spread = function(str) {
  this.__data__.renditionSpread = str || null;
  return this;
};
/**
 *
 * @param {string} str auto, paginated, scrolled-continuous, scrolled-doc
 * @returns
 */
EPUB.prototype.flow = function(str) {
  this.__data__.renditionFlow = str || null;
  return this;
};
/**
 * Only support image/jpeg type.
 * @param {string} base64
 * @returns
 */
EPUB.prototype.cover = function(base64) {
  this.__data__.cover = base64;
  return this;
};
/**
 *
 * @param {string} str
 * @returns
 */
EPUB.prototype.tag = function(str) {
  this.__data__.tags.push(str);
  return this;
};
/**
 *
 * @param {string} str
 * @param {object} properties { rel, type, media, class, title... }
 * @returns
 */
EPUB.prototype.style = function(str, properties) {
  if (!properties) {
    properties = {};
  }

  const id = util.id();

  properties.rel = properties.rel || "stylesheet";
  properties.type = properties.type || "text/css";
  properties.href = getRelativePath(`EPUB/${id}.css`);

  this.__data__.style += `\n<link${renderProps(properties)} />`;

  this.setFile({
    path: `EPUB/${id}.css`,
    data: str,

    manifest: {
      id: id,
      href: getRelativePath(`EPUB/${id}.css`),
      mediaType: "text/css",
    },
  });

  return this;
};
/**
 *
 * @param {Date} date
 * @returns
 */
EPUB.prototype.publishedAt = function(date) {
  this.__data__.publishedAt = date;
  return this;
};
/**
 *
 * @param {Date} date
 * @returns
 */
EPUB.prototype.modifiedAt = function(date) {
  this.__data__.modifiedAt = date;
  return this;
};
/**
 *
 * @returns
 */
EPUB.prototype.add = function() {
  let self = this,
    _id = util.id(),
    _path = `EPUB/${_id}.xhtml`,
    _title = DEFAULT_CHAPTER_TITLE,
    _language = this.__data__.language,
    _textDirection = this.__data__.textDirection,
    _body = "",
    _head = "",
    _style = "",
    _renditionLayout = null, // https://www.w3.org/TR/epub-33/#layout-overrides
    _renditionOrientation = null, // https://www.w3.org/TR/epub-33/#orientation-overrides
    _renditionSpread = null, // https://www.w3.org/TR/epub-33/#spread-overrides
    _renditionSpreadPlacement = null, // https://www.w3.org/TR/epub-33/#page-spread
    _renditionFlow = null, // https://www.w3.org/TR/epub-33/#flow-overrides
    _landmarks = [],
    _toc = [],
    _files = [];

  const pipe = {
    /**
     *
     * @returns
     */
    getId: function() {
      return _id;
    },
    /**
     *
     * @returns
     */
    getPath: function() {
      return getRelativePath(_path);
    },
    /**
     *
     * @param {string} str
     * @param {object} properties { id, class... }
     * @param {string} elementId optional, without #
     * @returns
     */
    getLink: function(str, properties, elementId) {
      delete properties.href; // fix
      return `<a href="${getRelativePath(_path + (elementId ? "#" + elementId : ""))}"${renderProps(properties)}>${str}</a>`;
    },
    /**
     *
     * @returns
     */
    getStyle: function() {
      return _style;
    },
    /**
     *
     * @returns
     */
    getData: function() {
      return `
<?xml version="1.0" encoding="UTF-8"?>
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="${_language}" lang="${_language}" dir="${_textDirection}" xmlns:epub="http://www.idpf.org/2007/ops">
<head>
<meta charset="utf-8"></meta>
<title>${_title}</title>${_head}${self.__data__.style}${_style}
</head>
<body>${_body}
</body>
</html>
      `.trim();
    },
    /**
     *
     * @param {string} str
     * @returns
     */
    title: function(str) {
      _title = str || DEFAULT_CHAPTER_TITLE;
      return pipe;
    },
    /**
     *
     * @param {string} str en, ko, ja...
     * @returns
     */
    language: function(str) {
      _language = str;
      return pipe;
    },
    /**
     *
     * @param {string} str auto, ltr, rtl
     * @returns
     */
    textDirection: function(str) {
      _textDirection = str;
      return pipe;
    },
    /**
     *
     * @param {string} str reflowable, pre-paginated
     */
    layout: function(str) {
      _renditionLayout = str ? `rendition:layout-${str}` : null;
    },
    /**
     *
     * @param {string} str auto, landscape, portrait
     */
    orientation: function(str) {
      _renditionOrientation = str ? `rendition:orientation-${str}` : null;
    },
    /**
     *
     * @param {string} str auto, both, landscape, none
     */
    spread: function(str) {
      _renditionSpread = str ? `rendition:spread-${str}` : null;
    },
    /**
     *
     * @param {string} str center, left, right
     */
    spreadPlacement: function(str) {
      _renditionSpreadPlacement = str ? `rendition:page-spread-${str}` : null;
    },
    /**
     *
     * @param {string} str auto, paginated, scrolled-continuous, scrolled-doc
     */
    flow: function(str) {
      _renditionFlow = str ? `rendition:flow-${str}` : null;
    },
    /**
     *
     * @param {string} str
     * @returns
     */
    head: function(str) {
      _head += "\n" + str;
      return pipe;
    },
    /**
     *
     * @param {string} str
     * @param {object} properties { rel, type, title, class, media... }
     * @returns
     */
    style: function(str, properties) {
      if (!properties) {
        properties = {};
      }

      const id = util.id();

      properties.rel = properties.rel || "stylesheet";
      properties.type = properties.type || "text/css";
      properties.href = getRelativePath(`EPUB/${id}.css`);

      _style += `\n<link${renderProps(properties)} />`;

      _files.push({
        path: `EPUB/${id}.css`,
        data: str,

        manifest: {
          id: id,
          href: getRelativePath(`EPUB/${id}.css`),
          mediaType: "text/css",
        },
      });

      return pipe;
    },
    /**
     *
     * @param {string} str <p>Line...</p>
     * @returns
     */
    body: function(str) {
      _body += "\n" + str;
      return pipe;
    },
    /**
     *
     * @param {boolean} type open, close
     * @param {object} properties { id, class... }
     * @returns
     */
    section: function(type, properties) {
      _body += type ? `\n<section${renderProps(properties)}>` : `\n</section>`;
      return pipe;
    },
    /**
     *
     * @param {string} str
     * @param {object} properties { id, class... }
     * @returns
     */
    h1: function(str, properties) {
      _body += `\n<h1${renderProps(properties)}>${str}</h1>`;
      return pipe;
    },
    /**
     *
     * @param {string} str
     * @param {object} properties { id, class... }
     * @returns
     */
    h2: function(str, properties) {
      _body += `\n<h2${renderProps(properties)}>${str}</h2>`;
      return pipe;
    },
    /**
     *
     * @param {string} str
     * @param {object} properties { id, class... }
     * @returns
     */
    h3: function(str, properties) {
      _body += `\n<h3${renderProps(properties)}>${str}</h3>`;
      return pipe;
    },
    /**
     *
     * @param {string} str
     * @param {object} properties { id, class... }
     * @returns
     */
    h4: function(str, properties) {
      _body += `\n<h4${renderProps(properties)}>${str}</h4>`;
      return pipe;
    },
    /**
     *
     * @param {string} str
     * @param {object} properties { id, class... }
     * @returns
     */
    h5: function(str, properties) {
      _body += `\n<h5${renderProps(properties)}>${str}</h5>`;
      return pipe;
    },
    /**
     *
     * @param {string} str
     * @param {object} properties { id, class... }
     * @returns
     */
    h6: function(str, properties) {
      _body += `\n<h6${renderProps(properties)}>${str}</h6>`;
      return pipe;
    },
    /**
     *
     * @param {string} str
     * @param {object} properties { id, class... }
     * @returns
     */
    p: function(str, properties) {
      _body += `\n<p${renderProps(properties)}>${str}</p>`;
      return pipe;
    },
    /**
     *
     * @param {string} str
     * @param {object} properties { id, class... }
     * @returns
     */
    span: function(str, properties) {
      _body += `\n<span${renderProps(properties)}>${str}</span>`;
      return pipe;
    },
    /**
     *
     * @param {string} str
     * @param {object} properties { id, class, href... }
     * @returns
     */
    a: function(str, properties) {
      _body += `\n<a${renderProps(properties)}>${str}</a>`;
      return pipe;
    },
    /**
     *
     * @param {boolean} type open, close
     * @param {object} properties { id, class... }
     * @returns
     */
    ol: function(type, properties) {
      _body += type ? `\n<ol${renderProps(properties)}>` : `</ol>`;
      return pipe;
    },
    /**
     *
     * @param {boolean} type open, close
     * @param {object} properties { id, class... }
     * @returns
     */
    ul: function(type, properties) {
      _body += type ? `\n<ul${renderProps(properties)}>` : `</ul>`;
      return pipe;
    },
    /**
     *
     * @param {string} str
     * @param {object} properties { id, class... }
     * @returns
     */
    li: function(str, properties) {
      _body += `\n<li${renderProps(properties)}>${str}</li>`;
      return pipe;
    },
    /**
     *
     * @param {string} base64 image/jpeg type has been allowed type without base64 header.
     * @param {object} properties { id, class... }
     * @returns
     */
    img: function(base64, properties) {
      if (!properties) {
        properties = {};
      }

      const id = util.id();
      const mime = getMimetypeFromBase64(base64) || "image/jpeg";
      const ext = getExtensionFromMimetype(mime) || ".jpg";
      const path = `EPUB/${id}${ext}`;

      properties.src = getRelativePath(path);

      _files.push({
        path: path,
        data: removeHeaderFromBase64(base64),
        encoding: "base64",

        manifest: {
          id: id,
          href: getRelativePath(path),
          mediaType: mime,
        },
      });

      _body += `\n<img${renderProps(properties)} />`;
      return pipe;
    },
    /**
     *
     * @param {string} base64 default audio/mpeg, .mp3
     * @param {object} properties { id, class, controls... }
     * @returns
     */
    audio: function(base64, properties) {
      if (!properties) {
        properties = {};
      }

      const id = util.id();
      const mime = getMimetypeFromBase64(base64) || "audio/mpeg";
      const ext = getExtensionFromMimetype(mime) || ".mp3";
      const path = `EPUB/${id}${ext}`;

      let sourceProperties = {
        src: getRelativePath(path),
        type: mime,
      };

      _files.push({
        path: path,
        data: removeHeaderFromBase64(base64),
        encoding: "base64",

        manifest: {
          id: id,
          href: getRelativePath(path),
          mediaType: mime,
        },
      });

      _body += `\n<audio${renderProps(properties)}>\n<source${renderProps(sourceProperties)} />\n</audio>`;
      return pipe;
    },
    /**
     *
     * @param {string} base64 default video/mpeg, .mp4
     * @param {object} properties { id, class, controls, width, height, poster... }
     * @returns
     */
    video: function(base64, properties) {
      if (!properties) {
        properties = {};
      }

      const id = util.id();
      const mime = getMimetypeFromBase64(base64) || "video/mp4";
      const ext = getExtensionFromMimetype(mime) || ".mp4";
      const path = `EPUB/${id}${ext}`;

      let sourceProperties = {
        src: getRelativePath(path),
        type: mime,
      };

      _files.push({
        path: path,
        data: removeHeaderFromBase64(base64),
        encoding: "base64",

        manifest: {
          id: id,
          href: getRelativePath(path),
          mediaType: mime,
        },
      });

      _body += `\n<video${renderProps(properties)}>\n<source${renderProps(sourceProperties)} />\n</video>`;
      return pipe;
    },
    /**
     *
     * @returns
     */
    br: function() {
      _body += `\n<br />`;
      return pipe;
    },
    /**
     *
     * @param {string} title optional
     * @param {string} elementId optional
     * @returns
     */
    nav: function(title, elementId) {
      _toc.push({
        title: title || _title,
        href: getRelativePath(`${_path}${elementId ? "#" + elementId : ""}`),
      });
      return pipe;
    },
    /**
     *
     * @param {string} title optional
     * @param {string} elementId optional, without #
     * @param {string} epubType optional, default "bodymetter"
     * @returns
     */
    landmark: function(title, elementId, epubType) {
      _landmarks.push({
        href: getRelativePath(`${_path}${elementId ? "#" + elementId : ""}`),
        title: title || _title,
        epubType: epubType || "bodymatter",
      });
      return pipe;
    },
    /**
     *
     * @returns
     */
    valueOf: function() {
      return {
        path: _path,
        data: pipe.getData(),

        manifest: {
          id: _id,
          href: getRelativePath(_path),
          mediaType: "application/xhtml+xml",
        },

        spine: {
          id: _id,
          linear: true,
          properties: [
            _renditionLayout,
            _renditionOrientation,
            _renditionSpread,
            _renditionSpreadPlacement,
            _renditionFlow,
          ]
            .filter((e) => e)
            .join(" "),
        },

        toc: _toc,
        landmarks: _landmarks,
      };
    },
    /**
     *
     * @returns
     */
    exec: function() {
      self.setFile(pipe.valueOf());
      for (const file of _files) {
        self.setFile(file);
      }
      return pipe;
    },
  };

  return pipe;
};
/**
 *
 * @returns {string}
 */
EPUB.prototype.getCoverPath = function() {
  return getRelativePath(this.__data__.coverPath);
};
/**
 *
 * @returns {string}
 */
EPUB.prototype.getNavPath = function() {
  return getRelativePath(this.__data__.navPath);
};
/**
 *
 * @param {string} id id or full-path
 * @returns {string|null}
 */
EPUB.prototype.getFilePath = function(id) {
  const file = this.__files__.find(
    (e) => e.path === `EPUB/${id}.xhtml` || e.path === id,
  );
  return file ? getRelativePath(file.path) : null;
};
/**
 *
 * @returns {object[]} [{ path, data, encoding }, ...]
 */
EPUB.prototype.valueOf = function() {
  this.update();
  return this.__files__.map((e) => {
    return {
      path: e.path,
      data: e.data,
      encoding: e.encoding || "utf8",
    };
  });
};

export { EPUB };
