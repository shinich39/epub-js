import { ePubDoc } from "../index.js";
import path from "node:path";
import fs from "node:fs";
import JSZip from "./jszip.min.js";

const INPUT_PATH = path.join(process.cwd(), "input");
const OUTPUT_PATH = path.join(process.cwd(), "output");
const COVER_PATH = path.join(process.cwd(), "/src/cover.png");

// Create a ePub document
const doc = new ePubDoc();

// Add main files
const mimetypeFile = doc.addMimetpye();
const containerFile = doc.addContainer();
const packageFile = doc.addPackage();

// Add navigation file
const navFile = doc.addNav();

// Add <h1>Table of contents</h1> into <nav epub:type="toc"></nav>
navFile.getNode({
  tag: "nav", 
  attributes: {
    "epub:type": "toc"
  }
}).addNode({
  tag: "h1",
  children: [{
    content: "Table of Contents",
  }],
});

// Add a cover file
const coverImage = doc.addCover({
  path: "EPUB/cover.png",
  data: fs.readFileSync(COVER_PATH, { encoding: "base64" }),
});

// Add a cover page
const coverPage = doc.addPage({
  path: "EPUB/cover.xhtml",
  spine: {
    linear: "no",
  },
});

// Add cover file to cover page <body>...</body>
coverPage.getNode({
  tag: "body"
}).addNode({
  tag: "img",
  closer: " /",
  attributes: {
    style: "max-width: 100%;",
    src: coverImage.getRelativePath(),
  }
});

// Set title
doc.getNodes({
  tag: {
    $in: [
      "dc:title",
      "title"
    ]
  }
}).forEach(node => {
  node.update({ 
    $set: {
      children: [{
        content: "My ePub"
      }]
    }
  });
});

// Add authors before <dc:title>
doc.getNode({
  tag: "metadata",
}).addNodes([
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
], -2);

// Set language
doc.getNode({
  tag: "dc:language"
}).update({
  $set: {
    children: [{
      content: "ja"
    }]
  }
});

doc.getNodes({
  attributes: {
    lang: {
      $exists: true,
    }
  }
}).forEach(node => {
  node.update({
    $set: {
      "attributes.lang": "ja",
    }
  });
});

doc.getNodes({
  attributes: {
    "xml:lang": {
      $exists: true,
    }
  }
}).forEach(node => {
  node.update({
    $set: {
      "attributes.xml:lang": "ja",
    }
  });
});

// Add text page
const textPage = doc.addPage({
  path: "EPUB/page-01.xhtml",
});

textPage.getNode({
  tag: "body",
}).addNodes([{
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

// Add image page
const imagePage = doc.addPage({
  path: "EPUB/page-02.xhtml",
});

imagePage.getNode({
  tag: "body",
}).addNode({
  tag: "img",
  closer: " /",
  attributes: {
    style: "max-width: 100%;",
    src: coverImage.getRelativePath(),
    alt: "Cover image",
  }
});

// Add nav items
navFile.getNode({
  tag: "nav", 
  attributes: {
    "epub:type": "toc"
  }
}).addNode({
  tag: "ol",
  children: [{
    tag: "li",
    children: [{
      tag: "a",
      attributes: {
        href: coverPage.getRelativePath(),
      },
      children: [{
        content: "Cover"
      }]
    }]
  }, {
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
    }]
  }],
});

// Set legacy navigation
// doc.getNode({ tag: "spine" }).update({
//   $set: {
//     "attributes.toc": "ncx"
//   }
// });

// Get title from <dc:title>...</dc:title>
const title = doc.getNode({
  tag: "dc:title"
}).getContent();

// Set <manifest>...</manifest>
doc.updateNode({
  tag: "manifest",
}, {
  $set: {
    children: doc.getFiles({
      manifest: {
        $exists: true
      }
    }).map(item => item.toManifestNode()),
  }
});

// Set <spine>...</spine>
doc.updateNode({
  tag: "spine",
}, {
  $set: {
    children: doc.getFiles({
      spine: {
        $exists: true
      }
    }).map(item => item.toSpineNode()),
  }
});

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

// test write
const files = doc.toFiles();
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
const exportedObject = doc.toObject();
fs.writeFileSync(path.join(OUTPUT_PATH, `${title}.json`), JSON.stringify(exportedObject, null, 2), {encoding: "utf8"})

// test import

const newDoc = new ePubDoc(exportedObject);
console.log(newDoc);
