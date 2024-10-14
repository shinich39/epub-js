import { ePubDoc } from "../index.js";
import { toStr, toObj } from "../src/libs/dom.mjs";
import { beautifyHTML } from "../src/libs/utilities.js";
import path from "node:path";
import fs from "node:fs";
import JSZip from "./jszip.min.js";
import { queryObject } from "../src/libs/utils.mjs";

const INPUT_PATH = path.join(process.cwd(), "input");
const OUTPUT_PATH = path.join(process.cwd(), "output");
const COVER_PATH = path.join(process.cwd(), "/src/cover.png");
const COVER_DATA = fs.readFileSync(COVER_PATH, { encoding: "base64" });

const doc = new ePubDoc();

const coverImage = doc.addImage(doc.generateCoverImage(COVER_DATA));
const coverView = doc.addPage(doc.generateCoverPage(coverImage));

const navView = doc.addPage(doc.generateNav(), 0);
navView.spine.properties = "rendition:orientation-portrait";
navView.spine.properties += " rendition:page-spread-left";

const tocNode = navView.getNode({
  attributes: {
    "epub:type": "toc"
  }
});

tocNode.addNodes([
  {
    tag: "h1",
    children: [{
      content: "TOC",
    }],
  }, {
    tag: "ol",
    children: [{
      tag: "li",
      children: [{
        tag: "a",
        attributes: {
          href: coverView.getRelativePath(),
        },
        children: [{
          content: "Cover",
        }],
      }]
    }, {
      tag: "li",
      children: [{
        tag: "span",
        children: [{
          content: "Inner",
        }],
      }, {
        tag: "ol",
        children: [{
          tag: "li",
          children: [{
            tag: "a",
            attributes: {
              href: navView.getRelativePath()
            },
            children: [{
              content: "NAV"
            }]
          }, {
            tag: "ol",
            children: [{
              tag: "li",
              children: [{
                tag: "a",
                attributes: {
                  href: navView.getRelativePath()
                },
                children: [{
                  content: "NAV INNER"
                }]
              }]
            }]
          }]
        }]
      }]
    }, {
      tag: "li",
      children: [{
        tag: "span",
        children: [{
          content: "Inner2"
        }]
      }, {
        tag: "ol",
        children: [{
          tag: "li",
          children: [{
            tag: "a",
            attributes: {
              href: navView.getRelativePath()
            },
            children: [{
              content: "NAV2"
            }]
          }, {
            tag: "ol",
            children: [{
              tag: "li",
              children: [{
                tag: "a",
                attributes: {
                  href: navView.getRelativePath()
                },
                children: [{
                  content: "NAV INNER2"
                }]
              }]
            }]
          }]
        }]
      }, ]
    }]
  }
]);

const ncxView = doc.addPage(doc.generateNCX(tocNode));
const mtView = doc.addText(doc.generateMimetype());
const cntView = doc.addPage(doc.generateContainer());
const pkgView = doc.addPage(doc.generatePackage());


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
    fs.writeFileSync(path.join(OUTPUT_PATH, `${doc.title}.epub`), content, {encoding: "base64"});
  });

// test export
const exportedObject = doc.toObject();
fs.writeFileSync(path.join(OUTPUT_PATH, `${doc.title}.json`), JSON.stringify(exportedObject, null, 2), {encoding: "utf8"})
