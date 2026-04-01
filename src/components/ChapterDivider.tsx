interface ChapterDividerProps {
  label: string;
}

export function ChapterDivider({ label }: ChapterDividerProps) {
  return (
    <div className="h-screen w-full snap-start snap-always flex items-center justify-center">
      <p className="text-muted text-sm tracking-[0.3em] uppercase">
        {label}
      </p>
    </div>
  );
}
