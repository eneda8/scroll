"use client";

import { useState, useEffect, useCallback } from "react";

export function useReadingPosition(bookSlug: string) {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(false);
    const key = `scroll-position:${bookSlug}`;
    const saved = localStorage.getItem(key);
    setCurrentIndex(saved !== null ? parseInt(saved, 10) : 0);
    setLoaded(true);
  }, [bookSlug]);

  const savePosition = useCallback(
    (index: number) => {
      setCurrentIndex(index);
      localStorage.setItem(`scroll-position:${bookSlug}`, index.toString());
    },
    [bookSlug]
  );

  return { currentIndex, savePosition, loaded };
}
