const WIDTH = 1080;
const HEIGHT = 1350;
const BG = "#1a1a1a";
const TEXT_COLOR = "#f0ece4";
const MUTED_COLOR = "#6b6560";
const PADDING = 100;
const MAX_TEXT_WIDTH = WIDTH - PADDING * 2;

function loadFont(): Promise<void> {
  if (typeof document === "undefined") return Promise.resolve();
  const font = new FontFace(
    "Lora",
    "url(https://fonts.gstatic.com/s/lora/v35/0QI6MX1D_JOuGQbT0gvTJPa787weuxJBkq0.woff2)"
  );
  return font.load().then((loaded) => {
    document.fonts.add(loaded);
  });
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}

export async function generateShareCard(
  passageText: string,
  attribution: string
): Promise<Blob> {
  await loadFont();

  const canvas = document.createElement("canvas");
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const ctx = canvas.getContext("2d")!;

  // Background
  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // Passage text
  const fontSize = passageText.length > 300 ? 36 : passageText.length > 150 ? 42 : 48;
  const lineHeight = fontSize * 1.6;
  ctx.font = `${fontSize}px Lora, serif`;
  ctx.fillStyle = TEXT_COLOR;
  ctx.textBaseline = "top";

  const lines = wrapText(ctx, passageText, MAX_TEXT_WIDTH);
  const textBlockHeight = lines.length * lineHeight;

  // Center the text block vertically (shifted slightly up)
  const startY = (HEIGHT - textBlockHeight) / 2 - 80;

  for (let i = 0; i < lines.length; i++) {
    ctx.fillText(lines[i], PADDING, startY + i * lineHeight);
  }

  // Attribution
  ctx.font = "24px Lora, serif";
  ctx.fillStyle = MUTED_COLOR;
  const attrY = startY + textBlockHeight + 50;
  ctx.fillText(attribution, PADDING, attrY);

  // Wordmark at bottom
  ctx.font = "600 28px Lora, serif";
  ctx.fillStyle = MUTED_COLOR + "80";
  ctx.letterSpacing = "4px";
  const wordmark = "Scroll";
  const wmWidth = ctx.measureText(wordmark).width;
  ctx.fillText(wordmark, (WIDTH - wmWidth) / 2, HEIGHT - 80);

  // Thin line above wordmark
  ctx.strokeStyle = MUTED_COLOR + "40";
  ctx.lineWidth = 1;
  ctx.beginPath();
  const lineX = (WIDTH - wmWidth) / 2;
  ctx.moveTo(lineX, HEIGHT - 110);
  ctx.lineTo(lineX + wmWidth, HEIGHT - 110);
  ctx.stroke();

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob!), "image/png");
  });
}

export async function copyCardToClipboard(blob: Blob): Promise<boolean> {
  try {
    await navigator.clipboard.write([
      new ClipboardItem({ "image/png": blob }),
    ]);
    return true;
  } catch {
    return false;
  }
}

export async function shareOrDownload(blob: Blob) {
  const file = new File([blob], "scroll-highlight.png", { type: "image/png" });

  if (navigator.share && navigator.canShare?.({ files: [file] })) {
    await navigator.share({
      files: [file],
    });
  } else {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "scroll-highlight.png";
    a.click();
    URL.revokeObjectURL(url);
  }
}
