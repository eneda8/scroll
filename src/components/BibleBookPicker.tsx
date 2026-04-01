"use client";

import { useState, useEffect } from "react";
import type { BibleBookEntry } from "@/types/book";

interface BibleBookPickerProps {
  onSelectBook: (slug: string) => void;
  onBack: () => void;
}

const OT_COUNT = 39;

export function BibleBookPicker({ onSelectBook, onBack }: BibleBookPickerProps) {
  const [books, setBooks] = useState<BibleBookEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/data/bible/index.json")
      .then((res) => res.json())
      .then((data: BibleBookEntry[]) => {
        setBooks(data);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="h-screen bg-background" />;
  }

  const oldTestament = books.slice(0, OT_COUNT);
  const newTestament = books.slice(OT_COUNT);

  return (
    <div className="min-h-screen bg-background px-4 py-8 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-foreground text-lg font-serif">The Holy Bible</h1>
        <button
          onClick={onBack}
          className="text-muted hover:text-foreground text-sm transition-colors"
        >
          Back
        </button>
      </div>

      <p className="text-xs text-muted uppercase tracking-[0.2em] mb-4">
        Old Testament
      </p>
      <div className="grid grid-cols-2 gap-3 mb-8">
        {oldTestament.map((book) => (
          <button
            key={book.slug}
            onClick={() => onSelectBook(book.slug)}
            className="bg-card rounded-xl p-4 text-left transition-colors hover:bg-card/80 active:bg-card/60"
          >
            <p className="font-serif text-sm text-foreground">{book.name}</p>
            <p className="text-xs text-muted mt-1">
              {book.chapters} {book.chapters === 1 ? "ch" : "chs"}
            </p>
          </button>
        ))}
      </div>

      <p className="text-xs text-muted uppercase tracking-[0.2em] mb-4">
        New Testament
      </p>
      <div className="grid grid-cols-2 gap-3 mb-8">
        {newTestament.map((book) => (
          <button
            key={book.slug}
            onClick={() => onSelectBook(book.slug)}
            className="bg-card rounded-xl p-4 text-left transition-colors hover:bg-card/80 active:bg-card/60"
          >
            <p className="font-serif text-sm text-foreground">{book.name}</p>
            <p className="text-xs text-muted mt-1">
              {book.chapters} {book.chapters === 1 ? "ch" : "chs"}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
