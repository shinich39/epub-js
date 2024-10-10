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

const coverImage = doc.addImage({
  path: "EPUB/cover.png",
  data: COVER_DATA,
  encoding: "base64",
  menifest: {
    properties: "cover-image",
  },
});

const coverView = doc.generateCover(coverImage);

// const testView = doc.addView({
//   path: "EPUB/test.xhtml",
//   data: fs.readFileSync(path.join(process.cwd(), "/test/index.html"), "utf8"),
// });

const navView = doc.generateNav();
navView.spine.properties = "rendition:orientation-portrait";
navView.spine.properties += " rendition:page-spread-left";

const tocNode = navView.getNode({ attributes: { "epub:type": "toc" } });

tocNode.addNodes([
  {
    tag: "h1",
    children: [{
      content: "TOC"
    }]
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
          content: "Cover"
        }]
      }]
    }, {
      tag: "li",
      children: [{
        tag: "span",
        children: [{
          content: "Inner"
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

const ncxView = doc.generateNCX(tocNode);


const mtView = doc.generateMimetype();
const cntView = doc.generateContainer();
const pkgView = doc.generatePackage();


// console.log(navView.toString())
// console.log(ncxView.toString())


// const coverImage = doc.addImage({
//   path: "EPUB/cover.png",
//   data: COVER_DATA,
//   attributes: {
//     alt: "This is cover image!"
//   }
// });

// const audio = doc.addAudio({
//   path: "EPUB/cover.png",
//   data: COVER_DATA,
//   attributes: {
//     alt: "This is cover image!",
//     controls: true
//   }
// });
// console.log(toObj(audio.toString()).children[0])

// const view = doc.addView({
//   path: "EPUB/1.xhtml",
// });

// const body = view.getNode({ tag: "body" });

// body.addNode({ tag: "span", name: "0" }).addNode({ content: "T0", name: `T0` });
// body.addNode({ tag: "span", name: "1" }).addNode({ content: "T1", name: `T1` });
// const a = body.addNode({ tag: "span", name: "2" }).addNode({ tag: "a" });

// a.addNode({ content: "T2", name: "T2T0" });
// a.addNode({ content: "T2", name: "T2T1" });
// a.addNode({ content: "T2", name: "T2T2" });
// body.addNode({ tag: "span", name: "3" }).addNode({ content: "T3", name: `T3` });
// body.addNode({ tag: "span", name: "4" }).addNode({ content: "T4", name: `T4` });

// body.getNode({ name: "2" })
// console.log(view.getTexts())

// const { view } = doc.generateCover(COVER_DATA);

// console.log(view.getNode("img"));

// const doc2 =  new ePubDoc(doc.toObject());

// doc2.removeImages();

// console.log(doc2);

// nav.tocNode.addNode({ tag: "h1", content: "Table of Contents" });

// const navTocListNode = nav.tocNode.addNode({ tag: "ol", content: "" });
// navTocListNode.addNode({ tag: "li", content: "" })
//           .addNode({
//             tag: "a",
//             content: "Cover",
//             properties: {
//               href: cover.view.getRelativePath()
//             }
//           });

// navTocListNode.addNode({ tag: "li", content: "" })
//           .addNode({
//             tag: "a",
//             content: "Navigation",
//             properties: {
//               href: nav.view.getRelativePath()
//             }
//           });

// nav.landmarkNode.addNode({ tag: "h1", content: "Landmarks" });
// const navLandmarkListNode = nav.landmarkNode.addNode({ tag: "ol", content: "" });

// navLandmarkListNode.addNode({ tag: "li", content: "" })
//                   .addNode({
//                     tag: "a",
//                     content: "Cover",
//                     properties: {
//                       "epub:type": "cover",
//                       href: cover.view.getRelativePath()
//                     }
//                   });

// navLandmarkListNode.addNode({ tag: "li", content: "" })
//                   .addNode({
//                     tag: "a",
//                     content: "Navigation",
//                     properties: {
//                       "epub:type": "nav",
//                       href: cover.view.getRelativePath()
//                     }
//                   });

// nav.pageListNode.remove();

// console.log(nav.view.toNode());






// // test write
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
