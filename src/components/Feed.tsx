"use client";

import { useRef, useEffect, useCallback, useMemo } from "react";
import type { BookData, Passage } from "@/types/book";
import { PassageCard } from "./PassageCard";
import { ChapterDivider } from "./ChapterDivider";
import { SessionSummary } from "./SessionSummary";
import { useReadingPosition } from "@/hooks/useReadingPosition";
import { useHighlights } from "@/hooks/useHighlights";
import { useSessionTimer } from "@/hooks/useSessionTimer";

type FeedItem =
  | { type: "chapter"; chapter: number; label: string; key: string }
  | {
      type: "passage";
      id: number;
      chapter: number;
      text: string;
      reference?: string;
      key: string;
    };

interface FeedProps {
  bookData: BookData;
  onChangeBook: () => void;
}

export function Feed({ bookData, onChangeBook }: FeedProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { currentIndex, savePosition, loaded: posLoaded } = useReadingPosition(
    bookData.slug
  );
  const { isHighlighted, toggleHighlight, loaded: hlLoaded } = useHighlights(
    bookData.slug
  );

  const isBible = bookData.slug.startsWith("bible-");

  // Build feed items: insert chapter dividers before first passage of each chapter
  const feedItems = useMemo<FeedItem[]>(() => {
    const items: FeedItem[] = [];
    let lastChapter = 0;
    for (const passage of bookData.passages as Passage[]) {
      if (passage.chapter !== lastChapter) {
        const label = isBible
          ? `${bookData.title} ${passage.chapter}`
          : `Chapter ${passage.chapter}`;
        items.push({
          type: "chapter",
          chapter: passage.chapter,
          label,
          key: `ch-${passage.chapter}`,
        });
        lastChapter = passage.chapter;
      }
      items.push({
        type: "passage",
        id: passage.id,
        chapter: passage.chapter,
        text: passage.text,
        reference: passage.reference,
        key: `p-${passage.id}`,
      });
    }
    return items;
  }, [bookData.passages, bookData.title, isBible]);

  // Count words read up to currentIndex
  const wordsRead = useMemo(() => {
    let count = 0;
    for (let i = 0; i <= currentIndex && i < feedItems.length; i++) {
      const item = feedItems[i];
      if (item.type === "passage") {
        count += item.text.split(/\s+/).length;
      }
    }
    return count;
  }, [currentIndex, feedItems]);

  const {
    showSummary,
    sessionMinutes,
    pagesRead,
    resetIdleTimer,
    dismissSummary,
  } = useSessionTimer(wordsRead);

  // Scroll to saved position on load
  useEffect(() => {
    if (posLoaded && containerRef.current) {
      const target = containerRef.current.children[currentIndex] as HTMLElement;
      if (target) {
        target.scrollIntoView();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [posLoaded]);

  // Track scroll position via IntersectionObserver
  const observerRef = useRef<IntersectionObserver | null>(null);

  const setupObserver = useCallback(() => {
    if (!containerRef.current) return;

    observerRef.current?.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const idx = Number(
              (entry.target as HTMLElement).dataset.index
            );
            if (!isNaN(idx)) {
              savePosition(idx);
              resetIdleTimer();
            }
          }
        }
      },
      {
        root: containerRef.current,
        threshold: 0.5,
      }
    );

    Array.from(containerRef.current.children).forEach((child) => {
      observerRef.current!.observe(child);
    });
  }, [savePosition, resetIdleTimer]);

  useEffect(() => {
    if (posLoaded && hlLoaded) {
      setupObserver();
    }
    return () => observerRef.current?.disconnect();
  }, [posLoaded, hlLoaded, setupObserver]);

  if (!posLoaded || !hlLoaded) {
    return <div className="h-screen bg-background" />;
  }

  return (
    <>
      <button
        onClick={onChangeBook}
        className="fixed top-4 left-4 z-40 text-muted hover:text-foreground transition-colors text-xs uppercase tracking-wide max-w-[200px] truncate"
      >
        {bookData.title}
      </button>

      <div
        ref={containerRef}
        className="h-screen overflow-y-scroll snap-y snap-mandatory hide-scrollbar"
      >
        {feedItems.map((item, index) => (
          <div key={item.key} data-index={index}>
            {item.type === "chapter" ? (
              <ChapterDivider label={item.label} />
            ) : (
              <PassageCard
                id={item.id}
                text={item.text}
                title={bookData.title}
                author={bookData.author}
                reference={item.reference}
                isHighlighted={isHighlighted(item.id)}
                onToggleHighlight={() => toggleHighlight(item.id)}
              />
            )}
          </div>
        ))}
      </div>

      <SessionSummary
        minutes={sessionMinutes}
        pages={pagesRead}
        visible={showSummary}
        onDismiss={dismissSummary}
      />
    </>
  );
}
