import { ButtonHTMLAttributes } from "react";

import { DESIGN_TOKENS } from "@/lib/design-tokens";
import { cn } from "@/lib/utils";

type AppButtonVariant = "primary" | "secondary" | "ghost" | "danger";

interface AppButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: AppButtonVariant;
}

const variants: Record<AppButtonVariant, string> = {
  primary: DESIGN_TOKENS.buttons.primary,
  secondary: DESIGN_TOKENS.buttons.secondary,
  ghost: DESIGN_TOKENS.buttons.ghost,
  danger: DESIGN_TOKENS.buttons.danger,
};

export function AppButton({
  className,
  variant = "primary",
  type = "button",
  ...props
}: AppButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center rounded-full px-3.5 py-1.5 text-xs font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-bg disabled:opacity-50",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
