"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "scroll-reading-position";

export function useReadingPosition() {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved !== null) {
      setCurrentIndex(parseInt(saved, 10));
    }
    setLoaded(true);
  }, []);

  const savePosition = useCallback((index: number) => {
    setCurrentIndex(index);
    localStorage.setItem(STORAGE_KEY, index.toString());
  }, []);

  return { currentIndex, savePosition, loaded };
}
