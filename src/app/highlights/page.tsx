"use client";

import Link from "next/link";
import { useHighlights } from "@/hooks/useHighlights";
import bookData from "@/data/book.json";

export default function HighlightsPage() {
  const { highlights, loaded } = useHighlights();

  const highlightedPassages = bookData.passages.filter((p) =>
    highlights.has(p.id)
  );

  if (!loaded) {
    return <div className="h-screen bg-background" />;
  }

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
              <p className="text-xs tracking-wide text-muted mb-3 uppercase">
                Chapter {passage.chapter}
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
