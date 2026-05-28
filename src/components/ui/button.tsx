import { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const variants: Record<Variant, string> = {
  primary:
    "bg-brand-violet text-white hover:bg-violet-500 focus-visible:ring-brand-violet",
  secondary:
    "bg-brand-surface text-slate-100 border border-brand-border hover:bg-slate-800 focus-visible:ring-brand-border",
  ghost:
    "bg-transparent text-brand-textMuted hover:bg-slate-900 hover:text-slate-100 focus-visible:ring-brand-border",
  danger:
    "bg-brand-danger text-white hover:bg-red-500 focus-visible:ring-brand-danger",
};

export function Button({
  className,
  variant = "primary",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-bg disabled:opacity-50",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
