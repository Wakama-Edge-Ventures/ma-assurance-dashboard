"use client";

import Link from "next/link";

import { InsuranceDcaApplication } from "@/types";
import {
  formatBooleanFr,
  formatDcaStatusFr,
  formatSideEffectsSourceFr,
  formatSourceFr,
} from "@/lib/dto-mappers";

interface ApplicationsTableProps {
  rows: InsuranceDcaApplication[];
}

function formatDate(value?: string | null) {
  if (!value) return "Non disponible";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

function isWaitingReview(status: string) {
  return status === "DRAFT" || status === "DRAFT_SUBMITTED";
}

export function ApplicationsTable({ rows }: ApplicationsTableProps) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-400/10 bg-[#101726]/92">
      <table className="min-w-full text-left text-xs text-slate-300">
        <thead>
          <tr className="border-b border-slate-400/10 text-slate-500">
            <th className="px-3 py-2">Référence DCA</th>
            <th className="px-3 py-2">Farmer</th>
            <th className="px-3 py-2">Parcelle</th>
            <th className="px-3 py-2">Culture</th>
            <th className="px-3 py-2">Superficie déclarée</th>
            <th className="px-3 py-2">Statut</th>
            <th className="px-3 py-2">Source</th>
            <th className="px-3 py-2">Soumission</th>
            <th className="px-3 py-2">Consentement CNDP</th>
            <th className="px-3 py-2">Effets secondaires</th>
            <th className="px-3 py-2">Détail</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const farmerName =
              [row.farmer.firstName, row.farmer.lastName].filter(Boolean).join(" ") || "N/A";
            const parcelleName = row.parcelle.name ?? row.parcelle.id ?? "N/A";
            const surface =
              row.declaredArea ??
              row.parcelle.declaredArea ??
              row.parcelle.superficie ??
              null;
            const displayReference =
              row.reference ??
              row.dcaNumber ??
              `En attente de génération — ID technique ${row.id}`;

            return (
              <tr key={row.id} className="border-b border-slate-400/6 align-top last:border-0">
                <td className="px-3 py-3">
                  <p className="font-medium text-white">{displayReference}</p>
                  <p className="text-[11px] text-slate-500">{row.id}</p>
                </td>
                <td className="px-3 py-3">
                  <p>{farmerName}</p>
                  <p className="text-[11px] text-slate-500">
                    Tél: {row.farmer.phoneMasked ?? "Non disponible"} | CIN:{" "}
                    {row.farmer.cinMasked ?? "Non disponible"}
                  </p>
                </td>
                <td className="px-3 py-3">
                  <p>{parcelleName}</p>
                  <p className="text-[11px] text-slate-500">{row.parcelle.culture ?? "Non disponible"}</p>
                </td>
                <td className="px-3 py-3">{row.crop ?? row.culture ?? row.parcelle.culture ?? "Non disponible"}</td>
                <td className="px-3 py-3">{surface !== null ? `${surface} ha` : "Non disponible"}</td>
                <td className="px-3 py-3">
                  <p>{formatDcaStatusFr(row.status)}</p>
                  <p className="text-[11px] text-slate-500">Code interne: {row.status}</p>
                  {isWaitingReview(row.status) ? (
                    <p className="mt-1 text-[11px] text-amber-300">
                      Dossier re&ccedil;u &mdash; en attente d&apos;analyse par l&apos;assureur.
                    </p>
                  ) : null}
                </td>
                <td className="px-3 py-3">
                  <p>{formatSourceFr(row.source)}</p>
                  <p className="text-[11px] text-slate-500">Code interne: {row.source}</p>
                </td>
                <td className="px-3 py-3">{formatDate(row.submittedAt ?? row.createdAt)}</td>
                <td className="px-3 py-3">{formatBooleanFr(row.consentCndp)}</td>
                <td className="px-3 py-3">
                  <p>Mission: {row.sideEffects.missionCreated ? "Créée" : "Non créée"}</p>
                  <p>Police: {row.sideEffects.policyCreated ? "Créée" : "Non créée"}</p>
                  <p>Sinistre: {row.sideEffects.claimCreated ? "Créé" : "Non créé"}</p>
                  <p>RAX: {row.sideEffects.raxCalculated ? "Calculé" : "Non calculé"}</p>
                  <p>Tarification: {row.sideEffects.pricingCalculated ? "Calculée" : "Non calculée"}</p>
                  <p>Ancrage blockchain: {row.sideEffects.blockchainAnchored ? "Ancré" : "Non ancré"}</p>
                  {row.sideEffects.sideEffectsSource ? (
                    <p className="mt-1 text-[11px] text-slate-500">
                      Source des effets secondaires:{" "}
                      {formatSideEffectsSourceFr(row.sideEffects.sideEffectsSource)}
                    </p>
                  ) : null}
                  {row.sideEffects.sourceNote ? (
                    <p className="mt-1 text-[11px] text-slate-500">
                      Source des effets secondaires: fallback frontend
                    </p>
                  ) : null}
                </td>
                <td className="px-3 py-3">
                  <Link
                    href={`/fr/applications/${row.id}`}
                    className="inline-flex items-center rounded-full border border-slate-400/18 bg-transparent px-3 py-1 text-[11px] text-slate-300 transition-colors hover:border-cyan-400/30 hover:text-white"
                  >
                    Ouvrir
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
