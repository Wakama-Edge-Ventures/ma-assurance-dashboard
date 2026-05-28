import { ApplicationStatus } from "@/types";
import {
  formatDate,
  getApplicationStatusDescription,
  getApplicationStatusLabel,
  getApplicationStatusOrder,
} from "@/lib/workflow";

interface ApplicationTimelineProps {
  currentStatus: ApplicationStatus;
  createdAt: string;
  updatedAt?: string;
}

const timelineStatuses: ApplicationStatus[] = [
  "DRAFT",
  "SUBMITTED",
  "UNDER_REVIEW",
  "REQUIRES_FIELD_AUDIT",
  "PRICED",
  "APPROVED_BY_INSURER",
];

export function ApplicationTimeline({
  currentStatus,
  createdAt,
  updatedAt,
}: ApplicationTimelineProps) {
  const currentOrder = getApplicationStatusOrder(currentStatus);

  return (
    <div className="space-y-3">
      {timelineStatuses.map((status) => {
        const order = getApplicationStatusOrder(status);
        const completed = order <= currentOrder;
        return (
          <div key={status} className="flex items-start gap-3">
            <span
              className={`mt-1 inline-block h-2.5 w-2.5 rounded-full ${
                completed ? "bg-brand-violet" : "bg-slate-600"
              }`}
            />
            <div>
              <p className="text-sm font-medium text-slate-100">
                {getApplicationStatusLabel(status)}
              </p>
              <p className="text-xs text-brand-textMuted">
                {getApplicationStatusDescription(status)}
              </p>
              {status === "DRAFT" ? (
                <p className="text-xs text-brand-textMuted">{formatDate(createdAt)}</p>
              ) : null}
              {status === currentStatus && updatedAt ? (
                <p className="text-xs text-brand-textMuted">{formatDate(updatedAt)}</p>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}
