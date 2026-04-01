"use client";

import { useState, useEffect } from "react";
import type { BookData } from "@/types/book";
import gatsbyData from "@/data/book.json";

const cache = new Map<string, BookData>();

export function useBookData(slug: string | null) {
  const [data, setData] = useState<BookData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!slug) {
      setData(null);
      return;
    }

    if (slug === "gatsby") {
      setData(gatsbyData as BookData);
      return;
    }

    if (cache.has(slug)) {
      setData(cache.get(slug)!);
      return;
    }

    if (slug.startsWith("bible-")) {
      const fileName = slug.replace("bible-", "") + ".json";
      setLoading(true);
      fetch(`/data/bible/${fileName}`)
        .then((res) => res.json())
        .then((bookData: BookData) => {
          cache.set(slug, bookData);
          setData(bookData);
        })
        .finally(() => setLoading(false));
    }
  }, [slug]);

  return { data, loading };
}
