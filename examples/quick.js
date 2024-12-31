import path from "node:path";
import fs from "node:fs";
import mime from "mime";
import { ePubDoc, ePubFile, ePubNode } from "../dist/epub.mjs";

export function createDoc() {
  const self = {};
  const doc = new ePubDoc();
  const mimetypeFile = doc.findFile({ filename: "mimetype" });
  const containerFile = doc.findFile({ basename: "container.xml" });
  const packageFile = doc.findFile({ basename: "package.opf" });
  const packageNode = packageFile.findNode({ tag: "package" });
  const metadataNode = packageFile.findNode({ tag: "metadata" });
  const manifestNode = packageFile.findNode({ tag: "manifest" });
  const spineNode = packageFile.findNode({ tag: "spine" });
  const navFile = new ePubFile(ePubFile.types.nav);
  const navNode = navFile
    .findNode({
      tag: "nav",
      "attributes.epub:type": "toc",
    })
    .findNode({
      tag: "ol",
    });

  self.doc = doc;

  self.files = {
    mimetype: mimetypeFile,
    container: containerFile,
    package: packageFile,
    nav: navFile,
  }

  self.nodes = {
    package: packageNode,
    metadata: metadataNode,
    spine: spineNode,
    nav: navNode,
  }

  self.addManifest = function (file, attribtues) {
    const n = new ePubNode({
      tag: "item",
      closer: " /",
      attributes: Object.assign({
        id: file._id,
        href: file.getRelativePath(packageFile),
        "media-overlay": null,
        "media-type": file.mimetype,
        properties: null,
        fallback: null,
      }, attribtues || {}),
    });

    manifestNode.append(n);

    return n;
  };

  self.addSpine = function (file, attribtues) {
    const n = new ePubNode({
      tag: "itemref",
      closer: " /",
      attributes: Object.assign({
        id: null,
        idref: file._id,
        linear: null,
        properties: null,
      }, attribtues || {}),
    });

    spineNode.append(n);

    return n;
  };

  self.addNav = function (file, content) {
    const n = new ePubNode({
      tag: "li",
    }).append({
      tag: "a",
      attributes: {
        href: file.getRelativePath(navFile),
      },
      content: content,
    });

    navNode.append(n);

    return n;
  };

  self.setCover = function (filePath) {
    const i = new ePubFile({
      encoding: "binary",
      path: "EPUB/images/cover" + path.extname(filePath),
      data: fs.readFileSync(filePath),
    });

    manifestNode.removeNode({
      attributes: {
        properties: "cover-image",
      },
    });

    doc.append(i);
    self.addManifest(i, {
      properties: "cover-image",
    });
  };

  self.setTitle = function (title) {
    metadataNode.updateNode(
      {
        tag: "dc:title",
      },
      {
        $set: {
          content: title,
        },
      }
    );
  };

  self.setAuthor = function (...authors) {
    metadataNode.removeNodes({
      tag: "dc:creator",
    });

    metadataNode.append(
      ...authors.map((item, i) => {
        return {
          tag: "dc:creator",
          attributes: {
            id: `author-${i}`,
          },
          children: [
            {
              content: item,
            },
          ],
        };
      })
    );
  };

  // ERROR: Kindle previewer 3
  self.setLanguage = function (lang) {
    metadataNode.updateNode(
      {
        tag: "dc:language",
      },
      {
        $set: {
          content: lang,
        },
      }
    );
  };

  self.setCreatedAt = function (date) {
    metadataNode.removeNode({
      tag: "meta",
      "attributes.property": "dcterms:modified",
    });

    metadataNode.updateNode(
      {
        tag: "meta",
        "attributes.property": "dcterms:modified",
      },
      {
        $set: {
          content: new Date(date).toISOString(),
        },
      }
    );
  };

  self.setPublishedAt = function (date) {
    metadataNode.removeNode({
      tag: "dc:date",
    });

    metadataNode.append({
      tag: "dc:date",
      content: new Date(date).toISOString(),
    });
  };

  self.setRendition = function (rendition) {
    metadataNode.removeNodes({
      tag: "meta",
      attributes: {
        property: {
          $in: [
            "rendition:layout",
            "rendition:orientation",
            "rendition:spread",
            "rendition:flow",
          ],
        },
      },
    });

    if (rendition.layout) {
      metadataNode.append({
        tag: "meta",
        attributes: {
          property: "rendition:layout",
        },
        content: rendition.layout, // "reflowable"
      });
    }

    if (rendition.orientation) {
      metadataNode.append({
        tag: "meta",
        attributes: {
          property: "rendition:orientation",
        },
        content: rendition.orientation, // "portrait"
      });
    }

    if (rendition.spread) {
      metadataNode.append({
        tag: "meta",
        attributes: {
          property: "rendition:spread",
        },
        content: rendition.spread, // "none"
      });
    }

    if (rendition.flow) {
      metadataNode.append({
        tag: "meta",
        attributes: {
          property: "rendition:flow",
        },
        content: rendition.flow, // scrolled-doc, 
      });
    }
  };

  self.getFileDir = function(srcPath) {
    const type = mime.getType(path.extname(srcPath));
    const prefix = type.split("/")[0];
    switch(type) {
      case "text/css": 
        return "styles";
      case "application/font-sfnt":
      case "application/vnd.ms-opentype":
      case "application/font-woff": 
        return "fonts";
      case "text/javascript": 
      case "application/javascript": 
      case "application/ecmascript": 
        return "scripts";
      case "application/smil+xml":
        return "overlays";
    }
    switch(prefix) {
      case "image":
      case "audio":
      case "video":
      case "font":
        return prefix + "s";
    }
    return "misc";
  }

  self.addFile = function(srcPath, dstPath, options) {
    let { manifest } = options || {};
    const newPath = dstPath || path.join(`EPUB`, self.getFileDir(srcPath), path.basename(srcPath));

    const file = doc.findFile({ 
      path: newPath
    });

    if (file) {
      return file;
    }

    const newFile = new ePubFile({
      path: newPath,
      data: fs.readFileSync(srcPath),
    });

    doc.append(newFile);
    self.addManifest(newFile, manifest);
  }

  self.addPage = function(dstPath, options) {
    let { title, head, body, manifest, spine } = options || {};
    if (!head) {
      head = [];
    }
    if (!Array.isArray(head)) {
      head = [head];
    }
    if (!body) {
      body = [];
    }
    if (!Array.isArray(body)) {
      body = [body];
    }

    const index = doc.findFiles({ extname: ".xhtml" }).length;
    const newPath = dstPath || path.join("EPUB", "pages", `${index}.xhtml`);

    const file = doc.findFile({ 
      path: newPath
    });

    if (file) {
      return file;
    }

    const newFile = new ePubFile(
      ePubFile.types.xhtml,
      { path: newPath }
    );

    newFile.findNode({ tag: "head" }).append(...head);
    newFile.findNode({ tag: "body" }).append(...body);

    doc.append(newFile);
    self.addManifest(newFile, manifest);
    self.addSpine(newFile, spine);

    if (title) {
      self.addNav(newFile, title);
    }

    return newFile;
  }

  self.addSmil = function(dstPath, options) {
    let { manifest } = options || {};
    const newPath = path.join("EPUB", "overlays", path.basename(dstPath));

    const file = doc.findFile({ 
      path: newPath
    });

    if (file) {
      return file;
    }

    const newFile = new ePubFile(
      ePubFile.types.smil,
      { path: newPath }
    );

    doc.append(newFile);
    self.addManifest(newFile, manifest);

    return newFile;
  }

  self.export = function(outputPath) {
    const files = doc.toFiles();
    for (const file of files) {
      const filePath = path.join(outputPath, file.path);
      const dirPath = path.dirname(filePath);
      fs.mkdirSync(dirPath, { recursive: true });
      fs.writeFileSync(filePath, file.data);
    }
  }

  doc.append(navFile);
  self.addManifest(navFile, "nav");

  return self
}