import Image from "next/image";
import Link from "next/link";

import logo from "@/img/wakama_logo.png";

const FOOTER_LINKS = [
  { label: "Reporter un bug", href: "/fr/bug" },
  { label: "Contacter la HotLine", href: "/fr/hotline" },
  { label: "Documentation", href: "/fr/docs" },
  { label: "Vérification registre Blockchain", href: "/fr/blockchain" },
  { label: "Politique de confidentialité et sécurité", href: "/fr/privacy" },
] as const;

export function DashboardFooter() {
  const sharedLive = process.env.NEXT_PUBLIC_USE_LIVE_API === "true";
  const insuranceLive = process.env.NEXT_PUBLIC_USE_LIVE_INSURANCE_API === "true";

  return (
    <footer className="w-full border-t border-slate-400/10 bg-[#070b17]/60">
      {/* Top row */}
      <div className="flex flex-wrap items-center gap-4 border-b border-slate-400/6 px-8 py-4">
        <div className="flex items-center gap-2.5">
          <Image
            src={logo}
            alt="Wakama"
            className="h-6 w-auto flex-none object-contain"
          />
          <span className="text-[12.5px] font-medium text-slate-400">Wakama Assurance</span>
        </div>

        <div className="ml-auto flex flex-wrap items-center gap-1 font-mono text-[11px] text-[#5B6B86]">
          <span className={sharedLive ? "text-emerald-400" : ""}>
            Shared data{sharedLive ? " LIVE" : ""}
          </span>
          <span>·</span>
          <span>
            Workflows assurance
            {insuranceLive && <span className="ml-1 text-emerald-400">LIVE</span>}
          </span>
          <span>·</span>
          <span>© 2026 Wakama Edge Ventures Inc.</span>
        </div>
      </div>

      {/* Bottom nav */}
      <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-2 px-8 py-3">
        {FOOTER_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="font-mono text-[11px] text-slate-500 transition-colors hover:text-slate-300"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </footer>
  );
}
