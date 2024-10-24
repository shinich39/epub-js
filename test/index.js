import { ePubDoc } from "../index.js";
import path from "node:path";
import fs from "node:fs";
import JSZip from "./jszip.min.mjs";

const INPUT_PATH = path.join(process.cwd(), "input");
const OUTPUT_PATH = path.join(process.cwd(), "output");
const COVER_PATH = path.join(process.cwd(), "test/cover.png");

// Create a ePub document
const doc = new ePubDoc({
  _id: "Main ID",
  title: "New Title",
  authors: ["B", "C", "D"],
  language: "ko",
  createdAt: null,
  updatedAt: Date.now(),
  textDirection: "ltr",
  pageDirection: "ltr",
  legacy: false,
});

// Create main files
const mimetypeFile = doc.appendMimetpye();
const containerFile = doc.appendContainer();
const packageFile = doc.appendPackage();
const navFile = doc.appendNav();

// Create a cover file
const coverImage = doc.appendCover({
  path: "EPUB/cover.png",
  data: fs.readFileSync(COVER_PATH, { encoding: "base64" }),
});

// Create cover metadata for ePub 2.0 compatibility
doc
  .findNode({
    tag: "metadata"
  })
  .appendNode({
    tag: "meta",
    closer: " /",
    attributes: {
      name: "cover",
      content: coverImage._id,
    }
  });

// Create text page
const textPage = doc.appendPage({
  path: "EPUB/page-01.xhtml",
});


textPage
  .findNode({
    tag: "body",
  })
  .appendNodes([{
    tag: "h1",
    children: [{
      content: "First Page",
    }]
  }, {
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
  }]);

// Create image page
const imagePage = doc.appendPage({
  path: "EPUB/page-02.xhtml",
});

const imageNode = imagePage.findNode({
    tag: "body",
  })
  .appendNode({
    tag: "img",
    closer: " /",
    attributes: {
      id: "cover-image",
      style: "max-width: 100%;",
      src: coverImage.getRelativePath(),
      alt: "Cover image",
    }
  });

// Set TOC items
navFile
  .findNode({
    tag: "nav", 
    attributes: {
      "epub:type": "toc"
    }
  })
  .appendNodes([{
    tag: "h1",
    children: [{
      content: "Table of Contents",
    }],
  }, {
    tag: "ol",
    children: [{
      tag: "li",
      children: [{
        tag: "a",
        attributes: {
          href: navFile.getRelativePath(),
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
          href: textPage.getRelativePath(),
        },
        children: [{
          content: "Page 1"
        }]
      }]
    }, {
      tag: "li",
      children: [{
        tag: "a",
        attributes: {
          href: imagePage.getRelativePath(),
        },
        children: [{
          content: "Page 2"
        }]
      }, {
        tag: "ol",
        children: [{
          tag: "li",
          children: [{
            tag: "a",
            attributes: {
              href: imageNode.getRelativePath(),
            },
            children: [{
              content: "Image",
            }]
          }]
        }]
      }]
    }],
  }]);

// Set manifest items
doc.updateNode({
  tag: "manifest",
}, {
  $set: {
    children: doc.findFiles({
      manifest: {
        $exists: true
      }
    }).map(item => item.toManifestNode()),
  }
});

// Set spine items
doc.updateNode({
  tag: "spine",
}, {
  $set: {
    children: doc.findFiles({
      spine: {
        $exists: true
      }
    }).map(item => item.toSpineNode())
  }
});

// Set text-direction to right-to-left
// doc.updateNodes({
//   tag: {
//     $in: ["package", "html"]
//   }
// }, {
//   $set: {
//     "attributes.dir": "rtl",
//   }
// });

// Set page-direction to right-to-left
// doc.updateNode({
//   tag: "spine"
// }, {
//   $set: {
//     "attributes.page-progression-direction": "rtl",
//   }
// });

// Set enable NCX for ePub2 compatibility
// doc.updateNode({
//   tag: "spine",
// }, {
//   $set: {
//     "attributes.toc": "ncx",
//   }
// });

// Update title to "My ePub"
doc.updateNodes({
  tag: {
    $in: [
      "dc:title",
      "title"
    ]
  }
}, {
  $set: {
    children: [{
      content: "My ePub"
    }]
  }
});

// Add authors
doc
  .findNode({
    tag: "metadata",
  })
  .appendNodes([
    {
      tag: "dc:creator",
      children: [{
        content: "John"
      }]
    }, {
      tag: "dc:creator",
      children: [{
        content: "Bob"
      }]
    }
  ]);

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

// Read document metadata

// Get title from dc:title node
const title = doc.findNode({
    tag: "dc:title",
  })
  .getContent();

// Get titles from dc:title nodes
const titles = doc.findNodes({
    tag: "dc:title",
  })
  .map(item => item.getContent());

// Get language
const language = doc.findNode({
    tag: "dc:language",
  })
  .getContent();

// Get authors
const authors = doc.findNode({
    tag: "dc:creator",
  })
  .getContent();


console.log(title);
console.log(titles);
console.log(language);
console.log(authors);

// Export document to JSON
const exportedObject = doc.toObject();

// Import document from JSON
const newDoc = new ePubDoc(exportedObject);

// test write
const files = newDoc.toFiles();
fs.rmSync(OUTPUT_PATH, { recursive: true, force: true });
for (const file of files) {
  const filePath = path.join(OUTPUT_PATH, file.path);
  const dirPath = path.dirname(filePath);
  fs.mkdirSync(dirPath, { recursive: true });
  fs.writeFileSync(filePath, file.data, { encoding: file.encoding });
}

// test JSZip
// fs.rmSync(OUTPUT_PATH, { recursive: true, force: true });
// fs.mkdirSync(OUTPUT_PATH);
const zip = new JSZip();
for (const file of files) {
  try {
    zip.file(file.path, file.data, { base64: file.encoding === "base64" });
  } catch(err) {
    console.error(err);
  }
}

zip.generateAsync({ type:"base64" })
  .then(function(content) {
    fs.writeFileSync(path.join(OUTPUT_PATH, `${title}.epub`), content, {encoding: "base64"});
  });

// test export
fs.writeFileSync(path.join(OUTPUT_PATH, `${title}.json`), JSON.stringify(exportedObject, null, 2), {encoding: "utf8"})
