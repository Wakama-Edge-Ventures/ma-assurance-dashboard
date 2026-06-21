import { BugReportForm } from "@/components/support/bug-report-form";
import { PageTitle } from "@/components/ui/page-title";

export default function BugReportPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageTitle
        title="Reporter un bug"
        description="Signalez un dysfonctionnement ou un comportement inattendu de la plateforme."
      />
      <BugReportForm />
    </div>
  );
}
