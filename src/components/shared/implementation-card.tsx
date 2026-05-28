import { Card } from "@/components/ui/card";

interface ImplementationCardProps {
  items: string[];
}

export function ImplementationCard({ items }: ImplementationCardProps) {
  return (
    <Card>
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-200">
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
