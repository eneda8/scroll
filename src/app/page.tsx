import { Feed } from "@/components/Feed";
import Link from "next/link";

export default function Home() {
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
      <Feed />
    </main>
  );
}
