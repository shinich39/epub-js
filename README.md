# epub-js

Build epub with javascript.

## Usage

```js
import { EPUB } from "epub-js"; // esm
```

```js
const epub = new EPUB();

// Set epub metadata
epub.id("book-id"); // <dc:identifier>
epub.title("My EPUB"); // <dc:title>
epub.author("Me"); // Add author, <dc:creator>
epub.publisher("Me"); // <dc:publisher>
epub.category("education"); // <dc:type>
epub.language("en"); // <dc:language>
epub.textDirection("auto"); // <html dir="auto">
epub.pageDirection("ltr"); // <spine page-progression-direction="ltr">
epub.layout("pre-paginated"); // <meta property="rendition:layout">
epub.orientation("auto"); // <meta property="rendition:orientation">
epub.spread("auto"); // <meta property="rendition:spread">
epub.flow("auto"); // <meta property="rendition:flow">
epub.tag("tag3"); // Add tag, <dc:subject>
epub.cover("data:image/jpeg;base64,/9j/4..."); // base64, image/jpeg
epub.style("#toc li{ margin-top: 1rem; margin-bottom: 1rem; }", {
  title: "default",
  class: "default",
}); // Add style, apply to all pages
epub.publishedAt(new Date()); // <dc:date>
epub.modifiedAt(new Date()); // <meta property="dcterms:modified">

// Get file path
epub.getCoverPath(); // 6681b4bedf7330000004.jpg
epub.getNavPath(); // 6681b4be828dc8000003.xhtml
epub.getFilePath(fileId); // 6681b4bef5db77000008.xhtml

console.log(epub.data);
// {
//   id: '667eabc7be5555000000',
//   title: 'My EPUB',
//   category: 'education',
//   authors: [ 'Me' ],
//   publisher: 'Me',
//   language: 'en',
//   textDirection: 'auto',
//   pageDirection: null,
//   cover: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYAB...",
//   style: '\n' +
//     '<link class="default" title="default" rel="stylesheet" type="text/css" href="667eabc7537dda000005.css" />',
//   tags: [ '1', '2', '3', '4' ],
//   publishedAt: 2024-06-28T12:25:43.915Z,
//   createdAt: 2024-06-28T12:25:43.915Z,
//   modifiedAt: 2024-06-28T12:25:43.915Z,
//   enableNCX: false,
//   renditionLayout: 'pre-paginated',
//   renditionOrientation: null,
//   renditionSpread: 'both',
//   renditionFlow: null,
//   containerPath: 'META-INF/container.xml',
//   packagePath: 'EPUB/667eabc7e4aa76000001.opf',
//   ncxPath: 'EPUB/667eabc7a1f42e000002.ncx',
//   navPath: 'EPUB/667eabc7752241000003.xhtml',
//   navTitle: 'Index',
//   navId: 'navigation',
//   coverPath: 'EPUB/667eabc7521e3a000004.jpg',
//   coverId: 'cover-image'
// }
```

- Create a new page

```js
const page = epub.add();

// Page options
page.title("Chapter 1");
page.style("#ch1-title{ margin-bottom: 1rem; }"); // Create a new css file.
page.nav("Chapter 1", "ch1-title"); // Add #ch1-title to navigation
page.textDirection("auto"); // ltr, rtl, auto
page.layout("pre-paginated"); // reflowable, pre-paginated
page.orientation("auto"); // auto, landscape, portrait
page.spread("auto"); // auto, none, landscape, both
page.spreadPlacement(null); // center, left, right
page.flow("auto"); // auto, paginated, scrolled-continuous, scrolled-doc

// Page elements
page.body("<p>Lorem ipsum...</p>");
page.section(true, { "epub:type": "chapter" }); // Open section
page.section(false); // Close section
page.h1("Lorem ipsum...", { id: "ch1-title" });
page.h2("Lorem ipsum...");
page.h3("Lorem ipsum...");
page.h4("Lorem ipsum...");
page.h5("Lorem ipsum...");
page.h6("Lorem ipsum...");
page.p("Lorem ipsum...", { style: "margin-bottom: 1rem;" });
page.span("Lorem ipsum...");
page.a("Lorem ipsum...", { href: otherPage.getPath() });
page.ol(true, { id: "ch1-list1" }); // Open ol
page.li("Lorem ipsum...");
page.ol(false); // Close ol
page.ul(true); // Open ul
page.li("Lorem ipsum...");
page.ul(false); // Close ul
page.br();
page.img(base64, { id: "ch1-img1", width: "128px", height: "128px" }); // default .jpg
page.audio(base64, { controls: "controls" }); // default .mp3
page.video(base64, { controls: "controls", width: "128px", height: "128px" }); // default .mp4
page.exec(); // Save to epub

// Get page data
page.getId(); // 6681b4bedf7330000004
page.getPath(); // 6681b4bef5db77000008.xhtml
page.getLink("Lorem ipsum...", { id: "go-to-ch1" }); // <a href="6681b4bef5db77000008.xhtml" id="go-to-ch1">Lorem ipsum...</a>
page.getStyle(); // <link href="...">
page.getData(); // <xml...>...
page.valueOf();
// {
//   title: "Chapter 1",
//   data: ...,
// }
```

- Create a full-screen image page

```js
epub
  .add()
  .title(`Chapter 2`)
  .style(
    "img{ width: 100%; height: 100%; object-fit: contain; object-position: center center; }",
  )
  .img(base64) // Add <img />
  .nav() // Add this page to navigation
  .exec(); // Save to epub
```

- epub.toZip()

```js
import fs from "node:fs";

(async function () {
  const b64 = await epub.toZip(); // return base64
  writeFileSync(`${epub.data.title}.epub`, b64, { encoding: "base64" });
})();
```

- epub.toArray()

```js
import fs from "node:fs";
import path from "node:path";
import JSZip from "jszip";

function chkDir(p) {
  if (!fs.existsSync(p)) {
    fs.mkdirSync(p);
  }
}

function chkDirs(p, r) {
  const parts = (r ? path.relative(r, p) : p).split(/[\\\/]+/g);
  let next = r;
  for (const part of parts) {
    if (path.extname(part) === "" && part !== "mimetype") {
      next = path.join(next, part);
      chkDir(next);
    }
  }
}

const OUTPUT_PATH = path.join(process.cwd(), "output");

chkDir(OUTPUT_PATH);
for (const file of epub.toArray()) {
  try {
    const filePath = path.join(OUTPUT_PATH, file.path);
    chkDirs(filePath, OUTPUT_PATH);
    writeFileSync(filePath, file.data, { encoding: file.encoding || "utf8" });
  } catch (err) {
    console.error(err);
  }
}
```

## References

- [Epub 3.3](https://www.w3.org/TR/epub/)
- [Epub-Constructor](https://github.com/CD-Z/Epub-Constructor)
- [JSZip](https://github.com/Stuk/jszip)
- [jszip-esm](https://github.com/telerik/jszip-esm)
