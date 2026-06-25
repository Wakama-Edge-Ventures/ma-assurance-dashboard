import { BugReportForm } from "@/components/support/bug-report-form";
import { AppCard } from "@/components/ui/app-card";
import { PageTitle } from "@/components/ui/page-title";

export default function BugReportPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageTitle
        title="Reporter un bug"
        description="Canal de signalement des incidents produit, regressions visuelles et blocages de parcours."
      />

      <AppCard className="space-y-3 p-5">
        <p className="text-[13px] font-medium leading-relaxed text-wk-muted">
          Utilisez ce formulaire pour transmettre un comportement inattendu sans exposer de donnees sensibles inutiles. Le signalement reste traite comme une demande de support et non comme une action metier.
        </p>
      </AppCard>

      <AppCard className="p-5">
        <BugReportForm />
      </AppCard>
    </div>
  );
}
