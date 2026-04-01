const fs = require("fs");
const path = require("path");

const BOOKS = [
  { id: 64317, title: "The Great Gatsby", author: "F. Scott Fitzgerald", slug: "gatsby" },
  { id: 1342, title: "Pride and Prejudice", author: "Jane Austen", slug: "pride-and-prejudice" },
  { id: 98, title: "A Tale of Two Cities", author: "Charles Dickens", slug: "a-tale-of-two-cities" },
  { id: 2701, title: "Moby Dick", author: "Herman Melville", slug: "moby-dick" },
  { id: 84, title: "Frankenstein", author: "Mary Shelley", slug: "frankenstein" },
  { id: 174, title: "The Picture of Dorian Gray", author: "Oscar Wilde", slug: "dorian-gray" },
  { id: 3296, title: "The Confessions of St. Augustine", author: "St. Augustine", slug: "confessions" },
];

const MAX_WORDS = 60;

function romanToNum(roman) {
  const map = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
  let result = 0;
  for (let i = 0; i < roman.length; i++) {
    const cur = map[roman[i]] || 0;
    const next = map[roman[i + 1]] || 0;
    result += cur < next ? -cur : cur;
  }
  return result;
}

function findChapters(lines) {
  const chapterStarts = [];

  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();

    // Match patterns:
    // "CHAPTER 1", "Chapter 1", "CHAPTER I", "Chapter I"
    // "CHAPTER 1. Title.", "CHAPTER I."
    // "BOOK I", "BOOK II"
    // Standalone Roman numerals: "I", "II", "III"
    let match;
    const prevBlank = i === 0 || lines[i - 1].trim() === "";
    const nextBlank = i === lines.length - 1 || lines[i + 1].trim() === "";
    if (!prevBlank) continue;

    if ((match = trimmed.match(/^(?:CHAPTER|Chapter)\s+(\d+)(?:\..*)?$/))) {
      chapterStarts.push({ line: i, num: parseInt(match[1], 10) });
    } else if ((match = trimmed.match(/^(?:CHAPTER|Chapter)\s+([IVXLCDM]+)(?:\..*)?$/))) {
      chapterStarts.push({ line: i, num: romanToNum(match[1]) });
    } else if ((match = trimmed.match(/^(?:BOOK)\s+([IVXLCDM]+)\.?$/))) {
      if (nextBlank) {
        chapterStarts.push({ line: i, num: romanToNum(match[1]) });
      }
    } else if (/^[IVXLC]+$/.test(trimmed) && trimmed.length <= 5) {
      const num = romanToNum(trimmed);
      if (num >= 1 && num <= 200 && nextBlank) {
        chapterStarts.push({ line: i, num });
      }
    }
  }

  return chapterStarts;
}

function chunkText(lines, chapterStarts) {
  const passages = [];
  let id = 1;

  for (let ci = 0; ci < chapterStarts.length; ci++) {
    const chapterNum = chapterStarts[ci].num;
    const startLine = chapterStarts[ci].line + 1;
    const endLine =
      ci < chapterStarts.length - 1
        ? chapterStarts[ci + 1].line
        : lines.length;

    const chapterText = lines.slice(startLine, endLine).join("\n");

    const paragraphs = chapterText
      .split(/\n\s*\n/)
      .map((p) => p.replace(/\r?\n/g, " ").replace(/\s+/g, " ").trim())
      .map((p) => p.replace(/^-{3,}\s*/, "").replace(/\s*-{3,}$/, "").trim())
      .filter((p) => p.length > 0 && !/^-+$/.test(p));

    let buffer = [];
    let bufferWordCount = 0;

    const flush = () => {
      if (buffer.length === 0) return;
      const text = buffer.join("\n\n");
      passages.push({ id: id++, chapter: chapterNum, text });
      buffer = [];
      bufferWordCount = 0;
    };

    for (const para of paragraphs) {
      const wordCount = para.split(/\s+/).length;

      if (wordCount > MAX_WORDS) {
        flush();
        const sentences = para.match(/[^.!?]+[.!?]+[\s"\u201D\u2019]*/g) || [para];
        let sentBuf = [];
        let sentWords = 0;
        for (const sent of sentences) {
          const sw = sent.split(/\s+/).length;
          if (sentWords + sw > MAX_WORDS && sentBuf.length > 0) {
            passages.push({
              id: id++,
              chapter: chapterNum,
              text: sentBuf.join("").trim(),
            });
            sentBuf = [];
            sentWords = 0;
          }
          sentBuf.push(sent);
          sentWords += sw;
        }
        if (sentBuf.length > 0) {
          passages.push({
            id: id++,
            chapter: chapterNum,
            text: sentBuf.join("").trim(),
          });
        }
        continue;
      }

      if (bufferWordCount + wordCount > MAX_WORDS && buffer.length > 0) {
        flush();
      }

      buffer.push(para);
      bufferWordCount += wordCount;

      if (bufferWordCount >= 40) {
        flush();
      }
    }
    flush();
  }

  return passages;
}

async function processBook(book, outDir) {
  const url = `https://www.gutenberg.org/cache/epub/${book.id}/pg${book.id}.txt`;
  process.stdout.write(`  ${book.title}...`);

  const res = await fetch(url);
  const raw = await res.text();

  // Strip Gutenberg header/footer
  const startMarker = "*** START OF THE PROJECT GUTENBERG EBOOK";
  const endMarker = "*** END OF THE PROJECT GUTENBERG EBOOK";
  const startIdx = raw.indexOf(startMarker);
  const endIdx = raw.indexOf(endMarker);
  if (startIdx === -1 || endIdx === -1) {
    console.log(" FAILED (no Gutenberg markers)");
    return null;
  }
  const text = raw.slice(raw.indexOf("\n", startIdx) + 1, endIdx).trim();
  const lines = text.split(/\r?\n/);

  const chapterStarts = findChapters(lines);
  if (chapterStarts.length === 0) {
    console.log(" FAILED (no chapters found)");
    return null;
  }

  const passages = chunkText(lines, chapterStarts);

  const bookData = {
    title: book.title,
    author: book.author,
    slug: book.slug,
    passages,
  };

  fs.writeFileSync(
    path.join(outDir, `${book.slug}.json`),
    JSON.stringify(bookData, null, 2)
  );

  const chapters = new Set(passages.map((p) => p.chapter)).size;
  console.log(` ${passages.length} passages, ${chapters} chapters`);

  return {
    title: book.title,
    author: book.author,
    slug: book.slug,
    file: `${book.slug}.json`,
    chapters,
    passages: passages.length,
  };
}

async function main() {
  const outDir = path.join(__dirname, "public", "data", "literature");
  fs.mkdirSync(outDir, { recursive: true });

  console.log(`Chunking ${BOOKS.length} books from Project Gutenberg...\n`);

  const index = [];
  for (const book of BOOKS) {
    const entry = await processBook(book, outDir);
    if (entry) index.push(entry);
  }

  fs.writeFileSync(
    path.join(outDir, "index.json"),
    JSON.stringify(index, null, 2)
  );

  console.log(
    `\nDone! ${index.length} books, ${index.reduce((s, b) => s + b.passages, 0)} total passages`
  );
}

main().catch(console.error);
