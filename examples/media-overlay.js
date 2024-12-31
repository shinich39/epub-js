import path from "node:path";
import fs from "node:fs";
import { ePubDoc, ePubFile, ePubNode } from "epub-js";
import { createDoc } from "./simple.js";

// Install to setup clipBegin and clipEnd in smil
import moment from "moment";
import momentDurationFormatSetup from "moment-duration-format";

// Merge multiple wav
// For compatibility with old readers
import wavConcat from "wav-concat";

// Analyze for merge
import { getAudioDurationInSeconds } from "get-audio-duration";

// Convert wav to mp3
import { Lame } from "node-lame";

momentDurationFormatSetup(moment);

function concatWav(inputs, output) {
  return new Promise((resolve, reject) => {
    wavConcat(inputs)
      .concat(output)
      .on("start", function (command) {
        // console.log("ffmpeg process started:", command);
      })
      .on("error", function (err, stdout, stderr) {
        // console.error("Error:", err);
        // console.error("ffmpeg stderr:", stderr);
        reject(err);
      })
      .on("end", function (output) {
        // console.error("Audio created in:", output);
        resolve(output);
      });
  });
}

const audioPathList = [
  // [ePubNode, audioPath],
  
];

const doc = new ePubDoc();
const packageFile = doc.findFile({ extname: ".opf" });
const manifestNode = packageFile.findNode({ tag: "manifest" });
const spineNode = packageFile.findNode({ tag: "spine" });

const pageFile = new ePubFile(ePubFile.types.xhtml, {
  path: "EPUB/1.xhtml",
}).updateNode({
  tag: "body"
}, {
  $set: {
    children: [{
      tag: "div",
      attributes: {
        id: "1"
      },
      content: "TEST 1",
    }, {
      tag: "div",
      attributes: {
        id: "2"
      },
      content: "TEST 2",
    }]
  }
});

doc.append(pageFile);
manifestNode.append(ePubNode.types.item, {
    attributes:  {
      id: pageFile._id,
      href: pageFile.getRelativePath(packageFile),
      "media-type": pageFile.mimetype,
    }
  });

const smilFile = new ePubFile(ePubFile.types.smil);
const smilBody = smilFile.findNode({ tag: "body" });
doc.append(smilFile);

manifestNode.append(ePubNode.types.item, {
    attributes:  {
      id: smilFile._id,
      href: smilFile.getRelativePath(manifestNode),
      "media-type": smilFile.mimetype,
    }
  });

const seqNode = new ePubNode(ePubNode.types.seq, {
  attributes: {
    "epub:textref": pageFile.getRelPath(smilFile),
  },
});

smilBody.append(seqNode);

let wavOffset = 0,
    wavFiles = [];

for (const [targetNode, audioPath] of audioPathList) {
  const duration = await getAudioDurationInSeconds(audioPath);

  const start = wavOffset;
  const end = start + duration;
  
  const startStr = moment
    .duration(start, "seconds")
    .format("hh:mm:ss.SSS", {
      trim: false,
    })
    // Fix error: 00:00:0,000 => 00:00:0
    .replace(/,\d+$/, "");
  
  const endStr = moment
    .duration(end, "seconds")
    .format("hh:mm:ss.SSS", {
      trim: false,
    })
    .replace(/,\d+$/, "");
  
  wavOffset = end + 0.001;

  const parNode = new ePubNode({
    tag: "par",
    children: [
      {
        tag: "text",
        closer: "/",
        attributes: {
          src: targetNode.getRelPath(smilFile),
        },
      },
      {
        tag: "audio",
        closer: "/",
        attributes: {
          clipBegin: startStr,
          clipEnd: endStr,
          src: `../audios/${pageFile.filename}.mp3`,
        },
      },
    ],
  });

  smilBody.append(parNode);

  wavFiles.push(audioPath);
}

if (wavFiles.length > 0) {
  // Merge wav files
  await concatWav(wavFiles, "audio.wav");

  // Convert to mp3 from wav
  const encoder = new Lame({
    output: "buffer",
    bitrate: 192,
  }).setFile("./audio.wav");

  await encoder.encode();
  const buffer = encoder.getBuffer();
  const base64 = Buffer.from(buffer).toString("base64");

  const file = new ePubFile({
    encoding: "base64",
    path: `EPUB/audios/${pageFile.filename}.mp3`,
    data: base64,
  });

  doc.append(file);

  manifestNode.append(ePubNode.types.item, {
    attributes:  {
      id: file._id,
      href: file.getRelativePath(manifestNode),
      "media-type": file.mimetype,
    }
  });
}
