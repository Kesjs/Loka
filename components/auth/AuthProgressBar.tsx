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
  return (
    <div className="mb-6 space-y-2">
      <div className="flex items-center justify-between gap-3 text-xs">
        <span className="font-medium text-neutral-600">
          Étape {current} sur {total}
          <span className="mx-1.5 text-neutral-300">·</span>
          <span className="text-neutral-500">{label}</span>
        </span>
        <span className="tabular-nums text-neutral-400">{percent}%</span>
      </div>
      <div className="h-1 w-full overflow-hidden rounded-full bg-neutral-200">
        <div
          className="h-full rounded-full bg-primary-600 transition-all duration-300 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
