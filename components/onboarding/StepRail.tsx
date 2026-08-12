"use client";

import { CheckCircle } from "@phosphor-icons/react";
import { ComponentType } from "react";

type RailIconComponent = ComponentType<{
  size?: number | string;
  weight?: "thin" | "light" | "regular" | "bold" | "fill" | "duotone";
  className?: string;
}>;

export interface StepRailItem {
  key: string;
  label: string;
  description?: string;
  icon: RailIconComponent;
}

interface StepRailProps {
  items: StepRailItem[];
  currentIndex: number;
  /** Étapes jusqu'à cet index (exclu) sont considérées "complétées" et cliquables. */
  onNavigate?: (index: number) => void;
  orientation?: "vertical" | "horizontal";
}

export default function StepRail({
  items,
  currentIndex,
  onNavigate,
  orientation = "vertical",
}: StepRailProps) {
  if (orientation === "horizontal") {
    return (
      <div className="flex items-center gap-2 overflow-x-auto px-1 pb-1" role="list">
        {items.map((item, i) => {
          const state = i < currentIndex ? "done" : i === currentIndex ? "active" : "upcoming";
          const Icon = item.icon;
          const clickable = state === "done" && !!onNavigate;

          return (
            <div key={item.key} className="flex items-center gap-2">
              <button
                type="button"
                role="listitem"
                disabled={!clickable}
                onClick={() => clickable && onNavigate?.(i)}
                className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                  state === "active"
                    ? "bg-primary-500/15 text-primary-700"
                    : state === "done"
                    ? "text-primary-600"
                    : "text-neutral-400"
                } ${clickable ? "cursor-pointer hover:bg-primary-500/10" : "cursor-default"}`}
              >
                {state === "done" ? (
                  <CheckCircle size={16} weight="fill" />
                ) : (
                  <Icon
                    size={16}
                    weight={state === "active" ? "fill" : "regular"}
                    className={state === "active" ? "text-primary-600" : "text-neutral-400"}
                  />
                )}
                <span className="whitespace-nowrap">{item.label}</span>
              </button>
              {i < items.length - 1 && (
                <div
                  className={`h-px w-4 shrink-0 ${
                    i < currentIndex ? "bg-primary-400" : "bg-white/20"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1" role="list">
      {items.map((item, i) => {
        const state = i < currentIndex ? "done" : i === currentIndex ? "active" : "upcoming";
        const Icon = item.icon;
        const clickable = state === "done" && !!onNavigate;
        const isLast = i === items.length - 1;

        return (
          <div key={item.key} className="relative flex gap-3">
            {!isLast && (
              <div
                className={`absolute left-[15px] top-8 h-[calc(100%-8px)] w-px ${
                  state === "done" ? "bg-primary-400/70" : "bg-white/15"
                }`}
                aria-hidden
              />
            )}
            <button
              type="button"
              role="listitem"
              disabled={!clickable}
              onClick={() => clickable && onNavigate?.(i)}
              className={`group flex w-full items-start gap-3 rounded-lg p-2 text-left transition-colors ${
                clickable ? "cursor-pointer hover:bg-white/5" : "cursor-default"
              }`}
            >
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-colors ${
                  state === "done"
                    ? "border-primary-400 bg-primary-500/20 text-primary-300"
                    : state === "active"
                    ? "border-white bg-white/10 text-white"
                    : "border-white/20 text-white/40"
                }`}
              >
                {state === "done" ? (
                  <CheckCircle size={18} weight="fill" />
                ) : (
                  <Icon size={16} weight={state === "active" ? "fill" : "regular"} />
                )}
              </span>
              <span className="pt-1">
                <span
                  className={`block text-sm font-medium ${
                    state === "upcoming" ? "text-white/40" : "text-white"
                  }`}
                >
                  {item.label}
                </span>
                {item.description && (
                  <span
                    className={`mt-0.5 block text-xs leading-snug ${
                      state === "upcoming" ? "text-white/25" : "text-white/60"
                    }`}
                  >
                    {item.description}
                  </span>
                )}
              </span>
            </button>
          </div>
        );
      })}
    </div>
  );
}
