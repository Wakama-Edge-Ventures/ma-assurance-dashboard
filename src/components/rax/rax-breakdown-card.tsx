import { Card } from "@/components/ui/card";

interface RaxBreakdownCardProps {
  title: string;
  value: string;
  description: string;
}

export function RaxBreakdownCard({ title, value, description }: RaxBreakdownCardProps) {
  return (
    <Card className="space-y-2">
      <p className="text-xs uppercase tracking-wide text-brand-textMuted">{title}</p>
      <p className="text-2xl font-semibold text-slate-100">{value}</p>
      <p className="text-xs text-brand-textMuted">{description}</p>
    </Card>
  );
}
