import { Card } from "@/components/ui/card";

interface ChecklistItem {
  label: string;
  state: "done" | "warning" | "pending";
}

interface ClaimReviewChecklistProps {
  items: ChecklistItem[];
}

function dotClass(state: ChecklistItem["state"]) {
  if (state === "done") return "bg-green-400";
  if (state === "warning") return "bg-orange-400";
  return "bg-slate-500";
}

export function ClaimReviewChecklist({ items }: ClaimReviewChecklistProps) {
  return (
    <Card>
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700 dark:text-slate-200">
        Checklist de revue
      </h2>
      <div className="mt-3 space-y-2">
        {items.map((item) => (
          <div key={item.label} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
            <span className={`h-2.5 w-2.5 rounded-full ${dotClass(item.state)}`} />
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
