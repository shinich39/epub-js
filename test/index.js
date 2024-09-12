import { ePubDoc, ePubPage, ePubNode, ePubFile } from "../index.js";
import path from "node:path";
import fs from "node:fs";
import JSZip from "./jszip.min.js";

const INPUT_PATH = path.join(process.cwd(), "input");
const OUTPUT_PATH = path.join(process.cwd(), "output");
const COVER_PATH = path.join(process.cwd(), "/src/icons/cover@1x.png");

const coverBase64 = fs.readFileSync(COVER_PATH, { encoding: "base64" });

const doc = new ePubDoc();

// console.log(doc)

const page = doc.addPage();
page.title = "PAGE-1";
doc.addPage();
doc.addPage();
doc.addPage();
const wrapper = page.addNode("div");
const inner = wrapper.addNode("span", { class: "inner" });
inner.content = "TEST";

const file1 = doc.addFile("1.png", coverBase64, "base64");
const style1 = doc.addFile("1.css", "span{ font-size: 32px; }");
page.addStyle(style1);
const script1 = doc.addFile("1.js", "console.log(\'test\');");
page.addScript(script1);
const img = wrapper.addNode("img", { src: file1, width: "512px", height: "512px" });
const link = wrapper.addNode("a", { href: file1 });
link.innerHTML += "1";
link.innerHTML += "2";

// file1.remove();
console.log(doc.toFiles())


// const div = page.add("div", { class: "wrapper", id: "wrapper"});
// const div2 = div.add("div", { class: "inner", id: "inner2"});
// const div3 = div.add("div", { class: "inner", id: "inner3"});
// const div4 = div.add("div", { class: "inner", id: "inner4"});
// const div5 = div.add("div", { class: "inner", id: "inner5"});

// const img = div5.add("img", { class: "image", id: "image", src: coverBuffer });

// div4.add("div", { class: "inner", id: "i3"});
// div3.add("div", { class: "inner", id: "i2"});
// div2.add("div", { class: "inner", id: "i1"});
// console.log(page.nodes.map(e => e.properties.id))
// console.log(div2.index)

// console.log(page.toString());

// function chkDir(p) {
//   if (!fs.existsSync(p)) {
//     fs.mkdirSync(p);
//   }
// }

// function chkDirs(p, r) {
//   const parts = (r ? path.relative(r, p) : p).split(/[\\\/]+/g);
//   let next = r;
//   for (const part of parts) {
//     if (path.extname(part) === "" && part !== "mimetype") {
//       next = path.join(next, part);
//       chkDir(next);
//     }
//   }
// }

// function rmDir(p) {
//   if (fs.existsSync(p)) {
//     fs.rmSync(p, { recursive: true });
//   }
// }

// const epub = new EPUB();

// const styles = [
//   "#toc li{ margin-top: 1rem; margin-bottom: 1rem; }",
//   "img{ width: 100%; height: 100%; object-fit: contain; object-position: center center; }",
// ];

// epub
//   .title("My EPUB")
//   .author("Me")
//   .language("en")
//   // .textDirection("rtl")
//   // .pageDirection("rtl")
//   .layout("pre-paginated") // reflowable, pre-paginated
//   // .orientation("auto") // auto, landscape, portrait
//   .spread("both") // auto, none, landscape, both
//   // .flow("auto") // auto, paginated, scrolled-continuous, scrolled-doc
//   .tag("1")
//   .tag("2")
//   .tag("3")
//   .style(styles.join("\n"), { class: "default", title: "default" })
//   .publishedAt(new Date())
//   .modifiedAt(new Date());

// // Test audio
// const audio = epub
//   .add()
//   .title("Audio test")
//   .nav()
//   .audio(
//     fs.readFileSync(path.join(INPUT_PATH, "1.mp3"), { encoding: "base64" }),
//     { controls: "controls" },
//   )
//   .exec();

// // Test video
// const video = epub
//   .add()
//   .title("Video test")
//   .nav()
//   .video(
//     fs.readFileSync(path.join(INPUT_PATH, "1.mp4"), { encoding: "base64" }),
//     { controls: "controls" },
//   )
//   .exec();

// console.log(epub.getCoverPath());
// console.log(epub.getNavPath());
// console.log(epub.getFilePath(video.getId()));
// Test flow
// let spread = ["left", "right"];
// for (let i = 0; i < 1000; i++) {
//   const page = epub.add();
//   page.title(`Chapter 1`);
//   page.h1(`page ${i}`);
//   for (let i = 0; i < 100; i++) {
//     page.p(`line ${i}`);
//   }
//   page.spreadPlacement(spread[i % 2]);
//   page.exec();
// }

// Test image
// let index = 0;
// for (const file of fs.readdirSync(INPUT_PATH)) {
//   const base64 = fs.readFileSync("./input/"+file, { encoding: "base64" });

//   const pipe = epub.add()
//     .title(`Page ${index + 1}`)
//     .img(base64)

//   if (index % 10 === 0) {
//     pipe.nav();
//   }

//   pipe.exec();

//   index++;
// }

// Test write
// rmDir(OUTPUT_PATH);
// chkDir(OUTPUT_PATH);

// epub.toZip().then(function (c) {
//   fs.writeFileSync(path.join(OUTPUT_PATH, `${epub.data.title}.epub`), c, {
//     encoding: "base64",
//   });
// });

// Test JSZip
// const zip = new JSZip();

// for (const file of epub.toArray()) {
//   try {
//     zip.file(file.path, file.data, {base64: file.encoding === "base64"});
//   } catch(err) {
//     console.error(err);
//   }
// }

// zip.generateAsync({type:"base64"})
//   .then(function(content) {
//     fs.writeFileSync(path.join(OUTPUT_PATH, `${epub.data.title}.epub`), content, {encoding: "base64"});
//   });
