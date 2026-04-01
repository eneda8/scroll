const fs = require("fs");
const path = require("path");

const BASE_URL =
  "https://raw.githubusercontent.com/aruljohn/Bible-kjv/refs/heads/master";

function slugify(name) {
  return "bible-" + name.toLowerCase().replace(/\s+/g, "-");
}

function groupVersesIntoPassages(bookName, chapters) {
  const passages = [];
  let id = 1;

  for (const ch of chapters) {
    const chapterNum = parseInt(ch.chapter, 10);
    let buffer = [];
    let bufferWords = 0;
    let startVerse = null;
    let endVerse = null;

    const flush = () => {
      if (buffer.length === 0) return;
      const ref =
        startVerse === endVerse
          ? `${bookName} ${chapterNum}:${startVerse}`
          : `${bookName} ${chapterNum}:${startVerse}-${endVerse}`;
      passages.push({
        id: id++,
        chapter: chapterNum,
        text: buffer.join(" "),
        reference: ref,
      });
      buffer = [];
      bufferWords = 0;
      startVerse = null;
      endVerse = null;
    };

    for (const v of ch.verses) {
      const verseNum = parseInt(v.verse, 10);
      const verseWords = v.text.split(/\s+/).length;

      // If adding this verse would exceed 80 words and we have enough, flush
      if (bufferWords + verseWords > 80 && bufferWords >= 40) {
        flush();
      }

      if (startVerse === null) startVerse = verseNum;
      endVerse = verseNum;
      buffer.push(v.text);
      bufferWords += verseWords;

      // If we've reached a good size, flush
      if (bufferWords >= 40) {
        flush();
      }
    }
    // Flush remainder
    flush();
  }

  return passages;
}

async function main() {
  console.log("Fetching Books.json...");
  const booksRes = await fetch(`${BASE_URL}/Books.json`);
  const bookNames = await booksRes.json();
  console.log(`Found ${bookNames.length} books`);

  const outDir = path.join(__dirname, "public", "data", "bible");
  fs.mkdirSync(outDir, { recursive: true });

  const index = [];
  let totalPassages = 0;

  for (let i = 0; i < bookNames.length; i++) {
    const name = bookNames[i];
    const slug = slugify(name);
    process.stdout.write(`  [${i + 1}/${bookNames.length}] ${name}...`);

    // GitHub filenames strip spaces: "1 Samuel" -> "1Samuel", "Song of Solomon" -> "SongofSolomon"
    const fileName = name.replace(/\s+/g, "");
    const res = await fetch(`${BASE_URL}/${encodeURIComponent(fileName)}.json`);
    if (!res.ok) {
      console.log(` FAILED (${res.status})`);
      continue;
    }
    const data = await res.json();

    const passages = groupVersesIntoPassages(name, data.chapters);
    totalPassages += passages.length;

    const bookData = {
      title: name,
      author: "King James Bible",
      slug,
      passages,
    };

    const outFileName = slug.replace("bible-", "") + ".json";
    fs.writeFileSync(
      path.join(outDir, outFileName),
      JSON.stringify(bookData, null, 2)
    );

    index.push({
      name,
      slug,
      file: outFileName,
      chapters: data.chapters.length,
      passages: passages.length,
    });

    console.log(` ${passages.length} passages, ${data.chapters.length} chapters`);
  }

  fs.writeFileSync(
    path.join(outDir, "index.json"),
    JSON.stringify(index, null, 2)
  );

  console.log(
    `\nDone! ${totalPassages} total passages across ${index.length} books written to ${outDir}`
  );
}

main().catch(console.error);
