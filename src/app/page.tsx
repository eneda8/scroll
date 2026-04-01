"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Feed } from "@/components/Feed";
import { BookPicker } from "@/components/BookPicker";
import { BibleBookPicker } from "@/components/BibleBookPicker";
import { SplashCard } from "@/components/SplashCard";
import { useCurrentBook } from "@/hooks/useCurrentBook";
import { useBookData } from "@/hooks/useBookData";

type AppState = "loading" | "splash" | "pick-book" | "pick-bible" | "reading";

export default function Home() {
  const { currentBookSlug, setCurrentBook, loaded } = useCurrentBook();
  const { data: bookData, loading: bookLoading } = useBookData(currentBookSlug);
  const [state, setState] = useState<AppState>("loading");

  useEffect(() => {
    if (!loaded) return;

    if (currentBookSlug) {
      setState("reading");
    } else {
      const hasVisited = localStorage.getItem("scroll-has-visited");
      setState(hasVisited ? "pick-book" : "splash");
    }
  }, [loaded, currentBookSlug]);

  const handleSelectBook = (slug: string) => {
    setCurrentBook(slug);
    localStorage.setItem("scroll-has-visited", "1");
    setState("reading");
  };

  const handleChangeBook = () => {
    setState("pick-book");
  };

  const handleSplashDone = () => {
    localStorage.setItem("scroll-has-visited", "1");
    setState("pick-book");
  };

  if (state === "loading") {
    return <div className="h-screen bg-background" />;
  }

  if (state === "splash") {
    return (
      <main className="h-screen overflow-hidden">
        <div
          className="h-screen w-full flex items-center justify-center cursor-pointer"
          onClick={handleSplashDone}
        >
          <SplashCard />
        </div>
      </main>
    );
  }

  if (state === "pick-book") {
    return (
      <main className="h-screen overflow-hidden">
        <BookPicker
          onSelectBook={handleSelectBook}
          onSelectBible={() => setState("pick-bible")}
        />
      </main>
    );
  }

  if (state === "pick-bible") {
    return (
      <main className="min-h-screen">
        <BibleBookPicker
          onSelectBook={handleSelectBook}
          onBack={() => setState("pick-book")}
        />
      </main>
    );
  }

  // state === "reading"
  if (bookLoading || !bookData) {
    return <div className="h-screen bg-background" />;
  }

  return (
    <main className="relative h-screen overflow-hidden">
      <Link
        href="/highlights"
        className="fixed top-4 right-4 z-40 p-2 text-muted hover:text-foreground transition-colors"
        aria-label="Highlights"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
        </svg>
      </Link>
      <Feed bookData={bookData} onChangeBook={handleChangeBook} />
    </main>
  );
}
