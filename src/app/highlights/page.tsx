"use client";

import Link from "next/link";
import { useCurrentBook } from "@/hooks/useCurrentBook";
import { useBookData } from "@/hooks/useBookData";
import { useHighlights } from "@/hooks/useHighlights";

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
              <p className="text-xs tracking-wide text-muted mb-1 uppercase">
                {passage.reference
                  ? passage.reference
                  : `Chapter ${passage.chapter}`}
              </p>
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
