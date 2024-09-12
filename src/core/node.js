import { objToProps, generateId } from "./util.js";
import { ePubDoc } from "./doc.js";
import { ePubPage } from "./page.js";
import { ePubFile } from "./file.js";

class ePubNode {
  constructor(parent, tag, properties = {}) {
    if (parent instanceof ePubPage) {
      this.document = parent.document;
      this.page = parent;
    } else if (parent instanceof ePubNode) {
      this.document = parent.document;
      this.page = parent.page;
    }
    this.index = false;
    this._id = generateId();
    this.title = "No Title";
    this.tag = tag;
    this.content = "";
    this.properties = properties;
    this.nodes = [];
    this.files = [];
  }
  get id() { return this.properties.id; }
  set id(v) { this.properties.id = v; }
  get class() { return this.properties.class; }
  set class(v) { this.properties.class = v; }
  get style() { return this.properties.style; }
  set style(v) { this.properties.style = v; }
  get href() { return `${this.page.relativePath}#${this.properties.id}`; }
  set href(v) {}
}

ePubNode.prototype.addNode = function(tag, properties) {
  const node = new ePubNode(this, tag, properties);
  this.nodes.push(node);
  this.document.nodes.push(node);
  return node;
}

ePubNode.prototype.addFile = function(file) {
  this.files.push(file);
  return file;
}

ePubNode.prototype.removeFile = function(file) {
  const i = this.files.findIndex(e => e == file);
  return i > -1 ? this.files.splice(i, 1) : null;
}

ePubNode.prototype.remove = function() {
  // remove children
  for (const node of this.nodes) {
    node.remove();
  }

  this.document.nodes.splice(this.document.nodes.findIndex(e => e == this), 1);
  
  // remove reference in node
  for (const node of this.document.nodes) {
    const i = node.nodes.findIndex(e => e == this);
    if (i > -1) {
      node.nodes.splice(i, 1);
      break;
    }
  }

  return this;
}

ePubNode.prototype.toString = function() {
  const tag = this.tag;
  if (["br"].indexOf(tag) > -1) {
    return `<br />`;
  } else if (["input", "button"].indexOf(tag) > -1) {
    return `<${tag}${objToProps(this.properties)}/>`;
  } else if (["img"].indexOf(tag) > -1) {
    const props = objToProps(Object.assign({}, properties, { src: this.files[0]?.relativePath || "" }));
    return `<${tag}${props}/>`;
  } else if (["audio", "video"].indexOf(tag) > -1) {
    const content = this.files.map(e => `<source src="${e.relativePath}" type="${e.type}">`).join("");
    return `<${tag}${objToProps(this.properties)}>${content}</${tag}>`;
  } else if (["picture"].indexOf(tag) > -1) {
    const content = this.files.map(e => `<source srcset="${e.relativePath}" type="${e.type}">`).join("");
    return `<${tag}${objToProps(this.properties)}>${content}</${tag}>`;
  } else if (this.nodes.length > 0) {
    return `<${tag}${objToProps(this.properties)}>${this.nodes.map(e => e.toString()).join("")}</${tag}>`;
  } else {
    return `<${tag}${objToProps(this.properties)}>${this.content}</${tag}>`;
  }
}

export { ePubNode }