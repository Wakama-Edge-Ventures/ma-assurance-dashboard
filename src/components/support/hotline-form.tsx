"use client";

import { useRef, useState } from "react";

const URGENCY_LEVELS = [
  { value: "LOW", label: "LOW — Information, pas de blocage", color: "text-wk-muted" },
  { value: "MEDIUM", label: "MEDIUM — Gene operationnelle, contournement possible", color: "text-wk-tealInk" },
  { value: "HIGH", label: "HIGH — Blocage partiel, impact client", color: "text-wk-amberInk" },
  { value: "CRITICAL", label: "CRITICAL — Arret total, urgence immediate", color: "text-wk-coralInk" },
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
  "w-full rounded-[12px] border border-wk-border2 bg-wk-surface2 px-3 py-2.5 text-[13px] text-wk-text outline-none transition-colors placeholder:text-wk-faint focus:border-wk-primary";

const LABEL_CLS = "text-[10.5px] font-extrabold uppercase tracking-[0.12em] text-wk-faint";

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
      <div className="space-y-3 rounded-[20px] border border-wk-border bg-wk-violetSoft p-8 text-center">
        <div className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-wk-violetInk">
          Message transmis
        </div>
        <p className="text-[14px] font-semibold text-wk-text">
          Votre demande a été envoyée à l&apos;équipe HotLine.
        </p>
        <p className="text-[13px] text-wk-muted">
          Urgence :{" "}
          <span className={urgencyConfig.color + " font-semibold"}>{form.urgency}</span>
          {" · "}Service : {form.service}
        </p>
        <p className="text-[13px] text-wk-muted">
          Réponse sous{" "}
          {form.urgency === "CRITICAL" ? "30 min" : form.urgency === "HIGH" ? "2h" : "24h"}.
        </p>
        <button
          onClick={() => setStatus("idle")}
          className="mt-2 inline-flex items-center rounded-full border border-wk-border bg-wk-surface px-3.5 py-1.5 text-[12.5px] font-semibold text-wk-text transition-colors hover:bg-wk-surface2"
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
                  ? "border-wk-violet bg-wk-violetSoft"
                  : "border-wk-border bg-wk-surface2 hover:border-wk-border2"
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
                    ? "border-wk-violet bg-wk-violet"
                    : "border-wk-border2"
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
          className="flex cursor-pointer items-center gap-3 rounded-[10px] border border-dashed border-wk-border2 bg-wk-surface2 px-4 py-4 transition-colors hover:border-wk-faint"
          onClick={() => fileRef.current?.click()}
        >
          <span className="text-[11px] font-semibold text-wk-faint">
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
              className="ml-auto text-[10.5px] font-semibold text-wk-faint hover:text-wk-text"
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
        <p className="text-[10px] font-semibold text-wk-faint">
          Formats acceptés : PDF, PNG, JPG, CSV, JSON, TXT, LOG, ZIP — max 10 Mo
        </p>
      </div>

      {/* Compliance note */}
      <div className="rounded-[10px] border border-wk-border bg-wk-surface2 px-3 py-2.5">
        <p className="text-[10.5px] font-semibold text-wk-faint">
          Ce formulaire transmet votre demande à{" "}
          <span className="text-wk-text">hotline@wakama.farm</span>.
          Les pièces jointes sont traitées de manière confidentielle conformément à notre{" "}
          <a href="/fr/privacy" className="underline hover:text-wk-text">
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
          className="inline-flex items-center rounded-full bg-wk-violet px-5 py-2 text-[13px] font-bold text-white transition-colors hover:bg-wk-violetInk disabled:cursor-not-allowed disabled:opacity-50"
        >
          {status === "sending" ? "Envoi en cours…" : "Envoyer à la HotLine"}
        </button>

        {status === "error" && (
          <p className="text-[11.5px] font-semibold text-wk-coralInk">
            Erreur d&apos;envoi — veuillez reessayer ou contacter directement hotline@wakama.farm
          </p>
        )}
      </div>
    </form>
  );
}
