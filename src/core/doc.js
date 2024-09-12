import { dateToISOString, objToProps, generateId, beautifyHTML, beautifyCSS, beautifyJS } from "./util.js";
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
    this.mimetypePath = "mimetype";
    this.containerPath = "META-INF/container.xml";
    this.packagePath = "EPUB/package.opf";
    this.packageType = "application/oebps-package+xml";
    this.ncxId = generateId();
    this.ncxType = "application/x-dtbncx+xml";
    this.ncxPath = "EPUB/nav.ncx";
    this.navId = generateId();
    this.navType = "application/xhtml+xml";
    this.navPath = "EPUB/nav.xhtml";

    this.pages = [];
    this.nodes = [];
    this.files = [];
  }
}

ePubDoc.prototype.generateMimetype = function() {
  return this.documentType;
}

ePubDoc.prototype.generateContainer = function() {
  const data = `
<?xml version="1.0"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
<rootfiles>
<rootfile full-path="${this.packagePath}" media-type="${this.packageType}"/>
</rootfiles>
</container>
    `;

  return data.trim();
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
    result += `<dc:language>${this.language}</dc:publisher>`;
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
  
    for (let [k, v] of Object.keys(this.rendition)) {
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
      "href": this.ncxPath,
      "media-type": this.ncxType,
    })}/>`;

    // nav
    result += `<item${objToProps({
      "id": this.navId,
      "href": this.navPath,
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

  const data = `
<?xml version="1.0" encoding="UTF-8"?>
<package${packageProps}>
<metadata${metadataProps}>${A.apply(this)}</metadata>
<manifest${manifestProps}>${B.apply(this)}</manifest>
<spine${spineProps}>${C.apply(this)}</spine>
</package>
    `;

  return data.trim();
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
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item.index) {
        continue;
      }
      result += `<navPoint${objToProps({ id: item._id })}">`;
      result += `<navLabel><text>${item.title}</text></navLabel>`;
      result += `<content src="${item.href}"/>`;
      result += C(item.nodes);
      result += `</navPoint>`;
    }
    return result;
  }

  const ncxProps = objToProps({
    "xmlns:m": "http://www.w3.org/1998/Math/MathML",
    "xmlns": "http://www.daisy.org/z3986/2005/ncx/",
    "version": "2005-1",
    "xml:lang": this.language,
  });

  const data = `
<?xml version="1.0" encoding="utf-8"?>
<ncx${ncxProps}>
<head>${A.apply(this)}</head>
${B.apply(this)}
<navMap>${C.apply(this, [this.pages])}</navMap>
</ncx>
    `;

  return data.trim();
}

ePubDoc.prototype.generateNav = function() {
  function A(items) {
    let result = "";
    for (const item of items) {
      result += `<li><a href="${item.href}">${item.title}</a>${A(item.nodes)}</li>`;
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

  const data = `
<?xml version="1.0" encoding="UTF-8"?>
<html${htmlProps}>
<head>
<meta charset="utf-8"/>
<title>Index</title>
<style></style>
</head>
<body>
<nav epub:type="toc" id="toc">			
<h1>Table of contents</h1>
<ol>${A.apply(this, [this.pages])}</ol>
</nav>
<nav epub:type="page-list" id="page-list">
<h1>Page list</h1>
<ol></ol>
</nav>
<nav epub:type="landmarks" id="landmarks">
<h1>Landmarks</h1>
<ol></ol>
</nav>
</body>
</html>
    `;

  return data.trim();
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

ePubDoc.prototype.addFile = function(filename, data, encoding) {
  const filePath = `EPUB/${filename}`;
  const file = new ePubFile(this, filePath, data, encoding);
  this.files.push(file);
  return file;
}

ePubDoc.prototype.getFiles = function() {
  let pages = [];
  for (let i = 0; i < this.pages.length; i++) {
    const file = this.pages[i].toFile();
    file._id += i;
    pages.push(file);
  }
  return [...this.files, ...pages];
}

ePubDoc.prototype.toFiles = function() {
  let files = [{
    path: this.mimetypePath,
    data: this.generateMimetype(),
    encoding: "utf8",
  }, {
    path: this.containerPath,
    data: this.generateContainer(),
    encoding: "utf8",
  }, {
    path: this.packagePath,
    data: this.generatePackage(),
    encoding: "utf8",
  }, {
    path: this.ncxPath,
    data: this.generateNCX(),
    encoding: "utf8",
  }, {
    path: this.navPath,
    data: this.generateNav(),
    encoding: "utf8",
  }];

  for (const file of this.getFiles()) {
    files.push({
      path: file.path,
      data: typeof file.data === "function" ? file.data() : file.data,
      encoding: file.encoding,
    });
  }

  return files;
}

export { ePubDoc }