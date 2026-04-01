"use client";

import { useLongPress } from "@/hooks/useLongPress";

interface PassageCardProps {
  id: number;
  text: string;
  title: string;
  author: string;
  reference?: string;
  isHighlighted: boolean;
  onToggleHighlight: () => void;
}

export function PassageCard({
  text,
  title,
  author,
  reference,
  isHighlighted,
  onToggleHighlight,
}: PassageCardProps) {
  const longPressHandlers = useLongPress(onToggleHighlight);

  return (
    <div
      className="h-screen min-h-screen w-full snap-start snap-always flex items-center justify-center px-4 py-12"
      {...longPressHandlers}
    >
      <div
        className={`w-full max-w-lg rounded-2xl bg-card p-6 md:p-12 transition-colors select-none overflow-y-auto max-h-[calc(100vh-6rem)] ${
          isHighlighted ? "border-l-4 border-gold" : ""
        }`}
      >
        <p className="text-xs tracking-wide text-muted mb-1 uppercase">
          {title} &middot; {author}
        </p>
        {reference && (
          <p className="text-xs text-muted/60 mb-4">{reference}</p>
        )}
        {!reference && <div className="mb-3" />}
        <p className="font-serif text-base md:text-lg leading-relaxed text-foreground">
          {text}
        </p>
      </div>
    </div>
  );
}
