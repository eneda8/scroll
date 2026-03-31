const fs = require("fs");
const path = require("path");

const URL = "https://www.gutenberg.org/cache/epub/64317/pg64317.txt";

async function main() {
  console.log("Fetching The Great Gatsby from Project Gutenberg...");
  const res = await fetch(URL);
  const raw = await res.text();

  // Strip Gutenberg header and footer
  const startMarker = "*** START OF THE PROJECT GUTENBERG EBOOK";
  const endMarker = "*** END OF THE PROJECT GUTENBERG EBOOK";
  const startIdx = raw.indexOf(startMarker);
  const endIdx = raw.indexOf(endMarker);
  if (startIdx === -1 || endIdx === -1) {
    throw new Error("Could not find Gutenberg markers");
  }
  let text = raw.slice(raw.indexOf("\n", startIdx) + 1, endIdx).trim();

  // Strip the title page, table of contents, and dedication/epigraph
  // The actual text starts after the centered "I" chapter heading
  // Chapter headings in this edition are centered Roman numerals like:
  //   "                                  I"
  const romanToNum = (roman) => {
    const map = { I: 1, V: 5, X: 10, L: 50, C: 100 };
    let result = 0;
    for (let i = 0; i < roman.length; i++) {
      const cur = map[roman[i]] || 0;
      const next = map[roman[i + 1]] || 0;
      result += cur < next ? -cur : cur;
    }
    return result;
  };

  // Find chapter boundaries: lines that are just centered Roman numerals
  // Match lines with optional leading whitespace, a Roman numeral, and nothing else
  const lines = text.split(/\r?\n/);
  const chapterStarts = [];

  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    // Must be a standalone Roman numeral (I through IX)
    if (/^[IVXLC]+$/.test(trimmed) && trimmed.length <= 4) {
      const num = romanToNum(trimmed);
      if (num >= 1 && num <= 9) {
        // Verify it's preceded and followed by blank lines (a heading, not inline)
        const prevBlank = i === 0 || lines[i - 1].trim() === "";
        const nextBlank = i === lines.length - 1 || lines[i + 1].trim() === "";
        if (prevBlank && nextBlank) {
          chapterStarts.push({ line: i, num });
        }
      }
    }
  }

  console.log(`Found ${chapterStarts.length} chapters`);

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

    // Split into paragraphs (double newline separated)
    // Strip Gutenberg separator lines (rows of dashes)
    const paragraphs = chapterText
      .split(/\n\s*\n/)
      .map((p) => p.replace(/\r?\n/g, " ").replace(/\s+/g, " ").trim())
      .map((p) => p.replace(/^-{3,}\s*/, "").replace(/\s*-{3,}$/, "").trim())
      .filter((p) => p.length > 0 && !/^-+$/.test(p));

    // Group paragraphs into passages
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

      const MAX_WORDS = 120;

      // If a single paragraph exceeds the limit, split at sentence breaks
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

      // If adding this paragraph would exceed the limit, flush first
      if (bufferWordCount + wordCount > MAX_WORDS && buffer.length > 0) {
        flush();
      }

      buffer.push(para);
      bufferWordCount += wordCount;

      // Flush when we have a reasonable passage size (40+ words)
      if (bufferWordCount >= 40) {
        flush();
      }
    }
    flush();
  }

  const output = {
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    passages,
  };

  const outPath = path.join(__dirname, "src", "data", "book.json");
  fs.writeFileSync(outPath, JSON.stringify(output, null, 2));
  console.log(
    `Done! Wrote ${passages.length} passages across ${new Set(passages.map((p) => p.chapter)).size} chapters to ${outPath}`
  );

  // Print some stats
  const wordCounts = passages.map((p) => p.text.split(/\s+/).length);
  console.log(
    `Word count range: ${Math.min(...wordCounts)}-${Math.max(...wordCounts)}, avg: ${Math.round(wordCounts.reduce((a, b) => a + b, 0) / wordCounts.length)}`
  );
}

main().catch(console.error);
