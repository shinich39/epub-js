import { getMimetype, getExtension, generateId, beautifyCSS, beautifyJS } from "./util.js";
import { ePubDoc } from "./doc.js";
import { ePubPage } from "./page.js";
import { ePubNode } from "./node.js";

class ePubFile {
  constructor(document, filename, data, encoding = "utf8") {
    const extension = "."+filename.split(".").pop();

    // TODO: extention error

    this.document = document;
    this.manifest = true;
    this._id = generateId();
    this.name = this._id;
    this.extension = extension;
    this.data = data;
    this.encoding = encoding;
    this.properties = {};
  }
  get filename() { return `${this._id}${this.extension}`; }
  set filename(v) {}
  get type() { return getMimetype(this.extension); }
  set type(v) {}
  get isStyle() { return this.type == "text/css"; }
  set isStyle(v) {}
  get isScript() { return this.type == "application/javascript"; }
  set isScript(v) {}
  get path() { return this.absolutePath; }
  set path(v) {}
  get absolutePath() { return `EPUB/${this.filename}`; }
  set absolutePath(v) {}
  get relativePath() { return `${this.filename}`; }
  set relativePath(v) {}
}

ePubFile.prototype.remove = function() {
  this.document.files.splice(this.document.files.findIndex(e => e == this), 1);

  // remove all references in nodes
  for (const node of this.document.nodes) {
    // properties
    // for (const key of Object.keys(node.properties)) {
    //   if (node.properties[key] == this) {
    //     delete node.properties[key];
    //   }
    // }

    // files
    for (let i = node.files.length - 1; i >= 0; i--) {
      const f = node.files[i];
      if (f == this) {
        node.files.splice(i, 1);
      }
    }
    
    // styles
    for (let i = node.styles.length - 1; i >= 0; i--) {
      const f = node.styles[i];
      if (f == this) {
        node.styles.splice(i, 1);
      }
    }

    // scripts
    for (let i = node.scripts.length - 1; i >= 0; i--) {
      const f = node.scripts[i];
      if (f == this) {
        node.scripts.splice(i, 1);
      }
    }
  }

  return this;
}

ePubFile.prototype.toString = function() {
  if (this.type == "text/css") {
    return `<link rel="stylesheet" type="text/css" href="${this.relativePath}">`;
  } else if (this.type == "text/javascript") {
    return `<script type="text/javascript" src="${this.relativePath}"></script>`;
  }
}


export { ePubFile }