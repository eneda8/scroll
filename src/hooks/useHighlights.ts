"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "scroll-highlights";

export function useHighlights() {
  const [highlights, setHighlights] = useState<Set<number>>(new Set());
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setHighlights(new Set(JSON.parse(saved)));
    }
    setLoaded(true);
  }, []);

  const toggleHighlight = useCallback((id: number) => {
    setHighlights((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
      return next;
    });
  }, []);

  const isHighlighted = useCallback(
    (id: number) => highlights.has(id),
    [highlights]
  );

  return { highlights, toggleHighlight, isHighlighted, loaded };
}
