"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "scroll-current-book";

export function useCurrentBook() {
  const [currentBookSlug, setCurrentBookSlug] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setCurrentBookSlug(saved);
    }
    setLoaded(true);
  }, []);

  const setCurrentBook = useCallback((slug: string | null) => {
    setCurrentBookSlug(slug);
    if (slug) {
      localStorage.setItem(STORAGE_KEY, slug);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  return { currentBookSlug, setCurrentBook, loaded };
}
