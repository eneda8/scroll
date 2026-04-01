"use client";

import { useState, useCallback } from "react";
import { useLongPress } from "@/hooks/useLongPress";
import { ActionBar } from "./ActionBar";
import {
  generateShareCard,
  shareOrDownload,
  copyCardToClipboard,
} from "@/lib/generateShareCard";

interface PassageCardProps {
  id: number;
  chapter: number;
  text: string;
  title: string;
  author: string;
  reference?: string;
  isHighlighted: boolean;
  onToggleHighlight: () => void;
}

export function PassageCard({
  chapter,
  text,
  title,
  author,
  reference,
  isHighlighted,
  onToggleHighlight,
}: PassageCardProps) {
  const [showActions, setShowActions] = useState(false);

  const handleLongPress = useCallback(() => {
    setShowActions(true);
  }, []);

  const longPressHandlers = useLongPress(handleLongPress);

  const handleHighlight = () => {
    onToggleHighlight();
    setShowActions(false);
  };

  const getAttribution = () =>
    reference ? `${reference} · ${author}` : `${title} · Chapter ${chapter}`;

  const handleShare = async () => {
    setShowActions(false);
    const blob = await generateShareCard(text, getAttribution());
    await shareOrDownload(blob);
  };

  const handleCopy = async () => {
    setShowActions(false);
    const blob = await generateShareCard(text, getAttribution());
    await copyCardToClipboard(blob);
  };

  return (
    <>
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

      <ActionBar
        visible={showActions}
        isHighlighted={isHighlighted}
        onHighlight={handleHighlight}
        onShare={handleShare}
        onCopy={handleCopy}
        onDismiss={() => setShowActions(false)}
      />
    </>
  );
}
