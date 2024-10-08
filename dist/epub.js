"use strict";
var epub = (() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // node_modules/js-beautify/js/src/core/output.js
  var require_output = __commonJS({
    "node_modules/js-beautify/js/src/core/output.js"(exports, module) {
      "use strict";
      function OutputLine(parent) {
        this.__parent = parent;
        this.__character_count = 0;
        this.__indent_count = -1;
        this.__alignment_count = 0;
        this.__wrap_point_index = 0;
        this.__wrap_point_character_count = 0;
        this.__wrap_point_indent_count = -1;
        this.__wrap_point_alignment_count = 0;
        this.__items = [];
      }
      OutputLine.prototype.clone_empty = function() {
        var line = new OutputLine(this.__parent);
        line.set_indent(this.__indent_count, this.__alignment_count);
        return line;
      };
      OutputLine.prototype.item = function(index) {
        if (index < 0) {
          return this.__items[this.__items.length + index];
        } else {
          return this.__items[index];
        }
      };
      OutputLine.prototype.has_match = function(pattern) {
        for (var lastCheckedOutput = this.__items.length - 1; lastCheckedOutput >= 0; lastCheckedOutput--) {
          if (this.__items[lastCheckedOutput].match(pattern)) {
            return true;
          }
        }
        return false;
      };
      OutputLine.prototype.set_indent = function(indent, alignment) {
        if (this.is_empty()) {
          this.__indent_count = indent || 0;
          this.__alignment_count = alignment || 0;
          this.__character_count = this.__parent.get_indent_size(this.__indent_count, this.__alignment_count);
        }
      };
      OutputLine.prototype._set_wrap_point = function() {
        if (this.__parent.wrap_line_length) {
          this.__wrap_point_index = this.__items.length;
          this.__wrap_point_character_count = this.__character_count;
          this.__wrap_point_indent_count = this.__parent.next_line.__indent_count;
          this.__wrap_point_alignment_count = this.__parent.next_line.__alignment_count;
        }
      };
      OutputLine.prototype._should_wrap = function() {
        return this.__wrap_point_index && this.__character_count > this.__parent.wrap_line_length && this.__wrap_point_character_count > this.__parent.next_line.__character_count;
      };
      OutputLine.prototype._allow_wrap = function() {
        if (this._should_wrap()) {
          this.__parent.add_new_line();
          var next = this.__parent.current_line;
          next.set_indent(this.__wrap_point_indent_count, this.__wrap_point_alignment_count);
          next.__items = this.__items.slice(this.__wrap_point_index);
          this.__items = this.__items.slice(0, this.__wrap_point_index);
          next.__character_count += this.__character_count - this.__wrap_point_character_count;
          this.__character_count = this.__wrap_point_character_count;
          if (next.__items[0] === " ") {
            next.__items.splice(0, 1);
            next.__character_count -= 1;
          }
          return true;
        }
        return false;
      };
      OutputLine.prototype.is_empty = function() {
        return this.__items.length === 0;
      };
      OutputLine.prototype.last = function() {
        if (!this.is_empty()) {
          return this.__items[this.__items.length - 1];
        } else {
          return null;
        }
      };
      OutputLine.prototype.push = function(item) {
        this.__items.push(item);
        var last_newline_index = item.lastIndexOf("\n");
        if (last_newline_index !== -1) {
          this.__character_count = item.length - last_newline_index;
        } else {
          this.__character_count += item.length;
        }
      };
      OutputLine.prototype.pop = function() {
        var item = null;
        if (!this.is_empty()) {
          item = this.__items.pop();
          this.__character_count -= item.length;
        }
        return item;
      };
      OutputLine.prototype._remove_indent = function() {
        if (this.__indent_count > 0) {
          this.__indent_count -= 1;
          this.__character_count -= this.__parent.indent_size;
        }
      };
      OutputLine.prototype._remove_wrap_indent = function() {
        if (this.__wrap_point_indent_count > 0) {
          this.__wrap_point_indent_count -= 1;
        }
      };
      OutputLine.prototype.trim = function() {
        while (this.last() === " ") {
          this.__items.pop();
          this.__character_count -= 1;
        }
      };
      OutputLine.prototype.toString = function() {
        var result = "";
        if (this.is_empty()) {
          if (this.__parent.indent_empty_lines) {
            result = this.__parent.get_indent_string(this.__indent_count);
          }
        } else {
          result = this.__parent.get_indent_string(this.__indent_count, this.__alignment_count);
          result += this.__items.join("");
        }
        return result;
      };
      function IndentStringCache(options, baseIndentString) {
        this.__cache = [""];
        this.__indent_size = options.indent_size;
        this.__indent_string = options.indent_char;
        if (!options.indent_with_tabs) {
          this.__indent_string = new Array(options.indent_size + 1).join(options.indent_char);
        }
        baseIndentString = baseIndentString || "";
        if (options.indent_level > 0) {
          baseIndentString = new Array(options.indent_level + 1).join(this.__indent_string);
        }
        this.__base_string = baseIndentString;
        this.__base_string_length = baseIndentString.length;
      }
      IndentStringCache.prototype.get_indent_size = function(indent, column) {
        var result = this.__base_string_length;
        column = column || 0;
        if (indent < 0) {
          result = 0;
        }
        result += indent * this.__indent_size;
        result += column;
        return result;
      };
      IndentStringCache.prototype.get_indent_string = function(indent_level, column) {
        var result = this.__base_string;
        column = column || 0;
        if (indent_level < 0) {
          indent_level = 0;
          result = "";
        }
        column += indent_level * this.__indent_size;
        this.__ensure_cache(column);
        result += this.__cache[column];
        return result;
      };
      IndentStringCache.prototype.__ensure_cache = function(column) {
        while (column >= this.__cache.length) {
          this.__add_column();
        }
      };
      IndentStringCache.prototype.__add_column = function() {
        var column = this.__cache.length;
        var indent = 0;
        var result = "";
        if (this.__indent_size && column >= this.__indent_size) {
          indent = Math.floor(column / this.__indent_size);
          column -= indent * this.__indent_size;
          result = new Array(indent + 1).join(this.__indent_string);
        }
        if (column) {
          result += new Array(column + 1).join(" ");
        }
        this.__cache.push(result);
      };
      function Output(options, baseIndentString) {
        this.__indent_cache = new IndentStringCache(options, baseIndentString);
        this.raw = false;
        this._end_with_newline = options.end_with_newline;
        this.indent_size = options.indent_size;
        this.wrap_line_length = options.wrap_line_length;
        this.indent_empty_lines = options.indent_empty_lines;
        this.__lines = [];
        this.previous_line = null;
        this.current_line = null;
        this.next_line = new OutputLine(this);
        this.space_before_token = false;
        this.non_breaking_space = false;
        this.previous_token_wrapped = false;
        this.__add_outputline();
      }
      Output.prototype.__add_outputline = function() {
        this.previous_line = this.current_line;
        this.current_line = this.next_line.clone_empty();
        this.__lines.push(this.current_line);
      };
      Output.prototype.get_line_number = function() {
        return this.__lines.length;
      };
      Output.prototype.get_indent_string = function(indent, column) {
        return this.__indent_cache.get_indent_string(indent, column);
      };
      Output.prototype.get_indent_size = function(indent, column) {
        return this.__indent_cache.get_indent_size(indent, column);
      };
      Output.prototype.is_empty = function() {
        return !this.previous_line && this.current_line.is_empty();
      };
      Output.prototype.add_new_line = function(force_newline) {
        if (this.is_empty() || !force_newline && this.just_added_newline()) {
          return false;
        }
        if (!this.raw) {
          this.__add_outputline();
        }
        return true;
      };
      Output.prototype.get_code = function(eol) {
        this.trim(true);
        var last_item = this.current_line.pop();
        if (last_item) {
          if (last_item[last_item.length - 1] === "\n") {
            last_item = last_item.replace(/\n+$/g, "");
          }
          this.current_line.push(last_item);
        }
        if (this._end_with_newline) {
          this.__add_outputline();
        }
        var sweet_code = this.__lines.join("\n");
        if (eol !== "\n") {
          sweet_code = sweet_code.replace(/[\n]/g, eol);
        }
        return sweet_code;
      };
      Output.prototype.set_wrap_point = function() {
        this.current_line._set_wrap_point();
      };
      Output.prototype.set_indent = function(indent, alignment) {
        indent = indent || 0;
        alignment = alignment || 0;
        this.next_line.set_indent(indent, alignment);
        if (this.__lines.length > 1) {
          this.current_line.set_indent(indent, alignment);
          return true;
        }
        this.current_line.set_indent();
        return false;
      };
      Output.prototype.add_raw_token = function(token) {
        for (var x = 0; x < token.newlines; x++) {
          this.__add_outputline();
        }
        this.current_line.set_indent(-1);
        this.current_line.push(token.whitespace_before);
        this.current_line.push(token.text);
        this.space_before_token = false;
        this.non_breaking_space = false;
        this.previous_token_wrapped = false;
      };
      Output.prototype.add_token = function(printable_token) {
        this.__add_space_before_token();
        this.current_line.push(printable_token);
        this.space_before_token = false;
        this.non_breaking_space = false;
        this.previous_token_wrapped = this.current_line._allow_wrap();
      };
      Output.prototype.__add_space_before_token = function() {
        if (this.space_before_token && !this.just_added_newline()) {
          if (!this.non_breaking_space) {
            this.set_wrap_point();
          }
          this.current_line.push(" ");
        }
      };
      Output.prototype.remove_indent = function(index) {
        var output_length = this.__lines.length;
        while (index < output_length) {
          this.__lines[index]._remove_indent();
          index++;
        }
        this.current_line._remove_wrap_indent();
      };
      Output.prototype.trim = function(eat_newlines) {
        eat_newlines = eat_newlines === void 0 ? false : eat_newlines;
        this.current_line.trim();
        while (eat_newlines && this.__lines.length > 1 && this.current_line.is_empty()) {
          this.__lines.pop();
          this.current_line = this.__lines[this.__lines.length - 1];
          this.current_line.trim();
        }
        this.previous_line = this.__lines.length > 1 ? this.__lines[this.__lines.length - 2] : null;
      };
      Output.prototype.just_added_newline = function() {
        return this.current_line.is_empty();
      };
      Output.prototype.just_added_blankline = function() {
        return this.is_empty() || this.current_line.is_empty() && this.previous_line.is_empty();
      };
      Output.prototype.ensure_empty_line_above = function(starts_with, ends_with) {
        var index = this.__lines.length - 2;
        while (index >= 0) {
          var potentialEmptyLine = this.__lines[index];
          if (potentialEmptyLine.is_empty()) {
            break;
          } else if (potentialEmptyLine.item(0).indexOf(starts_with) !== 0 && potentialEmptyLine.item(-1) !== ends_with) {
            this.__lines.splice(index + 1, 0, new OutputLine(this));
            this.previous_line = this.__lines[this.__lines.length - 2];
            break;
          }
          index--;
        }
      };
      module.exports.Output = Output;
    }
  });

  // node_modules/js-beautify/js/src/core/token.js
  var require_token = __commonJS({
    "node_modules/js-beautify/js/src/core/token.js"(exports, module) {
      "use strict";
      function Token(type, text, newlines, whitespace_before) {
        this.type = type;
        this.text = text;
        this.comments_before = null;
        this.newlines = newlines || 0;
        this.whitespace_before = whitespace_before || "";
        this.parent = null;
        this.next = null;
        this.previous = null;
        this.opened = null;
        this.closed = null;
        this.directives = null;
      }
      module.exports.Token = Token;
    }
  });

  // node_modules/js-beautify/js/src/javascript/acorn.js
  var require_acorn = __commonJS({
    "node_modules/js-beautify/js/src/javascript/acorn.js"(exports) {
      "use strict";
      var baseASCIIidentifierStartChars = "\\x23\\x24\\x40\\x41-\\x5a\\x5f\\x61-\\x7a";
      var baseASCIIidentifierChars = "\\x24\\x30-\\x39\\x41-\\x5a\\x5f\\x61-\\x7a";
      var nonASCIIidentifierStartChars = "\\xaa\\xb5\\xba\\xc0-\\xd6\\xd8-\\xf6\\xf8-\\u02c1\\u02c6-\\u02d1\\u02e0-\\u02e4\\u02ec\\u02ee\\u0370-\\u0374\\u0376\\u0377\\u037a-\\u037d\\u0386\\u0388-\\u038a\\u038c\\u038e-\\u03a1\\u03a3-\\u03f5\\u03f7-\\u0481\\u048a-\\u0527\\u0531-\\u0556\\u0559\\u0561-\\u0587\\u05d0-\\u05ea\\u05f0-\\u05f2\\u0620-\\u064a\\u066e\\u066f\\u0671-\\u06d3\\u06d5\\u06e5\\u06e6\\u06ee\\u06ef\\u06fa-\\u06fc\\u06ff\\u0710\\u0712-\\u072f\\u074d-\\u07a5\\u07b1\\u07ca-\\u07ea\\u07f4\\u07f5\\u07fa\\u0800-\\u0815\\u081a\\u0824\\u0828\\u0840-\\u0858\\u08a0\\u08a2-\\u08ac\\u0904-\\u0939\\u093d\\u0950\\u0958-\\u0961\\u0971-\\u0977\\u0979-\\u097f\\u0985-\\u098c\\u098f\\u0990\\u0993-\\u09a8\\u09aa-\\u09b0\\u09b2\\u09b6-\\u09b9\\u09bd\\u09ce\\u09dc\\u09dd\\u09df-\\u09e1\\u09f0\\u09f1\\u0a05-\\u0a0a\\u0a0f\\u0a10\\u0a13-\\u0a28\\u0a2a-\\u0a30\\u0a32\\u0a33\\u0a35\\u0a36\\u0a38\\u0a39\\u0a59-\\u0a5c\\u0a5e\\u0a72-\\u0a74\\u0a85-\\u0a8d\\u0a8f-\\u0a91\\u0a93-\\u0aa8\\u0aaa-\\u0ab0\\u0ab2\\u0ab3\\u0ab5-\\u0ab9\\u0abd\\u0ad0\\u0ae0\\u0ae1\\u0b05-\\u0b0c\\u0b0f\\u0b10\\u0b13-\\u0b28\\u0b2a-\\u0b30\\u0b32\\u0b33\\u0b35-\\u0b39\\u0b3d\\u0b5c\\u0b5d\\u0b5f-\\u0b61\\u0b71\\u0b83\\u0b85-\\u0b8a\\u0b8e-\\u0b90\\u0b92-\\u0b95\\u0b99\\u0b9a\\u0b9c\\u0b9e\\u0b9f\\u0ba3\\u0ba4\\u0ba8-\\u0baa\\u0bae-\\u0bb9\\u0bd0\\u0c05-\\u0c0c\\u0c0e-\\u0c10\\u0c12-\\u0c28\\u0c2a-\\u0c33\\u0c35-\\u0c39\\u0c3d\\u0c58\\u0c59\\u0c60\\u0c61\\u0c85-\\u0c8c\\u0c8e-\\u0c90\\u0c92-\\u0ca8\\u0caa-\\u0cb3\\u0cb5-\\u0cb9\\u0cbd\\u0cde\\u0ce0\\u0ce1\\u0cf1\\u0cf2\\u0d05-\\u0d0c\\u0d0e-\\u0d10\\u0d12-\\u0d3a\\u0d3d\\u0d4e\\u0d60\\u0d61\\u0d7a-\\u0d7f\\u0d85-\\u0d96\\u0d9a-\\u0db1\\u0db3-\\u0dbb\\u0dbd\\u0dc0-\\u0dc6\\u0e01-\\u0e30\\u0e32\\u0e33\\u0e40-\\u0e46\\u0e81\\u0e82\\u0e84\\u0e87\\u0e88\\u0e8a\\u0e8d\\u0e94-\\u0e97\\u0e99-\\u0e9f\\u0ea1-\\u0ea3\\u0ea5\\u0ea7\\u0eaa\\u0eab\\u0ead-\\u0eb0\\u0eb2\\u0eb3\\u0ebd\\u0ec0-\\u0ec4\\u0ec6\\u0edc-\\u0edf\\u0f00\\u0f40-\\u0f47\\u0f49-\\u0f6c\\u0f88-\\u0f8c\\u1000-\\u102a\\u103f\\u1050-\\u1055\\u105a-\\u105d\\u1061\\u1065\\u1066\\u106e-\\u1070\\u1075-\\u1081\\u108e\\u10a0-\\u10c5\\u10c7\\u10cd\\u10d0-\\u10fa\\u10fc-\\u1248\\u124a-\\u124d\\u1250-\\u1256\\u1258\\u125a-\\u125d\\u1260-\\u1288\\u128a-\\u128d\\u1290-\\u12b0\\u12b2-\\u12b5\\u12b8-\\u12be\\u12c0\\u12c2-\\u12c5\\u12c8-\\u12d6\\u12d8-\\u1310\\u1312-\\u1315\\u1318-\\u135a\\u1380-\\u138f\\u13a0-\\u13f4\\u1401-\\u166c\\u166f-\\u167f\\u1681-\\u169a\\u16a0-\\u16ea\\u16ee-\\u16f0\\u1700-\\u170c\\u170e-\\u1711\\u1720-\\u1731\\u1740-\\u1751\\u1760-\\u176c\\u176e-\\u1770\\u1780-\\u17b3\\u17d7\\u17dc\\u1820-\\u1877\\u1880-\\u18a8\\u18aa\\u18b0-\\u18f5\\u1900-\\u191c\\u1950-\\u196d\\u1970-\\u1974\\u1980-\\u19ab\\u19c1-\\u19c7\\u1a00-\\u1a16\\u1a20-\\u1a54\\u1aa7\\u1b05-\\u1b33\\u1b45-\\u1b4b\\u1b83-\\u1ba0\\u1bae\\u1baf\\u1bba-\\u1be5\\u1c00-\\u1c23\\u1c4d-\\u1c4f\\u1c5a-\\u1c7d\\u1ce9-\\u1cec\\u1cee-\\u1cf1\\u1cf5\\u1cf6\\u1d00-\\u1dbf\\u1e00-\\u1f15\\u1f18-\\u1f1d\\u1f20-\\u1f45\\u1f48-\\u1f4d\\u1f50-\\u1f57\\u1f59\\u1f5b\\u1f5d\\u1f5f-\\u1f7d\\u1f80-\\u1fb4\\u1fb6-\\u1fbc\\u1fbe\\u1fc2-\\u1fc4\\u1fc6-\\u1fcc\\u1fd0-\\u1fd3\\u1fd6-\\u1fdb\\u1fe0-\\u1fec\\u1ff2-\\u1ff4\\u1ff6-\\u1ffc\\u2071\\u207f\\u2090-\\u209c\\u2102\\u2107\\u210a-\\u2113\\u2115\\u2119-\\u211d\\u2124\\u2126\\u2128\\u212a-\\u212d\\u212f-\\u2139\\u213c-\\u213f\\u2145-\\u2149\\u214e\\u2160-\\u2188\\u2c00-\\u2c2e\\u2c30-\\u2c5e\\u2c60-\\u2ce4\\u2ceb-\\u2cee\\u2cf2\\u2cf3\\u2d00-\\u2d25\\u2d27\\u2d2d\\u2d30-\\u2d67\\u2d6f\\u2d80-\\u2d96\\u2da0-\\u2da6\\u2da8-\\u2dae\\u2db0-\\u2db6\\u2db8-\\u2dbe\\u2dc0-\\u2dc6\\u2dc8-\\u2dce\\u2dd0-\\u2dd6\\u2dd8-\\u2dde\\u2e2f\\u3005-\\u3007\\u3021-\\u3029\\u3031-\\u3035\\u3038-\\u303c\\u3041-\\u3096\\u309d-\\u309f\\u30a1-\\u30fa\\u30fc-\\u30ff\\u3105-\\u312d\\u3131-\\u318e\\u31a0-\\u31ba\\u31f0-\\u31ff\\u3400-\\u4db5\\u4e00-\\u9fcc\\ua000-\\ua48c\\ua4d0-\\ua4fd\\ua500-\\ua60c\\ua610-\\ua61f\\ua62a\\ua62b\\ua640-\\ua66e\\ua67f-\\ua697\\ua6a0-\\ua6ef\\ua717-\\ua71f\\ua722-\\ua788\\ua78b-\\ua78e\\ua790-\\ua793\\ua7a0-\\ua7aa\\ua7f8-\\ua801\\ua803-\\ua805\\ua807-\\ua80a\\ua80c-\\ua822\\ua840-\\ua873\\ua882-\\ua8b3\\ua8f2-\\ua8f7\\ua8fb\\ua90a-\\ua925\\ua930-\\ua946\\ua960-\\ua97c\\ua984-\\ua9b2\\ua9cf\\uaa00-\\uaa28\\uaa40-\\uaa42\\uaa44-\\uaa4b\\uaa60-\\uaa76\\uaa7a\\uaa80-\\uaaaf\\uaab1\\uaab5\\uaab6\\uaab9-\\uaabd\\uaac0\\uaac2\\uaadb-\\uaadd\\uaae0-\\uaaea\\uaaf2-\\uaaf4\\uab01-\\uab06\\uab09-\\uab0e\\uab11-\\uab16\\uab20-\\uab26\\uab28-\\uab2e\\uabc0-\\uabe2\\uac00-\\ud7a3\\ud7b0-\\ud7c6\\ud7cb-\\ud7fb\\uf900-\\ufa6d\\ufa70-\\ufad9\\ufb00-\\ufb06\\ufb13-\\ufb17\\ufb1d\\ufb1f-\\ufb28\\ufb2a-\\ufb36\\ufb38-\\ufb3c\\ufb3e\\ufb40\\ufb41\\ufb43\\ufb44\\ufb46-\\ufbb1\\ufbd3-\\ufd3d\\ufd50-\\ufd8f\\ufd92-\\ufdc7\\ufdf0-\\ufdfb\\ufe70-\\ufe74\\ufe76-\\ufefc\\uff21-\\uff3a\\uff41-\\uff5a\\uff66-\\uffbe\\uffc2-\\uffc7\\uffca-\\uffcf\\uffd2-\\uffd7\\uffda-\\uffdc";
      var nonASCIIidentifierChars = "\\u0300-\\u036f\\u0483-\\u0487\\u0591-\\u05bd\\u05bf\\u05c1\\u05c2\\u05c4\\u05c5\\u05c7\\u0610-\\u061a\\u0620-\\u0649\\u0672-\\u06d3\\u06e7-\\u06e8\\u06fb-\\u06fc\\u0730-\\u074a\\u0800-\\u0814\\u081b-\\u0823\\u0825-\\u0827\\u0829-\\u082d\\u0840-\\u0857\\u08e4-\\u08fe\\u0900-\\u0903\\u093a-\\u093c\\u093e-\\u094f\\u0951-\\u0957\\u0962-\\u0963\\u0966-\\u096f\\u0981-\\u0983\\u09bc\\u09be-\\u09c4\\u09c7\\u09c8\\u09d7\\u09df-\\u09e0\\u0a01-\\u0a03\\u0a3c\\u0a3e-\\u0a42\\u0a47\\u0a48\\u0a4b-\\u0a4d\\u0a51\\u0a66-\\u0a71\\u0a75\\u0a81-\\u0a83\\u0abc\\u0abe-\\u0ac5\\u0ac7-\\u0ac9\\u0acb-\\u0acd\\u0ae2-\\u0ae3\\u0ae6-\\u0aef\\u0b01-\\u0b03\\u0b3c\\u0b3e-\\u0b44\\u0b47\\u0b48\\u0b4b-\\u0b4d\\u0b56\\u0b57\\u0b5f-\\u0b60\\u0b66-\\u0b6f\\u0b82\\u0bbe-\\u0bc2\\u0bc6-\\u0bc8\\u0bca-\\u0bcd\\u0bd7\\u0be6-\\u0bef\\u0c01-\\u0c03\\u0c46-\\u0c48\\u0c4a-\\u0c4d\\u0c55\\u0c56\\u0c62-\\u0c63\\u0c66-\\u0c6f\\u0c82\\u0c83\\u0cbc\\u0cbe-\\u0cc4\\u0cc6-\\u0cc8\\u0cca-\\u0ccd\\u0cd5\\u0cd6\\u0ce2-\\u0ce3\\u0ce6-\\u0cef\\u0d02\\u0d03\\u0d46-\\u0d48\\u0d57\\u0d62-\\u0d63\\u0d66-\\u0d6f\\u0d82\\u0d83\\u0dca\\u0dcf-\\u0dd4\\u0dd6\\u0dd8-\\u0ddf\\u0df2\\u0df3\\u0e34-\\u0e3a\\u0e40-\\u0e45\\u0e50-\\u0e59\\u0eb4-\\u0eb9\\u0ec8-\\u0ecd\\u0ed0-\\u0ed9\\u0f18\\u0f19\\u0f20-\\u0f29\\u0f35\\u0f37\\u0f39\\u0f41-\\u0f47\\u0f71-\\u0f84\\u0f86-\\u0f87\\u0f8d-\\u0f97\\u0f99-\\u0fbc\\u0fc6\\u1000-\\u1029\\u1040-\\u1049\\u1067-\\u106d\\u1071-\\u1074\\u1082-\\u108d\\u108f-\\u109d\\u135d-\\u135f\\u170e-\\u1710\\u1720-\\u1730\\u1740-\\u1750\\u1772\\u1773\\u1780-\\u17b2\\u17dd\\u17e0-\\u17e9\\u180b-\\u180d\\u1810-\\u1819\\u1920-\\u192b\\u1930-\\u193b\\u1951-\\u196d\\u19b0-\\u19c0\\u19c8-\\u19c9\\u19d0-\\u19d9\\u1a00-\\u1a15\\u1a20-\\u1a53\\u1a60-\\u1a7c\\u1a7f-\\u1a89\\u1a90-\\u1a99\\u1b46-\\u1b4b\\u1b50-\\u1b59\\u1b6b-\\u1b73\\u1bb0-\\u1bb9\\u1be6-\\u1bf3\\u1c00-\\u1c22\\u1c40-\\u1c49\\u1c5b-\\u1c7d\\u1cd0-\\u1cd2\\u1d00-\\u1dbe\\u1e01-\\u1f15\\u200c\\u200d\\u203f\\u2040\\u2054\\u20d0-\\u20dc\\u20e1\\u20e5-\\u20f0\\u2d81-\\u2d96\\u2de0-\\u2dff\\u3021-\\u3028\\u3099\\u309a\\ua640-\\ua66d\\ua674-\\ua67d\\ua69f\\ua6f0-\\ua6f1\\ua7f8-\\ua800\\ua806\\ua80b\\ua823-\\ua827\\ua880-\\ua881\\ua8b4-\\ua8c4\\ua8d0-\\ua8d9\\ua8f3-\\ua8f7\\ua900-\\ua909\\ua926-\\ua92d\\ua930-\\ua945\\ua980-\\ua983\\ua9b3-\\ua9c0\\uaa00-\\uaa27\\uaa40-\\uaa41\\uaa4c-\\uaa4d\\uaa50-\\uaa59\\uaa7b\\uaae0-\\uaae9\\uaaf2-\\uaaf3\\uabc0-\\uabe1\\uabec\\uabed\\uabf0-\\uabf9\\ufb20-\\ufb28\\ufe00-\\ufe0f\\ufe20-\\ufe26\\ufe33\\ufe34\\ufe4d-\\ufe4f\\uff10-\\uff19\\uff3f";
      var unicodeEscapeOrCodePoint = "\\\\u[0-9a-fA-F]{4}|\\\\u\\{[0-9a-fA-F]+\\}";
      var identifierStart = "(?:" + unicodeEscapeOrCodePoint + "|[" + baseASCIIidentifierStartChars + nonASCIIidentifierStartChars + "])";
      var identifierChars = "(?:" + unicodeEscapeOrCodePoint + "|[" + baseASCIIidentifierChars + nonASCIIidentifierStartChars + nonASCIIidentifierChars + "])*";
      exports.identifier = new RegExp(identifierStart + identifierChars, "g");
      exports.identifierStart = new RegExp(identifierStart);
      exports.identifierMatch = new RegExp("(?:" + unicodeEscapeOrCodePoint + "|[" + baseASCIIidentifierChars + nonASCIIidentifierStartChars + nonASCIIidentifierChars + "])+");
      exports.newline = /[\n\r\u2028\u2029]/;
      exports.lineBreak = new RegExp("\r\n|" + exports.newline.source);
      exports.allLineBreaks = new RegExp(exports.lineBreak.source, "g");
    }
  });

  // node_modules/js-beautify/js/src/core/options.js
  var require_options = __commonJS({
    "node_modules/js-beautify/js/src/core/options.js"(exports, module) {
      "use strict";
      function Options(options, merge_child_field) {
        this.raw_options = _mergeOpts(options, merge_child_field);
        this.disabled = this._get_boolean("disabled");
        this.eol = this._get_characters("eol", "auto");
        this.end_with_newline = this._get_boolean("end_with_newline");
        this.indent_size = this._get_number("indent_size", 4);
        this.indent_char = this._get_characters("indent_char", " ");
        this.indent_level = this._get_number("indent_level");
        this.preserve_newlines = this._get_boolean("preserve_newlines", true);
        this.max_preserve_newlines = this._get_number("max_preserve_newlines", 32786);
        if (!this.preserve_newlines) {
          this.max_preserve_newlines = 0;
        }
        this.indent_with_tabs = this._get_boolean("indent_with_tabs", this.indent_char === "	");
        if (this.indent_with_tabs) {
          this.indent_char = "	";
          if (this.indent_size === 1) {
            this.indent_size = 4;
          }
        }
        this.wrap_line_length = this._get_number("wrap_line_length", this._get_number("max_char"));
        this.indent_empty_lines = this._get_boolean("indent_empty_lines");
        this.templating = this._get_selection_list("templating", ["auto", "none", "angular", "django", "erb", "handlebars", "php", "smarty"], ["auto"]);
      }
      Options.prototype._get_array = function(name, default_value) {
        var option_value = this.raw_options[name];
        var result = default_value || [];
        if (typeof option_value === "object") {
          if (option_value !== null && typeof option_value.concat === "function") {
            result = option_value.concat();
          }
        } else if (typeof option_value === "string") {
          result = option_value.split(/[^a-zA-Z0-9_\/\-]+/);
        }
        return result;
      };
      Options.prototype._get_boolean = function(name, default_value) {
        var option_value = this.raw_options[name];
        var result = option_value === void 0 ? !!default_value : !!option_value;
        return result;
      };
      Options.prototype._get_characters = function(name, default_value) {
        var option_value = this.raw_options[name];
        var result = default_value || "";
        if (typeof option_value === "string") {
          result = option_value.replace(/\\r/, "\r").replace(/\\n/, "\n").replace(/\\t/, "	");
        }
        return result;
      };
      Options.prototype._get_number = function(name, default_value) {
        var option_value = this.raw_options[name];
        default_value = parseInt(default_value, 10);
        if (isNaN(default_value)) {
          default_value = 0;
        }
        var result = parseInt(option_value, 10);
        if (isNaN(result)) {
          result = default_value;
        }
        return result;
      };
      Options.prototype._get_selection = function(name, selection_list, default_value) {
        var result = this._get_selection_list(name, selection_list, default_value);
        if (result.length !== 1) {
          throw new Error(
            "Invalid Option Value: The option '" + name + "' can only be one of the following values:\n" + selection_list + "\nYou passed in: '" + this.raw_options[name] + "'"
          );
        }
        return result[0];
      };
      Options.prototype._get_selection_list = function(name, selection_list, default_value) {
        if (!selection_list || selection_list.length === 0) {
          throw new Error("Selection list cannot be empty.");
        }
        default_value = default_value || [selection_list[0]];
        if (!this._is_valid_selection(default_value, selection_list)) {
          throw new Error("Invalid Default Value!");
        }
        var result = this._get_array(name, default_value);
        if (!this._is_valid_selection(result, selection_list)) {
          throw new Error(
            "Invalid Option Value: The option '" + name + "' can contain only the following values:\n" + selection_list + "\nYou passed in: '" + this.raw_options[name] + "'"
          );
        }
        return result;
      };
      Options.prototype._is_valid_selection = function(result, selection_list) {
        return result.length && selection_list.length && !result.some(function(item) {
          return selection_list.indexOf(item) === -1;
        });
      };
      function _mergeOpts(allOptions, childFieldName) {
        var finalOpts = {};
        allOptions = _normalizeOpts(allOptions);
        var name;
        for (name in allOptions) {
          if (name !== childFieldName) {
            finalOpts[name] = allOptions[name];
          }
        }
        if (childFieldName && allOptions[childFieldName]) {
          for (name in allOptions[childFieldName]) {
            finalOpts[name] = allOptions[childFieldName][name];
          }
        }
        return finalOpts;
      }
      function _normalizeOpts(options) {
        var convertedOpts = {};
        var key;
        for (key in options) {
          var newKey = key.replace(/-/g, "_");
          convertedOpts[newKey] = options[key];
        }
        return convertedOpts;
      }
      module.exports.Options = Options;
      module.exports.normalizeOpts = _normalizeOpts;
      module.exports.mergeOpts = _mergeOpts;
    }
  });

  // node_modules/js-beautify/js/src/javascript/options.js
  var require_options2 = __commonJS({
    "node_modules/js-beautify/js/src/javascript/options.js"(exports, module) {
      "use strict";
      var BaseOptions = require_options().Options;
      var validPositionValues = ["before-newline", "after-newline", "preserve-newline"];
      function Options(options) {
        BaseOptions.call(this, options, "js");
        var raw_brace_style = this.raw_options.brace_style || null;
        if (raw_brace_style === "expand-strict") {
          this.raw_options.brace_style = "expand";
        } else if (raw_brace_style === "collapse-preserve-inline") {
          this.raw_options.brace_style = "collapse,preserve-inline";
        } else if (this.raw_options.braces_on_own_line !== void 0) {
          this.raw_options.brace_style = this.raw_options.braces_on_own_line ? "expand" : "collapse";
        }
        var brace_style_split = this._get_selection_list("brace_style", ["collapse", "expand", "end-expand", "none", "preserve-inline"]);
        this.brace_preserve_inline = false;
        this.brace_style = "collapse";
        for (var bs = 0; bs < brace_style_split.length; bs++) {
          if (brace_style_split[bs] === "preserve-inline") {
            this.brace_preserve_inline = true;
          } else {
            this.brace_style = brace_style_split[bs];
          }
        }
        this.unindent_chained_methods = this._get_boolean("unindent_chained_methods");
        this.break_chained_methods = this._get_boolean("break_chained_methods");
        this.space_in_paren = this._get_boolean("space_in_paren");
        this.space_in_empty_paren = this._get_boolean("space_in_empty_paren");
        this.jslint_happy = this._get_boolean("jslint_happy");
        this.space_after_anon_function = this._get_boolean("space_after_anon_function");
        this.space_after_named_function = this._get_boolean("space_after_named_function");
        this.keep_array_indentation = this._get_boolean("keep_array_indentation");
        this.space_before_conditional = this._get_boolean("space_before_conditional", true);
        this.unescape_strings = this._get_boolean("unescape_strings");
        this.e4x = this._get_boolean("e4x");
        this.comma_first = this._get_boolean("comma_first");
        this.operator_position = this._get_selection("operator_position", validPositionValues);
        this.test_output_raw = this._get_boolean("test_output_raw");
        if (this.jslint_happy) {
          this.space_after_anon_function = true;
        }
      }
      Options.prototype = new BaseOptions();
      module.exports.Options = Options;
    }
  });

  // node_modules/js-beautify/js/src/core/inputscanner.js
  var require_inputscanner = __commonJS({
    "node_modules/js-beautify/js/src/core/inputscanner.js"(exports, module) {
      "use strict";
      var regexp_has_sticky = RegExp.prototype.hasOwnProperty("sticky");
      function InputScanner(input_string) {
        this.__input = input_string || "";
        this.__input_length = this.__input.length;
        this.__position = 0;
      }
      InputScanner.prototype.restart = function() {
        this.__position = 0;
      };
      InputScanner.prototype.back = function() {
        if (this.__position > 0) {
          this.__position -= 1;
        }
      };
      InputScanner.prototype.hasNext = function() {
        return this.__position < this.__input_length;
      };
      InputScanner.prototype.next = function() {
        var val = null;
        if (this.hasNext()) {
          val = this.__input.charAt(this.__position);
          this.__position += 1;
        }
        return val;
      };
      InputScanner.prototype.peek = function(index) {
        var val = null;
        index = index || 0;
        index += this.__position;
        if (index >= 0 && index < this.__input_length) {
          val = this.__input.charAt(index);
        }
        return val;
      };
      InputScanner.prototype.__match = function(pattern, index) {
        pattern.lastIndex = index;
        var pattern_match = pattern.exec(this.__input);
        if (pattern_match && !(regexp_has_sticky && pattern.sticky)) {
          if (pattern_match.index !== index) {
            pattern_match = null;
          }
        }
        return pattern_match;
      };
      InputScanner.prototype.test = function(pattern, index) {
        index = index || 0;
        index += this.__position;
        if (index >= 0 && index < this.__input_length) {
          return !!this.__match(pattern, index);
        } else {
          return false;
        }
      };
      InputScanner.prototype.testChar = function(pattern, index) {
        var val = this.peek(index);
        pattern.lastIndex = 0;
        return val !== null && pattern.test(val);
      };
      InputScanner.prototype.match = function(pattern) {
        var pattern_match = this.__match(pattern, this.__position);
        if (pattern_match) {
          this.__position += pattern_match[0].length;
        } else {
          pattern_match = null;
        }
        return pattern_match;
      };
      InputScanner.prototype.read = function(starting_pattern, until_pattern, until_after) {
        var val = "";
        var match;
        if (starting_pattern) {
          match = this.match(starting_pattern);
          if (match) {
            val += match[0];
          }
        }
        if (until_pattern && (match || !starting_pattern)) {
          val += this.readUntil(until_pattern, until_after);
        }
        return val;
      };
      InputScanner.prototype.readUntil = function(pattern, until_after) {
        var val = "";
        var match_index = this.__position;
        pattern.lastIndex = this.__position;
        var pattern_match = pattern.exec(this.__input);
        if (pattern_match) {
          match_index = pattern_match.index;
          if (until_after) {
            match_index += pattern_match[0].length;
          }
        } else {
          match_index = this.__input_length;
        }
        val = this.__input.substring(this.__position, match_index);
        this.__position = match_index;
        return val;
      };
      InputScanner.prototype.readUntilAfter = function(pattern) {
        return this.readUntil(pattern, true);
      };
      InputScanner.prototype.get_regexp = function(pattern, match_from) {
        var result = null;
        var flags = "g";
        if (match_from && regexp_has_sticky) {
          flags = "y";
        }
        if (typeof pattern === "string" && pattern !== "") {
          result = new RegExp(pattern, flags);
        } else if (pattern) {
          result = new RegExp(pattern.source, flags);
        }
        return result;
      };
      InputScanner.prototype.get_literal_regexp = function(literal_string) {
        return RegExp(literal_string.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&"));
      };
      InputScanner.prototype.peekUntilAfter = function(pattern) {
        var start = this.__position;
        var val = this.readUntilAfter(pattern);
        this.__position = start;
        return val;
      };
      InputScanner.prototype.lookBack = function(testVal) {
        var start = this.__position - 1;
        return start >= testVal.length && this.__input.substring(start - testVal.length, start).toLowerCase() === testVal;
      };
      module.exports.InputScanner = InputScanner;
    }
  });

  // node_modules/js-beautify/js/src/core/tokenstream.js
  var require_tokenstream = __commonJS({
    "node_modules/js-beautify/js/src/core/tokenstream.js"(exports, module) {
      "use strict";
      function TokenStream(parent_token) {
        this.__tokens = [];
        this.__tokens_length = this.__tokens.length;
        this.__position = 0;
        this.__parent_token = parent_token;
      }
      TokenStream.prototype.restart = function() {
        this.__position = 0;
      };
      TokenStream.prototype.isEmpty = function() {
        return this.__tokens_length === 0;
      };
      TokenStream.prototype.hasNext = function() {
        return this.__position < this.__tokens_length;
      };
      TokenStream.prototype.next = function() {
        var val = null;
        if (this.hasNext()) {
          val = this.__tokens[this.__position];
          this.__position += 1;
        }
        return val;
      };
      TokenStream.prototype.peek = function(index) {
        var val = null;
        index = index || 0;
        index += this.__position;
        if (index >= 0 && index < this.__tokens_length) {
          val = this.__tokens[index];
        }
        return val;
      };
      TokenStream.prototype.add = function(token) {
        if (this.__parent_token) {
          token.parent = this.__parent_token;
        }
        this.__tokens.push(token);
        this.__tokens_length += 1;
      };
      module.exports.TokenStream = TokenStream;
    }
  });

  // node_modules/js-beautify/js/src/core/pattern.js
  var require_pattern = __commonJS({
    "node_modules/js-beautify/js/src/core/pattern.js"(exports, module) {
      "use strict";
      function Pattern(input_scanner, parent) {
        this._input = input_scanner;
        this._starting_pattern = null;
        this._match_pattern = null;
        this._until_pattern = null;
        this._until_after = false;
        if (parent) {
          this._starting_pattern = this._input.get_regexp(parent._starting_pattern, true);
          this._match_pattern = this._input.get_regexp(parent._match_pattern, true);
          this._until_pattern = this._input.get_regexp(parent._until_pattern);
          this._until_after = parent._until_after;
        }
      }
      Pattern.prototype.read = function() {
        var result = this._input.read(this._starting_pattern);
        if (!this._starting_pattern || result) {
          result += this._input.read(this._match_pattern, this._until_pattern, this._until_after);
        }
        return result;
      };
      Pattern.prototype.read_match = function() {
        return this._input.match(this._match_pattern);
      };
      Pattern.prototype.until_after = function(pattern) {
        var result = this._create();
        result._until_after = true;
        result._until_pattern = this._input.get_regexp(pattern);
        result._update();
        return result;
      };
      Pattern.prototype.until = function(pattern) {
        var result = this._create();
        result._until_after = false;
        result._until_pattern = this._input.get_regexp(pattern);
        result._update();
        return result;
      };
      Pattern.prototype.starting_with = function(pattern) {
        var result = this._create();
        result._starting_pattern = this._input.get_regexp(pattern, true);
        result._update();
        return result;
      };
      Pattern.prototype.matching = function(pattern) {
        var result = this._create();
        result._match_pattern = this._input.get_regexp(pattern, true);
        result._update();
        return result;
      };
      Pattern.prototype._create = function() {
        return new Pattern(this._input, this);
      };
      Pattern.prototype._update = function() {
      };
      module.exports.Pattern = Pattern;
    }
  });

  // node_modules/js-beautify/js/src/core/whitespacepattern.js
  var require_whitespacepattern = __commonJS({
    "node_modules/js-beautify/js/src/core/whitespacepattern.js"(exports, module) {
      "use strict";
      var Pattern = require_pattern().Pattern;
      function WhitespacePattern(input_scanner, parent) {
        Pattern.call(this, input_scanner, parent);
        if (parent) {
          this._line_regexp = this._input.get_regexp(parent._line_regexp);
        } else {
          this.__set_whitespace_patterns("", "");
        }
        this.newline_count = 0;
        this.whitespace_before_token = "";
      }
      WhitespacePattern.prototype = new Pattern();
      WhitespacePattern.prototype.__set_whitespace_patterns = function(whitespace_chars, newline_chars) {
        whitespace_chars += "\\t ";
        newline_chars += "\\n\\r";
        this._match_pattern = this._input.get_regexp(
          "[" + whitespace_chars + newline_chars + "]+",
          true
        );
        this._newline_regexp = this._input.get_regexp(
          "\\r\\n|[" + newline_chars + "]"
        );
      };
      WhitespacePattern.prototype.read = function() {
        this.newline_count = 0;
        this.whitespace_before_token = "";
        var resulting_string = this._input.read(this._match_pattern);
        if (resulting_string === " ") {
          this.whitespace_before_token = " ";
        } else if (resulting_string) {
          var matches = this.__split(this._newline_regexp, resulting_string);
          this.newline_count = matches.length - 1;
          this.whitespace_before_token = matches[this.newline_count];
        }
        return resulting_string;
      };
      WhitespacePattern.prototype.matching = function(whitespace_chars, newline_chars) {
        var result = this._create();
        result.__set_whitespace_patterns(whitespace_chars, newline_chars);
        result._update();
        return result;
      };
      WhitespacePattern.prototype._create = function() {
        return new WhitespacePattern(this._input, this);
      };
      WhitespacePattern.prototype.__split = function(regexp, input_string) {
        regexp.lastIndex = 0;
        var start_index = 0;
        var result = [];
        var next_match = regexp.exec(input_string);
        while (next_match) {
          result.push(input_string.substring(start_index, next_match.index));
          start_index = next_match.index + next_match[0].length;
          next_match = regexp.exec(input_string);
        }
        if (start_index < input_string.length) {
          result.push(input_string.substring(start_index, input_string.length));
        } else {
          result.push("");
        }
        return result;
      };
      module.exports.WhitespacePattern = WhitespacePattern;
    }
  });

  // node_modules/js-beautify/js/src/core/tokenizer.js
  var require_tokenizer = __commonJS({
    "node_modules/js-beautify/js/src/core/tokenizer.js"(exports, module) {
      "use strict";
      var InputScanner = require_inputscanner().InputScanner;
      var Token = require_token().Token;
      var TokenStream = require_tokenstream().TokenStream;
      var WhitespacePattern = require_whitespacepattern().WhitespacePattern;
      var TOKEN = {
        START: "TK_START",
        RAW: "TK_RAW",
        EOF: "TK_EOF"
      };
      var Tokenizer = function(input_string, options) {
        this._input = new InputScanner(input_string);
        this._options = options || {};
        this.__tokens = null;
        this._patterns = {};
        this._patterns.whitespace = new WhitespacePattern(this._input);
      };
      Tokenizer.prototype.tokenize = function() {
        this._input.restart();
        this.__tokens = new TokenStream();
        this._reset();
        var current;
        var previous = new Token(TOKEN.START, "");
        var open_token = null;
        var open_stack = [];
        var comments = new TokenStream();
        while (previous.type !== TOKEN.EOF) {
          current = this._get_next_token(previous, open_token);
          while (this._is_comment(current)) {
            comments.add(current);
            current = this._get_next_token(previous, open_token);
          }
          if (!comments.isEmpty()) {
            current.comments_before = comments;
            comments = new TokenStream();
          }
          current.parent = open_token;
          if (this._is_opening(current)) {
            open_stack.push(open_token);
            open_token = current;
          } else if (open_token && this._is_closing(current, open_token)) {
            current.opened = open_token;
            open_token.closed = current;
            open_token = open_stack.pop();
            current.parent = open_token;
          }
          current.previous = previous;
          previous.next = current;
          this.__tokens.add(current);
          previous = current;
        }
        return this.__tokens;
      };
      Tokenizer.prototype._is_first_token = function() {
        return this.__tokens.isEmpty();
      };
      Tokenizer.prototype._reset = function() {
      };
      Tokenizer.prototype._get_next_token = function(previous_token, open_token) {
        this._readWhitespace();
        var resulting_string = this._input.read(/.+/g);
        if (resulting_string) {
          return this._create_token(TOKEN.RAW, resulting_string);
        } else {
          return this._create_token(TOKEN.EOF, "");
        }
      };
      Tokenizer.prototype._is_comment = function(current_token) {
        return false;
      };
      Tokenizer.prototype._is_opening = function(current_token) {
        return false;
      };
      Tokenizer.prototype._is_closing = function(current_token, open_token) {
        return false;
      };
      Tokenizer.prototype._create_token = function(type, text) {
        var token = new Token(
          type,
          text,
          this._patterns.whitespace.newline_count,
          this._patterns.whitespace.whitespace_before_token
        );
        return token;
      };
      Tokenizer.prototype._readWhitespace = function() {
        return this._patterns.whitespace.read();
      };
      module.exports.Tokenizer = Tokenizer;
      module.exports.TOKEN = TOKEN;
    }
  });

  // node_modules/js-beautify/js/src/core/directives.js
  var require_directives = __commonJS({
    "node_modules/js-beautify/js/src/core/directives.js"(exports, module) {
      "use strict";
      function Directives(start_block_pattern, end_block_pattern) {
        start_block_pattern = typeof start_block_pattern === "string" ? start_block_pattern : start_block_pattern.source;
        end_block_pattern = typeof end_block_pattern === "string" ? end_block_pattern : end_block_pattern.source;
        this.__directives_block_pattern = new RegExp(start_block_pattern + / beautify( \w+[:]\w+)+ /.source + end_block_pattern, "g");
        this.__directive_pattern = / (\w+)[:](\w+)/g;
        this.__directives_end_ignore_pattern = new RegExp(start_block_pattern + /\sbeautify\signore:end\s/.source + end_block_pattern, "g");
      }
      Directives.prototype.get_directives = function(text) {
        if (!text.match(this.__directives_block_pattern)) {
          return null;
        }
        var directives = {};
        this.__directive_pattern.lastIndex = 0;
        var directive_match = this.__directive_pattern.exec(text);
        while (directive_match) {
          directives[directive_match[1]] = directive_match[2];
          directive_match = this.__directive_pattern.exec(text);
        }
        return directives;
      };
      Directives.prototype.readIgnored = function(input) {
        return input.readUntilAfter(this.__directives_end_ignore_pattern);
      };
      module.exports.Directives = Directives;
    }
  });

  // node_modules/js-beautify/js/src/core/templatablepattern.js
  var require_templatablepattern = __commonJS({
    "node_modules/js-beautify/js/src/core/templatablepattern.js"(exports, module) {
      "use strict";
      var Pattern = require_pattern().Pattern;
      var template_names = {
        django: false,
        erb: false,
        handlebars: false,
        php: false,
        smarty: false,
        angular: false
      };
      function TemplatablePattern(input_scanner, parent) {
        Pattern.call(this, input_scanner, parent);
        this.__template_pattern = null;
        this._disabled = Object.assign({}, template_names);
        this._excluded = Object.assign({}, template_names);
        if (parent) {
          this.__template_pattern = this._input.get_regexp(parent.__template_pattern);
          this._excluded = Object.assign(this._excluded, parent._excluded);
          this._disabled = Object.assign(this._disabled, parent._disabled);
        }
        var pattern = new Pattern(input_scanner);
        this.__patterns = {
          handlebars_comment: pattern.starting_with(/{{!--/).until_after(/--}}/),
          handlebars_unescaped: pattern.starting_with(/{{{/).until_after(/}}}/),
          handlebars: pattern.starting_with(/{{/).until_after(/}}/),
          php: pattern.starting_with(/<\?(?:[= ]|php)/).until_after(/\?>/),
          erb: pattern.starting_with(/<%[^%]/).until_after(/[^%]%>/),
          // django coflicts with handlebars a bit.
          django: pattern.starting_with(/{%/).until_after(/%}/),
          django_value: pattern.starting_with(/{{/).until_after(/}}/),
          django_comment: pattern.starting_with(/{#/).until_after(/#}/),
          smarty: pattern.starting_with(/{(?=[^}{\s\n])/).until_after(/[^\s\n]}/),
          smarty_comment: pattern.starting_with(/{\*/).until_after(/\*}/),
          smarty_literal: pattern.starting_with(/{literal}/).until_after(/{\/literal}/)
        };
      }
      TemplatablePattern.prototype = new Pattern();
      TemplatablePattern.prototype._create = function() {
        return new TemplatablePattern(this._input, this);
      };
      TemplatablePattern.prototype._update = function() {
        this.__set_templated_pattern();
      };
      TemplatablePattern.prototype.disable = function(language) {
        var result = this._create();
        result._disabled[language] = true;
        result._update();
        return result;
      };
      TemplatablePattern.prototype.read_options = function(options) {
        var result = this._create();
        for (var language in template_names) {
          result._disabled[language] = options.templating.indexOf(language) === -1;
        }
        result._update();
        return result;
      };
      TemplatablePattern.prototype.exclude = function(language) {
        var result = this._create();
        result._excluded[language] = true;
        result._update();
        return result;
      };
      TemplatablePattern.prototype.read = function() {
        var result = "";
        if (this._match_pattern) {
          result = this._input.read(this._starting_pattern);
        } else {
          result = this._input.read(this._starting_pattern, this.__template_pattern);
        }
        var next = this._read_template();
        while (next) {
          if (this._match_pattern) {
            next += this._input.read(this._match_pattern);
          } else {
            next += this._input.readUntil(this.__template_pattern);
          }
          result += next;
          next = this._read_template();
        }
        if (this._until_after) {
          result += this._input.readUntilAfter(this._until_pattern);
        }
        return result;
      };
      TemplatablePattern.prototype.__set_templated_pattern = function() {
        var items = [];
        if (!this._disabled.php) {
          items.push(this.__patterns.php._starting_pattern.source);
        }
        if (!this._disabled.handlebars) {
          items.push(this.__patterns.handlebars._starting_pattern.source);
        }
        if (!this._disabled.erb) {
          items.push(this.__patterns.erb._starting_pattern.source);
        }
        if (!this._disabled.django) {
          items.push(this.__patterns.django._starting_pattern.source);
          items.push(this.__patterns.django_value._starting_pattern.source);
          items.push(this.__patterns.django_comment._starting_pattern.source);
        }
        if (!this._disabled.smarty) {
          items.push(this.__patterns.smarty._starting_pattern.source);
        }
        if (this._until_pattern) {
          items.push(this._until_pattern.source);
        }
        this.__template_pattern = this._input.get_regexp("(?:" + items.join("|") + ")");
      };
      TemplatablePattern.prototype._read_template = function() {
        var resulting_string = "";
        var c = this._input.peek();
        if (c === "<") {
          var peek1 = this._input.peek(1);
          if (!this._disabled.php && !this._excluded.php && peek1 === "?") {
            resulting_string = resulting_string || this.__patterns.php.read();
          }
          if (!this._disabled.erb && !this._excluded.erb && peek1 === "%") {
            resulting_string = resulting_string || this.__patterns.erb.read();
          }
        } else if (c === "{") {
          if (!this._disabled.handlebars && !this._excluded.handlebars) {
            resulting_string = resulting_string || this.__patterns.handlebars_comment.read();
            resulting_string = resulting_string || this.__patterns.handlebars_unescaped.read();
            resulting_string = resulting_string || this.__patterns.handlebars.read();
          }
          if (!this._disabled.django) {
            if (!this._excluded.django && !this._excluded.handlebars) {
              resulting_string = resulting_string || this.__patterns.django_value.read();
            }
            if (!this._excluded.django) {
              resulting_string = resulting_string || this.__patterns.django_comment.read();
              resulting_string = resulting_string || this.__patterns.django.read();
            }
          }
          if (!this._disabled.smarty) {
            if (this._disabled.django && this._disabled.handlebars) {
              resulting_string = resulting_string || this.__patterns.smarty_comment.read();
              resulting_string = resulting_string || this.__patterns.smarty_literal.read();
              resulting_string = resulting_string || this.__patterns.smarty.read();
            }
          }
        }
        return resulting_string;
      };
      module.exports.TemplatablePattern = TemplatablePattern;
    }
  });

  // node_modules/js-beautify/js/src/javascript/tokenizer.js
  var require_tokenizer2 = __commonJS({
    "node_modules/js-beautify/js/src/javascript/tokenizer.js"(exports, module) {
      "use strict";
      var InputScanner = require_inputscanner().InputScanner;
      var BaseTokenizer = require_tokenizer().Tokenizer;
      var BASETOKEN = require_tokenizer().TOKEN;
      var Directives = require_directives().Directives;
      var acorn = require_acorn();
      var Pattern = require_pattern().Pattern;
      var TemplatablePattern = require_templatablepattern().TemplatablePattern;
      function in_array(what, arr) {
        return arr.indexOf(what) !== -1;
      }
      var TOKEN = {
        START_EXPR: "TK_START_EXPR",
        END_EXPR: "TK_END_EXPR",
        START_BLOCK: "TK_START_BLOCK",
        END_BLOCK: "TK_END_BLOCK",
        WORD: "TK_WORD",
        RESERVED: "TK_RESERVED",
        SEMICOLON: "TK_SEMICOLON",
        STRING: "TK_STRING",
        EQUALS: "TK_EQUALS",
        OPERATOR: "TK_OPERATOR",
        COMMA: "TK_COMMA",
        BLOCK_COMMENT: "TK_BLOCK_COMMENT",
        COMMENT: "TK_COMMENT",
        DOT: "TK_DOT",
        UNKNOWN: "TK_UNKNOWN",
        START: BASETOKEN.START,
        RAW: BASETOKEN.RAW,
        EOF: BASETOKEN.EOF
      };
      var directives_core = new Directives(/\/\*/, /\*\//);
      var number_pattern = /0[xX][0123456789abcdefABCDEF_]*n?|0[oO][01234567_]*n?|0[bB][01_]*n?|\d[\d_]*n|(?:\.\d[\d_]*|\d[\d_]*\.?[\d_]*)(?:[eE][+-]?[\d_]+)?/;
      var digit = /[0-9]/;
      var dot_pattern = /[^\d\.]/;
      var positionable_operators = ">>> === !== &&= ??= ||= << && >= ** != == <= >> || ?? |> < / - + > : & % ? ^ | *".split(" ");
      var punct = ">>>= ... >>= <<= === >>> !== **= &&= ??= ||= => ^= :: /= << <= == && -= >= >> != -- += ** || ?? ++ %= &= *= |= |> = ! ? > < : / ^ - + * & % ~ |";
      punct = punct.replace(/[-[\]{}()*+?.,\\^$|#]/g, "\\$&");
      punct = "\\?\\.(?!\\d) " + punct;
      punct = punct.replace(/ /g, "|");
      var punct_pattern = new RegExp(punct);
      var line_starters = "continue,try,throw,return,var,let,const,if,switch,case,default,for,while,break,function,import,export".split(",");
      var reserved_words = line_starters.concat(["do", "in", "of", "else", "get", "set", "new", "catch", "finally", "typeof", "yield", "async", "await", "from", "as", "class", "extends"]);
      var reserved_word_pattern = new RegExp("^(?:" + reserved_words.join("|") + ")$");
      var in_html_comment;
      var Tokenizer = function(input_string, options) {
        BaseTokenizer.call(this, input_string, options);
        this._patterns.whitespace = this._patterns.whitespace.matching(
          /\u00A0\u1680\u180e\u2000-\u200a\u202f\u205f\u3000\ufeff/.source,
          /\u2028\u2029/.source
        );
        var pattern_reader = new Pattern(this._input);
        var templatable = new TemplatablePattern(this._input).read_options(this._options);
        this.__patterns = {
          template: templatable,
          identifier: templatable.starting_with(acorn.identifier).matching(acorn.identifierMatch),
          number: pattern_reader.matching(number_pattern),
          punct: pattern_reader.matching(punct_pattern),
          // comment ends just before nearest linefeed or end of file
          comment: pattern_reader.starting_with(/\/\//).until(/[\n\r\u2028\u2029]/),
          //  /* ... */ comment ends with nearest */ or end of file
          block_comment: pattern_reader.starting_with(/\/\*/).until_after(/\*\//),
          html_comment_start: pattern_reader.matching(/<!--/),
          html_comment_end: pattern_reader.matching(/-->/),
          include: pattern_reader.starting_with(/#include/).until_after(acorn.lineBreak),
          shebang: pattern_reader.starting_with(/#!/).until_after(acorn.lineBreak),
          xml: pattern_reader.matching(/[\s\S]*?<(\/?)([-a-zA-Z:0-9_.]+|{[^}]+?}|!\[CDATA\[[^\]]*?\]\]|)(\s*{[^}]+?}|\s+[-a-zA-Z:0-9_.]+|\s+[-a-zA-Z:0-9_.]+\s*=\s*('[^']*'|"[^"]*"|{([^{}]|{[^}]+?})+?}))*\s*(\/?)\s*>/),
          single_quote: templatable.until(/['\\\n\r\u2028\u2029]/),
          double_quote: templatable.until(/["\\\n\r\u2028\u2029]/),
          template_text: templatable.until(/[`\\$]/),
          template_expression: templatable.until(/[`}\\]/)
        };
      };
      Tokenizer.prototype = new BaseTokenizer();
      Tokenizer.prototype._is_comment = function(current_token) {
        return current_token.type === TOKEN.COMMENT || current_token.type === TOKEN.BLOCK_COMMENT || current_token.type === TOKEN.UNKNOWN;
      };
      Tokenizer.prototype._is_opening = function(current_token) {
        return current_token.type === TOKEN.START_BLOCK || current_token.type === TOKEN.START_EXPR;
      };
      Tokenizer.prototype._is_closing = function(current_token, open_token) {
        return (current_token.type === TOKEN.END_BLOCK || current_token.type === TOKEN.END_EXPR) && (open_token && (current_token.text === "]" && open_token.text === "[" || current_token.text === ")" && open_token.text === "(" || current_token.text === "}" && open_token.text === "{"));
      };
      Tokenizer.prototype._reset = function() {
        in_html_comment = false;
      };
      Tokenizer.prototype._get_next_token = function(previous_token, open_token) {
        var token = null;
        this._readWhitespace();
        var c = this._input.peek();
        if (c === null) {
          return this._create_token(TOKEN.EOF, "");
        }
        token = token || this._read_non_javascript(c);
        token = token || this._read_string(c);
        token = token || this._read_pair(c, this._input.peek(1));
        token = token || this._read_word(previous_token);
        token = token || this._read_singles(c);
        token = token || this._read_comment(c);
        token = token || this._read_regexp(c, previous_token);
        token = token || this._read_xml(c, previous_token);
        token = token || this._read_punctuation();
        token = token || this._create_token(TOKEN.UNKNOWN, this._input.next());
        return token;
      };
      Tokenizer.prototype._read_word = function(previous_token) {
        var resulting_string;
        resulting_string = this.__patterns.identifier.read();
        if (resulting_string !== "") {
          resulting_string = resulting_string.replace(acorn.allLineBreaks, "\n");
          if (!(previous_token.type === TOKEN.DOT || previous_token.type === TOKEN.RESERVED && (previous_token.text === "set" || previous_token.text === "get")) && reserved_word_pattern.test(resulting_string)) {
            if ((resulting_string === "in" || resulting_string === "of") && (previous_token.type === TOKEN.WORD || previous_token.type === TOKEN.STRING)) {
              return this._create_token(TOKEN.OPERATOR, resulting_string);
            }
            return this._create_token(TOKEN.RESERVED, resulting_string);
          }
          return this._create_token(TOKEN.WORD, resulting_string);
        }
        resulting_string = this.__patterns.number.read();
        if (resulting_string !== "") {
          return this._create_token(TOKEN.WORD, resulting_string);
        }
      };
      Tokenizer.prototype._read_singles = function(c) {
        var token = null;
        if (c === "(" || c === "[") {
          token = this._create_token(TOKEN.START_EXPR, c);
        } else if (c === ")" || c === "]") {
          token = this._create_token(TOKEN.END_EXPR, c);
        } else if (c === "{") {
          token = this._create_token(TOKEN.START_BLOCK, c);
        } else if (c === "}") {
          token = this._create_token(TOKEN.END_BLOCK, c);
        } else if (c === ";") {
          token = this._create_token(TOKEN.SEMICOLON, c);
        } else if (c === "." && dot_pattern.test(this._input.peek(1))) {
          token = this._create_token(TOKEN.DOT, c);
        } else if (c === ",") {
          token = this._create_token(TOKEN.COMMA, c);
        }
        if (token) {
          this._input.next();
        }
        return token;
      };
      Tokenizer.prototype._read_pair = function(c, d) {
        var token = null;
        if (c === "#" && d === "{") {
          token = this._create_token(TOKEN.START_BLOCK, c + d);
        }
        if (token) {
          this._input.next();
          this._input.next();
        }
        return token;
      };
      Tokenizer.prototype._read_punctuation = function() {
        var resulting_string = this.__patterns.punct.read();
        if (resulting_string !== "") {
          if (resulting_string === "=") {
            return this._create_token(TOKEN.EQUALS, resulting_string);
          } else if (resulting_string === "?.") {
            return this._create_token(TOKEN.DOT, resulting_string);
          } else {
            return this._create_token(TOKEN.OPERATOR, resulting_string);
          }
        }
      };
      Tokenizer.prototype._read_non_javascript = function(c) {
        var resulting_string = "";
        if (c === "#") {
          if (this._is_first_token()) {
            resulting_string = this.__patterns.shebang.read();
            if (resulting_string) {
              return this._create_token(TOKEN.UNKNOWN, resulting_string.trim() + "\n");
            }
          }
          resulting_string = this.__patterns.include.read();
          if (resulting_string) {
            return this._create_token(TOKEN.UNKNOWN, resulting_string.trim() + "\n");
          }
          c = this._input.next();
          var sharp = "#";
          if (this._input.hasNext() && this._input.testChar(digit)) {
            do {
              c = this._input.next();
              sharp += c;
            } while (this._input.hasNext() && c !== "#" && c !== "=");
            if (c === "#") {
            } else if (this._input.peek() === "[" && this._input.peek(1) === "]") {
              sharp += "[]";
              this._input.next();
              this._input.next();
            } else if (this._input.peek() === "{" && this._input.peek(1) === "}") {
              sharp += "{}";
              this._input.next();
              this._input.next();
            }
            return this._create_token(TOKEN.WORD, sharp);
          }
          this._input.back();
        } else if (c === "<" && this._is_first_token()) {
          resulting_string = this.__patterns.html_comment_start.read();
          if (resulting_string) {
            while (this._input.hasNext() && !this._input.testChar(acorn.newline)) {
              resulting_string += this._input.next();
            }
            in_html_comment = true;
            return this._create_token(TOKEN.COMMENT, resulting_string);
          }
        } else if (in_html_comment && c === "-") {
          resulting_string = this.__patterns.html_comment_end.read();
          if (resulting_string) {
            in_html_comment = false;
            return this._create_token(TOKEN.COMMENT, resulting_string);
          }
        }
        return null;
      };
      Tokenizer.prototype._read_comment = function(c) {
        var token = null;
        if (c === "/") {
          var comment = "";
          if (this._input.peek(1) === "*") {
            comment = this.__patterns.block_comment.read();
            var directives = directives_core.get_directives(comment);
            if (directives && directives.ignore === "start") {
              comment += directives_core.readIgnored(this._input);
            }
            comment = comment.replace(acorn.allLineBreaks, "\n");
            token = this._create_token(TOKEN.BLOCK_COMMENT, comment);
            token.directives = directives;
          } else if (this._input.peek(1) === "/") {
            comment = this.__patterns.comment.read();
            token = this._create_token(TOKEN.COMMENT, comment);
          }
        }
        return token;
      };
      Tokenizer.prototype._read_string = function(c) {
        if (c === "`" || c === "'" || c === '"') {
          var resulting_string = this._input.next();
          this.has_char_escapes = false;
          if (c === "`") {
            resulting_string += this._read_string_recursive("`", true, "${");
          } else {
            resulting_string += this._read_string_recursive(c);
          }
          if (this.has_char_escapes && this._options.unescape_strings) {
            resulting_string = unescape_string(resulting_string);
          }
          if (this._input.peek() === c) {
            resulting_string += this._input.next();
          }
          resulting_string = resulting_string.replace(acorn.allLineBreaks, "\n");
          return this._create_token(TOKEN.STRING, resulting_string);
        }
        return null;
      };
      Tokenizer.prototype._allow_regexp_or_xml = function(previous_token) {
        return previous_token.type === TOKEN.RESERVED && in_array(previous_token.text, ["return", "case", "throw", "else", "do", "typeof", "yield"]) || previous_token.type === TOKEN.END_EXPR && previous_token.text === ")" && previous_token.opened.previous.type === TOKEN.RESERVED && in_array(previous_token.opened.previous.text, ["if", "while", "for"]) || in_array(previous_token.type, [
          TOKEN.COMMENT,
          TOKEN.START_EXPR,
          TOKEN.START_BLOCK,
          TOKEN.START,
          TOKEN.END_BLOCK,
          TOKEN.OPERATOR,
          TOKEN.EQUALS,
          TOKEN.EOF,
          TOKEN.SEMICOLON,
          TOKEN.COMMA
        ]);
      };
      Tokenizer.prototype._read_regexp = function(c, previous_token) {
        if (c === "/" && this._allow_regexp_or_xml(previous_token)) {
          var resulting_string = this._input.next();
          var esc = false;
          var in_char_class = false;
          while (this._input.hasNext() && ((esc || in_char_class || this._input.peek() !== c) && !this._input.testChar(acorn.newline))) {
            resulting_string += this._input.peek();
            if (!esc) {
              esc = this._input.peek() === "\\";
              if (this._input.peek() === "[") {
                in_char_class = true;
              } else if (this._input.peek() === "]") {
                in_char_class = false;
              }
            } else {
              esc = false;
            }
            this._input.next();
          }
          if (this._input.peek() === c) {
            resulting_string += this._input.next();
            resulting_string += this._input.read(acorn.identifier);
          }
          return this._create_token(TOKEN.STRING, resulting_string);
        }
        return null;
      };
      Tokenizer.prototype._read_xml = function(c, previous_token) {
        if (this._options.e4x && c === "<" && this._allow_regexp_or_xml(previous_token)) {
          var xmlStr = "";
          var match = this.__patterns.xml.read_match();
          if (match) {
            var rootTag = match[2].replace(/^{\s+/, "{").replace(/\s+}$/, "}");
            var isCurlyRoot = rootTag.indexOf("{") === 0;
            var depth = 0;
            while (match) {
              var isEndTag = !!match[1];
              var tagName = match[2];
              var isSingletonTag = !!match[match.length - 1] || tagName.slice(0, 8) === "![CDATA[";
              if (!isSingletonTag && (tagName === rootTag || isCurlyRoot && tagName.replace(/^{\s+/, "{").replace(/\s+}$/, "}"))) {
                if (isEndTag) {
                  --depth;
                } else {
                  ++depth;
                }
              }
              xmlStr += match[0];
              if (depth <= 0) {
                break;
              }
              match = this.__patterns.xml.read_match();
            }
            if (!match) {
              xmlStr += this._input.match(/[\s\S]*/g)[0];
            }
            xmlStr = xmlStr.replace(acorn.allLineBreaks, "\n");
            return this._create_token(TOKEN.STRING, xmlStr);
          }
        }
        return null;
      };
      function unescape_string(s) {
        var out = "", escaped = 0;
        var input_scan = new InputScanner(s);
        var matched = null;
        while (input_scan.hasNext()) {
          matched = input_scan.match(/([\s]|[^\\]|\\\\)+/g);
          if (matched) {
            out += matched[0];
          }
          if (input_scan.peek() === "\\") {
            input_scan.next();
            if (input_scan.peek() === "x") {
              matched = input_scan.match(/x([0-9A-Fa-f]{2})/g);
            } else if (input_scan.peek() === "u") {
              matched = input_scan.match(/u([0-9A-Fa-f]{4})/g);
              if (!matched) {
                matched = input_scan.match(/u\{([0-9A-Fa-f]+)\}/g);
              }
            } else {
              out += "\\";
              if (input_scan.hasNext()) {
                out += input_scan.next();
              }
              continue;
            }
            if (!matched) {
              return s;
            }
            escaped = parseInt(matched[1], 16);
            if (escaped > 126 && escaped <= 255 && matched[0].indexOf("x") === 0) {
              return s;
            } else if (escaped >= 0 && escaped < 32) {
              out += "\\" + matched[0];
            } else if (escaped > 1114111) {
              out += "\\" + matched[0];
            } else if (escaped === 34 || escaped === 39 || escaped === 92) {
              out += "\\" + String.fromCharCode(escaped);
            } else {
              out += String.fromCharCode(escaped);
            }
          }
        }
        return out;
      }
      Tokenizer.prototype._read_string_recursive = function(delimiter, allow_unescaped_newlines, start_sub) {
        var current_char;
        var pattern;
        if (delimiter === "'") {
          pattern = this.__patterns.single_quote;
        } else if (delimiter === '"') {
          pattern = this.__patterns.double_quote;
        } else if (delimiter === "`") {
          pattern = this.__patterns.template_text;
        } else if (delimiter === "}") {
          pattern = this.__patterns.template_expression;
        }
        var resulting_string = pattern.read();
        var next = "";
        while (this._input.hasNext()) {
          next = this._input.next();
          if (next === delimiter || !allow_unescaped_newlines && acorn.newline.test(next)) {
            this._input.back();
            break;
          } else if (next === "\\" && this._input.hasNext()) {
            current_char = this._input.peek();
            if (current_char === "x" || current_char === "u") {
              this.has_char_escapes = true;
            } else if (current_char === "\r" && this._input.peek(1) === "\n") {
              this._input.next();
            }
            next += this._input.next();
          } else if (start_sub) {
            if (start_sub === "${" && next === "$" && this._input.peek() === "{") {
              next += this._input.next();
            }
            if (start_sub === next) {
              if (delimiter === "`") {
                next += this._read_string_recursive("}", allow_unescaped_newlines, "`");
              } else {
                next += this._read_string_recursive("`", allow_unescaped_newlines, "${");
              }
              if (this._input.hasNext()) {
                next += this._input.next();
              }
            }
          }
          next += pattern.read();
          resulting_string += next;
        }
        return resulting_string;
      };
      module.exports.Tokenizer = Tokenizer;
      module.exports.TOKEN = TOKEN;
      module.exports.positionable_operators = positionable_operators.slice();
      module.exports.line_starters = line_starters.slice();
    }
  });

  // node_modules/js-beautify/js/src/javascript/beautifier.js
  var require_beautifier = __commonJS({
    "node_modules/js-beautify/js/src/javascript/beautifier.js"(exports, module) {
      "use strict";
      var Output = require_output().Output;
      var Token = require_token().Token;
      var acorn = require_acorn();
      var Options = require_options2().Options;
      var Tokenizer = require_tokenizer2().Tokenizer;
      var line_starters = require_tokenizer2().line_starters;
      var positionable_operators = require_tokenizer2().positionable_operators;
      var TOKEN = require_tokenizer2().TOKEN;
      function in_array(what, arr) {
        return arr.indexOf(what) !== -1;
      }
      function ltrim(s) {
        return s.replace(/^\s+/g, "");
      }
      function generateMapFromStrings(list) {
        var result = {};
        for (var x = 0; x < list.length; x++) {
          result[list[x].replace(/-/g, "_")] = list[x];
        }
        return result;
      }
      function reserved_word(token, word) {
        return token && token.type === TOKEN.RESERVED && token.text === word;
      }
      function reserved_array(token, words) {
        return token && token.type === TOKEN.RESERVED && in_array(token.text, words);
      }
      var special_words = ["case", "return", "do", "if", "throw", "else", "await", "break", "continue", "async"];
      var validPositionValues = ["before-newline", "after-newline", "preserve-newline"];
      var OPERATOR_POSITION = generateMapFromStrings(validPositionValues);
      var OPERATOR_POSITION_BEFORE_OR_PRESERVE = [OPERATOR_POSITION.before_newline, OPERATOR_POSITION.preserve_newline];
      var MODE = {
        BlockStatement: "BlockStatement",
        // 'BLOCK'
        Statement: "Statement",
        // 'STATEMENT'
        ObjectLiteral: "ObjectLiteral",
        // 'OBJECT',
        ArrayLiteral: "ArrayLiteral",
        //'[EXPRESSION]',
        ForInitializer: "ForInitializer",
        //'(FOR-EXPRESSION)',
        Conditional: "Conditional",
        //'(COND-EXPRESSION)',
        Expression: "Expression"
        //'(EXPRESSION)'
      };
      function remove_redundant_indentation(output, frame) {
        if (frame.multiline_frame || frame.mode === MODE.ForInitializer || frame.mode === MODE.Conditional) {
          return;
        }
        output.remove_indent(frame.start_line_index);
      }
      function split_linebreaks(s) {
        s = s.replace(acorn.allLineBreaks, "\n");
        var out = [], idx = s.indexOf("\n");
        while (idx !== -1) {
          out.push(s.substring(0, idx));
          s = s.substring(idx + 1);
          idx = s.indexOf("\n");
        }
        if (s.length) {
          out.push(s);
        }
        return out;
      }
      function is_array(mode) {
        return mode === MODE.ArrayLiteral;
      }
      function is_expression(mode) {
        return in_array(mode, [MODE.Expression, MODE.ForInitializer, MODE.Conditional]);
      }
      function all_lines_start_with(lines, c) {
        for (var i = 0; i < lines.length; i++) {
          var line = lines[i].trim();
          if (line.charAt(0) !== c) {
            return false;
          }
        }
        return true;
      }
      function each_line_matches_indent(lines, indent) {
        var i = 0, len = lines.length, line;
        for (; i < len; i++) {
          line = lines[i];
          if (line && line.indexOf(indent) !== 0) {
            return false;
          }
        }
        return true;
      }
      function Beautifier(source_text, options) {
        options = options || {};
        this._source_text = source_text || "";
        this._output = null;
        this._tokens = null;
        this._last_last_text = null;
        this._flags = null;
        this._previous_flags = null;
        this._flag_store = null;
        this._options = new Options(options);
      }
      Beautifier.prototype.create_flags = function(flags_base, mode) {
        var next_indent_level = 0;
        if (flags_base) {
          next_indent_level = flags_base.indentation_level;
          if (!this._output.just_added_newline() && flags_base.line_indent_level > next_indent_level) {
            next_indent_level = flags_base.line_indent_level;
          }
        }
        var next_flags = {
          mode,
          parent: flags_base,
          last_token: flags_base ? flags_base.last_token : new Token(TOKEN.START_BLOCK, ""),
          // last token text
          last_word: flags_base ? flags_base.last_word : "",
          // last TOKEN.WORD passed
          declaration_statement: false,
          declaration_assignment: false,
          multiline_frame: false,
          inline_frame: false,
          if_block: false,
          else_block: false,
          class_start_block: false,
          // class A { INSIDE HERE } or class B extends C { INSIDE HERE }
          do_block: false,
          do_while: false,
          import_block: false,
          in_case_statement: false,
          // switch(..){ INSIDE HERE }
          in_case: false,
          // we're on the exact line with "case 0:"
          case_body: false,
          // the indented case-action block
          case_block: false,
          // the indented case-action block is wrapped with {}
          indentation_level: next_indent_level,
          alignment: 0,
          line_indent_level: flags_base ? flags_base.line_indent_level : next_indent_level,
          start_line_index: this._output.get_line_number(),
          ternary_depth: 0
        };
        return next_flags;
      };
      Beautifier.prototype._reset = function(source_text) {
        var baseIndentString = source_text.match(/^[\t ]*/)[0];
        this._last_last_text = "";
        this._output = new Output(this._options, baseIndentString);
        this._output.raw = this._options.test_output_raw;
        this._flag_store = [];
        this.set_mode(MODE.BlockStatement);
        var tokenizer = new Tokenizer(source_text, this._options);
        this._tokens = tokenizer.tokenize();
        return source_text;
      };
      Beautifier.prototype.beautify = function() {
        if (this._options.disabled) {
          return this._source_text;
        }
        var sweet_code;
        var source_text = this._reset(this._source_text);
        var eol = this._options.eol;
        if (this._options.eol === "auto") {
          eol = "\n";
          if (source_text && acorn.lineBreak.test(source_text || "")) {
            eol = source_text.match(acorn.lineBreak)[0];
          }
        }
        var current_token = this._tokens.next();
        while (current_token) {
          this.handle_token(current_token);
          this._last_last_text = this._flags.last_token.text;
          this._flags.last_token = current_token;
          current_token = this._tokens.next();
        }
        sweet_code = this._output.get_code(eol);
        return sweet_code;
      };
      Beautifier.prototype.handle_token = function(current_token, preserve_statement_flags) {
        if (current_token.type === TOKEN.START_EXPR) {
          this.handle_start_expr(current_token);
        } else if (current_token.type === TOKEN.END_EXPR) {
          this.handle_end_expr(current_token);
        } else if (current_token.type === TOKEN.START_BLOCK) {
          this.handle_start_block(current_token);
        } else if (current_token.type === TOKEN.END_BLOCK) {
          this.handle_end_block(current_token);
        } else if (current_token.type === TOKEN.WORD) {
          this.handle_word(current_token);
        } else if (current_token.type === TOKEN.RESERVED) {
          this.handle_word(current_token);
        } else if (current_token.type === TOKEN.SEMICOLON) {
          this.handle_semicolon(current_token);
        } else if (current_token.type === TOKEN.STRING) {
          this.handle_string(current_token);
        } else if (current_token.type === TOKEN.EQUALS) {
          this.handle_equals(current_token);
        } else if (current_token.type === TOKEN.OPERATOR) {
          this.handle_operator(current_token);
        } else if (current_token.type === TOKEN.COMMA) {
          this.handle_comma(current_token);
        } else if (current_token.type === TOKEN.BLOCK_COMMENT) {
          this.handle_block_comment(current_token, preserve_statement_flags);
        } else if (current_token.type === TOKEN.COMMENT) {
          this.handle_comment(current_token, preserve_statement_flags);
        } else if (current_token.type === TOKEN.DOT) {
          this.handle_dot(current_token);
        } else if (current_token.type === TOKEN.EOF) {
          this.handle_eof(current_token);
        } else if (current_token.type === TOKEN.UNKNOWN) {
          this.handle_unknown(current_token, preserve_statement_flags);
        } else {
          this.handle_unknown(current_token, preserve_statement_flags);
        }
      };
      Beautifier.prototype.handle_whitespace_and_comments = function(current_token, preserve_statement_flags) {
        var newlines = current_token.newlines;
        var keep_whitespace = this._options.keep_array_indentation && is_array(this._flags.mode);
        if (current_token.comments_before) {
          var comment_token = current_token.comments_before.next();
          while (comment_token) {
            this.handle_whitespace_and_comments(comment_token, preserve_statement_flags);
            this.handle_token(comment_token, preserve_statement_flags);
            comment_token = current_token.comments_before.next();
          }
        }
        if (keep_whitespace) {
          for (var i = 0; i < newlines; i += 1) {
            this.print_newline(i > 0, preserve_statement_flags);
          }
        } else {
          if (this._options.max_preserve_newlines && newlines > this._options.max_preserve_newlines) {
            newlines = this._options.max_preserve_newlines;
          }
          if (this._options.preserve_newlines) {
            if (newlines > 1) {
              this.print_newline(false, preserve_statement_flags);
              for (var j = 1; j < newlines; j += 1) {
                this.print_newline(true, preserve_statement_flags);
              }
            }
          }
        }
      };
      var newline_restricted_tokens = ["async", "break", "continue", "return", "throw", "yield"];
      Beautifier.prototype.allow_wrap_or_preserved_newline = function(current_token, force_linewrap) {
        force_linewrap = force_linewrap === void 0 ? false : force_linewrap;
        if (this._output.just_added_newline()) {
          return;
        }
        var shouldPreserveOrForce = this._options.preserve_newlines && current_token.newlines || force_linewrap;
        var operatorLogicApplies = in_array(this._flags.last_token.text, positionable_operators) || in_array(current_token.text, positionable_operators);
        if (operatorLogicApplies) {
          var shouldPrintOperatorNewline = in_array(this._flags.last_token.text, positionable_operators) && in_array(this._options.operator_position, OPERATOR_POSITION_BEFORE_OR_PRESERVE) || in_array(current_token.text, positionable_operators);
          shouldPreserveOrForce = shouldPreserveOrForce && shouldPrintOperatorNewline;
        }
        if (shouldPreserveOrForce) {
          this.print_newline(false, true);
        } else if (this._options.wrap_line_length) {
          if (reserved_array(this._flags.last_token, newline_restricted_tokens)) {
            return;
          }
          this._output.set_wrap_point();
        }
      };
      Beautifier.prototype.print_newline = function(force_newline, preserve_statement_flags) {
        if (!preserve_statement_flags) {
          if (this._flags.last_token.text !== ";" && this._flags.last_token.text !== "," && this._flags.last_token.text !== "=" && (this._flags.last_token.type !== TOKEN.OPERATOR || this._flags.last_token.text === "--" || this._flags.last_token.text === "++")) {
            var next_token = this._tokens.peek();
            while (this._flags.mode === MODE.Statement && !(this._flags.if_block && reserved_word(next_token, "else")) && !this._flags.do_block) {
              this.restore_mode();
            }
          }
        }
        if (this._output.add_new_line(force_newline)) {
          this._flags.multiline_frame = true;
        }
      };
      Beautifier.prototype.print_token_line_indentation = function(current_token) {
        if (this._output.just_added_newline()) {
          if (this._options.keep_array_indentation && current_token.newlines && (current_token.text === "[" || is_array(this._flags.mode))) {
            this._output.current_line.set_indent(-1);
            this._output.current_line.push(current_token.whitespace_before);
            this._output.space_before_token = false;
          } else if (this._output.set_indent(this._flags.indentation_level, this._flags.alignment)) {
            this._flags.line_indent_level = this._flags.indentation_level;
          }
        }
      };
      Beautifier.prototype.print_token = function(current_token) {
        if (this._output.raw) {
          this._output.add_raw_token(current_token);
          return;
        }
        if (this._options.comma_first && current_token.previous && current_token.previous.type === TOKEN.COMMA && this._output.just_added_newline()) {
          if (this._output.previous_line.last() === ",") {
            var popped = this._output.previous_line.pop();
            if (this._output.previous_line.is_empty()) {
              this._output.previous_line.push(popped);
              this._output.trim(true);
              this._output.current_line.pop();
              this._output.trim();
            }
            this.print_token_line_indentation(current_token);
            this._output.add_token(",");
            this._output.space_before_token = true;
          }
        }
        this.print_token_line_indentation(current_token);
        this._output.non_breaking_space = true;
        this._output.add_token(current_token.text);
        if (this._output.previous_token_wrapped) {
          this._flags.multiline_frame = true;
        }
      };
      Beautifier.prototype.indent = function() {
        this._flags.indentation_level += 1;
        this._output.set_indent(this._flags.indentation_level, this._flags.alignment);
      };
      Beautifier.prototype.deindent = function() {
        if (this._flags.indentation_level > 0 && (!this._flags.parent || this._flags.indentation_level > this._flags.parent.indentation_level)) {
          this._flags.indentation_level -= 1;
          this._output.set_indent(this._flags.indentation_level, this._flags.alignment);
        }
      };
      Beautifier.prototype.set_mode = function(mode) {
        if (this._flags) {
          this._flag_store.push(this._flags);
          this._previous_flags = this._flags;
        } else {
          this._previous_flags = this.create_flags(null, mode);
        }
        this._flags = this.create_flags(this._previous_flags, mode);
        this._output.set_indent(this._flags.indentation_level, this._flags.alignment);
      };
      Beautifier.prototype.restore_mode = function() {
        if (this._flag_store.length > 0) {
          this._previous_flags = this._flags;
          this._flags = this._flag_store.pop();
          if (this._previous_flags.mode === MODE.Statement) {
            remove_redundant_indentation(this._output, this._previous_flags);
          }
          this._output.set_indent(this._flags.indentation_level, this._flags.alignment);
        }
      };
      Beautifier.prototype.start_of_object_property = function() {
        return this._flags.parent.mode === MODE.ObjectLiteral && this._flags.mode === MODE.Statement && (this._flags.last_token.text === ":" && this._flags.ternary_depth === 0 || reserved_array(this._flags.last_token, ["get", "set"]));
      };
      Beautifier.prototype.start_of_statement = function(current_token) {
        var start = false;
        start = start || reserved_array(this._flags.last_token, ["var", "let", "const"]) && current_token.type === TOKEN.WORD;
        start = start || reserved_word(this._flags.last_token, "do");
        start = start || !(this._flags.parent.mode === MODE.ObjectLiteral && this._flags.mode === MODE.Statement) && reserved_array(this._flags.last_token, newline_restricted_tokens) && !current_token.newlines;
        start = start || reserved_word(this._flags.last_token, "else") && !(reserved_word(current_token, "if") && !current_token.comments_before);
        start = start || this._flags.last_token.type === TOKEN.END_EXPR && (this._previous_flags.mode === MODE.ForInitializer || this._previous_flags.mode === MODE.Conditional);
        start = start || this._flags.last_token.type === TOKEN.WORD && this._flags.mode === MODE.BlockStatement && !this._flags.in_case && !(current_token.text === "--" || current_token.text === "++") && this._last_last_text !== "function" && current_token.type !== TOKEN.WORD && current_token.type !== TOKEN.RESERVED;
        start = start || this._flags.mode === MODE.ObjectLiteral && (this._flags.last_token.text === ":" && this._flags.ternary_depth === 0 || reserved_array(this._flags.last_token, ["get", "set"]));
        if (start) {
          this.set_mode(MODE.Statement);
          this.indent();
          this.handle_whitespace_and_comments(current_token, true);
          if (!this.start_of_object_property()) {
            this.allow_wrap_or_preserved_newline(
              current_token,
              reserved_array(current_token, ["do", "for", "if", "while"])
            );
          }
          return true;
        }
        return false;
      };
      Beautifier.prototype.handle_start_expr = function(current_token) {
        if (!this.start_of_statement(current_token)) {
          this.handle_whitespace_and_comments(current_token);
        }
        var next_mode = MODE.Expression;
        if (current_token.text === "[") {
          if (this._flags.last_token.type === TOKEN.WORD || this._flags.last_token.text === ")") {
            if (reserved_array(this._flags.last_token, line_starters)) {
              this._output.space_before_token = true;
            }
            this.print_token(current_token);
            this.set_mode(next_mode);
            this.indent();
            if (this._options.space_in_paren) {
              this._output.space_before_token = true;
            }
            return;
          }
          next_mode = MODE.ArrayLiteral;
          if (is_array(this._flags.mode)) {
            if (this._flags.last_token.text === "[" || this._flags.last_token.text === "," && (this._last_last_text === "]" || this._last_last_text === "}")) {
              if (!this._options.keep_array_indentation) {
                this.print_newline();
              }
            }
          }
          if (!in_array(this._flags.last_token.type, [TOKEN.START_EXPR, TOKEN.END_EXPR, TOKEN.WORD, TOKEN.OPERATOR, TOKEN.DOT])) {
            this._output.space_before_token = true;
          }
        } else {
          if (this._flags.last_token.type === TOKEN.RESERVED) {
            if (this._flags.last_token.text === "for") {
              this._output.space_before_token = this._options.space_before_conditional;
              next_mode = MODE.ForInitializer;
            } else if (in_array(this._flags.last_token.text, ["if", "while", "switch"])) {
              this._output.space_before_token = this._options.space_before_conditional;
              next_mode = MODE.Conditional;
            } else if (in_array(this._flags.last_word, ["await", "async"])) {
              this._output.space_before_token = true;
            } else if (this._flags.last_token.text === "import" && current_token.whitespace_before === "") {
              this._output.space_before_token = false;
            } else if (in_array(this._flags.last_token.text, line_starters) || this._flags.last_token.text === "catch") {
              this._output.space_before_token = true;
            }
          } else if (this._flags.last_token.type === TOKEN.EQUALS || this._flags.last_token.type === TOKEN.OPERATOR) {
            if (!this.start_of_object_property()) {
              this.allow_wrap_or_preserved_newline(current_token);
            }
          } else if (this._flags.last_token.type === TOKEN.WORD) {
            this._output.space_before_token = false;
            var peek_back_two = this._tokens.peek(-3);
            if (this._options.space_after_named_function && peek_back_two) {
              var peek_back_three = this._tokens.peek(-4);
              if (reserved_array(peek_back_two, ["async", "function"]) || peek_back_two.text === "*" && reserved_array(peek_back_three, ["async", "function"])) {
                this._output.space_before_token = true;
              } else if (this._flags.mode === MODE.ObjectLiteral) {
                if (peek_back_two.text === "{" || peek_back_two.text === "," || peek_back_two.text === "*" && (peek_back_three.text === "{" || peek_back_three.text === ",")) {
                  this._output.space_before_token = true;
                }
              } else if (this._flags.parent && this._flags.parent.class_start_block) {
                this._output.space_before_token = true;
              }
            }
          } else {
            this.allow_wrap_or_preserved_newline(current_token);
          }
          if (this._flags.last_token.type === TOKEN.RESERVED && (this._flags.last_word === "function" || this._flags.last_word === "typeof") || this._flags.last_token.text === "*" && (in_array(this._last_last_text, ["function", "yield"]) || this._flags.mode === MODE.ObjectLiteral && in_array(this._last_last_text, ["{", ","]))) {
            this._output.space_before_token = this._options.space_after_anon_function;
          }
        }
        if (this._flags.last_token.text === ";" || this._flags.last_token.type === TOKEN.START_BLOCK) {
          this.print_newline();
        } else if (this._flags.last_token.type === TOKEN.END_EXPR || this._flags.last_token.type === TOKEN.START_EXPR || this._flags.last_token.type === TOKEN.END_BLOCK || this._flags.last_token.text === "." || this._flags.last_token.type === TOKEN.COMMA) {
          this.allow_wrap_or_preserved_newline(current_token, current_token.newlines);
        }
        this.print_token(current_token);
        this.set_mode(next_mode);
        if (this._options.space_in_paren) {
          this._output.space_before_token = true;
        }
        this.indent();
      };
      Beautifier.prototype.handle_end_expr = function(current_token) {
        while (this._flags.mode === MODE.Statement) {
          this.restore_mode();
        }
        this.handle_whitespace_and_comments(current_token);
        if (this._flags.multiline_frame) {
          this.allow_wrap_or_preserved_newline(
            current_token,
            current_token.text === "]" && is_array(this._flags.mode) && !this._options.keep_array_indentation
          );
        }
        if (this._options.space_in_paren) {
          if (this._flags.last_token.type === TOKEN.START_EXPR && !this._options.space_in_empty_paren) {
            this._output.trim();
            this._output.space_before_token = false;
          } else {
            this._output.space_before_token = true;
          }
        }
        this.deindent();
        this.print_token(current_token);
        this.restore_mode();
        remove_redundant_indentation(this._output, this._previous_flags);
        if (this._flags.do_while && this._previous_flags.mode === MODE.Conditional) {
          this._previous_flags.mode = MODE.Expression;
          this._flags.do_block = false;
          this._flags.do_while = false;
        }
      };
      Beautifier.prototype.handle_start_block = function(current_token) {
        this.handle_whitespace_and_comments(current_token);
        var next_token = this._tokens.peek();
        var second_token = this._tokens.peek(1);
        if (this._flags.last_word === "switch" && this._flags.last_token.type === TOKEN.END_EXPR) {
          this.set_mode(MODE.BlockStatement);
          this._flags.in_case_statement = true;
        } else if (this._flags.case_body) {
          this.set_mode(MODE.BlockStatement);
        } else if (second_token && (in_array(second_token.text, [":", ","]) && in_array(next_token.type, [TOKEN.STRING, TOKEN.WORD, TOKEN.RESERVED]) || in_array(next_token.text, ["get", "set", "..."]) && in_array(second_token.type, [TOKEN.WORD, TOKEN.RESERVED]))) {
          if (in_array(this._last_last_text, ["class", "interface"]) && !in_array(second_token.text, [":", ","])) {
            this.set_mode(MODE.BlockStatement);
          } else {
            this.set_mode(MODE.ObjectLiteral);
          }
        } else if (this._flags.last_token.type === TOKEN.OPERATOR && this._flags.last_token.text === "=>") {
          this.set_mode(MODE.BlockStatement);
        } else if (in_array(this._flags.last_token.type, [TOKEN.EQUALS, TOKEN.START_EXPR, TOKEN.COMMA, TOKEN.OPERATOR]) || reserved_array(this._flags.last_token, ["return", "throw", "import", "default"])) {
          this.set_mode(MODE.ObjectLiteral);
        } else {
          this.set_mode(MODE.BlockStatement);
        }
        if (this._flags.last_token) {
          if (reserved_array(this._flags.last_token.previous, ["class", "extends"])) {
            this._flags.class_start_block = true;
          }
        }
        var empty_braces = !next_token.comments_before && next_token.text === "}";
        var empty_anonymous_function = empty_braces && this._flags.last_word === "function" && this._flags.last_token.type === TOKEN.END_EXPR;
        if (this._options.brace_preserve_inline) {
          var index = 0;
          var check_token = null;
          this._flags.inline_frame = true;
          do {
            index += 1;
            check_token = this._tokens.peek(index - 1);
            if (check_token.newlines) {
              this._flags.inline_frame = false;
              break;
            }
          } while (check_token.type !== TOKEN.EOF && !(check_token.type === TOKEN.END_BLOCK && check_token.opened === current_token));
        }
        if ((this._options.brace_style === "expand" || this._options.brace_style === "none" && current_token.newlines) && !this._flags.inline_frame) {
          if (this._flags.last_token.type !== TOKEN.OPERATOR && (empty_anonymous_function || this._flags.last_token.type === TOKEN.EQUALS || reserved_array(this._flags.last_token, special_words) && this._flags.last_token.text !== "else")) {
            this._output.space_before_token = true;
          } else {
            this.print_newline(false, true);
          }
        } else {
          if (is_array(this._previous_flags.mode) && (this._flags.last_token.type === TOKEN.START_EXPR || this._flags.last_token.type === TOKEN.COMMA)) {
            if (this._flags.last_token.type === TOKEN.COMMA || this._options.space_in_paren) {
              this._output.space_before_token = true;
            }
            if (this._flags.last_token.type === TOKEN.COMMA || this._flags.last_token.type === TOKEN.START_EXPR && this._flags.inline_frame) {
              this.allow_wrap_or_preserved_newline(current_token);
              this._previous_flags.multiline_frame = this._previous_flags.multiline_frame || this._flags.multiline_frame;
              this._flags.multiline_frame = false;
            }
          }
          if (this._flags.last_token.type !== TOKEN.OPERATOR && this._flags.last_token.type !== TOKEN.START_EXPR) {
            if (in_array(this._flags.last_token.type, [TOKEN.START_BLOCK, TOKEN.SEMICOLON]) && !this._flags.inline_frame) {
              this.print_newline();
            } else {
              this._output.space_before_token = true;
            }
          }
        }
        this.print_token(current_token);
        this.indent();
        if (!empty_braces && !(this._options.brace_preserve_inline && this._flags.inline_frame)) {
          this.print_newline();
        }
      };
      Beautifier.prototype.handle_end_block = function(current_token) {
        this.handle_whitespace_and_comments(current_token);
        while (this._flags.mode === MODE.Statement) {
          this.restore_mode();
        }
        var empty_braces = this._flags.last_token.type === TOKEN.START_BLOCK;
        if (this._flags.inline_frame && !empty_braces) {
          this._output.space_before_token = true;
        } else if (this._options.brace_style === "expand") {
          if (!empty_braces) {
            this.print_newline();
          }
        } else {
          if (!empty_braces) {
            if (is_array(this._flags.mode) && this._options.keep_array_indentation) {
              this._options.keep_array_indentation = false;
              this.print_newline();
              this._options.keep_array_indentation = true;
            } else {
              this.print_newline();
            }
          }
        }
        this.restore_mode();
        this.print_token(current_token);
      };
      Beautifier.prototype.handle_word = function(current_token) {
        if (current_token.type === TOKEN.RESERVED) {
          if (in_array(current_token.text, ["set", "get"]) && this._flags.mode !== MODE.ObjectLiteral) {
            current_token.type = TOKEN.WORD;
          } else if (current_token.text === "import" && in_array(this._tokens.peek().text, ["(", "."])) {
            current_token.type = TOKEN.WORD;
          } else if (in_array(current_token.text, ["as", "from"]) && !this._flags.import_block) {
            current_token.type = TOKEN.WORD;
          } else if (this._flags.mode === MODE.ObjectLiteral) {
            var next_token = this._tokens.peek();
            if (next_token.text === ":") {
              current_token.type = TOKEN.WORD;
            }
          }
        }
        if (this.start_of_statement(current_token)) {
          if (reserved_array(this._flags.last_token, ["var", "let", "const"]) && current_token.type === TOKEN.WORD) {
            this._flags.declaration_statement = true;
          }
        } else if (current_token.newlines && !is_expression(this._flags.mode) && (this._flags.last_token.type !== TOKEN.OPERATOR || (this._flags.last_token.text === "--" || this._flags.last_token.text === "++")) && this._flags.last_token.type !== TOKEN.EQUALS && (this._options.preserve_newlines || !reserved_array(this._flags.last_token, ["var", "let", "const", "set", "get"]))) {
          this.handle_whitespace_and_comments(current_token);
          this.print_newline();
        } else {
          this.handle_whitespace_and_comments(current_token);
        }
        if (this._flags.do_block && !this._flags.do_while) {
          if (reserved_word(current_token, "while")) {
            this._output.space_before_token = true;
            this.print_token(current_token);
            this._output.space_before_token = true;
            this._flags.do_while = true;
            return;
          } else {
            this.print_newline();
            this._flags.do_block = false;
          }
        }
        if (this._flags.if_block) {
          if (!this._flags.else_block && reserved_word(current_token, "else")) {
            this._flags.else_block = true;
          } else {
            while (this._flags.mode === MODE.Statement) {
              this.restore_mode();
            }
            this._flags.if_block = false;
            this._flags.else_block = false;
          }
        }
        if (this._flags.in_case_statement && reserved_array(current_token, ["case", "default"])) {
          this.print_newline();
          if (!this._flags.case_block && (this._flags.case_body || this._options.jslint_happy)) {
            this.deindent();
          }
          this._flags.case_body = false;
          this.print_token(current_token);
          this._flags.in_case = true;
          return;
        }
        if (this._flags.last_token.type === TOKEN.COMMA || this._flags.last_token.type === TOKEN.START_EXPR || this._flags.last_token.type === TOKEN.EQUALS || this._flags.last_token.type === TOKEN.OPERATOR) {
          if (!this.start_of_object_property() && !// start of object property is different for numeric values with +/- prefix operators
          (in_array(this._flags.last_token.text, ["+", "-"]) && this._last_last_text === ":" && this._flags.parent.mode === MODE.ObjectLiteral)) {
            this.allow_wrap_or_preserved_newline(current_token);
          }
        }
        if (reserved_word(current_token, "function")) {
          if (in_array(this._flags.last_token.text, ["}", ";"]) || this._output.just_added_newline() && !(in_array(this._flags.last_token.text, ["(", "[", "{", ":", "=", ","]) || this._flags.last_token.type === TOKEN.OPERATOR)) {
            if (!this._output.just_added_blankline() && !current_token.comments_before) {
              this.print_newline();
              this.print_newline(true);
            }
          }
          if (this._flags.last_token.type === TOKEN.RESERVED || this._flags.last_token.type === TOKEN.WORD) {
            if (reserved_array(this._flags.last_token, ["get", "set", "new", "export"]) || reserved_array(this._flags.last_token, newline_restricted_tokens)) {
              this._output.space_before_token = true;
            } else if (reserved_word(this._flags.last_token, "default") && this._last_last_text === "export") {
              this._output.space_before_token = true;
            } else if (this._flags.last_token.text === "declare") {
              this._output.space_before_token = true;
            } else {
              this.print_newline();
            }
          } else if (this._flags.last_token.type === TOKEN.OPERATOR || this._flags.last_token.text === "=") {
            this._output.space_before_token = true;
          } else if (!this._flags.multiline_frame && (is_expression(this._flags.mode) || is_array(this._flags.mode))) {
          } else {
            this.print_newline();
          }
          this.print_token(current_token);
          this._flags.last_word = current_token.text;
          return;
        }
        var prefix = "NONE";
        if (this._flags.last_token.type === TOKEN.END_BLOCK) {
          if (this._previous_flags.inline_frame) {
            prefix = "SPACE";
          } else if (!reserved_array(current_token, ["else", "catch", "finally", "from"])) {
            prefix = "NEWLINE";
          } else {
            if (this._options.brace_style === "expand" || this._options.brace_style === "end-expand" || this._options.brace_style === "none" && current_token.newlines) {
              prefix = "NEWLINE";
            } else {
              prefix = "SPACE";
              this._output.space_before_token = true;
            }
          }
        } else if (this._flags.last_token.type === TOKEN.SEMICOLON && this._flags.mode === MODE.BlockStatement) {
          prefix = "NEWLINE";
        } else if (this._flags.last_token.type === TOKEN.SEMICOLON && is_expression(this._flags.mode)) {
          prefix = "SPACE";
        } else if (this._flags.last_token.type === TOKEN.STRING) {
          prefix = "NEWLINE";
        } else if (this._flags.last_token.type === TOKEN.RESERVED || this._flags.last_token.type === TOKEN.WORD || this._flags.last_token.text === "*" && (in_array(this._last_last_text, ["function", "yield"]) || this._flags.mode === MODE.ObjectLiteral && in_array(this._last_last_text, ["{", ","]))) {
          prefix = "SPACE";
        } else if (this._flags.last_token.type === TOKEN.START_BLOCK) {
          if (this._flags.inline_frame) {
            prefix = "SPACE";
          } else {
            prefix = "NEWLINE";
          }
        } else if (this._flags.last_token.type === TOKEN.END_EXPR) {
          this._output.space_before_token = true;
          prefix = "NEWLINE";
        }
        if (reserved_array(current_token, line_starters) && this._flags.last_token.text !== ")") {
          if (this._flags.inline_frame || this._flags.last_token.text === "else" || this._flags.last_token.text === "export") {
            prefix = "SPACE";
          } else {
            prefix = "NEWLINE";
          }
        }
        if (reserved_array(current_token, ["else", "catch", "finally"])) {
          if ((!(this._flags.last_token.type === TOKEN.END_BLOCK && this._previous_flags.mode === MODE.BlockStatement) || this._options.brace_style === "expand" || this._options.brace_style === "end-expand" || this._options.brace_style === "none" && current_token.newlines) && !this._flags.inline_frame) {
            this.print_newline();
          } else {
            this._output.trim(true);
            var line = this._output.current_line;
            if (line.last() !== "}") {
              this.print_newline();
            }
            this._output.space_before_token = true;
          }
        } else if (prefix === "NEWLINE") {
          if (reserved_array(this._flags.last_token, special_words)) {
            this._output.space_before_token = true;
          } else if (this._flags.last_token.text === "declare" && reserved_array(current_token, ["var", "let", "const"])) {
            this._output.space_before_token = true;
          } else if (this._flags.last_token.type !== TOKEN.END_EXPR) {
            if ((this._flags.last_token.type !== TOKEN.START_EXPR || !reserved_array(current_token, ["var", "let", "const"])) && this._flags.last_token.text !== ":") {
              if (reserved_word(current_token, "if") && reserved_word(current_token.previous, "else")) {
                this._output.space_before_token = true;
              } else {
                this.print_newline();
              }
            }
          } else if (reserved_array(current_token, line_starters) && this._flags.last_token.text !== ")") {
            this.print_newline();
          }
        } else if (this._flags.multiline_frame && is_array(this._flags.mode) && this._flags.last_token.text === "," && this._last_last_text === "}") {
          this.print_newline();
        } else if (prefix === "SPACE") {
          this._output.space_before_token = true;
        }
        if (current_token.previous && (current_token.previous.type === TOKEN.WORD || current_token.previous.type === TOKEN.RESERVED)) {
          this._output.space_before_token = true;
        }
        this.print_token(current_token);
        this._flags.last_word = current_token.text;
        if (current_token.type === TOKEN.RESERVED) {
          if (current_token.text === "do") {
            this._flags.do_block = true;
          } else if (current_token.text === "if") {
            this._flags.if_block = true;
          } else if (current_token.text === "import") {
            this._flags.import_block = true;
          } else if (this._flags.import_block && reserved_word(current_token, "from")) {
            this._flags.import_block = false;
          }
        }
      };
      Beautifier.prototype.handle_semicolon = function(current_token) {
        if (this.start_of_statement(current_token)) {
          this._output.space_before_token = false;
        } else {
          this.handle_whitespace_and_comments(current_token);
        }
        var next_token = this._tokens.peek();
        while (this._flags.mode === MODE.Statement && !(this._flags.if_block && reserved_word(next_token, "else")) && !this._flags.do_block) {
          this.restore_mode();
        }
        if (this._flags.import_block) {
          this._flags.import_block = false;
        }
        this.print_token(current_token);
      };
      Beautifier.prototype.handle_string = function(current_token) {
        if (current_token.text.startsWith("`") && current_token.newlines === 0 && current_token.whitespace_before === "" && (current_token.previous.text === ")" || this._flags.last_token.type === TOKEN.WORD)) {
        } else if (this.start_of_statement(current_token)) {
          this._output.space_before_token = true;
        } else {
          this.handle_whitespace_and_comments(current_token);
          if (this._flags.last_token.type === TOKEN.RESERVED || this._flags.last_token.type === TOKEN.WORD || this._flags.inline_frame) {
            this._output.space_before_token = true;
          } else if (this._flags.last_token.type === TOKEN.COMMA || this._flags.last_token.type === TOKEN.START_EXPR || this._flags.last_token.type === TOKEN.EQUALS || this._flags.last_token.type === TOKEN.OPERATOR) {
            if (!this.start_of_object_property()) {
              this.allow_wrap_or_preserved_newline(current_token);
            }
          } else if (current_token.text.startsWith("`") && this._flags.last_token.type === TOKEN.END_EXPR && (current_token.previous.text === "]" || current_token.previous.text === ")") && current_token.newlines === 0) {
            this._output.space_before_token = true;
          } else {
            this.print_newline();
          }
        }
        this.print_token(current_token);
      };
      Beautifier.prototype.handle_equals = function(current_token) {
        if (this.start_of_statement(current_token)) {
        } else {
          this.handle_whitespace_and_comments(current_token);
        }
        if (this._flags.declaration_statement) {
          this._flags.declaration_assignment = true;
        }
        this._output.space_before_token = true;
        this.print_token(current_token);
        this._output.space_before_token = true;
      };
      Beautifier.prototype.handle_comma = function(current_token) {
        this.handle_whitespace_and_comments(current_token, true);
        this.print_token(current_token);
        this._output.space_before_token = true;
        if (this._flags.declaration_statement) {
          if (is_expression(this._flags.parent.mode)) {
            this._flags.declaration_assignment = false;
          }
          if (this._flags.declaration_assignment) {
            this._flags.declaration_assignment = false;
            this.print_newline(false, true);
          } else if (this._options.comma_first) {
            this.allow_wrap_or_preserved_newline(current_token);
          }
        } else if (this._flags.mode === MODE.ObjectLiteral || this._flags.mode === MODE.Statement && this._flags.parent.mode === MODE.ObjectLiteral) {
          if (this._flags.mode === MODE.Statement) {
            this.restore_mode();
          }
          if (!this._flags.inline_frame) {
            this.print_newline();
          }
        } else if (this._options.comma_first) {
          this.allow_wrap_or_preserved_newline(current_token);
        }
      };
      Beautifier.prototype.handle_operator = function(current_token) {
        var isGeneratorAsterisk = current_token.text === "*" && (reserved_array(this._flags.last_token, ["function", "yield"]) || in_array(this._flags.last_token.type, [TOKEN.START_BLOCK, TOKEN.COMMA, TOKEN.END_BLOCK, TOKEN.SEMICOLON]));
        var isUnary = in_array(current_token.text, ["-", "+"]) && (in_array(this._flags.last_token.type, [TOKEN.START_BLOCK, TOKEN.START_EXPR, TOKEN.EQUALS, TOKEN.OPERATOR]) || in_array(this._flags.last_token.text, line_starters) || this._flags.last_token.text === ",");
        if (this.start_of_statement(current_token)) {
        } else {
          var preserve_statement_flags = !isGeneratorAsterisk;
          this.handle_whitespace_and_comments(current_token, preserve_statement_flags);
        }
        if (current_token.text === "*" && this._flags.last_token.type === TOKEN.DOT) {
          this.print_token(current_token);
          return;
        }
        if (current_token.text === "::") {
          this.print_token(current_token);
          return;
        }
        if (in_array(current_token.text, ["-", "+"]) && this.start_of_object_property()) {
          this.print_token(current_token);
          return;
        }
        if (this._flags.last_token.type === TOKEN.OPERATOR && in_array(this._options.operator_position, OPERATOR_POSITION_BEFORE_OR_PRESERVE)) {
          this.allow_wrap_or_preserved_newline(current_token);
        }
        if (current_token.text === ":" && this._flags.in_case) {
          this.print_token(current_token);
          this._flags.in_case = false;
          this._flags.case_body = true;
          if (this._tokens.peek().type !== TOKEN.START_BLOCK) {
            this.indent();
            this.print_newline();
            this._flags.case_block = false;
          } else {
            this._flags.case_block = true;
            this._output.space_before_token = true;
          }
          return;
        }
        var space_before = true;
        var space_after = true;
        var in_ternary = false;
        if (current_token.text === ":") {
          if (this._flags.ternary_depth === 0) {
            space_before = false;
          } else {
            this._flags.ternary_depth -= 1;
            in_ternary = true;
          }
        } else if (current_token.text === "?") {
          this._flags.ternary_depth += 1;
        }
        if (!isUnary && !isGeneratorAsterisk && this._options.preserve_newlines && in_array(current_token.text, positionable_operators)) {
          var isColon = current_token.text === ":";
          var isTernaryColon = isColon && in_ternary;
          var isOtherColon = isColon && !in_ternary;
          switch (this._options.operator_position) {
            case OPERATOR_POSITION.before_newline:
              this._output.space_before_token = !isOtherColon;
              this.print_token(current_token);
              if (!isColon || isTernaryColon) {
                this.allow_wrap_or_preserved_newline(current_token);
              }
              this._output.space_before_token = true;
              return;
            case OPERATOR_POSITION.after_newline:
              this._output.space_before_token = true;
              if (!isColon || isTernaryColon) {
                if (this._tokens.peek().newlines) {
                  this.print_newline(false, true);
                } else {
                  this.allow_wrap_or_preserved_newline(current_token);
                }
              } else {
                this._output.space_before_token = false;
              }
              this.print_token(current_token);
              this._output.space_before_token = true;
              return;
            case OPERATOR_POSITION.preserve_newline:
              if (!isOtherColon) {
                this.allow_wrap_or_preserved_newline(current_token);
              }
              space_before = !(this._output.just_added_newline() || isOtherColon);
              this._output.space_before_token = space_before;
              this.print_token(current_token);
              this._output.space_before_token = true;
              return;
          }
        }
        if (isGeneratorAsterisk) {
          this.allow_wrap_or_preserved_newline(current_token);
          space_before = false;
          var next_token = this._tokens.peek();
          space_after = next_token && in_array(next_token.type, [TOKEN.WORD, TOKEN.RESERVED]);
        } else if (current_token.text === "...") {
          this.allow_wrap_or_preserved_newline(current_token);
          space_before = this._flags.last_token.type === TOKEN.START_BLOCK;
          space_after = false;
        } else if (in_array(current_token.text, ["--", "++", "!", "~"]) || isUnary) {
          if (this._flags.last_token.type === TOKEN.COMMA || this._flags.last_token.type === TOKEN.START_EXPR) {
            this.allow_wrap_or_preserved_newline(current_token);
          }
          space_before = false;
          space_after = false;
          if (current_token.newlines && (current_token.text === "--" || current_token.text === "++" || current_token.text === "~")) {
            var new_line_needed = reserved_array(this._flags.last_token, special_words) && current_token.newlines;
            if (new_line_needed && (this._previous_flags.if_block || this._previous_flags.else_block)) {
              this.restore_mode();
            }
            this.print_newline(new_line_needed, true);
          }
          if (this._flags.last_token.text === ";" && is_expression(this._flags.mode)) {
            space_before = true;
          }
          if (this._flags.last_token.type === TOKEN.RESERVED) {
            space_before = true;
          } else if (this._flags.last_token.type === TOKEN.END_EXPR) {
            space_before = !(this._flags.last_token.text === "]" && (current_token.text === "--" || current_token.text === "++"));
          } else if (this._flags.last_token.type === TOKEN.OPERATOR) {
            space_before = in_array(current_token.text, ["--", "-", "++", "+"]) && in_array(this._flags.last_token.text, ["--", "-", "++", "+"]);
            if (in_array(current_token.text, ["+", "-"]) && in_array(this._flags.last_token.text, ["--", "++"])) {
              space_after = true;
            }
          }
          if ((this._flags.mode === MODE.BlockStatement && !this._flags.inline_frame || this._flags.mode === MODE.Statement) && (this._flags.last_token.text === "{" || this._flags.last_token.text === ";")) {
            this.print_newline();
          }
        }
        this._output.space_before_token = this._output.space_before_token || space_before;
        this.print_token(current_token);
        this._output.space_before_token = space_after;
      };
      Beautifier.prototype.handle_block_comment = function(current_token, preserve_statement_flags) {
        if (this._output.raw) {
          this._output.add_raw_token(current_token);
          if (current_token.directives && current_token.directives.preserve === "end") {
            this._output.raw = this._options.test_output_raw;
          }
          return;
        }
        if (current_token.directives) {
          this.print_newline(false, preserve_statement_flags);
          this.print_token(current_token);
          if (current_token.directives.preserve === "start") {
            this._output.raw = true;
          }
          this.print_newline(false, true);
          return;
        }
        if (!acorn.newline.test(current_token.text) && !current_token.newlines) {
          this._output.space_before_token = true;
          this.print_token(current_token);
          this._output.space_before_token = true;
          return;
        } else {
          this.print_block_commment(current_token, preserve_statement_flags);
        }
      };
      Beautifier.prototype.print_block_commment = function(current_token, preserve_statement_flags) {
        var lines = split_linebreaks(current_token.text);
        var j;
        var javadoc = false;
        var starless = false;
        var lastIndent = current_token.whitespace_before;
        var lastIndentLength = lastIndent.length;
        this.print_newline(false, preserve_statement_flags);
        this.print_token_line_indentation(current_token);
        this._output.add_token(lines[0]);
        this.print_newline(false, preserve_statement_flags);
        if (lines.length > 1) {
          lines = lines.slice(1);
          javadoc = all_lines_start_with(lines, "*");
          starless = each_line_matches_indent(lines, lastIndent);
          if (javadoc) {
            this._flags.alignment = 1;
          }
          for (j = 0; j < lines.length; j++) {
            if (javadoc) {
              this.print_token_line_indentation(current_token);
              this._output.add_token(ltrim(lines[j]));
            } else if (starless && lines[j]) {
              this.print_token_line_indentation(current_token);
              this._output.add_token(lines[j].substring(lastIndentLength));
            } else {
              this._output.current_line.set_indent(-1);
              this._output.add_token(lines[j]);
            }
            this.print_newline(false, preserve_statement_flags);
          }
          this._flags.alignment = 0;
        }
      };
      Beautifier.prototype.handle_comment = function(current_token, preserve_statement_flags) {
        if (current_token.newlines) {
          this.print_newline(false, preserve_statement_flags);
        } else {
          this._output.trim(true);
        }
        this._output.space_before_token = true;
        this.print_token(current_token);
        this.print_newline(false, preserve_statement_flags);
      };
      Beautifier.prototype.handle_dot = function(current_token) {
        if (this.start_of_statement(current_token)) {
        } else {
          this.handle_whitespace_and_comments(current_token, true);
        }
        if (this._flags.last_token.text.match("^[0-9]+$")) {
          this._output.space_before_token = true;
        }
        if (reserved_array(this._flags.last_token, special_words)) {
          this._output.space_before_token = false;
        } else {
          this.allow_wrap_or_preserved_newline(
            current_token,
            this._flags.last_token.text === ")" && this._options.break_chained_methods
          );
        }
        if (this._options.unindent_chained_methods && this._output.just_added_newline()) {
          this.deindent();
        }
        this.print_token(current_token);
      };
      Beautifier.prototype.handle_unknown = function(current_token, preserve_statement_flags) {
        this.print_token(current_token);
        if (current_token.text[current_token.text.length - 1] === "\n") {
          this.print_newline(false, preserve_statement_flags);
        }
      };
      Beautifier.prototype.handle_eof = function(current_token) {
        while (this._flags.mode === MODE.Statement) {
          this.restore_mode();
        }
        this.handle_whitespace_and_comments(current_token);
      };
      module.exports.Beautifier = Beautifier;
    }
  });

  // node_modules/js-beautify/js/src/javascript/index.js
  var require_javascript = __commonJS({
    "node_modules/js-beautify/js/src/javascript/index.js"(exports, module) {
      "use strict";
      var Beautifier = require_beautifier().Beautifier;
      var Options = require_options2().Options;
      function js_beautify(js_source_text, options) {
        var beautifier = new Beautifier(js_source_text, options);
        return beautifier.beautify();
      }
      module.exports = js_beautify;
      module.exports.defaultOptions = function() {
        return new Options();
      };
    }
  });

  // node_modules/js-beautify/js/src/css/options.js
  var require_options3 = __commonJS({
    "node_modules/js-beautify/js/src/css/options.js"(exports, module) {
      "use strict";
      var BaseOptions = require_options().Options;
      function Options(options) {
        BaseOptions.call(this, options, "css");
        this.selector_separator_newline = this._get_boolean("selector_separator_newline", true);
        this.newline_between_rules = this._get_boolean("newline_between_rules", true);
        var space_around_selector_separator = this._get_boolean("space_around_selector_separator");
        this.space_around_combinator = this._get_boolean("space_around_combinator") || space_around_selector_separator;
        var brace_style_split = this._get_selection_list("brace_style", ["collapse", "expand", "end-expand", "none", "preserve-inline"]);
        this.brace_style = "collapse";
        for (var bs = 0; bs < brace_style_split.length; bs++) {
          if (brace_style_split[bs] !== "expand") {
            this.brace_style = "collapse";
          } else {
            this.brace_style = brace_style_split[bs];
          }
        }
      }
      Options.prototype = new BaseOptions();
      module.exports.Options = Options;
    }
  });

  // node_modules/js-beautify/js/src/css/beautifier.js
  var require_beautifier2 = __commonJS({
    "node_modules/js-beautify/js/src/css/beautifier.js"(exports, module) {
      "use strict";
      var Options = require_options3().Options;
      var Output = require_output().Output;
      var InputScanner = require_inputscanner().InputScanner;
      var Directives = require_directives().Directives;
      var directives_core = new Directives(/\/\*/, /\*\//);
      var lineBreak = /\r\n|[\r\n]/;
      var allLineBreaks = /\r\n|[\r\n]/g;
      var whitespaceChar = /\s/;
      var whitespacePattern = /(?:\s|\n)+/g;
      var block_comment_pattern = /\/\*(?:[\s\S]*?)((?:\*\/)|$)/g;
      var comment_pattern = /\/\/(?:[^\n\r\u2028\u2029]*)/g;
      function Beautifier(source_text, options) {
        this._source_text = source_text || "";
        this._options = new Options(options);
        this._ch = null;
        this._input = null;
        this.NESTED_AT_RULE = {
          "page": true,
          "font-face": true,
          "keyframes": true,
          // also in CONDITIONAL_GROUP_RULE below
          "media": true,
          "supports": true,
          "document": true
        };
        this.CONDITIONAL_GROUP_RULE = {
          "media": true,
          "supports": true,
          "document": true
        };
        this.NON_SEMICOLON_NEWLINE_PROPERTY = [
          "grid-template-areas",
          "grid-template"
        ];
      }
      Beautifier.prototype.eatString = function(endChars) {
        var result = "";
        this._ch = this._input.next();
        while (this._ch) {
          result += this._ch;
          if (this._ch === "\\") {
            result += this._input.next();
          } else if (endChars.indexOf(this._ch) !== -1 || this._ch === "\n") {
            break;
          }
          this._ch = this._input.next();
        }
        return result;
      };
      Beautifier.prototype.eatWhitespace = function(allowAtLeastOneNewLine) {
        var result = whitespaceChar.test(this._input.peek());
        var newline_count = 0;
        while (whitespaceChar.test(this._input.peek())) {
          this._ch = this._input.next();
          if (allowAtLeastOneNewLine && this._ch === "\n") {
            if (newline_count === 0 || newline_count < this._options.max_preserve_newlines) {
              newline_count++;
              this._output.add_new_line(true);
            }
          }
        }
        return result;
      };
      Beautifier.prototype.foundNestedPseudoClass = function() {
        var openParen = 0;
        var i = 1;
        var ch = this._input.peek(i);
        while (ch) {
          if (ch === "{") {
            return true;
          } else if (ch === "(") {
            openParen += 1;
          } else if (ch === ")") {
            if (openParen === 0) {
              return false;
            }
            openParen -= 1;
          } else if (ch === ";" || ch === "}") {
            return false;
          }
          i++;
          ch = this._input.peek(i);
        }
        return false;
      };
      Beautifier.prototype.print_string = function(output_string) {
        this._output.set_indent(this._indentLevel);
        this._output.non_breaking_space = true;
        this._output.add_token(output_string);
      };
      Beautifier.prototype.preserveSingleSpace = function(isAfterSpace) {
        if (isAfterSpace) {
          this._output.space_before_token = true;
        }
      };
      Beautifier.prototype.indent = function() {
        this._indentLevel++;
      };
      Beautifier.prototype.outdent = function() {
        if (this._indentLevel > 0) {
          this._indentLevel--;
        }
      };
      Beautifier.prototype.beautify = function() {
        if (this._options.disabled) {
          return this._source_text;
        }
        var source_text = this._source_text;
        var eol = this._options.eol;
        if (eol === "auto") {
          eol = "\n";
          if (source_text && lineBreak.test(source_text || "")) {
            eol = source_text.match(lineBreak)[0];
          }
        }
        source_text = source_text.replace(allLineBreaks, "\n");
        var baseIndentString = source_text.match(/^[\t ]*/)[0];
        this._output = new Output(this._options, baseIndentString);
        this._input = new InputScanner(source_text);
        this._indentLevel = 0;
        this._nestedLevel = 0;
        this._ch = null;
        var parenLevel = 0;
        var insideRule = false;
        var insidePropertyValue = false;
        var enteringConditionalGroup = false;
        var insideNonNestedAtRule = false;
        var insideScssMap = false;
        var topCharacter = this._ch;
        var insideNonSemiColonValues = false;
        var whitespace;
        var isAfterSpace;
        var previous_ch;
        while (true) {
          whitespace = this._input.read(whitespacePattern);
          isAfterSpace = whitespace !== "";
          previous_ch = topCharacter;
          this._ch = this._input.next();
          if (this._ch === "\\" && this._input.hasNext()) {
            this._ch += this._input.next();
          }
          topCharacter = this._ch;
          if (!this._ch) {
            break;
          } else if (this._ch === "/" && this._input.peek() === "*") {
            this._output.add_new_line();
            this._input.back();
            var comment = this._input.read(block_comment_pattern);
            var directives = directives_core.get_directives(comment);
            if (directives && directives.ignore === "start") {
              comment += directives_core.readIgnored(this._input);
            }
            this.print_string(comment);
            this.eatWhitespace(true);
            this._output.add_new_line();
          } else if (this._ch === "/" && this._input.peek() === "/") {
            this._output.space_before_token = true;
            this._input.back();
            this.print_string(this._input.read(comment_pattern));
            this.eatWhitespace(true);
          } else if (this._ch === "$") {
            this.preserveSingleSpace(isAfterSpace);
            this.print_string(this._ch);
            var variable = this._input.peekUntilAfter(/[: ,;{}()[\]\/='"]/g);
            if (variable.match(/[ :]$/)) {
              variable = this.eatString(": ").replace(/\s+$/, "");
              this.print_string(variable);
              this._output.space_before_token = true;
            }
            if (parenLevel === 0 && variable.indexOf(":") !== -1) {
              insidePropertyValue = true;
              this.indent();
            }
          } else if (this._ch === "@") {
            this.preserveSingleSpace(isAfterSpace);
            if (this._input.peek() === "{") {
              this.print_string(this._ch + this.eatString("}"));
            } else {
              this.print_string(this._ch);
              var variableOrRule = this._input.peekUntilAfter(/[: ,;{}()[\]\/='"]/g);
              if (variableOrRule.match(/[ :]$/)) {
                variableOrRule = this.eatString(": ").replace(/\s+$/, "");
                this.print_string(variableOrRule);
                this._output.space_before_token = true;
              }
              if (parenLevel === 0 && variableOrRule.indexOf(":") !== -1) {
                insidePropertyValue = true;
                this.indent();
              } else if (variableOrRule in this.NESTED_AT_RULE) {
                this._nestedLevel += 1;
                if (variableOrRule in this.CONDITIONAL_GROUP_RULE) {
                  enteringConditionalGroup = true;
                }
              } else if (parenLevel === 0 && !insidePropertyValue) {
                insideNonNestedAtRule = true;
              }
            }
          } else if (this._ch === "#" && this._input.peek() === "{") {
            this.preserveSingleSpace(isAfterSpace);
            this.print_string(this._ch + this.eatString("}"));
          } else if (this._ch === "{") {
            if (insidePropertyValue) {
              insidePropertyValue = false;
              this.outdent();
            }
            insideNonNestedAtRule = false;
            if (enteringConditionalGroup) {
              enteringConditionalGroup = false;
              insideRule = this._indentLevel >= this._nestedLevel;
            } else {
              insideRule = this._indentLevel >= this._nestedLevel - 1;
            }
            if (this._options.newline_between_rules && insideRule) {
              if (this._output.previous_line && this._output.previous_line.item(-1) !== "{") {
                this._output.ensure_empty_line_above("/", ",");
              }
            }
            this._output.space_before_token = true;
            if (this._options.brace_style === "expand") {
              this._output.add_new_line();
              this.print_string(this._ch);
              this.indent();
              this._output.set_indent(this._indentLevel);
            } else {
              if (previous_ch === "(") {
                this._output.space_before_token = false;
              } else if (previous_ch !== ",") {
                this.indent();
              }
              this.print_string(this._ch);
            }
            this.eatWhitespace(true);
            this._output.add_new_line();
          } else if (this._ch === "}") {
            this.outdent();
            this._output.add_new_line();
            if (previous_ch === "{") {
              this._output.trim(true);
            }
            if (insidePropertyValue) {
              this.outdent();
              insidePropertyValue = false;
            }
            this.print_string(this._ch);
            insideRule = false;
            if (this._nestedLevel) {
              this._nestedLevel--;
            }
            this.eatWhitespace(true);
            this._output.add_new_line();
            if (this._options.newline_between_rules && !this._output.just_added_blankline()) {
              if (this._input.peek() !== "}") {
                this._output.add_new_line(true);
              }
            }
            if (this._input.peek() === ")") {
              this._output.trim(true);
              if (this._options.brace_style === "expand") {
                this._output.add_new_line(true);
              }
            }
          } else if (this._ch === ":") {
            for (var i = 0; i < this.NON_SEMICOLON_NEWLINE_PROPERTY.length; i++) {
              if (this._input.lookBack(this.NON_SEMICOLON_NEWLINE_PROPERTY[i])) {
                insideNonSemiColonValues = true;
                break;
              }
            }
            if ((insideRule || enteringConditionalGroup) && !(this._input.lookBack("&") || this.foundNestedPseudoClass()) && !this._input.lookBack("(") && !insideNonNestedAtRule && parenLevel === 0) {
              this.print_string(":");
              if (!insidePropertyValue) {
                insidePropertyValue = true;
                this._output.space_before_token = true;
                this.eatWhitespace(true);
                this.indent();
              }
            } else {
              if (this._input.lookBack(" ")) {
                this._output.space_before_token = true;
              }
              if (this._input.peek() === ":") {
                this._ch = this._input.next();
                this.print_string("::");
              } else {
                this.print_string(":");
              }
            }
          } else if (this._ch === '"' || this._ch === "'") {
            var preserveQuoteSpace = previous_ch === '"' || previous_ch === "'";
            this.preserveSingleSpace(preserveQuoteSpace || isAfterSpace);
            this.print_string(this._ch + this.eatString(this._ch));
            this.eatWhitespace(true);
          } else if (this._ch === ";") {
            insideNonSemiColonValues = false;
            if (parenLevel === 0) {
              if (insidePropertyValue) {
                this.outdent();
                insidePropertyValue = false;
              }
              insideNonNestedAtRule = false;
              this.print_string(this._ch);
              this.eatWhitespace(true);
              if (this._input.peek() !== "/") {
                this._output.add_new_line();
              }
            } else {
              this.print_string(this._ch);
              this.eatWhitespace(true);
              this._output.space_before_token = true;
            }
          } else if (this._ch === "(") {
            if (this._input.lookBack("url")) {
              this.print_string(this._ch);
              this.eatWhitespace();
              parenLevel++;
              this.indent();
              this._ch = this._input.next();
              if (this._ch === ")" || this._ch === '"' || this._ch === "'") {
                this._input.back();
              } else if (this._ch) {
                this.print_string(this._ch + this.eatString(")"));
                if (parenLevel) {
                  parenLevel--;
                  this.outdent();
                }
              }
            } else {
              var space_needed = false;
              if (this._input.lookBack("with")) {
                space_needed = true;
              }
              this.preserveSingleSpace(isAfterSpace || space_needed);
              this.print_string(this._ch);
              if (insidePropertyValue && previous_ch === "$" && this._options.selector_separator_newline) {
                this._output.add_new_line();
                insideScssMap = true;
              } else {
                this.eatWhitespace();
                parenLevel++;
                this.indent();
              }
            }
          } else if (this._ch === ")") {
            if (parenLevel) {
              parenLevel--;
              this.outdent();
            }
            if (insideScssMap && this._input.peek() === ";" && this._options.selector_separator_newline) {
              insideScssMap = false;
              this.outdent();
              this._output.add_new_line();
            }
            this.print_string(this._ch);
          } else if (this._ch === ",") {
            this.print_string(this._ch);
            this.eatWhitespace(true);
            if (this._options.selector_separator_newline && (!insidePropertyValue || insideScssMap) && parenLevel === 0 && !insideNonNestedAtRule) {
              this._output.add_new_line();
            } else {
              this._output.space_before_token = true;
            }
          } else if ((this._ch === ">" || this._ch === "+" || this._ch === "~") && !insidePropertyValue && parenLevel === 0) {
            if (this._options.space_around_combinator) {
              this._output.space_before_token = true;
              this.print_string(this._ch);
              this._output.space_before_token = true;
            } else {
              this.print_string(this._ch);
              this.eatWhitespace();
              if (this._ch && whitespaceChar.test(this._ch)) {
                this._ch = "";
              }
            }
          } else if (this._ch === "]") {
            this.print_string(this._ch);
          } else if (this._ch === "[") {
            this.preserveSingleSpace(isAfterSpace);
            this.print_string(this._ch);
          } else if (this._ch === "=") {
            this.eatWhitespace();
            this.print_string("=");
            if (whitespaceChar.test(this._ch)) {
              this._ch = "";
            }
          } else if (this._ch === "!" && !this._input.lookBack("\\")) {
            this._output.space_before_token = true;
            this.print_string(this._ch);
          } else {
            var preserveAfterSpace = previous_ch === '"' || previous_ch === "'";
            this.preserveSingleSpace(preserveAfterSpace || isAfterSpace);
            this.print_string(this._ch);
            if (!this._output.just_added_newline() && this._input.peek() === "\n" && insideNonSemiColonValues) {
              this._output.add_new_line();
            }
          }
        }
        var sweetCode = this._output.get_code(eol);
        return sweetCode;
      };
      module.exports.Beautifier = Beautifier;
    }
  });

  // node_modules/js-beautify/js/src/css/index.js
  var require_css = __commonJS({
    "node_modules/js-beautify/js/src/css/index.js"(exports, module) {
      "use strict";
      var Beautifier = require_beautifier2().Beautifier;
      var Options = require_options3().Options;
      function css_beautify(source_text, options) {
        var beautifier = new Beautifier(source_text, options);
        return beautifier.beautify();
      }
      module.exports = css_beautify;
      module.exports.defaultOptions = function() {
        return new Options();
      };
    }
  });

  // node_modules/js-beautify/js/src/html/options.js
  var require_options4 = __commonJS({
    "node_modules/js-beautify/js/src/html/options.js"(exports, module) {
      "use strict";
      var BaseOptions = require_options().Options;
      function Options(options) {
        BaseOptions.call(this, options, "html");
        if (this.templating.length === 1 && this.templating[0] === "auto") {
          this.templating = ["django", "erb", "handlebars", "php"];
        }
        this.indent_inner_html = this._get_boolean("indent_inner_html");
        this.indent_body_inner_html = this._get_boolean("indent_body_inner_html", true);
        this.indent_head_inner_html = this._get_boolean("indent_head_inner_html", true);
        this.indent_handlebars = this._get_boolean("indent_handlebars", true);
        this.wrap_attributes = this._get_selection(
          "wrap_attributes",
          ["auto", "force", "force-aligned", "force-expand-multiline", "aligned-multiple", "preserve", "preserve-aligned"]
        );
        this.wrap_attributes_min_attrs = this._get_number("wrap_attributes_min_attrs", 2);
        this.wrap_attributes_indent_size = this._get_number("wrap_attributes_indent_size", this.indent_size);
        this.extra_liners = this._get_array("extra_liners", ["head", "body", "/html"]);
        this.inline = this._get_array("inline", [
          "a",
          "abbr",
          "area",
          "audio",
          "b",
          "bdi",
          "bdo",
          "br",
          "button",
          "canvas",
          "cite",
          "code",
          "data",
          "datalist",
          "del",
          "dfn",
          "em",
          "embed",
          "i",
          "iframe",
          "img",
          "input",
          "ins",
          "kbd",
          "keygen",
          "label",
          "map",
          "mark",
          "math",
          "meter",
          "noscript",
          "object",
          "output",
          "progress",
          "q",
          "ruby",
          "s",
          "samp",
          /* 'script', */
          "select",
          "small",
          "span",
          "strong",
          "sub",
          "sup",
          "svg",
          "template",
          "textarea",
          "time",
          "u",
          "var",
          "video",
          "wbr",
          "text",
          // obsolete inline tags
          "acronym",
          "big",
          "strike",
          "tt"
        ]);
        this.inline_custom_elements = this._get_boolean("inline_custom_elements", true);
        this.void_elements = this._get_array("void_elements", [
          // HTLM void elements - aka self-closing tags - aka singletons
          // https://www.w3.org/html/wg/drafts/html/master/syntax.html#void-elements
          "area",
          "base",
          "br",
          "col",
          "embed",
          "hr",
          "img",
          "input",
          "keygen",
          "link",
          "menuitem",
          "meta",
          "param",
          "source",
          "track",
          "wbr",
          // NOTE: Optional tags are too complex for a simple list
          // they are hard coded in _do_optional_end_element
          // Doctype and xml elements
          "!doctype",
          "?xml",
          // obsolete tags
          // basefont: https://www.computerhope.com/jargon/h/html-basefont-tag.htm
          // isndex: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/isindex
          "basefont",
          "isindex"
        ]);
        this.unformatted = this._get_array("unformatted", []);
        this.content_unformatted = this._get_array("content_unformatted", [
          "pre",
          "textarea"
        ]);
        this.unformatted_content_delimiter = this._get_characters("unformatted_content_delimiter");
        this.indent_scripts = this._get_selection("indent_scripts", ["normal", "keep", "separate"]);
      }
      Options.prototype = new BaseOptions();
      module.exports.Options = Options;
    }
  });

  // node_modules/js-beautify/js/src/html/tokenizer.js
  var require_tokenizer3 = __commonJS({
    "node_modules/js-beautify/js/src/html/tokenizer.js"(exports, module) {
      "use strict";
      var BaseTokenizer = require_tokenizer().Tokenizer;
      var BASETOKEN = require_tokenizer().TOKEN;
      var Directives = require_directives().Directives;
      var TemplatablePattern = require_templatablepattern().TemplatablePattern;
      var Pattern = require_pattern().Pattern;
      var TOKEN = {
        TAG_OPEN: "TK_TAG_OPEN",
        TAG_CLOSE: "TK_TAG_CLOSE",
        CONTROL_FLOW_OPEN: "TK_CONTROL_FLOW_OPEN",
        CONTROL_FLOW_CLOSE: "TK_CONTROL_FLOW_CLOSE",
        ATTRIBUTE: "TK_ATTRIBUTE",
        EQUALS: "TK_EQUALS",
        VALUE: "TK_VALUE",
        COMMENT: "TK_COMMENT",
        TEXT: "TK_TEXT",
        UNKNOWN: "TK_UNKNOWN",
        START: BASETOKEN.START,
        RAW: BASETOKEN.RAW,
        EOF: BASETOKEN.EOF
      };
      var directives_core = new Directives(/<\!--/, /-->/);
      var Tokenizer = function(input_string, options) {
        BaseTokenizer.call(this, input_string, options);
        this._current_tag_name = "";
        var templatable_reader = new TemplatablePattern(this._input).read_options(this._options);
        var pattern_reader = new Pattern(this._input);
        this.__patterns = {
          word: templatable_reader.until(/[\n\r\t <]/),
          word_control_flow_close_excluded: templatable_reader.until(/[\n\r\t <}]/),
          single_quote: templatable_reader.until_after(/'/),
          double_quote: templatable_reader.until_after(/"/),
          attribute: templatable_reader.until(/[\n\r\t =>]|\/>/),
          element_name: templatable_reader.until(/[\n\r\t >\/]/),
          angular_control_flow_start: pattern_reader.matching(/\@[a-zA-Z]+[^({]*[({]/),
          handlebars_comment: pattern_reader.starting_with(/{{!--/).until_after(/--}}/),
          handlebars: pattern_reader.starting_with(/{{/).until_after(/}}/),
          handlebars_open: pattern_reader.until(/[\n\r\t }]/),
          handlebars_raw_close: pattern_reader.until(/}}/),
          comment: pattern_reader.starting_with(/<!--/).until_after(/-->/),
          cdata: pattern_reader.starting_with(/<!\[CDATA\[/).until_after(/]]>/),
          // https://en.wikipedia.org/wiki/Conditional_comment
          conditional_comment: pattern_reader.starting_with(/<!\[/).until_after(/]>/),
          processing: pattern_reader.starting_with(/<\?/).until_after(/\?>/)
        };
        if (this._options.indent_handlebars) {
          this.__patterns.word = this.__patterns.word.exclude("handlebars");
          this.__patterns.word_control_flow_close_excluded = this.__patterns.word_control_flow_close_excluded.exclude("handlebars");
        }
        this._unformatted_content_delimiter = null;
        if (this._options.unformatted_content_delimiter) {
          var literal_regexp = this._input.get_literal_regexp(this._options.unformatted_content_delimiter);
          this.__patterns.unformatted_content_delimiter = pattern_reader.matching(literal_regexp).until_after(literal_regexp);
        }
      };
      Tokenizer.prototype = new BaseTokenizer();
      Tokenizer.prototype._is_comment = function(current_token) {
        return false;
      };
      Tokenizer.prototype._is_opening = function(current_token) {
        return current_token.type === TOKEN.TAG_OPEN || current_token.type === TOKEN.CONTROL_FLOW_OPEN;
      };
      Tokenizer.prototype._is_closing = function(current_token, open_token) {
        return current_token.type === TOKEN.TAG_CLOSE && (open_token && ((current_token.text === ">" || current_token.text === "/>") && open_token.text[0] === "<" || current_token.text === "}}" && open_token.text[0] === "{" && open_token.text[1] === "{")) || current_token.type === TOKEN.CONTROL_FLOW_CLOSE && (current_token.text === "}" && open_token.text.endsWith("{"));
      };
      Tokenizer.prototype._reset = function() {
        this._current_tag_name = "";
      };
      Tokenizer.prototype._get_next_token = function(previous_token, open_token) {
        var token = null;
        this._readWhitespace();
        var c = this._input.peek();
        if (c === null) {
          return this._create_token(TOKEN.EOF, "");
        }
        token = token || this._read_open_handlebars(c, open_token);
        token = token || this._read_attribute(c, previous_token, open_token);
        token = token || this._read_close(c, open_token);
        token = token || this._read_control_flows(c, open_token);
        token = token || this._read_raw_content(c, previous_token, open_token);
        token = token || this._read_content_word(c, open_token);
        token = token || this._read_comment_or_cdata(c);
        token = token || this._read_processing(c);
        token = token || this._read_open(c, open_token);
        token = token || this._create_token(TOKEN.UNKNOWN, this._input.next());
        return token;
      };
      Tokenizer.prototype._read_comment_or_cdata = function(c) {
        var token = null;
        var resulting_string = null;
        var directives = null;
        if (c === "<") {
          var peek1 = this._input.peek(1);
          if (peek1 === "!") {
            resulting_string = this.__patterns.comment.read();
            if (resulting_string) {
              directives = directives_core.get_directives(resulting_string);
              if (directives && directives.ignore === "start") {
                resulting_string += directives_core.readIgnored(this._input);
              }
            } else {
              resulting_string = this.__patterns.cdata.read();
            }
          }
          if (resulting_string) {
            token = this._create_token(TOKEN.COMMENT, resulting_string);
            token.directives = directives;
          }
        }
        return token;
      };
      Tokenizer.prototype._read_processing = function(c) {
        var token = null;
        var resulting_string = null;
        var directives = null;
        if (c === "<") {
          var peek1 = this._input.peek(1);
          if (peek1 === "!" || peek1 === "?") {
            resulting_string = this.__patterns.conditional_comment.read();
            resulting_string = resulting_string || this.__patterns.processing.read();
          }
          if (resulting_string) {
            token = this._create_token(TOKEN.COMMENT, resulting_string);
            token.directives = directives;
          }
        }
        return token;
      };
      Tokenizer.prototype._read_open = function(c, open_token) {
        var resulting_string = null;
        var token = null;
        if (!open_token || open_token.type === TOKEN.CONTROL_FLOW_OPEN) {
          if (c === "<") {
            resulting_string = this._input.next();
            if (this._input.peek() === "/") {
              resulting_string += this._input.next();
            }
            resulting_string += this.__patterns.element_name.read();
            token = this._create_token(TOKEN.TAG_OPEN, resulting_string);
          }
        }
        return token;
      };
      Tokenizer.prototype._read_open_handlebars = function(c, open_token) {
        var resulting_string = null;
        var token = null;
        if (!open_token || open_token.type === TOKEN.CONTROL_FLOW_OPEN) {
          if (this._options.indent_handlebars && c === "{" && this._input.peek(1) === "{") {
            if (this._input.peek(2) === "!") {
              resulting_string = this.__patterns.handlebars_comment.read();
              resulting_string = resulting_string || this.__patterns.handlebars.read();
              token = this._create_token(TOKEN.COMMENT, resulting_string);
            } else {
              resulting_string = this.__patterns.handlebars_open.read();
              token = this._create_token(TOKEN.TAG_OPEN, resulting_string);
            }
          }
        }
        return token;
      };
      Tokenizer.prototype._read_control_flows = function(c, open_token) {
        var resulting_string = "";
        var token = null;
        if (!this._options.templating.includes("angular") || !this._options.indent_handlebars) {
          return token;
        }
        if (c === "@") {
          resulting_string = this.__patterns.angular_control_flow_start.read();
          if (resulting_string === "") {
            return token;
          }
          var opening_parentheses_count = resulting_string.endsWith("(") ? 1 : 0;
          var closing_parentheses_count = 0;
          while (!(resulting_string.endsWith("{") && opening_parentheses_count === closing_parentheses_count)) {
            var next_char = this._input.next();
            if (next_char === null) {
              break;
            } else if (next_char === "(") {
              opening_parentheses_count++;
            } else if (next_char === ")") {
              closing_parentheses_count++;
            }
            resulting_string += next_char;
          }
          token = this._create_token(TOKEN.CONTROL_FLOW_OPEN, resulting_string);
        } else if (c === "}" && open_token && open_token.type === TOKEN.CONTROL_FLOW_OPEN) {
          resulting_string = this._input.next();
          token = this._create_token(TOKEN.CONTROL_FLOW_CLOSE, resulting_string);
        }
        return token;
      };
      Tokenizer.prototype._read_close = function(c, open_token) {
        var resulting_string = null;
        var token = null;
        if (open_token && open_token.type === TOKEN.TAG_OPEN) {
          if (open_token.text[0] === "<" && (c === ">" || c === "/" && this._input.peek(1) === ">")) {
            resulting_string = this._input.next();
            if (c === "/") {
              resulting_string += this._input.next();
            }
            token = this._create_token(TOKEN.TAG_CLOSE, resulting_string);
          } else if (open_token.text[0] === "{" && c === "}" && this._input.peek(1) === "}") {
            this._input.next();
            this._input.next();
            token = this._create_token(TOKEN.TAG_CLOSE, "}}");
          }
        }
        return token;
      };
      Tokenizer.prototype._read_attribute = function(c, previous_token, open_token) {
        var token = null;
        var resulting_string = "";
        if (open_token && open_token.text[0] === "<") {
          if (c === "=") {
            token = this._create_token(TOKEN.EQUALS, this._input.next());
          } else if (c === '"' || c === "'") {
            var content = this._input.next();
            if (c === '"') {
              content += this.__patterns.double_quote.read();
            } else {
              content += this.__patterns.single_quote.read();
            }
            token = this._create_token(TOKEN.VALUE, content);
          } else {
            resulting_string = this.__patterns.attribute.read();
            if (resulting_string) {
              if (previous_token.type === TOKEN.EQUALS) {
                token = this._create_token(TOKEN.VALUE, resulting_string);
              } else {
                token = this._create_token(TOKEN.ATTRIBUTE, resulting_string);
              }
            }
          }
        }
        return token;
      };
      Tokenizer.prototype._is_content_unformatted = function(tag_name) {
        return this._options.void_elements.indexOf(tag_name) === -1 && (this._options.content_unformatted.indexOf(tag_name) !== -1 || this._options.unformatted.indexOf(tag_name) !== -1);
      };
      Tokenizer.prototype._read_raw_content = function(c, previous_token, open_token) {
        var resulting_string = "";
        if (open_token && open_token.text[0] === "{") {
          resulting_string = this.__patterns.handlebars_raw_close.read();
        } else if (previous_token.type === TOKEN.TAG_CLOSE && previous_token.opened.text[0] === "<" && previous_token.text[0] !== "/") {
          var tag_name = previous_token.opened.text.substr(1).toLowerCase();
          if (tag_name === "script" || tag_name === "style") {
            var token = this._read_comment_or_cdata(c);
            if (token) {
              token.type = TOKEN.TEXT;
              return token;
            }
            resulting_string = this._input.readUntil(new RegExp("</" + tag_name + "[\\n\\r\\t ]*?>", "ig"));
          } else if (this._is_content_unformatted(tag_name)) {
            resulting_string = this._input.readUntil(new RegExp("</" + tag_name + "[\\n\\r\\t ]*?>", "ig"));
          }
        }
        if (resulting_string) {
          return this._create_token(TOKEN.TEXT, resulting_string);
        }
        return null;
      };
      Tokenizer.prototype._read_content_word = function(c, open_token) {
        var resulting_string = "";
        if (this._options.unformatted_content_delimiter) {
          if (c === this._options.unformatted_content_delimiter[0]) {
            resulting_string = this.__patterns.unformatted_content_delimiter.read();
          }
        }
        if (!resulting_string) {
          resulting_string = open_token && open_token.type === TOKEN.CONTROL_FLOW_OPEN ? this.__patterns.word_control_flow_close_excluded.read() : this.__patterns.word.read();
        }
        if (resulting_string) {
          return this._create_token(TOKEN.TEXT, resulting_string);
        }
      };
      module.exports.Tokenizer = Tokenizer;
      module.exports.TOKEN = TOKEN;
    }
  });

  // node_modules/js-beautify/js/src/html/beautifier.js
  var require_beautifier3 = __commonJS({
    "node_modules/js-beautify/js/src/html/beautifier.js"(exports, module) {
      "use strict";
      var Options = require_options4().Options;
      var Output = require_output().Output;
      var Tokenizer = require_tokenizer3().Tokenizer;
      var TOKEN = require_tokenizer3().TOKEN;
      var lineBreak = /\r\n|[\r\n]/;
      var allLineBreaks = /\r\n|[\r\n]/g;
      var Printer = function(options, base_indent_string) {
        this.indent_level = 0;
        this.alignment_size = 0;
        this.max_preserve_newlines = options.max_preserve_newlines;
        this.preserve_newlines = options.preserve_newlines;
        this._output = new Output(options, base_indent_string);
      };
      Printer.prototype.current_line_has_match = function(pattern) {
        return this._output.current_line.has_match(pattern);
      };
      Printer.prototype.set_space_before_token = function(value, non_breaking) {
        this._output.space_before_token = value;
        this._output.non_breaking_space = non_breaking;
      };
      Printer.prototype.set_wrap_point = function() {
        this._output.set_indent(this.indent_level, this.alignment_size);
        this._output.set_wrap_point();
      };
      Printer.prototype.add_raw_token = function(token) {
        this._output.add_raw_token(token);
      };
      Printer.prototype.print_preserved_newlines = function(raw_token) {
        var newlines = 0;
        if (raw_token.type !== TOKEN.TEXT && raw_token.previous.type !== TOKEN.TEXT) {
          newlines = raw_token.newlines ? 1 : 0;
        }
        if (this.preserve_newlines) {
          newlines = raw_token.newlines < this.max_preserve_newlines + 1 ? raw_token.newlines : this.max_preserve_newlines + 1;
        }
        for (var n = 0; n < newlines; n++) {
          this.print_newline(n > 0);
        }
        return newlines !== 0;
      };
      Printer.prototype.traverse_whitespace = function(raw_token) {
        if (raw_token.whitespace_before || raw_token.newlines) {
          if (!this.print_preserved_newlines(raw_token)) {
            this._output.space_before_token = true;
          }
          return true;
        }
        return false;
      };
      Printer.prototype.previous_token_wrapped = function() {
        return this._output.previous_token_wrapped;
      };
      Printer.prototype.print_newline = function(force) {
        this._output.add_new_line(force);
      };
      Printer.prototype.print_token = function(token) {
        if (token.text) {
          this._output.set_indent(this.indent_level, this.alignment_size);
          this._output.add_token(token.text);
        }
      };
      Printer.prototype.indent = function() {
        this.indent_level++;
      };
      Printer.prototype.deindent = function() {
        if (this.indent_level > 0) {
          this.indent_level--;
          this._output.set_indent(this.indent_level, this.alignment_size);
        }
      };
      Printer.prototype.get_full_indent = function(level) {
        level = this.indent_level + (level || 0);
        if (level < 1) {
          return "";
        }
        return this._output.get_indent_string(level);
      };
      var get_type_attribute = function(start_token) {
        var result = null;
        var raw_token = start_token.next;
        while (raw_token.type !== TOKEN.EOF && start_token.closed !== raw_token) {
          if (raw_token.type === TOKEN.ATTRIBUTE && raw_token.text === "type") {
            if (raw_token.next && raw_token.next.type === TOKEN.EQUALS && raw_token.next.next && raw_token.next.next.type === TOKEN.VALUE) {
              result = raw_token.next.next.text;
            }
            break;
          }
          raw_token = raw_token.next;
        }
        return result;
      };
      var get_custom_beautifier_name = function(tag_check, raw_token) {
        var typeAttribute = null;
        var result = null;
        if (!raw_token.closed) {
          return null;
        }
        if (tag_check === "script") {
          typeAttribute = "text/javascript";
        } else if (tag_check === "style") {
          typeAttribute = "text/css";
        }
        typeAttribute = get_type_attribute(raw_token) || typeAttribute;
        if (typeAttribute.search("text/css") > -1) {
          result = "css";
        } else if (typeAttribute.search(/module|((text|application|dojo)\/(x-)?(javascript|ecmascript|jscript|livescript|(ld\+)?json|method|aspect))/) > -1) {
          result = "javascript";
        } else if (typeAttribute.search(/(text|application|dojo)\/(x-)?(html)/) > -1) {
          result = "html";
        } else if (typeAttribute.search(/test\/null/) > -1) {
          result = "null";
        }
        return result;
      };
      function in_array(what, arr) {
        return arr.indexOf(what) !== -1;
      }
      function TagFrame(parent, parser_token, indent_level) {
        this.parent = parent || null;
        this.tag = parser_token ? parser_token.tag_name : "";
        this.indent_level = indent_level || 0;
        this.parser_token = parser_token || null;
      }
      function TagStack(printer) {
        this._printer = printer;
        this._current_frame = null;
      }
      TagStack.prototype.get_parser_token = function() {
        return this._current_frame ? this._current_frame.parser_token : null;
      };
      TagStack.prototype.record_tag = function(parser_token) {
        var new_frame = new TagFrame(this._current_frame, parser_token, this._printer.indent_level);
        this._current_frame = new_frame;
      };
      TagStack.prototype._try_pop_frame = function(frame) {
        var parser_token = null;
        if (frame) {
          parser_token = frame.parser_token;
          this._printer.indent_level = frame.indent_level;
          this._current_frame = frame.parent;
        }
        return parser_token;
      };
      TagStack.prototype._get_frame = function(tag_list, stop_list) {
        var frame = this._current_frame;
        while (frame) {
          if (tag_list.indexOf(frame.tag) !== -1) {
            break;
          } else if (stop_list && stop_list.indexOf(frame.tag) !== -1) {
            frame = null;
            break;
          }
          frame = frame.parent;
        }
        return frame;
      };
      TagStack.prototype.try_pop = function(tag, stop_list) {
        var frame = this._get_frame([tag], stop_list);
        return this._try_pop_frame(frame);
      };
      TagStack.prototype.indent_to_tag = function(tag_list) {
        var frame = this._get_frame(tag_list);
        if (frame) {
          this._printer.indent_level = frame.indent_level;
        }
      };
      function Beautifier(source_text, options, js_beautify, css_beautify) {
        this._source_text = source_text || "";
        options = options || {};
        this._js_beautify = js_beautify;
        this._css_beautify = css_beautify;
        this._tag_stack = null;
        var optionHtml = new Options(options, "html");
        this._options = optionHtml;
        this._is_wrap_attributes_force = this._options.wrap_attributes.substr(0, "force".length) === "force";
        this._is_wrap_attributes_force_expand_multiline = this._options.wrap_attributes === "force-expand-multiline";
        this._is_wrap_attributes_force_aligned = this._options.wrap_attributes === "force-aligned";
        this._is_wrap_attributes_aligned_multiple = this._options.wrap_attributes === "aligned-multiple";
        this._is_wrap_attributes_preserve = this._options.wrap_attributes.substr(0, "preserve".length) === "preserve";
        this._is_wrap_attributes_preserve_aligned = this._options.wrap_attributes === "preserve-aligned";
      }
      Beautifier.prototype.beautify = function() {
        if (this._options.disabled) {
          return this._source_text;
        }
        var source_text = this._source_text;
        var eol = this._options.eol;
        if (this._options.eol === "auto") {
          eol = "\n";
          if (source_text && lineBreak.test(source_text)) {
            eol = source_text.match(lineBreak)[0];
          }
        }
        source_text = source_text.replace(allLineBreaks, "\n");
        var baseIndentString = source_text.match(/^[\t ]*/)[0];
        var last_token = {
          text: "",
          type: ""
        };
        var last_tag_token = new TagOpenParserToken();
        var printer = new Printer(this._options, baseIndentString);
        var tokens = new Tokenizer(source_text, this._options).tokenize();
        this._tag_stack = new TagStack(printer);
        var parser_token = null;
        var raw_token = tokens.next();
        while (raw_token.type !== TOKEN.EOF) {
          if (raw_token.type === TOKEN.TAG_OPEN || raw_token.type === TOKEN.COMMENT) {
            parser_token = this._handle_tag_open(printer, raw_token, last_tag_token, last_token, tokens);
            last_tag_token = parser_token;
          } else if (raw_token.type === TOKEN.ATTRIBUTE || raw_token.type === TOKEN.EQUALS || raw_token.type === TOKEN.VALUE || raw_token.type === TOKEN.TEXT && !last_tag_token.tag_complete) {
            parser_token = this._handle_inside_tag(printer, raw_token, last_tag_token, last_token);
          } else if (raw_token.type === TOKEN.TAG_CLOSE) {
            parser_token = this._handle_tag_close(printer, raw_token, last_tag_token);
          } else if (raw_token.type === TOKEN.TEXT) {
            parser_token = this._handle_text(printer, raw_token, last_tag_token);
          } else if (raw_token.type === TOKEN.CONTROL_FLOW_OPEN) {
            parser_token = this._handle_control_flow_open(printer, raw_token);
          } else if (raw_token.type === TOKEN.CONTROL_FLOW_CLOSE) {
            parser_token = this._handle_control_flow_close(printer, raw_token);
          } else {
            printer.add_raw_token(raw_token);
          }
          last_token = parser_token;
          raw_token = tokens.next();
        }
        var sweet_code = printer._output.get_code(eol);
        return sweet_code;
      };
      Beautifier.prototype._handle_control_flow_open = function(printer, raw_token) {
        var parser_token = {
          text: raw_token.text,
          type: raw_token.type
        };
        printer.set_space_before_token(raw_token.newlines || raw_token.whitespace_before !== "", true);
        if (raw_token.newlines) {
          printer.print_preserved_newlines(raw_token);
        } else {
          printer.set_space_before_token(raw_token.newlines || raw_token.whitespace_before !== "", true);
        }
        printer.print_token(raw_token);
        printer.indent();
        return parser_token;
      };
      Beautifier.prototype._handle_control_flow_close = function(printer, raw_token) {
        var parser_token = {
          text: raw_token.text,
          type: raw_token.type
        };
        printer.deindent();
        if (raw_token.newlines) {
          printer.print_preserved_newlines(raw_token);
        } else {
          printer.set_space_before_token(raw_token.newlines || raw_token.whitespace_before !== "", true);
        }
        printer.print_token(raw_token);
        return parser_token;
      };
      Beautifier.prototype._handle_tag_close = function(printer, raw_token, last_tag_token) {
        var parser_token = {
          text: raw_token.text,
          type: raw_token.type
        };
        printer.alignment_size = 0;
        last_tag_token.tag_complete = true;
        printer.set_space_before_token(raw_token.newlines || raw_token.whitespace_before !== "", true);
        if (last_tag_token.is_unformatted) {
          printer.add_raw_token(raw_token);
        } else {
          if (last_tag_token.tag_start_char === "<") {
            printer.set_space_before_token(raw_token.text[0] === "/", true);
            if (this._is_wrap_attributes_force_expand_multiline && last_tag_token.has_wrapped_attrs) {
              printer.print_newline(false);
            }
          }
          printer.print_token(raw_token);
        }
        if (last_tag_token.indent_content && !(last_tag_token.is_unformatted || last_tag_token.is_content_unformatted)) {
          printer.indent();
          last_tag_token.indent_content = false;
        }
        if (!last_tag_token.is_inline_element && !(last_tag_token.is_unformatted || last_tag_token.is_content_unformatted)) {
          printer.set_wrap_point();
        }
        return parser_token;
      };
      Beautifier.prototype._handle_inside_tag = function(printer, raw_token, last_tag_token, last_token) {
        var wrapped = last_tag_token.has_wrapped_attrs;
        var parser_token = {
          text: raw_token.text,
          type: raw_token.type
        };
        printer.set_space_before_token(raw_token.newlines || raw_token.whitespace_before !== "", true);
        if (last_tag_token.is_unformatted) {
          printer.add_raw_token(raw_token);
        } else if (last_tag_token.tag_start_char === "{" && raw_token.type === TOKEN.TEXT) {
          if (printer.print_preserved_newlines(raw_token)) {
            raw_token.newlines = 0;
            printer.add_raw_token(raw_token);
          } else {
            printer.print_token(raw_token);
          }
        } else {
          if (raw_token.type === TOKEN.ATTRIBUTE) {
            printer.set_space_before_token(true);
          } else if (raw_token.type === TOKEN.EQUALS) {
            printer.set_space_before_token(false);
          } else if (raw_token.type === TOKEN.VALUE && raw_token.previous.type === TOKEN.EQUALS) {
            printer.set_space_before_token(false);
          }
          if (raw_token.type === TOKEN.ATTRIBUTE && last_tag_token.tag_start_char === "<") {
            if (this._is_wrap_attributes_preserve || this._is_wrap_attributes_preserve_aligned) {
              printer.traverse_whitespace(raw_token);
              wrapped = wrapped || raw_token.newlines !== 0;
            }
            if (this._is_wrap_attributes_force && last_tag_token.attr_count >= this._options.wrap_attributes_min_attrs && (last_token.type !== TOKEN.TAG_OPEN || // ie. second attribute and beyond
            this._is_wrap_attributes_force_expand_multiline)) {
              printer.print_newline(false);
              wrapped = true;
            }
          }
          printer.print_token(raw_token);
          wrapped = wrapped || printer.previous_token_wrapped();
          last_tag_token.has_wrapped_attrs = wrapped;
        }
        return parser_token;
      };
      Beautifier.prototype._handle_text = function(printer, raw_token, last_tag_token) {
        var parser_token = {
          text: raw_token.text,
          type: "TK_CONTENT"
        };
        if (last_tag_token.custom_beautifier_name) {
          this._print_custom_beatifier_text(printer, raw_token, last_tag_token);
        } else if (last_tag_token.is_unformatted || last_tag_token.is_content_unformatted) {
          printer.add_raw_token(raw_token);
        } else {
          printer.traverse_whitespace(raw_token);
          printer.print_token(raw_token);
        }
        return parser_token;
      };
      Beautifier.prototype._print_custom_beatifier_text = function(printer, raw_token, last_tag_token) {
        var local = this;
        if (raw_token.text !== "") {
          var text = raw_token.text, _beautifier, script_indent_level = 1, pre = "", post = "";
          if (last_tag_token.custom_beautifier_name === "javascript" && typeof this._js_beautify === "function") {
            _beautifier = this._js_beautify;
          } else if (last_tag_token.custom_beautifier_name === "css" && typeof this._css_beautify === "function") {
            _beautifier = this._css_beautify;
          } else if (last_tag_token.custom_beautifier_name === "html") {
            _beautifier = function(html_source, options) {
              var beautifier = new Beautifier(html_source, options, local._js_beautify, local._css_beautify);
              return beautifier.beautify();
            };
          }
          if (this._options.indent_scripts === "keep") {
            script_indent_level = 0;
          } else if (this._options.indent_scripts === "separate") {
            script_indent_level = -printer.indent_level;
          }
          var indentation = printer.get_full_indent(script_indent_level);
          text = text.replace(/\n[ \t]*$/, "");
          if (last_tag_token.custom_beautifier_name !== "html" && text[0] === "<" && text.match(/^(<!--|<!\[CDATA\[)/)) {
            var matched = /^(<!--[^\n]*|<!\[CDATA\[)(\n?)([ \t\n]*)([\s\S]*)(-->|]]>)$/.exec(text);
            if (!matched) {
              printer.add_raw_token(raw_token);
              return;
            }
            pre = indentation + matched[1] + "\n";
            text = matched[4];
            if (matched[5]) {
              post = indentation + matched[5];
            }
            text = text.replace(/\n[ \t]*$/, "");
            if (matched[2] || matched[3].indexOf("\n") !== -1) {
              matched = matched[3].match(/[ \t]+$/);
              if (matched) {
                raw_token.whitespace_before = matched[0];
              }
            }
          }
          if (text) {
            if (_beautifier) {
              var Child_options = function() {
                this.eol = "\n";
              };
              Child_options.prototype = this._options.raw_options;
              var child_options = new Child_options();
              text = _beautifier(indentation + text, child_options);
            } else {
              var white = raw_token.whitespace_before;
              if (white) {
                text = text.replace(new RegExp("\n(" + white + ")?", "g"), "\n");
              }
              text = indentation + text.replace(/\n/g, "\n" + indentation);
            }
          }
          if (pre) {
            if (!text) {
              text = pre + post;
            } else {
              text = pre + text + "\n" + post;
            }
          }
          printer.print_newline(false);
          if (text) {
            raw_token.text = text;
            raw_token.whitespace_before = "";
            raw_token.newlines = 0;
            printer.add_raw_token(raw_token);
            printer.print_newline(true);
          }
        }
      };
      Beautifier.prototype._handle_tag_open = function(printer, raw_token, last_tag_token, last_token, tokens) {
        var parser_token = this._get_tag_open_token(raw_token);
        if ((last_tag_token.is_unformatted || last_tag_token.is_content_unformatted) && !last_tag_token.is_empty_element && raw_token.type === TOKEN.TAG_OPEN && !parser_token.is_start_tag) {
          printer.add_raw_token(raw_token);
          parser_token.start_tag_token = this._tag_stack.try_pop(parser_token.tag_name);
        } else {
          printer.traverse_whitespace(raw_token);
          this._set_tag_position(printer, raw_token, parser_token, last_tag_token, last_token);
          if (!parser_token.is_inline_element) {
            printer.set_wrap_point();
          }
          printer.print_token(raw_token);
        }
        if (parser_token.is_start_tag && this._is_wrap_attributes_force) {
          var peek_index = 0;
          var peek_token;
          do {
            peek_token = tokens.peek(peek_index);
            if (peek_token.type === TOKEN.ATTRIBUTE) {
              parser_token.attr_count += 1;
            }
            peek_index += 1;
          } while (peek_token.type !== TOKEN.EOF && peek_token.type !== TOKEN.TAG_CLOSE);
        }
        if (this._is_wrap_attributes_force_aligned || this._is_wrap_attributes_aligned_multiple || this._is_wrap_attributes_preserve_aligned) {
          parser_token.alignment_size = raw_token.text.length + 1;
        }
        if (!parser_token.tag_complete && !parser_token.is_unformatted) {
          printer.alignment_size = parser_token.alignment_size;
        }
        return parser_token;
      };
      var TagOpenParserToken = function(parent, raw_token) {
        this.parent = parent || null;
        this.text = "";
        this.type = "TK_TAG_OPEN";
        this.tag_name = "";
        this.is_inline_element = false;
        this.is_unformatted = false;
        this.is_content_unformatted = false;
        this.is_empty_element = false;
        this.is_start_tag = false;
        this.is_end_tag = false;
        this.indent_content = false;
        this.multiline_content = false;
        this.custom_beautifier_name = null;
        this.start_tag_token = null;
        this.attr_count = 0;
        this.has_wrapped_attrs = false;
        this.alignment_size = 0;
        this.tag_complete = false;
        this.tag_start_char = "";
        this.tag_check = "";
        if (!raw_token) {
          this.tag_complete = true;
        } else {
          var tag_check_match;
          this.tag_start_char = raw_token.text[0];
          this.text = raw_token.text;
          if (this.tag_start_char === "<") {
            tag_check_match = raw_token.text.match(/^<([^\s>]*)/);
            this.tag_check = tag_check_match ? tag_check_match[1] : "";
          } else {
            tag_check_match = raw_token.text.match(/^{{~?(?:[\^]|#\*?)?([^\s}]+)/);
            this.tag_check = tag_check_match ? tag_check_match[1] : "";
            if ((raw_token.text.startsWith("{{#>") || raw_token.text.startsWith("{{~#>")) && this.tag_check[0] === ">") {
              if (this.tag_check === ">" && raw_token.next !== null) {
                this.tag_check = raw_token.next.text.split(" ")[0];
              } else {
                this.tag_check = raw_token.text.split(">")[1];
              }
            }
          }
          this.tag_check = this.tag_check.toLowerCase();
          if (raw_token.type === TOKEN.COMMENT) {
            this.tag_complete = true;
          }
          this.is_start_tag = this.tag_check.charAt(0) !== "/";
          this.tag_name = !this.is_start_tag ? this.tag_check.substr(1) : this.tag_check;
          this.is_end_tag = !this.is_start_tag || raw_token.closed && raw_token.closed.text === "/>";
          var handlebar_starts = 2;
          if (this.tag_start_char === "{" && this.text.length >= 3) {
            if (this.text.charAt(2) === "~") {
              handlebar_starts = 3;
            }
          }
          this.is_end_tag = this.is_end_tag || this.tag_start_char === "{" && (this.text.length < 3 || /[^#\^]/.test(this.text.charAt(handlebar_starts)));
        }
      };
      Beautifier.prototype._get_tag_open_token = function(raw_token) {
        var parser_token = new TagOpenParserToken(this._tag_stack.get_parser_token(), raw_token);
        parser_token.alignment_size = this._options.wrap_attributes_indent_size;
        parser_token.is_end_tag = parser_token.is_end_tag || in_array(parser_token.tag_check, this._options.void_elements);
        parser_token.is_empty_element = parser_token.tag_complete || parser_token.is_start_tag && parser_token.is_end_tag;
        parser_token.is_unformatted = !parser_token.tag_complete && in_array(parser_token.tag_check, this._options.unformatted);
        parser_token.is_content_unformatted = !parser_token.is_empty_element && in_array(parser_token.tag_check, this._options.content_unformatted);
        parser_token.is_inline_element = in_array(parser_token.tag_name, this._options.inline) || this._options.inline_custom_elements && parser_token.tag_name.includes("-") || parser_token.tag_start_char === "{";
        return parser_token;
      };
      Beautifier.prototype._set_tag_position = function(printer, raw_token, parser_token, last_tag_token, last_token) {
        if (!parser_token.is_empty_element) {
          if (parser_token.is_end_tag) {
            parser_token.start_tag_token = this._tag_stack.try_pop(parser_token.tag_name);
          } else {
            if (this._do_optional_end_element(parser_token)) {
              if (!parser_token.is_inline_element) {
                printer.print_newline(false);
              }
            }
            this._tag_stack.record_tag(parser_token);
            if ((parser_token.tag_name === "script" || parser_token.tag_name === "style") && !(parser_token.is_unformatted || parser_token.is_content_unformatted)) {
              parser_token.custom_beautifier_name = get_custom_beautifier_name(parser_token.tag_check, raw_token);
            }
          }
        }
        if (in_array(parser_token.tag_check, this._options.extra_liners)) {
          printer.print_newline(false);
          if (!printer._output.just_added_blankline()) {
            printer.print_newline(true);
          }
        }
        if (parser_token.is_empty_element) {
          if (parser_token.tag_start_char === "{" && parser_token.tag_check === "else") {
            this._tag_stack.indent_to_tag(["if", "unless", "each"]);
            parser_token.indent_content = true;
            var foundIfOnCurrentLine = printer.current_line_has_match(/{{#if/);
            if (!foundIfOnCurrentLine) {
              printer.print_newline(false);
            }
          }
          if (parser_token.tag_name === "!--" && last_token.type === TOKEN.TAG_CLOSE && last_tag_token.is_end_tag && parser_token.text.indexOf("\n") === -1) {
          } else {
            if (!(parser_token.is_inline_element || parser_token.is_unformatted)) {
              printer.print_newline(false);
            }
            this._calcluate_parent_multiline(printer, parser_token);
          }
        } else if (parser_token.is_end_tag) {
          var do_end_expand = false;
          do_end_expand = parser_token.start_tag_token && parser_token.start_tag_token.multiline_content;
          do_end_expand = do_end_expand || !parser_token.is_inline_element && !(last_tag_token.is_inline_element || last_tag_token.is_unformatted) && !(last_token.type === TOKEN.TAG_CLOSE && parser_token.start_tag_token === last_tag_token) && last_token.type !== "TK_CONTENT";
          if (parser_token.is_content_unformatted || parser_token.is_unformatted) {
            do_end_expand = false;
          }
          if (do_end_expand) {
            printer.print_newline(false);
          }
        } else {
          parser_token.indent_content = !parser_token.custom_beautifier_name;
          if (parser_token.tag_start_char === "<") {
            if (parser_token.tag_name === "html") {
              parser_token.indent_content = this._options.indent_inner_html;
            } else if (parser_token.tag_name === "head") {
              parser_token.indent_content = this._options.indent_head_inner_html;
            } else if (parser_token.tag_name === "body") {
              parser_token.indent_content = this._options.indent_body_inner_html;
            }
          }
          if (!(parser_token.is_inline_element || parser_token.is_unformatted) && (last_token.type !== "TK_CONTENT" || parser_token.is_content_unformatted)) {
            printer.print_newline(false);
          }
          this._calcluate_parent_multiline(printer, parser_token);
        }
      };
      Beautifier.prototype._calcluate_parent_multiline = function(printer, parser_token) {
        if (parser_token.parent && printer._output.just_added_newline() && !((parser_token.is_inline_element || parser_token.is_unformatted) && parser_token.parent.is_inline_element)) {
          parser_token.parent.multiline_content = true;
        }
      };
      var p_closers = ["address", "article", "aside", "blockquote", "details", "div", "dl", "fieldset", "figcaption", "figure", "footer", "form", "h1", "h2", "h3", "h4", "h5", "h6", "header", "hr", "main", "menu", "nav", "ol", "p", "pre", "section", "table", "ul"];
      var p_parent_excludes = ["a", "audio", "del", "ins", "map", "noscript", "video"];
      Beautifier.prototype._do_optional_end_element = function(parser_token) {
        var result = null;
        if (parser_token.is_empty_element || !parser_token.is_start_tag || !parser_token.parent) {
          return;
        }
        if (parser_token.tag_name === "body") {
          result = result || this._tag_stack.try_pop("head");
        } else if (parser_token.tag_name === "li") {
          result = result || this._tag_stack.try_pop("li", ["ol", "ul", "menu"]);
        } else if (parser_token.tag_name === "dd" || parser_token.tag_name === "dt") {
          result = result || this._tag_stack.try_pop("dt", ["dl"]);
          result = result || this._tag_stack.try_pop("dd", ["dl"]);
        } else if (parser_token.parent.tag_name === "p" && p_closers.indexOf(parser_token.tag_name) !== -1) {
          var p_parent = parser_token.parent.parent;
          if (!p_parent || p_parent_excludes.indexOf(p_parent.tag_name) === -1) {
            result = result || this._tag_stack.try_pop("p");
          }
        } else if (parser_token.tag_name === "rp" || parser_token.tag_name === "rt") {
          result = result || this._tag_stack.try_pop("rt", ["ruby", "rtc"]);
          result = result || this._tag_stack.try_pop("rp", ["ruby", "rtc"]);
        } else if (parser_token.tag_name === "optgroup") {
          result = result || this._tag_stack.try_pop("optgroup", ["select"]);
        } else if (parser_token.tag_name === "option") {
          result = result || this._tag_stack.try_pop("option", ["select", "datalist", "optgroup"]);
        } else if (parser_token.tag_name === "colgroup") {
          result = result || this._tag_stack.try_pop("caption", ["table"]);
        } else if (parser_token.tag_name === "thead") {
          result = result || this._tag_stack.try_pop("caption", ["table"]);
          result = result || this._tag_stack.try_pop("colgroup", ["table"]);
        } else if (parser_token.tag_name === "tbody" || parser_token.tag_name === "tfoot") {
          result = result || this._tag_stack.try_pop("caption", ["table"]);
          result = result || this._tag_stack.try_pop("colgroup", ["table"]);
          result = result || this._tag_stack.try_pop("thead", ["table"]);
          result = result || this._tag_stack.try_pop("tbody", ["table"]);
        } else if (parser_token.tag_name === "tr") {
          result = result || this._tag_stack.try_pop("caption", ["table"]);
          result = result || this._tag_stack.try_pop("colgroup", ["table"]);
          result = result || this._tag_stack.try_pop("tr", ["table", "thead", "tbody", "tfoot"]);
        } else if (parser_token.tag_name === "th" || parser_token.tag_name === "td") {
          result = result || this._tag_stack.try_pop("td", ["table", "thead", "tbody", "tfoot", "tr"]);
          result = result || this._tag_stack.try_pop("th", ["table", "thead", "tbody", "tfoot", "tr"]);
        }
        parser_token.parent = this._tag_stack.get_parser_token();
        return result;
      };
      module.exports.Beautifier = Beautifier;
    }
  });

  // node_modules/js-beautify/js/src/html/index.js
  var require_html = __commonJS({
    "node_modules/js-beautify/js/src/html/index.js"(exports, module) {
      "use strict";
      var Beautifier = require_beautifier3().Beautifier;
      var Options = require_options4().Options;
      function style_html(html_source, options, js_beautify, css_beautify) {
        var beautifier = new Beautifier(html_source, options, js_beautify, css_beautify);
        return beautifier.beautify();
      }
      module.exports = style_html;
      module.exports.defaultOptions = function() {
        return new Options();
      };
    }
  });

  // node_modules/js-beautify/js/src/index.js
  var require_src = __commonJS({
    "node_modules/js-beautify/js/src/index.js"(exports, module) {
      "use strict";
      var js_beautify = require_javascript();
      var css_beautify = require_css();
      var html_beautify = require_html();
      function style_html(html_source, options, js, css) {
        js = js || js_beautify;
        css = css || css_beautify;
        return html_beautify(html_source, options, js, css);
      }
      style_html.defaultOptions = html_beautify.defaultOptions;
      module.exports.js = js_beautify;
      module.exports.css = css_beautify;
      module.exports.html = style_html;
    }
  });

  // node_modules/js-beautify/js/index.js
  var require_js = __commonJS({
    "node_modules/js-beautify/js/index.js"(exports, module) {
      "use strict";
      function get_beautify(js_beautify, css_beautify, html_beautify) {
        var beautify2 = function(src, config) {
          return js_beautify.js_beautify(src, config);
        };
        beautify2.js = js_beautify.js_beautify;
        beautify2.css = css_beautify.css_beautify;
        beautify2.html = html_beautify.html_beautify;
        beautify2.js_beautify = js_beautify.js_beautify;
        beautify2.css_beautify = css_beautify.css_beautify;
        beautify2.html_beautify = html_beautify.html_beautify;
        return beautify2;
      }
      if (typeof define === "function" && define.amd) {
        define([
          "./lib/beautify",
          "./lib/beautify-css",
          "./lib/beautify-html"
        ], function(js_beautify, css_beautify, html_beautify) {
          return get_beautify(js_beautify, css_beautify, html_beautify);
        });
      } else {
        (function(mod) {
          var beautifier = require_src();
          beautifier.js_beautify = beautifier.js;
          beautifier.css_beautify = beautifier.css;
          beautifier.html_beautify = beautifier.html;
          mod.exports = get_beautify(beautifier, beautifier, beautifier);
        })(module);
      }
    }
  });

  // node_modules/mime-db/db.json
  var require_db = __commonJS({
    "node_modules/mime-db/db.json"(exports, module) {
      module.exports = {
        "application/1d-interleaved-parityfec": {
          source: "iana"
        },
        "application/3gpdash-qoe-report+xml": {
          source: "iana",
          charset: "UTF-8",
          compressible: true
        },
        "application/3gpp-ims+xml": {
          source: "iana",
          compressible: true
        },
        "application/3gpphal+json": {
          source: "iana",
          compressible: true
        },
        "application/3gpphalforms+json": {
          source: "iana",
          compressible: true
        },
        "application/a2l": {
          source: "iana"
        },
        "application/ace+cbor": {
          source: "iana"
        },
        "application/activemessage": {
          source: "iana"
        },
        "application/activity+json": {
          source: "iana",
          compressible: true
        },
        "application/alto-costmap+json": {
          source: "iana",
          compressible: true
        },
        "application/alto-costmapfilter+json": {
          source: "iana",
          compressible: true
        },
        "application/alto-directory+json": {
          source: "iana",
          compressible: true
        },
        "application/alto-endpointcost+json": {
          source: "iana",
          compressible: true
        },
        "application/alto-endpointcostparams+json": {
          source: "iana",
          compressible: true
        },
        "application/alto-endpointprop+json": {
          source: "iana",
          compressible: true
        },
        "application/alto-endpointpropparams+json": {
          source: "iana",
          compressible: true
        },
        "application/alto-error+json": {
          source: "iana",
          compressible: true
        },
        "application/alto-networkmap+json": {
          source: "iana",
          compressible: true
        },
        "application/alto-networkmapfilter+json": {
          source: "iana",
          compressible: true
        },
        "application/alto-updatestreamcontrol+json": {
          source: "iana",
          compressible: true
        },
        "application/alto-updatestreamparams+json": {
          source: "iana",
          compressible: true
        },
        "application/aml": {
          source: "iana"
        },
        "application/andrew-inset": {
          source: "iana",
          extensions: ["ez"]
        },
        "application/applefile": {
          source: "iana"
        },
        "application/applixware": {
          source: "apache",
          extensions: ["aw"]
        },
        "application/at+jwt": {
          source: "iana"
        },
        "application/atf": {
          source: "iana"
        },
        "application/atfx": {
          source: "iana"
        },
        "application/atom+xml": {
          source: "iana",
          compressible: true,
          extensions: ["atom"]
        },
        "application/atomcat+xml": {
          source: "iana",
          compressible: true,
          extensions: ["atomcat"]
        },
        "application/atomdeleted+xml": {
          source: "iana",
          compressible: true,
          extensions: ["atomdeleted"]
        },
        "application/atomicmail": {
          source: "iana"
        },
        "application/atomsvc+xml": {
          source: "iana",
          compressible: true,
          extensions: ["atomsvc"]
        },
        "application/atsc-dwd+xml": {
          source: "iana",
          compressible: true,
          extensions: ["dwd"]
        },
        "application/atsc-dynamic-event-message": {
          source: "iana"
        },
        "application/atsc-held+xml": {
          source: "iana",
          compressible: true,
          extensions: ["held"]
        },
        "application/atsc-rdt+json": {
          source: "iana",
          compressible: true
        },
        "application/atsc-rsat+xml": {
          source: "iana",
          compressible: true,
          extensions: ["rsat"]
        },
        "application/atxml": {
          source: "iana"
        },
        "application/auth-policy+xml": {
          source: "iana",
          compressible: true
        },
        "application/bacnet-xdd+zip": {
          source: "iana",
          compressible: false
        },
        "application/batch-smtp": {
          source: "iana"
        },
        "application/bdoc": {
          compressible: false,
          extensions: ["bdoc"]
        },
        "application/beep+xml": {
          source: "iana",
          charset: "UTF-8",
          compressible: true
        },
        "application/calendar+json": {
          source: "iana",
          compressible: true
        },
        "application/calendar+xml": {
          source: "iana",
          compressible: true,
          extensions: ["xcs"]
        },
        "application/call-completion": {
          source: "iana"
        },
        "application/cals-1840": {
          source: "iana"
        },
        "application/captive+json": {
          source: "iana",
          compressible: true
        },
        "application/cbor": {
          source: "iana"
        },
        "application/cbor-seq": {
          source: "iana"
        },
        "application/cccex": {
          source: "iana"
        },
        "application/ccmp+xml": {
          source: "iana",
          compressible: true
        },
        "application/ccxml+xml": {
          source: "iana",
          compressible: true,
          extensions: ["ccxml"]
        },
        "application/cdfx+xml": {
          source: "iana",
          compressible: true,
          extensions: ["cdfx"]
        },
        "application/cdmi-capability": {
          source: "iana",
          extensions: ["cdmia"]
        },
        "application/cdmi-container": {
          source: "iana",
          extensions: ["cdmic"]
        },
        "application/cdmi-domain": {
          source: "iana",
          extensions: ["cdmid"]
        },
        "application/cdmi-object": {
          source: "iana",
          extensions: ["cdmio"]
        },
        "application/cdmi-queue": {
          source: "iana",
          extensions: ["cdmiq"]
        },
        "application/cdni": {
          source: "iana"
        },
        "application/cea": {
          source: "iana"
        },
        "application/cea-2018+xml": {
          source: "iana",
          compressible: true
        },
        "application/cellml+xml": {
          source: "iana",
          compressible: true
        },
        "application/cfw": {
          source: "iana"
        },
        "application/city+json": {
          source: "iana",
          compressible: true
        },
        "application/clr": {
          source: "iana"
        },
        "application/clue+xml": {
          source: "iana",
          compressible: true
        },
        "application/clue_info+xml": {
          source: "iana",
          compressible: true
        },
        "application/cms": {
          source: "iana"
        },
        "application/cnrp+xml": {
          source: "iana",
          compressible: true
        },
        "application/coap-group+json": {
          source: "iana",
          compressible: true
        },
        "application/coap-payload": {
          source: "iana"
        },
        "application/commonground": {
          source: "iana"
        },
        "application/conference-info+xml": {
          source: "iana",
          compressible: true
        },
        "application/cose": {
          source: "iana"
        },
        "application/cose-key": {
          source: "iana"
        },
        "application/cose-key-set": {
          source: "iana"
        },
        "application/cpl+xml": {
          source: "iana",
          compressible: true,
          extensions: ["cpl"]
        },
        "application/csrattrs": {
          source: "iana"
        },
        "application/csta+xml": {
          source: "iana",
          compressible: true
        },
        "application/cstadata+xml": {
          source: "iana",
          compressible: true
        },
        "application/csvm+json": {
          source: "iana",
          compressible: true
        },
        "application/cu-seeme": {
          source: "apache",
          extensions: ["cu"]
        },
        "application/cwt": {
          source: "iana"
        },
        "application/cybercash": {
          source: "iana"
        },
        "application/dart": {
          compressible: true
        },
        "application/dash+xml": {
          source: "iana",
          compressible: true,
          extensions: ["mpd"]
        },
        "application/dash-patch+xml": {
          source: "iana",
          compressible: true,
          extensions: ["mpp"]
        },
        "application/dashdelta": {
          source: "iana"
        },
        "application/davmount+xml": {
          source: "iana",
          compressible: true,
          extensions: ["davmount"]
        },
        "application/dca-rft": {
          source: "iana"
        },
        "application/dcd": {
          source: "iana"
        },
        "application/dec-dx": {
          source: "iana"
        },
        "application/dialog-info+xml": {
          source: "iana",
          compressible: true
        },
        "application/dicom": {
          source: "iana"
        },
        "application/dicom+json": {
          source: "iana",
          compressible: true
        },
        "application/dicom+xml": {
          source: "iana",
          compressible: true
        },
        "application/dii": {
          source: "iana"
        },
        "application/dit": {
          source: "iana"
        },
        "application/dns": {
          source: "iana"
        },
        "application/dns+json": {
          source: "iana",
          compressible: true
        },
        "application/dns-message": {
          source: "iana"
        },
        "application/docbook+xml": {
          source: "apache",
          compressible: true,
          extensions: ["dbk"]
        },
        "application/dots+cbor": {
          source: "iana"
        },
        "application/dskpp+xml": {
          source: "iana",
          compressible: true
        },
        "application/dssc+der": {
          source: "iana",
          extensions: ["dssc"]
        },
        "application/dssc+xml": {
          source: "iana",
          compressible: true,
          extensions: ["xdssc"]
        },
        "application/dvcs": {
          source: "iana"
        },
        "application/ecmascript": {
          source: "iana",
          compressible: true,
          extensions: ["es", "ecma"]
        },
        "application/edi-consent": {
          source: "iana"
        },
        "application/edi-x12": {
          source: "iana",
          compressible: false
        },
        "application/edifact": {
          source: "iana",
          compressible: false
        },
        "application/efi": {
          source: "iana"
        },
        "application/elm+json": {
          source: "iana",
          charset: "UTF-8",
          compressible: true
        },
        "application/elm+xml": {
          source: "iana",
          compressible: true
        },
        "application/emergencycalldata.cap+xml": {
          source: "iana",
          charset: "UTF-8",
          compressible: true
        },
        "application/emergencycalldata.comment+xml": {
          source: "iana",
          compressible: true
        },
        "application/emergencycalldata.control+xml": {
          source: "iana",
          compressible: true
        },
        "application/emergencycalldata.deviceinfo+xml": {
          source: "iana",
          compressible: true
        },
        "application/emergencycalldata.ecall.msd": {
          source: "iana"
        },
        "application/emergencycalldata.providerinfo+xml": {
          source: "iana",
          compressible: true
        },
        "application/emergencycalldata.serviceinfo+xml": {
          source: "iana",
          compressible: true
        },
        "application/emergencycalldata.subscriberinfo+xml": {
          source: "iana",
          compressible: true
        },
        "application/emergencycalldata.veds+xml": {
          source: "iana",
          compressible: true
        },
        "application/emma+xml": {
          source: "iana",
          compressible: true,
          extensions: ["emma"]
        },
        "application/emotionml+xml": {
          source: "iana",
          compressible: true,
          extensions: ["emotionml"]
        },
        "application/encaprtp": {
          source: "iana"
        },
        "application/epp+xml": {
          source: "iana",
          compressible: true
        },
        "application/epub+zip": {
          source: "iana",
          compressible: false,
          extensions: ["epub"]
        },
        "application/eshop": {
          source: "iana"
        },
        "application/exi": {
          source: "iana",
          extensions: ["exi"]
        },
        "application/expect-ct-report+json": {
          source: "iana",
          compressible: true
        },
        "application/express": {
          source: "iana",
          extensions: ["exp"]
        },
        "application/fastinfoset": {
          source: "iana"
        },
        "application/fastsoap": {
          source: "iana"
        },
        "application/fdt+xml": {
          source: "iana",
          compressible: true,
          extensions: ["fdt"]
        },
        "application/fhir+json": {
          source: "iana",
          charset: "UTF-8",
          compressible: true
        },
        "application/fhir+xml": {
          source: "iana",
          charset: "UTF-8",
          compressible: true
        },
        "application/fido.trusted-apps+json": {
          compressible: true
        },
        "application/fits": {
          source: "iana"
        },
        "application/flexfec": {
          source: "iana"
        },
        "application/font-sfnt": {
          source: "iana"
        },
        "application/font-tdpfr": {
          source: "iana",
          extensions: ["pfr"]
        },
        "application/font-woff": {
          source: "iana",
          compressible: false
        },
        "application/framework-attributes+xml": {
          source: "iana",
          compressible: true
        },
        "application/geo+json": {
          source: "iana",
          compressible: true,
          extensions: ["geojson"]
        },
        "application/geo+json-seq": {
          source: "iana"
        },
        "application/geopackage+sqlite3": {
          source: "iana"
        },
        "application/geoxacml+xml": {
          source: "iana",
          compressible: true
        },
        "application/gltf-buffer": {
          source: "iana"
        },
        "application/gml+xml": {
          source: "iana",
          compressible: true,
          extensions: ["gml"]
        },
        "application/gpx+xml": {
          source: "apache",
          compressible: true,
          extensions: ["gpx"]
        },
        "application/gxf": {
          source: "apache",
          extensions: ["gxf"]
        },
        "application/gzip": {
          source: "iana",
          compressible: false,
          extensions: ["gz"]
        },
        "application/h224": {
          source: "iana"
        },
        "application/held+xml": {
          source: "iana",
          compressible: true
        },
        "application/hjson": {
          extensions: ["hjson"]
        },
        "application/http": {
          source: "iana"
        },
        "application/hyperstudio": {
          source: "iana",
          extensions: ["stk"]
        },
        "application/ibe-key-request+xml": {
          source: "iana",
          compressible: true
        },
        "application/ibe-pkg-reply+xml": {
          source: "iana",
          compressible: true
        },
        "application/ibe-pp-data": {
          source: "iana"
        },
        "application/iges": {
          source: "iana"
        },
        "application/im-iscomposing+xml": {
          source: "iana",
          charset: "UTF-8",
          compressible: true
        },
        "application/index": {
          source: "iana"
        },
        "application/index.cmd": {
          source: "iana"
        },
        "application/index.obj": {
          source: "iana"
        },
        "application/index.response": {
          source: "iana"
        },
        "application/index.vnd": {
          source: "iana"
        },
        "application/inkml+xml": {
          source: "iana",
          compressible: true,
          extensions: ["ink", "inkml"]
        },
        "application/iotp": {
          source: "iana"
        },
        "application/ipfix": {
          source: "iana",
          extensions: ["ipfix"]
        },
        "application/ipp": {
          source: "iana"
        },
        "application/isup": {
          source: "iana"
        },
        "application/its+xml": {
          source: "iana",
          compressible: true,
          extensions: ["its"]
        },
        "application/java-archive": {
          source: "apache",
          compressible: false,
          extensions: ["jar", "war", "ear"]
        },
        "application/java-serialized-object": {
          source: "apache",
          compressible: false,
          extensions: ["ser"]
        },
        "application/java-vm": {
          source: "apache",
          compressible: false,
          extensions: ["class"]
        },
        "application/javascript": {
          source: "iana",
          charset: "UTF-8",
          compressible: true,
          extensions: ["js", "mjs"]
        },
        "application/jf2feed+json": {
          source: "iana",
          compressible: true
        },
        "application/jose": {
          source: "iana"
        },
        "application/jose+json": {
          source: "iana",
          compressible: true
        },
        "application/jrd+json": {
          source: "iana",
          compressible: true
        },
        "application/jscalendar+json": {
          source: "iana",
          compressible: true
        },
        "application/json": {
          source: "iana",
          charset: "UTF-8",
          compressible: true,
          extensions: ["json", "map"]
        },
        "application/json-patch+json": {
          source: "iana",
          compressible: true
        },
        "application/json-seq": {
          source: "iana"
        },
        "application/json5": {
          extensions: ["json5"]
        },
        "application/jsonml+json": {
          source: "apache",
          compressible: true,
          extensions: ["jsonml"]
        },
        "application/jwk+json": {
          source: "iana",
          compressible: true
        },
        "application/jwk-set+json": {
          source: "iana",
          compressible: true
        },
        "application/jwt": {
          source: "iana"
        },
        "application/kpml-request+xml": {
          source: "iana",
          compressible: true
        },
        "application/kpml-response+xml": {
          source: "iana",
          compressible: true
        },
        "application/ld+json": {
          source: "iana",
          compressible: true,
          extensions: ["jsonld"]
        },
        "application/lgr+xml": {
          source: "iana",
          compressible: true,
          extensions: ["lgr"]
        },
        "application/link-format": {
          source: "iana"
        },
        "application/load-control+xml": {
          source: "iana",
          compressible: true
        },
        "application/lost+xml": {
          source: "iana",
          compressible: true,
          extensions: ["lostxml"]
        },
        "application/lostsync+xml": {
          source: "iana",
          compressible: true
        },
        "application/lpf+zip": {
          source: "iana",
          compressible: false
        },
        "application/lxf": {
          source: "iana"
        },
        "application/mac-binhex40": {
          source: "iana",
          extensions: ["hqx"]
        },
        "application/mac-compactpro": {
          source: "apache",
          extensions: ["cpt"]
        },
        "application/macwriteii": {
          source: "iana"
        },
        "application/mads+xml": {
          source: "iana",
          compressible: true,
          extensions: ["mads"]
        },
        "application/manifest+json": {
          source: "iana",
          charset: "UTF-8",
          compressible: true,
          extensions: ["webmanifest"]
        },
        "application/marc": {
          source: "iana",
          extensions: ["mrc"]
        },
        "application/marcxml+xml": {
          source: "iana",
          compressible: true,
          extensions: ["mrcx"]
        },
        "application/mathematica": {
          source: "iana",
          extensions: ["ma", "nb", "mb"]
        },
        "application/mathml+xml": {
          source: "iana",
          compressible: true,
          extensions: ["mathml"]
        },
        "application/mathml-content+xml": {
          source: "iana",
          compressible: true
        },
        "application/mathml-presentation+xml": {
          source: "iana",
          compressible: true
        },
        "application/mbms-associated-procedure-description+xml": {
          source: "iana",
          compressible: true
        },
        "application/mbms-deregister+xml": {
          source: "iana",
          compressible: true
        },
        "application/mbms-envelope+xml": {
          source: "iana",
          compressible: true
        },
        "application/mbms-msk+xml": {
          source: "iana",
          compressible: true
        },
        "application/mbms-msk-response+xml": {
          source: "iana",
          compressible: true
        },
        "application/mbms-protection-description+xml": {
          source: "iana",
          compressible: true
        },
        "application/mbms-reception-report+xml": {
          source: "iana",
          compressible: true
        },
        "application/mbms-register+xml": {
          source: "iana",
          compressible: true
        },
        "application/mbms-register-response+xml": {
          source: "iana",
          compressible: true
        },
        "application/mbms-schedule+xml": {
          source: "iana",
          compressible: true
        },
        "application/mbms-user-service-description+xml": {
          source: "iana",
          compressible: true
        },
        "application/mbox": {
          source: "iana",
          extensions: ["mbox"]
        },
        "application/media-policy-dataset+xml": {
          source: "iana",
          compressible: true,
          extensions: ["mpf"]
        },
        "application/media_control+xml": {
          source: "iana",
          compressible: true
        },
        "application/mediaservercontrol+xml": {
          source: "iana",
          compressible: true,
          extensions: ["mscml"]
        },
        "application/merge-patch+json": {
          source: "iana",
          compressible: true
        },
        "application/metalink+xml": {
          source: "apache",
          compressible: true,
          extensions: ["metalink"]
        },
        "application/metalink4+xml": {
          source: "iana",
          compressible: true,
          extensions: ["meta4"]
        },
        "application/mets+xml": {
          source: "iana",
          compressible: true,
          extensions: ["mets"]
        },
        "application/mf4": {
          source: "iana"
        },
        "application/mikey": {
          source: "iana"
        },
        "application/mipc": {
          source: "iana"
        },
        "application/missing-blocks+cbor-seq": {
          source: "iana"
        },
        "application/mmt-aei+xml": {
          source: "iana",
          compressible: true,
          extensions: ["maei"]
        },
        "application/mmt-usd+xml": {
          source: "iana",
          compressible: true,
          extensions: ["musd"]
        },
        "application/mods+xml": {
          source: "iana",
          compressible: true,
          extensions: ["mods"]
        },
        "application/moss-keys": {
          source: "iana"
        },
        "application/moss-signature": {
          source: "iana"
        },
        "application/mosskey-data": {
          source: "iana"
        },
        "application/mosskey-request": {
          source: "iana"
        },
        "application/mp21": {
          source: "iana",
          extensions: ["m21", "mp21"]
        },
        "application/mp4": {
          source: "iana",
          extensions: ["mp4s", "m4p"]
        },
        "application/mpeg4-generic": {
          source: "iana"
        },
        "application/mpeg4-iod": {
          source: "iana"
        },
        "application/mpeg4-iod-xmt": {
          source: "iana"
        },
        "application/mrb-consumer+xml": {
          source: "iana",
          compressible: true
        },
        "application/mrb-publish+xml": {
          source: "iana",
          compressible: true
        },
        "application/msc-ivr+xml": {
          source: "iana",
          charset: "UTF-8",
          compressible: true
        },
        "application/msc-mixer+xml": {
          source: "iana",
          charset: "UTF-8",
          compressible: true
        },
        "application/msword": {
          source: "iana",
          compressible: false,
          extensions: ["doc", "dot"]
        },
        "application/mud+json": {
          source: "iana",
          compressible: true
        },
        "application/multipart-core": {
          source: "iana"
        },
        "application/mxf": {
          source: "iana",
          extensions: ["mxf"]
        },
        "application/n-quads": {
          source: "iana",
          extensions: ["nq"]
        },
        "application/n-triples": {
          source: "iana",
          extensions: ["nt"]
        },
        "application/nasdata": {
          source: "iana"
        },
        "application/news-checkgroups": {
          source: "iana",
          charset: "US-ASCII"
        },
        "application/news-groupinfo": {
          source: "iana",
          charset: "US-ASCII"
        },
        "application/news-transmission": {
          source: "iana"
        },
        "application/nlsml+xml": {
          source: "iana",
          compressible: true
        },
        "application/node": {
          source: "iana",
          extensions: ["cjs"]
        },
        "application/nss": {
          source: "iana"
        },
        "application/oauth-authz-req+jwt": {
          source: "iana"
        },
        "application/oblivious-dns-message": {
          source: "iana"
        },
        "application/ocsp-request": {
          source: "iana"
        },
        "application/ocsp-response": {
          source: "iana"
        },
        "application/octet-stream": {
          source: "iana",
          compressible: false,
          extensions: ["bin", "dms", "lrf", "mar", "so", "dist", "distz", "pkg", "bpk", "dump", "elc", "deploy", "exe", "dll", "deb", "dmg", "iso", "img", "msi", "msp", "msm", "buffer"]
        },
        "application/oda": {
          source: "iana",
          extensions: ["oda"]
        },
        "application/odm+xml": {
          source: "iana",
          compressible: true
        },
        "application/odx": {
          source: "iana"
        },
        "application/oebps-package+xml": {
          source: "iana",
          compressible: true,
          extensions: ["opf"]
        },
        "application/ogg": {
          source: "iana",
          compressible: false,
          extensions: ["ogx"]
        },
        "application/omdoc+xml": {
          source: "apache",
          compressible: true,
          extensions: ["omdoc"]
        },
        "application/onenote": {
          source: "apache",
          extensions: ["onetoc", "onetoc2", "onetmp", "onepkg"]
        },
        "application/opc-nodeset+xml": {
          source: "iana",
          compressible: true
        },
        "application/oscore": {
          source: "iana"
        },
        "application/oxps": {
          source: "iana",
          extensions: ["oxps"]
        },
        "application/p21": {
          source: "iana"
        },
        "application/p21+zip": {
          source: "iana",
          compressible: false
        },
        "application/p2p-overlay+xml": {
          source: "iana",
          compressible: true,
          extensions: ["relo"]
        },
        "application/parityfec": {
          source: "iana"
        },
        "application/passport": {
          source: "iana"
        },
        "application/patch-ops-error+xml": {
          source: "iana",
          compressible: true,
          extensions: ["xer"]
        },
        "application/pdf": {
          source: "iana",
          compressible: false,
          extensions: ["pdf"]
        },
        "application/pdx": {
          source: "iana"
        },
        "application/pem-certificate-chain": {
          source: "iana"
        },
        "application/pgp-encrypted": {
          source: "iana",
          compressible: false,
          extensions: ["pgp"]
        },
        "application/pgp-keys": {
          source: "iana",
          extensions: ["asc"]
        },
        "application/pgp-signature": {
          source: "iana",
          extensions: ["asc", "sig"]
        },
        "application/pics-rules": {
          source: "apache",
          extensions: ["prf"]
        },
        "application/pidf+xml": {
          source: "iana",
          charset: "UTF-8",
          compressible: true
        },
        "application/pidf-diff+xml": {
          source: "iana",
          charset: "UTF-8",
          compressible: true
        },
        "application/pkcs10": {
          source: "iana",
          extensions: ["p10"]
        },
        "application/pkcs12": {
          source: "iana"
        },
        "application/pkcs7-mime": {
          source: "iana",
          extensions: ["p7m", "p7c"]
        },
        "application/pkcs7-signature": {
          source: "iana",
          extensions: ["p7s"]
        },
        "application/pkcs8": {
          source: "iana",
          extensions: ["p8"]
        },
        "application/pkcs8-encrypted": {
          source: "iana"
        },
        "application/pkix-attr-cert": {
          source: "iana",
          extensions: ["ac"]
        },
        "application/pkix-cert": {
          source: "iana",
          extensions: ["cer"]
        },
        "application/pkix-crl": {
          source: "iana",
          extensions: ["crl"]
        },
        "application/pkix-pkipath": {
          source: "iana",
          extensions: ["pkipath"]
        },
        "application/pkixcmp": {
          source: "iana",
          extensions: ["pki"]
        },
        "application/pls+xml": {
          source: "iana",
          compressible: true,
          extensions: ["pls"]
        },
        "application/poc-settings+xml": {
          source: "iana",
          charset: "UTF-8",
          compressible: true
        },
        "application/postscript": {
          source: "iana",
          compressible: true,
          extensions: ["ai", "eps", "ps"]
        },
        "application/ppsp-tracker+json": {
          source: "iana",
          compressible: true
        },
        "application/problem+json": {
          source: "iana",
          compressible: true
        },
        "application/problem+xml": {
          source: "iana",
          compressible: true
        },
        "application/provenance+xml": {
          source: "iana",
          compressible: true,
          extensions: ["provx"]
        },
        "application/prs.alvestrand.titrax-sheet": {
          source: "iana"
        },
        "application/prs.cww": {
          source: "iana",
          extensions: ["cww"]
        },
        "application/prs.cyn": {
          source: "iana",
          charset: "7-BIT"
        },
        "application/prs.hpub+zip": {
          source: "iana",
          compressible: false
        },
        "application/prs.nprend": {
          source: "iana"
        },
        "application/prs.plucker": {
          source: "iana"
        },
        "application/prs.rdf-xml-crypt": {
          source: "iana"
        },
        "application/prs.xsf+xml": {
          source: "iana",
          compressible: true
        },
        "application/pskc+xml": {
          source: "iana",
          compressible: true,
          extensions: ["pskcxml"]
        },
        "application/pvd+json": {
          source: "iana",
          compressible: true
        },
        "application/qsig": {
          source: "iana"
        },
        "application/raml+yaml": {
          compressible: true,
          extensions: ["raml"]
        },
        "application/raptorfec": {
          source: "iana"
        },
        "application/rdap+json": {
          source: "iana",
          compressible: true
        },
        "application/rdf+xml": {
          source: "iana",
          compressible: true,
          extensions: ["rdf", "owl"]
        },
        "application/reginfo+xml": {
          source: "iana",
          compressible: true,
          extensions: ["rif"]
        },
        "application/relax-ng-compact-syntax": {
          source: "iana",
          extensions: ["rnc"]
        },
        "application/remote-printing": {
          source: "iana"
        },
        "application/reputon+json": {
          source: "iana",
          compressible: true
        },
        "application/resource-lists+xml": {
          source: "iana",
          compressible: true,
          extensions: ["rl"]
        },
        "application/resource-lists-diff+xml": {
          source: "iana",
          compressible: true,
          extensions: ["rld"]
        },
        "application/rfc+xml": {
          source: "iana",
          compressible: true
        },
        "application/riscos": {
          source: "iana"
        },
        "application/rlmi+xml": {
          source: "iana",
          compressible: true
        },
        "application/rls-services+xml": {
          source: "iana",
          compressible: true,
          extensions: ["rs"]
        },
        "application/route-apd+xml": {
          source: "iana",
          compressible: true,
          extensions: ["rapd"]
        },
        "application/route-s-tsid+xml": {
          source: "iana",
          compressible: true,
          extensions: ["sls"]
        },
        "application/route-usd+xml": {
          source: "iana",
          compressible: true,
          extensions: ["rusd"]
        },
        "application/rpki-ghostbusters": {
          source: "iana",
          extensions: ["gbr"]
        },
        "application/rpki-manifest": {
          source: "iana",
          extensions: ["mft"]
        },
        "application/rpki-publication": {
          source: "iana"
        },
        "application/rpki-roa": {
          source: "iana",
          extensions: ["roa"]
        },
        "application/rpki-updown": {
          source: "iana"
        },
        "application/rsd+xml": {
          source: "apache",
          compressible: true,
          extensions: ["rsd"]
        },
        "application/rss+xml": {
          source: "apache",
          compressible: true,
          extensions: ["rss"]
        },
        "application/rtf": {
          source: "iana",
          compressible: true,
          extensions: ["rtf"]
        },
        "application/rtploopback": {
          source: "iana"
        },
        "application/rtx": {
          source: "iana"
        },
        "application/samlassertion+xml": {
          source: "iana",
          compressible: true
        },
        "application/samlmetadata+xml": {
          source: "iana",
          compressible: true
        },
        "application/sarif+json": {
          source: "iana",
          compressible: true
        },
        "application/sarif-external-properties+json": {
          source: "iana",
          compressible: true
        },
        "application/sbe": {
          source: "iana"
        },
        "application/sbml+xml": {
          source: "iana",
          compressible: true,
          extensions: ["sbml"]
        },
        "application/scaip+xml": {
          source: "iana",
          compressible: true
        },
        "application/scim+json": {
          source: "iana",
          compressible: true
        },
        "application/scvp-cv-request": {
          source: "iana",
          extensions: ["scq"]
        },
        "application/scvp-cv-response": {
          source: "iana",
          extensions: ["scs"]
        },
        "application/scvp-vp-request": {
          source: "iana",
          extensions: ["spq"]
        },
        "application/scvp-vp-response": {
          source: "iana",
          extensions: ["spp"]
        },
        "application/sdp": {
          source: "iana",
          extensions: ["sdp"]
        },
        "application/secevent+jwt": {
          source: "iana"
        },
        "application/senml+cbor": {
          source: "iana"
        },
        "application/senml+json": {
          source: "iana",
          compressible: true
        },
        "application/senml+xml": {
          source: "iana",
          compressible: true,
          extensions: ["senmlx"]
        },
        "application/senml-etch+cbor": {
          source: "iana"
        },
        "application/senml-etch+json": {
          source: "iana",
          compressible: true
        },
        "application/senml-exi": {
          source: "iana"
        },
        "application/sensml+cbor": {
          source: "iana"
        },
        "application/sensml+json": {
          source: "iana",
          compressible: true
        },
        "application/sensml+xml": {
          source: "iana",
          compressible: true,
          extensions: ["sensmlx"]
        },
        "application/sensml-exi": {
          source: "iana"
        },
        "application/sep+xml": {
          source: "iana",
          compressible: true
        },
        "application/sep-exi": {
          source: "iana"
        },
        "application/session-info": {
          source: "iana"
        },
        "application/set-payment": {
          source: "iana"
        },
        "application/set-payment-initiation": {
          source: "iana",
          extensions: ["setpay"]
        },
        "application/set-registration": {
          source: "iana"
        },
        "application/set-registration-initiation": {
          source: "iana",
          extensions: ["setreg"]
        },
        "application/sgml": {
          source: "iana"
        },
        "application/sgml-open-catalog": {
          source: "iana"
        },
        "application/shf+xml": {
          source: "iana",
          compressible: true,
          extensions: ["shf"]
        },
        "application/sieve": {
          source: "iana",
          extensions: ["siv", "sieve"]
        },
        "application/simple-filter+xml": {
          source: "iana",
          compressible: true
        },
        "application/simple-message-summary": {
          source: "iana"
        },
        "application/simplesymbolcontainer": {
          source: "iana"
        },
        "application/sipc": {
          source: "iana"
        },
        "application/slate": {
          source: "iana"
        },
        "application/smil": {
          source: "iana"
        },
        "application/smil+xml": {
          source: "iana",
          compressible: true,
          extensions: ["smi", "smil"]
        },
        "application/smpte336m": {
          source: "iana"
        },
        "application/soap+fastinfoset": {
          source: "iana"
        },
        "application/soap+xml": {
          source: "iana",
          compressible: true
        },
        "application/sparql-query": {
          source: "iana",
          extensions: ["rq"]
        },
        "application/sparql-results+xml": {
          source: "iana",
          compressible: true,
          extensions: ["srx"]
        },
        "application/spdx+json": {
          source: "iana",
          compressible: true
        },
        "application/spirits-event+xml": {
          source: "iana",
          compressible: true
        },
        "application/sql": {
          source: "iana"
        },
        "application/srgs": {
          source: "iana",
          extensions: ["gram"]
        },
        "application/srgs+xml": {
          source: "iana",
          compressible: true,
          extensions: ["grxml"]
        },
        "application/sru+xml": {
          source: "iana",
          compressible: true,
          extensions: ["sru"]
        },
        "application/ssdl+xml": {
          source: "apache",
          compressible: true,
          extensions: ["ssdl"]
        },
        "application/ssml+xml": {
          source: "iana",
          compressible: true,
          extensions: ["ssml"]
        },
        "application/stix+json": {
          source: "iana",
          compressible: true
        },
        "application/swid+xml": {
          source: "iana",
          compressible: true,
          extensions: ["swidtag"]
        },
        "application/tamp-apex-update": {
          source: "iana"
        },
        "application/tamp-apex-update-confirm": {
          source: "iana"
        },
        "application/tamp-community-update": {
          source: "iana"
        },
        "application/tamp-community-update-confirm": {
          source: "iana"
        },
        "application/tamp-error": {
          source: "iana"
        },
        "application/tamp-sequence-adjust": {
          source: "iana"
        },
        "application/tamp-sequence-adjust-confirm": {
          source: "iana"
        },
        "application/tamp-status-query": {
          source: "iana"
        },
        "application/tamp-status-response": {
          source: "iana"
        },
        "application/tamp-update": {
          source: "iana"
        },
        "application/tamp-update-confirm": {
          source: "iana"
        },
        "application/tar": {
          compressible: true
        },
        "application/taxii+json": {
          source: "iana",
          compressible: true
        },
        "application/td+json": {
          source: "iana",
          compressible: true
        },
        "application/tei+xml": {
          source: "iana",
          compressible: true,
          extensions: ["tei", "teicorpus"]
        },
        "application/tetra_isi": {
          source: "iana"
        },
        "application/thraud+xml": {
          source: "iana",
          compressible: true,
          extensions: ["tfi"]
        },
        "application/timestamp-query": {
          source: "iana"
        },
        "application/timestamp-reply": {
          source: "iana"
        },
        "application/timestamped-data": {
          source: "iana",
          extensions: ["tsd"]
        },
        "application/tlsrpt+gzip": {
          source: "iana"
        },
        "application/tlsrpt+json": {
          source: "iana",
          compressible: true
        },
        "application/tnauthlist": {
          source: "iana"
        },
        "application/token-introspection+jwt": {
          source: "iana"
        },
        "application/toml": {
          compressible: true,
          extensions: ["toml"]
        },
        "application/trickle-ice-sdpfrag": {
          source: "iana"
        },
        "application/trig": {
          source: "iana",
          extensions: ["trig"]
        },
        "application/ttml+xml": {
          source: "iana",
          compressible: true,
          extensions: ["ttml"]
        },
        "application/tve-trigger": {
          source: "iana"
        },
        "application/tzif": {
          source: "iana"
        },
        "application/tzif-leap": {
          source: "iana"
        },
        "application/ubjson": {
          compressible: false,
          extensions: ["ubj"]
        },
        "application/ulpfec": {
          source: "iana"
        },
        "application/urc-grpsheet+xml": {
          source: "iana",
          compressible: true
        },
        "application/urc-ressheet+xml": {
          source: "iana",
          compressible: true,
          extensions: ["rsheet"]
        },
        "application/urc-targetdesc+xml": {
          source: "iana",
          compressible: true,
          extensions: ["td"]
        },
        "application/urc-uisocketdesc+xml": {
          source: "iana",
          compressible: true
        },
        "application/vcard+json": {
          source: "iana",
          compressible: true
        },
        "application/vcard+xml": {
          source: "iana",
          compressible: true
        },
        "application/vemmi": {
          source: "iana"
        },
        "application/vividence.scriptfile": {
          source: "apache"
        },
        "application/vnd.1000minds.decision-model+xml": {
          source: "iana",
          compressible: true,
          extensions: ["1km"]
        },
        "application/vnd.3gpp-prose+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.3gpp-prose-pc3ch+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.3gpp-v2x-local-service-information": {
          source: "iana"
        },
        "application/vnd.3gpp.5gnas": {
          source: "iana"
        },
        "application/vnd.3gpp.access-transfer-events+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.3gpp.bsf+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.3gpp.gmop+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.3gpp.gtpc": {
          source: "iana"
        },
        "application/vnd.3gpp.interworking-data": {
          source: "iana"
        },
        "application/vnd.3gpp.lpp": {
          source: "iana"
        },
        "application/vnd.3gpp.mc-signalling-ear": {
          source: "iana"
        },
        "application/vnd.3gpp.mcdata-affiliation-command+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.3gpp.mcdata-info+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.3gpp.mcdata-payload": {
          source: "iana"
        },
        "application/vnd.3gpp.mcdata-service-config+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.3gpp.mcdata-signalling": {
          source: "iana"
        },
        "application/vnd.3gpp.mcdata-ue-config+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.3gpp.mcdata-user-profile+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.3gpp.mcptt-affiliation-command+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.3gpp.mcptt-floor-request+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.3gpp.mcptt-info+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.3gpp.mcptt-location-info+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.3gpp.mcptt-mbms-usage-info+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.3gpp.mcptt-service-config+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.3gpp.mcptt-signed+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.3gpp.mcptt-ue-config+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.3gpp.mcptt-ue-init-config+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.3gpp.mcptt-user-profile+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.3gpp.mcvideo-affiliation-command+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.3gpp.mcvideo-affiliation-info+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.3gpp.mcvideo-info+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.3gpp.mcvideo-location-info+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.3gpp.mcvideo-mbms-usage-info+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.3gpp.mcvideo-service-config+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.3gpp.mcvideo-transmission-request+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.3gpp.mcvideo-ue-config+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.3gpp.mcvideo-user-profile+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.3gpp.mid-call+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.3gpp.ngap": {
          source: "iana"
        },
        "application/vnd.3gpp.pfcp": {
          source: "iana"
        },
        "application/vnd.3gpp.pic-bw-large": {
          source: "iana",
          extensions: ["plb"]
        },
        "application/vnd.3gpp.pic-bw-small": {
          source: "iana",
          extensions: ["psb"]
        },
        "application/vnd.3gpp.pic-bw-var": {
          source: "iana",
          extensions: ["pvb"]
        },
        "application/vnd.3gpp.s1ap": {
          source: "iana"
        },
        "application/vnd.3gpp.sms": {
          source: "iana"
        },
        "application/vnd.3gpp.sms+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.3gpp.srvcc-ext+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.3gpp.srvcc-info+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.3gpp.state-and-event-info+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.3gpp.ussd+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.3gpp2.bcmcsinfo+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.3gpp2.sms": {
          source: "iana"
        },
        "application/vnd.3gpp2.tcap": {
          source: "iana",
          extensions: ["tcap"]
        },
        "application/vnd.3lightssoftware.imagescal": {
          source: "iana"
        },
        "application/vnd.3m.post-it-notes": {
          source: "iana",
          extensions: ["pwn"]
        },
        "application/vnd.accpac.simply.aso": {
          source: "iana",
          extensions: ["aso"]
        },
        "application/vnd.accpac.simply.imp": {
          source: "iana",
          extensions: ["imp"]
        },
        "application/vnd.acucobol": {
          source: "iana",
          extensions: ["acu"]
        },
        "application/vnd.acucorp": {
          source: "iana",
          extensions: ["atc", "acutc"]
        },
        "application/vnd.adobe.air-application-installer-package+zip": {
          source: "apache",
          compressible: false,
          extensions: ["air"]
        },
        "application/vnd.adobe.flash.movie": {
          source: "iana"
        },
        "application/vnd.adobe.formscentral.fcdt": {
          source: "iana",
          extensions: ["fcdt"]
        },
        "application/vnd.adobe.fxp": {
          source: "iana",
          extensions: ["fxp", "fxpl"]
        },
        "application/vnd.adobe.partial-upload": {
          source: "iana"
        },
        "application/vnd.adobe.xdp+xml": {
          source: "iana",
          compressible: true,
          extensions: ["xdp"]
        },
        "application/vnd.adobe.xfdf": {
          source: "iana",
          extensions: ["xfdf"]
        },
        "application/vnd.aether.imp": {
          source: "iana"
        },
        "application/vnd.afpc.afplinedata": {
          source: "iana"
        },
        "application/vnd.afpc.afplinedata-pagedef": {
          source: "iana"
        },
        "application/vnd.afpc.cmoca-cmresource": {
          source: "iana"
        },
        "application/vnd.afpc.foca-charset": {
          source: "iana"
        },
        "application/vnd.afpc.foca-codedfont": {
          source: "iana"
        },
        "application/vnd.afpc.foca-codepage": {
          source: "iana"
        },
        "application/vnd.afpc.modca": {
          source: "iana"
        },
        "application/vnd.afpc.modca-cmtable": {
          source: "iana"
        },
        "application/vnd.afpc.modca-formdef": {
          source: "iana"
        },
        "application/vnd.afpc.modca-mediummap": {
          source: "iana"
        },
        "application/vnd.afpc.modca-objectcontainer": {
          source: "iana"
        },
        "application/vnd.afpc.modca-overlay": {
          source: "iana"
        },
        "application/vnd.afpc.modca-pagesegment": {
          source: "iana"
        },
        "application/vnd.age": {
          source: "iana",
          extensions: ["age"]
        },
        "application/vnd.ah-barcode": {
          source: "iana"
        },
        "application/vnd.ahead.space": {
          source: "iana",
          extensions: ["ahead"]
        },
        "application/vnd.airzip.filesecure.azf": {
          source: "iana",
          extensions: ["azf"]
        },
        "application/vnd.airzip.filesecure.azs": {
          source: "iana",
          extensions: ["azs"]
        },
        "application/vnd.amadeus+json": {
          source: "iana",
          compressible: true
        },
        "application/vnd.amazon.ebook": {
          source: "apache",
          extensions: ["azw"]
        },
        "application/vnd.amazon.mobi8-ebook": {
          source: "iana"
        },
        "application/vnd.americandynamics.acc": {
          source: "iana",
          extensions: ["acc"]
        },
        "application/vnd.amiga.ami": {
          source: "iana",
          extensions: ["ami"]
        },
        "application/vnd.amundsen.maze+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.android.ota": {
          source: "iana"
        },
        "application/vnd.android.package-archive": {
          source: "apache",
          compressible: false,
          extensions: ["apk"]
        },
        "application/vnd.anki": {
          source: "iana"
        },
        "application/vnd.anser-web-certificate-issue-initiation": {
          source: "iana",
          extensions: ["cii"]
        },
        "application/vnd.anser-web-funds-transfer-initiation": {
          source: "apache",
          extensions: ["fti"]
        },
        "application/vnd.antix.game-component": {
          source: "iana",
          extensions: ["atx"]
        },
        "application/vnd.apache.arrow.file": {
          source: "iana"
        },
        "application/vnd.apache.arrow.stream": {
          source: "iana"
        },
        "application/vnd.apache.thrift.binary": {
          source: "iana"
        },
        "application/vnd.apache.thrift.compact": {
          source: "iana"
        },
        "application/vnd.apache.thrift.json": {
          source: "iana"
        },
        "application/vnd.api+json": {
          source: "iana",
          compressible: true
        },
        "application/vnd.aplextor.warrp+json": {
          source: "iana",
          compressible: true
        },
        "application/vnd.apothekende.reservation+json": {
          source: "iana",
          compressible: true
        },
        "application/vnd.apple.installer+xml": {
          source: "iana",
          compressible: true,
          extensions: ["mpkg"]
        },
        "application/vnd.apple.keynote": {
          source: "iana",
          extensions: ["key"]
        },
        "application/vnd.apple.mpegurl": {
          source: "iana",
          extensions: ["m3u8"]
        },
        "application/vnd.apple.numbers": {
          source: "iana",
          extensions: ["numbers"]
        },
        "application/vnd.apple.pages": {
          source: "iana",
          extensions: ["pages"]
        },
        "application/vnd.apple.pkpass": {
          compressible: false,
          extensions: ["pkpass"]
        },
        "application/vnd.arastra.swi": {
          source: "iana"
        },
        "application/vnd.aristanetworks.swi": {
          source: "iana",
          extensions: ["swi"]
        },
        "application/vnd.artisan+json": {
          source: "iana",
          compressible: true
        },
        "application/vnd.artsquare": {
          source: "iana"
        },
        "application/vnd.astraea-software.iota": {
          source: "iana",
          extensions: ["iota"]
        },
        "application/vnd.audiograph": {
          source: "iana",
          extensions: ["aep"]
        },
        "application/vnd.autopackage": {
          source: "iana"
        },
        "application/vnd.avalon+json": {
          source: "iana",
          compressible: true
        },
        "application/vnd.avistar+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.balsamiq.bmml+xml": {
          source: "iana",
          compressible: true,
          extensions: ["bmml"]
        },
        "application/vnd.balsamiq.bmpr": {
          source: "iana"
        },
        "application/vnd.banana-accounting": {
          source: "iana"
        },
        "application/vnd.bbf.usp.error": {
          source: "iana"
        },
        "application/vnd.bbf.usp.msg": {
          source: "iana"
        },
        "application/vnd.bbf.usp.msg+json": {
          source: "iana",
          compressible: true
        },
        "application/vnd.bekitzur-stech+json": {
          source: "iana",
          compressible: true
        },
        "application/vnd.bint.med-content": {
          source: "iana"
        },
        "application/vnd.biopax.rdf+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.blink-idb-value-wrapper": {
          source: "iana"
        },
        "application/vnd.blueice.multipass": {
          source: "iana",
          extensions: ["mpm"]
        },
        "application/vnd.bluetooth.ep.oob": {
          source: "iana"
        },
        "application/vnd.bluetooth.le.oob": {
          source: "iana"
        },
        "application/vnd.bmi": {
          source: "iana",
          extensions: ["bmi"]
        },
        "application/vnd.bpf": {
          source: "iana"
        },
        "application/vnd.bpf3": {
          source: "iana"
        },
        "application/vnd.businessobjects": {
          source: "iana",
          extensions: ["rep"]
        },
        "application/vnd.byu.uapi+json": {
          source: "iana",
          compressible: true
        },
        "application/vnd.cab-jscript": {
          source: "iana"
        },
        "application/vnd.canon-cpdl": {
          source: "iana"
        },
        "application/vnd.canon-lips": {
          source: "iana"
        },
        "application/vnd.capasystems-pg+json": {
          source: "iana",
          compressible: true
        },
        "application/vnd.cendio.thinlinc.clientconf": {
          source: "iana"
        },
        "application/vnd.century-systems.tcp_stream": {
          source: "iana"
        },
        "application/vnd.chemdraw+xml": {
          source: "iana",
          compressible: true,
          extensions: ["cdxml"]
        },
        "application/vnd.chess-pgn": {
          source: "iana"
        },
        "application/vnd.chipnuts.karaoke-mmd": {
          source: "iana",
          extensions: ["mmd"]
        },
        "application/vnd.ciedi": {
          source: "iana"
        },
        "application/vnd.cinderella": {
          source: "iana",
          extensions: ["cdy"]
        },
        "application/vnd.cirpack.isdn-ext": {
          source: "iana"
        },
        "application/vnd.citationstyles.style+xml": {
          source: "iana",
          compressible: true,
          extensions: ["csl"]
        },
        "application/vnd.claymore": {
          source: "iana",
          extensions: ["cla"]
        },
        "application/vnd.cloanto.rp9": {
          source: "iana",
          extensions: ["rp9"]
        },
        "application/vnd.clonk.c4group": {
          source: "iana",
          extensions: ["c4g", "c4d", "c4f", "c4p", "c4u"]
        },
        "application/vnd.cluetrust.cartomobile-config": {
          source: "iana",
          extensions: ["c11amc"]
        },
        "application/vnd.cluetrust.cartomobile-config-pkg": {
          source: "iana",
          extensions: ["c11amz"]
        },
        "application/vnd.coffeescript": {
          source: "iana"
        },
        "application/vnd.collabio.xodocuments.document": {
          source: "iana"
        },
        "application/vnd.collabio.xodocuments.document-template": {
          source: "iana"
        },
        "application/vnd.collabio.xodocuments.presentation": {
          source: "iana"
        },
        "application/vnd.collabio.xodocuments.presentation-template": {
          source: "iana"
        },
        "application/vnd.collabio.xodocuments.spreadsheet": {
          source: "iana"
        },
        "application/vnd.collabio.xodocuments.spreadsheet-template": {
          source: "iana"
        },
        "application/vnd.collection+json": {
          source: "iana",
          compressible: true
        },
        "application/vnd.collection.doc+json": {
          source: "iana",
          compressible: true
        },
        "application/vnd.collection.next+json": {
          source: "iana",
          compressible: true
        },
        "application/vnd.comicbook+zip": {
          source: "iana",
          compressible: false
        },
        "application/vnd.comicbook-rar": {
          source: "iana"
        },
        "application/vnd.commerce-battelle": {
          source: "iana"
        },
        "application/vnd.commonspace": {
          source: "iana",
          extensions: ["csp"]
        },
        "application/vnd.contact.cmsg": {
          source: "iana",
          extensions: ["cdbcmsg"]
        },
        "application/vnd.coreos.ignition+json": {
          source: "iana",
          compressible: true
        },
        "application/vnd.cosmocaller": {
          source: "iana",
          extensions: ["cmc"]
        },
        "application/vnd.crick.clicker": {
          source: "iana",
          extensions: ["clkx"]
        },
        "application/vnd.crick.clicker.keyboard": {
          source: "iana",
          extensions: ["clkk"]
        },
        "application/vnd.crick.clicker.palette": {
          source: "iana",
          extensions: ["clkp"]
        },
        "application/vnd.crick.clicker.template": {
          source: "iana",
          extensions: ["clkt"]
        },
        "application/vnd.crick.clicker.wordbank": {
          source: "iana",
          extensions: ["clkw"]
        },
        "application/vnd.criticaltools.wbs+xml": {
          source: "iana",
          compressible: true,
          extensions: ["wbs"]
        },
        "application/vnd.cryptii.pipe+json": {
          source: "iana",
          compressible: true
        },
        "application/vnd.crypto-shade-file": {
          source: "iana"
        },
        "application/vnd.cryptomator.encrypted": {
          source: "iana"
        },
        "application/vnd.cryptomator.vault": {
          source: "iana"
        },
        "application/vnd.ctc-posml": {
          source: "iana",
          extensions: ["pml"]
        },
        "application/vnd.ctct.ws+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.cups-pdf": {
          source: "iana"
        },
        "application/vnd.cups-postscript": {
          source: "iana"
        },
        "application/vnd.cups-ppd": {
          source: "iana",
          extensions: ["ppd"]
        },
        "application/vnd.cups-raster": {
          source: "iana"
        },
        "application/vnd.cups-raw": {
          source: "iana"
        },
        "application/vnd.curl": {
          source: "iana"
        },
        "application/vnd.curl.car": {
          source: "apache",
          extensions: ["car"]
        },
        "application/vnd.curl.pcurl": {
          source: "apache",
          extensions: ["pcurl"]
        },
        "application/vnd.cyan.dean.root+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.cybank": {
          source: "iana"
        },
        "application/vnd.cyclonedx+json": {
          source: "iana",
          compressible: true
        },
        "application/vnd.cyclonedx+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.d2l.coursepackage1p0+zip": {
          source: "iana",
          compressible: false
        },
        "application/vnd.d3m-dataset": {
          source: "iana"
        },
        "application/vnd.d3m-problem": {
          source: "iana"
        },
        "application/vnd.dart": {
          source: "iana",
          compressible: true,
          extensions: ["dart"]
        },
        "application/vnd.data-vision.rdz": {
          source: "iana",
          extensions: ["rdz"]
        },
        "application/vnd.datapackage+json": {
          source: "iana",
          compressible: true
        },
        "application/vnd.dataresource+json": {
          source: "iana",
          compressible: true
        },
        "application/vnd.dbf": {
          source: "iana",
          extensions: ["dbf"]
        },
        "application/vnd.debian.binary-package": {
          source: "iana"
        },
        "application/vnd.dece.data": {
          source: "iana",
          extensions: ["uvf", "uvvf", "uvd", "uvvd"]
        },
        "application/vnd.dece.ttml+xml": {
          source: "iana",
          compressible: true,
          extensions: ["uvt", "uvvt"]
        },
        "application/vnd.dece.unspecified": {
          source: "iana",
          extensions: ["uvx", "uvvx"]
        },
        "application/vnd.dece.zip": {
          source: "iana",
          extensions: ["uvz", "uvvz"]
        },
        "application/vnd.denovo.fcselayout-link": {
          source: "iana",
          extensions: ["fe_launch"]
        },
        "application/vnd.desmume.movie": {
          source: "iana"
        },
        "application/vnd.dir-bi.plate-dl-nosuffix": {
          source: "iana"
        },
        "application/vnd.dm.delegation+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.dna": {
          source: "iana",
          extensions: ["dna"]
        },
        "application/vnd.document+json": {
          source: "iana",
          compressible: true
        },
        "application/vnd.dolby.mlp": {
          source: "apache",
          extensions: ["mlp"]
        },
        "application/vnd.dolby.mobile.1": {
          source: "iana"
        },
        "application/vnd.dolby.mobile.2": {
          source: "iana"
        },
        "application/vnd.doremir.scorecloud-binary-document": {
          source: "iana"
        },
        "application/vnd.dpgraph": {
          source: "iana",
          extensions: ["dpg"]
        },
        "application/vnd.dreamfactory": {
          source: "iana",
          extensions: ["dfac"]
        },
        "application/vnd.drive+json": {
          source: "iana",
          compressible: true
        },
        "application/vnd.ds-keypoint": {
          source: "apache",
          extensions: ["kpxx"]
        },
        "application/vnd.dtg.local": {
          source: "iana"
        },
        "application/vnd.dtg.local.flash": {
          source: "iana"
        },
        "application/vnd.dtg.local.html": {
          source: "iana"
        },
        "application/vnd.dvb.ait": {
          source: "iana",
          extensions: ["ait"]
        },
        "application/vnd.dvb.dvbisl+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.dvb.dvbj": {
          source: "iana"
        },
        "application/vnd.dvb.esgcontainer": {
          source: "iana"
        },
        "application/vnd.dvb.ipdcdftnotifaccess": {
          source: "iana"
        },
        "application/vnd.dvb.ipdcesgaccess": {
          source: "iana"
        },
        "application/vnd.dvb.ipdcesgaccess2": {
          source: "iana"
        },
        "application/vnd.dvb.ipdcesgpdd": {
          source: "iana"
        },
        "application/vnd.dvb.ipdcroaming": {
          source: "iana"
        },
        "application/vnd.dvb.iptv.alfec-base": {
          source: "iana"
        },
        "application/vnd.dvb.iptv.alfec-enhancement": {
          source: "iana"
        },
        "application/vnd.dvb.notif-aggregate-root+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.dvb.notif-container+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.dvb.notif-generic+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.dvb.notif-ia-msglist+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.dvb.notif-ia-registration-request+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.dvb.notif-ia-registration-response+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.dvb.notif-init+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.dvb.pfr": {
          source: "iana"
        },
        "application/vnd.dvb.service": {
          source: "iana",
          extensions: ["svc"]
        },
        "application/vnd.dxr": {
          source: "iana"
        },
        "application/vnd.dynageo": {
          source: "iana",
          extensions: ["geo"]
        },
        "application/vnd.dzr": {
          source: "iana"
        },
        "application/vnd.easykaraoke.cdgdownload": {
          source: "iana"
        },
        "application/vnd.ecdis-update": {
          source: "iana"
        },
        "application/vnd.ecip.rlp": {
          source: "iana"
        },
        "application/vnd.eclipse.ditto+json": {
          source: "iana",
          compressible: true
        },
        "application/vnd.ecowin.chart": {
          source: "iana",
          extensions: ["mag"]
        },
        "application/vnd.ecowin.filerequest": {
          source: "iana"
        },
        "application/vnd.ecowin.fileupdate": {
          source: "iana"
        },
        "application/vnd.ecowin.series": {
          source: "iana"
        },
        "application/vnd.ecowin.seriesrequest": {
          source: "iana"
        },
        "application/vnd.ecowin.seriesupdate": {
          source: "iana"
        },
        "application/vnd.efi.img": {
          source: "iana"
        },
        "application/vnd.efi.iso": {
          source: "iana"
        },
        "application/vnd.emclient.accessrequest+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.enliven": {
          source: "iana",
          extensions: ["nml"]
        },
        "application/vnd.enphase.envoy": {
          source: "iana"
        },
        "application/vnd.eprints.data+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.epson.esf": {
          source: "iana",
          extensions: ["esf"]
        },
        "application/vnd.epson.msf": {
          source: "iana",
          extensions: ["msf"]
        },
        "application/vnd.epson.quickanime": {
          source: "iana",
          extensions: ["qam"]
        },
        "application/vnd.epson.salt": {
          source: "iana",
          extensions: ["slt"]
        },
        "application/vnd.epson.ssf": {
          source: "iana",
          extensions: ["ssf"]
        },
        "application/vnd.ericsson.quickcall": {
          source: "iana"
        },
        "application/vnd.espass-espass+zip": {
          source: "iana",
          compressible: false
        },
        "application/vnd.eszigno3+xml": {
          source: "iana",
          compressible: true,
          extensions: ["es3", "et3"]
        },
        "application/vnd.etsi.aoc+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.etsi.asic-e+zip": {
          source: "iana",
          compressible: false
        },
        "application/vnd.etsi.asic-s+zip": {
          source: "iana",
          compressible: false
        },
        "application/vnd.etsi.cug+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.etsi.iptvcommand+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.etsi.iptvdiscovery+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.etsi.iptvprofile+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.etsi.iptvsad-bc+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.etsi.iptvsad-cod+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.etsi.iptvsad-npvr+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.etsi.iptvservice+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.etsi.iptvsync+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.etsi.iptvueprofile+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.etsi.mcid+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.etsi.mheg5": {
          source: "iana"
        },
        "application/vnd.etsi.overload-control-policy-dataset+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.etsi.pstn+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.etsi.sci+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.etsi.simservs+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.etsi.timestamp-token": {
          source: "iana"
        },
        "application/vnd.etsi.tsl+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.etsi.tsl.der": {
          source: "iana"
        },
        "application/vnd.eu.kasparian.car+json": {
          source: "iana",
          compressible: true
        },
        "application/vnd.eudora.data": {
          source: "iana"
        },
        "application/vnd.evolv.ecig.profile": {
          source: "iana"
        },
        "application/vnd.evolv.ecig.settings": {
          source: "iana"
        },
        "application/vnd.evolv.ecig.theme": {
          source: "iana"
        },
        "application/vnd.exstream-empower+zip": {
          source: "iana",
          compressible: false
        },
        "application/vnd.exstream-package": {
          source: "iana"
        },
        "application/vnd.ezpix-album": {
          source: "iana",
          extensions: ["ez2"]
        },
        "application/vnd.ezpix-package": {
          source: "iana",
          extensions: ["ez3"]
        },
        "application/vnd.f-secure.mobile": {
          source: "iana"
        },
        "application/vnd.familysearch.gedcom+zip": {
          source: "iana",
          compressible: false
        },
        "application/vnd.fastcopy-disk-image": {
          source: "iana"
        },
        "application/vnd.fdf": {
          source: "iana",
          extensions: ["fdf"]
        },
        "application/vnd.fdsn.mseed": {
          source: "iana",
          extensions: ["mseed"]
        },
        "application/vnd.fdsn.seed": {
          source: "iana",
          extensions: ["seed", "dataless"]
        },
        "application/vnd.ffsns": {
          source: "iana"
        },
        "application/vnd.ficlab.flb+zip": {
          source: "iana",
          compressible: false
        },
        "application/vnd.filmit.zfc": {
          source: "iana"
        },
        "application/vnd.fints": {
          source: "iana"
        },
        "application/vnd.firemonkeys.cloudcell": {
          source: "iana"
        },
        "application/vnd.flographit": {
          source: "iana",
          extensions: ["gph"]
        },
        "application/vnd.fluxtime.clip": {
          source: "iana",
          extensions: ["ftc"]
        },
        "application/vnd.font-fontforge-sfd": {
          source: "iana"
        },
        "application/vnd.framemaker": {
          source: "iana",
          extensions: ["fm", "frame", "maker", "book"]
        },
        "application/vnd.frogans.fnc": {
          source: "iana",
          extensions: ["fnc"]
        },
        "application/vnd.frogans.ltf": {
          source: "iana",
          extensions: ["ltf"]
        },
        "application/vnd.fsc.weblaunch": {
          source: "iana",
          extensions: ["fsc"]
        },
        "application/vnd.fujifilm.fb.docuworks": {
          source: "iana"
        },
        "application/vnd.fujifilm.fb.docuworks.binder": {
          source: "iana"
        },
        "application/vnd.fujifilm.fb.docuworks.container": {
          source: "iana"
        },
        "application/vnd.fujifilm.fb.jfi+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.fujitsu.oasys": {
          source: "iana",
          extensions: ["oas"]
        },
        "application/vnd.fujitsu.oasys2": {
          source: "iana",
          extensions: ["oa2"]
        },
        "application/vnd.fujitsu.oasys3": {
          source: "iana",
          extensions: ["oa3"]
        },
        "application/vnd.fujitsu.oasysgp": {
          source: "iana",
          extensions: ["fg5"]
        },
        "application/vnd.fujitsu.oasysprs": {
          source: "iana",
          extensions: ["bh2"]
        },
        "application/vnd.fujixerox.art-ex": {
          source: "iana"
        },
        "application/vnd.fujixerox.art4": {
          source: "iana"
        },
        "application/vnd.fujixerox.ddd": {
          source: "iana",
          extensions: ["ddd"]
        },
        "application/vnd.fujixerox.docuworks": {
          source: "iana",
          extensions: ["xdw"]
        },
        "application/vnd.fujixerox.docuworks.binder": {
          source: "iana",
          extensions: ["xbd"]
        },
        "application/vnd.fujixerox.docuworks.container": {
          source: "iana"
        },
        "application/vnd.fujixerox.hbpl": {
          source: "iana"
        },
        "application/vnd.fut-misnet": {
          source: "iana"
        },
        "application/vnd.futoin+cbor": {
          source: "iana"
        },
        "application/vnd.futoin+json": {
          source: "iana",
          compressible: true
        },
        "application/vnd.fuzzysheet": {
          source: "iana",
          extensions: ["fzs"]
        },
        "application/vnd.genomatix.tuxedo": {
          source: "iana",
          extensions: ["txd"]
        },
        "application/vnd.gentics.grd+json": {
          source: "iana",
          compressible: true
        },
        "application/vnd.geo+json": {
          source: "iana",
          compressible: true
        },
        "application/vnd.geocube+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.geogebra.file": {
          source: "iana",
          extensions: ["ggb"]
        },
        "application/vnd.geogebra.slides": {
          source: "iana"
        },
        "application/vnd.geogebra.tool": {
          source: "iana",
          extensions: ["ggt"]
        },
        "application/vnd.geometry-explorer": {
          source: "iana",
          extensions: ["gex", "gre"]
        },
        "application/vnd.geonext": {
          source: "iana",
          extensions: ["gxt"]
        },
        "application/vnd.geoplan": {
          source: "iana",
          extensions: ["g2w"]
        },
        "application/vnd.geospace": {
          source: "iana",
          extensions: ["g3w"]
        },
        "application/vnd.gerber": {
          source: "iana"
        },
        "application/vnd.globalplatform.card-content-mgt": {
          source: "iana"
        },
        "application/vnd.globalplatform.card-content-mgt-response": {
          source: "iana"
        },
        "application/vnd.gmx": {
          source: "iana",
          extensions: ["gmx"]
        },
        "application/vnd.google-apps.document": {
          compressible: false,
          extensions: ["gdoc"]
        },
        "application/vnd.google-apps.presentation": {
          compressible: false,
          extensions: ["gslides"]
        },
        "application/vnd.google-apps.spreadsheet": {
          compressible: false,
          extensions: ["gsheet"]
        },
        "application/vnd.google-earth.kml+xml": {
          source: "iana",
          compressible: true,
          extensions: ["kml"]
        },
        "application/vnd.google-earth.kmz": {
          source: "iana",
          compressible: false,
          extensions: ["kmz"]
        },
        "application/vnd.gov.sk.e-form+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.gov.sk.e-form+zip": {
          source: "iana",
          compressible: false
        },
        "application/vnd.gov.sk.xmldatacontainer+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.grafeq": {
          source: "iana",
          extensions: ["gqf", "gqs"]
        },
        "application/vnd.gridmp": {
          source: "iana"
        },
        "application/vnd.groove-account": {
          source: "iana",
          extensions: ["gac"]
        },
        "application/vnd.groove-help": {
          source: "iana",
          extensions: ["ghf"]
        },
        "application/vnd.groove-identity-message": {
          source: "iana",
          extensions: ["gim"]
        },
        "application/vnd.groove-injector": {
          source: "iana",
          extensions: ["grv"]
        },
        "application/vnd.groove-tool-message": {
          source: "iana",
          extensions: ["gtm"]
        },
        "application/vnd.groove-tool-template": {
          source: "iana",
          extensions: ["tpl"]
        },
        "application/vnd.groove-vcard": {
          source: "iana",
          extensions: ["vcg"]
        },
        "application/vnd.hal+json": {
          source: "iana",
          compressible: true
        },
        "application/vnd.hal+xml": {
          source: "iana",
          compressible: true,
          extensions: ["hal"]
        },
        "application/vnd.handheld-entertainment+xml": {
          source: "iana",
          compressible: true,
          extensions: ["zmm"]
        },
        "application/vnd.hbci": {
          source: "iana",
          extensions: ["hbci"]
        },
        "application/vnd.hc+json": {
          source: "iana",
          compressible: true
        },
        "application/vnd.hcl-bireports": {
          source: "iana"
        },
        "application/vnd.hdt": {
          source: "iana"
        },
        "application/vnd.heroku+json": {
          source: "iana",
          compressible: true
        },
        "application/vnd.hhe.lesson-player": {
          source: "iana",
          extensions: ["les"]
        },
        "application/vnd.hl7cda+xml": {
          source: "iana",
          charset: "UTF-8",
          compressible: true
        },
        "application/vnd.hl7v2+xml": {
          source: "iana",
          charset: "UTF-8",
          compressible: true
        },
        "application/vnd.hp-hpgl": {
          source: "iana",
          extensions: ["hpgl"]
        },
        "application/vnd.hp-hpid": {
          source: "iana",
          extensions: ["hpid"]
        },
        "application/vnd.hp-hps": {
          source: "iana",
          extensions: ["hps"]
        },
        "application/vnd.hp-jlyt": {
          source: "iana",
          extensions: ["jlt"]
        },
        "application/vnd.hp-pcl": {
          source: "iana",
          extensions: ["pcl"]
        },
        "application/vnd.hp-pclxl": {
          source: "iana",
          extensions: ["pclxl"]
        },
        "application/vnd.httphone": {
          source: "iana"
        },
        "application/vnd.hydrostatix.sof-data": {
          source: "iana",
          extensions: ["sfd-hdstx"]
        },
        "application/vnd.hyper+json": {
          source: "iana",
          compressible: true
        },
        "application/vnd.hyper-item+json": {
          source: "iana",
          compressible: true
        },
        "application/vnd.hyperdrive+json": {
          source: "iana",
          compressible: true
        },
        "application/vnd.hzn-3d-crossword": {
          source: "iana"
        },
        "application/vnd.ibm.afplinedata": {
          source: "iana"
        },
        "application/vnd.ibm.electronic-media": {
          source: "iana"
        },
        "application/vnd.ibm.minipay": {
          source: "iana",
          extensions: ["mpy"]
        },
        "application/vnd.ibm.modcap": {
          source: "iana",
          extensions: ["afp", "listafp", "list3820"]
        },
        "application/vnd.ibm.rights-management": {
          source: "iana",
          extensions: ["irm"]
        },
        "application/vnd.ibm.secure-container": {
          source: "iana",
          extensions: ["sc"]
        },
        "application/vnd.iccprofile": {
          source: "iana",
          extensions: ["icc", "icm"]
        },
        "application/vnd.ieee.1905": {
          source: "iana"
        },
        "application/vnd.igloader": {
          source: "iana",
          extensions: ["igl"]
        },
        "application/vnd.imagemeter.folder+zip": {
          source: "iana",
          compressible: false
        },
        "application/vnd.imagemeter.image+zip": {
          source: "iana",
          compressible: false
        },
        "application/vnd.immervision-ivp": {
          source: "iana",
          extensions: ["ivp"]
        },
        "application/vnd.immervision-ivu": {
          source: "iana",
          extensions: ["ivu"]
        },
        "application/vnd.ims.imsccv1p1": {
          source: "iana"
        },
        "application/vnd.ims.imsccv1p2": {
          source: "iana"
        },
        "application/vnd.ims.imsccv1p3": {
          source: "iana"
        },
        "application/vnd.ims.lis.v2.result+json": {
          source: "iana",
          compressible: true
        },
        "application/vnd.ims.lti.v2.toolconsumerprofile+json": {
          source: "iana",
          compressible: true
        },
        "application/vnd.ims.lti.v2.toolproxy+json": {
          source: "iana",
          compressible: true
        },
        "application/vnd.ims.lti.v2.toolproxy.id+json": {
          source: "iana",
          compressible: true
        },
        "application/vnd.ims.lti.v2.toolsettings+json": {
          source: "iana",
          compressible: true
        },
        "application/vnd.ims.lti.v2.toolsettings.simple+json": {
          source: "iana",
          compressible: true
        },
        "application/vnd.informedcontrol.rms+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.informix-visionary": {
          source: "iana"
        },
        "application/vnd.infotech.project": {
          source: "iana"
        },
        "application/vnd.infotech.project+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.innopath.wamp.notification": {
          source: "iana"
        },
        "application/vnd.insors.igm": {
          source: "iana",
          extensions: ["igm"]
        },
        "application/vnd.intercon.formnet": {
          source: "iana",
          extensions: ["xpw", "xpx"]
        },
        "application/vnd.intergeo": {
          source: "iana",
          extensions: ["i2g"]
        },
        "application/vnd.intertrust.digibox": {
          source: "iana"
        },
        "application/vnd.intertrust.nncp": {
          source: "iana"
        },
        "application/vnd.intu.qbo": {
          source: "iana",
          extensions: ["qbo"]
        },
        "application/vnd.intu.qfx": {
          source: "iana",
          extensions: ["qfx"]
        },
        "application/vnd.iptc.g2.catalogitem+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.iptc.g2.conceptitem+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.iptc.g2.knowledgeitem+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.iptc.g2.newsitem+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.iptc.g2.newsmessage+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.iptc.g2.packageitem+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.iptc.g2.planningitem+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.ipunplugged.rcprofile": {
          source: "iana",
          extensions: ["rcprofile"]
        },
        "application/vnd.irepository.package+xml": {
          source: "iana",
          compressible: true,
          extensions: ["irp"]
        },
        "application/vnd.is-xpr": {
          source: "iana",
          extensions: ["xpr"]
        },
        "application/vnd.isac.fcs": {
          source: "iana",
          extensions: ["fcs"]
        },
        "application/vnd.iso11783-10+zip": {
          source: "iana",
          compressible: false
        },
        "application/vnd.jam": {
          source: "iana",
          extensions: ["jam"]
        },
        "application/vnd.japannet-directory-service": {
          source: "iana"
        },
        "application/vnd.japannet-jpnstore-wakeup": {
          source: "iana"
        },
        "application/vnd.japannet-payment-wakeup": {
          source: "iana"
        },
        "application/vnd.japannet-registration": {
          source: "iana"
        },
        "application/vnd.japannet-registration-wakeup": {
          source: "iana"
        },
        "application/vnd.japannet-setstore-wakeup": {
          source: "iana"
        },
        "application/vnd.japannet-verification": {
          source: "iana"
        },
        "application/vnd.japannet-verification-wakeup": {
          source: "iana"
        },
        "application/vnd.jcp.javame.midlet-rms": {
          source: "iana",
          extensions: ["rms"]
        },
        "application/vnd.jisp": {
          source: "iana",
          extensions: ["jisp"]
        },
        "application/vnd.joost.joda-archive": {
          source: "iana",
          extensions: ["joda"]
        },
        "application/vnd.jsk.isdn-ngn": {
          source: "iana"
        },
        "application/vnd.kahootz": {
          source: "iana",
          extensions: ["ktz", "ktr"]
        },
        "application/vnd.kde.karbon": {
          source: "iana",
          extensions: ["karbon"]
        },
        "application/vnd.kde.kchart": {
          source: "iana",
          extensions: ["chrt"]
        },
        "application/vnd.kde.kformula": {
          source: "iana",
          extensions: ["kfo"]
        },
        "application/vnd.kde.kivio": {
          source: "iana",
          extensions: ["flw"]
        },
        "application/vnd.kde.kontour": {
          source: "iana",
          extensions: ["kon"]
        },
        "application/vnd.kde.kpresenter": {
          source: "iana",
          extensions: ["kpr", "kpt"]
        },
        "application/vnd.kde.kspread": {
          source: "iana",
          extensions: ["ksp"]
        },
        "application/vnd.kde.kword": {
          source: "iana",
          extensions: ["kwd", "kwt"]
        },
        "application/vnd.kenameaapp": {
          source: "iana",
          extensions: ["htke"]
        },
        "application/vnd.kidspiration": {
          source: "iana",
          extensions: ["kia"]
        },
        "application/vnd.kinar": {
          source: "iana",
          extensions: ["kne", "knp"]
        },
        "application/vnd.koan": {
          source: "iana",
          extensions: ["skp", "skd", "skt", "skm"]
        },
        "application/vnd.kodak-descriptor": {
          source: "iana",
          extensions: ["sse"]
        },
        "application/vnd.las": {
          source: "iana"
        },
        "application/vnd.las.las+json": {
          source: "iana",
          compressible: true
        },
        "application/vnd.las.las+xml": {
          source: "iana",
          compressible: true,
          extensions: ["lasxml"]
        },
        "application/vnd.laszip": {
          source: "iana"
        },
        "application/vnd.leap+json": {
          source: "iana",
          compressible: true
        },
        "application/vnd.liberty-request+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.llamagraphics.life-balance.desktop": {
          source: "iana",
          extensions: ["lbd"]
        },
        "application/vnd.llamagraphics.life-balance.exchange+xml": {
          source: "iana",
          compressible: true,
          extensions: ["lbe"]
        },
        "application/vnd.logipipe.circuit+zip": {
          source: "iana",
          compressible: false
        },
        "application/vnd.loom": {
          source: "iana"
        },
        "application/vnd.lotus-1-2-3": {
          source: "iana",
          extensions: ["123"]
        },
        "application/vnd.lotus-approach": {
          source: "iana",
          extensions: ["apr"]
        },
        "application/vnd.lotus-freelance": {
          source: "iana",
          extensions: ["pre"]
        },
        "application/vnd.lotus-notes": {
          source: "iana",
          extensions: ["nsf"]
        },
        "application/vnd.lotus-organizer": {
          source: "iana",
          extensions: ["org"]
        },
        "application/vnd.lotus-screencam": {
          source: "iana",
          extensions: ["scm"]
        },
        "application/vnd.lotus-wordpro": {
          source: "iana",
          extensions: ["lwp"]
        },
        "application/vnd.macports.portpkg": {
          source: "iana",
          extensions: ["portpkg"]
        },
        "application/vnd.mapbox-vector-tile": {
          source: "iana",
          extensions: ["mvt"]
        },
        "application/vnd.marlin.drm.actiontoken+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.marlin.drm.conftoken+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.marlin.drm.license+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.marlin.drm.mdcf": {
          source: "iana"
        },
        "application/vnd.mason+json": {
          source: "iana",
          compressible: true
        },
        "application/vnd.maxar.archive.3tz+zip": {
          source: "iana",
          compressible: false
        },
        "application/vnd.maxmind.maxmind-db": {
          source: "iana"
        },
        "application/vnd.mcd": {
          source: "iana",
          extensions: ["mcd"]
        },
        "application/vnd.medcalcdata": {
          source: "iana",
          extensions: ["mc1"]
        },
        "application/vnd.mediastation.cdkey": {
          source: "iana",
          extensions: ["cdkey"]
        },
        "application/vnd.meridian-slingshot": {
          source: "iana"
        },
        "application/vnd.mfer": {
          source: "iana",
          extensions: ["mwf"]
        },
        "application/vnd.mfmp": {
          source: "iana",
          extensions: ["mfm"]
        },
        "application/vnd.micro+json": {
          source: "iana",
          compressible: true
        },
        "application/vnd.micrografx.flo": {
          source: "iana",
          extensions: ["flo"]
        },
        "application/vnd.micrografx.igx": {
          source: "iana",
          extensions: ["igx"]
        },
        "application/vnd.microsoft.portable-executable": {
          source: "iana"
        },
        "application/vnd.microsoft.windows.thumbnail-cache": {
          source: "iana"
        },
        "application/vnd.miele+json": {
          source: "iana",
          compressible: true
        },
        "application/vnd.mif": {
          source: "iana",
          extensions: ["mif"]
        },
        "application/vnd.minisoft-hp3000-save": {
          source: "iana"
        },
        "application/vnd.mitsubishi.misty-guard.trustweb": {
          source: "iana"
        },
        "application/vnd.mobius.daf": {
          source: "iana",
          extensions: ["daf"]
        },
        "application/vnd.mobius.dis": {
          source: "iana",
          extensions: ["dis"]
        },
        "application/vnd.mobius.mbk": {
          source: "iana",
          extensions: ["mbk"]
        },
        "application/vnd.mobius.mqy": {
          source: "iana",
          extensions: ["mqy"]
        },
        "application/vnd.mobius.msl": {
          source: "iana",
          extensions: ["msl"]
        },
        "application/vnd.mobius.plc": {
          source: "iana",
          extensions: ["plc"]
        },
        "application/vnd.mobius.txf": {
          source: "iana",
          extensions: ["txf"]
        },
        "application/vnd.mophun.application": {
          source: "iana",
          extensions: ["mpn"]
        },
        "application/vnd.mophun.certificate": {
          source: "iana",
          extensions: ["mpc"]
        },
        "application/vnd.motorola.flexsuite": {
          source: "iana"
        },
        "application/vnd.motorola.flexsuite.adsi": {
          source: "iana"
        },
        "application/vnd.motorola.flexsuite.fis": {
          source: "iana"
        },
        "application/vnd.motorola.flexsuite.gotap": {
          source: "iana"
        },
        "application/vnd.motorola.flexsuite.kmr": {
          source: "iana"
        },
        "application/vnd.motorola.flexsuite.ttc": {
          source: "iana"
        },
        "application/vnd.motorola.flexsuite.wem": {
          source: "iana"
        },
        "application/vnd.motorola.iprm": {
          source: "iana"
        },
        "application/vnd.mozilla.xul+xml": {
          source: "iana",
          compressible: true,
          extensions: ["xul"]
        },
        "application/vnd.ms-3mfdocument": {
          source: "iana"
        },
        "application/vnd.ms-artgalry": {
          source: "iana",
          extensions: ["cil"]
        },
        "application/vnd.ms-asf": {
          source: "iana"
        },
        "application/vnd.ms-cab-compressed": {
          source: "iana",
          extensions: ["cab"]
        },
        "application/vnd.ms-color.iccprofile": {
          source: "apache"
        },
        "application/vnd.ms-excel": {
          source: "iana",
          compressible: false,
          extensions: ["xls", "xlm", "xla", "xlc", "xlt", "xlw"]
        },
        "application/vnd.ms-excel.addin.macroenabled.12": {
          source: "iana",
          extensions: ["xlam"]
        },
        "application/vnd.ms-excel.sheet.binary.macroenabled.12": {
          source: "iana",
          extensions: ["xlsb"]
        },
        "application/vnd.ms-excel.sheet.macroenabled.12": {
          source: "iana",
          extensions: ["xlsm"]
        },
        "application/vnd.ms-excel.template.macroenabled.12": {
          source: "iana",
          extensions: ["xltm"]
        },
        "application/vnd.ms-fontobject": {
          source: "iana",
          compressible: true,
          extensions: ["eot"]
        },
        "application/vnd.ms-htmlhelp": {
          source: "iana",
          extensions: ["chm"]
        },
        "application/vnd.ms-ims": {
          source: "iana",
          extensions: ["ims"]
        },
        "application/vnd.ms-lrm": {
          source: "iana",
          extensions: ["lrm"]
        },
        "application/vnd.ms-office.activex+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.ms-officetheme": {
          source: "iana",
          extensions: ["thmx"]
        },
        "application/vnd.ms-opentype": {
          source: "apache",
          compressible: true
        },
        "application/vnd.ms-outlook": {
          compressible: false,
          extensions: ["msg"]
        },
        "application/vnd.ms-package.obfuscated-opentype": {
          source: "apache"
        },
        "application/vnd.ms-pki.seccat": {
          source: "apache",
          extensions: ["cat"]
        },
        "application/vnd.ms-pki.stl": {
          source: "apache",
          extensions: ["stl"]
        },
        "application/vnd.ms-playready.initiator+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.ms-powerpoint": {
          source: "iana",
          compressible: false,
          extensions: ["ppt", "pps", "pot"]
        },
        "application/vnd.ms-powerpoint.addin.macroenabled.12": {
          source: "iana",
          extensions: ["ppam"]
        },
        "application/vnd.ms-powerpoint.presentation.macroenabled.12": {
          source: "iana",
          extensions: ["pptm"]
        },
        "application/vnd.ms-powerpoint.slide.macroenabled.12": {
          source: "iana",
          extensions: ["sldm"]
        },
        "application/vnd.ms-powerpoint.slideshow.macroenabled.12": {
          source: "iana",
          extensions: ["ppsm"]
        },
        "application/vnd.ms-powerpoint.template.macroenabled.12": {
          source: "iana",
          extensions: ["potm"]
        },
        "application/vnd.ms-printdevicecapabilities+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.ms-printing.printticket+xml": {
          source: "apache",
          compressible: true
        },
        "application/vnd.ms-printschematicket+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.ms-project": {
          source: "iana",
          extensions: ["mpp", "mpt"]
        },
        "application/vnd.ms-tnef": {
          source: "iana"
        },
        "application/vnd.ms-windows.devicepairing": {
          source: "iana"
        },
        "application/vnd.ms-windows.nwprinting.oob": {
          source: "iana"
        },
        "application/vnd.ms-windows.printerpairing": {
          source: "iana"
        },
        "application/vnd.ms-windows.wsd.oob": {
          source: "iana"
        },
        "application/vnd.ms-wmdrm.lic-chlg-req": {
          source: "iana"
        },
        "application/vnd.ms-wmdrm.lic-resp": {
          source: "iana"
        },
        "application/vnd.ms-wmdrm.meter-chlg-req": {
          source: "iana"
        },
        "application/vnd.ms-wmdrm.meter-resp": {
          source: "iana"
        },
        "application/vnd.ms-word.document.macroenabled.12": {
          source: "iana",
          extensions: ["docm"]
        },
        "application/vnd.ms-word.template.macroenabled.12": {
          source: "iana",
          extensions: ["dotm"]
        },
        "application/vnd.ms-works": {
          source: "iana",
          extensions: ["wps", "wks", "wcm", "wdb"]
        },
        "application/vnd.ms-wpl": {
          source: "iana",
          extensions: ["wpl"]
        },
        "application/vnd.ms-xpsdocument": {
          source: "iana",
          compressible: false,
          extensions: ["xps"]
        },
        "application/vnd.msa-disk-image": {
          source: "iana"
        },
        "application/vnd.mseq": {
          source: "iana",
          extensions: ["mseq"]
        },
        "application/vnd.msign": {
          source: "iana"
        },
        "application/vnd.multiad.creator": {
          source: "iana"
        },
        "application/vnd.multiad.creator.cif": {
          source: "iana"
        },
        "application/vnd.music-niff": {
          source: "iana"
        },
        "application/vnd.musician": {
          source: "iana",
          extensions: ["mus"]
        },
        "application/vnd.muvee.style": {
          source: "iana",
          extensions: ["msty"]
        },
        "application/vnd.mynfc": {
          source: "iana",
          extensions: ["taglet"]
        },
        "application/vnd.nacamar.ybrid+json": {
          source: "iana",
          compressible: true
        },
        "application/vnd.ncd.control": {
          source: "iana"
        },
        "application/vnd.ncd.reference": {
          source: "iana"
        },
        "application/vnd.nearst.inv+json": {
          source: "iana",
          compressible: true
        },
        "application/vnd.nebumind.line": {
          source: "iana"
        },
        "application/vnd.nervana": {
          source: "iana"
        },
        "application/vnd.netfpx": {
          source: "iana"
        },
        "application/vnd.neurolanguage.nlu": {
          source: "iana",
          extensions: ["nlu"]
        },
        "application/vnd.nimn": {
          source: "iana"
        },
        "application/vnd.nintendo.nitro.rom": {
          source: "iana"
        },
        "application/vnd.nintendo.snes.rom": {
          source: "iana"
        },
        "application/vnd.nitf": {
          source: "iana",
          extensions: ["ntf", "nitf"]
        },
        "application/vnd.noblenet-directory": {
          source: "iana",
          extensions: ["nnd"]
        },
        "application/vnd.noblenet-sealer": {
          source: "iana",
          extensions: ["nns"]
        },
        "application/vnd.noblenet-web": {
          source: "iana",
          extensions: ["nnw"]
        },
        "application/vnd.nokia.catalogs": {
          source: "iana"
        },
        "application/vnd.nokia.conml+wbxml": {
          source: "iana"
        },
        "application/vnd.nokia.conml+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.nokia.iptv.config+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.nokia.isds-radio-presets": {
          source: "iana"
        },
        "application/vnd.nokia.landmark+wbxml": {
          source: "iana"
        },
        "application/vnd.nokia.landmark+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.nokia.landmarkcollection+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.nokia.n-gage.ac+xml": {
          source: "iana",
          compressible: true,
          extensions: ["ac"]
        },
        "application/vnd.nokia.n-gage.data": {
          source: "iana",
          extensions: ["ngdat"]
        },
        "application/vnd.nokia.n-gage.symbian.install": {
          source: "iana",
          extensions: ["n-gage"]
        },
        "application/vnd.nokia.ncd": {
          source: "iana"
        },
        "application/vnd.nokia.pcd+wbxml": {
          source: "iana"
        },
        "application/vnd.nokia.pcd+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.nokia.radio-preset": {
          source: "iana",
          extensions: ["rpst"]
        },
        "application/vnd.nokia.radio-presets": {
          source: "iana",
          extensions: ["rpss"]
        },
        "application/vnd.novadigm.edm": {
          source: "iana",
          extensions: ["edm"]
        },
        "application/vnd.novadigm.edx": {
          source: "iana",
          extensions: ["edx"]
        },
        "application/vnd.novadigm.ext": {
          source: "iana",
          extensions: ["ext"]
        },
        "application/vnd.ntt-local.content-share": {
          source: "iana"
        },
        "application/vnd.ntt-local.file-transfer": {
          source: "iana"
        },
        "application/vnd.ntt-local.ogw_remote-access": {
          source: "iana"
        },
        "application/vnd.ntt-local.sip-ta_remote": {
          source: "iana"
        },
        "application/vnd.ntt-local.sip-ta_tcp_stream": {
          source: "iana"
        },
        "application/vnd.oasis.opendocument.chart": {
          source: "iana",
          extensions: ["odc"]
        },
        "application/vnd.oasis.opendocument.chart-template": {
          source: "iana",
          extensions: ["otc"]
        },
        "application/vnd.oasis.opendocument.database": {
          source: "iana",
          extensions: ["odb"]
        },
        "application/vnd.oasis.opendocument.formula": {
          source: "iana",
          extensions: ["odf"]
        },
        "application/vnd.oasis.opendocument.formula-template": {
          source: "iana",
          extensions: ["odft"]
        },
        "application/vnd.oasis.opendocument.graphics": {
          source: "iana",
          compressible: false,
          extensions: ["odg"]
        },
        "application/vnd.oasis.opendocument.graphics-template": {
          source: "iana",
          extensions: ["otg"]
        },
        "application/vnd.oasis.opendocument.image": {
          source: "iana",
          extensions: ["odi"]
        },
        "application/vnd.oasis.opendocument.image-template": {
          source: "iana",
          extensions: ["oti"]
        },
        "application/vnd.oasis.opendocument.presentation": {
          source: "iana",
          compressible: false,
          extensions: ["odp"]
        },
        "application/vnd.oasis.opendocument.presentation-template": {
          source: "iana",
          extensions: ["otp"]
        },
        "application/vnd.oasis.opendocument.spreadsheet": {
          source: "iana",
          compressible: false,
          extensions: ["ods"]
        },
        "application/vnd.oasis.opendocument.spreadsheet-template": {
          source: "iana",
          extensions: ["ots"]
        },
        "application/vnd.oasis.opendocument.text": {
          source: "iana",
          compressible: false,
          extensions: ["odt"]
        },
        "application/vnd.oasis.opendocument.text-master": {
          source: "iana",
          extensions: ["odm"]
        },
        "application/vnd.oasis.opendocument.text-template": {
          source: "iana",
          extensions: ["ott"]
        },
        "application/vnd.oasis.opendocument.text-web": {
          source: "iana",
          extensions: ["oth"]
        },
        "application/vnd.obn": {
          source: "iana"
        },
        "application/vnd.ocf+cbor": {
          source: "iana"
        },
        "application/vnd.oci.image.manifest.v1+json": {
          source: "iana",
          compressible: true
        },
        "application/vnd.oftn.l10n+json": {
          source: "iana",
          compressible: true
        },
        "application/vnd.oipf.contentaccessdownload+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.oipf.contentaccessstreaming+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.oipf.cspg-hexbinary": {
          source: "iana"
        },
        "application/vnd.oipf.dae.svg+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.oipf.dae.xhtml+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.oipf.mippvcontrolmessage+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.oipf.pae.gem": {
          source: "iana"
        },
        "application/vnd.oipf.spdiscovery+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.oipf.spdlist+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.oipf.ueprofile+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.oipf.userprofile+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.olpc-sugar": {
          source: "iana",
          extensions: ["xo"]
        },
        "application/vnd.oma-scws-config": {
          source: "iana"
        },
        "application/vnd.oma-scws-http-request": {
          source: "iana"
        },
        "application/vnd.oma-scws-http-response": {
          source: "iana"
        },
        "application/vnd.oma.bcast.associated-procedure-parameter+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.oma.bcast.drm-trigger+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.oma.bcast.imd+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.oma.bcast.ltkm": {
          source: "iana"
        },
        "application/vnd.oma.bcast.notification+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.oma.bcast.provisioningtrigger": {
          source: "iana"
        },
        "application/vnd.oma.bcast.sgboot": {
          source: "iana"
        },
        "application/vnd.oma.bcast.sgdd+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.oma.bcast.sgdu": {
          source: "iana"
        },
        "application/vnd.oma.bcast.simple-symbol-container": {
          source: "iana"
        },
        "application/vnd.oma.bcast.smartcard-trigger+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.oma.bcast.sprov+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.oma.bcast.stkm": {
          source: "iana"
        },
        "application/vnd.oma.cab-address-book+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.oma.cab-feature-handler+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.oma.cab-pcc+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.oma.cab-subs-invite+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.oma.cab-user-prefs+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.oma.dcd": {
          source: "iana"
        },
        "application/vnd.oma.dcdc": {
          source: "iana"
        },
        "application/vnd.oma.dd2+xml": {
          source: "iana",
          compressible: true,
          extensions: ["dd2"]
        },
        "application/vnd.oma.drm.risd+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.oma.group-usage-list+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.oma.lwm2m+cbor": {
          source: "iana"
        },
        "application/vnd.oma.lwm2m+json": {
          source: "iana",
          compressible: true
        },
        "application/vnd.oma.lwm2m+tlv": {
          source: "iana"
        },
        "application/vnd.oma.pal+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.oma.poc.detailed-progress-report+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.oma.poc.final-report+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.oma.poc.groups+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.oma.poc.invocation-descriptor+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.oma.poc.optimized-progress-report+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.oma.push": {
          source: "iana"
        },
        "application/vnd.oma.scidm.messages+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.oma.xcap-directory+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.omads-email+xml": {
          source: "iana",
          charset: "UTF-8",
          compressible: true
        },
        "application/vnd.omads-file+xml": {
          source: "iana",
          charset: "UTF-8",
          compressible: true
        },
        "application/vnd.omads-folder+xml": {
          source: "iana",
          charset: "UTF-8",
          compressible: true
        },
        "application/vnd.omaloc-supl-init": {
          source: "iana"
        },
        "application/vnd.onepager": {
          source: "iana"
        },
        "application/vnd.onepagertamp": {
          source: "iana"
        },
        "application/vnd.onepagertamx": {
          source: "iana"
        },
        "application/vnd.onepagertat": {
          source: "iana"
        },
        "application/vnd.onepagertatp": {
          source: "iana"
        },
        "application/vnd.onepagertatx": {
          source: "iana"
        },
        "application/vnd.openblox.game+xml": {
          source: "iana",
          compressible: true,
          extensions: ["obgx"]
        },
        "application/vnd.openblox.game-binary": {
          source: "iana"
        },
        "application/vnd.openeye.oeb": {
          source: "iana"
        },
        "application/vnd.openofficeorg.extension": {
          source: "apache",
          extensions: ["oxt"]
        },
        "application/vnd.openstreetmap.data+xml": {
          source: "iana",
          compressible: true,
          extensions: ["osm"]
        },
        "application/vnd.opentimestamps.ots": {
          source: "iana"
        },
        "application/vnd.openxmlformats-officedocument.custom-properties+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.openxmlformats-officedocument.customxmlproperties+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.openxmlformats-officedocument.drawing+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.openxmlformats-officedocument.drawingml.chart+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.openxmlformats-officedocument.drawingml.chartshapes+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.openxmlformats-officedocument.drawingml.diagramcolors+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.openxmlformats-officedocument.drawingml.diagramdata+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.openxmlformats-officedocument.drawingml.diagramlayout+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.openxmlformats-officedocument.drawingml.diagramstyle+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.openxmlformats-officedocument.extended-properties+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.openxmlformats-officedocument.presentationml.commentauthors+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.openxmlformats-officedocument.presentationml.comments+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.openxmlformats-officedocument.presentationml.handoutmaster+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.openxmlformats-officedocument.presentationml.notesmaster+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.openxmlformats-officedocument.presentationml.notesslide+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.openxmlformats-officedocument.presentationml.presentation": {
          source: "iana",
          compressible: false,
          extensions: ["pptx"]
        },
        "application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.openxmlformats-officedocument.presentationml.presprops+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.openxmlformats-officedocument.presentationml.slide": {
          source: "iana",
          extensions: ["sldx"]
        },
        "application/vnd.openxmlformats-officedocument.presentationml.slide+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.openxmlformats-officedocument.presentationml.slidelayout+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.openxmlformats-officedocument.presentationml.slidemaster+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.openxmlformats-officedocument.presentationml.slideshow": {
          source: "iana",
          extensions: ["ppsx"]
        },
        "application/vnd.openxmlformats-officedocument.presentationml.slideshow.main+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.openxmlformats-officedocument.presentationml.slideupdateinfo+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.openxmlformats-officedocument.presentationml.tablestyles+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.openxmlformats-officedocument.presentationml.tags+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.openxmlformats-officedocument.presentationml.template": {
          source: "iana",
          extensions: ["potx"]
        },
        "application/vnd.openxmlformats-officedocument.presentationml.template.main+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.openxmlformats-officedocument.presentationml.viewprops+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.openxmlformats-officedocument.spreadsheetml.calcchain+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.openxmlformats-officedocument.spreadsheetml.chartsheet+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.openxmlformats-officedocument.spreadsheetml.comments+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.openxmlformats-officedocument.spreadsheetml.connections+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.openxmlformats-officedocument.spreadsheetml.dialogsheet+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.openxmlformats-officedocument.spreadsheetml.externallink+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.openxmlformats-officedocument.spreadsheetml.pivotcachedefinition+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.openxmlformats-officedocument.spreadsheetml.pivotcacherecords+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.openxmlformats-officedocument.spreadsheetml.pivottable+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.openxmlformats-officedocument.spreadsheetml.querytable+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.openxmlformats-officedocument.spreadsheetml.revisionheaders+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.openxmlformats-officedocument.spreadsheetml.revisionlog+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sharedstrings+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": {
          source: "iana",
          compressible: false,
          extensions: ["xlsx"]
        },
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheetmetadata+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.openxmlformats-officedocument.spreadsheetml.table+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.openxmlformats-officedocument.spreadsheetml.tablesinglecells+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.openxmlformats-officedocument.spreadsheetml.template": {
          source: "iana",
          extensions: ["xltx"]
        },
        "application/vnd.openxmlformats-officedocument.spreadsheetml.template.main+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.openxmlformats-officedocument.spreadsheetml.usernames+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.openxmlformats-officedocument.spreadsheetml.volatiledependencies+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.openxmlformats-officedocument.theme+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.openxmlformats-officedocument.themeoverride+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.openxmlformats-officedocument.vmldrawing": {
          source: "iana"
        },
        "application/vnd.openxmlformats-officedocument.wordprocessingml.comments+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
          source: "iana",
          compressible: false,
          extensions: ["docx"]
        },
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document.glossary+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.openxmlformats-officedocument.wordprocessingml.endnotes+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.openxmlformats-officedocument.wordprocessingml.fonttable+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.openxmlformats-officedocument.wordprocessingml.footnotes+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.openxmlformats-officedocument.wordprocessingml.numbering+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.openxmlformats-officedocument.wordprocessingml.settings+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.openxmlformats-officedocument.wordprocessingml.template": {
          source: "iana",
          extensions: ["dotx"]
        },
        "application/vnd.openxmlformats-officedocument.wordprocessingml.template.main+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.openxmlformats-officedocument.wordprocessingml.websettings+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.openxmlformats-package.core-properties+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.openxmlformats-package.digital-signature-xmlsignature+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.openxmlformats-package.relationships+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.oracle.resource+json": {
          source: "iana",
          compressible: true
        },
        "application/vnd.orange.indata": {
          source: "iana"
        },
        "application/vnd.osa.netdeploy": {
          source: "iana"
        },
        "application/vnd.osgeo.mapguide.package": {
          source: "iana",
          extensions: ["mgp"]
        },
        "application/vnd.osgi.bundle": {
          source: "iana"
        },
        "application/vnd.osgi.dp": {
          source: "iana",
          extensions: ["dp"]
        },
        "application/vnd.osgi.subsystem": {
          source: "iana",
          extensions: ["esa"]
        },
        "application/vnd.otps.ct-kip+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.oxli.countgraph": {
          source: "iana"
        },
        "application/vnd.pagerduty+json": {
          source: "iana",
          compressible: true
        },
        "application/vnd.palm": {
          source: "iana",
          extensions: ["pdb", "pqa", "oprc"]
        },
        "application/vnd.panoply": {
          source: "iana"
        },
        "application/vnd.paos.xml": {
          source: "iana"
        },
        "application/vnd.patentdive": {
          source: "iana"
        },
        "application/vnd.patientecommsdoc": {
          source: "iana"
        },
        "application/vnd.pawaafile": {
          source: "iana",
          extensions: ["paw"]
        },
        "application/vnd.pcos": {
          source: "iana"
        },
        "application/vnd.pg.format": {
          source: "iana",
          extensions: ["str"]
        },
        "application/vnd.pg.osasli": {
          source: "iana",
          extensions: ["ei6"]
        },
        "application/vnd.piaccess.application-licence": {
          source: "iana"
        },
        "application/vnd.picsel": {
          source: "iana",
          extensions: ["efif"]
        },
        "application/vnd.pmi.widget": {
          source: "iana",
          extensions: ["wg"]
        },
        "application/vnd.poc.group-advertisement+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.pocketlearn": {
          source: "iana",
          extensions: ["plf"]
        },
        "application/vnd.powerbuilder6": {
          source: "iana",
          extensions: ["pbd"]
        },
        "application/vnd.powerbuilder6-s": {
          source: "iana"
        },
        "application/vnd.powerbuilder7": {
          source: "iana"
        },
        "application/vnd.powerbuilder7-s": {
          source: "iana"
        },
        "application/vnd.powerbuilder75": {
          source: "iana"
        },
        "application/vnd.powerbuilder75-s": {
          source: "iana"
        },
        "application/vnd.preminet": {
          source: "iana"
        },
        "application/vnd.previewsystems.box": {
          source: "iana",
          extensions: ["box"]
        },
        "application/vnd.proteus.magazine": {
          source: "iana",
          extensions: ["mgz"]
        },
        "application/vnd.psfs": {
          source: "iana"
        },
        "application/vnd.publishare-delta-tree": {
          source: "iana",
          extensions: ["qps"]
        },
        "application/vnd.pvi.ptid1": {
          source: "iana",
          extensions: ["ptid"]
        },
        "application/vnd.pwg-multiplexed": {
          source: "iana"
        },
        "application/vnd.pwg-xhtml-print+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.qualcomm.brew-app-res": {
          source: "iana"
        },
        "application/vnd.quarantainenet": {
          source: "iana"
        },
        "application/vnd.quark.quarkxpress": {
          source: "iana",
          extensions: ["qxd", "qxt", "qwd", "qwt", "qxl", "qxb"]
        },
        "application/vnd.quobject-quoxdocument": {
          source: "iana"
        },
        "application/vnd.radisys.moml+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.radisys.msml+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.radisys.msml-audit+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.radisys.msml-audit-conf+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.radisys.msml-audit-conn+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.radisys.msml-audit-dialog+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.radisys.msml-audit-stream+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.radisys.msml-conf+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.radisys.msml-dialog+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.radisys.msml-dialog-base+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.radisys.msml-dialog-fax-detect+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.radisys.msml-dialog-fax-sendrecv+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.radisys.msml-dialog-group+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.radisys.msml-dialog-speech+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.radisys.msml-dialog-transform+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.rainstor.data": {
          source: "iana"
        },
        "application/vnd.rapid": {
          source: "iana"
        },
        "application/vnd.rar": {
          source: "iana",
          extensions: ["rar"]
        },
        "application/vnd.realvnc.bed": {
          source: "iana",
          extensions: ["bed"]
        },
        "application/vnd.recordare.musicxml": {
          source: "iana",
          extensions: ["mxl"]
        },
        "application/vnd.recordare.musicxml+xml": {
          source: "iana",
          compressible: true,
          extensions: ["musicxml"]
        },
        "application/vnd.renlearn.rlprint": {
          source: "iana"
        },
        "application/vnd.resilient.logic": {
          source: "iana"
        },
        "application/vnd.restful+json": {
          source: "iana",
          compressible: true
        },
        "application/vnd.rig.cryptonote": {
          source: "iana",
          extensions: ["cryptonote"]
        },
        "application/vnd.rim.cod": {
          source: "apache",
          extensions: ["cod"]
        },
        "application/vnd.rn-realmedia": {
          source: "apache",
          extensions: ["rm"]
        },
        "application/vnd.rn-realmedia-vbr": {
          source: "apache",
          extensions: ["rmvb"]
        },
        "application/vnd.route66.link66+xml": {
          source: "iana",
          compressible: true,
          extensions: ["link66"]
        },
        "application/vnd.rs-274x": {
          source: "iana"
        },
        "application/vnd.ruckus.download": {
          source: "iana"
        },
        "application/vnd.s3sms": {
          source: "iana"
        },
        "application/vnd.sailingtracker.track": {
          source: "iana",
          extensions: ["st"]
        },
        "application/vnd.sar": {
          source: "iana"
        },
        "application/vnd.sbm.cid": {
          source: "iana"
        },
        "application/vnd.sbm.mid2": {
          source: "iana"
        },
        "application/vnd.scribus": {
          source: "iana"
        },
        "application/vnd.sealed.3df": {
          source: "iana"
        },
        "application/vnd.sealed.csf": {
          source: "iana"
        },
        "application/vnd.sealed.doc": {
          source: "iana"
        },
        "application/vnd.sealed.eml": {
          source: "iana"
        },
        "application/vnd.sealed.mht": {
          source: "iana"
        },
        "application/vnd.sealed.net": {
          source: "iana"
        },
        "application/vnd.sealed.ppt": {
          source: "iana"
        },
        "application/vnd.sealed.tiff": {
          source: "iana"
        },
        "application/vnd.sealed.xls": {
          source: "iana"
        },
        "application/vnd.sealedmedia.softseal.html": {
          source: "iana"
        },
        "application/vnd.sealedmedia.softseal.pdf": {
          source: "iana"
        },
        "application/vnd.seemail": {
          source: "iana",
          extensions: ["see"]
        },
        "application/vnd.seis+json": {
          source: "iana",
          compressible: true
        },
        "application/vnd.sema": {
          source: "iana",
          extensions: ["sema"]
        },
        "application/vnd.semd": {
          source: "iana",
          extensions: ["semd"]
        },
        "application/vnd.semf": {
          source: "iana",
          extensions: ["semf"]
        },
        "application/vnd.shade-save-file": {
          source: "iana"
        },
        "application/vnd.shana.informed.formdata": {
          source: "iana",
          extensions: ["ifm"]
        },
        "application/vnd.shana.informed.formtemplate": {
          source: "iana",
          extensions: ["itp"]
        },
        "application/vnd.shana.informed.interchange": {
          source: "iana",
          extensions: ["iif"]
        },
        "application/vnd.shana.informed.package": {
          source: "iana",
          extensions: ["ipk"]
        },
        "application/vnd.shootproof+json": {
          source: "iana",
          compressible: true
        },
        "application/vnd.shopkick+json": {
          source: "iana",
          compressible: true
        },
        "application/vnd.shp": {
          source: "iana"
        },
        "application/vnd.shx": {
          source: "iana"
        },
        "application/vnd.sigrok.session": {
          source: "iana"
        },
        "application/vnd.simtech-mindmapper": {
          source: "iana",
          extensions: ["twd", "twds"]
        },
        "application/vnd.siren+json": {
          source: "iana",
          compressible: true
        },
        "application/vnd.smaf": {
          source: "iana",
          extensions: ["mmf"]
        },
        "application/vnd.smart.notebook": {
          source: "iana"
        },
        "application/vnd.smart.teacher": {
          source: "iana",
          extensions: ["teacher"]
        },
        "application/vnd.snesdev-page-table": {
          source: "iana"
        },
        "application/vnd.software602.filler.form+xml": {
          source: "iana",
          compressible: true,
          extensions: ["fo"]
        },
        "application/vnd.software602.filler.form-xml-zip": {
          source: "iana"
        },
        "application/vnd.solent.sdkm+xml": {
          source: "iana",
          compressible: true,
          extensions: ["sdkm", "sdkd"]
        },
        "application/vnd.spotfire.dxp": {
          source: "iana",
          extensions: ["dxp"]
        },
        "application/vnd.spotfire.sfs": {
          source: "iana",
          extensions: ["sfs"]
        },
        "application/vnd.sqlite3": {
          source: "iana"
        },
        "application/vnd.sss-cod": {
          source: "iana"
        },
        "application/vnd.sss-dtf": {
          source: "iana"
        },
        "application/vnd.sss-ntf": {
          source: "iana"
        },
        "application/vnd.stardivision.calc": {
          source: "apache",
          extensions: ["sdc"]
        },
        "application/vnd.stardivision.draw": {
          source: "apache",
          extensions: ["sda"]
        },
        "application/vnd.stardivision.impress": {
          source: "apache",
          extensions: ["sdd"]
        },
        "application/vnd.stardivision.math": {
          source: "apache",
          extensions: ["smf"]
        },
        "application/vnd.stardivision.writer": {
          source: "apache",
          extensions: ["sdw", "vor"]
        },
        "application/vnd.stardivision.writer-global": {
          source: "apache",
          extensions: ["sgl"]
        },
        "application/vnd.stepmania.package": {
          source: "iana",
          extensions: ["smzip"]
        },
        "application/vnd.stepmania.stepchart": {
          source: "iana",
          extensions: ["sm"]
        },
        "application/vnd.street-stream": {
          source: "iana"
        },
        "application/vnd.sun.wadl+xml": {
          source: "iana",
          compressible: true,
          extensions: ["wadl"]
        },
        "application/vnd.sun.xml.calc": {
          source: "apache",
          extensions: ["sxc"]
        },
        "application/vnd.sun.xml.calc.template": {
          source: "apache",
          extensions: ["stc"]
        },
        "application/vnd.sun.xml.draw": {
          source: "apache",
          extensions: ["sxd"]
        },
        "application/vnd.sun.xml.draw.template": {
          source: "apache",
          extensions: ["std"]
        },
        "application/vnd.sun.xml.impress": {
          source: "apache",
          extensions: ["sxi"]
        },
        "application/vnd.sun.xml.impress.template": {
          source: "apache",
          extensions: ["sti"]
        },
        "application/vnd.sun.xml.math": {
          source: "apache",
          extensions: ["sxm"]
        },
        "application/vnd.sun.xml.writer": {
          source: "apache",
          extensions: ["sxw"]
        },
        "application/vnd.sun.xml.writer.global": {
          source: "apache",
          extensions: ["sxg"]
        },
        "application/vnd.sun.xml.writer.template": {
          source: "apache",
          extensions: ["stw"]
        },
        "application/vnd.sus-calendar": {
          source: "iana",
          extensions: ["sus", "susp"]
        },
        "application/vnd.svd": {
          source: "iana",
          extensions: ["svd"]
        },
        "application/vnd.swiftview-ics": {
          source: "iana"
        },
        "application/vnd.sycle+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.syft+json": {
          source: "iana",
          compressible: true
        },
        "application/vnd.symbian.install": {
          source: "apache",
          extensions: ["sis", "sisx"]
        },
        "application/vnd.syncml+xml": {
          source: "iana",
          charset: "UTF-8",
          compressible: true,
          extensions: ["xsm"]
        },
        "application/vnd.syncml.dm+wbxml": {
          source: "iana",
          charset: "UTF-8",
          extensions: ["bdm"]
        },
        "application/vnd.syncml.dm+xml": {
          source: "iana",
          charset: "UTF-8",
          compressible: true,
          extensions: ["xdm"]
        },
        "application/vnd.syncml.dm.notification": {
          source: "iana"
        },
        "application/vnd.syncml.dmddf+wbxml": {
          source: "iana"
        },
        "application/vnd.syncml.dmddf+xml": {
          source: "iana",
          charset: "UTF-8",
          compressible: true,
          extensions: ["ddf"]
        },
        "application/vnd.syncml.dmtnds+wbxml": {
          source: "iana"
        },
        "application/vnd.syncml.dmtnds+xml": {
          source: "iana",
          charset: "UTF-8",
          compressible: true
        },
        "application/vnd.syncml.ds.notification": {
          source: "iana"
        },
        "application/vnd.tableschema+json": {
          source: "iana",
          compressible: true
        },
        "application/vnd.tao.intent-module-archive": {
          source: "iana",
          extensions: ["tao"]
        },
        "application/vnd.tcpdump.pcap": {
          source: "iana",
          extensions: ["pcap", "cap", "dmp"]
        },
        "application/vnd.think-cell.ppttc+json": {
          source: "iana",
          compressible: true
        },
        "application/vnd.tmd.mediaflex.api+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.tml": {
          source: "iana"
        },
        "application/vnd.tmobile-livetv": {
          source: "iana",
          extensions: ["tmo"]
        },
        "application/vnd.tri.onesource": {
          source: "iana"
        },
        "application/vnd.trid.tpt": {
          source: "iana",
          extensions: ["tpt"]
        },
        "application/vnd.triscape.mxs": {
          source: "iana",
          extensions: ["mxs"]
        },
        "application/vnd.trueapp": {
          source: "iana",
          extensions: ["tra"]
        },
        "application/vnd.truedoc": {
          source: "iana"
        },
        "application/vnd.ubisoft.webplayer": {
          source: "iana"
        },
        "application/vnd.ufdl": {
          source: "iana",
          extensions: ["ufd", "ufdl"]
        },
        "application/vnd.uiq.theme": {
          source: "iana",
          extensions: ["utz"]
        },
        "application/vnd.umajin": {
          source: "iana",
          extensions: ["umj"]
        },
        "application/vnd.unity": {
          source: "iana",
          extensions: ["unityweb"]
        },
        "application/vnd.uoml+xml": {
          source: "iana",
          compressible: true,
          extensions: ["uoml"]
        },
        "application/vnd.uplanet.alert": {
          source: "iana"
        },
        "application/vnd.uplanet.alert-wbxml": {
          source: "iana"
        },
        "application/vnd.uplanet.bearer-choice": {
          source: "iana"
        },
        "application/vnd.uplanet.bearer-choice-wbxml": {
          source: "iana"
        },
        "application/vnd.uplanet.cacheop": {
          source: "iana"
        },
        "application/vnd.uplanet.cacheop-wbxml": {
          source: "iana"
        },
        "application/vnd.uplanet.channel": {
          source: "iana"
        },
        "application/vnd.uplanet.channel-wbxml": {
          source: "iana"
        },
        "application/vnd.uplanet.list": {
          source: "iana"
        },
        "application/vnd.uplanet.list-wbxml": {
          source: "iana"
        },
        "application/vnd.uplanet.listcmd": {
          source: "iana"
        },
        "application/vnd.uplanet.listcmd-wbxml": {
          source: "iana"
        },
        "application/vnd.uplanet.signal": {
          source: "iana"
        },
        "application/vnd.uri-map": {
          source: "iana"
        },
        "application/vnd.valve.source.material": {
          source: "iana"
        },
        "application/vnd.vcx": {
          source: "iana",
          extensions: ["vcx"]
        },
        "application/vnd.vd-study": {
          source: "iana"
        },
        "application/vnd.vectorworks": {
          source: "iana"
        },
        "application/vnd.vel+json": {
          source: "iana",
          compressible: true
        },
        "application/vnd.verimatrix.vcas": {
          source: "iana"
        },
        "application/vnd.veritone.aion+json": {
          source: "iana",
          compressible: true
        },
        "application/vnd.veryant.thin": {
          source: "iana"
        },
        "application/vnd.ves.encrypted": {
          source: "iana"
        },
        "application/vnd.vidsoft.vidconference": {
          source: "iana"
        },
        "application/vnd.visio": {
          source: "iana",
          extensions: ["vsd", "vst", "vss", "vsw"]
        },
        "application/vnd.visionary": {
          source: "iana",
          extensions: ["vis"]
        },
        "application/vnd.vividence.scriptfile": {
          source: "iana"
        },
        "application/vnd.vsf": {
          source: "iana",
          extensions: ["vsf"]
        },
        "application/vnd.wap.sic": {
          source: "iana"
        },
        "application/vnd.wap.slc": {
          source: "iana"
        },
        "application/vnd.wap.wbxml": {
          source: "iana",
          charset: "UTF-8",
          extensions: ["wbxml"]
        },
        "application/vnd.wap.wmlc": {
          source: "iana",
          extensions: ["wmlc"]
        },
        "application/vnd.wap.wmlscriptc": {
          source: "iana",
          extensions: ["wmlsc"]
        },
        "application/vnd.webturbo": {
          source: "iana",
          extensions: ["wtb"]
        },
        "application/vnd.wfa.dpp": {
          source: "iana"
        },
        "application/vnd.wfa.p2p": {
          source: "iana"
        },
        "application/vnd.wfa.wsc": {
          source: "iana"
        },
        "application/vnd.windows.devicepairing": {
          source: "iana"
        },
        "application/vnd.wmc": {
          source: "iana"
        },
        "application/vnd.wmf.bootstrap": {
          source: "iana"
        },
        "application/vnd.wolfram.mathematica": {
          source: "iana"
        },
        "application/vnd.wolfram.mathematica.package": {
          source: "iana"
        },
        "application/vnd.wolfram.player": {
          source: "iana",
          extensions: ["nbp"]
        },
        "application/vnd.wordperfect": {
          source: "iana",
          extensions: ["wpd"]
        },
        "application/vnd.wqd": {
          source: "iana",
          extensions: ["wqd"]
        },
        "application/vnd.wrq-hp3000-labelled": {
          source: "iana"
        },
        "application/vnd.wt.stf": {
          source: "iana",
          extensions: ["stf"]
        },
        "application/vnd.wv.csp+wbxml": {
          source: "iana"
        },
        "application/vnd.wv.csp+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.wv.ssp+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.xacml+json": {
          source: "iana",
          compressible: true
        },
        "application/vnd.xara": {
          source: "iana",
          extensions: ["xar"]
        },
        "application/vnd.xfdl": {
          source: "iana",
          extensions: ["xfdl"]
        },
        "application/vnd.xfdl.webform": {
          source: "iana"
        },
        "application/vnd.xmi+xml": {
          source: "iana",
          compressible: true
        },
        "application/vnd.xmpie.cpkg": {
          source: "iana"
        },
        "application/vnd.xmpie.dpkg": {
          source: "iana"
        },
        "application/vnd.xmpie.plan": {
          source: "iana"
        },
        "application/vnd.xmpie.ppkg": {
          source: "iana"
        },
        "application/vnd.xmpie.xlim": {
          source: "iana"
        },
        "application/vnd.yamaha.hv-dic": {
          source: "iana",
          extensions: ["hvd"]
        },
        "application/vnd.yamaha.hv-script": {
          source: "iana",
          extensions: ["hvs"]
        },
        "application/vnd.yamaha.hv-voice": {
          source: "iana",
          extensions: ["hvp"]
        },
        "application/vnd.yamaha.openscoreformat": {
          source: "iana",
          extensions: ["osf"]
        },
        "application/vnd.yamaha.openscoreformat.osfpvg+xml": {
          source: "iana",
          compressible: true,
          extensions: ["osfpvg"]
        },
        "application/vnd.yamaha.remote-setup": {
          source: "iana"
        },
        "application/vnd.yamaha.smaf-audio": {
          source: "iana",
          extensions: ["saf"]
        },
        "application/vnd.yamaha.smaf-phrase": {
          source: "iana",
          extensions: ["spf"]
        },
        "application/vnd.yamaha.through-ngn": {
          source: "iana"
        },
        "application/vnd.yamaha.tunnel-udpencap": {
          source: "iana"
        },
        "application/vnd.yaoweme": {
          source: "iana"
        },
        "application/vnd.yellowriver-custom-menu": {
          source: "iana",
          extensions: ["cmp"]
        },
        "application/vnd.youtube.yt": {
          source: "iana"
        },
        "application/vnd.zul": {
          source: "iana",
          extensions: ["zir", "zirz"]
        },
        "application/vnd.zzazz.deck+xml": {
          source: "iana",
          compressible: true,
          extensions: ["zaz"]
        },
        "application/voicexml+xml": {
          source: "iana",
          compressible: true,
          extensions: ["vxml"]
        },
        "application/voucher-cms+json": {
          source: "iana",
          compressible: true
        },
        "application/vq-rtcpxr": {
          source: "iana"
        },
        "application/wasm": {
          source: "iana",
          compressible: true,
          extensions: ["wasm"]
        },
        "application/watcherinfo+xml": {
          source: "iana",
          compressible: true,
          extensions: ["wif"]
        },
        "application/webpush-options+json": {
          source: "iana",
          compressible: true
        },
        "application/whoispp-query": {
          source: "iana"
        },
        "application/whoispp-response": {
          source: "iana"
        },
        "application/widget": {
          source: "iana",
          extensions: ["wgt"]
        },
        "application/winhlp": {
          source: "apache",
          extensions: ["hlp"]
        },
        "application/wita": {
          source: "iana"
        },
        "application/wordperfect5.1": {
          source: "iana"
        },
        "application/wsdl+xml": {
          source: "iana",
          compressible: true,
          extensions: ["wsdl"]
        },
        "application/wspolicy+xml": {
          source: "iana",
          compressible: true,
          extensions: ["wspolicy"]
        },
        "application/x-7z-compressed": {
          source: "apache",
          compressible: false,
          extensions: ["7z"]
        },
        "application/x-abiword": {
          source: "apache",
          extensions: ["abw"]
        },
        "application/x-ace-compressed": {
          source: "apache",
          extensions: ["ace"]
        },
        "application/x-amf": {
          source: "apache"
        },
        "application/x-apple-diskimage": {
          source: "apache",
          extensions: ["dmg"]
        },
        "application/x-arj": {
          compressible: false,
          extensions: ["arj"]
        },
        "application/x-authorware-bin": {
          source: "apache",
          extensions: ["aab", "x32", "u32", "vox"]
        },
        "application/x-authorware-map": {
          source: "apache",
          extensions: ["aam"]
        },
        "application/x-authorware-seg": {
          source: "apache",
          extensions: ["aas"]
        },
        "application/x-bcpio": {
          source: "apache",
          extensions: ["bcpio"]
        },
        "application/x-bdoc": {
          compressible: false,
          extensions: ["bdoc"]
        },
        "application/x-bittorrent": {
          source: "apache",
          extensions: ["torrent"]
        },
        "application/x-blorb": {
          source: "apache",
          extensions: ["blb", "blorb"]
        },
        "application/x-bzip": {
          source: "apache",
          compressible: false,
          extensions: ["bz"]
        },
        "application/x-bzip2": {
          source: "apache",
          compressible: false,
          extensions: ["bz2", "boz"]
        },
        "application/x-cbr": {
          source: "apache",
          extensions: ["cbr", "cba", "cbt", "cbz", "cb7"]
        },
        "application/x-cdlink": {
          source: "apache",
          extensions: ["vcd"]
        },
        "application/x-cfs-compressed": {
          source: "apache",
          extensions: ["cfs"]
        },
        "application/x-chat": {
          source: "apache",
          extensions: ["chat"]
        },
        "application/x-chess-pgn": {
          source: "apache",
          extensions: ["pgn"]
        },
        "application/x-chrome-extension": {
          extensions: ["crx"]
        },
        "application/x-cocoa": {
          source: "nginx",
          extensions: ["cco"]
        },
        "application/x-compress": {
          source: "apache"
        },
        "application/x-conference": {
          source: "apache",
          extensions: ["nsc"]
        },
        "application/x-cpio": {
          source: "apache",
          extensions: ["cpio"]
        },
        "application/x-csh": {
          source: "apache",
          extensions: ["csh"]
        },
        "application/x-deb": {
          compressible: false
        },
        "application/x-debian-package": {
          source: "apache",
          extensions: ["deb", "udeb"]
        },
        "application/x-dgc-compressed": {
          source: "apache",
          extensions: ["dgc"]
        },
        "application/x-director": {
          source: "apache",
          extensions: ["dir", "dcr", "dxr", "cst", "cct", "cxt", "w3d", "fgd", "swa"]
        },
        "application/x-doom": {
          source: "apache",
          extensions: ["wad"]
        },
        "application/x-dtbncx+xml": {
          source: "apache",
          compressible: true,
          extensions: ["ncx"]
        },
        "application/x-dtbook+xml": {
          source: "apache",
          compressible: true,
          extensions: ["dtb"]
        },
        "application/x-dtbresource+xml": {
          source: "apache",
          compressible: true,
          extensions: ["res"]
        },
        "application/x-dvi": {
          source: "apache",
          compressible: false,
          extensions: ["dvi"]
        },
        "application/x-envoy": {
          source: "apache",
          extensions: ["evy"]
        },
        "application/x-eva": {
          source: "apache",
          extensions: ["eva"]
        },
        "application/x-font-bdf": {
          source: "apache",
          extensions: ["bdf"]
        },
        "application/x-font-dos": {
          source: "apache"
        },
        "application/x-font-framemaker": {
          source: "apache"
        },
        "application/x-font-ghostscript": {
          source: "apache",
          extensions: ["gsf"]
        },
        "application/x-font-libgrx": {
          source: "apache"
        },
        "application/x-font-linux-psf": {
          source: "apache",
          extensions: ["psf"]
        },
        "application/x-font-pcf": {
          source: "apache",
          extensions: ["pcf"]
        },
        "application/x-font-snf": {
          source: "apache",
          extensions: ["snf"]
        },
        "application/x-font-speedo": {
          source: "apache"
        },
        "application/x-font-sunos-news": {
          source: "apache"
        },
        "application/x-font-type1": {
          source: "apache",
          extensions: ["pfa", "pfb", "pfm", "afm"]
        },
        "application/x-font-vfont": {
          source: "apache"
        },
        "application/x-freearc": {
          source: "apache",
          extensions: ["arc"]
        },
        "application/x-futuresplash": {
          source: "apache",
          extensions: ["spl"]
        },
        "application/x-gca-compressed": {
          source: "apache",
          extensions: ["gca"]
        },
        "application/x-glulx": {
          source: "apache",
          extensions: ["ulx"]
        },
        "application/x-gnumeric": {
          source: "apache",
          extensions: ["gnumeric"]
        },
        "application/x-gramps-xml": {
          source: "apache",
          extensions: ["gramps"]
        },
        "application/x-gtar": {
          source: "apache",
          extensions: ["gtar"]
        },
        "application/x-gzip": {
          source: "apache"
        },
        "application/x-hdf": {
          source: "apache",
          extensions: ["hdf"]
        },
        "application/x-httpd-php": {
          compressible: true,
          extensions: ["php"]
        },
        "application/x-install-instructions": {
          source: "apache",
          extensions: ["install"]
        },
        "application/x-iso9660-image": {
          source: "apache",
          extensions: ["iso"]
        },
        "application/x-iwork-keynote-sffkey": {
          extensions: ["key"]
        },
        "application/x-iwork-numbers-sffnumbers": {
          extensions: ["numbers"]
        },
        "application/x-iwork-pages-sffpages": {
          extensions: ["pages"]
        },
        "application/x-java-archive-diff": {
          source: "nginx",
          extensions: ["jardiff"]
        },
        "application/x-java-jnlp-file": {
          source: "apache",
          compressible: false,
          extensions: ["jnlp"]
        },
        "application/x-javascript": {
          compressible: true
        },
        "application/x-keepass2": {
          extensions: ["kdbx"]
        },
        "application/x-latex": {
          source: "apache",
          compressible: false,
          extensions: ["latex"]
        },
        "application/x-lua-bytecode": {
          extensions: ["luac"]
        },
        "application/x-lzh-compressed": {
          source: "apache",
          extensions: ["lzh", "lha"]
        },
        "application/x-makeself": {
          source: "nginx",
          extensions: ["run"]
        },
        "application/x-mie": {
          source: "apache",
          extensions: ["mie"]
        },
        "application/x-mobipocket-ebook": {
          source: "apache",
          extensions: ["prc", "mobi"]
        },
        "application/x-mpegurl": {
          compressible: false
        },
        "application/x-ms-application": {
          source: "apache",
          extensions: ["application"]
        },
        "application/x-ms-shortcut": {
          source: "apache",
          extensions: ["lnk"]
        },
        "application/x-ms-wmd": {
          source: "apache",
          extensions: ["wmd"]
        },
        "application/x-ms-wmz": {
          source: "apache",
          extensions: ["wmz"]
        },
        "application/x-ms-xbap": {
          source: "apache",
          extensions: ["xbap"]
        },
        "application/x-msaccess": {
          source: "apache",
          extensions: ["mdb"]
        },
        "application/x-msbinder": {
          source: "apache",
          extensions: ["obd"]
        },
        "application/x-mscardfile": {
          source: "apache",
          extensions: ["crd"]
        },
        "application/x-msclip": {
          source: "apache",
          extensions: ["clp"]
        },
        "application/x-msdos-program": {
          extensions: ["exe"]
        },
        "application/x-msdownload": {
          source: "apache",
          extensions: ["exe", "dll", "com", "bat", "msi"]
        },
        "application/x-msmediaview": {
          source: "apache",
          extensions: ["mvb", "m13", "m14"]
        },
        "application/x-msmetafile": {
          source: "apache",
          extensions: ["wmf", "wmz", "emf", "emz"]
        },
        "application/x-msmoney": {
          source: "apache",
          extensions: ["mny"]
        },
        "application/x-mspublisher": {
          source: "apache",
          extensions: ["pub"]
        },
        "application/x-msschedule": {
          source: "apache",
          extensions: ["scd"]
        },
        "application/x-msterminal": {
          source: "apache",
          extensions: ["trm"]
        },
        "application/x-mswrite": {
          source: "apache",
          extensions: ["wri"]
        },
        "application/x-netcdf": {
          source: "apache",
          extensions: ["nc", "cdf"]
        },
        "application/x-ns-proxy-autoconfig": {
          compressible: true,
          extensions: ["pac"]
        },
        "application/x-nzb": {
          source: "apache",
          extensions: ["nzb"]
        },
        "application/x-perl": {
          source: "nginx",
          extensions: ["pl", "pm"]
        },
        "application/x-pilot": {
          source: "nginx",
          extensions: ["prc", "pdb"]
        },
        "application/x-pkcs12": {
          source: "apache",
          compressible: false,
          extensions: ["p12", "pfx"]
        },
        "application/x-pkcs7-certificates": {
          source: "apache",
          extensions: ["p7b", "spc"]
        },
        "application/x-pkcs7-certreqresp": {
          source: "apache",
          extensions: ["p7r"]
        },
        "application/x-pki-message": {
          source: "iana"
        },
        "application/x-rar-compressed": {
          source: "apache",
          compressible: false,
          extensions: ["rar"]
        },
        "application/x-redhat-package-manager": {
          source: "nginx",
          extensions: ["rpm"]
        },
        "application/x-research-info-systems": {
          source: "apache",
          extensions: ["ris"]
        },
        "application/x-sea": {
          source: "nginx",
          extensions: ["sea"]
        },
        "application/x-sh": {
          source: "apache",
          compressible: true,
          extensions: ["sh"]
        },
        "application/x-shar": {
          source: "apache",
          extensions: ["shar"]
        },
        "application/x-shockwave-flash": {
          source: "apache",
          compressible: false,
          extensions: ["swf"]
        },
        "application/x-silverlight-app": {
          source: "apache",
          extensions: ["xap"]
        },
        "application/x-sql": {
          source: "apache",
          extensions: ["sql"]
        },
        "application/x-stuffit": {
          source: "apache",
          compressible: false,
          extensions: ["sit"]
        },
        "application/x-stuffitx": {
          source: "apache",
          extensions: ["sitx"]
        },
        "application/x-subrip": {
          source: "apache",
          extensions: ["srt"]
        },
        "application/x-sv4cpio": {
          source: "apache",
          extensions: ["sv4cpio"]
        },
        "application/x-sv4crc": {
          source: "apache",
          extensions: ["sv4crc"]
        },
        "application/x-t3vm-image": {
          source: "apache",
          extensions: ["t3"]
        },
        "application/x-tads": {
          source: "apache",
          extensions: ["gam"]
        },
        "application/x-tar": {
          source: "apache",
          compressible: true,
          extensions: ["tar"]
        },
        "application/x-tcl": {
          source: "apache",
          extensions: ["tcl", "tk"]
        },
        "application/x-tex": {
          source: "apache",
          extensions: ["tex"]
        },
        "application/x-tex-tfm": {
          source: "apache",
          extensions: ["tfm"]
        },
        "application/x-texinfo": {
          source: "apache",
          extensions: ["texinfo", "texi"]
        },
        "application/x-tgif": {
          source: "apache",
          extensions: ["obj"]
        },
        "application/x-ustar": {
          source: "apache",
          extensions: ["ustar"]
        },
        "application/x-virtualbox-hdd": {
          compressible: true,
          extensions: ["hdd"]
        },
        "application/x-virtualbox-ova": {
          compressible: true,
          extensions: ["ova"]
        },
        "application/x-virtualbox-ovf": {
          compressible: true,
          extensions: ["ovf"]
        },
        "application/x-virtualbox-vbox": {
          compressible: true,
          extensions: ["vbox"]
        },
        "application/x-virtualbox-vbox-extpack": {
          compressible: false,
          extensions: ["vbox-extpack"]
        },
        "application/x-virtualbox-vdi": {
          compressible: true,
          extensions: ["vdi"]
        },
        "application/x-virtualbox-vhd": {
          compressible: true,
          extensions: ["vhd"]
        },
        "application/x-virtualbox-vmdk": {
          compressible: true,
          extensions: ["vmdk"]
        },
        "application/x-wais-source": {
          source: "apache",
          extensions: ["src"]
        },
        "application/x-web-app-manifest+json": {
          compressible: true,
          extensions: ["webapp"]
        },
        "application/x-www-form-urlencoded": {
          source: "iana",
          compressible: true
        },
        "application/x-x509-ca-cert": {
          source: "iana",
          extensions: ["der", "crt", "pem"]
        },
        "application/x-x509-ca-ra-cert": {
          source: "iana"
        },
        "application/x-x509-next-ca-cert": {
          source: "iana"
        },
        "application/x-xfig": {
          source: "apache",
          extensions: ["fig"]
        },
        "application/x-xliff+xml": {
          source: "apache",
          compressible: true,
          extensions: ["xlf"]
        },
        "application/x-xpinstall": {
          source: "apache",
          compressible: false,
          extensions: ["xpi"]
        },
        "application/x-xz": {
          source: "apache",
          extensions: ["xz"]
        },
        "application/x-zmachine": {
          source: "apache",
          extensions: ["z1", "z2", "z3", "z4", "z5", "z6", "z7", "z8"]
        },
        "application/x400-bp": {
          source: "iana"
        },
        "application/xacml+xml": {
          source: "iana",
          compressible: true
        },
        "application/xaml+xml": {
          source: "apache",
          compressible: true,
          extensions: ["xaml"]
        },
        "application/xcap-att+xml": {
          source: "iana",
          compressible: true,
          extensions: ["xav"]
        },
        "application/xcap-caps+xml": {
          source: "iana",
          compressible: true,
          extensions: ["xca"]
        },
        "application/xcap-diff+xml": {
          source: "iana",
          compressible: true,
          extensions: ["xdf"]
        },
        "application/xcap-el+xml": {
          source: "iana",
          compressible: true,
          extensions: ["xel"]
        },
        "application/xcap-error+xml": {
          source: "iana",
          compressible: true
        },
        "application/xcap-ns+xml": {
          source: "iana",
          compressible: true,
          extensions: ["xns"]
        },
        "application/xcon-conference-info+xml": {
          source: "iana",
          compressible: true
        },
        "application/xcon-conference-info-diff+xml": {
          source: "iana",
          compressible: true
        },
        "application/xenc+xml": {
          source: "iana",
          compressible: true,
          extensions: ["xenc"]
        },
        "application/xhtml+xml": {
          source: "iana",
          compressible: true,
          extensions: ["xhtml", "xht"]
        },
        "application/xhtml-voice+xml": {
          source: "apache",
          compressible: true
        },
        "application/xliff+xml": {
          source: "iana",
          compressible: true,
          extensions: ["xlf"]
        },
        "application/xml": {
          source: "iana",
          compressible: true,
          extensions: ["xml", "xsl", "xsd", "rng"]
        },
        "application/xml-dtd": {
          source: "iana",
          compressible: true,
          extensions: ["dtd"]
        },
        "application/xml-external-parsed-entity": {
          source: "iana"
        },
        "application/xml-patch+xml": {
          source: "iana",
          compressible: true
        },
        "application/xmpp+xml": {
          source: "iana",
          compressible: true
        },
        "application/xop+xml": {
          source: "iana",
          compressible: true,
          extensions: ["xop"]
        },
        "application/xproc+xml": {
          source: "apache",
          compressible: true,
          extensions: ["xpl"]
        },
        "application/xslt+xml": {
          source: "iana",
          compressible: true,
          extensions: ["xsl", "xslt"]
        },
        "application/xspf+xml": {
          source: "apache",
          compressible: true,
          extensions: ["xspf"]
        },
        "application/xv+xml": {
          source: "iana",
          compressible: true,
          extensions: ["mxml", "xhvml", "xvml", "xvm"]
        },
        "application/yang": {
          source: "iana",
          extensions: ["yang"]
        },
        "application/yang-data+json": {
          source: "iana",
          compressible: true
        },
        "application/yang-data+xml": {
          source: "iana",
          compressible: true
        },
        "application/yang-patch+json": {
          source: "iana",
          compressible: true
        },
        "application/yang-patch+xml": {
          source: "iana",
          compressible: true
        },
        "application/yin+xml": {
          source: "iana",
          compressible: true,
          extensions: ["yin"]
        },
        "application/zip": {
          source: "iana",
          compressible: false,
          extensions: ["zip"]
        },
        "application/zlib": {
          source: "iana"
        },
        "application/zstd": {
          source: "iana"
        },
        "audio/1d-interleaved-parityfec": {
          source: "iana"
        },
        "audio/32kadpcm": {
          source: "iana"
        },
        "audio/3gpp": {
          source: "iana",
          compressible: false,
          extensions: ["3gpp"]
        },
        "audio/3gpp2": {
          source: "iana"
        },
        "audio/aac": {
          source: "iana"
        },
        "audio/ac3": {
          source: "iana"
        },
        "audio/adpcm": {
          source: "apache",
          extensions: ["adp"]
        },
        "audio/amr": {
          source: "iana",
          extensions: ["amr"]
        },
        "audio/amr-wb": {
          source: "iana"
        },
        "audio/amr-wb+": {
          source: "iana"
        },
        "audio/aptx": {
          source: "iana"
        },
        "audio/asc": {
          source: "iana"
        },
        "audio/atrac-advanced-lossless": {
          source: "iana"
        },
        "audio/atrac-x": {
          source: "iana"
        },
        "audio/atrac3": {
          source: "iana"
        },
        "audio/basic": {
          source: "iana",
          compressible: false,
          extensions: ["au", "snd"]
        },
        "audio/bv16": {
          source: "iana"
        },
        "audio/bv32": {
          source: "iana"
        },
        "audio/clearmode": {
          source: "iana"
        },
        "audio/cn": {
          source: "iana"
        },
        "audio/dat12": {
          source: "iana"
        },
        "audio/dls": {
          source: "iana"
        },
        "audio/dsr-es201108": {
          source: "iana"
        },
        "audio/dsr-es202050": {
          source: "iana"
        },
        "audio/dsr-es202211": {
          source: "iana"
        },
        "audio/dsr-es202212": {
          source: "iana"
        },
        "audio/dv": {
          source: "iana"
        },
        "audio/dvi4": {
          source: "iana"
        },
        "audio/eac3": {
          source: "iana"
        },
        "audio/encaprtp": {
          source: "iana"
        },
        "audio/evrc": {
          source: "iana"
        },
        "audio/evrc-qcp": {
          source: "iana"
        },
        "audio/evrc0": {
          source: "iana"
        },
        "audio/evrc1": {
          source: "iana"
        },
        "audio/evrcb": {
          source: "iana"
        },
        "audio/evrcb0": {
          source: "iana"
        },
        "audio/evrcb1": {
          source: "iana"
        },
        "audio/evrcnw": {
          source: "iana"
        },
        "audio/evrcnw0": {
          source: "iana"
        },
        "audio/evrcnw1": {
          source: "iana"
        },
        "audio/evrcwb": {
          source: "iana"
        },
        "audio/evrcwb0": {
          source: "iana"
        },
        "audio/evrcwb1": {
          source: "iana"
        },
        "audio/evs": {
          source: "iana"
        },
        "audio/flexfec": {
          source: "iana"
        },
        "audio/fwdred": {
          source: "iana"
        },
        "audio/g711-0": {
          source: "iana"
        },
        "audio/g719": {
          source: "iana"
        },
        "audio/g722": {
          source: "iana"
        },
        "audio/g7221": {
          source: "iana"
        },
        "audio/g723": {
          source: "iana"
        },
        "audio/g726-16": {
          source: "iana"
        },
        "audio/g726-24": {
          source: "iana"
        },
        "audio/g726-32": {
          source: "iana"
        },
        "audio/g726-40": {
          source: "iana"
        },
        "audio/g728": {
          source: "iana"
        },
        "audio/g729": {
          source: "iana"
        },
        "audio/g7291": {
          source: "iana"
        },
        "audio/g729d": {
          source: "iana"
        },
        "audio/g729e": {
          source: "iana"
        },
        "audio/gsm": {
          source: "iana"
        },
        "audio/gsm-efr": {
          source: "iana"
        },
        "audio/gsm-hr-08": {
          source: "iana"
        },
        "audio/ilbc": {
          source: "iana"
        },
        "audio/ip-mr_v2.5": {
          source: "iana"
        },
        "audio/isac": {
          source: "apache"
        },
        "audio/l16": {
          source: "iana"
        },
        "audio/l20": {
          source: "iana"
        },
        "audio/l24": {
          source: "iana",
          compressible: false
        },
        "audio/l8": {
          source: "iana"
        },
        "audio/lpc": {
          source: "iana"
        },
        "audio/melp": {
          source: "iana"
        },
        "audio/melp1200": {
          source: "iana"
        },
        "audio/melp2400": {
          source: "iana"
        },
        "audio/melp600": {
          source: "iana"
        },
        "audio/mhas": {
          source: "iana"
        },
        "audio/midi": {
          source: "apache",
          extensions: ["mid", "midi", "kar", "rmi"]
        },
        "audio/mobile-xmf": {
          source: "iana",
          extensions: ["mxmf"]
        },
        "audio/mp3": {
          compressible: false,
          extensions: ["mp3"]
        },
        "audio/mp4": {
          source: "iana",
          compressible: false,
          extensions: ["m4a", "mp4a"]
        },
        "audio/mp4a-latm": {
          source: "iana"
        },
        "audio/mpa": {
          source: "iana"
        },
        "audio/mpa-robust": {
          source: "iana"
        },
        "audio/mpeg": {
          source: "iana",
          compressible: false,
          extensions: ["mpga", "mp2", "mp2a", "mp3", "m2a", "m3a"]
        },
        "audio/mpeg4-generic": {
          source: "iana"
        },
        "audio/musepack": {
          source: "apache"
        },
        "audio/ogg": {
          source: "iana",
          compressible: false,
          extensions: ["oga", "ogg", "spx", "opus"]
        },
        "audio/opus": {
          source: "iana"
        },
        "audio/parityfec": {
          source: "iana"
        },
        "audio/pcma": {
          source: "iana"
        },
        "audio/pcma-wb": {
          source: "iana"
        },
        "audio/pcmu": {
          source: "iana"
        },
        "audio/pcmu-wb": {
          source: "iana"
        },
        "audio/prs.sid": {
          source: "iana"
        },
        "audio/qcelp": {
          source: "iana"
        },
        "audio/raptorfec": {
          source: "iana"
        },
        "audio/red": {
          source: "iana"
        },
        "audio/rtp-enc-aescm128": {
          source: "iana"
        },
        "audio/rtp-midi": {
          source: "iana"
        },
        "audio/rtploopback": {
          source: "iana"
        },
        "audio/rtx": {
          source: "iana"
        },
        "audio/s3m": {
          source: "apache",
          extensions: ["s3m"]
        },
        "audio/scip": {
          source: "iana"
        },
        "audio/silk": {
          source: "apache",
          extensions: ["sil"]
        },
        "audio/smv": {
          source: "iana"
        },
        "audio/smv-qcp": {
          source: "iana"
        },
        "audio/smv0": {
          source: "iana"
        },
        "audio/sofa": {
          source: "iana"
        },
        "audio/sp-midi": {
          source: "iana"
        },
        "audio/speex": {
          source: "iana"
        },
        "audio/t140c": {
          source: "iana"
        },
        "audio/t38": {
          source: "iana"
        },
        "audio/telephone-event": {
          source: "iana"
        },
        "audio/tetra_acelp": {
          source: "iana"
        },
        "audio/tetra_acelp_bb": {
          source: "iana"
        },
        "audio/tone": {
          source: "iana"
        },
        "audio/tsvcis": {
          source: "iana"
        },
        "audio/uemclip": {
          source: "iana"
        },
        "audio/ulpfec": {
          source: "iana"
        },
        "audio/usac": {
          source: "iana"
        },
        "audio/vdvi": {
          source: "iana"
        },
        "audio/vmr-wb": {
          source: "iana"
        },
        "audio/vnd.3gpp.iufp": {
          source: "iana"
        },
        "audio/vnd.4sb": {
          source: "iana"
        },
        "audio/vnd.audiokoz": {
          source: "iana"
        },
        "audio/vnd.celp": {
          source: "iana"
        },
        "audio/vnd.cisco.nse": {
          source: "iana"
        },
        "audio/vnd.cmles.radio-events": {
          source: "iana"
        },
        "audio/vnd.cns.anp1": {
          source: "iana"
        },
        "audio/vnd.cns.inf1": {
          source: "iana"
        },
        "audio/vnd.dece.audio": {
          source: "iana",
          extensions: ["uva", "uvva"]
        },
        "audio/vnd.digital-winds": {
          source: "iana",
          extensions: ["eol"]
        },
        "audio/vnd.dlna.adts": {
          source: "iana"
        },
        "audio/vnd.dolby.heaac.1": {
          source: "iana"
        },
        "audio/vnd.dolby.heaac.2": {
          source: "iana"
        },
        "audio/vnd.dolby.mlp": {
          source: "iana"
        },
        "audio/vnd.dolby.mps": {
          source: "iana"
        },
        "audio/vnd.dolby.pl2": {
          source: "iana"
        },
        "audio/vnd.dolby.pl2x": {
          source: "iana"
        },
        "audio/vnd.dolby.pl2z": {
          source: "iana"
        },
        "audio/vnd.dolby.pulse.1": {
          source: "iana"
        },
        "audio/vnd.dra": {
          source: "iana",
          extensions: ["dra"]
        },
        "audio/vnd.dts": {
          source: "iana",
          extensions: ["dts"]
        },
        "audio/vnd.dts.hd": {
          source: "iana",
          extensions: ["dtshd"]
        },
        "audio/vnd.dts.uhd": {
          source: "iana"
        },
        "audio/vnd.dvb.file": {
          source: "iana"
        },
        "audio/vnd.everad.plj": {
          source: "iana"
        },
        "audio/vnd.hns.audio": {
          source: "iana"
        },
        "audio/vnd.lucent.voice": {
          source: "iana",
          extensions: ["lvp"]
        },
        "audio/vnd.ms-playready.media.pya": {
          source: "iana",
          extensions: ["pya"]
        },
        "audio/vnd.nokia.mobile-xmf": {
          source: "iana"
        },
        "audio/vnd.nortel.vbk": {
          source: "iana"
        },
        "audio/vnd.nuera.ecelp4800": {
          source: "iana",
          extensions: ["ecelp4800"]
        },
        "audio/vnd.nuera.ecelp7470": {
          source: "iana",
          extensions: ["ecelp7470"]
        },
        "audio/vnd.nuera.ecelp9600": {
          source: "iana",
          extensions: ["ecelp9600"]
        },
        "audio/vnd.octel.sbc": {
          source: "iana"
        },
        "audio/vnd.presonus.multitrack": {
          source: "iana"
        },
        "audio/vnd.qcelp": {
          source: "iana"
        },
        "audio/vnd.rhetorex.32kadpcm": {
          source: "iana"
        },
        "audio/vnd.rip": {
          source: "iana",
          extensions: ["rip"]
        },
        "audio/vnd.rn-realaudio": {
          compressible: false
        },
        "audio/vnd.sealedmedia.softseal.mpeg": {
          source: "iana"
        },
        "audio/vnd.vmx.cvsd": {
          source: "iana"
        },
        "audio/vnd.wave": {
          compressible: false
        },
        "audio/vorbis": {
          source: "iana",
          compressible: false
        },
        "audio/vorbis-config": {
          source: "iana"
        },
        "audio/wav": {
          compressible: false,
          extensions: ["wav"]
        },
        "audio/wave": {
          compressible: false,
          extensions: ["wav"]
        },
        "audio/webm": {
          source: "apache",
          compressible: false,
          extensions: ["weba"]
        },
        "audio/x-aac": {
          source: "apache",
          compressible: false,
          extensions: ["aac"]
        },
        "audio/x-aiff": {
          source: "apache",
          extensions: ["aif", "aiff", "aifc"]
        },
        "audio/x-caf": {
          source: "apache",
          compressible: false,
          extensions: ["caf"]
        },
        "audio/x-flac": {
          source: "apache",
          extensions: ["flac"]
        },
        "audio/x-m4a": {
          source: "nginx",
          extensions: ["m4a"]
        },
        "audio/x-matroska": {
          source: "apache",
          extensions: ["mka"]
        },
        "audio/x-mpegurl": {
          source: "apache",
          extensions: ["m3u"]
        },
        "audio/x-ms-wax": {
          source: "apache",
          extensions: ["wax"]
        },
        "audio/x-ms-wma": {
          source: "apache",
          extensions: ["wma"]
        },
        "audio/x-pn-realaudio": {
          source: "apache",
          extensions: ["ram", "ra"]
        },
        "audio/x-pn-realaudio-plugin": {
          source: "apache",
          extensions: ["rmp"]
        },
        "audio/x-realaudio": {
          source: "nginx",
          extensions: ["ra"]
        },
        "audio/x-tta": {
          source: "apache"
        },
        "audio/x-wav": {
          source: "apache",
          extensions: ["wav"]
        },
        "audio/xm": {
          source: "apache",
          extensions: ["xm"]
        },
        "chemical/x-cdx": {
          source: "apache",
          extensions: ["cdx"]
        },
        "chemical/x-cif": {
          source: "apache",
          extensions: ["cif"]
        },
        "chemical/x-cmdf": {
          source: "apache",
          extensions: ["cmdf"]
        },
        "chemical/x-cml": {
          source: "apache",
          extensions: ["cml"]
        },
        "chemical/x-csml": {
          source: "apache",
          extensions: ["csml"]
        },
        "chemical/x-pdb": {
          source: "apache"
        },
        "chemical/x-xyz": {
          source: "apache",
          extensions: ["xyz"]
        },
        "font/collection": {
          source: "iana",
          extensions: ["ttc"]
        },
        "font/otf": {
          source: "iana",
          compressible: true,
          extensions: ["otf"]
        },
        "font/sfnt": {
          source: "iana"
        },
        "font/ttf": {
          source: "iana",
          compressible: true,
          extensions: ["ttf"]
        },
        "font/woff": {
          source: "iana",
          extensions: ["woff"]
        },
        "font/woff2": {
          source: "iana",
          extensions: ["woff2"]
        },
        "image/aces": {
          source: "iana",
          extensions: ["exr"]
        },
        "image/apng": {
          compressible: false,
          extensions: ["apng"]
        },
        "image/avci": {
          source: "iana",
          extensions: ["avci"]
        },
        "image/avcs": {
          source: "iana",
          extensions: ["avcs"]
        },
        "image/avif": {
          source: "iana",
          compressible: false,
          extensions: ["avif"]
        },
        "image/bmp": {
          source: "iana",
          compressible: true,
          extensions: ["bmp"]
        },
        "image/cgm": {
          source: "iana",
          extensions: ["cgm"]
        },
        "image/dicom-rle": {
          source: "iana",
          extensions: ["drle"]
        },
        "image/emf": {
          source: "iana",
          extensions: ["emf"]
        },
        "image/fits": {
          source: "iana",
          extensions: ["fits"]
        },
        "image/g3fax": {
          source: "iana",
          extensions: ["g3"]
        },
        "image/gif": {
          source: "iana",
          compressible: false,
          extensions: ["gif"]
        },
        "image/heic": {
          source: "iana",
          extensions: ["heic"]
        },
        "image/heic-sequence": {
          source: "iana",
          extensions: ["heics"]
        },
        "image/heif": {
          source: "iana",
          extensions: ["heif"]
        },
        "image/heif-sequence": {
          source: "iana",
          extensions: ["heifs"]
        },
        "image/hej2k": {
          source: "iana",
          extensions: ["hej2"]
        },
        "image/hsj2": {
          source: "iana",
          extensions: ["hsj2"]
        },
        "image/ief": {
          source: "iana",
          extensions: ["ief"]
        },
        "image/jls": {
          source: "iana",
          extensions: ["jls"]
        },
        "image/jp2": {
          source: "iana",
          compressible: false,
          extensions: ["jp2", "jpg2"]
        },
        "image/jpeg": {
          source: "iana",
          compressible: false,
          extensions: ["jpeg", "jpg", "jpe"]
        },
        "image/jph": {
          source: "iana",
          extensions: ["jph"]
        },
        "image/jphc": {
          source: "iana",
          extensions: ["jhc"]
        },
        "image/jpm": {
          source: "iana",
          compressible: false,
          extensions: ["jpm"]
        },
        "image/jpx": {
          source: "iana",
          compressible: false,
          extensions: ["jpx", "jpf"]
        },
        "image/jxr": {
          source: "iana",
          extensions: ["jxr"]
        },
        "image/jxra": {
          source: "iana",
          extensions: ["jxra"]
        },
        "image/jxrs": {
          source: "iana",
          extensions: ["jxrs"]
        },
        "image/jxs": {
          source: "iana",
          extensions: ["jxs"]
        },
        "image/jxsc": {
          source: "iana",
          extensions: ["jxsc"]
        },
        "image/jxsi": {
          source: "iana",
          extensions: ["jxsi"]
        },
        "image/jxss": {
          source: "iana",
          extensions: ["jxss"]
        },
        "image/ktx": {
          source: "iana",
          extensions: ["ktx"]
        },
        "image/ktx2": {
          source: "iana",
          extensions: ["ktx2"]
        },
        "image/naplps": {
          source: "iana"
        },
        "image/pjpeg": {
          compressible: false
        },
        "image/png": {
          source: "iana",
          compressible: false,
          extensions: ["png"]
        },
        "image/prs.btif": {
          source: "iana",
          extensions: ["btif"]
        },
        "image/prs.pti": {
          source: "iana",
          extensions: ["pti"]
        },
        "image/pwg-raster": {
          source: "iana"
        },
        "image/sgi": {
          source: "apache",
          extensions: ["sgi"]
        },
        "image/svg+xml": {
          source: "iana",
          compressible: true,
          extensions: ["svg", "svgz"]
        },
        "image/t38": {
          source: "iana",
          extensions: ["t38"]
        },
        "image/tiff": {
          source: "iana",
          compressible: false,
          extensions: ["tif", "tiff"]
        },
        "image/tiff-fx": {
          source: "iana",
          extensions: ["tfx"]
        },
        "image/vnd.adobe.photoshop": {
          source: "iana",
          compressible: true,
          extensions: ["psd"]
        },
        "image/vnd.airzip.accelerator.azv": {
          source: "iana",
          extensions: ["azv"]
        },
        "image/vnd.cns.inf2": {
          source: "iana"
        },
        "image/vnd.dece.graphic": {
          source: "iana",
          extensions: ["uvi", "uvvi", "uvg", "uvvg"]
        },
        "image/vnd.djvu": {
          source: "iana",
          extensions: ["djvu", "djv"]
        },
        "image/vnd.dvb.subtitle": {
          source: "iana",
          extensions: ["sub"]
        },
        "image/vnd.dwg": {
          source: "iana",
          extensions: ["dwg"]
        },
        "image/vnd.dxf": {
          source: "iana",
          extensions: ["dxf"]
        },
        "image/vnd.fastbidsheet": {
          source: "iana",
          extensions: ["fbs"]
        },
        "image/vnd.fpx": {
          source: "iana",
          extensions: ["fpx"]
        },
        "image/vnd.fst": {
          source: "iana",
          extensions: ["fst"]
        },
        "image/vnd.fujixerox.edmics-mmr": {
          source: "iana",
          extensions: ["mmr"]
        },
        "image/vnd.fujixerox.edmics-rlc": {
          source: "iana",
          extensions: ["rlc"]
        },
        "image/vnd.globalgraphics.pgb": {
          source: "iana"
        },
        "image/vnd.microsoft.icon": {
          source: "iana",
          compressible: true,
          extensions: ["ico"]
        },
        "image/vnd.mix": {
          source: "iana"
        },
        "image/vnd.mozilla.apng": {
          source: "iana"
        },
        "image/vnd.ms-dds": {
          compressible: true,
          extensions: ["dds"]
        },
        "image/vnd.ms-modi": {
          source: "iana",
          extensions: ["mdi"]
        },
        "image/vnd.ms-photo": {
          source: "apache",
          extensions: ["wdp"]
        },
        "image/vnd.net-fpx": {
          source: "iana",
          extensions: ["npx"]
        },
        "image/vnd.pco.b16": {
          source: "iana",
          extensions: ["b16"]
        },
        "image/vnd.radiance": {
          source: "iana"
        },
        "image/vnd.sealed.png": {
          source: "iana"
        },
        "image/vnd.sealedmedia.softseal.gif": {
          source: "iana"
        },
        "image/vnd.sealedmedia.softseal.jpg": {
          source: "iana"
        },
        "image/vnd.svf": {
          source: "iana"
        },
        "image/vnd.tencent.tap": {
          source: "iana",
          extensions: ["tap"]
        },
        "image/vnd.valve.source.texture": {
          source: "iana",
          extensions: ["vtf"]
        },
        "image/vnd.wap.wbmp": {
          source: "iana",
          extensions: ["wbmp"]
        },
        "image/vnd.xiff": {
          source: "iana",
          extensions: ["xif"]
        },
        "image/vnd.zbrush.pcx": {
          source: "iana",
          extensions: ["pcx"]
        },
        "image/webp": {
          source: "apache",
          extensions: ["webp"]
        },
        "image/wmf": {
          source: "iana",
          extensions: ["wmf"]
        },
        "image/x-3ds": {
          source: "apache",
          extensions: ["3ds"]
        },
        "image/x-cmu-raster": {
          source: "apache",
          extensions: ["ras"]
        },
        "image/x-cmx": {
          source: "apache",
          extensions: ["cmx"]
        },
        "image/x-freehand": {
          source: "apache",
          extensions: ["fh", "fhc", "fh4", "fh5", "fh7"]
        },
        "image/x-icon": {
          source: "apache",
          compressible: true,
          extensions: ["ico"]
        },
        "image/x-jng": {
          source: "nginx",
          extensions: ["jng"]
        },
        "image/x-mrsid-image": {
          source: "apache",
          extensions: ["sid"]
        },
        "image/x-ms-bmp": {
          source: "nginx",
          compressible: true,
          extensions: ["bmp"]
        },
        "image/x-pcx": {
          source: "apache",
          extensions: ["pcx"]
        },
        "image/x-pict": {
          source: "apache",
          extensions: ["pic", "pct"]
        },
        "image/x-portable-anymap": {
          source: "apache",
          extensions: ["pnm"]
        },
        "image/x-portable-bitmap": {
          source: "apache",
          extensions: ["pbm"]
        },
        "image/x-portable-graymap": {
          source: "apache",
          extensions: ["pgm"]
        },
        "image/x-portable-pixmap": {
          source: "apache",
          extensions: ["ppm"]
        },
        "image/x-rgb": {
          source: "apache",
          extensions: ["rgb"]
        },
        "image/x-tga": {
          source: "apache",
          extensions: ["tga"]
        },
        "image/x-xbitmap": {
          source: "apache",
          extensions: ["xbm"]
        },
        "image/x-xcf": {
          compressible: false
        },
        "image/x-xpixmap": {
          source: "apache",
          extensions: ["xpm"]
        },
        "image/x-xwindowdump": {
          source: "apache",
          extensions: ["xwd"]
        },
        "message/cpim": {
          source: "iana"
        },
        "message/delivery-status": {
          source: "iana"
        },
        "message/disposition-notification": {
          source: "iana",
          extensions: [
            "disposition-notification"
          ]
        },
        "message/external-body": {
          source: "iana"
        },
        "message/feedback-report": {
          source: "iana"
        },
        "message/global": {
          source: "iana",
          extensions: ["u8msg"]
        },
        "message/global-delivery-status": {
          source: "iana",
          extensions: ["u8dsn"]
        },
        "message/global-disposition-notification": {
          source: "iana",
          extensions: ["u8mdn"]
        },
        "message/global-headers": {
          source: "iana",
          extensions: ["u8hdr"]
        },
        "message/http": {
          source: "iana",
          compressible: false
        },
        "message/imdn+xml": {
          source: "iana",
          compressible: true
        },
        "message/news": {
          source: "iana"
        },
        "message/partial": {
          source: "iana",
          compressible: false
        },
        "message/rfc822": {
          source: "iana",
          compressible: true,
          extensions: ["eml", "mime"]
        },
        "message/s-http": {
          source: "iana"
        },
        "message/sip": {
          source: "iana"
        },
        "message/sipfrag": {
          source: "iana"
        },
        "message/tracking-status": {
          source: "iana"
        },
        "message/vnd.si.simp": {
          source: "iana"
        },
        "message/vnd.wfa.wsc": {
          source: "iana",
          extensions: ["wsc"]
        },
        "model/3mf": {
          source: "iana",
          extensions: ["3mf"]
        },
        "model/e57": {
          source: "iana"
        },
        "model/gltf+json": {
          source: "iana",
          compressible: true,
          extensions: ["gltf"]
        },
        "model/gltf-binary": {
          source: "iana",
          compressible: true,
          extensions: ["glb"]
        },
        "model/iges": {
          source: "iana",
          compressible: false,
          extensions: ["igs", "iges"]
        },
        "model/mesh": {
          source: "iana",
          compressible: false,
          extensions: ["msh", "mesh", "silo"]
        },
        "model/mtl": {
          source: "iana",
          extensions: ["mtl"]
        },
        "model/obj": {
          source: "iana",
          extensions: ["obj"]
        },
        "model/step": {
          source: "iana"
        },
        "model/step+xml": {
          source: "iana",
          compressible: true,
          extensions: ["stpx"]
        },
        "model/step+zip": {
          source: "iana",
          compressible: false,
          extensions: ["stpz"]
        },
        "model/step-xml+zip": {
          source: "iana",
          compressible: false,
          extensions: ["stpxz"]
        },
        "model/stl": {
          source: "iana",
          extensions: ["stl"]
        },
        "model/vnd.collada+xml": {
          source: "iana",
          compressible: true,
          extensions: ["dae"]
        },
        "model/vnd.dwf": {
          source: "iana",
          extensions: ["dwf"]
        },
        "model/vnd.flatland.3dml": {
          source: "iana"
        },
        "model/vnd.gdl": {
          source: "iana",
          extensions: ["gdl"]
        },
        "model/vnd.gs-gdl": {
          source: "apache"
        },
        "model/vnd.gs.gdl": {
          source: "iana"
        },
        "model/vnd.gtw": {
          source: "iana",
          extensions: ["gtw"]
        },
        "model/vnd.moml+xml": {
          source: "iana",
          compressible: true
        },
        "model/vnd.mts": {
          source: "iana",
          extensions: ["mts"]
        },
        "model/vnd.opengex": {
          source: "iana",
          extensions: ["ogex"]
        },
        "model/vnd.parasolid.transmit.binary": {
          source: "iana",
          extensions: ["x_b"]
        },
        "model/vnd.parasolid.transmit.text": {
          source: "iana",
          extensions: ["x_t"]
        },
        "model/vnd.pytha.pyox": {
          source: "iana"
        },
        "model/vnd.rosette.annotated-data-model": {
          source: "iana"
        },
        "model/vnd.sap.vds": {
          source: "iana",
          extensions: ["vds"]
        },
        "model/vnd.usdz+zip": {
          source: "iana",
          compressible: false,
          extensions: ["usdz"]
        },
        "model/vnd.valve.source.compiled-map": {
          source: "iana",
          extensions: ["bsp"]
        },
        "model/vnd.vtu": {
          source: "iana",
          extensions: ["vtu"]
        },
        "model/vrml": {
          source: "iana",
          compressible: false,
          extensions: ["wrl", "vrml"]
        },
        "model/x3d+binary": {
          source: "apache",
          compressible: false,
          extensions: ["x3db", "x3dbz"]
        },
        "model/x3d+fastinfoset": {
          source: "iana",
          extensions: ["x3db"]
        },
        "model/x3d+vrml": {
          source: "apache",
          compressible: false,
          extensions: ["x3dv", "x3dvz"]
        },
        "model/x3d+xml": {
          source: "iana",
          compressible: true,
          extensions: ["x3d", "x3dz"]
        },
        "model/x3d-vrml": {
          source: "iana",
          extensions: ["x3dv"]
        },
        "multipart/alternative": {
          source: "iana",
          compressible: false
        },
        "multipart/appledouble": {
          source: "iana"
        },
        "multipart/byteranges": {
          source: "iana"
        },
        "multipart/digest": {
          source: "iana"
        },
        "multipart/encrypted": {
          source: "iana",
          compressible: false
        },
        "multipart/form-data": {
          source: "iana",
          compressible: false
        },
        "multipart/header-set": {
          source: "iana"
        },
        "multipart/mixed": {
          source: "iana"
        },
        "multipart/multilingual": {
          source: "iana"
        },
        "multipart/parallel": {
          source: "iana"
        },
        "multipart/related": {
          source: "iana",
          compressible: false
        },
        "multipart/report": {
          source: "iana"
        },
        "multipart/signed": {
          source: "iana",
          compressible: false
        },
        "multipart/vnd.bint.med-plus": {
          source: "iana"
        },
        "multipart/voice-message": {
          source: "iana"
        },
        "multipart/x-mixed-replace": {
          source: "iana"
        },
        "text/1d-interleaved-parityfec": {
          source: "iana"
        },
        "text/cache-manifest": {
          source: "iana",
          compressible: true,
          extensions: ["appcache", "manifest"]
        },
        "text/calendar": {
          source: "iana",
          extensions: ["ics", "ifb"]
        },
        "text/calender": {
          compressible: true
        },
        "text/cmd": {
          compressible: true
        },
        "text/coffeescript": {
          extensions: ["coffee", "litcoffee"]
        },
        "text/cql": {
          source: "iana"
        },
        "text/cql-expression": {
          source: "iana"
        },
        "text/cql-identifier": {
          source: "iana"
        },
        "text/css": {
          source: "iana",
          charset: "UTF-8",
          compressible: true,
          extensions: ["css"]
        },
        "text/csv": {
          source: "iana",
          compressible: true,
          extensions: ["csv"]
        },
        "text/csv-schema": {
          source: "iana"
        },
        "text/directory": {
          source: "iana"
        },
        "text/dns": {
          source: "iana"
        },
        "text/ecmascript": {
          source: "iana"
        },
        "text/encaprtp": {
          source: "iana"
        },
        "text/enriched": {
          source: "iana"
        },
        "text/fhirpath": {
          source: "iana"
        },
        "text/flexfec": {
          source: "iana"
        },
        "text/fwdred": {
          source: "iana"
        },
        "text/gff3": {
          source: "iana"
        },
        "text/grammar-ref-list": {
          source: "iana"
        },
        "text/html": {
          source: "iana",
          compressible: true,
          extensions: ["html", "htm", "shtml"]
        },
        "text/jade": {
          extensions: ["jade"]
        },
        "text/javascript": {
          source: "iana",
          compressible: true
        },
        "text/jcr-cnd": {
          source: "iana"
        },
        "text/jsx": {
          compressible: true,
          extensions: ["jsx"]
        },
        "text/less": {
          compressible: true,
          extensions: ["less"]
        },
        "text/markdown": {
          source: "iana",
          compressible: true,
          extensions: ["markdown", "md"]
        },
        "text/mathml": {
          source: "nginx",
          extensions: ["mml"]
        },
        "text/mdx": {
          compressible: true,
          extensions: ["mdx"]
        },
        "text/mizar": {
          source: "iana"
        },
        "text/n3": {
          source: "iana",
          charset: "UTF-8",
          compressible: true,
          extensions: ["n3"]
        },
        "text/parameters": {
          source: "iana",
          charset: "UTF-8"
        },
        "text/parityfec": {
          source: "iana"
        },
        "text/plain": {
          source: "iana",
          compressible: true,
          extensions: ["txt", "text", "conf", "def", "list", "log", "in", "ini"]
        },
        "text/provenance-notation": {
          source: "iana",
          charset: "UTF-8"
        },
        "text/prs.fallenstein.rst": {
          source: "iana"
        },
        "text/prs.lines.tag": {
          source: "iana",
          extensions: ["dsc"]
        },
        "text/prs.prop.logic": {
          source: "iana"
        },
        "text/raptorfec": {
          source: "iana"
        },
        "text/red": {
          source: "iana"
        },
        "text/rfc822-headers": {
          source: "iana"
        },
        "text/richtext": {
          source: "iana",
          compressible: true,
          extensions: ["rtx"]
        },
        "text/rtf": {
          source: "iana",
          compressible: true,
          extensions: ["rtf"]
        },
        "text/rtp-enc-aescm128": {
          source: "iana"
        },
        "text/rtploopback": {
          source: "iana"
        },
        "text/rtx": {
          source: "iana"
        },
        "text/sgml": {
          source: "iana",
          extensions: ["sgml", "sgm"]
        },
        "text/shaclc": {
          source: "iana"
        },
        "text/shex": {
          source: "iana",
          extensions: ["shex"]
        },
        "text/slim": {
          extensions: ["slim", "slm"]
        },
        "text/spdx": {
          source: "iana",
          extensions: ["spdx"]
        },
        "text/strings": {
          source: "iana"
        },
        "text/stylus": {
          extensions: ["stylus", "styl"]
        },
        "text/t140": {
          source: "iana"
        },
        "text/tab-separated-values": {
          source: "iana",
          compressible: true,
          extensions: ["tsv"]
        },
        "text/troff": {
          source: "iana",
          extensions: ["t", "tr", "roff", "man", "me", "ms"]
        },
        "text/turtle": {
          source: "iana",
          charset: "UTF-8",
          extensions: ["ttl"]
        },
        "text/ulpfec": {
          source: "iana"
        },
        "text/uri-list": {
          source: "iana",
          compressible: true,
          extensions: ["uri", "uris", "urls"]
        },
        "text/vcard": {
          source: "iana",
          compressible: true,
          extensions: ["vcard"]
        },
        "text/vnd.a": {
          source: "iana"
        },
        "text/vnd.abc": {
          source: "iana"
        },
        "text/vnd.ascii-art": {
          source: "iana"
        },
        "text/vnd.curl": {
          source: "iana",
          extensions: ["curl"]
        },
        "text/vnd.curl.dcurl": {
          source: "apache",
          extensions: ["dcurl"]
        },
        "text/vnd.curl.mcurl": {
          source: "apache",
          extensions: ["mcurl"]
        },
        "text/vnd.curl.scurl": {
          source: "apache",
          extensions: ["scurl"]
        },
        "text/vnd.debian.copyright": {
          source: "iana",
          charset: "UTF-8"
        },
        "text/vnd.dmclientscript": {
          source: "iana"
        },
        "text/vnd.dvb.subtitle": {
          source: "iana",
          extensions: ["sub"]
        },
        "text/vnd.esmertec.theme-descriptor": {
          source: "iana",
          charset: "UTF-8"
        },
        "text/vnd.familysearch.gedcom": {
          source: "iana",
          extensions: ["ged"]
        },
        "text/vnd.ficlab.flt": {
          source: "iana"
        },
        "text/vnd.fly": {
          source: "iana",
          extensions: ["fly"]
        },
        "text/vnd.fmi.flexstor": {
          source: "iana",
          extensions: ["flx"]
        },
        "text/vnd.gml": {
          source: "iana"
        },
        "text/vnd.graphviz": {
          source: "iana",
          extensions: ["gv"]
        },
        "text/vnd.hans": {
          source: "iana"
        },
        "text/vnd.hgl": {
          source: "iana"
        },
        "text/vnd.in3d.3dml": {
          source: "iana",
          extensions: ["3dml"]
        },
        "text/vnd.in3d.spot": {
          source: "iana",
          extensions: ["spot"]
        },
        "text/vnd.iptc.newsml": {
          source: "iana"
        },
        "text/vnd.iptc.nitf": {
          source: "iana"
        },
        "text/vnd.latex-z": {
          source: "iana"
        },
        "text/vnd.motorola.reflex": {
          source: "iana"
        },
        "text/vnd.ms-mediapackage": {
          source: "iana"
        },
        "text/vnd.net2phone.commcenter.command": {
          source: "iana"
        },
        "text/vnd.radisys.msml-basic-layout": {
          source: "iana"
        },
        "text/vnd.senx.warpscript": {
          source: "iana"
        },
        "text/vnd.si.uricatalogue": {
          source: "iana"
        },
        "text/vnd.sosi": {
          source: "iana"
        },
        "text/vnd.sun.j2me.app-descriptor": {
          source: "iana",
          charset: "UTF-8",
          extensions: ["jad"]
        },
        "text/vnd.trolltech.linguist": {
          source: "iana",
          charset: "UTF-8"
        },
        "text/vnd.wap.si": {
          source: "iana"
        },
        "text/vnd.wap.sl": {
          source: "iana"
        },
        "text/vnd.wap.wml": {
          source: "iana",
          extensions: ["wml"]
        },
        "text/vnd.wap.wmlscript": {
          source: "iana",
          extensions: ["wmls"]
        },
        "text/vtt": {
          source: "iana",
          charset: "UTF-8",
          compressible: true,
          extensions: ["vtt"]
        },
        "text/x-asm": {
          source: "apache",
          extensions: ["s", "asm"]
        },
        "text/x-c": {
          source: "apache",
          extensions: ["c", "cc", "cxx", "cpp", "h", "hh", "dic"]
        },
        "text/x-component": {
          source: "nginx",
          extensions: ["htc"]
        },
        "text/x-fortran": {
          source: "apache",
          extensions: ["f", "for", "f77", "f90"]
        },
        "text/x-gwt-rpc": {
          compressible: true
        },
        "text/x-handlebars-template": {
          extensions: ["hbs"]
        },
        "text/x-java-source": {
          source: "apache",
          extensions: ["java"]
        },
        "text/x-jquery-tmpl": {
          compressible: true
        },
        "text/x-lua": {
          extensions: ["lua"]
        },
        "text/x-markdown": {
          compressible: true,
          extensions: ["mkd"]
        },
        "text/x-nfo": {
          source: "apache",
          extensions: ["nfo"]
        },
        "text/x-opml": {
          source: "apache",
          extensions: ["opml"]
        },
        "text/x-org": {
          compressible: true,
          extensions: ["org"]
        },
        "text/x-pascal": {
          source: "apache",
          extensions: ["p", "pas"]
        },
        "text/x-processing": {
          compressible: true,
          extensions: ["pde"]
        },
        "text/x-sass": {
          extensions: ["sass"]
        },
        "text/x-scss": {
          extensions: ["scss"]
        },
        "text/x-setext": {
          source: "apache",
          extensions: ["etx"]
        },
        "text/x-sfv": {
          source: "apache",
          extensions: ["sfv"]
        },
        "text/x-suse-ymp": {
          compressible: true,
          extensions: ["ymp"]
        },
        "text/x-uuencode": {
          source: "apache",
          extensions: ["uu"]
        },
        "text/x-vcalendar": {
          source: "apache",
          extensions: ["vcs"]
        },
        "text/x-vcard": {
          source: "apache",
          extensions: ["vcf"]
        },
        "text/xml": {
          source: "iana",
          compressible: true,
          extensions: ["xml"]
        },
        "text/xml-external-parsed-entity": {
          source: "iana"
        },
        "text/yaml": {
          compressible: true,
          extensions: ["yaml", "yml"]
        },
        "video/1d-interleaved-parityfec": {
          source: "iana"
        },
        "video/3gpp": {
          source: "iana",
          extensions: ["3gp", "3gpp"]
        },
        "video/3gpp-tt": {
          source: "iana"
        },
        "video/3gpp2": {
          source: "iana",
          extensions: ["3g2"]
        },
        "video/av1": {
          source: "iana"
        },
        "video/bmpeg": {
          source: "iana"
        },
        "video/bt656": {
          source: "iana"
        },
        "video/celb": {
          source: "iana"
        },
        "video/dv": {
          source: "iana"
        },
        "video/encaprtp": {
          source: "iana"
        },
        "video/ffv1": {
          source: "iana"
        },
        "video/flexfec": {
          source: "iana"
        },
        "video/h261": {
          source: "iana",
          extensions: ["h261"]
        },
        "video/h263": {
          source: "iana",
          extensions: ["h263"]
        },
        "video/h263-1998": {
          source: "iana"
        },
        "video/h263-2000": {
          source: "iana"
        },
        "video/h264": {
          source: "iana",
          extensions: ["h264"]
        },
        "video/h264-rcdo": {
          source: "iana"
        },
        "video/h264-svc": {
          source: "iana"
        },
        "video/h265": {
          source: "iana"
        },
        "video/iso.segment": {
          source: "iana",
          extensions: ["m4s"]
        },
        "video/jpeg": {
          source: "iana",
          extensions: ["jpgv"]
        },
        "video/jpeg2000": {
          source: "iana"
        },
        "video/jpm": {
          source: "apache",
          extensions: ["jpm", "jpgm"]
        },
        "video/jxsv": {
          source: "iana"
        },
        "video/mj2": {
          source: "iana",
          extensions: ["mj2", "mjp2"]
        },
        "video/mp1s": {
          source: "iana"
        },
        "video/mp2p": {
          source: "iana"
        },
        "video/mp2t": {
          source: "iana",
          extensions: ["ts"]
        },
        "video/mp4": {
          source: "iana",
          compressible: false,
          extensions: ["mp4", "mp4v", "mpg4"]
        },
        "video/mp4v-es": {
          source: "iana"
        },
        "video/mpeg": {
          source: "iana",
          compressible: false,
          extensions: ["mpeg", "mpg", "mpe", "m1v", "m2v"]
        },
        "video/mpeg4-generic": {
          source: "iana"
        },
        "video/mpv": {
          source: "iana"
        },
        "video/nv": {
          source: "iana"
        },
        "video/ogg": {
          source: "iana",
          compressible: false,
          extensions: ["ogv"]
        },
        "video/parityfec": {
          source: "iana"
        },
        "video/pointer": {
          source: "iana"
        },
        "video/quicktime": {
          source: "iana",
          compressible: false,
          extensions: ["qt", "mov"]
        },
        "video/raptorfec": {
          source: "iana"
        },
        "video/raw": {
          source: "iana"
        },
        "video/rtp-enc-aescm128": {
          source: "iana"
        },
        "video/rtploopback": {
          source: "iana"
        },
        "video/rtx": {
          source: "iana"
        },
        "video/scip": {
          source: "iana"
        },
        "video/smpte291": {
          source: "iana"
        },
        "video/smpte292m": {
          source: "iana"
        },
        "video/ulpfec": {
          source: "iana"
        },
        "video/vc1": {
          source: "iana"
        },
        "video/vc2": {
          source: "iana"
        },
        "video/vnd.cctv": {
          source: "iana"
        },
        "video/vnd.dece.hd": {
          source: "iana",
          extensions: ["uvh", "uvvh"]
        },
        "video/vnd.dece.mobile": {
          source: "iana",
          extensions: ["uvm", "uvvm"]
        },
        "video/vnd.dece.mp4": {
          source: "iana"
        },
        "video/vnd.dece.pd": {
          source: "iana",
          extensions: ["uvp", "uvvp"]
        },
        "video/vnd.dece.sd": {
          source: "iana",
          extensions: ["uvs", "uvvs"]
        },
        "video/vnd.dece.video": {
          source: "iana",
          extensions: ["uvv", "uvvv"]
        },
        "video/vnd.directv.mpeg": {
          source: "iana"
        },
        "video/vnd.directv.mpeg-tts": {
          source: "iana"
        },
        "video/vnd.dlna.mpeg-tts": {
          source: "iana"
        },
        "video/vnd.dvb.file": {
          source: "iana",
          extensions: ["dvb"]
        },
        "video/vnd.fvt": {
          source: "iana",
          extensions: ["fvt"]
        },
        "video/vnd.hns.video": {
          source: "iana"
        },
        "video/vnd.iptvforum.1dparityfec-1010": {
          source: "iana"
        },
        "video/vnd.iptvforum.1dparityfec-2005": {
          source: "iana"
        },
        "video/vnd.iptvforum.2dparityfec-1010": {
          source: "iana"
        },
        "video/vnd.iptvforum.2dparityfec-2005": {
          source: "iana"
        },
        "video/vnd.iptvforum.ttsavc": {
          source: "iana"
        },
        "video/vnd.iptvforum.ttsmpeg2": {
          source: "iana"
        },
        "video/vnd.motorola.video": {
          source: "iana"
        },
        "video/vnd.motorola.videop": {
          source: "iana"
        },
        "video/vnd.mpegurl": {
          source: "iana",
          extensions: ["mxu", "m4u"]
        },
        "video/vnd.ms-playready.media.pyv": {
          source: "iana",
          extensions: ["pyv"]
        },
        "video/vnd.nokia.interleaved-multimedia": {
          source: "iana"
        },
        "video/vnd.nokia.mp4vr": {
          source: "iana"
        },
        "video/vnd.nokia.videovoip": {
          source: "iana"
        },
        "video/vnd.objectvideo": {
          source: "iana"
        },
        "video/vnd.radgamettools.bink": {
          source: "iana"
        },
        "video/vnd.radgamettools.smacker": {
          source: "iana"
        },
        "video/vnd.sealed.mpeg1": {
          source: "iana"
        },
        "video/vnd.sealed.mpeg4": {
          source: "iana"
        },
        "video/vnd.sealed.swf": {
          source: "iana"
        },
        "video/vnd.sealedmedia.softseal.mov": {
          source: "iana"
        },
        "video/vnd.uvvu.mp4": {
          source: "iana",
          extensions: ["uvu", "uvvu"]
        },
        "video/vnd.vivo": {
          source: "iana",
          extensions: ["viv"]
        },
        "video/vnd.youtube.yt": {
          source: "iana"
        },
        "video/vp8": {
          source: "iana"
        },
        "video/vp9": {
          source: "iana"
        },
        "video/webm": {
          source: "apache",
          compressible: false,
          extensions: ["webm"]
        },
        "video/x-f4v": {
          source: "apache",
          extensions: ["f4v"]
        },
        "video/x-fli": {
          source: "apache",
          extensions: ["fli"]
        },
        "video/x-flv": {
          source: "apache",
          compressible: false,
          extensions: ["flv"]
        },
        "video/x-m4v": {
          source: "apache",
          extensions: ["m4v"]
        },
        "video/x-matroska": {
          source: "apache",
          compressible: false,
          extensions: ["mkv", "mk3d", "mks"]
        },
        "video/x-mng": {
          source: "apache",
          extensions: ["mng"]
        },
        "video/x-ms-asf": {
          source: "apache",
          extensions: ["asf", "asx"]
        },
        "video/x-ms-vob": {
          source: "apache",
          extensions: ["vob"]
        },
        "video/x-ms-wm": {
          source: "apache",
          extensions: ["wm"]
        },
        "video/x-ms-wmv": {
          source: "apache",
          compressible: false,
          extensions: ["wmv"]
        },
        "video/x-ms-wmx": {
          source: "apache",
          extensions: ["wmx"]
        },
        "video/x-ms-wvx": {
          source: "apache",
          extensions: ["wvx"]
        },
        "video/x-msvideo": {
          source: "apache",
          extensions: ["avi"]
        },
        "video/x-sgi-movie": {
          source: "apache",
          extensions: ["movie"]
        },
        "video/x-smv": {
          source: "apache",
          extensions: ["smv"]
        },
        "x-conference/x-cooltalk": {
          source: "apache",
          extensions: ["ice"]
        },
        "x-shader/x-fragment": {
          compressible: true
        },
        "x-shader/x-vertex": {
          compressible: true
        }
      };
    }
  });

  // node_modules/mime-db/index.js
  var require_mime_db = __commonJS({
    "node_modules/mime-db/index.js"(exports, module) {
      module.exports = require_db();
    }
  });

  // node_modules/util/support/isBufferBrowser.js
  var require_isBufferBrowser = __commonJS({
    "node_modules/util/support/isBufferBrowser.js"(exports, module) {
      module.exports = function isBuffer(arg) {
        return arg && typeof arg === "object" && typeof arg.copy === "function" && typeof arg.fill === "function" && typeof arg.readUInt8 === "function";
      };
    }
  });

  // node_modules/inherits/inherits_browser.js
  var require_inherits_browser = __commonJS({
    "node_modules/inherits/inherits_browser.js"(exports, module) {
      if (typeof Object.create === "function") {
        module.exports = function inherits(ctor, superCtor) {
          ctor.super_ = superCtor;
          ctor.prototype = Object.create(superCtor.prototype, {
            constructor: {
              value: ctor,
              enumerable: false,
              writable: true,
              configurable: true
            }
          });
        };
      } else {
        module.exports = function inherits(ctor, superCtor) {
          ctor.super_ = superCtor;
          var TempCtor = function() {
          };
          TempCtor.prototype = superCtor.prototype;
          ctor.prototype = new TempCtor();
          ctor.prototype.constructor = ctor;
        };
      }
    }
  });

  // node_modules/util/util.js
  var require_util = __commonJS({
    "node_modules/util/util.js"(exports) {
      var formatRegExp = /%[sdj%]/g;
      exports.format = function(f) {
        if (!isString(f)) {
          var objects = [];
          for (var i = 0; i < arguments.length; i++) {
            objects.push(inspect(arguments[i]));
          }
          return objects.join(" ");
        }
        var i = 1;
        var args = arguments;
        var len = args.length;
        var str = String(f).replace(formatRegExp, function(x2) {
          if (x2 === "%%") return "%";
          if (i >= len) return x2;
          switch (x2) {
            case "%s":
              return String(args[i++]);
            case "%d":
              return Number(args[i++]);
            case "%j":
              try {
                return JSON.stringify(args[i++]);
              } catch (_) {
                return "[Circular]";
              }
            default:
              return x2;
          }
        });
        for (var x = args[i]; i < len; x = args[++i]) {
          if (isNull(x) || !isObject(x)) {
            str += " " + x;
          } else {
            str += " " + inspect(x);
          }
        }
        return str;
      };
      exports.deprecate = function(fn, msg) {
        if (isUndefined(global.process)) {
          return function() {
            return exports.deprecate(fn, msg).apply(this, arguments);
          };
        }
        if (process.noDeprecation === true) {
          return fn;
        }
        var warned = false;
        function deprecated() {
          if (!warned) {
            if (process.throwDeprecation) {
              throw new Error(msg);
            } else if (process.traceDeprecation) {
              console.trace(msg);
            } else {
              console.error(msg);
            }
            warned = true;
          }
          return fn.apply(this, arguments);
        }
        return deprecated;
      };
      var debugs = {};
      var debugEnviron;
      exports.debuglog = function(set) {
        if (isUndefined(debugEnviron))
          debugEnviron = process.env.NODE_DEBUG || "";
        set = set.toUpperCase();
        if (!debugs[set]) {
          if (new RegExp("\\b" + set + "\\b", "i").test(debugEnviron)) {
            var pid = process.pid;
            debugs[set] = function() {
              var msg = exports.format.apply(exports, arguments);
              console.error("%s %d: %s", set, pid, msg);
            };
          } else {
            debugs[set] = function() {
            };
          }
        }
        return debugs[set];
      };
      function inspect(obj, opts) {
        var ctx = {
          seen: [],
          stylize: stylizeNoColor
        };
        if (arguments.length >= 3) ctx.depth = arguments[2];
        if (arguments.length >= 4) ctx.colors = arguments[3];
        if (isBoolean(opts)) {
          ctx.showHidden = opts;
        } else if (opts) {
          exports._extend(ctx, opts);
        }
        if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
        if (isUndefined(ctx.depth)) ctx.depth = 2;
        if (isUndefined(ctx.colors)) ctx.colors = false;
        if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
        if (ctx.colors) ctx.stylize = stylizeWithColor;
        return formatValue(ctx, obj, ctx.depth);
      }
      exports.inspect = inspect;
      inspect.colors = {
        "bold": [1, 22],
        "italic": [3, 23],
        "underline": [4, 24],
        "inverse": [7, 27],
        "white": [37, 39],
        "grey": [90, 39],
        "black": [30, 39],
        "blue": [34, 39],
        "cyan": [36, 39],
        "green": [32, 39],
        "magenta": [35, 39],
        "red": [31, 39],
        "yellow": [33, 39]
      };
      inspect.styles = {
        "special": "cyan",
        "number": "yellow",
        "boolean": "yellow",
        "undefined": "grey",
        "null": "bold",
        "string": "green",
        "date": "magenta",
        // "name": intentionally not styling
        "regexp": "red"
      };
      function stylizeWithColor(str, styleType) {
        var style = inspect.styles[styleType];
        if (style) {
          return "\x1B[" + inspect.colors[style][0] + "m" + str + "\x1B[" + inspect.colors[style][1] + "m";
        } else {
          return str;
        }
      }
      function stylizeNoColor(str, styleType) {
        return str;
      }
      function arrayToHash(array) {
        var hash = {};
        array.forEach(function(val, idx) {
          hash[val] = true;
        });
        return hash;
      }
      function formatValue(ctx, value, recurseTimes) {
        if (ctx.customInspect && value && isFunction(value.inspect) && // Filter out the util module, it's inspect function is special
        value.inspect !== exports.inspect && // Also filter out any prototype objects using the circular check.
        !(value.constructor && value.constructor.prototype === value)) {
          var ret = value.inspect(recurseTimes, ctx);
          if (!isString(ret)) {
            ret = formatValue(ctx, ret, recurseTimes);
          }
          return ret;
        }
        var primitive = formatPrimitive(ctx, value);
        if (primitive) {
          return primitive;
        }
        var keys = Object.keys(value);
        var visibleKeys = arrayToHash(keys);
        if (ctx.showHidden) {
          keys = Object.getOwnPropertyNames(value);
        }
        if (isError(value) && (keys.indexOf("message") >= 0 || keys.indexOf("description") >= 0)) {
          return formatError(value);
        }
        if (keys.length === 0) {
          if (isFunction(value)) {
            var name = value.name ? ": " + value.name : "";
            return ctx.stylize("[Function" + name + "]", "special");
          }
          if (isRegExp(value)) {
            return ctx.stylize(RegExp.prototype.toString.call(value), "regexp");
          }
          if (isDate(value)) {
            return ctx.stylize(Date.prototype.toString.call(value), "date");
          }
          if (isError(value)) {
            return formatError(value);
          }
        }
        var base = "", array = false, braces = ["{", "}"];
        if (isArray(value)) {
          array = true;
          braces = ["[", "]"];
        }
        if (isFunction(value)) {
          var n = value.name ? ": " + value.name : "";
          base = " [Function" + n + "]";
        }
        if (isRegExp(value)) {
          base = " " + RegExp.prototype.toString.call(value);
        }
        if (isDate(value)) {
          base = " " + Date.prototype.toUTCString.call(value);
        }
        if (isError(value)) {
          base = " " + formatError(value);
        }
        if (keys.length === 0 && (!array || value.length == 0)) {
          return braces[0] + base + braces[1];
        }
        if (recurseTimes < 0) {
          if (isRegExp(value)) {
            return ctx.stylize(RegExp.prototype.toString.call(value), "regexp");
          } else {
            return ctx.stylize("[Object]", "special");
          }
        }
        ctx.seen.push(value);
        var output;
        if (array) {
          output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
        } else {
          output = keys.map(function(key) {
            return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
          });
        }
        ctx.seen.pop();
        return reduceToSingleString(output, base, braces);
      }
      function formatPrimitive(ctx, value) {
        if (isUndefined(value))
          return ctx.stylize("undefined", "undefined");
        if (isString(value)) {
          var simple = "'" + JSON.stringify(value).replace(/^"|"$/g, "").replace(/'/g, "\\'").replace(/\\"/g, '"') + "'";
          return ctx.stylize(simple, "string");
        }
        if (isNumber(value))
          return ctx.stylize("" + value, "number");
        if (isBoolean(value))
          return ctx.stylize("" + value, "boolean");
        if (isNull(value))
          return ctx.stylize("null", "null");
      }
      function formatError(value) {
        return "[" + Error.prototype.toString.call(value) + "]";
      }
      function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
        var output = [];
        for (var i = 0, l = value.length; i < l; ++i) {
          if (hasOwnProperty(value, String(i))) {
            output.push(formatProperty(
              ctx,
              value,
              recurseTimes,
              visibleKeys,
              String(i),
              true
            ));
          } else {
            output.push("");
          }
        }
        keys.forEach(function(key) {
          if (!key.match(/^\d+$/)) {
            output.push(formatProperty(
              ctx,
              value,
              recurseTimes,
              visibleKeys,
              key,
              true
            ));
          }
        });
        return output;
      }
      function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
        var name, str, desc;
        desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
        if (desc.get) {
          if (desc.set) {
            str = ctx.stylize("[Getter/Setter]", "special");
          } else {
            str = ctx.stylize("[Getter]", "special");
          }
        } else {
          if (desc.set) {
            str = ctx.stylize("[Setter]", "special");
          }
        }
        if (!hasOwnProperty(visibleKeys, key)) {
          name = "[" + key + "]";
        }
        if (!str) {
          if (ctx.seen.indexOf(desc.value) < 0) {
            if (isNull(recurseTimes)) {
              str = formatValue(ctx, desc.value, null);
            } else {
              str = formatValue(ctx, desc.value, recurseTimes - 1);
            }
            if (str.indexOf("\n") > -1) {
              if (array) {
                str = str.split("\n").map(function(line) {
                  return "  " + line;
                }).join("\n").substr(2);
              } else {
                str = "\n" + str.split("\n").map(function(line) {
                  return "   " + line;
                }).join("\n");
              }
            }
          } else {
            str = ctx.stylize("[Circular]", "special");
          }
        }
        if (isUndefined(name)) {
          if (array && key.match(/^\d+$/)) {
            return str;
          }
          name = JSON.stringify("" + key);
          if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
            name = name.substr(1, name.length - 2);
            name = ctx.stylize(name, "name");
          } else {
            name = name.replace(/'/g, "\\'").replace(/\\"/g, '"').replace(/(^"|"$)/g, "'");
            name = ctx.stylize(name, "string");
          }
        }
        return name + ": " + str;
      }
      function reduceToSingleString(output, base, braces) {
        var numLinesEst = 0;
        var length = output.reduce(function(prev, cur) {
          numLinesEst++;
          if (cur.indexOf("\n") >= 0) numLinesEst++;
          return prev + cur.replace(/\u001b\[\d\d?m/g, "").length + 1;
        }, 0);
        if (length > 60) {
          return braces[0] + (base === "" ? "" : base + "\n ") + " " + output.join(",\n  ") + " " + braces[1];
        }
        return braces[0] + base + " " + output.join(", ") + " " + braces[1];
      }
      function isArray(ar) {
        return Array.isArray(ar);
      }
      exports.isArray = isArray;
      function isBoolean(arg) {
        return typeof arg === "boolean";
      }
      exports.isBoolean = isBoolean;
      function isNull(arg) {
        return arg === null;
      }
      exports.isNull = isNull;
      function isNullOrUndefined(arg) {
        return arg == null;
      }
      exports.isNullOrUndefined = isNullOrUndefined;
      function isNumber(arg) {
        return typeof arg === "number";
      }
      exports.isNumber = isNumber;
      function isString(arg) {
        return typeof arg === "string";
      }
      exports.isString = isString;
      function isSymbol(arg) {
        return typeof arg === "symbol";
      }
      exports.isSymbol = isSymbol;
      function isUndefined(arg) {
        return arg === void 0;
      }
      exports.isUndefined = isUndefined;
      function isRegExp(re) {
        return isObject(re) && objectToString(re) === "[object RegExp]";
      }
      exports.isRegExp = isRegExp;
      function isObject(arg) {
        return typeof arg === "object" && arg !== null;
      }
      exports.isObject = isObject;
      function isDate(d) {
        return isObject(d) && objectToString(d) === "[object Date]";
      }
      exports.isDate = isDate;
      function isError(e) {
        return isObject(e) && (objectToString(e) === "[object Error]" || e instanceof Error);
      }
      exports.isError = isError;
      function isFunction(arg) {
        return typeof arg === "function";
      }
      exports.isFunction = isFunction;
      function isPrimitive(arg) {
        return arg === null || typeof arg === "boolean" || typeof arg === "number" || typeof arg === "string" || typeof arg === "symbol" || // ES6 symbol
        typeof arg === "undefined";
      }
      exports.isPrimitive = isPrimitive;
      exports.isBuffer = require_isBufferBrowser();
      function objectToString(o) {
        return Object.prototype.toString.call(o);
      }
      function pad(n) {
        return n < 10 ? "0" + n.toString(10) : n.toString(10);
      }
      var months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec"
      ];
      function timestamp() {
        var d = /* @__PURE__ */ new Date();
        var time = [
          pad(d.getHours()),
          pad(d.getMinutes()),
          pad(d.getSeconds())
        ].join(":");
        return [d.getDate(), months[d.getMonth()], time].join(" ");
      }
      exports.log = function() {
        console.log("%s - %s", timestamp(), exports.format.apply(exports, arguments));
      };
      exports.inherits = require_inherits_browser();
      exports._extend = function(origin, add) {
        if (!add || !isObject(add)) return origin;
        var keys = Object.keys(add);
        var i = keys.length;
        while (i--) {
          origin[keys[i]] = add[keys[i]];
        }
        return origin;
      };
      function hasOwnProperty(obj, prop) {
        return Object.prototype.hasOwnProperty.call(obj, prop);
      }
    }
  });

  // node_modules/path/path.js
  var require_path = __commonJS({
    "node_modules/path/path.js"(exports, module) {
      "use strict";
      var isWindows = process.platform === "win32";
      var util = require_util();
      function normalizeArray(parts, allowAboveRoot) {
        var res = [];
        for (var i = 0; i < parts.length; i++) {
          var p = parts[i];
          if (!p || p === ".")
            continue;
          if (p === "..") {
            if (res.length && res[res.length - 1] !== "..") {
              res.pop();
            } else if (allowAboveRoot) {
              res.push("..");
            }
          } else {
            res.push(p);
          }
        }
        return res;
      }
      function trimArray(arr) {
        var lastIndex = arr.length - 1;
        var start = 0;
        for (; start <= lastIndex; start++) {
          if (arr[start])
            break;
        }
        var end = lastIndex;
        for (; end >= 0; end--) {
          if (arr[end])
            break;
        }
        if (start === 0 && end === lastIndex)
          return arr;
        if (start > end)
          return [];
        return arr.slice(start, end + 1);
      }
      var splitDeviceRe = /^([a-zA-Z]:|[\\\/]{2}[^\\\/]+[\\\/]+[^\\\/]+)?([\\\/])?([\s\S]*?)$/;
      var splitTailRe = /^([\s\S]*?)((?:\.{1,2}|[^\\\/]+?|)(\.[^.\/\\]*|))(?:[\\\/]*)$/;
      var win32 = {};
      function win32SplitPath(filename) {
        var result = splitDeviceRe.exec(filename), device = (result[1] || "") + (result[2] || ""), tail = result[3] || "";
        var result2 = splitTailRe.exec(tail), dir = result2[1], basename = result2[2], ext = result2[3];
        return [device, dir, basename, ext];
      }
      function win32StatPath(path) {
        var result = splitDeviceRe.exec(path), device = result[1] || "", isUnc = !!device && device[1] !== ":";
        return {
          device,
          isUnc,
          isAbsolute: isUnc || !!result[2],
          // UNC paths are always absolute
          tail: result[3]
        };
      }
      function normalizeUNCRoot(device) {
        return "\\\\" + device.replace(/^[\\\/]+/, "").replace(/[\\\/]+/g, "\\");
      }
      win32.resolve = function() {
        var resolvedDevice = "", resolvedTail = "", resolvedAbsolute = false;
        for (var i = arguments.length - 1; i >= -1; i--) {
          var path;
          if (i >= 0) {
            path = arguments[i];
          } else if (!resolvedDevice) {
            path = process.cwd();
          } else {
            path = process.env["=" + resolvedDevice];
            if (!path || path.substr(0, 3).toLowerCase() !== resolvedDevice.toLowerCase() + "\\") {
              path = resolvedDevice + "\\";
            }
          }
          if (!util.isString(path)) {
            throw new TypeError("Arguments to path.resolve must be strings");
          } else if (!path) {
            continue;
          }
          var result = win32StatPath(path), device = result.device, isUnc = result.isUnc, isAbsolute = result.isAbsolute, tail = result.tail;
          if (device && resolvedDevice && device.toLowerCase() !== resolvedDevice.toLowerCase()) {
            continue;
          }
          if (!resolvedDevice) {
            resolvedDevice = device;
          }
          if (!resolvedAbsolute) {
            resolvedTail = tail + "\\" + resolvedTail;
            resolvedAbsolute = isAbsolute;
          }
          if (resolvedDevice && resolvedAbsolute) {
            break;
          }
        }
        if (isUnc) {
          resolvedDevice = normalizeUNCRoot(resolvedDevice);
        }
        resolvedTail = normalizeArray(
          resolvedTail.split(/[\\\/]+/),
          !resolvedAbsolute
        ).join("\\");
        return resolvedDevice + (resolvedAbsolute ? "\\" : "") + resolvedTail || ".";
      };
      win32.normalize = function(path) {
        var result = win32StatPath(path), device = result.device, isUnc = result.isUnc, isAbsolute = result.isAbsolute, tail = result.tail, trailingSlash = /[\\\/]$/.test(tail);
        tail = normalizeArray(tail.split(/[\\\/]+/), !isAbsolute).join("\\");
        if (!tail && !isAbsolute) {
          tail = ".";
        }
        if (tail && trailingSlash) {
          tail += "\\";
        }
        if (isUnc) {
          device = normalizeUNCRoot(device);
        }
        return device + (isAbsolute ? "\\" : "") + tail;
      };
      win32.isAbsolute = function(path) {
        return win32StatPath(path).isAbsolute;
      };
      win32.join = function() {
        var paths = [];
        for (var i = 0; i < arguments.length; i++) {
          var arg = arguments[i];
          if (!util.isString(arg)) {
            throw new TypeError("Arguments to path.join must be strings");
          }
          if (arg) {
            paths.push(arg);
          }
        }
        var joined = paths.join("\\");
        if (!/^[\\\/]{2}[^\\\/]/.test(paths[0])) {
          joined = joined.replace(/^[\\\/]{2,}/, "\\");
        }
        return win32.normalize(joined);
      };
      win32.relative = function(from, to) {
        from = win32.resolve(from);
        to = win32.resolve(to);
        var lowerFrom = from.toLowerCase();
        var lowerTo = to.toLowerCase();
        var toParts = trimArray(to.split("\\"));
        var lowerFromParts = trimArray(lowerFrom.split("\\"));
        var lowerToParts = trimArray(lowerTo.split("\\"));
        var length = Math.min(lowerFromParts.length, lowerToParts.length);
        var samePartsLength = length;
        for (var i = 0; i < length; i++) {
          if (lowerFromParts[i] !== lowerToParts[i]) {
            samePartsLength = i;
            break;
          }
        }
        if (samePartsLength == 0) {
          return to;
        }
        var outputParts = [];
        for (var i = samePartsLength; i < lowerFromParts.length; i++) {
          outputParts.push("..");
        }
        outputParts = outputParts.concat(toParts.slice(samePartsLength));
        return outputParts.join("\\");
      };
      win32._makeLong = function(path) {
        if (!util.isString(path))
          return path;
        if (!path) {
          return "";
        }
        var resolvedPath = win32.resolve(path);
        if (/^[a-zA-Z]\:\\/.test(resolvedPath)) {
          return "\\\\?\\" + resolvedPath;
        } else if (/^\\\\[^?.]/.test(resolvedPath)) {
          return "\\\\?\\UNC\\" + resolvedPath.substring(2);
        }
        return path;
      };
      win32.dirname = function(path) {
        var result = win32SplitPath(path), root = result[0], dir = result[1];
        if (!root && !dir) {
          return ".";
        }
        if (dir) {
          dir = dir.substr(0, dir.length - 1);
        }
        return root + dir;
      };
      win32.basename = function(path, ext) {
        var f = win32SplitPath(path)[2];
        if (ext && f.substr(-1 * ext.length) === ext) {
          f = f.substr(0, f.length - ext.length);
        }
        return f;
      };
      win32.extname = function(path) {
        return win32SplitPath(path)[3];
      };
      win32.format = function(pathObject) {
        if (!util.isObject(pathObject)) {
          throw new TypeError(
            "Parameter 'pathObject' must be an object, not " + typeof pathObject
          );
        }
        var root = pathObject.root || "";
        if (!util.isString(root)) {
          throw new TypeError(
            "'pathObject.root' must be a string or undefined, not " + typeof pathObject.root
          );
        }
        var dir = pathObject.dir;
        var base = pathObject.base || "";
        if (!dir) {
          return base;
        }
        if (dir[dir.length - 1] === win32.sep) {
          return dir + base;
        }
        return dir + win32.sep + base;
      };
      win32.parse = function(pathString) {
        if (!util.isString(pathString)) {
          throw new TypeError(
            "Parameter 'pathString' must be a string, not " + typeof pathString
          );
        }
        var allParts = win32SplitPath(pathString);
        if (!allParts || allParts.length !== 4) {
          throw new TypeError("Invalid path '" + pathString + "'");
        }
        return {
          root: allParts[0],
          dir: allParts[0] + allParts[1].slice(0, -1),
          base: allParts[2],
          ext: allParts[3],
          name: allParts[2].slice(0, allParts[2].length - allParts[3].length)
        };
      };
      win32.sep = "\\";
      win32.delimiter = ";";
      var splitPathRe = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
      var posix = {};
      function posixSplitPath(filename) {
        return splitPathRe.exec(filename).slice(1);
      }
      posix.resolve = function() {
        var resolvedPath = "", resolvedAbsolute = false;
        for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
          var path = i >= 0 ? arguments[i] : process.cwd();
          if (!util.isString(path)) {
            throw new TypeError("Arguments to path.resolve must be strings");
          } else if (!path) {
            continue;
          }
          resolvedPath = path + "/" + resolvedPath;
          resolvedAbsolute = path[0] === "/";
        }
        resolvedPath = normalizeArray(
          resolvedPath.split("/"),
          !resolvedAbsolute
        ).join("/");
        return (resolvedAbsolute ? "/" : "") + resolvedPath || ".";
      };
      posix.normalize = function(path) {
        var isAbsolute = posix.isAbsolute(path), trailingSlash = path && path[path.length - 1] === "/";
        path = normalizeArray(path.split("/"), !isAbsolute).join("/");
        if (!path && !isAbsolute) {
          path = ".";
        }
        if (path && trailingSlash) {
          path += "/";
        }
        return (isAbsolute ? "/" : "") + path;
      };
      posix.isAbsolute = function(path) {
        return path.charAt(0) === "/";
      };
      posix.join = function() {
        var path = "";
        for (var i = 0; i < arguments.length; i++) {
          var segment = arguments[i];
          if (!util.isString(segment)) {
            throw new TypeError("Arguments to path.join must be strings");
          }
          if (segment) {
            if (!path) {
              path += segment;
            } else {
              path += "/" + segment;
            }
          }
        }
        return posix.normalize(path);
      };
      posix.relative = function(from, to) {
        from = posix.resolve(from).substr(1);
        to = posix.resolve(to).substr(1);
        var fromParts = trimArray(from.split("/"));
        var toParts = trimArray(to.split("/"));
        var length = Math.min(fromParts.length, toParts.length);
        var samePartsLength = length;
        for (var i = 0; i < length; i++) {
          if (fromParts[i] !== toParts[i]) {
            samePartsLength = i;
            break;
          }
        }
        var outputParts = [];
        for (var i = samePartsLength; i < fromParts.length; i++) {
          outputParts.push("..");
        }
        outputParts = outputParts.concat(toParts.slice(samePartsLength));
        return outputParts.join("/");
      };
      posix._makeLong = function(path) {
        return path;
      };
      posix.dirname = function(path) {
        var result = posixSplitPath(path), root = result[0], dir = result[1];
        if (!root && !dir) {
          return ".";
        }
        if (dir) {
          dir = dir.substr(0, dir.length - 1);
        }
        return root + dir;
      };
      posix.basename = function(path, ext) {
        var f = posixSplitPath(path)[2];
        if (ext && f.substr(-1 * ext.length) === ext) {
          f = f.substr(0, f.length - ext.length);
        }
        return f;
      };
      posix.extname = function(path) {
        return posixSplitPath(path)[3];
      };
      posix.format = function(pathObject) {
        if (!util.isObject(pathObject)) {
          throw new TypeError(
            "Parameter 'pathObject' must be an object, not " + typeof pathObject
          );
        }
        var root = pathObject.root || "";
        if (!util.isString(root)) {
          throw new TypeError(
            "'pathObject.root' must be a string or undefined, not " + typeof pathObject.root
          );
        }
        var dir = pathObject.dir ? pathObject.dir + posix.sep : "";
        var base = pathObject.base || "";
        return dir + base;
      };
      posix.parse = function(pathString) {
        if (!util.isString(pathString)) {
          throw new TypeError(
            "Parameter 'pathString' must be a string, not " + typeof pathString
          );
        }
        var allParts = posixSplitPath(pathString);
        if (!allParts || allParts.length !== 4) {
          throw new TypeError("Invalid path '" + pathString + "'");
        }
        allParts[1] = allParts[1] || "";
        allParts[2] = allParts[2] || "";
        allParts[3] = allParts[3] || "";
        return {
          root: allParts[0],
          dir: allParts[0] + allParts[1].slice(0, -1),
          base: allParts[2],
          ext: allParts[3],
          name: allParts[2].slice(0, allParts[2].length - allParts[3].length)
        };
      };
      posix.sep = "/";
      posix.delimiter = ":";
      if (isWindows)
        module.exports = win32;
      else
        module.exports = posix;
      module.exports.posix = posix;
      module.exports.win32 = win32;
    }
  });

  // node_modules/mime-types/index.js
  var require_mime_types = __commonJS({
    "node_modules/mime-types/index.js"(exports) {
      "use strict";
      var db = require_mime_db();
      var extname = require_path().extname;
      var EXTRACT_TYPE_REGEXP = /^\s*([^;\s]*)(?:;|\s|$)/;
      var TEXT_TYPE_REGEXP = /^text\//i;
      exports.charset = charset;
      exports.charsets = { lookup: charset };
      exports.contentType = contentType;
      exports.extension = extension2;
      exports.extensions = /* @__PURE__ */ Object.create(null);
      exports.lookup = lookup2;
      exports.types = /* @__PURE__ */ Object.create(null);
      populateMaps(exports.extensions, exports.types);
      function charset(type) {
        if (!type || typeof type !== "string") {
          return false;
        }
        var match = EXTRACT_TYPE_REGEXP.exec(type);
        var mime = match && db[match[1].toLowerCase()];
        if (mime && mime.charset) {
          return mime.charset;
        }
        if (match && TEXT_TYPE_REGEXP.test(match[1])) {
          return "UTF-8";
        }
        return false;
      }
      function contentType(str) {
        if (!str || typeof str !== "string") {
          return false;
        }
        var mime = str.indexOf("/") === -1 ? exports.lookup(str) : str;
        if (!mime) {
          return false;
        }
        if (mime.indexOf("charset") === -1) {
          var charset2 = exports.charset(mime);
          if (charset2) mime += "; charset=" + charset2.toLowerCase();
        }
        return mime;
      }
      function extension2(type) {
        if (!type || typeof type !== "string") {
          return false;
        }
        var match = EXTRACT_TYPE_REGEXP.exec(type);
        var exts = match && exports.extensions[match[1].toLowerCase()];
        if (!exts || !exts.length) {
          return false;
        }
        return exts[0];
      }
      function lookup2(path) {
        if (!path || typeof path !== "string") {
          return false;
        }
        var extension3 = extname("x." + path).toLowerCase().substr(1);
        if (!extension3) {
          return false;
        }
        return exports.types[extension3] || false;
      }
      function populateMaps(extensions, types) {
        var preference = ["nginx", "apache", void 0, "iana"];
        Object.keys(db).forEach(function forEachMimeType(type) {
          var mime = db[type];
          var exts = mime.extensions;
          if (!exts || !exts.length) {
            return;
          }
          extensions[type] = exts;
          for (var i = 0; i < exts.length; i++) {
            var extension3 = exts[i];
            if (types[extension3]) {
              var from = preference.indexOf(db[types[extension3]].source);
              var to = preference.indexOf(mime.source);
              if (types[extension3] !== "application/octet-stream" && (from > to || from === to && types[extension3].substr(0, 12) === "application/")) {
                continue;
              }
            }
            types[extension3] = type;
          }
        });
      }
    }
  });

  // index.js
  var epub_js_exports = {};
  __export(epub_js_exports, {
    ePubDoc: () => ePubDoc,
    ePubFile: () => ePubFile,
    ePubNode: () => ePubNode,
    ePubPage: () => ePubPage
  });

  // src/core/util.js
  var import_js_beautify = __toESM(require_js(), 1);
  var import_mime_types = __toESM(require_mime_types(), 1);

  // src/libs/util.mjs
  var __uniq__ = 0;
  function id() {
    return Math.floor((/* @__PURE__ */ new Date()).getTime() / 1e3).toString(16) + "xxxxxx".replace(/x/g, function(v) {
      return Math.floor(Math.random() * 16).toString(16);
    }) + (__uniq__++).toString(16).padStart(6, "0");
  }

  // src/core/util.js
  function dateToISOString(v) {
    return new Date(v).toISOString().replace(/\.[0-9]+Z$/, "Z");
  }
  function objToAttr(obj = {}) {
    let result = "";
    for (const [k, v] of Object.entries(obj)) {
      if (v) {
        result += ` ${k}="${v}"`;
      }
    }
    return result;
  }
  function getMimetype(ext) {
    return (0, import_mime_types.lookup)(ext);
  }
  function generateId() {
    return id();
  }
  function beautifyHTML(str) {
    return import_js_beautify.default.html(str, {
      indent_size: 2
    });
  }

  // src/core/node.js
  var ePubNode = class _ePubNode {
    constructor(parent, tag, properties = {}) {
      if (parent instanceof ePubPage) {
        this.document = parent.document;
        this.page = parent;
      } else if (parent instanceof _ePubNode) {
        this.document = parent.document;
        this.page = parent.page;
      }
      this.index = false;
      this._id = generateId();
      this.name = this._id;
      this.tag = tag;
      this.content = "";
      this.properties = properties;
      this.nodes = [];
      this.files = [];
    }
    get id() {
      return this.properties.id;
    }
    set id(v) {
      this.properties.id = v;
    }
    get class() {
      return this.properties.class;
    }
    set class(v) {
      this.properties.class = v;
    }
    get style() {
      return this.properties.style;
    }
    set style(v) {
      this.properties.style = v;
    }
    get href() {
      return this.properties.id ? `${this.page.relativePath}#${this.properties.id}` : this.page.relativePath;
    }
    set href(v) {
    }
    get innerHTML() {
      return this.content;
    }
    set innerHTML(v) {
      this.content = v;
    }
    get innerText() {
      return this.content;
    }
    set innerText(v) {
      this.content = v;
    }
  };
  ePubNode.prototype.addNode = function(tag, properties) {
    const node = new ePubNode(this, tag, properties);
    this.nodes.push(node);
    this.document.nodes.push(node);
    return node;
  };
  ePubNode.prototype.addFile = function(file) {
    this.files.push(file);
    return file;
  };
  ePubNode.prototype.removeFile = function(file) {
    const i = this.files.findIndex((e) => e == file);
    return i > -1 ? this.files.splice(i, 1) : null;
  };
  ePubNode.prototype.removeFiles = function(files) {
    let result = [];
    for (const file of files) {
      const i = this.files.findIndex((e) => e == file);
      if (i > -1) {
        result.push(this.files.splice(i, 1));
      }
    }
    return result;
  };
  ePubNode.prototype.clearFiles = function() {
    this.files = [];
  };
  ePubNode.prototype.remove = function() {
    for (const node of this.nodes) {
      node.remove();
    }
    this.document.nodes.splice(this.document.nodes.findIndex((e) => e == this), 1);
    for (const node of this.document.nodes) {
      const i = node.nodes.findIndex((e) => e == this);
      if (i > -1) {
        node.nodes.splice(i, 1);
        break;
      }
    }
    return this;
  };
  ePubNode.prototype.toString = function() {
    const tag = this.tag;
    if (["br"].indexOf(tag) > -1) {
      return `<br />`;
    } else if (["input", "button"].indexOf(tag) > -1) {
      return `<${tag}${objToAttr(this.properties)}/>`;
    } else if (["img"].indexOf(tag) > -1) {
      const props = objToAttr(Object.assign({}, this.properties, { src: this.files[0]?.relativePath || "" }));
      return `<${tag}${props}/>`;
    } else if (["audio", "video"].indexOf(tag) > -1) {
      const content = this.files.map((e) => `<source src="${e.relativePath}" type="${e.type}">`).join("");
      return `<${tag}${objToAttr(this.properties)}>${content}</${tag}>`;
    } else if (["picture"].indexOf(tag) > -1) {
      const content = this.files.map((e) => `<source srcset="${e.relativePath}" type="${e.type}">`).join("");
      return `<${tag}${objToAttr(this.properties)}>${content}</${tag}>`;
    } else if (this.nodes.length > 0) {
      return `<${tag}${objToAttr(this.properties)}>${this.nodes.map((e) => e.toString()).join("")}</${tag}>`;
    } else {
      return `<${tag}${objToAttr(this.properties)}>${this.content}</${tag}>`;
    }
  };

  // src/core/file.js
  var ePubFile = class {
    constructor(document, filename, data, encoding = "utf8") {
      const extension2 = "." + filename.split(".").pop();
      this.document = document;
      this.manifest = true;
      this._id = generateId();
      this.name = this._id;
      this.extension = extension2;
      this.data = data;
      this.encoding = encoding;
      this.properties = {};
    }
    get filename() {
      return `${this._id}${this.extension}`;
    }
    set filename(v) {
    }
    get type() {
      return getMimetype(this.extension);
    }
    set type(v) {
    }
    get isStyle() {
      return this.type == "text/css";
    }
    set isStyle(v) {
    }
    get isScript() {
      return this.type == "application/javascript";
    }
    set isScript(v) {
    }
    get path() {
      return this.absolutePath;
    }
    set path(v) {
    }
    get absolutePath() {
      return `EPUB/${this.filename}`;
    }
    set absolutePath(v) {
    }
    get relativePath() {
      return `${this.filename}`;
    }
    set relativePath(v) {
    }
  };
  ePubFile.prototype.remove = function() {
    this.document.files.splice(this.document.files.findIndex((e) => e == this), 1);
    for (const node of this.document.nodes) {
      for (let i = node.files.length - 1; i >= 0; i--) {
        const f = node.files[i];
        if (f == this) {
          node.files.splice(i, 1);
        }
      }
      for (let i = node.styles.length - 1; i >= 0; i--) {
        const f = node.styles[i];
        if (f == this) {
          node.styles.splice(i, 1);
        }
      }
      for (let i = node.scripts.length - 1; i >= 0; i--) {
        const f = node.scripts[i];
        if (f == this) {
          node.scripts.splice(i, 1);
        }
      }
    }
    return this;
  };
  ePubFile.prototype.toString = function() {
    if (this.type == "text/css") {
      return `<link rel="stylesheet" type="text/css" href="${this.relativePath}">`;
    } else if (this.type == "text/javascript") {
      return `<script type="text/javascript" src="${this.relativePath}"><\/script>`;
    }
  };

  // src/core/page.js
  var ePubPage = class {
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
    get filename() {
      return `${this._id}${this.extension}`;
    }
    set filename(v) {
    }
    get type() {
      return getMimetype(this.extension);
    }
    set type(v) {
    }
    get path() {
      return this.absolutePath;
    }
    set path(v) {
    }
    get absolutePath() {
      return `EPUB/${this.filename}`;
    }
    set absolutePath(v) {
    }
    get relativePath() {
      return `${this.filename}`;
    }
    set relativePath(v) {
    }
    get href() {
      return this.relativePath;
    }
    set href(v) {
    }
  };
  ePubPage.prototype.addNode = function(tag, properties) {
    const node = new ePubNode(this, tag, properties);
    this.nodes.push(node);
    this.document.nodes.push(node);
    return node;
  };
  ePubPage.prototype.addStyle = function(file) {
    this.styles.push(file);
  };
  ePubPage.prototype.removeStyle = function(file) {
    const i = this.styles.findIndex((e) => e == file);
    return i > -1 ? this.styles.splice(i, 1) : null;
  };
  ePubPage.prototype.addScript = function(file) {
    this.scripts.push(file);
  };
  ePubPage.prototype.removeScript = function(file) {
    const i = this.scripts.findIndex((e) => e == file);
    return i > -1 ? this.scripts.splice(i, 1) : null;
  };
  ePubPage.prototype.remove = function() {
    for (const node of this.nodes) {
      node.remove();
    }
    this.document.pages.splice(this.document.pages.findIndex((e) => e == this), 1);
    return this;
  };
  ePubPage.prototype.toString = function() {
    const htmlProps = objToAttr({
      "xmlns": "http://www.w3.org/1999/xhtml",
      "xmlns:epub": "http://www.idpf.org/2007/ops",
      "xml:lang": `${this.document.language}`,
      "lang": `${this.document.language}`,
      "dir": `${this.document.textDirection}`
    });
    let result = "";
    result += `<?xml version="1.0" encoding="UTF-8"?>`;
    result += `<html${htmlProps}>`;
    result += `<head>`;
    result += `<title>${this.name}</title>`;
    result += `<meta charset="UTF-8"/>`;
    for (const style of this.styles) {
      result += `<link rel="stylesheet" type="text/css" href="${style.relativePath}"/>`;
    }
    result += `</head>`;
    result += `<body>`;
    for (const node of this.nodes) {
      result += node.toString();
    }
    for (const script of this.scripts) {
      result += `<script type="text/javascript" src="${script.relativePath}"><\/script>`;
    }
    result += `</body>`;
    result += `</html>`;
    return beautifyHTML(result);
  };
  ePubPage.prototype.toFile = function() {
    const file = new ePubFile(this.document, this.filename, this.toString(), "utf8");
    file._id = this._id;
    return file;
  };

  // src/core/doc.js
  var ePubDoc = class {
    constructor() {
      const now = /* @__PURE__ */ new Date();
      this._id = generateId();
      this.title = "No Title";
      this.category = "No Category";
      this.tags = [];
      this.authors = [];
      this.publisher = "No Publisher";
      this.language = "en";
      this.textDirection = "auto";
      this.pageDirection = null;
      this.rendition = {
        layout: null,
        // pre-paginated, reflowable(default)
        orientation: null,
        // landscape, portrait, auto(default)
        spread: null,
        // none, landscape, both, auto(default)
        flow: null
        // paginated, scrolled-continuous, scrolled-doc, auto(default)
      };
      this.createdAt = now.valueOf();
      this.modifiedAt = now.valueOf();
      this.publishedAt = now.valueOf();
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
  };
  ePubDoc.prototype.generateMimetype = function() {
    return this.documentType;
  };
  ePubDoc.prototype.generateContainer = function() {
    let data = "";
    data += `<?xml version="1.0"?>`;
    data += `<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">`;
    data += `<rootfiles>`;
    data += `<rootfile full-path="${this.packageAbsolutePath}" media-type="${this.packageType}"/>`;
    data += `</rootfiles>`;
    data += `</container>`;
    return beautifyHTML(data);
  };
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
      result += `<meta name="cover" content="cover-image"/>`;
      result += `<meta refines="#title" property="title-type">main</meta>`;
      result += `<meta refines="#title" property="file-as">${this.title}</meta>`;
      for (let i = 0; i < authors.length; i++) {
        result += `<meta refines="#author-${i}" property="role" scheme="marc:relators">aut</meta><meta refines="#author-${i}" property="file-as">${authors[i]}</meta>`;
      }
      for (let [k, v] of Object.entries(this.rendition)) {
        if (v) {
          result += `<meta property="rendition:${k}">${v}</meta>`;
        }
      }
      return result;
    }
    function B() {
      let result = "";
      result += `<item${objToAttr({
        "id": this.ncxId,
        "href": this.ncxRelativePath,
        "media-type": this.ncxType
      })}/>`;
      result += `<item${objToAttr({
        "id": this.navId,
        "href": this.navRelativePath,
        "media-type": this.navType
      })}/>`;
      for (let i = 0; i < this.files.length; i++) {
        const file = this.files[i];
        if (!file.manifest) {
          continue;
        }
        result += `<item${objToAttr({
          "id": file._id,
          "href": file.relativePath,
          "media-type": file.type,
          ...file.properties
        })}/>`;
      }
      for (let i = 0; i < this.pages.length; i++) {
        const page = this.pages[i];
        if (!page.manifest) {
          continue;
        }
        result += `<item${objToAttr({
          "id": page._id,
          "href": page.relativePath,
          "media-type": page.type
        })}/>`;
      }
      return result;
    }
    function C() {
      let result = "";
      result += `<itemref${objToAttr({
        "idref": this.navId
        // "linear": "no",
      })}/>`;
      for (let i = 0; i < this.pages.length; i++) {
        const page = this.pages[i];
        if (!page.spine) {
          continue;
        }
        result += `<itemref${objToAttr({
          "idref": page._id
          // "linear": "no",
        })}/>`;
      }
      return result;
    }
    const packageProps = objToAttr({
      "xmlns": "http://www.idpf.org/2007/opf",
      "version": "3.0",
      "unique-identifier": "uid",
      "xml:lang": this.language,
      "dir": this.textDirection
    });
    const metadataProps = objToAttr({
      // for calibre
      "xmlns:dc": "http://purl.org/dc/elements/1.1/"
    });
    const manifestProps = objToAttr({});
    const spineProps = objToAttr({
      // EPUB 2 compatibility
      "toc": "ncx",
      // flow direction
      "page-progression-direction": this.pageDirection
    });
    let data = "";
    data += `<?xml version="1.0" encoding="UTF-8"?>`;
    data += `<package${packageProps}>`;
    data += `<metadata${metadataProps}>${A.apply(this)}</metadata>`;
    data += `<manifest${manifestProps}>${B.apply(this)}</manifest>`;
    data += `<spine${spineProps}>${C.apply(this)}</spine>`;
    data += `</package>`;
    return beautifyHTML(data);
  };
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
    function C(items) {
      let result = "";
      for (const item of items) {
        if (!item.index) {
          result += C(item.nodes);
        } else {
          result += `<navPoint${objToAttr({ id: item._id })}>`;
          result += `<navLabel><text>${item.name}</text></navLabel>`;
          result += `<content src="${item.href}"/>`;
          result += C(item.nodes);
          result += `</navPoint>`;
        }
      }
      return result;
    }
    const ncxProps = objToAttr({
      "xmlns:m": "http://www.w3.org/1998/Math/MathML",
      "xmlns": "http://www.daisy.org/z3986/2005/ncx/",
      "version": "2005-1",
      "xml:lang": this.language
    });
    let data = "";
    data += `<?xml version="1.0" encoding="utf-8"?>`;
    data += `<ncx${ncxProps}>`;
    data += `<head>${A.apply(this)}</head>`;
    data += `${B.apply(this)}`;
    data += `<navMap>${C(this.pages)}</navMap>`;
    data += `</ncx>`;
    return beautifyHTML(data);
  };
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
    const htmlProps = objToAttr({
      "xmlns": "http://www.w3.org/1999/xhtml",
      "xml:lang": this.language,
      "xmlns:epub": "http://www.idpf.org/2007/ops",
      "lang": this.language,
      "dir": this.textDirection
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
    data += `</body>`;
    data += `</html>`;
    return beautifyHTML(data);
  };
  ePubDoc.prototype.getAuthors = function() {
    return this.authors.length > 0 ? this.authors : ["Anonymous"];
  };
  ePubDoc.prototype.getLastPage = function() {
    return this.pages[this.pages.length - 1];
  };
  ePubDoc.prototype.getLastPageId = function() {
    return this.getLastPage() ? this.getLastPage()._id : -1;
  };
  ePubDoc.prototype.getLastNode = function() {
    return this.nodes[this.nodes.length - 1];
  };
  ePubDoc.prototype.getLastNodeId = function() {
    return this.getLastNode() ? this.getLastNode()._id : -1;
  };
  ePubDoc.prototype.getLastFile = function() {
    return this.files[this.files.length - 1];
  };
  ePubDoc.prototype.getLastFileId = function() {
    return this.getLastFile() ? this.getLastFile()._id : -1;
  };
  ePubDoc.prototype.addPage = function() {
    const page = new ePubPage(this);
    this.pages.push(page);
    return page;
  };
  ePubDoc.prototype.getCover = function() {
    const file = this.files.find((e) => e.properties?.properties === "cover-image");
    return file;
  };
  ePubDoc.prototype.addCover = function(filename, data, encoding) {
    const file = new ePubFile(this, filename, data, encoding);
    file.properties.properties = "cover-image";
    this.files.push(file);
    return file;
  };
  ePubDoc.prototype.addFile = function(filename, data, encoding) {
    const file = new ePubFile(this, filename, data, encoding);
    this.files.push(file);
    return file;
  };
  ePubDoc.prototype.toFiles = function() {
    let files = [{
      path: this.mimetypeAbsolutePath,
      data: this.generateMimetype(),
      encoding: "utf8"
    }, {
      path: this.containerAbsolutePath,
      data: this.generateContainer(),
      encoding: "utf8"
    }, {
      path: this.packageAbsolutePath,
      data: this.generatePackage(),
      encoding: "utf8"
    }, {
      path: this.ncxAbsolutePath,
      data: this.generateNCX(),
      encoding: "utf8"
    }, {
      path: this.navAbsolutePath,
      data: this.generateNav(),
      encoding: "utf8"
    }];
    for (const file of this.files) {
      files.push({
        path: file.absolutePath,
        data: typeof file.data === "function" ? file.data() : file.data,
        encoding: file.encoding
      });
    }
    for (const page of this.pages) {
      files.push({
        path: page.absolutePath,
        data: page.toString(),
        encoding: "utf8"
      });
    }
    return files;
  };
  return __toCommonJS(epub_js_exports);
})();
/*! Bundled license information:

mime-db/index.js:
  (*!
   * mime-db
   * Copyright(c) 2014 Jonathan Ong
   * Copyright(c) 2015-2022 Douglas Christopher Wilson
   * MIT Licensed
   *)

mime-types/index.js:
  (*!
   * mime-types
   * Copyright(c) 2014 Jonathan Ong
   * Copyright(c) 2015 Douglas Christopher Wilson
   * MIT Licensed
   *)
*/
