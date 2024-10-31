import { ePubDoc } from "../index.js";
import path from "node:path";
import fs from "node:fs";
import JSZip from "./jszip.min.mjs";
import { getDirectoryPath, getRelativePath } from "../src/libs/utils.mjs";

const INPUT_PATH = path.join(process.cwd(), "input");
const OUTPUT_PATH = path.join(process.cwd(), "output");
const COVER_PATH = path.join(process.cwd(), "test/cover.png");

// Create a ePub document
const doc = new ePubDoc();

// ### Find default files
const mimetypeFile = doc.findFile({ filename: "mimetype" });
const containerFile = doc.findFile({ basename: "container.xml" });
const packageFile = doc.findFile({ basename: "package.opf" });

// ### Find default nodes
const packageNode = packageFile.findNode({ tag: "package" });
const metadataNode = packageFile.findNode({ tag: "metadata" });
const manifestNode = packageFile.findNode({ tag: "manifest" });
const spineNode = packageFile.findNode({ tag: "spine" });

// ### Set metadata

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
const author1 = doc.createNode({
  tag: "dc:creator",
  attributes: {
    id: "author-1"
  },
  children: [{
    content: "Bob",
  }]
});

// Append <dc:creator node to <metadata> node
metadataNode.appendChild(author1);

// Append multiple authors with Creation
// <dc:creator id="author-2">Mike</dc:creator>
// <dc:creator id="author-3">John</dc:creator>
metadataNode.appendChildren([{
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
}]);

// Set layout
// <meta property="rendition:layout">pre-paginated</meta>
// <meta property="rendition:orientation">landscape</meta>
// <meta property="rendition:spread">auto</meta>
metadataNode.appendChildren([{
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
}]);

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

// ### Add cover file

// Create a cover file
const coverImage = doc.appendChild({
  encoding: "base64",
  path: "EPUB/images/cover.png",
  data: fs.readFileSync(COVER_PATH, { encoding: "base64" }),
});

// Add coverImage to manifest
manifestNode.appendChild({
  tag: "item",
  closer: " /",
  attributes: {
    "id": coverImage._id,
    "href": coverImage.getRelativePath(packageFile.getAbsolutePath()),
    "media-type": coverImage.mimetype,
    "properties": "cover-image",
  },
});

// Add metadata for ePub 2.0 compatibility
metadataNode.appendChild({
  tag: "meta",
  closer: " /",
  attributes: {
    name: "cover",
    content: coverImage._id,
  }
});

// ### Add navigation file

// Create a navigation file
const navFile = doc.appendNav();

// Add nav to manifest
packageFile.appendManifestChild(navFile, {
  properties: "nav",
});

// Add nav to spine
packageFile.appendSpineChild(navFile, {
  linear: "yes",
});

// Create a NCX file
const ncxPage = doc.appendNCX();

// Add ncx to manifest
packageFile.appendManifestChild(ncxPage, {
  properties: "ncx",
});

// Add ncx to spine
packageFile.appendSpineChild(ncxPage, {
  linear: "yes",
});

// Set EPUB2 compatibility for using NCX file
// <spine ... toc="ncx">...</spine>
doc.updateNode({
  tag: "spine",
}, {
  $set: {
    "attributes.toc": "ncx",
  }
});

// Initialize NCX file
ncxPage.updateNode({
  tag: "meta",
  attributes: {
    name: "dtb:uid",
  }
}, {
  $set: {
    "attributes.content": packageFile.findNode({
        tag: "dc:identifier"
      }).getContent(),
  }
});

// Set <docTitle><text>... content value
// <docTitle><text>New Title</text></docTitle>
ncxPage.updateNode({
  tag: "docTitle"
}, {
  $set: {
    children: [{
      tag: "text",
      children: [{
        content: packageFile.findNode({
          tag: "dc:title"
        }).getContent(),
      }]
    }]
  }
});

// Add <docAuthor> nodes before <docTitle> node
// <docAuthor><text>Bob</text></docAuthor>
// <docAuthor><text>Mike</text></docAuthor>
// <docAuthor><text>John</text></docAuthor>
const docTitleIndex = ncxPage.findNode({
  tag: "docTitle"
}).getIndex();

ncxPage.findNode({
  tag: "ncx"
}).appendNodes(
  packageFile.findNodes({
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
  }), docTitleIndex + 1);

// ### Add page file

// Create a text page
const textPage = doc.appendPage({
  path: "EPUB/texts/page-01.xhtml",
});

// Add new page to manifest
packageFile.appendManifestChild(textPage);

// Add new page to spine
packageFile.appendSpineChild(textPage);

// Add <h1> to <body>
// <h1 id="heading" class="heading" style="font-size 1rem;">Text page</h1>
textPage.findNode({
  tag: "body",
}).appendNode({
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
textPage.findNode({
  tag: "body",
}).appendNodes([{
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

// Create an image page
const imagePage = doc.appendPage({
  path: "EPUB/texts/page-02.xhtml",
});

// Add new page to manifest
packageFile.appendManifestChild(imagePage);

// Add new page to spine
packageFile.appendSpineChild(imagePage);

// Add <img> to <body>
// <img id="cover-image" style="width: 100%;" src="../images/cover.png" alt="Cover image" />
const imageNode = imagePage.findNode({
  tag: "body",
}).appendNode({
  tag: "img",
  closer: " /",
  attributes: {
    id: "cover-image",
    style: "width: 100%;",
    src: coverImage.getRelativePath(imagePage),
    alt: "Cover image",
  }
});

// ### Set TOC items

// Find <nav epub:type="toc">...</nav> node
const tocNode = navFile.findNode({
  tag: "nav", 
  attributes: {
    "epub:type": "toc"
  }
});

// Add <h1> node
tocNode.appendNode({
  tag: "h1",
  children: [{
    content: "Table of Contents",
  }],
});

// Add List node
tocNode.appendNode({
  tag: "ol",
  children: [{
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
      children: [{
        content: "Page 1"
      }]
    }]
  }, {
    tag: "li",
    children: [{
      tag: "a",
      attributes: {
        href: imagePage.getRelativePath(navFile),
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
            href: imageNode.getRelativePath(navFile),
          },
          children: [{
            content: "Image",
          }]
        }]
      }]
    }]
  }],
});

// Find page files
const pageFiles = doc.findFiles({
  extension: ".xhtml",
});

// Remove page files from manifest
packageFile.removeManifestChildren({
  id: {
    $in: pageFiles.map(item => item._id)
  }
});

// Remove page files from spine
packageFile.removeSpineChildren({
  idref: {
    $in: pageFiles.map(item => item._id)
  }
});

// Add mutiple files to manifest
packageFile.appendManifestChildren(pageFiles);

// Add mutiple files to spine
packageFile.appendSpineChildren(pageFiles);

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

// ### Get metadata

const id = doc.findNode({ tag: "dc:identifier" }).getContent();
// 
const title = doc.findNode({ tag: "dc:title" }).getContent();
// New Title
const authors = doc.findNodes({ tag: "dc:creator" })
  .map(item => item.getContent());
// [ 'Bob', 'Mike' ]
const language = doc.findNode({ tag: "dc:language" }).getContent();
// ko

console.log("ID:", id);
console.log("Title:", title);
console.log("Authors:", authors);
console.log("Language:", language);

// Clear output
console.log();
console.log(`> Remove all files in the output directory`);

fs.rmSync(OUTPUT_PATH, { recursive: true, force: true });

// ### Export to file

// Export document to JSON
const exportedObject = doc.toObject();

// Import document from JSON
const newDoc = new ePubDoc(exportedObject);

// Export to file
const exportedFiles = newDoc.toFiles();

// Test with fs
console.log();
console.log(`> Start writing files`);

for (const file of exportedFiles) {
  const filePath = path.join(OUTPUT_PATH, title, file.path);
  const dirPath = path.dirname(filePath);

  console.log(`> Write ${filePath}`);

  fs.mkdirSync(dirPath, { recursive: true });
  fs.writeFileSync(filePath, file.data, { encoding: file.encoding });
}

// Test with JSZip
console.log();
console.log(`> Start writing files to archive`);

const zip = new JSZip();
for (const file of exportedFiles) {
  try {
    console.log(`> Write ${file.path}`);
    zip.file(file.path, file.data, { base64: file.encoding === "base64" });
  } catch(err) {
    console.error(err);
  }
}

zip.generateAsync({ type: "base64" })
  .then(function(content) {
    console.log();
    console.log(`> Start writing archive: ${title}.epub`);
    fs.writeFileSync(path.join(OUTPUT_PATH, `${title}.epub`), content, {encoding: "base64"});
  });

// Test with JSON
console.log();
console.log(`> Start writing JSON: ${title}.json`);

fs.writeFileSync(path.join(OUTPUT_PATH, `${title}.json`), JSON.stringify(exportedObject, null, 2), {encoding: "utf8"})
