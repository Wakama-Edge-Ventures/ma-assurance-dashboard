import { Card } from "@/components/ui/card";

interface ImplementationCardProps {
  items: string[];
}

export function ImplementationCard({ items }: ImplementationCardProps) {
  return (
    <Card>
      <h2 className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-slate-400">
        A implementer ensuite
      </h2>
      <ul className="mt-3 space-y-2 text-sm text-brand-textMuted">
        {items.map((item) => (
          <li key={item}>- {item}</li>
        ))}
      </ul>
    </Card>
  );
}
