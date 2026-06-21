import { ButtonHTMLAttributes } from "react";

import { AppButton } from "./app-button";

type Variant = "primary" | "secondary" | "ghost" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

export function Button({ variant = "primary", className, type = "button", ...props }: ButtonProps) {
  return <AppButton type={type} variant={variant} className={className} {...props} />;
}
