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
  const navFile = doc.createNav();
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

    manifestNode.appendChild(n);

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

    spineNode.appendChild(n);

    return n;
  };

  doc.addToNav = function (file, content) {
    const n = new ePubNode({
      tag: "li",
    }).appendChild({
      tag: "a",
      attributes: {
        href: file.getRelativePath(navFile),
      },
      content: content,
    });

    tocNode.appendChild(n);

    return n;
  };

  doc.setCover = function (filePath) {
    const i = this.createImage({
      path: "EPUB/images/cover" + path.extname(filePath),
      data: readImage(filePath),
    });

    const prev = manifestNode.findChild({
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

    this.appendChild(i);
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

    metadataNode.appendChildren(
      authors.map((item, i) => {
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
    metadataNode.removeChild({
      tag: "meta",
      "attributes.property": "dcterms:modified",
    });

    metadataNode.appendChild(
      {
        tag: "meta",
        "attributes.property": "dcterms:modified",
      },
      {
        $set: {
          content: moment(date).toISOString(),
        },
      }
    );
  };

  doc.setPublishedAt = function (date) {
    metadataNode.removeChild({
      tag: "dc:date",
    });

    metadataNode.appendChild({
      tag: "dc:date",
      content: moment(date).toISOString(),
    });
  };

  doc.setRendition = function (rendition) {
    metadataNode.removeChildren({
      tag: "meta",
      attributes: {
        property: {
          $in: [
            "rendition:layout",
            "rendition:orientation",
            "rendition:spread",
          ],
        },
      },
    });

    if (rendition.layout) {
      metadataNode.appendChild({
        tag: "meta",
        attributes: {
          property: "rendition:layout",
        },
        content: rendition.layout, // "reflowable"
      });
    }

    if (rendition.orientation) {
      metadataNode.appendChild({
        tag: "meta",
        attributes: {
          property: "rendition:orientation",
        },
        content: rendition.orientation, // "portrait"
      });
    }

    if (rendition.spread) {
      metadataNode.appendChild({
        tag: "meta",
        attributes: {
          property: "rendition:spread",
        },
        content: rendition.spread, // "none"
      });
    }
  };

  doc.createImage = function(srcPath) {
    const newPath = path.join("EPUB", "images", path.basename(srcPath));

    let f = this.findFile({ 
      path: newPath
    });

    if (!f) {
      f = this.createImage({
        path: newPath,
        data: fs.readFileSync(srcPath, "base64"),
      });

      this.appendChild(f);
      this.addToManifest(f);
    }

    return f;
  }

  doc.createAudio = function(srcPath) {
    const newPath = path.join("EPUB", "audios", path.basename(srcPath));

    let f = this.findFile({ 
      path: newPath
    });

    if (!f) {
      f = this.createAudio({
        path: newPath,
        data: fs.readFileSync(srcPath, "base64"),
      });

      this.appendChild(f);
      this.addToManifest(f);
    }

    return f;
  }

  doc.createVideo = function(srcPath) {
    const newPath = path.join("EPUB", "videos", path.basename(srcPath));

    let f = this.findFile({ 
      path: newPath
    });

    if (!f) {
      f = this.createAudio({
        path: newPath,
        data: fs.readFileSync(srcPath, "base64"),
      });

      this.appendChild(f);
      this.addToManifest(f);
    }

    return f;
  }

  doc.addPage = function(filePath, headNodes, bodyNodes) {
    const p = this.createPage({
      path: filePath,
    });

    if (headNodes) {
      for (const n of headNodes) {
        p.updateNode({
          tag: "head",
        }, {
          $push: {
            children: n
          }
        });
      }
    }

    if (bodyNodes) {
      for (const n of bodyNodes) {
        p.updateNode({
          tag: "body",
        }, {
          $push: {
            children: n
          }
        });
      }
    }

    this.appendChild(p);
    this.addToManifest(p);
    this.addToSpine(p);
    this.addToNav(p);

    return p;
  }

  doc.export = function () {
    const obj = this.toObject();
    for (const key of Object.keys(obj)) {
      if (typeof obj[key] == "function") {
        delete obj[key];
      }
    }
    return obj;
  };

  doc.appendChild(navFile);
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