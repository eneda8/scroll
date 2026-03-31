"use client";

interface SessionSummaryProps {
  minutes: number;
  pages: number;
  visible: boolean;
  onDismiss: () => void;
}

export function SessionSummary({
  minutes,
  pages,
  visible,
  onDismiss,
}: SessionSummaryProps) {
  if (!visible) return null;

  return (
    <button
      onClick={onDismiss}
      className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-card/90 backdrop-blur-sm border border-muted/20 rounded-full px-6 py-3 text-sm text-muted transition-opacity duration-700 ${
        visible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      You just read for {minutes} min — about {pages} {pages === 1 ? "page" : "pages"}
    </button>
  );
}
