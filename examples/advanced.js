import { ePubDoc, ePubFile, ePubNode } from "../dist/epub.mjs";
import path from "node:path";
import fs from "node:fs";
import JSZip from "./libs/jszip.min.mjs";

const INPUT_PATH = path.join(process.cwd(), "input");
const OUTPUT_PATH = path.join(process.cwd(), "output");
const COVER_PATH = path.join(process.cwd(), "test/cover.png");

// Create a ePub document
const doc = new ePubDoc();

/**
 * Default files
 */
const mimetypeFile = doc.findFile({ filename: "mimetype" });
const containerFile = doc.findFile({ basename: "container.xml" });
const packageFile = doc.findFile({ basename: "package.opf" });

/**
 * Default nodes
 */
const packageNode = packageFile.findNode({ tag: "package" });
const metadataNode = packageFile.findNode({ tag: "metadata" });
const manifestNode = packageFile.findNode({ tag: "manifest" });
const spineNode = packageFile.findNode({ tag: "spine" });

/**
 * Custom methods to update manifest and spine node
 */

/**
 * https://www.w3.org/TR/epub-33/#sec-item-elem
 * @param {object} obj - Attributes of manifest node
 * @property {string} id
 * @property {string} href - Path of file
 * @property {string} media-overlay
 * @property {string} media-type 
 * @property {string} properties "cover-image"|"nav"|"ncx"|...
 * @property {string} fallback
 * @returns 
 */
const addToManifest = function(file, properties) {
  const n = new ePubNode({
    tag: "item",
    closer: " /",
    attributes: {
      "id": file._id,
      "href": file.getRelativePath(packageFile),
      "media-overlay": null,
      "media-type": file.mimetype,
      "properties": properties || null,
      "fallback": null,
    },
  });

  manifestNode.append(n);

  return n;
}

/**
 * https://www.w3.org/TR/epub-33/#sec-itemref-elem
 * @param {object} obj - Attributes of spine node
 * @property {string} id
 * @property {string} idref - ID of manifest child
 * @property {string} linear - "yes"|"no"
 * @property {string} properties
 * @returns 
 */
const addToSpine = function(file, linear) {
  const n = new ePubNode({
    tag: "itemref",
    closer: " /",
    attributes: {
      "id": null,
      "idref": file._id,
      "linear": linear || null,
      "properties": null,
    },
  });

  spineNode.append(n);

  return n;
}

/**
 * Metadata
 */

// Set title
// <dc:title id="title-1">New Title</dc:title>
metadataNode.updateNode({
  tag: "dc:title",
}, {
  $set: {
    attributes: {
      id: "title-1"
    },
    children: [{
      content: "New Title",
    }]
  }
});

// Set language
// <dc:language>ko</dc:language>
metadataNode.updateNode({
  tag: "dc:language",
}, {
  $set: {
    children: [{
      content: "ko",
    }]
  }
});

// Create <dc:creator> node
// <dc:creator id="author-1">Bob</dc:creator>
const author1 = new ePubNode({
  tag: "dc:creator",
  attributes: {
    id: "author-1"
  },
  children: [{
    content: "Bob",
  }]
});

// Append <dc:creator node to <metadata> node
metadataNode.append(author1);

// Append multiple authors with Creation
// <dc:creator id="author-2">Mike</dc:creator>
// <dc:creator id="author-3">John</dc:creator>
metadataNode.append({
  tag: "dc:creator",
  attributes: {
    id: "author-2"
  },
  children: [{
    content: "Mike",
  }]
}, {
  tag: "dc:creator",
  attributes: {
    id: "author-3"
  },
  children: [{
    content: "John",
  }]
});

// Set layout
// <meta property="rendition:layout">pre-paginated</meta>
// <meta property="rendition:orientation">landscape</meta>
// <meta property="rendition:spread">auto</meta>
metadataNode.append({
  tag: "meta",
  attributes: {
    property: "rendition:layout",
  },
  children: [{
    content: "pre-paginated",
  }]
}, {
  tag: "meta",
  attributes: {
    property: "rendition:orientation",
  },
  children: [{
    content: "landscape",
  }]
}, {
  tag: "meta",
  attributes: {
    property: "rendition:spread",
  },
  children: [{
    content: "auto",
  }]
});

// Set text direction
// <package ... dir="rtl">...</package>
packageNode.update({
  $set: {
    "attributes.dir": "rtl"
  }
});

// Set page direction
// <spine ... page-progression-direction="rtl">...</spine>
spineNode.update({
  $set: {
    "attributes.page-progression-direction": "rtl"
  }
});

/**
 * Cover
 */

// Create a cover file
const coverImage = new ePubFile({
  encoding: "base64",
  path: "EPUB/images/cover.png",
  data: fs.readFileSync(COVER_PATH, { encoding: "base64" }),
});

// Add cover file to document
doc.append(coverImage);

// Create manifest child
const coverManifest = addToManifest(coverImage);
coverManifest.setAttribute("properties", "cover-image");

// Add metadata for ePub 2.0 compatibility
metadataNode.append({
  tag: "meta",
  closer: " /",
  attributes: {
    name: "cover",
    content: coverImage._id,
  }
});

/**
 * Navigation
 */

// Create a navigation file
const navFile = new ePubFile(ePubFile.types.nav);

// Append nav file to document
doc.append(navFile);

// Create a manifest child
const navManifest = addToManifest(navFile);
navManifest.setAttribute("properties", "nav");

// Create a spine child
const navSpine = addToSpine(navFile);
navSpine.setAttribute("linear", "no");

/**
 * NCX (legacy)
 */

// Create a NCX file
const ncxPage = new ePubFile(ePubFile.types.ncx);

// Append ncx file to document
doc.append(ncxPage);

// Create manifest child
const ncxManifest = addToManifest(ncxPage);
ncxManifest.setAttribute("properties", "ncx");

// Set EPUB2 compatibility for using NCX file
// <spine ... toc="ncx">...</spine>
doc.updateNode({
  tag: "spine",
}, {
  $set: {
    "attributes.toc": "ncx",
  }
});

// Get ID from package.opf
const documentId = packageFile.findNode({
  tag: "dc:identifier"
}).getContent();

// Get Title from package.opf
const documentTitle = packageFile.findNode({
  tag: "dc:title"
}).getContent();

// Set NCX uid
ncxPage.updateNode({
  tag: "meta",
  attributes: {
    name: "dtb:uid",
  }
}, {
  $set: {
    "attributes.content": documentId
  }
});

// Set content in <docTitle><text>...</text></docTitle> 
// <docTitle><text>New Title</text></docTitle>
ncxPage.updateNode({
  tag: "docTitle"
}, {
  $set: {
    children: [{
      tag: "text",
      children: [{
        content: documentTitle,
      }]
    }]
  }
});

// Add <docAuthor> nodes after <docTitle> node
// <docAuthor><text>Bob</text></docAuthor>
// <docAuthor><text>Mike</text></docAuthor>
// <docAuthor><text>John</text></docAuthor>

// Insert after <docTitle> node
ncxPage.findNode({
  tag: "docTitle"
}).after(
  ...packageFile.findNodes({
    tag: "dc:creator"
  }).map(item => {
    return {
      tag: "docAuthor",
      children: [{
        tag: "text",
        children: [{
          content: item.getContent()
        }]
      }]
    }
  })
)

/**
 * Text page
 */

// Create a text page
const textPage = new ePubFile(
  ePubFile.types.PAGE, 
  { path: "EPUB/texts/page-01.xhtml", }
);

// Append text page to document
doc.append(textPage);

// Create manifest child and spine child
addToManifest(textPage);
addToSpine(textPage);

// Add <h1> to <body>
// <h1 id="heading" class="heading" style="font-size 1rem;">Text page</h1>
textPage
  .findNode({ tag: "body" })
  .append({
    tag: "h1",
    attributes: {
      id: "heading",
      class: "heading",
      style: "font-size: 1rem;"
    },
    children: [{
      content: "Text page",
    }]
  });

// Add multiple texts to <body>
textPage
  .findNode({ tag: "body" })
  .append({
    tag: "br",
    closer: " /",
  }, {
    tag: "div",
    children: [{
      content: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut vel fermentum leo. Phasellus tempor mauris eu elit eleifend dictum. Donec gravida lobortis nunc. Integer hendrerit ex sapien, sit amet consectetur massa lacinia ac. Pellentesque venenatis nec velit vitae viverra. Suspendisse mauris purus, ultricies vitae porttitor in, sodales eget turpis. Vivamus blandit massa tellus, molestie egestas ligula elementum vel. Donec rhoncus, risus ac rhoncus consectetur, mi lacus lobortis nibh, sed tincidunt enim nunc a turpis. Praesent dapibus et erat ac porttitor.`
    }]
  }, {
    tag: "div",
    children: [{
      content: `Suspendisse eleifend augue sit amet lectus pulvinar imperdiet. Cras nibh nulla, ullamcorper ac est vel, pretium condimentum est. Ut a ligula blandit, semper dolor non, malesuada magna. Quisque non lacus purus. Quisque malesuada elit lacus, vel consequat ex mollis at. Nullam orci augue, sagittis auctor pharetra in, ultrices eget velit. Quisque euismod, ante at venenatis consequat, libero metus sagittis eros, non vulputate mi lorem ut neque. Proin arcu justo, feugiat tincidunt malesuada a, pellentesque vulputate nunc. Ut rhoncus finibus nunc non volutpat. Etiam sit amet lorem a turpis fringilla malesuada non ut felis. Pellentesque gravida quam at quam dapibus imperdiet quis non leo. Phasellus eu justo lacus.`
    }]
  }, {
    tag: "div",
    children: [{
      content: `Aenean volutpat nunc sed arcu blandit venenatis. Curabitur lacinia, lacus id posuere iaculis, felis leo dictum sem, sed ultricies velit ex a urna. Suspendisse quis est urna. Vestibulum maximus nunc nec dictum posuere. Nullam posuere eleifend vehicula. Sed elementum ut tortor a ornare. Phasellus rutrum nunc nulla, id sollicitudin urna dictum ut. Donec pulvinar justo ut hendrerit mattis. Aenean et purus nec lectus iaculis euismod ac eu odio. Ut molestie in libero in gravida. Mauris nec nulla sagittis, dapibus ex et, aliquet diam.`,
    }]
  }, {
    tag: "div",
    children: [{
      content: `Nunc a libero dapibus, lobortis nisi ut, iaculis nisl. Proin mattis nunc augue. Donec sit amet est tempus, euismod dolor vitae, scelerisque orci. Integer viverra dignissim erat, nec dictum lorem aliquam tincidunt. Donec vitae leo eget enim dapibus tincidunt. Curabitur in ante placerat, molestie leo eget, tincidunt enim. Vestibulum iaculis velit ut iaculis eleifend. Ut turpis quam, pulvinar sed elit vel, molestie gravida lorem. Donec pretium justo id quam fermentum porta. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae;`,
    }]
  }, {
    tag: "div",
    children: [{
      content: `Nunc faucibus felis turpis, id sollicitudin sapien posuere quis. Mauris auctor quam et ipsum condimentum, feugiat volutpat metus feugiat. Phasellus arcu enim, iaculis ac libero a, blandit lobortis elit. Aliquam sed ligula lacus. Nullam a venenatis risus. Integer porta pulvinar risus id tincidunt. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Aenean quis sapien elementum, malesuada risus sit amet, placerat ligula. Proin lobortis placerat risus, a scelerisque odio pellentesque quis. Phasellus vel commodo diam, a lacinia sem.`,
    }]
  });

/**
 * Image page
 */

// Create an image page
const imagePage = new ePubFile(ePubFile.types.xhtml, {
  path: "EPUB/texts/page-02.xhtml"
});

// Append image page to document
doc.append(imagePage);

// Create manifest child and spine child
addToManifest(imagePage);
addToSpine(imagePage);

// Create a node: <img /> 
// <img id="cover-image" style="width: 100%;" src="../images/cover.png" alt="Cover image" />
const imageNode = new ePubNode({
  tag: "img",
  closer: " /",
  attributes: {
    id: "cover-image",
    style: "display: block; width: auto; height: 100%; margin: 0 auto;",
    src: coverImage.getRelativePath(imagePage),
    alt: "Cover image",
  }
});

// Add <img> to <body>
imagePage
  .findNode({ tag: "body" })
  .append(imageNode);

/**
 * TOC
 */

// Find <nav epub:type="toc">...</nav> node
const tocNode = navFile.findNode({
  tag: "nav", 
  attributes: {
    "epub:type": "toc"
  }
});

// Find <h1> node in TOC node
const tocTitleNode = tocNode.findNode({
  tag: "h1",
});

tocTitleNode.setContent("Table of Contents");

// Find <ol> node in TOC node
const tocListNode = tocNode.findNode({
  tag: "ol",
});

// Add Item node to List node
tocListNode.append({
  tag: "li",
  children: [{
    tag: "a",
    attributes: {
      href: navFile.getRelativePath(navFile),
    },
    children: [{
      content: "Navigation"
    }]
  }]
}, {
  tag: "li",
  children: [{
    tag: "a",
    attributes: {
      href: textPage.getRelativePath(navFile),
    },
    data: "<strong>Page 1</strong>",
    // children: [{
    //   tag: "string",
    //   content: "Page 1",
    // }]
  }]
}, {
  tag: "li",
  children: [{
    tag: "a",
    attributes: {
      href: imagePage.getRelativePath(navFile),
    },
    // children: [{
    //   content: "Page 2"
    // }],
    content: "Page 2",
  }, {
    tag: "ol",
    children: [{
      tag: "li",
      children: [{
        tag: "a",
        attributes: {
          href: imageNode.getRelativePath(navFile),
        },
        // children: [{
        //   content: "Page 2 - image"
        // }],
        content: "Page 2 - image",
      }]
    }]
  }]
});

// Set text direction to all pages
// doc.updateNodes({
//   tag: "html"
// }, {
//   $set: {
//     "attributes.dir": "rtl",
//   }
// });

// Update modified date
doc.updateNode({
  tag: "meta",
  attributes: {
    property: "dcterms:modified",
  }
}, {
  $set: {
    children: [{
      content: new Date().toISOString(),
    }]
  }
});

/**
 * Read metadata from package file
 */

const id = doc.findNode({ tag: "dc:identifier" }).getContent();
// "urn:uuid:1e812363-9604-4f33-aad0-e0064ccb5a60"

const title = doc.findNode({ tag: "dc:title" }).getContent();
// "New Title"

const authors = doc.findNodes({ tag: "dc:creator" })
  .map(item => item.getContent());
// [ 'Bob', 'Mike' ]

const language = doc.findNode({ tag: "dc:language" }).getContent();
// "ko"

console.log("ID:", id);
console.log("Title:", title);
console.log("Authors:", authors);
console.log("Language:", language);

/**
 * Export
 */

// Clear output directory
console.log();
console.log(`> Remove all files in the output directory`);
fs.rmSync(OUTPUT_PATH, { recursive: true, force: true });

// Export document to object
const exportedObject = doc.toObject();

// Import document from object
const newDoc = new ePubDoc(exportedObject);

// Export to file
const exportedFiles = newDoc.toFiles({ beautify: true, escape: true });

// Write each file to directory
console.log();
console.log(`> Start writing files`);
for (const file of exportedFiles) {
  const filePath = path.join(OUTPUT_PATH, title, file.path);
  const dirPath = path.dirname(filePath);

  console.log(`> Write ${filePath}`);

  fs.mkdirSync(dirPath, { recursive: true });
  fs.writeFileSync(filePath, file.data, { encoding: file.encoding || "utf8" });
}

// Write a json file
console.log();
console.log(`> Start writing JSON: ${title}.json`);
fs.writeFileSync(path.join(OUTPUT_PATH, `${title}.json`), JSON.stringify(exportedObject, null, 2), {
  encoding: "utf8"
});

// Create zip object with JSZip
console.log();
console.log(`> Start creating zip object`);

const zip = new JSZip();
for (const file of exportedFiles) {
  try {
    console.log(`> Append ${file.path}`);

    const p = file.path;

    const data = file.encoding === "base64" ?
      // Remove prefix of base64
      file.data.split(",").pop() :
      file.data;

    const options = {
      base64: file.encoding === "base64"
    };
    
    zip.file(p, data, options);
  } catch(err) {
    console.error(err);
  }
}

// Write a epub file
const epub = await zip.generateAsync({ type: "base64" });
console.log();
console.log(`> Start writing archive: ${title}.epub`);
fs.writeFileSync(path.join(OUTPUT_PATH, `${title}.epub`), epub, {encoding: "base64"});