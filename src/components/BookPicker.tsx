"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface LiteratureEntry {
  title: string;
  author: string;
  slug: string;
}

interface BookPickerProps {
  onSelectBook: (slug: string) => void;
  onSelectBible: () => void;
}

export function BookPicker({ onSelectBook, onSelectBible }: BookPickerProps) {
  const [books, setBooks] = useState<LiteratureEntry[]>([]);

  useEffect(() => {
    fetch("/data/literature/index.json")
      .then((res) => res.json())
      .then((data: LiteratureEntry[]) => setBooks(data));
  }, []);

  return (
    <div className="min-h-screen w-full flex flex-col items-center py-12 gap-4 px-6">
      <Image
        src="/scroll-wordmark.svg"
        alt="SCROLL"
        width={120}
        height={30}
        className="brightness-0 invert opacity-60 mb-4"
      />

      {books.map((book) => (
        <button
          key={book.slug}
          onClick={() => onSelectBook(book.slug)}
          className="w-full max-w-sm bg-card rounded-2xl p-6 text-left transition-colors hover:bg-card/80 active:bg-card/60"
        >
          <p className="font-serif text-lg text-foreground">{book.title}</p>
          <p className="text-xs text-muted mt-1 uppercase tracking-wide">
            {book.author}
          </p>
        </button>
      ))}

      <button
        onClick={onSelectBible}
        className="w-full max-w-sm bg-card rounded-2xl p-6 text-left transition-colors hover:bg-card/80 active:bg-card/60"
      >
        <p className="font-serif text-lg text-foreground">The Holy Bible</p>
        <p className="text-xs text-muted mt-1 uppercase tracking-wide">
          King James Version
        </p>
      </button>
    </div>
  );
}
