import path from "node:path";
import fs from "node:fs";
import { ePubDoc, ePubFile, ePubNode } from "../dist/epub.mjs";

export function createDoc() {
  const doc = new ePubDoc();
  const mimetypeFile = doc.findFile({ filename: "mimetype" });
  const containerFile = doc.findFile({ basename: "container.xml" });
  const packageFile = doc.findFile({ basename: "package.opf" });
  const packageNode = packageFile.findNode({ tag: "package" });
  const metadataNode = packageFile.findNode({ tag: "metadata" });
  const manifestNode = packageFile.findNode({ tag: "manifest" });
  const spineNode = packageFile.findNode({ tag: "spine" });
  const navFile = new ePubFile(ePubFile.types.nav);
  const tocNode = navFile
    .findNode({
      tag: "nav",
      "attributes.epub:type": "toc",
    })
    .findNode({
      tag: "ol",
    });

  doc.addToManifest = function (file, properties) {
    const n = new ePubNode({
      tag: "item",
      closer: " /",
      attributes: {
        id: file._id,
        href: file.getRelativePath(packageFile),
        "media-overlay": null,
        "media-type": file.mimetype,
        properties: properties || null,
        fallback: null,
      },
    });

    manifestNode.append(n);

    return n;
  };

  doc.addToSpine = function (file, linear) {
    const n = new ePubNode({
      tag: "itemref",
      closer: " /",
      attributes: {
        id: null,
        idref: file._id,
        linear: linear || null,
        properties: null,
      },
    });

    spineNode.append(n);

    return n;
  };

  doc.addToNav = function (file, content) {
    const n = new ePubNode({
      tag: "li",
    }).append({
      tag: "a",
      attributes: {
        href: file.getRelativePath(navFile),
      },
      content: content,
    });

    tocNode.append(n);

    return n;
  };

  doc.setCover = function (filePath) {
    const i = new ePubFile({
      encoding: "base64",
      path: "EPUB/images/cover" + path.extname(filePath),
      data: fs.readFileSync(filePath, "base64"),
    });

    const prev = manifestNode.findNode({
      attributes: {
        properties: "cover-image",
      },
    });
    if (prev) {
      this.removeFile({
        _id: prev.attributes.id,
      });

      prev.remove();
    }

    this.append(i);
    this.addToManifest(i, "cover-image");
  };

  doc.setTitle = function (title) {
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

  doc.setAuthors = function (...authors) {
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
  doc.setLanguage = function (lang) {
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

  doc.setCreatedAt = function (date) {
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

  doc.setPublishedAt = function (date) {
    metadataNode.removeNode({
      tag: "dc:date",
    });

    metadataNode.append({
      tag: "dc:date",
      content: new Date(date).toISOString(),
    });
  };

  doc.setRendition = function (rendition) {
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
        content: rendition.flow, 
      });
    }
  };

  doc.createImage = function(srcPath, dstPath) {
    const newPath = dstPath || path.join("EPUB", "images", path.basename(srcPath));

    let f = this.findFile({ 
      path: newPath
    });

    if (!f) {
      f = new ePubFile({
        encoding: "base64",
        path: newPath,
        data: fs.readFileSync(srcPath, "base64"),
      });

      this.append(f);
      this.addToManifest(f);
    }

    return f;
  }

  doc.createAudio = function(srcPath, dstPath) {
    const newPath = dstPath || path.join("EPUB", "audios", path.basename(srcPath));

    let f = this.findFile({ 
      path: newPath
    });

    if (!f) {
      f = new ePubFile({
        encoding: "base64",
        path: newPath,
        data: fs.readFileSync(srcPath, "base64"),
      });

      this.append(f);
      this.addToManifest(f);
    }

    return f;
  }

  doc.createVideo = function(srcPath, dstPath) {
    const newPath = dstPath || path.join("EPUB", "videos", path.basename(srcPath));

    let f = this.findFile({ 
      path: newPath
    });

    if (!f) {
      f = new ePubFile({
        encoding: "base64",
        path: newPath,
        data: fs.readFileSync(srcPath, "base64"),
      });

      this.append(f);
      this.addToManifest(f);
    }

    return f;
  }

  doc.createStyle = function(srcPath, dstPath) {
    const newPath = dstPath || path.join("EPUB", "styles", path.basename(srcPath));

    let f = this.findFile({ 
      path: newPath
    });

    if (!f) {
      f = new ePubFile({
        path: newPath,
        data: fs.readFileSync(srcPath, "utf8"),
      });

      this.append(f);
      this.addToManifest(f);
    }

    return f;
  }

  doc.createScript = function(srcPath, dstPath) {
    const newPath = dstPath || path.join("EPUB", "scripts", path.basename(srcPath));

    let f = this.findFile({ 
      path: newPath
    });

    if (!f) {
      f = new ePubFile({
        path: newPath,
        data: fs.readFileSync(srcPath, "utf8"),
      });

      this.append(f);
      this.addToManifest(f);
    }

    return f;
  }

  doc.createFont = function(srcPath, dstPath) {
    const newPath = dstPath || path.join("EPUB", "fonts", path.basename(srcPath));

    let f = this.findFile({ 
      path: newPath
    });

    if (!f) {
      f = new ePubFile({
        path: newPath,
        data: fs.readFileSync(srcPath, "utf8"),
      });

      this.append(f);
      this.addToManifest(f);
    }

    return f;
  }

  doc.createPage = function(dstPath) {
    const newPath = path.join("EPUB", "pages", path.basename(dstPath));

    let p = this.findFile({ 
      path: newPath
    });

    if (!p) {
      p = new ePubFile(
        ePubFile.types.xhtml,
        { path: newPath }
      );

      this.append(p);
      this.addToManifest(p);
      this.addToSpine(p);
      this.addToNav(p, p.filename);
    }

    return p;
  }

  doc.createSmil = function(dstPath) {
    const newPath = path.join("EPUB", "overlays", path.basename(dstPath));

    let p = this.findFile({ 
      path: newPath
    });

    if (!p) {
      p = new ePubFile(
        ePubFile.types.smil,
        { path: newPath }
      );

      this.append(p);
      this.addToManifest(p);
    }

    return p;
  }

  doc.export = function(outputPath) {
    const files = doc.toFiles();
    for (const file of files) {
      const filePath = path.join(outputPath, file.path);
      const dirPath = path.dirname(filePath);
      fs.mkdirSync(dirPath, { recursive: true });
      fs.writeFileSync(filePath, file.data, file.encoding || "utf8");
    }
  }

  doc.append(navFile);
  doc.addToManifest(navFile, "nav");

  return {
    doc,
    mimetypeFile,
    containerFile,
    packageFile,
    packageNode,
    metadataNode,
    manifestNode,
    spineNode,
    navFile,
    tocNode,
  };
}