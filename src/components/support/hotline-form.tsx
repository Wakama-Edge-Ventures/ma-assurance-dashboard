"use client";

import { useRef, useState } from "react";

const URGENCY_LEVELS = [
  { value: "LOW", label: "LOW — Information, pas de blocage", color: "text-slate-400" },
  { value: "MEDIUM", label: "MEDIUM — Gêne opérationnelle, contournement possible", color: "text-cyan-400" },
  { value: "HIGH", label: "HIGH — Blocage partiel, impact client", color: "text-amber-400" },
  { value: "CRITICAL", label: "CRITICAL — Arrêt total, urgence immédiate", color: "text-red-400" },
] as const;

const SERVICES = [
  "Support technique",
  "Souscription",
  "Gestion des sinistres",
  "Comptabilité & facturation",
  "Direction & escalade",
  "Conformité & audit",
] as const;

type UrgencyLevel = typeof URGENCY_LEVELS[number]["value"];

interface FormState {
  urgency: UrgencyLevel;
  service: string;
  subject: string;
  message: string;
}

const INPUT_CLS =
  "w-full rounded-[10px] border border-slate-700/60 bg-[#0b1422]/75 px-3 py-2.5 text-[13px] text-white outline-none transition-colors placeholder:text-slate-600 focus:border-cyan-400/40";

const LABEL_CLS = "font-mono text-[10.5px] uppercase tracking-[0.12em] text-slate-400";

export function HotlineForm() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<FormState>({
    urgency: "MEDIUM",
    service: SERVICES[0],
    subject: "",
    message: "",
  });
  const [fileName, setFileName] = useState<string>("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.subject.trim() || !form.message.trim()) return;
    setStatus("sending");

    try {
      const body = new FormData();
      body.append("urgency", form.urgency);
      body.append("service", form.service);
      body.append("subject", form.subject);
      body.append("message", form.message);
      if (fileRef.current?.files?.[0]) {
        body.append("attachment", fileRef.current.files[0]);
      }

      const res = await fetch("/api/hotline", { method: "POST", body });
      if (!res.ok) throw new Error("api_error");
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  }

  const urgencyConfig = URGENCY_LEVELS.find((u) => u.value === form.urgency)!;

  if (status === "sent") {
    return (
      <div className="rounded-[20px] border border-emerald-400/20 bg-emerald-500/8 p-8 text-center space-y-3">
        <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-emerald-400">
          Message transmis
        </div>
        <p className="text-[14px] font-semibold text-white">
          Votre demande a été envoyée à l&apos;équipe HotLine.
        </p>
        <p className="text-[13px] text-slate-400">
          Urgence :{" "}
          <span className={urgencyConfig.color + " font-semibold"}>{form.urgency}</span>
          {" · "}Service : {form.service}
        </p>
        <p className="text-[13px] text-slate-400">
          Réponse sous{" "}
          {form.urgency === "CRITICAL" ? "30 min" : form.urgency === "HIGH" ? "2h" : "24h"}.
        </p>
        <button
          onClick={() => setStatus("idle")}
          className="mt-2 inline-flex items-center rounded-full border border-slate-400/18 bg-transparent px-3.5 py-1.5 font-mono text-[12.5px] text-slate-300 transition-colors hover:border-cyan-400/30 hover:text-white"
        >
          Nouveau message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Urgency */}
      <div className="space-y-2">
        <label className={LABEL_CLS}>Degré d&apos;urgence *</label>
        <div className="grid gap-2 sm:grid-cols-2">
          {URGENCY_LEVELS.map((level) => (
            <label
              key={level.value}
              className={`flex cursor-pointer items-start gap-2.5 rounded-[12px] border px-3 py-2.5 transition-colors ${
                form.urgency === level.value
                  ? "border-violet-400/30 bg-violet-500/10"
                  : "border-slate-700/40 bg-[#0b1422]/60 hover:border-slate-600/60"
              }`}
            >
              <input
                type="radio"
                name="urgency"
                value={level.value}
                checked={form.urgency === level.value}
                onChange={() => set("urgency", level.value)}
                className="sr-only"
              />
              <span
                className={`mt-0.5 h-3.5 w-3.5 flex-none rounded-full border-2 transition-colors ${
                  form.urgency === level.value
                    ? "border-violet-400 bg-violet-400"
                    : "border-slate-600"
                }`}
              />
              <span className={`text-[12px] leading-tight ${level.color}`}>
                {level.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Service */}
      <div className="space-y-2">
        <label htmlFor="service" className={LABEL_CLS}>
          Service à contacter *
        </label>
        <select
          id="service"
          value={form.service}
          onChange={(e) => set("service", e.target.value)}
          className={INPUT_CLS}
          required
        >
          {SERVICES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {/* Subject */}
      <div className="space-y-2">
        <label htmlFor="subject" className={LABEL_CLS}>
          Sujet *
        </label>
        <input
          id="subject"
          type="text"
          value={form.subject}
          onChange={(e) => set("subject", e.target.value)}
          placeholder="Résumé en une ligne du problème ou de la demande"
          className={INPUT_CLS}
          maxLength={160}
          required
        />
      </div>

      {/* Message */}
      <div className="space-y-2">
        <label htmlFor="message" className={LABEL_CLS}>
          Message *
        </label>
        <textarea
          id="message"
          value={form.message}
          onChange={(e) => set("message", e.target.value)}
          placeholder="Décrivez le problème, les étapes pour le reproduire, l'impact observé, et toute information utile à l'équipe HotLine."
          className={INPUT_CLS + " min-h-[140px] resize-y"}
          required
        />
      </div>

      {/* Attachment */}
      <div className="space-y-2">
        <label className={LABEL_CLS}>Pièce jointe (facultatif)</label>
        <div
          className="flex cursor-pointer items-center gap-3 rounded-[10px] border border-dashed border-slate-700/60 bg-[#0b1422]/40 px-4 py-4 transition-colors hover:border-slate-600/60"
          onClick={() => fileRef.current?.click()}
        >
          <span className="font-mono text-[11px] text-slate-500">
            {fileName || "Cliquez pour joindre un fichier (capture, log, PDF…)"}
          </span>
          {fileName && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setFileName("");
                if (fileRef.current) fileRef.current.value = "";
              }}
              className="ml-auto font-mono text-[10.5px] text-slate-600 hover:text-slate-400"
            >
              ✕
            </button>
          )}
        </div>
        <input
          ref={fileRef}
          type="file"
          className="sr-only"
          accept=".pdf,.png,.jpg,.jpeg,.webp,.csv,.json,.txt,.log,.zip"
          onChange={(e) => setFileName(e.target.files?.[0]?.name ?? "")}
        />
        <p className="font-mono text-[10px] text-slate-600">
          Formats acceptés : PDF, PNG, JPG, CSV, JSON, TXT, LOG, ZIP — max 10 Mo
        </p>
      </div>

      {/* Compliance note */}
      <div className="rounded-[10px] border border-slate-400/8 bg-slate-900/40 px-3 py-2.5">
        <p className="font-mono text-[10.5px] text-slate-500">
          Ce formulaire transmet votre demande à{" "}
          <span className="text-slate-400">hotline@wakama.farm</span>.
          Les pièces jointes sont traitées de manière confidentielle conformément à notre{" "}
          <a href="/fr/privacy" className="underline hover:text-slate-300">
            politique de confidentialité
          </a>
          .
        </p>
      </div>

      {/* Submit */}
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={status === "sending" || !form.subject.trim() || !form.message.trim()}
          className="inline-flex items-center rounded-full border border-violet-400/28 bg-violet-500/14 px-5 py-2 font-mono text-[13px] text-violet-200 transition-colors hover:bg-violet-500/24 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {status === "sending" ? "Envoi en cours…" : "Envoyer à la HotLine"}
        </button>

        {status === "error" && (
          <p className="font-mono text-[11.5px] text-red-400">
            Erreur d&apos;envoi — veuillez réessayer ou contacter directement hotline@wakama.farm
          </p>
        )}
      </div>
    </form>
  );
}
