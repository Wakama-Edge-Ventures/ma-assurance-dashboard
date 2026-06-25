"use client";

import { useState } from "react";

const INPUT_CLS =
  "w-full rounded-[12px] border border-wk-border2 bg-wk-surface2 px-3 py-2.5 font-mono text-[13px] text-wk-text outline-none transition-colors placeholder:text-wk-faint focus:border-wk-violet";

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
          <label htmlFor="hash" className="text-[10.5px] font-extrabold uppercase tracking-[0.12em] text-wk-faint">
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
          className="inline-flex items-center rounded-full bg-wk-violet px-4 py-2 text-[12.5px] font-bold text-white transition-colors hover:bg-wk-violetInk disabled:cursor-not-allowed disabled:opacity-50"
        >
          {status === "checking" ? "Vérification…" : "Vérifier sur la blockchain"}
        </button>
      </form>

      {/* Result panels */}
      {status === "found" && result && (
        <div className="space-y-2 rounded-[16px] border border-wk-border bg-wk-primarySoft p-4">
          <div className="text-[10.5px] font-extrabold uppercase tracking-[0.12em] text-wk-primaryInk">
            Hash vérifié ✓
          </div>
          <div className="grid gap-1.5 text-[12.5px] text-wk-muted">
            <p>Hash : <span className="font-mono break-all text-wk-text">{result.hash}</span></p>
            <p>Ancré le : <span className="text-wk-text">{result.anchoredAt}</span></p>
            <p>Audit ID : <span className="text-wk-text">{result.auditId}</span></p>
            <p>Transaction : <span className="font-mono break-all text-wk-violetInk">{result.txId}</span></p>
            <p>Réseau : <span className="text-wk-text">{result.network}</span></p>
          </div>
        </div>
      )}

      {status === "not_found" && (
        <div className="rounded-[16px] border border-wk-border bg-wk-amberSoft p-4">
          <p className="text-[11.5px] font-semibold text-wk-amberInk">
            Hash non trouvé dans le registre. Il est possible que l&apos;ancrage soit en attente
            (asynchrone) ou que le hash soit incorrect.
          </p>
        </div>
      )}

      {status === "error" && (
        <div className="rounded-[16px] border border-wk-border bg-wk-coralSoft p-4">
          <p className="text-[11.5px] font-semibold text-wk-coralInk">
            Erreur de verification — reessayez ou contactez la HotLine.
          </p>
        </div>
      )}
    </div>
  );
}
