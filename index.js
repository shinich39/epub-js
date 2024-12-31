"use strict";

/**
 * ePub Version: 3.0
 * https://www.w3.org/TR/epub-33/
 */
import { ePubDoc, FILE_TYPES, NODE_TYPES } from "./src/core/doc.js";
import { ePubFile } from "./src/core/file.js";
import { ePubNode } from "./src/core/node.js";

/**
 * ePubDoc method links
 */

/**
 * ePubFile method links
 */
ePubFile.types = FILE_TYPES;
ePubFile.prototype.getAbsPath = ePubFile.prototype.getAbsolutePath;
ePubFile.prototype.getRelPath = ePubFile.prototype.getRelativePath;

ePubFile.prototype.update = ePubDoc.prototype.update;

/**
 * ePubNode method links
 */
ePubNode.types = NODE_TYPES;
ePubNode.prototype.getFile = ePubNode.prototype.getRootNode;
ePubNode.prototype.getAbsPath = ePubNode.prototype.getAbsolutePath;
ePubNode.prototype.getRelPath = ePubNode.prototype.getRelativePath;

ePubNode.prototype.update = ePubFile.prototype.update;
ePubNode.prototype.append = ePubFile.prototype.append;
ePubNode.prototype.prepend = ePubFile.prototype.prepend;
ePubNode.prototype.insert = ePubFile.prototype.insert;

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

export { ePubDoc, ePubFile, ePubNode };
