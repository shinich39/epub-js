"use strict";

import { ePubFile } from "./file.js";
import {
  getContainedNumber,
  isArray,
  isObject,
  isObjectArray,
  queryObject,
} from "utils-js";
import { deepcopy, isFile, updateObject } from "../libs/utilities.js";
import { v4 as uuidv4 } from "uuid";

// apple books asset guide
// https://itunespartner.apple.com/books/support/4853-now-accepting-images-million-pixels
// size <= 2366.43191324 x 2366.43191324
const MAX_IMAGE_PIXELS = 5600000; 

export const FILE_TYPES = {
  /**
   * @example
   * const pageFile = new ePubFile(ePubFile.types.xhtml, {
   *     path: "EPUB/pages/1.xhtml"
   *   })
   *   .updateNode(
   *     { tag: "head" },
   *     { $push: { children: [ YOUR_HEAD_NODE, ... ] }
   *   })
   *   .updateNode(
   *     { tag: "body" },
   *     { $push: { children: [ YOUR_BODY_NODE, ... ] }
   *   })
   */
  xhtml: {
    children: [
      {
        tag: "?xml",
        closer: "?",
        attributes: {
          version: "1.0",
          encoding: "UTF-8",
        },
      },
      {
        tag: "!DOCTYPE",
        closer: "",
        attributes: {
          html: true,
        },
      },
      {
        tag: "html",
        attributes: {
          xmlns: "http://www.w3.org/1999/xhtml",
          "xmlns:epub": "http://www.idpf.org/2007/ops",
          "xml:lang": null,
          lang: null,
          dir: null,
        },
        children: [
          {
            tag: "head",
            children: [
              {
                tag: "title",
                children: [
                  {
                    content: "",
                  },
                ],
              },
              {
                tag: "meta",
                closer: " /",
                attributes: {
                  charset: "utf-8",
                },
              },
            ],
          },
          {
            tag: "body",
          },
        ],
      },
    ],
  },
  smil: {
    children: [
      {
        tag: "?xml",
        closer: "?",
        attributes: {
          version: "1.0",
          encoding: "UTF-8",
        },
      },
      {
        tag: "smil",
        attributes: {
          xmlns: "http://www.w3.org/ns/SMIL",
          "xmlns:epub": "http://www.idpf.org/2007/ops",
          version: "3.0",
        },
        children: [
          {
            tag: "body",
            // smil <seq> => page <...>
            // children: [{
            //   tag: "seq",
            //   attributes: {
            //     id: "?",
            //     "epub:textref": "chapter1.xhtml#figure",
            //   }
            // }]
          },
        ],
      },
    ],
  },
  mimetype: {
    path: "mimetype",
    data: "application/epub+zip",
  },
  container: {
    path: "META-INF/container.xml",
    children: [
      {
        tag: "?xml",
        closer: "?",
        attributes: {
          version: "1.0",
          encoding: "UTF-8",
        },
      },
      {
        tag: "container",
        attributes: {
          version: "1.0",
          xmlns: "urn:oasis:names:tc:opendocument:xmlns:container",
        },
        children: [
          {
            tag: "rootfiles",
            children: [
              {
                tag: "rootfile",
                closer: " /",
                attributes: {
                  "full-path": "EPUB/package.opf",
                  "media-type": "application/oebps-package+xml",
                },
              },
            ],
          },
        ],
      },
    ],
  },
  package: {
    path: "EPUB/package.opf",
    children: [
      {
        tag: "?xml",
        closer: "?",
        attributes: {
          version: "1.0",
          encoding: "UTF-8",
        },
      },
      /**
       * new ePubFile(ePubFile.types.package)
       */
      {
        tag: "package",
        attributes: {
          xmlns: "http://www.idpf.org/2007/opf",
          version: "3.0",
          "unique-identifier": "bookid",
          "xml:lang": null,
          // https://www.w3.org/TR/epub-33/#attrdef-dir
          dir: null,
        },
        children: [
          {
            tag: "metadata",
            attributes: {
              "xmlns:opf": "http://www.idpf.org/2007/opf",
              "xmlns:dc": "http://purl.org/dc/elements/1.1/",
              "xmlns:dcterms": "http://purl.org/dc/terms/",
            },
            children: [
              {
                tag: "dc:identifier",
                attributes: {
                  id: "bookid",
                },
                // update after create a package file
                // children: [{
                //   content: "urn:uuid:"+uuidv4(),
                // }],
              },
              {
                tag: "dc:language",
                children: [
                  {
                    content: "en",
                  },
                ],
              },
              {
                tag: "dc:title",
                attributes: {
                  id: "title",
                },
                children: [
                  {
                    content: "Untitled",
                  },
                ],
              },
              {
                tag: "meta",
                attributes: {
                  property: "dcterms:modified",
                },
                children: [
                  {
                    content: new Date().toISOString(),
                  },
                ],
              },
              // <meta property="rendition:...">...</meta>
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
          },
          {
            tag: "manifest",
          },
          {
            tag: "spine",
            attributes: {
              // https://www.w3.org/TR/epub-33/#attrdef-spine-page-progression-direction
              "page-progression-direction": null,
            },
          },
        ],
      },
    ],
  },
  nav: {
    path: "EPUB/nav.xhtml",
    children: [
      {
        tag: "?xml",
        closer: "?",
        attributes: {
          version: "1.0",
          encoding: "UTF-8",
        },
      },
      {
        tag: "!DOCTYPE",
        closer: "",
        attributes: {
          html: true,
        },
      },
      {
        tag: "html",
        attributes: {
          xmlns: "http://www.w3.org/1999/xhtml",
          "xmlns:epub": "http://www.idpf.org/2007/ops",
          "xml:lang": null,
          lang: null,
          dir: null,
        },
        children: [
          {
            tag: "head",
            children: [
              {
                tag: "title",
                children: [
                  {
                    content: "Untitled",
                  },
                ],
              },
              {
                tag: "meta",
                closer: " /",
                attributes: {
                  charset: "utf-8",
                },
              },
            ],
          },
          {
            tag: "body",
            children: [
              {
                tag: "nav",
                attributes: {
                  "epub:type": "toc",
                  id: "toc",
                  role: "doc-toc",
                },
                children: [
                  {
                    tag: "h1",
                    children: [
                      {
                        content: "Table of Contents",
                      },
                    ],
                  },
                  {
                    tag: "ol",
                  },
                ],
              },
              {
                tag: "nav",
                attributes: {
                  "epub:type": "landmarks",
                  id: "landmarks",
                  hidden: "",
                },
                children: [
                  {
                    tag: "h2",
                    children: [
                      {
                        content: "Landmarks",
                      },
                    ],
                  },
                  {
                    tag: "ol",
                    children: [
                      {
                        tag: "li",
                        children: [
                          {
                            tag: "a",
                            attributes: {
                              "epub:type": "toc",
                              href: "#toc",
                            },
                            children: [
                              {
                                content: "Table of Contents",
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  ncx: {
    path: "EPUB/toc.ncx",
    children: [
      {
        tag: "?xml",
        closer: "?",
        attributes: {
          version: "1.0",
          encoding: "UTF-8",
        },
      },
      {
        tag: "ncx",
        attributes: {
          "xmlns:m": "http://www.w3.org/1998/Math/MathML",
          xmlns: "http://www.daisy.org/z3986/2005/ncx/",
          version: "2005-1",
          "xml:lang": null,
        },
        children: [
          {
            tag: "head",
            children: [
              {
                tag: "meta",
                closer: " /",
                attributes: {
                  name: "dtb:uid",
                  // update after create a ncx page
                  // ncxFile.updateNode({
                  //   "attributes.name": "dtb:uid"
                  // }, {
                  //   $set: {
                  //     "content": doc.findNode({
                  //         tag: "dc:identifier",
                  //         "attributes.id": "bookid"
                  //       }).getContent()
                  //   }
                  // });
                  content: "",
                },
              },
              {
                tag: "meta",
                closer: " /",
                attributes: {
                  name: "dtb:depth",
                  content: "1",
                },
              },
              {
                tag: "meta",
                closer: " /",
                attributes: {
                  name: "dtb:totalPageCount",
                  content: "0",
                },
              },
              {
                tag: "meta",
                closer: " /",
                attributes: {
                  name: "dtb:maxPageNumber",
                  content: "0",
                },
              },
            ],
          },
          {
            tag: "docTitle",
            children: [
              {
                tag: "text",
                children: [
                  {
                    content: "Untitled",
                  },
                ],
              },
            ],
          },
          {
            tag: "navMap",
          },
        ],
      },
    ],
  },
};

export const NODE_TYPES = {
  /**
   * append to manifest node
   * @property {object} attribtues
   * @property {string} attribtues.id - required
   * @property {string} attribtues.href - required
   * @property {string} attribtues.media-type - required
   * @example
   * const manifestNode = new ePubNode(ePubNode.types.item)
   *   .setAttirbute("id", file._id)
   *   .setAttirbute("href", file.getRelativePath(packageFile))
   *   .setAttirbute("media-type", file.mimetype)
   */
  item: {
    tag: "item",
    closer: " /",
    attributes: {
      id: "",
      href: "",
      "media-overlay": null,
      "media-type": "",
      properties: null,
      fallback: null,
    },
  },
  /**
   * append to spine node
   * @property {object} attribtues
   * @property {string} attribtues.id - required
   * @property {"yes"|"no"|null} attribtues.linear
   * @example
   * const spineNode = new ePubNode(ePubNode.types.itemref)
   *   .setAttribute("idref", file._id);
   *   .setAttribute("linear", "no");
   */
  itemref: {
    tag: "itemref",
    closer: " /",
    attributes: {
      id: "",
      idref: null,
      linear: null,
      properties: null,
    },
  },
  /**
   * Append to body node of smil file
   * @property {object} attribtues
   * @property {string} attribtues.epub:textref - required
   * @example
   * const seqNode = new ePubNode(ePubNode.types.seq)
   *   .setAttribute("epub:textref", file.getRelPath(smilFile));
   */
  seq: {
    tag: "seq",
    attributes: {
      "epub:textref": "",
    },
  },
  /**
   * append to seq node of smil file
   * @property {object} attribtues
   * @property {string} attribtues.children.[0].attributes.src - required text node path
   * @property {string} attribtues.children.[1].attributes.src - required audio file path
   * @example
   * const parNode = new ePubNode(ePubNode.types.par)
   *   .updateNode({ tag: "text" }, { $set: { "attribtues.src": textNode.getRelPath(smilFile) } });
   *   .updateNode({ tag: "audio" }, { $set: { "attribtues.src": audioFile.getRelPath(smilFile) } });
   */
  par: {
    tag: "par",
    children: [
      {
        tag: "text",
        closer: "/",
        attributes: {
          src: "",
        },
      },
      {
        tag: "audio",
        closer: "/",
        attributes: {
          clipBegin: null,
          clipEnd: null,
          src: "",
        },
      },
    ],
  },
};

export const UTILS = {
  isValidImageSize: function (width, height) {
    return width * height <= MAX_IMAGE_PIXELS;
  },
  calcMaxValidImageSize: function (width, height) {
    const aspectRatio = width / height;
    const h = Math.floor(Math.sqrt(MAX_IMAGE_PIXELS * aspectRatio));
    const w = h * aspectRatio;
    return [w, h];
  },
  calcValidImageSize: function (width, height) {
    const [w, h] = this.calcMaxValidImageSize(width, height);
    if (width > w || height > h) {
      return [w, h];
    } else {
      return [width, height];
    }
  },
};

export class ePubDoc {
  /**
   *
   * @param {...object} objs
   * @param {ePubFile[]} objs[].files
   */
  constructor(...objs) {

    // default 3 files
    // mimetype
    // META-INF/container.xml
    // package.opf
    this.files = [
      new ePubFile(FILE_TYPES.mimetype),
      new ePubFile(FILE_TYPES.container),
      new ePubFile(FILE_TYPES.package).updateNode(
        {
          tag: "dc:identifier",
        },
        {
          $set: {
            children: [
              {
                // generate book id
                content: "urn:uuid:" + uuidv4(),
              },
            ],
          },
        }
      ),
    ];

    // import data
    if (isObjectArray(objs)) {
      Object.assign(this, ...objs.map((item) => deepcopy(item, true)));
    }

    this.init();
  }
}
/**
 *
 * @returns
 */
ePubDoc.prototype.init = function () {

  // convert files to ePubFile
  if (isArray(this.files)) {
    for (let i = 0; i < this.files.length; i++) {
      if (isFile(this.files[i])) {
        if (!this.files[i].document) {
          this.files[i].document = this;
          this.files[i].init();
        } else if (this.files[i].document != this) {
          this.files[i].remove();
          this.files[i].document = this;
          this.files[i].init();
        }
      } else if (isObject(this.files[i])) {
        this.files[i] = new ePubFile(this.files[i], { document: this });
      }
    }
  }

  return this;
};
/**
 *
 * @param {object} updates
 * @property {object} $set
 * @property {object} $unset
 * @property {object} $push
 * @property {object} $pushAll
 * @property {object} $pull
 * @property {object} $pullAll
 * @property {object} $addToSet
 * @property {object} $addToSetAll
 * @returns
 */
ePubDoc.prototype.update = function (updates) {
  updateObject(this, updates);
  this.init();
  return this;
};
/**
 *
 * @param {ePubFile|object} files
 * @returns
 */
ePubDoc.prototype.append = function (...files) {
  this.files = this.files.concat(files);
  this.init();
  return this;
};
/**
 *
 * @param {ePubFile|object} files
 * @returns
 */
ePubDoc.prototype.prepend = function (...files) {
  this.files = [].concat(files, this.files);
  this.init();
  return this;
};
/**
 *
 * @param {number} idx
 * @param {ePubFile|object} files
 * @returns
 */
ePubDoc.prototype.insert = function (idx, ...files) {
  idx = getContainedNumber(idx, 0, this.files.length);
  this.files.splice(idx, 0, ...files);
  this.init();
  return this;
};
/**
 *
 * @param {object} query
 * @returns
 */
ePubDoc.prototype.findFile = function (query) {
  return this.files.find((item) => queryObject(item, query));
};
/**
 *
 * @param {object} query
 * @returns
 */
ePubDoc.prototype.findFiles = function (query) {
  return this.files.filter((item) => queryObject(item, query));
};
/**
 *
 * @param {object} query
 * @param {object} updates
 * @property {object} $set
 * @property {object} $unset
 * @property {object} $push
 * @property {object} $pushAll
 * @property {object} $pull
 * @property {object} $pullAll
 * @property {object} $addToSet
 * @property {object} $addToSetAll
 * @returns
 */
ePubDoc.prototype.updateFile = function (query, updates) {
  const file = this.findFile(query);
  if (file) {
    file.update(updates);
  }
  return this;
};
/**
 *
 * @param {object} query
 * @param {object} updates
 * @param {object} updates.$set
 * @param {object} updates.$unset
 * @param {object} updates.$push
 * @param {object} updates.$pushAll
 * @param {object} updates.$pull
 * @param {object} updates.$pullAll
 * @param {object} updates.$addToSet
 * @param {object} updates.$addToSetAll
 * @returns
 */
ePubDoc.prototype.updateFiles = function (query, updates) {
  const files = this.findFiles(query);
  for (const file of files) {
    file.update(updates);
  }
  return this;
};
/**
 *
 * @param {object} query
 * @returns
 */
ePubDoc.prototype.removeFile = function (query) {
  const file = this.findFile(query);
  if (file) {
    file.remove();
  }
  return this;
};
/**
 *
 * @param {object} query
 * @returns
 */
ePubDoc.prototype.removeFiles = function (query) {
  const files = this.findFiles(query);
  for (const file of files) {
    file.remove();
  }
  return this;
};
/**
 *
 * @param {object} query
 * @returns
 */
ePubDoc.prototype.findNode = function (query) {
  for (const file of this.files) {
    const node = file.findNode(query);
    if (node) {
      return node;
    }
  }
};
/**
 *
 * @param {object} query
 * @returns
 */
ePubDoc.prototype.findNodes = function (query) {
  let result = [];
  for (const file of this.files) {
    const nodes = file.findNodes(query);
    result = result.concat(nodes);
  }
  return result;
};
/**
 *
 * @param {object} query
 * @param {object} updates
 * @param {object} updates.$set
 * @param {object} updates.$unset
 * @param {object} updates.$push
 * @param {object} updates.$pushAll
 * @param {object} updates.$pull
 * @param {object} updates.$pullAll
 * @param {object} updates.$addToSet
 * @param {object} updates.$addToSetAll
 * @returns
 */
ePubDoc.prototype.updateNode = function (query, updates) {
  const node = this.findNode(query);
  if (node) {
    node.update(updates);
  }
  return this;
};
/**
 *
 * @param {object} query
 * @param {object} updates
 * @param {object} updates.$set
 * @param {object} updates.$unset
 * @param {object} updates.$push
 * @param {object} updates.$pushAll
 * @param {object} updates.$pull
 * @param {object} updates.$pullAll
 * @param {object} updates.$addToSet
 * @param {object} updates.$addToSetAll
 * @returns
 */
ePubDoc.prototype.updateNodes = function (query, updates) {
  const nodes = this.findNodes(query);
  for (const node of nodes) {
    node.update(updates);
  }
  return this;
};
/**
 *
 * @param {object} query
 * @returns
 */
ePubDoc.prototype.removeNode = function (query) {
  const node = this.findNode(query);
  if (node) {
    node.remove();
  }
  return this;
};
/**
 *
 * @param {object} query
 * @returns
 */
ePubDoc.prototype.removeNodes = function (query) {
  const nodes = this.findNodes(query);
  for (const node of nodes) {
    node.remove();
  }
  return this;
};
/**
 *
 * @returns
 */
ePubDoc.prototype.toObject = function () {
  const clone = deepcopy(this);
  clone.files = this.files.map((item) => item.toObject());
  return clone;
};
/**
 *
 * @param {object} options
 * @param {boolean} options.beautify - defalut value is true
 * @param {boolean} options.escape - defalut value is true
 * @returns
 */
ePubDoc.prototype.toFiles = function (options) {
  options = Object.assign(
    {
      beautify: true,
      escape: true,
    },
    options || {}
  );

  const files = this.files.map((item) => item.toFile(options));
  return files;
};
