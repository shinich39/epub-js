import { ePubDoc, ePubFile, ePubNode } from "../dist/epub.mjs";
import { createDoc } from "../examples/simple.js";
import path from "node:path";
import fs from "node:fs";
import JSZip from "./libs/jszip.min.mjs";

const INPUT_PATH = path.join(process.cwd(), "input");
const OUTPUT_PATH = path.join(process.cwd(), "output");
const COVER_PATH = path.join(process.cwd(), "test/cover.png");
const TITLE = "test";
const AUTHORS = ["shinich39", "epub-js"];

// Create a ePub document
const {
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
} = createDoc();

doc.setTitle(TITLE);
doc.setAuthors(...AUTHORS);
doc.setCover(COVER_PATH)

// Export to file
const exportedFiles = doc.toFiles();

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
      base64: file.encoding == "base64",
    };

    zip.file(p, data, options);
  } catch(err) {
    console.error(err);
  }
}

console.log();
console.log(`> Remove all files in the output directory`);
fs.rmSync(OUTPUT_PATH, { recursive: true, force: true });

// Write each file to directory
console.log();
console.log(`> Start writing files`);
for (const file of exportedFiles) {
  const filePath = path.join(OUTPUT_PATH, TITLE, file.path);
  const dirPath = path.dirname(filePath);

  console.log(`> Write ${filePath}`);

  fs.mkdirSync(dirPath, { recursive: true });
  fs.writeFileSync(filePath, file.data, file.encoding ? { encoding: file.encoding } : undefined);
}

// Write a epub file
const epub = await zip.generateAsync({ type: "base64" });
console.log();
console.log(`> Start writing archive: ${TITLE}.epub`);
fs.writeFileSync(path.join(OUTPUT_PATH, `${TITLE}.epub`), epub, {encoding: "base64"});