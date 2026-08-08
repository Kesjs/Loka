import * as React from "react";
import { cn } from "@/lib/utils";

const variants = {
  success: "bg-success-50 text-success-700 border-success-200",
  danger: "bg-danger-50 text-danger-700 border-danger-200",
  warning: "bg-warning-50 text-warning-700 border-warning-200",
  neutral: "bg-neutral-100 text-neutral-600 border-neutral-200",
  primary: "bg-primary-50 text-primary-700 border-primary-200",
};

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: keyof typeof variants;
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "neutral", ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        variants[variant],
        className
      )}
      {...props}
    />
  )
);
Badge.displayName = "Badge";

export { Badge };