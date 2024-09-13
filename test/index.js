import { ePubDoc, ePubPage, ePubNode, ePubFile } from "../index.js";
import { beautifyHTML } from "../src/core/util.js";
import path from "node:path";
import fs from "node:fs";
import JSZip from "./jszip.min.js";

const INPUT_PATH = path.join(process.cwd(), "input");
const OUTPUT_PATH = path.join(process.cwd(), "output");
const COVER_PATH = path.join(process.cwd(), "/src/icons/cover@1x.png");

const coverBase64 = fs.readFileSync(COVER_PATH, { encoding: "base64" });

const doc = new ePubDoc();
// console.log(doc)

const style = doc.addFile("1.css", "h1{ color: #777; } span{ font-size: 32px; }");
// const script = doc.addFile("1.js", "document.querySelectorAll('h3').forEach(e => e.innerHTML = 'converted');");

const coverPage = doc.addPage();
coverPage.name = "COVER PAGE";
const coverFile = doc.addCover("1.png", coverBase64, "base64");
const coverNode = coverPage.addNode("img", { width: "512px", height: "512px" });
coverNode.id = "cover";
coverNode.name = "COVER IMG";
coverNode.index = true;
coverNode.addFile(coverFile);

for (let i = 0; i < 10; i++) {
  const page = doc.addPage();
  page.name = `PAGE-${i}`;

  const h1 = page.addNode("h1");
  h1.content = page.name;

  const h3 = page.addNode("h3");
  h3.content = "Content";

  page.addStyle(style);
  // page.addScript(script);
}

// const inner = wrapper.addNode("span", { class: "inner" });
// inner.content = "TEST";

// const link = wrapper.addNode("a", { href: image1.href });
// link.id = "link";
// link.name = "### LINK ###";
// link.index = true;
// link.content += "1";
// link.content += "2";


const title = doc.title;
const files = doc.toFiles();

// test write
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
