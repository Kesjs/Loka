interface ProgressDotsProps {
  current: number;
  total: number;
}

export default function ProgressDots({ current, total }: ProgressDotsProps) {
  return (
    <div className="flex items-center gap-1.5 justify-center mb-6">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`h-1.5 rounded-full transition-all ${
            i < current
              ? "w-4 bg-primary-600"
              : i === current
              ? "w-6 bg-primary-400"
              : "w-1.5 bg-neutral-200"
          }`}
        />
      ))}
    </div>
  );
}
