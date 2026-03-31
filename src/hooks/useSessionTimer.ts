"use client";

import { useState, useEffect, useRef, useCallback } from "react";

export function useSessionTimer(wordsRead: number) {
  const [showSummary, setShowSummary] = useState(false);
  const [sessionMinutes, setSessionMinutes] = useState(0);
  const sessionStartRef = useRef<number>(Date.now());
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastScrollRef = useRef<number>(Date.now());

  const pagesRead = Math.max(1, Math.round(wordsRead / 250));

  const resetIdleTimer = useCallback(() => {
    lastScrollRef.current = Date.now();
    setShowSummary(false);

    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
    }

    idleTimerRef.current = setTimeout(() => {
      const elapsed = Math.round(
        (Date.now() - sessionStartRef.current) / 60000
      );
      setSessionMinutes(Math.max(1, elapsed));
      setShowSummary(true);
    }, 5000);
  }, []);

  const dismissSummary = useCallback(() => {
    setShowSummary(false);
  }, []);

  useEffect(() => {
    return () => {
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }
    };
  }, []);

  return { showSummary, sessionMinutes, pagesRead, resetIdleTimer, dismissSummary };
}
