import Image from "next/image";

export function SplashCard() {
  return (
    <div className="h-screen w-full snap-start snap-always flex flex-col items-center justify-center gap-8 px-8">
      <Image
        src="/scroll-logo.svg"
        alt="SCROLL"
        width={240}
        height={240}
        priority
        className="brightness-0 invert"
      />
      <p className="text-foreground text-lg tracking-wide text-center font-serif italic">
        Doom-scroll your way through great literature.
      </p>
    </div>
  );
}
