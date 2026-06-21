"use client";

import { useState } from "react";

const INPUT_CLS =
  "w-full rounded-[10px] border border-slate-700/60 bg-[#0b1422]/75 px-3 py-2.5 font-mono text-[13px] text-white outline-none transition-colors placeholder:text-slate-600 focus:border-violet-400/40";

export function BlockchainVerifyForm() {
  const [hash, setHash] = useState("");
  const [status, setStatus] = useState<"idle" | "checking" | "found" | "not_found" | "error">("idle");
  const [result, setResult] = useState<{
    hash: string;
    anchoredAt: string;
    txId: string;
    auditId: string;
    network: string;
  } | null>(null);

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    if (!hash.trim()) return;
    setStatus("checking");
    setResult(null);

    try {
      const res = await fetch(`/api/blockchain-verify?hash=${encodeURIComponent(hash.trim())}`);
      const data = await res.json();
      if (data.found) {
        setResult(data);
        setStatus("found");
      } else {
        setStatus("not_found");
      }
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleVerify} className="space-y-3">
        <div className="space-y-1.5">
          <label htmlFor="hash" className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-slate-400">
            Hash SHA-256 à vérifier
          </label>
          <input
            id="hash"
            type="text"
            value={hash}
            onChange={(e) => setHash(e.target.value)}
            placeholder="sha256:aud001-integrity-..."
            className={INPUT_CLS}
            spellCheck={false}
          />
        </div>

        <button
          type="submit"
          disabled={status === "checking" || !hash.trim()}
          className="inline-flex items-center rounded-full border border-violet-400/28 bg-violet-500/14 px-4 py-2 font-mono text-[12.5px] text-violet-200 transition-colors hover:bg-violet-500/24 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {status === "checking" ? "Vérification…" : "Vérifier sur la blockchain"}
        </button>
      </form>

      {/* Result panels */}
      {status === "found" && result && (
        <div className="rounded-[16px] border border-emerald-400/20 bg-emerald-500/8 p-4 space-y-2">
          <div className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-emerald-400">
            Hash vérifié ✓
          </div>
          <div className="grid gap-1.5 text-[12.5px] text-slate-300">
            <p>Hash : <span className="font-mono text-slate-400 break-all">{result.hash}</span></p>
            <p>Ancré le : <span className="text-white">{result.anchoredAt}</span></p>
            <p>Audit ID : <span className="text-white">{result.auditId}</span></p>
            <p>Transaction : <span className="font-mono text-violet-300 break-all">{result.txId}</span></p>
            <p>Réseau : <span className="text-white">{result.network}</span></p>
          </div>
        </div>
      )}

      {status === "not_found" && (
        <div className="rounded-[16px] border border-amber-400/20 bg-amber-500/8 p-4">
          <p className="font-mono text-[11.5px] text-amber-300">
            Hash non trouvé dans le registre. Il est possible que l&apos;ancrage soit en attente
            (asynchrone) ou que le hash soit incorrect.
          </p>
        </div>
      )}

      {status === "error" && (
        <div className="rounded-[16px] border border-red-400/20 bg-red-500/8 p-4">
          <p className="font-mono text-[11.5px] text-red-300">
            Erreur de vérification — réessayez ou contactez la HotLine.
          </p>
        </div>
      )}
    </div>
  );
}
