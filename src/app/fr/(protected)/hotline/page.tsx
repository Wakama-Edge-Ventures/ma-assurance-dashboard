import { HotlineForm } from "@/components/support/hotline-form";
import { PageTitle } from "@/components/ui/page-title";

export default function HotlinePage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageTitle
        title="Contacter la HotLine"
        description="Équipe disponible pour les urgences opérationnelles. Réponse sous 2h pour les niveaux CRITICAL et HIGH."
      />
      <HotlineForm />
    </div>
  );
}
