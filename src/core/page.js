import { generateId, objToProps, getMimetype, beautifyHTML } from "./util.js";
import { ePubDoc } from "./doc.js";
import { ePubFile } from "./file.js";
import { ePubNode } from "./node.js";

class ePubPage {
  constructor(document) {
    this.document = document;
    this.parent = document;
    this.manifest = true;
    this.spine = true;
    this.index = true;
    this._id = generateId();
    this.name = this._id;
    this.extension = ".xhtml";
    this.properties = {};
    this.nodes = [];
    this.styles = [];
    this.scripts = [];
  }
  // application/xhtml+xml
  get filename() { return `${this._id}${this.extension}`; }
  set filename(v) {}
  get type() { return getMimetype(this.extension); }
  set type(v) {}
  get path() { return this.absolutePath; }
  set path(v) {}
  get absolutePath() { return `EPUB/${this.filename}`; }
  set absolutePath(v) {}
  get relativePath() { return `${this.filename}`; }
  set relativePath(v) {}
  get href() { return this.relativePath; }
  set href(v) {}
}

ePubPage.prototype.addNode = function(tag, properties) {
  const node = new ePubNode(this, tag, properties);
  this.nodes.push(node);
  this.document.nodes.push(node);
  return node;
}

ePubPage.prototype.addStyle = function(file) {
  this.styles.push(file);
}

ePubPage.prototype.removeStyle = function(file) {
  const i = this.styles.findIndex(e => e == file);
  return i > -1 ? this.styles.splice(i, 1) : null;
}

ePubPage.prototype.addScript = function(file) {
  this.scripts.push(file);
}

ePubPage.prototype.removeScript = function(file) {
  const i = this.scripts.findIndex(e => e == file);
  return i > -1 ? this.scripts.splice(i, 1) : null;
}

ePubPage.prototype.remove = function() {
  // remove all nodes
  for (const node of this.nodes) {
    node.remove();
  }
  this.document.pages.splice(this.document.pages.findIndex(e => e == this), 1);
  return this;
}

ePubPage.prototype.toString = function() {
  const htmlProps = objToProps({
    "xmlns": "http://www.w3.org/1999/xhtml",
    "xmlns:epub": "http://www.idpf.org/2007/ops",
    "xml:lang": `${this.document.language}`,
    "lang": `${this.document.language}`,
    "dir": `${this.document.textDirection}`,
  });

  let result = "";
  result += `<?xml version="1.0" encoding="UTF-8"?>`;
  result += `<html${htmlProps}>`;
  result += `<head>`;
  result += `<title>${this.name}</title>`;
  result += `<meta charset="UTF-8" />`;
  for (const style of this.styles) {
    result += `<link rel="stylesheet" type="text/css" href="${style.relativePath}" />`;
  }
  result += `</head>`;
  result += `<body>`;
  for (const node of this.nodes) {
    result += node.toString();
  }
  for (const script of this.scripts) {
    result += `<script type="text/javascript" src="${script.relativePath}"></script>`;
  }
  result += `</body>`;
  result += `</html>`;
  return beautifyHTML(result);
}

ePubPage.prototype.toFile = function() {
  const file = new ePubFile(this.document, this.filename, this.toString(), "utf8");
  file._id = this._id;
  return file;
}

export { ePubPage }