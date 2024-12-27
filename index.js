"use strict";

/**
 * ePub Version: 3.0
 * https://www.w3.org/TR/epub-33/
 */
import { ePubDoc } from "./src/core/doc.js";
import { ePubFile } from "./src/core/file.js";
import { ePubNode } from "./src/core/node.js";

/**
 * ePubDoc method links
 */

/**
 * ePubFile method links
 */
ePubFile.prototype.update = ePubDoc.prototype.update;

/**
 * ePubNode method links
 */
ePubNode.prototype.getFile = ePubNode.prototype.getRootNode;
ePubNode.prototype.getAbsPath = ePubNode.prototype.getAbsolutePath;
ePubNode.prototype.getRelPath = ePubNode.prototype.getRelativePath;

ePubNode.prototype.update = ePubFile.prototype.update;

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

export { ePubDoc, ePubFile, ePubNode };
