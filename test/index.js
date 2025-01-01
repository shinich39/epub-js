import { ePubDoc, ePubFile, ePubNode } from "../dist/epub.mjs";
import { createDoc } from "../examples/quick.js";
import path from "node:path";
import fs from "node:fs";
import JSZip from "./libs/jszip.min.mjs";

const INPUT_PATH = path.join(process.cwd(), "input");
const OUTPUT_PATH = path.join(process.cwd(), "output");
const COVER_PATH = path.join(process.cwd(), "test/cover.png");
const TITLE = "test";
const AUTHORS = ["shinich39", "epub-js"];


// Create a ePub document
const doc = createDoc();

doc.setTitle(TITLE);
doc.setAuthor(...AUTHORS);
doc.setCover(COVER_PATH);

doc.addPage(null, {
  title: "page 1",
  body: [{
    content: "<div>TEST1</div>",
  }, {
    "tag": "div",
    content: "<div>TEST1</div>",
  }]
});

doc.addPage(null, {
  title: "page 2",
  body: [{
    data: "<div><span>TEST2</span></div>",
  },{
    "tag": "div",
    data: "<div><span>TEST2</span></div>",
  }]
});

doc.addPage(null, {
  title: "page 3",
  body: [{
    children: [{
      data: "<div><span>TEST3</span></div>",
    }]
  },{
    "tag": "div",
    children: [{
      data: "<div><span>TEST3</span></div>",
    }]
  }]
});

// doc.doc.findFile({
//   filename: "1"
// }).filename = 2

// Buffer test
doc.addFile(COVER_PATH, "EPUB/images/buffer.png");

// console.log(doc.toObject());

fs.rmSync(OUTPUT_PATH, { recursive: true, force: true });
doc.export(OUTPUT_PATH);

// console.log(ePubDoc.utils.calcMaxValidImageSize(100, 100))
// console.log(ePubDoc.utils.calcValidImageSize(5000, 5000))
// console.log(ePubDoc.utils.calcValidImageSize(1000, 1000))
// console.log(ePubDoc.utils.isValidImageSize(2500, 2500))
// console.log(ePubDoc.utils.isValidImageSize(1000, 1000))

// Export to object
// const exportedObj = doc.toObject();

// Export to file
// const exportedFiles = doc.toFiles();

// Create zip object with JSZip
// console.log();
// console.log(`> Start creating zip object`);

// const zip = new JSZip();
// for (const file of exportedFiles) {
//   try {
//     console.log(`> Append ${file.path}`);

//     const p = file.path;

//     const data = file.encoding === "base64" ?
//       // Remove prefix of base64
//       file.data.split(",").pop() :
//       file.data;

//     const options = {
//       base64: file.encoding == "base64",
//     };

//     zip.file(p, data, options);
//   } catch(err) {
//     console.error(err);
//   }
// }

// console.log();
// console.log(`> Remove all files in the output directory`);
// fs.rmSync(OUTPUT_PATH, { recursive: true, force: true });

// // Write each file to directory
// console.log();
// console.log(`> Start writing files`);
// for (const file of exportedFiles) {
//   const filePath = path.join(OUTPUT_PATH, TITLE, file.path);
//   const dirPath = path.dirname(filePath);

//   console.log(`> Write ${filePath}`);

//   fs.mkdirSync(dirPath, { recursive: true });
//   fs.writeFileSync(filePath, file.data, file.encoding ? { encoding: file.encoding || "utf8" } : undefined);
// }

// // Write a epub file
// const epub = await zip.generateAsync({ type: "base64" });
// console.log();
// console.log(`> Start writing archive: ${TITLE}.epub`);
// fs.writeFileSync(path.join(OUTPUT_PATH, `${TITLE}.epub`), epub, {encoding: "base64"});