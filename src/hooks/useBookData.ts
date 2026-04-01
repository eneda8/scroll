"use client";

import { useState, useEffect } from "react";
import type { BookData } from "@/types/book";

const cache = new Map<string, BookData>();

function fetchAndCache(slug: string, url: string, setData: (d: BookData) => void, setLoading: (l: boolean) => void) {
  if (cache.has(slug)) {
    setData(cache.get(slug)!);
    return;
  }
  setLoading(true);
  fetch(url)
    .then((res) => res.json())
    .then((bookData: BookData) => {
      cache.set(slug, bookData);
      setData(bookData);
    })
    .finally(() => setLoading(false));
}

export function useBookData(slug: string | null) {
  const [data, setData] = useState<BookData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!slug) {
      setData(null);
      return;
    }

    if (cache.has(slug)) {
      setData(cache.get(slug)!);
      return;
    }

    if (slug.startsWith("bible-")) {
      const fileName = slug.replace("bible-", "") + ".json";
      fetchAndCache(slug, `/data/bible/${fileName}`, setData, setLoading);
    } else {
      // Literature books (gatsby, pride-and-prejudice, etc.)
      fetchAndCache(slug, `/data/literature/${slug}.json`, setData, setLoading);
    }
  }, [slug]);

  return { data, loading };
}
