import { dateToISOString, objToProps, generateId, beautifyHTML } from "./util.js";
import { ePubPage } from "./page.js";
import { ePubFile } from "./file.js";
import { ePubNode } from "./node.js";

class ePubDoc {
  constructor() {
    const now = new Date();

    this._id = generateId();
    this.title = "No Title";
    this.category = "No Category";
    this.tags = [];
    this.authors = [];
    this.publisher = "No Publisher";
    this.language = "en";
    this.textDirection = "auto"; // ltr, rtl, auto
    this.pageDirection = null; // ltr, rtl
    this.rendition = {
      layout: null, // pre-paginated, reflowable(default)
      orientation: null, // landscape, portrait, auto(default)
      spread: null, // none, landscape, both, auto(default)
      flow: null, // paginated, scrolled-continuous, scrolled-doc, auto(default)
    }

    this.createdAt = now.valueOf();
    this.modifiedAt = now.valueOf();
    this.publishedAt = now.valueOf();

    // https://www.w3.org/TR/epub-33/#layout
    // this.useNCX = false; // ePub2 compatibility

    this.documentType = "application/epub+zip";
    this.mimetypeAbsolutePath = "mimetype";
    this.mimetypeRelativePath = "../mimetype";
    this.containerAbsolutePath = "META-INF/container.xml";
    this.containerRelativePath = "../META-INF/container.xml";
    this.packageType = "application/oebps-package+xml";
    this.packageAbsolutePath = "EPUB/package.opf";
    this.packageRelativePath = "package.opf";
    this.ncxId = generateId();
    this.ncxType = "application/x-dtbncx+xml";
    this.ncxAbsolutePath = "EPUB/nav.ncx";
    this.ncxRelativePath = "nav.ncx";
    this.navId = generateId();
    this.navType = "application/xhtml+xml";
    this.navAbsolutePath = "EPUB/nav.xhtml";
    this.navRelativePath = "nav.xhtml";

    this.pages = [];
    this.nodes = [];
    this.files = [];
  }
}

ePubDoc.prototype.generateMimetype = function() {
  return this.documentType;
}

ePubDoc.prototype.generateContainer = function() {
  let data = "";
  data += `<?xml version="1.0"?>`;
  data += `<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">`;
  data += `<rootfiles>`;
  data += `<rootfile full-path="${this.packageAbsolutePath}" media-type="${this.packageType}"/>`;
  data += `</rootfiles>`;
  data += `</container>`;
  // return data;
  return beautifyHTML(data);
}

ePubDoc.prototype.generatePackage = function() {

  function A() {
    let result = "";
    result += `<dc:identifier id="uid">${this._id}</dc:identifier>`;
    result += `<dc:title id="title">${this.title}</dc:title>`;
  
    const authors = this.getAuthors();
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
    // ncx
    result += `<item${objToProps({
      "id": this.ncxId,
      "href": this.ncxRelativePath,
      "media-type": this.ncxType,
    })}/>`;

    // nav
    result += `<item${objToProps({
      "id": this.navId,
      "href": this.navRelativePath,
      "media-type": this.navType,
    })}/>`;
    
    // files
    for (let i = 0; i < this.files.length; i++) {
      const file = this.files[i];
      if (!file.manifest) {
        continue;
      }
      result += `<item${objToProps({
        "id": file._id,
        "href": file.relativePath,
        "media-type": file.type,
        ...file.properties,
      })}/>`;
    }

    // pages
    for (let i = 0; i < this.pages.length; i++) {
      const page = this.pages[i];
      if (!page.manifest) {
        continue;
      }
      result += `<item${objToProps({
        "id": page._id,
        "href": page.relativePath,
        "media-type": page.type,
      })}/>`;
    }
    return result;
  }

  // spine
  function C() {
    let result = "";
    // nav
    result += `<itemref${objToProps({
      "idref": this.navId,
      // "linear": "no",
    })}/>`;

    // pages
    for (let i = 0; i < this.pages.length; i++) {
      const page = this.pages[i];
      if (!page.spine) {
        continue;
      }
      result += `<itemref${objToProps({
        "idref": page._id,
        // "linear": "no",
      })}/>`;
    }
    return result;
  }

  const packageProps = objToProps({
    "xmlns": "http://www.idpf.org/2007/opf",
    "version": "3.0",
    "unique-identifier": "uid",
    "xml:lang": this.language,
    "dir": this.textDirection,
  });

  const metadataProps = objToProps({
    // for calibre
    "xmlns:dc": "http://purl.org/dc/elements/1.1/", 
  });
  
  const manifestProps = objToProps({});

  const spineProps = objToProps({
    // EPUB 2 compatibility
    "toc": "ncx",
    // flow direction
    "page-progression-direction": this.pageDirection, 
  });

  let data = "";
  data += `<?xml version="1.0" encoding="UTF-8"?>`;
  data += `<package${packageProps}>`;
  data += `<metadata${metadataProps}>${A.apply(this)}</metadata>`;
  data += `<manifest${manifestProps}>${B.apply(this)}</manifest>`;
  data += `<spine${spineProps}>${C.apply(this)}</spine>`;
  data += `</package>`;
  // return data;
  return beautifyHTML(data);
}

ePubDoc.prototype.generateNCX = function() {

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
    for (const author of this.getAuthors()) {
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
        result += `<navPoint${objToProps({ id: item._id })}>`;
        result += `<navLabel><text>${item.name}</text></navLabel>`;
        result += `<content src="${item.href}"/>`;
        result += C(item.nodes);
        result += `</navPoint>`;
      }
    }
    return result;
  }

  const ncxProps = objToProps({
    "xmlns:m": "http://www.w3.org/1998/Math/MathML",
    "xmlns": "http://www.daisy.org/z3986/2005/ncx/",
    "version": "2005-1",
    "xml:lang": this.language,
  });

  let data = "";
  data += `<?xml version="1.0" encoding="utf-8"?>`;
  data += `<ncx${ncxProps}>`;
  data += `<head>${A.apply(this)}</head>`;
  data += `${B.apply(this)}`;
  data += `<navMap>${C(this.pages)}</navMap>`;
  data += `</ncx>`;
  // return data;
  return beautifyHTML(data);
}

ePubDoc.prototype.generateNav = function() {
  function A(items) {
    let hasIndex = false;
    for (const item of items) {
      if (item.index) {
        hasIndex = true;
        break;
      }
    }

    let result = "";
    if (hasIndex) {
      result += "<ol>";
    }
    for (const item of items) {
      if (!item.index) {
        result += A(item.nodes);
      } else {
        result += `<li><a href="${item.href}">${item.name}</a>${A(item.nodes)}</li>`;
      }
    }
    if (hasIndex) {
      result += "</ol>";
    }
    return result;
  }

  const htmlProps = objToProps({
    "xmlns": "http://www.w3.org/1999/xhtml",
    "xml:lang": this.language,
    "xmlns:epub": "http://www.idpf.org/2007/ops",
    "lang": this.language,
    "dir": this.textDirection,
  });

  let data = "";
  data += `<?xml version="1.0" encoding="UTF-8"?>`;
  data += `<html${htmlProps}>`;
  data += `<head>`;
  data += `<meta charset="utf-8"/>`;
  data += `<title>Index</title>`;
  data += `<style></style>`;
  data += `</head>`;
  data += `<body>`;
  data += `<nav epub:type="toc" id="toc">`;
  data += `<h1>Table of contents</h1>`;
  data += `${A(this.pages)}`;
  data += `</nav>`;
  // data += `<nav epub:type="page-list" id="page-list">`;
  // data += `<h1>Page list</h1>`;
  // data += `<ol></ol>`;
  // data += `</nav>`;
  // data += `<nav epub:type="landmarks" id="landmarks">`;
  // data += `<h1>Landmarks</h1>`;
  // data += `<ol></ol>`;
  // data += `</nav>`;
  data += `</body>`;
  data += `</html>`;
  // return data;
  return beautifyHTML(data);
}

ePubDoc.prototype.getAuthors = function() {
  return this.authors.length > 0 ? this.authors : ["Anonymous"];
}

ePubDoc.prototype.getLastPage = function() {
  return this.pages[this.pages.length - 1];
}

ePubDoc.prototype.getLastPageId = function() {
  return this.getLastPage() ? this.getLastPage()._id : -1;
}

ePubDoc.prototype.getLastNode = function() {
  return this.nodes[this.nodes.length - 1];
}

ePubDoc.prototype.getLastNodeId = function() {
  return this.getLastNode() ? this.getLastNode()._id : -1;
}

ePubDoc.prototype.getLastFile = function() {
  return this.files[this.files.length - 1];
}

ePubDoc.prototype.getLastFileId = function() {
  return this.getLastFile() ? this.getLastFile()._id : -1;
}

ePubDoc.prototype.addPage = function() {
  const page = new ePubPage(this);
  this.pages.push(page);
  return page;
}

ePubDoc.prototype.addCover = function(filename, data, encoding) {
  const file = new ePubFile(this, filename, data, encoding);
  file.properties.properties = "cover-image";
  this.files.push(file);
  return file;
}

ePubDoc.prototype.addFile = function(filename, data, encoding) {
  const file = new ePubFile(this, filename, data, encoding);
  this.files.push(file);
  return file;
}

ePubDoc.prototype.toFiles = function() {
  let files = [{
    path: this.mimetypeAbsolutePath,
    data: this.generateMimetype(),
    encoding: "utf8",
  }, {
    path: this.containerAbsolutePath,
    data: this.generateContainer(),
    encoding: "utf8",
  }, {
    path: this.packageAbsolutePath,
    data: this.generatePackage(),
    encoding: "utf8",
  }, {
    path: this.ncxAbsolutePath,
    data: this.generateNCX(),
    encoding: "utf8",
  }, {
    path: this.navAbsolutePath,
    data: this.generateNav(),
    encoding: "utf8",
  }];

  for (const file of this.files) {
    files.push({
      path: file.absolutePath,
      data: typeof file.data === "function" ? file.data() : file.data,
      encoding: file.encoding,
    });
  }

  for (const page of this.pages) {
    // const file = page.toFile();
    // files.push({
    //   path: file.absolutePath,
    //   data: typeof file.data === "function" ? file.data() : file.data,
    //   encoding: file.encoding,
    // });

    files.push({
      path: page.absolutePath,
      data: page.toString(),
      encoding: "utf8",
    });
  }

  return files;
}

export { ePubDoc }