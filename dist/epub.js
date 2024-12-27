(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('js-beautify'), require('mime')) :
  typeof define === 'function' && define.amd ? define(['exports', 'js-beautify', 'mime'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.epub = {}, global.beautify, global.mime));
})(this, (function (exports, beautify, mime) { 'use strict';

  // src/type.js
  function isString(obj) {
    return typeof obj === "string";
  }
  function isObject(obj) {
    return typeof obj === "object" && obj !== null;
  }
  function isNull(obj) {
    return typeof obj === "object" && obj === null;
  }
  function isArray(obj) {
    if (Array && Array.isArray) {
      return Array.isArray(obj);
    } else {
      return Object.prototype.toString.call(obj) === "[object Array]";
    }
  }
  function queryObject(obj, qry) {
    const QUERY_OPERATORS = {
      and: ["$and"],
      notAnd: ["$notAnd", "$nand"],
      or: ["$or"],
      notOr: ["$notOr", "$nor"],
      not: ["$not"],
      include: ["$include", "$in"],
      exclude: ["$exclude", "$nin"],
      greaterThan: ["$greaterThan", "$gt"],
      greaterThanOrEqual: ["$greaterThanOrEqual", "$gte"],
      lessThan: ["$lessThan", "$lt"],
      lessThanOrEqual: ["$lessThanOrEqual", "$lte"],
      equal: ["$equal", "$eq"],
      notEqual: ["$notEqual", "$neq", "$ne"],
      exists: ["$exists"],
      function: ["$function", "$func", "$fn"],
      regexp: ["$regexp", "$regex", "$re", "$reg"]
    };
    function A(d, q) {
      for (const [key, value] of Object.entries(q)) {
        if (!B(d, value, key.split("."))) {
          return false;
        }
      }
      return true;
    }
    function B(d, q, k) {
      const o = k.shift();
      if (k.length > 0) {
        if (isObject(d)) {
          return B(d[o], q, k);
        } else {
          return false;
        }
      }
      return C(d, q, o);
    }
    function C(d, q, o) {
      if (QUERY_OPERATORS.and.indexOf(o) > -1) {
        for (const v of q) {
          if (!A(d, v)) {
            return false;
          }
        }
        return true;
      } else if (QUERY_OPERATORS.notAnd.indexOf(o) > -1) {
        return !C(d, q, "$and");
      } else if (QUERY_OPERATORS.or.indexOf(o) > -1) {
        for (const v of q) {
          if (A(d, v)) {
            return true;
          }
        }
        return false;
      } else if (QUERY_OPERATORS.notOr.indexOf(o) > -1) {
        return !C(d, q, "$or");
      } else if (QUERY_OPERATORS.not.indexOf(o) > -1) {
        return !A(d, q);
      } else if (QUERY_OPERATORS.include.indexOf(o) > -1) {
        if (isArray(d)) {
          for (const v of d) {
            if (!C(v, q, "$include")) {
              return false;
            }
          }
          return true;
        } else {
          for (const v of q) {
            if (C(d, v, "$equal")) {
              return true;
            }
          }
          return false;
        }
      } else if (QUERY_OPERATORS.exclude.indexOf(o) > -1) {
        return !C(d, q, "$include");
      } else if (QUERY_OPERATORS.greaterThan.indexOf(o) > -1) {
        return d > q;
      } else if (QUERY_OPERATORS.greaterThanOrEqual.indexOf(o) > -1) {
        return d >= q;
      } else if (QUERY_OPERATORS.lessThan.indexOf(o) > -1) {
        return d < q;
      } else if (QUERY_OPERATORS.lessThanOrEqual.indexOf(o) > -1) {
        return d <= q;
      } else if (QUERY_OPERATORS.equal.indexOf(o) > -1) {
        if (isArray(d) && isArray(q)) {
          if (d.length !== q.length) {
            return false;
          }
          for (let i = 0; i < q.length; i++) {
            if (!C(d[i], q[i], "$equal")) {
              return false;
            }
          }
          return true;
        } else {
          return d === q;
        }
      } else if (QUERY_OPERATORS.notEqual.indexOf(o) > -1) {
        return !C(d, q, "$equal");
      } else if (QUERY_OPERATORS.exists.indexOf(o) > -1) {
        return (d !== null && d !== void 0) === Boolean(q);
      } else if (QUERY_OPERATORS.function.indexOf(o) > -1) {
        return q(d);
      } else if (QUERY_OPERATORS.regexp.indexOf(o) > -1) {
        return q.test(d);
      } else if (!isObject(d)) {
        return false;
      } else if (isObject(q)) {
        return A(d[o], q);
      } else {
        return C(d[o], q, "$equal");
      }
    }
    return A(obj, qry);
  }
  function getContainedNumber(num, min, max) {
    num -= min;
    max -= min;
    if (num < 0) {
      num = num % max + max;
    }
    if (num >= max) {
      num = num % max;
    }
    return num + min;
  }
  function generateUUID() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
      let r = Math.random() * 16 | 0, v;
      if (c == "x") {
        v = r;
      } else {
        v = r & 3 | 8;
      }
      return v.toString(16);
    });
  }
  function getRelativePath(from, to) {
    from = (from + "/").replace(/[\\\/]+/g, "/").replace(/^\.?\//, "");
    to = (to + "/").replace(/[\\\/]+/g, "/").replace(/^\.?\//, "");
    let result = "";
    while (!to.startsWith(from)) {
      result += "../";
      from = from.substring(0, from.lastIndexOf("/", from.length - 2) + 1);
    }
    result += to.substring(from.length, to.length);
    return result.replace(/[\\\/]$/, "");
  }
  function parsePath(str) {
    str = str.replace(/[\\\/]+/g, "/").replace(/\/$/, "").replace(/^\.?\//, "");
    let dirs = str.split("/"), filename = "", basename = "", dirname = ".", extname = "";
    if (dirs.length > 0) {
      basename = dirs.pop();
      if (/\.[^\\\/.]+?$/.test(basename)) {
        extname = "." + basename.split(".").pop();
      }
      filename = basename.replace(new RegExp(extname + "$"), "");
    }
    if (dirs.length > 0) {
      dirname = dirs.join("/");
    }
    return {
      dirs,
      filename,
      basename,
      dirname,
      extname
    };
  }

  // src/dom.js
  var HTML_ENTITIES = [
    ["&", "&amp;"],
    [" ", "&nbsp;"],
    ["<", "&lt;"],
    [">", "&gt;"],
    ['"', "&quot;"],
    ["'", "&apos;"],
    ["\xA2", "&cent;"],
    ["\xA3", "&pound;"],
    ["\xA5", "&yen;"],
    ["\u20AC", "&euro;"],
    ["\xA9", "&copy;"],
    ["\xAE", "&reg;"]
  ];
  var ATTR_ENTITIES = [
    ["<", "&lt;"],
    [">", "&gt;"],
    ['"', "&quot;"],
    ["'", "&apos;"]
  ];
  function normalizeLineBreakers(str) {
    return str.replace(/\r\n/g, "\n");
  }
  function normalizeTag(str) {
    return str.replace(/^\</, "").replace(/([^\<][!?/])?\>$/, "").replace(/\s+/g, " ").trim();
  }
  function isText(node) {
    return node.tag === null;
  }
  function findLastIndex(arr, func) {
    for (let i = arr.length - 1; i >= 0; i--) {
      if (func(arr[i], i, arr)) {
        return i;
      }
    }
    return -1;
  }
  function encodeStr(str) {
    return encodeURIComponent(str);
  }
  function decodeStr(str) {
    return decodeURIComponent(str);
  }
  function escapeStr(str) {
    for (let i = 0; i < HTML_ENTITIES.length; i++) {
      str = str.replace(
        new RegExp(HTML_ENTITIES[i][0], "g"),
        HTML_ENTITIES[i][1]
      );
    }
    return str;
  }
  function unescapeStr(str) {
    for (let i = HTML_ENTITIES.length - 1; i >= 0; i--) {
      str = str.replace(
        new RegExp(HTML_ENTITIES[i][1], "g"),
        HTML_ENTITIES[i][0]
      );
    }
    return str;
  }
  function escapeAttr(str) {
    for (let i = 0; i < ATTR_ENTITIES.length; i++) {
      str = str.replace(
        new RegExp(ATTR_ENTITIES[i][0], "g"),
        ATTR_ENTITIES[i][1]
      );
    }
    return str;
  }
  function convertComments(str) {
    return str.replace(/<!--([\s\S]*?)-->/g, function(...args) {
      return `<!-->${encodeStr(args[1])}</!-->`;
    });
  }
  function encodeScripts(str) {
    return str.replace(
      /(<script(?:[\s\S]*?)>)([\s\S]*?)(<\/script>)/g,
      function(...args) {
        return `${args[1]}${encodeStr(args[2])}${args[3]}`;
      }
    );
  }
  function encodeContents(str) {
    return str.replace(/(>)([\s\S]*?)(<)/g, function(...args) {
      return `${args[1]}${escapeStr(args[2])}${args[3]}`;
    });
  }
  function encodeAttributes(str) {
    function func(...args) {
      return `=${encodeStr(args[1])} `;
    }
    return str.replace(/\='([^'>]*?)'/g, func).replace(/\="([^">]*?)"/g, func);
  }
  function parseTag(str) {
    let arr = normalizeTag(str).split(/\s/);
    let result = {};
    result.tag = arr[0] || "";
    result.closer = null;
    result.content = null;
    result.attributes = {};
    result.children = [];
    result.isClosing = /^\//.test(result.tag);
    result.isClosed = result.isClosing;
    result.tag = result.tag.replace(/^\//, "");
    for (let i = 1; i < arr.length; i++) {
      let [key, value] = arr[i].split("=");
      if (key.length > 0) {
        if (typeof value === "string") {
          result.attributes[key] = decodeStr(value);
        } else {
          result.attributes[key] = true;
        }
      }
    }
    return result;
  }
  function strToDom(str) {
    str = encodeAttributes(
      encodeContents(encodeScripts(convertComments(normalizeLineBreakers(str))))
    );
    let offset = 0, re = /<[^>]*?>/g, match, children = [], nodes = [], obj;
    while (match = re.exec(str)) {
      let content = str.substring(offset, match.index).trim();
      if (content.length > 0) {
        obj = {
          // isClosed: true,
          // isClosing: false,
          tag: null,
          closer: null,
          content: unescapeStr(content),
          attributes: {},
          children: []
        };
        children.push(obj);
      }
      obj = parseTag(match[0]);
      if (!obj.isClosing) {
        children.push(obj);
        nodes.push(obj);
      } else {
        let i = findLastIndex(children, function(item) {
          return !item.isClosed && item.tag === obj.tag;
        });
        if (i > -1) {
          children[i].isClosed = true;
          children[i].children = children.splice(i + 1, children.length - i + 1);
          if (["script", "!--"].indexOf(children[i].tag) > -1) {
            for (let j = 0; j < children[i].children.length; j++) {
              if (isText(children[i].children[j])) {
                children[i].children[j].content = decodeStr(
                  children[i].children[j].content
                );
              }
            }
          }
        }
      }
      offset = re.lastIndex;
    }
    for (let node of nodes) {
      if (node.tag.toUpperCase() === "!DOCTYPE") {
        node.closer = "";
      } else if (node.tag.toLowerCase() === "?xml") {
        node.closer = "?";
      } else if (node.tag === "!--") {
        node.closer = "--";
      } else if (!node.isClosed) {
        node.closer = " /";
      }
      delete node.isClosed;
      delete node.isClosing;
    }
    return {
      tag: null,
      closer: null,
      content: null,
      attributes: {},
      children
    };
  }
  function objToAttr(obj) {
    let result = "";
    for (const [k, v] of Object.entries(obj)) {
      if (typeof v === "string") {
        result += ` ${k}="${escapeAttr(v)}"`;
      } else if (v === true) {
        result += ` ${k}`;
      }
    }
    return result;
  }
  function domToStr(obj) {
    const { tag, closer, attributes, content, children } = obj;
    let result = "";
    if (typeof tag === "string") {
      result += `<${tag}`;
      if (typeof attributes === "object") {
        result += objToAttr(attributes);
      }
      if (typeof closer !== "string") {
        result += ">";
      }
      if (Array.isArray(children)) {
        for (const child of children) {
          result += domToStr(child);
        }
      }
      if (typeof closer === "string") {
        result += `${closer}>`;
      } else {
        result += `</${tag}>`;
      }
    } else if (typeof content === "string") {
      result = content;
    } else {
      if (Array.isArray(children)) {
        for (const child of children) {
          result += domToStr(child);
        }
      }
    }
    return result;
  }

  function isDOM(str) {
    return /[/+](xml|html)$/.test(str);
  }

  function isInstance(obj) {
    return obj instanceof ePubDoc || 
      obj instanceof ePubFile ||
      obj instanceof ePubNode;
  }

  function isFile(obj) {
    return obj instanceof ePubFile;
  }

  function isNode(obj) {
    return obj instanceof ePubNode;
  }

  function normalizePath(str) {
    return str.replace(/[\\\/]+/g, "/")
      .replace(/^\.?\//, "");
  }

  function extToMime(ext) {
    return mime.getType(ext);
  }

  function beautifyHTML(str) {
    return beautify.html(str, {
      indent_size: 2,
    });
  }

  function updateObject(obj, updates) {
    for (const operator of Object.keys(updates)) {
      for (let [keys, value] of Object.entries(updates[operator])) {
        keys = keys.split(".");

        let target = obj,
            key = keys.pop();

        while(isObject(target) && keys.length > 0) {
          target = target[keys.shift()];
        }

        if (!isObject(target)) {
          continue;
        }

        if (operator === "$set") {
          if (target[key] !== value) {
            target[key] = value;
          }
        } else if (operator === "$unset") {
          if (!!value) {
            delete target[key];
          }
        } else if (operator === "$push") {
          target[key].push(value);
        } else if (operator === "$pushAll") {
          for (const v of value) {
            target[key].push(v);
          }
        } else if (operator === "$pull") {
          for (let i = target[key].length; i >= 0; i--) {
            if (target[key][i] === value) {
              target[key].splice(i, 1);
              break;
            }
          }
        } else if (operator === "$pullAll") {
          const prev = target[key];
          target[key] = [];
          for (const v of prev) {
            if (value.indexOf(v) === -1) {
              target[key].push(v);
            }
          }
        } else if (operator === "$addToSet") {
          if (target[key].indexOf(value) === -1) {
            target[key].push(value);
          }
        } else if (operator === "$addToSetAll") {
          for (const v of value) {
            if (target[key].indexOf(v) === -1) {
              target[key].push(v);
            }
          }
        } 
      }
    }
  }

  function deepcopy(obj, keepInstances) {
    let result;
    if (Array.isArray(obj)) {
      result = [];
    } else {
      result = {};
    }
    for (const [key, value] of Object.entries(obj)) {
      if (isInstance(value)) {
        if (keepInstances) {
          result[key] = value;
        } else {
          result[key] = null;
        }
      } else if (isObject(value) && !isNull(value)) {
        result[key] = deepcopy(value, keepInstances);
      } else {
        result[key] = value;
      }
    }
    return result;
  }

  class ePubDoc {
    constructor(obj) {
      this.files = [
        this.createMimetype(),
        this.createContainer(),
        this.createPackage(),
      ];

      // Import data
      if (isObject(obj)) {
        Object.assign(this, deepcopy(obj, true));
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
          this.files[i] = this.createFile(
            Object.assign({}, this.files[i], { document: this })
          );
        }
      }
    }

    return this;
  };
  /**
   *
   * @param {object} updates
   * @returns
   */
  ePubDoc.prototype.update = function (updates) {
    if (isObject(updates)) {
      updateObject(this, updates);
    }

    this.init();

    return this;
  };
  /**
   *
   * @param {ePubFile|object} file
   * @returns
   */
  ePubDoc.prototype.appendFile = function (file) {
    this.files.push(file);
    this.init();
    return this;
  };
  /**
   *
   * @param {ePubFile[]|object[]} files
   * @returns
   */
  ePubDoc.prototype.appendFiles = function (files) {
    this.files = this.files.concat(files);
    this.init();
    return this;
  };
  /**
   *
   * @param {ePubFile|object} file
   * @returns
   */
  ePubDoc.prototype.prependFile = function (file) {
    this.files.unshift(file);
    this.init();
    return this;
  };
  /**
   *
   * @param {ePubFile[]|object[]} files
   * @returns
   */
  ePubDoc.prototype.prependFiles = function (files) {
    this.files = [].concat(files, this.files);
    this.init();
    return this;
  };
  /**
   *
   * @param {ePubFile|object} file
   * @param {number} idx - Default value is -1
   * @returns
   */
  ePubDoc.prototype.insertFile = function (file, idx) {
    idx = getContainedNumber(idx, 0, this.files.length);
    this.files.splice(idx, 0, file);
    this.init();
    return this;
  };
  /**
   *
   * @param {ePubFile[]|object[]} files
   * @param {number} idx - Default value is -1
   * @returns
   */
  ePubDoc.prototype.insertFiles = function (files, idx) {
    idx = getContainedNumber(idx, 0, this.files.length);
    this.files.splice(idx, 0, ...files);
    this.init();
    return this;
  };
  /**
   *
   * @param {object} obj
   * @property {string} _id - Default value is UUID
   * @property {string} path - Required
   * @property {string} data
   * @property {string} encoding - "base64", "utf8",
   * @property {object[]} children
   * @property {object} attributes
   * @returns {ePubFile}
   */
  ePubDoc.prototype.createFile = function (obj) {
    return new ePubFile(obj);
  };
  /**
   *
   * @param {object[]} arr
   * @property {string} _id - Default value is UUID
   * @property {string} path - Required
   * @property {string} data
   * @property {string} encoding - "base64", "utf8",
   * @property {object[]} children
   * @property {object} attributes
   * @returns {ePubFile}
   */
  ePubDoc.prototype.createFiles = function (arr) {
    let result = [];
    for (const obj of arr) {
      result.push(new ePubFile(obj));
    }
    return result;
  };
  /**
   *
   * @param {object} obj
   * @property {string} path
   * @property {string} data
   * @returns {ePubFile}
   */
  ePubDoc.prototype.createText = function (obj) {
    if (!isObject(obj)) {
      obj = {};
    }
    return this.createFile(Object.assign({}, this.defaults.text, obj));
  };
  /**
   *
   * @param {object} obj
   * @property {string} path
   * @property {string} data
   * @returns {ePubFile}
   */
  ePubDoc.prototype.createStyle = function (obj) {
    if (!isObject(obj)) {
      obj = {};
    }
    return this.createFile(Object.assign({}, this.defaults.style, obj));
  };
  /**
   *
   * @param {object} obj
   * @property {string} path
   * @property {string} data
   * @returns {ePubFile}
   */
  ePubDoc.prototype.createScript = function (obj) {
    if (!isObject(obj)) {
      obj = {};
    }
    return this.createFile(Object.assign({}, this.defaults.script, obj));
  };
  /**
   *
   * @param {object} obj
   * @property {string} path
   * @property {string} data "<div></div>"
   * @property {array} children
   * @property {object} attributes
   * @returns {ePubFile}
   */
  ePubDoc.prototype.createPage = function (obj) {
    if (!isObject(obj)) {
      obj = {};
    }
    return this.createFile(Object.assign({}, this.defaults.page, obj));
  };
  /**
   *
   * @param {object} obj
   * @property {string} path
   * @property {string} data
   * @returns {ePubFile}
   */
  ePubDoc.prototype.createImage = function (obj) {
    if (!isObject(obj)) {
      obj = {};
    }
    return this.createFile(Object.assign({}, this.defaults.image, obj));
  };
  /**
   *
   * @param {object} obj
   * @property {string} path
   * @property {string} data
   * @returns {ePubFile}
   */
  ePubDoc.prototype.createAudio = function (obj) {
    if (!isObject(obj)) {
      obj = {};
    }
    return this.createFile(Object.assign({}, this.defaults.audio, obj));
  };
  /**
   *
   * @param {object} obj
   * @property {string} path
   * @property {string} data
   * @returns {ePubFile}
   */
  ePubDoc.prototype.createVideo = function (obj) {
    if (!isObject(obj)) {
      obj = {};
    }
    return this.createFile(Object.assign({}, this.defaults.video, obj));
  };
  /**
   *
   * @param {object} obj
   * @property {string} path
   * @property {string} data
   * @returns {ePubFile}
   */
  ePubDoc.prototype.createFont = function (obj) {
    if (!isObject(obj)) {
      obj = {};
    }
    return this.createFile(Object.assign({}, this.defaults.font, obj));
  };
  /**
   *
   * @param {object} obj
   * @returns {ePubFile}
   */
  ePubDoc.prototype.createMimetype = function (obj) {
    if (!isObject(obj)) {
      obj = {};
    }
    return this.createFile(Object.assign({}, this.defaults.mimetype, obj));
  };
  /**
   *
   * @param {object} obj
   * @returns {ePubFile}
   */
  ePubDoc.prototype.createContainer = function (obj) {
    if (!isObject(obj)) {
      obj = {};
    }
    return this.createFile(Object.assign({}, this.defaults.container, obj));
  };
  /**
   *
   * @param {object} obj
   * @returns {ePubFile}
   */
  ePubDoc.prototype.createPackage = function (obj) {
    if (!isObject(obj)) {
      obj = {};
    }
    return this.createFile(Object.assign({}, this.defaults.package, obj)) // Generate BookID
      .updateNode(
        {
          tag: "dc:identifier",
        },
        {
          $set: {
            children: [
              {
                content: "urn:uuid:" + generateUUID(),
              },
            ],
          },
        }
      );
  };
  /**
   *
   * @param {object} obj
   * @returns {ePubFile}
   */
  ePubDoc.prototype.createNav = function (obj) {
    if (!isObject(obj)) {
      obj = {};
    }
    return this.createFile(Object.assign({}, this.defaults.nav, obj));
  };
  /**
   *
   * @param {object} obj
   * @returns {ePubFile}
   */
  ePubDoc.prototype.createNCX = function (obj) {
    if (!isObject(obj)) {
      obj = {};
    }
    return this.createFile(Object.assign({}, this.defaults.ncx, obj));
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
   * @param {object} obj
   * @property {string} _id - Default value is UUID
   * @property {string|null} tag - Required
   * @property {string|null} closer - "/"
   * @property {string} content - You must set the tag to null
   * @property {object} attributes
   * @property {object[]} children
   * @returns {ePubNode}
   */
  ePubDoc.prototype.createNode = function (obj) {
    return new ePubNode(obj);
  };

  ePubDoc.prototype.findNode = function (query) {
    for (const file of this.files) {
      const node = file.findNode(query);
      if (node) {
        return node;
      }
    }
  };

  ePubDoc.prototype.findNodes = function (query) {
    let result = [];
    for (const file of this.files) {
      const nodes = file.findNodes(query);
      result = result.concat(nodes);
    }
    return result;
  };

  ePubDoc.prototype.updateNode = function (query, updates) {
    const node = this.findNode(query);
    if (node) {
      node.update(updates);
    }
    return this;
  };

  ePubDoc.prototype.updateNodes = function (query, updates) {
    const nodes = this.findNodes(query);
    for (const node of nodes) {
      node.update(updates);
    }
    return this;
  };

  ePubDoc.prototype.removeNode = function (query) {
    const node = this.findNode(query);
    if (node) {
      node.remove();
    }
    return this;
  };

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

  ePubDoc.prototype.findChild = ePubDoc.prototype.findFile;
  ePubDoc.prototype.findChildren = ePubDoc.prototype.findFiles;
  ePubDoc.prototype.updateChild = ePubDoc.prototype.updateFile;
  ePubDoc.prototype.updateChildren = ePubDoc.prototype.updateFiles;
  ePubDoc.prototype.removeChild = ePubDoc.prototype.removeFile;
  ePubDoc.prototype.removeChildren = ePubDoc.prototype.removeFiles;
  ePubDoc.prototype.appendChild = ePubDoc.prototype.appendFile;
  ePubDoc.prototype.appendChildren = ePubDoc.prototype.appendFiles;
  ePubDoc.prototype.prependChild = ePubDoc.prototype.prependFile;
  ePubDoc.prototype.prependChildren = ePubDoc.prototype.prependFiles;
  ePubDoc.prototype.insertChild = ePubDoc.prototype.insertFile;
  ePubDoc.prototype.insertChildren = ePubDoc.prototype.insertFiles;

  class ePubFile {
    constructor(obj) {
      // Reference properties
      this.document = null;

      // Common properties
      this._id = generateUUID();
      this.path = null; // Required
      this.basename = null;
      this.filename = null;
      this.dirname = null;
      this.extension = null;
      this.mimetype = null;
      this.data = null;
      this.encoding = null; // "utf8", "base64"

      // DOM properties
      this.tag = null;
      this.closer = null;
      this.content = null;
      this.attributes = {};
      this.children = [];

      // Import data
      if (isObject(obj)) {
        Object.assign(this, deepcopy(obj, true));
      }

      this.init();
    }
  }
  /**
   *
   * @returns
   */
  ePubFile.prototype.init = function () {
    // tag, closer, and content values must be null
    this.tag = null;
    this.closer = null;
    this.content = null;

    // Parse path
    if (isString(this.path)) {
      const fullPath = normalizePath(this.path);
      const parsedPath = parsePath(fullPath);
      this.basename = parsedPath.basename;
      this.extname = parsedPath.extname;
      this.filename = parsedPath.filename;
      this.dirname = parsedPath.dirname;
      this.mimetype = extToMime(parsedPath.extname);
    } else {
      this.basename = null;
      this.extname = null;
      this.filename = null;
      this.dirname = null;
      this.mimetype = null;
    }

    // Parse imported by string DOM
    if (isDOM(this.mimetype) && isString(this.data)) {
      this.children = strToDom(this.data).children;
      this.data = null;
    }

    // Convert children to ePubNode
    if (isArray(this.children)) {
      for (let i = 0; i < this.children.length; i++) {
        if (isNode(this.children[i])) {
          if (!this.children[i].parentNode) {
            this.children[i].parentNode = this;
            this.children[i].init();
          } else if (this.children[i].parentNode != this) {
            this.children[i].remove();
            this.children[i].parentNode = this;
            this.children[i].init();
          }
        } else if (isObject(this.children[i])) {
          this.children[i] = this.createNode(
            Object.assign({}, this.children[i], { parentNode: this })
          );
        } else if (isString(this.children[i])) {
          this.children[i] = this.createNode({
            parentNode: this,
            content: this.children[i],
          });
        } else {
          this.children[i] = this.createNode({
            parentNode: this,
            content: this.children[i].toString(),
          });
        }
      }
    }

    return this;
  };
  /**
   *
   * @returns {number}
   */
  ePubFile.prototype.getIndex = function () {
    if (!this.document) {
      return -1;
    }
    return this.document.files.findIndex((item) => item._id == this._id);
  };
  /**
   *
   * @returns {string}
   */
  ePubFile.prototype.getAbsolutePath = function () {
    return normalizePath(this.path);
  };
  /**
   *
   * @param {ePubFile|ePubNode|string} from
   * @returns {string}
   */
  ePubFile.prototype.getRelativePath = function (from) {
    if (isFile(from) || isNode(from)) {
      from = from.getAbsolutePath();
    }
    from = parsePath(from).dirname;
    return getRelativePath(from, this.getAbsolutePath());
  };
  /**
   *
   * @returns
   */
  ePubFile.prototype.remove = function () {
    const currentIndex = this.getIndex();
    if (currentIndex > -1) {
      this.document.files.splice(currentIndex, 1);
    }

    delete this.document;

    return this;
  };
  /**
   *
   * @returns
   */
  ePubFile.prototype.getContent = function () {
    const query = {
      content: {
        $exists: true,
      },
    };

    let result = [];
    for (const node of this.children) {
      if (queryObject(node, query)) {
        result.push(node.content);
      }
      const nodes = node.findNodes(query);
      for (const node of nodes) {
        result.push(node.content);
      }
    }
    return result.join("");
  };
  /**
   *
   * @param {string} str
   * @returns
   */
  ePubFile.prototype.setContent = function (str) {
    return this.update({
      $set: {
        closer: null,
        children: [
          {
            content: str,
          },
        ],
      },
    });
  };
  /**
   *
   * @param {string} key
   * @returns
   */
  ePubFile.prototype.getAttribute = function (key) {
    if (!isObject(this.attributes)) {
      return;
    }
    return this.attributes[key];
  };
  /**
   *
   * @param {string} key
   * @param {*} value
   * @returns
   */
  ePubFile.prototype.setAttribute = function (key, value) {
    return this.update({
      $set: {
        ["attributes." + key]: value,
      },
    });
  };
  /**
   *
   * @param {ePubNode|object|string} node
   * @returns
   */
  ePubFile.prototype.appendNode = function (node) {
    this.children.push(node);
    this.init();
    return this;
  };
  /**
   *
   * @param {ePubNode[]|object[]|string[]} nodes
   * @returns
   */
  ePubFile.prototype.appendNodes = function (nodes) {
    this.children = this.children.concat(nodes);
    this.init();
    return this;
  };
  /**
   *
   * @param {ePubNode|object} node
   * @returns
   */
  ePubFile.prototype.prependNode = function (node) {
    this.children.unshift(node);
    this.init();
    return this;
  };
  /**
   *
   * @param {ePubNode[]|object[]} nodes
   * @returns
   */
  ePubFile.prototype.prependNodes = function (nodes) {
    this.children = [].concat(nodes, this.children);
    this.init();
    return this;
  };
  /**
   *
   * @param {ePubNode|object} node
   * @param {number} idx - Default value is -1
   * @returns
   */
  ePubFile.prototype.insertNode = function (node, idx) {
    idx = getContainedNumber(idx, 0, this.children.length);
    this.children.splice(idx, 0, node);
    this.init();
    return this;
  };
  /**
   *
   * @param {ePubNode[]|object[]} nodes
   * @param {number} idx - Default value is -1
   * @returns
   */
  ePubFile.prototype.insertNodes = function (nodes, idx) {
    idx = getContainedNumber(idx, 0, this.children.length);
    this.children.splice(idx, 0, ...nodes);
    this.init();
    return this;
  };
  /**
   *
   * @param {object} query
   * @returns
   */
  ePubFile.prototype.findNode = function (query) {
    for (const node of this.children) {
      if (queryObject(node, query)) {
        return node;
      }
      const _node = node.findNode(query);
      if (_node) {
        return _node;
      }
    }
  };
  /**
   *
   * @param {object} query
   * @returns
   */
  ePubFile.prototype.findNodes = function (query) {
    let result = [];
    for (const node of this.children) {
      if (queryObject(node, query)) {
        result.push(node);
      }
      const nodes = node.findNodes(query);
      for (const _node of nodes) {
        result.push(_node);
      }
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
  ePubFile.prototype.updateNode = function (query, updates) {
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
  ePubFile.prototype.updateNodes = function (query, updates) {
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
  ePubFile.prototype.removeNode = function (query) {
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
  ePubFile.prototype.removeNodes = function (query) {
    const nodes = this.findNodes(query);
    for (const node of nodes) {
      node.remove();
    }
    return this;
  };

  ePubFile.prototype.toString = function () {
    if (isDOM(this.mimetype)) {
      // Beautify DOM
      return beautifyHTML(domToStr(this));
    } else {
      return this.data;
    }
  };

  ePubFile.prototype.toObject = function () {
    const obj = Object.assign({}, this, {
      children: (this.children || []).map((item) => item.toObject()),
    });

    delete obj.document;

    return deepcopy(obj);
  };

  ePubFile.prototype.toFile = function () {
    return {
      path: this.getAbsolutePath(),
      data: this.toString(),
      encoding: this.encoding,
    };
  };

  ePubFile.prototype.getAbsPath = ePubFile.prototype.getAbsolutePath;
  ePubFile.prototype.getRelPath = ePubFile.prototype.getRelativePath;

  ePubFile.prototype.update = ePubDoc.prototype.update;
  ePubFile.prototype.createFile = ePubDoc.prototype.createFile;
  ePubFile.prototype.createNode = ePubDoc.prototype.createNode;

  ePubFile.prototype.appendChild = ePubFile.prototype.appendNode;
  ePubFile.prototype.appendChildren = ePubFile.prototype.appendNodes;
  ePubFile.prototype.prependChild = ePubFile.prototype.prependNode;
  ePubFile.prototype.prependChildren = ePubFile.prototype.prependNodes;
  ePubFile.prototype.insertChild = ePubFile.prototype.insertNode;
  ePubFile.prototype.insertChildren = ePubFile.prototype.insertNodes;
  ePubFile.prototype.findChild = ePubFile.prototype.findNode;
  ePubFile.prototype.findChildren = ePubFile.prototype.findNodes;
  ePubFile.prototype.updateChild = ePubFile.prototype.updateNode;
  ePubFile.prototype.updateChildren = ePubFile.prototype.updateNodes;
  ePubFile.prototype.removeChild = ePubFile.prototype.removeNode;
  ePubFile.prototype.removeChildren = ePubFile.prototype.removeNodes;

  class ePubNode {
    constructor(obj) {
      // Reference properties
      this.parentNode = null;

      // Common properties
      this._id = generateUUID();
      this.tag = null;
      this.closer = null;
      this.content = null;
      this.attributes = {};
      this.data = null; // Convert to DOM on intialization
      this.children = [];

      // Import data
      if (isObject(obj)) {
        Object.assign(this, deepcopy(obj, true));
      }

      this.init();
    }
    // Deprecated
    // get id() { return this.attributes.id; }
    // set id(v) { this.attributes.id = v; }
    // get class() { return this.attributes.class; }
    // set class(v) { this.attributes.class = v; }
    // get style() { return this.attributes.style; }
    // set style(v) { this.attributes.style = v; }
    // get innerHTML() { return this.content; }
    // set innerHTML(v) { this.content = v; }
    // get innerText() { return this.content; }
    // set innerText(v) { this.content = v; }
  }
  /**
   *
   * @returns
   */
  ePubNode.prototype.init = function () {
    // Parse node properties
    if (isString(this.tag)) {
      if (isString(this.content)) {
        this.children = [
          {
            content: this.content,
          },
        ];
      }

      this.content = null;
    } else {
      if (!isString(this.content)) {
        this.content = "";
      }

      this.tag = null;
      this.closer = null;
    }

    // Parse imported by string DOM
    if (isString(this.data)) {
      this.children = strToDom(this.data).children;
      this.data = null;
    }

    // Convert children to ePubNode
    if (isArray(this.children)) {
      for (let i = 0; i < this.children.length; i++) {
        if (isNode(this.children[i])) {
          if (!this.children[i].parentNode) {
            this.children[i].parentNode = this;
            this.children[i].init();
          } else if (this.children[i].parentNode != this) {
            this.children[i].remove();
            this.children[i].parentNode = this;
            this.children[i].init();
          }
        } else if (isObject(this.children[i])) {
          this.children[i] = this.createNode(
            Object.assign({}, this.children[i], { parentNode: this })
          );
        } else if (isString(this.children[i])) {
          this.children[i] = this.createNode({
            parentNode: this,
            content: this.children[i],
          });
        } else {
          this.children[i] = this.createNode({
            parentNode: this,
            content: this.children[i].toString(),
          });
        }
      }
    }

    return this;
  };
  /**
   *
   * @returns {ePubDoc|undefined}
   */
  ePubNode.prototype.getDocument = function () {
    const rootNode = this.getRootNode();
    if (rootNode) {
      return rootNode.document;
    }
    return;
  };
  /**
   *
   * @returns {ePubFile|undefined}
   */
  ePubNode.prototype.getRootNode = function () {
    let parentNode = this.parentNode;
    while (isNode(parentNode)) {
      parentNode = parentNode.parentNode;
    }
    return parentNode;
  };
  /**
   *
   * @returns {number}
   */
  ePubNode.prototype.getIndex = function () {
    if (!this.parentNode) {
      return -1;
    }
    return this.parentNode.children.findIndex((item) => item._id == this._id);
  };
  /**
   *
   * @returns {string}
   */
  ePubNode.prototype.getAbsolutePath = function () {
    const rootNode = this.getRootNode();
    if (!rootNode) {
      return "";
    } else if (this.getAttribute("id")) {
      return rootNode.getAbsolutePath() + "#" + this.getAttribute("id");
    } else {
      return rootNode.getAbsolutePath();
    }
  };
  /**
   *
   * @param {ePubFile|ePubNode|string} from
   * @returns {string}
   */
  ePubNode.prototype.getRelativePath = function (from) {
    if (isFile(from) || isNode(from)) {
      from = from.getAbsolutePath();
    }
    from = parsePath(from).dirname;
    return getRelativePath(from, this.getAbsolutePath());
  };

  ePubNode.prototype.remove = function () {
    const currentIndex = this.getIndex();
    if (currentIndex > -1) {
      this.parentNode.children.splice(currentIndex, 1);
    }

    delete this.parentNode;

    return this;
  };

  ePubNode.prototype.toString = function () {
    return beautifyHTML(domToStr(this));
  };

  ePubNode.prototype.toObject = function () {
    const obj = Object.assign({}, this, {
      children: (this.children || []).map((item) => item.toObject()),
    });

    delete obj.parentNode;

    return deepcopy(obj);
  };

  ePubNode.prototype.getFile = ePubNode.prototype.getRootNode;
  ePubNode.prototype.getAbsPath = ePubNode.prototype.getAbsolutePath;
  ePubNode.prototype.getRelPath = ePubNode.prototype.getRelativePath;

  ePubNode.prototype.update = ePubDoc.prototype.update;
  ePubNode.prototype.createFile = ePubDoc.prototype.createFile;
  ePubNode.prototype.createNode = ePubDoc.prototype.createNode;

  ePubNode.prototype.appendNode = ePubFile.prototype.appendNode;
  ePubNode.prototype.appendNodes = ePubFile.prototype.appendNodes;
  ePubNode.prototype.prependNode = ePubFile.prototype.prependNode;
  ePubNode.prototype.prependNodes = ePubFile.prototype.prependNodes;
  ePubNode.prototype.insertNode = ePubFile.prototype.insertNode;
  ePubNode.prototype.insertNodes = ePubFile.prototype.insertNodes;

  ePubNode.prototype.appendChild = ePubFile.prototype.appendChild;
  ePubNode.prototype.appendChildren = ePubFile.prototype.appendChildren;
  ePubNode.prototype.prependChild = ePubFile.prototype.prependChild;
  ePubNode.prototype.prependChildren = ePubFile.prototype.prependChildren;
  ePubNode.prototype.insertChild = ePubFile.prototype.insertChild;
  ePubNode.prototype.insertChildren = ePubFile.prototype.insertChildren;

  ePubNode.prototype.getContent = ePubFile.prototype.getContent;
  ePubNode.prototype.setContent = ePubFile.prototype.setContent;
  ePubNode.prototype.getAttribute = ePubFile.prototype.getAttribute;
  ePubNode.prototype.setAttribute = ePubFile.prototype.setAttribute;
  ePubNode.prototype.findNode = ePubFile.prototype.findNode;
  ePubNode.prototype.findNodes = ePubFile.prototype.findNodes;
  ePubNode.prototype.updateNode = ePubFile.prototype.updateNode;
  ePubNode.prototype.updateNodes = ePubFile.prototype.updateNodes;
  ePubNode.prototype.removeNode = ePubFile.prototype.removeNode;
  ePubNode.prototype.removeNodes = ePubFile.prototype.removeNodes;
  ePubNode.prototype.findChild = ePubFile.prototype.findChild;
  ePubNode.prototype.findChildren = ePubFile.prototype.findChildren;
  ePubNode.prototype.updateChild = ePubFile.prototype.updateChild;
  ePubNode.prototype.updateChildren = ePubFile.prototype.updateChildren;
  ePubNode.prototype.removeChild = ePubFile.prototype.removeChild;
  ePubNode.prototype.removeChildren = ePubFile.prototype.removeChildren;

  exports.ePubDoc = ePubDoc;
  exports.ePubFile = ePubFile;
  exports.ePubNode = ePubNode;

}));
