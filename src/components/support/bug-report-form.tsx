"use client";

import { useState } from "react";

const PRIORITY_LEVELS = [
  { value: "LOW", label: "Mineur — cosmétique ou amélioration", color: "text-wk-muted" },
  { value: "MEDIUM", label: "Modere — comportement inattendu", color: "text-wk-primaryInk" },
  { value: "HIGH", label: "Important — fonctionnalite degradee", color: "text-wk-amberInk" },
  { value: "CRITICAL", label: "Critique — bloquant en production", color: "text-wk-coralInk" },
] as const;

type Priority = typeof PRIORITY_LEVELS[number]["value"];

const INPUT_CLS =
  "w-full rounded-[12px] border border-wk-border2 bg-wk-surface2 px-3 py-2.5 text-[13px] text-wk-text outline-none transition-colors placeholder:text-wk-faint focus:border-wk-primary";

const LABEL_CLS = "text-[10.5px] font-extrabold uppercase tracking-[0.12em] text-wk-faint";

export function BugReportForm() {
  const [priority, setPriority] = useState<Priority>("MEDIUM");
  const [title, setTitle] = useState("");
  const [page, setPage] = useState("");
  const [steps, setSteps] = useState("");
  const [expected, setExpected] = useState("");
  const [actual, setActual] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !steps.trim()) return;
    setStatus("sending");
    try {
      const res = await fetch("/api/bug", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priority, title, page, steps, expected, actual }),
      });
      if (!res.ok) throw new Error();
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div className="space-y-3 rounded-[20px] border border-wk-border bg-wk-primarySoft p-8 text-center">
        <div className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-wk-primaryInk">
          Bug signalé
        </div>
        <p className="text-[14px] font-semibold text-wk-text">Merci pour votre signalement.</p>
        <p className="text-[13px] text-wk-muted">
          L&apos;équipe technique Wakama a été notifiée. Nous traçons chaque rapport pour amélioration continue.
        </p>
        <button
          onClick={() => setStatus("idle")}
          className="mt-2 inline-flex items-center rounded-full border border-wk-border bg-wk-surface px-3.5 py-1.5 text-[12.5px] font-semibold text-wk-text transition-colors hover:bg-wk-surface2"
        >
          Nouveau rapport
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Priority */}
      <div className="space-y-2">
        <label className={LABEL_CLS}>Priorité *</label>
        <div className="grid gap-2 sm:grid-cols-2">
          {PRIORITY_LEVELS.map((level) => (
            <label
              key={level.value}
              className={`flex cursor-pointer items-start gap-2.5 rounded-[12px] border px-3 py-2.5 transition-colors ${
                priority === level.value
                  ? "border-wk-primary bg-wk-primarySoft"
                  : "border-wk-border bg-wk-surface2 hover:border-wk-border2"
              }`}
            >
              <input
                type="radio"
                name="priority"
                value={level.value}
                checked={priority === level.value}
                onChange={() => setPriority(level.value)}
                className="sr-only"
              />
              <span
                className={`mt-0.5 h-3.5 w-3.5 flex-none rounded-full border-2 transition-colors ${
                  priority === level.value ? "border-wk-primary bg-wk-primary" : "border-wk-border2"
                }`}
              />
              <span className={`text-[12px] leading-tight ${level.color}`}>{level.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Title */}
      <div className="space-y-2">
        <label htmlFor="bug-title" className={LABEL_CLS}>Titre du bug *</label>
        <input
          id="bug-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ex : Le bouton Continuer ne répond pas sur /fr/pricing/off_001"
          className={INPUT_CLS}
          maxLength={160}
          required
        />
      </div>

      {/* Page */}
      <div className="space-y-2">
        <label htmlFor="bug-page" className={LABEL_CLS}>Page / URL concernée</label>
        <input
          id="bug-page"
          type="text"
          value={page}
          onChange={(e) => setPage(e.target.value)}
          placeholder="/fr/pricing/off_001"
          className={INPUT_CLS}
        />
      </div>

      {/* Steps */}
      <div className="space-y-2">
        <label htmlFor="bug-steps" className={LABEL_CLS}>Étapes pour reproduire *</label>
        <textarea
          id="bug-steps"
          value={steps}
          onChange={(e) => setSteps(e.target.value)}
          placeholder={"1. Aller sur /fr/pricing/off_001\n2. Cliquer sur « Continuer »\n3. Observer…"}
          className={INPUT_CLS + " min-h-[100px] resize-y"}
          required
        />
      </div>

      {/* Expected / Actual */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="bug-expected" className={LABEL_CLS}>Comportement attendu</label>
          <textarea
            id="bug-expected"
            value={expected}
            onChange={(e) => setExpected(e.target.value)}
            placeholder="Ce qui devrait se passer…"
            className={INPUT_CLS + " min-h-[80px] resize-y"}
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="bug-actual" className={LABEL_CLS}>Comportement observé</label>
          <textarea
            id="bug-actual"
            value={actual}
            onChange={(e) => setActual(e.target.value)}
            placeholder="Ce qui se passe réellement…"
            className={INPUT_CLS + " min-h-[80px] resize-y"}
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={status === "sending" || !title.trim() || !steps.trim()}
          className="inline-flex items-center rounded-full bg-wk-primary px-5 py-2 text-[13px] font-bold text-white transition-colors hover:bg-wk-primaryInk disabled:cursor-not-allowed disabled:opacity-50"
        >
          {status === "sending" ? "Envoi…" : "Envoyer le rapport"}
        </button>
        {status === "error" && (
          <p className="text-[11.5px] font-semibold text-wk-coralInk">Erreur — reessayez.</p>
        )}
      </div>
    </form>
  );
}
