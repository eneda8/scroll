"use client";

import { useRef, useEffect, useCallback, useMemo } from "react";
import bookData from "@/data/book.json";
import { PassageCard } from "./PassageCard";
import { ChapterDivider } from "./ChapterDivider";
import { SessionSummary } from "./SessionSummary";
import { useReadingPosition } from "@/hooks/useReadingPosition";
import { useHighlights } from "@/hooks/useHighlights";
import { useSessionTimer } from "@/hooks/useSessionTimer";

type FeedItem =
  | { type: "chapter"; chapter: number; key: string }
  | { type: "passage"; id: number; chapter: number; text: string; key: string };

export function Feed() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { currentIndex, savePosition, loaded: posLoaded } = useReadingPosition();
  const { isHighlighted, toggleHighlight, loaded: hlLoaded } = useHighlights();

  // Build feed items: insert chapter dividers before first passage of each chapter
  const feedItems = useMemo<FeedItem[]>(() => {
    const items: FeedItem[] = [];
    let lastChapter = 0;
    for (const passage of bookData.passages) {
      if (passage.chapter !== lastChapter) {
        items.push({
          type: "chapter",
          chapter: passage.chapter,
          key: `ch-${passage.chapter}`,
        });
        lastChapter = passage.chapter;
      }
      items.push({
        type: "passage",
        id: passage.id,
        chapter: passage.chapter,
        text: passage.text,
        key: `p-${passage.id}`,
      });
    }
    return items;
  }, []);

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

  const { showSummary, sessionMinutes, pagesRead, resetIdleTimer, dismissSummary } =
    useSessionTimer(wordsRead);

  // Scroll to saved position on load
  useEffect(() => {
    if (posLoaded && containerRef.current) {
      const target = containerRef.current.children[currentIndex] as HTMLElement;
      if (target) {
        target.scrollIntoView();
      }
    }
    // Only run on initial load
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
      <div
        ref={containerRef}
        className="h-screen overflow-y-scroll snap-y snap-mandatory hide-scrollbar"
      >
        {feedItems.map((item, index) => (
          <div key={item.key} data-index={index}>
            {item.type === "chapter" ? (
              <ChapterDivider chapter={item.chapter} />
            ) : (
              <PassageCard
                id={item.id}
                text={item.text}
                title={bookData.title}
                author={bookData.author}
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
