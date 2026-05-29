import { ReactNode } from "react";

import { AppCard } from "./app-card";

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return <AppCard className={className}>{children}</AppCard>;
}
