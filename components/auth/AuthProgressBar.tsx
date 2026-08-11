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
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3 text-xs text-neutral-400">
        <span>
          Étape {current} sur {total} · <span className="text-neutral-500">{label}</span>
        </span>
      </div>
      <div className="h-[3px] w-full overflow-hidden rounded-full bg-neutral-100">
        <div
          className="h-full rounded-full bg-primary-500 transition-all duration-500 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
