interface AuthProgressBarProps {
  current: number;
  total: number;
  label: string;
  percent: number;
}

export default function AuthProgressBar({
  current,
  total,
  label,
  percent,
}: AuthProgressBarProps) {
  const segments = Array.from({ length: total }, (_, i) => i + 1);

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs">
          <span className="inline-flex items-center rounded-md bg-primary-600 px-2 py-1 text-[11px] font-bold text-white">
            Étape {current}/{total}
          </span>
          <span className="font-bold text-neutral-800">{label}</span>
        </div>
        <span className="tabular-nums text-xs font-semibold text-neutral-400">{percent}%</span>
      </div>
      <div className="flex gap-1.5">
        {segments.map((n) => (
          <div
            key={n}
            className={`h-2 flex-1 rounded-full transition-colors duration-500 ${
              n < current
                ? "bg-primary-500"
                : n === current
                ? "bg-primary-600"
                : "bg-neutral-100"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
