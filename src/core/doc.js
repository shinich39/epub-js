"use strict";

import { ePubFile } from "./file.js";
import {
  generateUUID,
  getContainedNumber,
  isArray,
  isObject,
  isObjectArray,
  queryObject,
} from "../libs/utils.mjs";
import { deepcopy, isFile, updateObject } from "../libs/utilities.js";

export class ePubDoc {
  /**
   *
   * @param  {...object} objs
   * @property {ePubFile[]} files
   */
  constructor(...objs) {
    this.files = [
      new ePubFile(this.defaults.mimetype),
      new ePubFile(this.defaults.container),
      new ePubFile(this.defaults.package).updateNode(
        {
          tag: "dc:identifier",
        },
        {
          $set: {
            children: [
              {
                // Generate BookID
                content: "urn:uuid:" + generateUUID(),
              },
            ],
          },
        }
      ),
    ];

    // Import data
    if (isObjectArray(objs)) {
      Object.assign(this, ...objs.map((item) => deepcopy(item, true)));
    }

    this.init();
  }
}

ePubDoc.prototype.defaults = {
  text: {
    encoding: "utf8",
  },
  style: {
    encoding: "utf8",
  },
  script: {
    encoding: "utf8",
  },
  page: {
    encoding: "utf8",
    children: [
      {
        tag: "?xml",
        closer: "?",
        attributes: {
          version: "1.0",
          encoding: "utf-8",
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
  image: {
    encoding: "base64",
  },
  audio: {
    encoding: "base64",
  },
  video: {
    encoding: "base64",
  },
  font: {
    encoding: "base64",
  },
  mimetype: {
    encoding: "utf8",
    path: "mimetype",
    data: "application/epub+zip",
  },
  container: {
    encoding: "utf8",
    path: "META-INF/container.xml",
    children: [
      {
        tag: "?xml",
        closer: "?",
        attributes: {
          version: "1.0",
          encoding: "utf-8",
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
    encoding: "utf8",
    path: "EPUB/package.opf",
    children: [
      {
        tag: "?xml",
        closer: "?",
        attributes: {
          version: "1.0",
          encoding: "utf-8",
        },
      },
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
                // Update after create a package file
                // children: [{
                //   content: "urn:uuid:"+generateUUID(),
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
              // Example
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
    encoding: "utf8",
    path: "EPUB/nav.xhtml",
    children: [
      {
        tag: "?xml",
        closer: "?",
        attributes: {
          version: "1.0",
          encoding: "utf-8",
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
    encoding: "utf8",
    path: "EPUB/toc.ncx",
    children: [
      {
        tag: "?xml",
        closer: "?",
        attributes: {
          version: "1.0",
          encoding: "utf-8",
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
                  // Update after create a ncx page
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
/**
 *
 * @returns
 */
ePubDoc.prototype.init = function () {
  // Convert files to ePubFile
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

ePubDoc.prototype.toObject = function () {
  const obj = Object.assign({}, this, {
    files: this.files.map((item) => item.toObject()),
  });

  return deepcopy(obj);
};

ePubDoc.prototype.toFiles = function () {
  const files = this.files.map((item) => item.toFile());

  return files;
};
