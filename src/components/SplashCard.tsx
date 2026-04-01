import Image from "next/image";

export function SplashCard() {
  return (
    <div className="h-screen w-full snap-start snap-always flex flex-col items-center justify-center gap-6 px-8">
      <Image
        src="/scroll-logo.svg"
        alt="SCROLL"
        width={120}
        height={120}
        priority
        className="opacity-90"
      />
      <p className="text-muted text-sm tracking-wide text-center font-serif italic">
        Doom-scroll your way through great literature.
      </p>
    </div>
  );
}
