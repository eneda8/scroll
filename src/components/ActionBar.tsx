"use client";

interface ActionBarProps {
  visible: boolean;
  isHighlighted: boolean;
  onHighlight: () => void;
  onShare: () => void;
  onCopy: () => void;
  onDismiss: () => void;
}

export function ActionBar({
  visible,
  isHighlighted,
  onHighlight,
  onShare,
  onCopy,
  onDismiss,
}: ActionBarProps) {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50" onClick={onDismiss}>
      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onHighlight}
          className="flex items-center gap-2 bg-card/95 backdrop-blur-sm border border-muted/20 rounded-full px-5 py-3 text-sm text-foreground transition-colors hover:bg-card active:bg-card/80"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill={isHighlighted ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={isHighlighted ? "text-gold" : ""}
          >
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
          </svg>
          {isHighlighted ? "Saved" : "Highlight"}
        </button>

        <button
          onClick={onCopy}
          className="flex items-center gap-2 bg-card/95 backdrop-blur-sm border border-muted/20 rounded-full px-5 py-3 text-sm text-foreground transition-colors hover:bg-card active:bg-card/80"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
          Copy
        </button>

        <button
          onClick={onShare}
          className="flex items-center gap-2 bg-card/95 backdrop-blur-sm border border-muted/20 rounded-full px-5 py-3 text-sm text-foreground transition-colors hover:bg-card active:bg-card/80"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
            <polyline points="16 6 12 2 8 6" />
            <line x1="12" y1="2" x2="12" y2="15" />
          </svg>
          Share
        </button>
      </div>
    </div>
  );
}
