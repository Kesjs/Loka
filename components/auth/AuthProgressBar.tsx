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
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs">
          <span className="inline-flex items-center rounded-full bg-primary-500/15 px-2 py-0.5 text-[11px] font-bold text-primary-300 border border-primary-500/20">
            {current} / {total}
          </span>
          <span className="font-semibold text-slate-300">{label}</span>
        </div>
        <span className="tabular-nums text-xs font-medium text-slate-500">{percent}%</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-primary-400 transition-all duration-500 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
