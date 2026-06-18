"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Network,
  ShieldCheck,
} from "lucide-react";

import { useTenant } from "@/components/tenant/useTenant";
import { AccessDeniedCard } from "@/components/ui/access-denied-card";
import { AppCard } from "@/components/ui/app-card";
import { AppSection } from "@/components/ui/app-section";
import { AuthRequiredCard } from "@/components/ui/auth-required-card";
import { DegradedStateCard } from "@/components/ui/degraded-state-card";
import { DisclosureNote } from "@/components/ui/disclosure-note";
import { PageTitle } from "@/components/ui/page-title";
import { SourceBadge } from "@/components/ui/source-badge";
import { API_BASE_URL, ApiError, getIdjorFoundationHealth, getIdjorFoundationRegistry } from "@/lib/api";
import { withAlpha } from "@/lib/tenant";
import { cn } from "@/lib/utils";
import {
  IdjorFeatureFlag,
  IdjorFoundationHealth,
  IdjorFoundationRegistry,
  IdjorModelCatalog,
  IdjorProviderCatalog,
  IdjorRegistryAgent,
  IdjorRegistryEngine,
  IdjorRegistryTool,
} from "@/types";

type FoundationState =
  | {
      status: "loading";
      tenantKey: string | null;
    }
  | {
      status: "ready";
      tenantKey: string | null;
      health: IdjorFoundationHealth;
      registry: IdjorFoundationRegistry;
    }
  | {
      status: "error";
      tenantKey: string | null;
      error: {
        statusCode: number | null;
        message: string;
      };
    };

interface MetricCardProps {
  label: string;
  value: string;
  hint: string;
}

interface StateChipProps {
  label: string;
  value: string;
  tone?: "success" | "warning" | "danger" | "neutral";
}

interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  className?: string;
}

function MetricCard({ label, value, hint }: MetricCardProps) {
  return (
    <AppCard className="space-y-2 p-4">
      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-slate-500">
        {label}
      </p>
      <p className="bg-gradient-to-r from-cyan-300 via-emerald-200 to-cyan-400 bg-clip-text font-mono text-3xl font-semibold text-transparent">
        {value}
      </p>
      <p className="text-xs text-slate-400">{hint}</p>
    </AppCard>
  );
}

function StateChip({ label, value, tone = "neutral" }: StateChipProps) {
  const toneClass = {
    success: "border-emerald-400/28 bg-emerald-400/10 text-emerald-300",
    warning: "border-amber-400/28 bg-amber-400/10 text-amber-300",
    danger: "border-rose-400/28 bg-rose-400/10 text-rose-300",
    neutral: "border-slate-400/18 bg-slate-400/8 text-slate-200",
  }[tone];

  return (
    <div className={cn("rounded-2xl border px-3 py-2", toneClass)}>
      <p className="font-mono text-[10px] uppercase tracking-[0.12em] opacity-80">{label}</p>
      <p className="mt-1 text-sm font-medium">{value}</p>
    </div>
  );
}

function RegistryTable<T extends { id: string }>({
  rows,
  columns,
  emptyLabel,
}: {
  rows: T[];
  columns: Column<T>[];
  emptyLabel: string;
}) {
  if (rows.length === 0) {
    return (
      <AppCard className="p-4">
        <p className="text-sm text-slate-400">{emptyLabel}</p>
      </AppCard>
    );
  }

  return (
    <AppCard className="overflow-hidden p-0">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-400/10">
          <thead className="bg-[#11192b]/80">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={cn(
                    "px-4 py-3 text-left font-mono text-[10px] uppercase tracking-[0.14em] text-slate-500",
                    column.className,
                  )}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-t border-slate-400/8 bg-[#0c1323]/76">
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={cn("px-4 py-3 align-top text-sm text-slate-200", column.className)}
                  >
                    {column.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppCard>
  );
}

function renderEnabledLabel(value: boolean, disabledLabel = "OFF") {
  return value ? "ON" : disabledLabel;
}

function getErrorCard(state: Extract<FoundationState, { status: "error" }>, tenantKey: string) {
  if (state.error.statusCode === 401) {
    return (
      <AuthRequiredCard
        title="Authentification backend requise pour IDJOR"
        description="La vue /fr/idjor consomme les routes protegees /v1/idjor/foundation/*. Reconnectez-vous avec une session backend valide."
      />
    );
  }

  if (state.error.statusCode === 403) {
    return (
      <AccessDeniedCard
        title="Acces IDJOR refuse"
        description="Votre role ou votre scope actuel ne permet pas de lire ce registre IDJOR."
      />
    );
  }

  const tenantHint =
    state.error.statusCode === 400
      ? ` Si necessaire, ajoutez ?tenantKey=${tenantKey} a l'URL.`
      : "";

  return (
    <DegradedStateCard
      title="Socle IDJOR indisponible"
      description={`${state.error.message}.${tenantHint} Cette vue reste strictement read-only et n'active aucun moteur IA.`}
    />
  );
}

function ProvidersModelsSummary({
  providers,
  models,
}: {
  providers: IdjorProviderCatalog[];
  models: IdjorModelCatalog[];
}) {
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <RegistryTable
        rows={providers}
        emptyLabel="Aucun provider catalogue pour ce tenant."
        columns={[
          {
            key: "provider",
            header: "Provider",
            render: (provider) => (
              <div className="space-y-1">
                <p className="font-medium text-white">{provider.displayName}</p>
                <p className="font-mono text-[11px] text-slate-500">{provider.providerKey}</p>
              </div>
            ),
          },
          {
            key: "type",
            header: "Type",
            render: (provider) => provider.providerType,
          },
          {
            key: "status",
            header: "Etat",
            render: (provider) => (
              <div className="space-y-1">
                <p>{provider.registryStatus}</p>
                <p className="text-xs text-slate-500">
                  {provider.isEnabled ? "Enabled" : "Disabled"}
                </p>
              </div>
            ),
          },
          {
            key: "source",
            header: "Source",
            render: (provider) => <SourceBadge source={provider.source} />,
          },
        ]}
      />

      <RegistryTable
        rows={models}
        emptyLabel="Aucun modele catalogue pour ce tenant."
        columns={[
          {
            key: "model",
            header: "Modele",
            render: (model) => (
              <div className="space-y-1">
                <p className="font-medium text-white">{model.displayName}</p>
                <p className="font-mono text-[11px] text-slate-500">{model.modelKey}</p>
              </div>
            ),
          },
          {
            key: "family",
            header: "Famille",
            render: (model) => model.modelFamily,
          },
          {
            key: "status",
            header: "Etat",
            render: (model) => (
              <div className="space-y-1">
                <p>{model.registryStatus}</p>
                <p className="text-xs text-slate-500">
                  {model.isEnabled ? "Enabled" : "Disabled"}
                  {model.isDefault ? " · default" : ""}
                </p>
              </div>
            ),
          },
          {
            key: "source",
            header: "Source",
            render: (model) => <SourceBadge source={model.source} />,
          },
        ]}
      />
    </div>
  );
}

function FoundationTables({
  agents,
  engines,
  tools,
  featureFlags,
}: {
  agents: IdjorRegistryAgent[];
  engines: IdjorRegistryEngine[];
  tools: IdjorRegistryTool[];
  featureFlags: IdjorFeatureFlag[];
}) {
  return (
    <div className="space-y-5">
      <RegistryTable
        rows={agents}
        emptyLabel="Aucun agent IDJOR disponible pour ce tenant."
        columns={[
          {
            key: "agent",
            header: "Agent",
            render: (agent) => (
              <div className="space-y-1">
                <p className="font-medium text-white">{agent.displayName}</p>
                <p className="font-mono text-[11px] text-slate-500">{agent.agentKey}</p>
              </div>
            ),
          },
          { key: "layer", header: "Layer", render: (agent) => agent.layer },
          {
            key: "status",
            header: "Etat",
            render: (agent) => (
              <div className="space-y-1">
                <p>{agent.registryStatus}</p>
                <p className="text-xs text-slate-500">
                  {agent.isReadOnly ? "Read-only" : "Mutable"} ·{" "}
                  {agent.isEnabled ? "enabled" : "disabled"}
                </p>
              </div>
            ),
          },
          {
            key: "source",
            header: "Source",
            render: (agent) => <SourceBadge source={agent.source} />,
          },
        ]}
      />

      <RegistryTable
        rows={engines}
        emptyLabel="Aucun engine IDJOR disponible pour ce tenant."
        columns={[
          {
            key: "engine",
            header: "Engine",
            render: (engine) => (
              <div className="space-y-1">
                <p className="font-medium text-white">{engine.displayName}</p>
                <p className="font-mono text-[11px] text-slate-500">{engine.engineKey}</p>
              </div>
            ),
          },
          {
            key: "status",
            header: "Etat",
            render: (engine) => (
              <div className="space-y-1">
                <p>{engine.registryStatus}</p>
                <p className="text-xs text-slate-500">
                  {engine.isReadOnly ? "Read-only" : "Mutable"} ·{" "}
                  {engine.isEnabled ? "enabled" : "disabled"}
                </p>
              </div>
            ),
          },
          {
            key: "source",
            header: "Source",
            render: (engine) => <SourceBadge source={engine.source} />,
          },
        ]}
      />

      <RegistryTable
        rows={tools}
        emptyLabel="Aucun outil visible pour ce role sur ce tenant."
        columns={[
          {
            key: "tool",
            header: "Tool",
            render: (tool) => (
              <div className="space-y-1">
                <p className="font-medium text-white">{tool.displayName}</p>
                <p className="font-mono text-[11px] text-slate-500">{tool.toolKey}</p>
              </div>
            ),
          },
          { key: "access", header: "Access", render: (tool) => tool.accessMode },
          {
            key: "roles",
            header: "Roles",
            render: (tool) =>
              tool.allowedRoles.length > 0 ? (
                <p className="text-xs text-slate-400">{tool.allowedRoles.join(", ")}</p>
              ) : (
                <p className="text-xs text-slate-500">Tous roles lisibles</p>
              ),
          },
          {
            key: "state",
            header: "Etat",
            render: (tool) => (
              <div className="space-y-1">
                <p>{tool.isReadOnly ? "READ_ONLY" : tool.accessMode}</p>
                <p className="text-xs text-slate-500">
                  {tool.isEnabled ? "enabled" : "disabled"}
                </p>
              </div>
            ),
          },
          {
            key: "source",
            header: "Source",
            render: (tool) => <SourceBadge source={tool.source} />,
          },
        ]}
      />

      <RegistryTable
        rows={featureFlags}
        emptyLabel="Aucun feature flag IDJOR disponible pour ce tenant."
        columns={[
          { key: "type", header: "Type", render: (flag) => flag.targetType },
          { key: "key", header: "Cible", render: (flag) => flag.targetKey },
          {
            key: "rollout",
            header: "Rollout",
            render: (flag) => (
              <div className="space-y-1">
                <p>{flag.rolloutState}</p>
                <p className="text-xs text-slate-500">{flag.enabled ? "enabled" : "OFF"}</p>
              </div>
            ),
          },
          {
            key: "source",
            header: "Source",
            render: (flag) => <SourceBadge source={flag.source} />,
          },
        ]}
      />
    </div>
  );
}

export function IdjorFoundationPanel() {
  const { tenant } = useTenant();
  const searchParams = useSearchParams();
  const explicitTenantKey = searchParams.get("tenantKey")?.trim() || null;
  const [state, setState] = useState<FoundationState>({
    status: "loading",
    tenantKey: explicitTenantKey,
  });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setState({ status: "loading", tenantKey: explicitTenantKey });

      try {
        const [health, registry] = await Promise.all([
          getIdjorFoundationHealth({ tenantKey: explicitTenantKey }),
          getIdjorFoundationRegistry({ tenantKey: explicitTenantKey }),
        ]);

        if (cancelled) return;

        setState({
          status: "ready",
          tenantKey: explicitTenantKey,
          health,
          registry,
        });
      } catch (error) {
        if (cancelled) return;

        const statusCode = error instanceof ApiError ? error.status : null;
        const message =
          error instanceof ApiError
            ? error.message
            : error instanceof Error
              ? error.message
              : "Impossible de charger le socle IDJOR.";

        setState({
          status: "error",
          tenantKey: explicitTenantKey,
          error: { statusCode, message },
        });
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [explicitTenantKey]);

  const displayTenantKey =
    state.status === "ready"
      ? state.registry.tenant.tenantKey
      : state.tenantKey ?? tenant.id;

  const resolutionMode =
    state.status === "ready"
      ? state.registry.resolutionMode ?? state.health.resolutionMode ?? "UNKNOWN"
      : null;

  return (
    <div className="space-y-6">
      <PageTitle
        title="Socle IDJOR"
        description="Lecture protegee du registre foundation IDJOR. Cette vue affiche un etat preparatoire, strictement read-only, sans LLM, sans vector store et sans decisioning actif."
      />

      <AppCard
        className="overflow-hidden p-0"
        tone="soft"
      >
        <div
          className="space-y-5 p-5 md:p-6"
          style={{
            borderTop: `1px solid ${withAlpha(tenant.colors.primary, "33")}`,
            background:
              "radial-gradient(520px 180px at 0% 0%, rgba(34,211,238,0.10), transparent 60%), radial-gradient(420px 220px at 100% 0%, rgba(16,185,129,0.12), transparent 58%), linear-gradient(135deg, rgba(12,19,35,0.95), rgba(11,17,30,0.92))",
          }}
        >
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em]"
              style={{
                borderColor: withAlpha(tenant.colors.primary, "45"),
                backgroundColor: withAlpha(tenant.colors.primary, "12"),
                color: tenant.colors.primary,
              }}
            >
              <Network className="h-3.5 w-3.5" />
              Foundation registry
            </span>
            <span className="inline-flex items-center rounded-full border border-amber-400/28 bg-amber-400/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-amber-300">
              read-only
            </span>
            <span className="inline-flex items-center rounded-full border border-slate-400/18 bg-slate-400/8 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-slate-300">
              tenant {displayTenantKey}
            </span>
            {resolutionMode ? (
              <span className="inline-flex items-center rounded-full border border-slate-400/18 bg-slate-400/8 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-slate-300">
                resolution {resolutionMode}
              </span>
            ) : null}
          </div>

          <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-3">
              <h2 className="font-display text-[26px] font-semibold tracking-[-0.02em] text-white">
                Etat protege du socle IDJOR
              </h2>
              <p className="max-w-3xl text-sm leading-relaxed text-slate-400">
                La page expose seulement le registre foundation et la posture de securite
                retournes par le backend local. Aucun provider IA, aucun vector store, aucun
                calcul metier et aucun mecanisme de decision n&apos;est active ici.
              </p>
              <p className="border-l-2 border-emerald-400/20 pl-3 text-xs leading-relaxed text-slate-400">
                Base URL dashboard: <span className="font-mono text-slate-300">{API_BASE_URL}</span>.
                En local, le backend doit exposer <span className="font-mono text-slate-300">/v1/idjor/foundation/*</span>.
              </p>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <StateChip label="LLM" value="OFF" tone="warning" />
              <StateChip label="Vector store" value="OFF" tone="warning" />
              <StateChip label="Decisioning" value="OFF" tone="warning" />
              <StateChip label="Surface" value="Preparatoire" tone="success" />
            </div>
          </div>
        </div>
      </AppCard>

      <DisclosureNote className="border-emerald-400/15 bg-emerald-400/5" />

      {state.status === "loading" ? (
        <AppCard className="space-y-3 p-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-slate-500">
            Chargement foundation
          </p>
          <p className="text-sm text-slate-300">
            Lecture des snapshots proteges `/v1/idjor/foundation/health` et
            `/v1/idjor/foundation/registry` en cours...
          </p>
        </AppCard>
      ) : null}

      {state.status === "error" ? getErrorCard(state, tenant.id) : null}

      {state.status === "ready" ? (
        <>
          <AppSection
            title="Registry counts"
            subtitle="Compteurs tenant-scopes retournes par le socle foundation."
          >
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <MetricCard label="Agents" value={String(state.health.counts.agents)} hint="Registre agents IDJOR" />
              <MetricCard label="Engines" value={String(state.health.counts.engines)} hint="Engines prepares, jamais actives ici" />
              <MetricCard label="Tools" value={String(state.health.counts.tools)} hint="Outils visibles pour le role courant" />
              <MetricCard label="Flags" value={String(state.health.counts.featureFlags)} hint="Tous attendus OFF dans cette phase" />
              <MetricCard label="Providers" value={String(state.health.counts.providers)} hint="Catalogues presents, tous disabled" />
              <MetricCard label="Models" value={String(state.health.counts.models)} hint="Modeles catalogues, tous disabled" />
            </div>
          </AppSection>

          <AppSection
            title="Tenant posture"
            subtitle="Le dashboard reflte uniquement l'etat reel retourne par le backend."
          >
            <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
              <AppCard className="space-y-4 p-5">
                <div className="grid gap-3 md:grid-cols-2">
                  <StateChip label="Tenant key" value={state.registry.tenant.tenantKey} />
                  <StateChip label="Institution" value={state.registry.tenant.institutionId ?? "N/A"} />
                  <StateChip label="Country" value={state.registry.tenant.country} />
                  <StateChip label="Vertical" value={state.registry.tenant.vertical} />
                </div>
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  <StateChip
                    label="Feature flags"
                    value={renderEnabledLabel(state.health.allFeatureFlagsOff, "ALL OFF")}
                    tone={state.health.allFeatureFlagsOff ? "success" : "danger"}
                  />
                  <StateChip
                    label="Providers"
                    value={renderEnabledLabel(state.health.allProvidersDisabled, "DISABLED")}
                    tone={state.health.allProvidersDisabled ? "success" : "danger"}
                  />
                  <StateChip
                    label="Models"
                    value={renderEnabledLabel(state.health.allModelsDisabled, "DISABLED")}
                    tone={state.health.allModelsDisabled ? "success" : "danger"}
                  />
                  <StateChip
                    label="Tools"
                    value={renderEnabledLabel(state.health.allToolsReadOnly, "READ_ONLY")}
                    tone={state.health.allToolsReadOnly ? "success" : "danger"}
                  />
                </div>
              </AppCard>

              <AppCard className="space-y-4 p-5">
                <div className="flex items-center gap-2 text-white">
                  <ShieldCheck className="h-4 w-4 text-emerald-300" />
                  <h3 className="font-medium">Security summary</h3>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <StateChip
                    label="LLM enabled"
                    value={state.health.securitySummary.llmEnabled ? "true" : "false"}
                    tone={state.health.securitySummary.llmEnabled ? "danger" : "success"}
                  />
                  <StateChip
                    label="Vector enabled"
                    value={state.health.securitySummary.vectorStoreEnabled ? "true" : "false"}
                    tone={state.health.securitySummary.vectorStoreEnabled ? "danger" : "success"}
                  />
                  <StateChip
                    label="Decisioning"
                    value={state.health.securitySummary.decisioningEnabled ? "true" : "false"}
                    tone={state.health.securitySummary.decisioningEnabled ? "danger" : "success"}
                  />
                  <StateChip
                    label="Read only"
                    value={state.health.readOnly ? "true" : "false"}
                    tone={state.health.readOnly ? "success" : "danger"}
                  />
                </div>
                <div className="space-y-2">
                  <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-slate-500">
                    Source labels autorises
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {state.health.securitySummary.sourceLabels.map((label) => (
                      <span
                        key={label}
                        className="rounded-full border border-slate-400/18 bg-slate-400/8 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-slate-300"
                      >
                        {label}
                      </span>
                    ))}
                  </div>
                </div>
              </AppCard>
            </div>
          </AppSection>

          <AppSection
            title="Foundation registry"
            subtitle="Catalogues read-only retournes par le registre protège."
          >
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <StateChip label="Agents" value={String(state.registry.agents.length)} tone="neutral" />
              <StateChip label="Engines" value={String(state.registry.engines.length)} tone="neutral" />
              <StateChip label="Tools" value={String(state.registry.tools.length)} tone="neutral" />
              <StateChip label="Flags OFF" value={String(state.registry.featureFlags.filter((flag) => !flag.enabled).length)} tone="success" />
            </div>
            <FoundationTables
              agents={state.registry.agents}
              engines={state.registry.engines}
              tools={state.registry.tools}
              featureFlags={state.registry.featureFlags}
            />
          </AppSection>

          <AppSection
            title="Providers and models"
            subtitle="Catalogues prepares, tous disables par defaut dans cette phase."
          >
            <div className="grid gap-3 md:grid-cols-3">
              <StateChip label="Providers disabled" value={String(state.registry.providers.filter((provider) => !provider.isEnabled).length)} tone="success" />
              <StateChip label="Models disabled" value={String(state.registry.models.filter((model) => !model.isEnabled).length)} tone="success" />
              <StateChip label="Decision surface" value="Aucune" tone="success" />
            </div>
            <ProvidersModelsSummary
              providers={state.registry.providers}
              models={state.registry.models}
            />
          </AppSection>
        </>
      ) : null}
    </div>
  );
}
