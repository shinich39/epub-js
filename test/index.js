import { ePubDoc } from "../index.js";
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

const { view } = doc.generateCover(COVER_DATA);
// const { view } = doc.generateNav();

console.log(view.toObject());

console.log(doc.addView(view.toObject()).toString());

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
// fs.rmSync(OUTPUT_PATH, { recursive: true, force: true });
// for (const file of files) {
//   const filePath = path.join(OUTPUT_PATH, file.path);
//   const dirPath = path.dirname(filePath);
//   fs.mkdirSync(dirPath, { recursive: true });
//   fs.writeFileSync(filePath, file.data, { encoding: file.encoding });
// }

// // test JSZip
// // fs.rmSync(OUTPUT_PATH, { recursive: true, force: true });
// // fs.mkdirSync(OUTPUT_PATH);
// const zip = new JSZip();
// for (const file of files) {
//   try {
//     zip.file(file.path, file.data, { base64: file.encoding === "base64" });
//   } catch(err) {
//     console.error(err);
//   }
// }

// zip.generateAsync({ type:"base64" })
//   .then(function(content) {
//     fs.writeFileSync(path.join(OUTPUT_PATH, `${title}.epub`), content, {encoding: "base64"});
//   });
