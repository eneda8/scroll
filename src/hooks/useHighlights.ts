"use client";

import { useState, useEffect, useCallback } from "react";

export function useHighlights(bookSlug: string) {
  const [highlights, setHighlights] = useState<Set<number>>(new Set());
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(false);
    const key = `scroll-highlights:${bookSlug}`;
    const saved = localStorage.getItem(key);
    setHighlights(saved ? new Set(JSON.parse(saved)) : new Set());
    setLoaded(true);
  }, [bookSlug]);

  const toggleHighlight = useCallback(
    (id: number) => {
      setHighlights((prev) => {
        const next = new Set(prev);
        if (next.has(id)) {
          next.delete(id);
        } else {
          next.add(id);
        }
        localStorage.setItem(
          `scroll-highlights:${bookSlug}`,
          JSON.stringify([...next])
        );
        return next;
      });
    },
    [bookSlug]
  );

  const isHighlighted = useCallback(
    (id: number) => highlights.has(id),
    [highlights]
  );

  return { highlights, toggleHighlight, isHighlighted, loaded };
}
