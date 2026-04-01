"use client";

import Image from "next/image";

interface BookPickerProps {
  onSelectBook: (slug: string) => void;
  onSelectBible: () => void;
}

export function BookPicker({ onSelectBook, onSelectBible }: BookPickerProps) {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center gap-6 px-6">
      <Image
        src="/scroll-wordmark.svg"
        alt="SCROLL"
        width={120}
        height={30}
        className="brightness-0 invert opacity-60 mb-4"
      />

      <button
        onClick={() => onSelectBook("gatsby")}
        className="w-full max-w-sm bg-card rounded-2xl p-6 text-left transition-colors hover:bg-card/80 active:bg-card/60"
      >
        <p className="font-serif text-lg text-foreground">The Great Gatsby</p>
        <p className="text-xs text-muted mt-1 uppercase tracking-wide">
          F. Scott Fitzgerald
        </p>
      </button>

      <button
        onClick={onSelectBible}
        className="w-full max-w-sm bg-card rounded-2xl p-6 text-left transition-colors hover:bg-card/80 active:bg-card/60"
      >
        <p className="font-serif text-lg text-foreground">
          The Holy Bible
        </p>
        <p className="text-xs text-muted mt-1 uppercase tracking-wide">
          King James Version
        </p>
      </button>
    </div>
  );
}
