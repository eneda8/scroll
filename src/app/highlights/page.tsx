"use client";

import Link from "next/link";
import { useCurrentBook } from "@/hooks/useCurrentBook";
import { useBookData } from "@/hooks/useBookData";
import { useHighlights } from "@/hooks/useHighlights";
import {
  generateShareCard,
  shareOrDownload,
} from "@/lib/generateShareCard";

export default function HighlightsPage() {
  const { currentBookSlug, loaded: bookLoaded } = useCurrentBook();
  const { data: bookData, loading: bookLoading } = useBookData(currentBookSlug);
  const { highlights, loaded: hlLoaded } = useHighlights(
    currentBookSlug || "gatsby"
  );

  if (!bookLoaded || bookLoading || !bookData || !hlLoaded) {
    return <div className="h-screen bg-background" />;
  }

  const highlightedPassages = bookData.passages.filter((p) =>
    highlights.has(p.id)
  );

  const handleShare = async (passageText: string, reference: string | undefined, chapter: number) => {
    const attribution = reference
      ? `${reference} · ${bookData.author}`
      : `${bookData.title} · Chapter ${chapter}`;
    const blob = await generateShareCard(passageText, attribution);
    await shareOrDownload(blob);
  };

  return (
    <main className="min-h-screen bg-background px-4 py-8 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-foreground text-lg font-serif">Highlights</h1>
        <Link
          href="/"
          className="text-muted hover:text-foreground text-sm transition-colors"
        >
          Back
        </Link>
      </div>

      <p className="text-xs text-muted uppercase tracking-wide mb-6">
        {bookData.title}
      </p>

      {highlightedPassages.length === 0 ? (
        <p className="text-muted text-sm">
          No highlights yet. Long press a passage to highlight it.
        </p>
      ) : (
        <div className="space-y-6">
          {highlightedPassages.map((passage) => (
            <div
              key={passage.id}
              className="border-l-4 border-gold bg-card rounded-r-lg p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <p className="text-xs tracking-wide text-muted mb-1 uppercase">
                  {passage.reference
                    ? passage.reference
                    : `Chapter ${passage.chapter}`}
                </p>
                <button
                  onClick={() =>
                    handleShare(passage.text, passage.reference, passage.chapter)
                  }
                  className="text-muted hover:text-foreground transition-colors shrink-0"
                  aria-label="Share"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                    <polyline points="16 6 12 2 8 6" />
                    <line x1="12" y1="2" x2="12" y2="15" />
                  </svg>
                </button>
              </div>
              <p className="font-serif text-base leading-relaxed text-foreground">
                {passage.text}
              </p>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
