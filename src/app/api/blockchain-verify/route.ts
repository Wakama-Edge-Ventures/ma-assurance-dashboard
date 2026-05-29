import { NextRequest, NextResponse } from "next/server";

// Known demo hashes from seed data — for SEED_DEMO verification
const SEED_REGISTRY: Record<string, { anchoredAt: string; txId: string; auditId: string; network: string }> = {
  "sha256:aud001-integrity": {
    anchoredAt: "2025-11-14T09:22:31Z",
    txId: "4tGhWmXkP9vNzQR2aLs8CdYfJ6bEiHoKpMnTcUeVwXyZq1r",
    auditId: "aud_001",
    network: "Solana Mainnet",
  },
  "sha256:aud002-integrity": {
    anchoredAt: "2025-11-20T14:05:17Z",
    txId: "7xLpQmNkR3wVuYT4aGs9BcZiH5jKnMoFpStWdEqXyAb2s",
    auditId: "aud_002",
    network: "Solana Mainnet",
  },
};

// GET /api/blockchain/verify?hash=sha256:...
export async function GET(req: NextRequest) {
  const hash = req.nextUrl.searchParams.get("hash")?.trim();

  if (!hash) {
    return NextResponse.json({ error: "missing_hash" }, { status: 400 });
  }

  // Check seed registry (demo)
  const entry = SEED_REGISTRY[hash];
  if (entry) {
    return NextResponse.json({ found: true, hash, ...entry });
  }

  // TODO: in production, query Solana RPC or indexer for the hash
  // const result = await querySolanaRegistry(hash);
  // if (result) return NextResponse.json({ found: true, hash, ...result });

  return NextResponse.json({ found: false, hash });
}
