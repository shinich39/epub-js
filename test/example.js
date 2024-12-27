

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
    const n = this.createNode({
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
    const n = this.createNode({
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
    const n = this.createNode({
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
      path: "EPUB/images/cover.png",
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
          content: new Date(date).toISOString(),
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
      content: new Date(date).toISOString(),
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