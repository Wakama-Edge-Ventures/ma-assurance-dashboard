import { HotlineForm } from "@/components/support/hotline-form";
import { AppCard } from "@/components/ui/app-card";
import { PageTitle } from "@/components/ui/page-title";

export default function HotlinePage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageTitle
        title="Hotline"
        description="Escalade operationnelle pour les urgences de demonstration, d'assistance ou de supervision."
      />

      <AppCard className="space-y-3 p-5">
        <p className="text-[13px] font-medium leading-relaxed text-wk-muted">
          La hotline accompagne la continuite de service et le support de demonstration. Elle ne change pas les decisions metier et n&apos;active aucun traitement automatique sur les dossiers.
        </p>
      </AppCard>

      <AppCard className="p-5">
        <HotlineForm />
      </AppCard>
    </div>
  );
}
