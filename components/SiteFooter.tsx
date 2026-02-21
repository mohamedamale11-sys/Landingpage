import Link from "next/link";

function Wordmark() {
  return (
    <div
      className="mx-brand text-[22px] font-semibold leading-none tracking-tight"
      aria-label="MxCrypto"
    >
      <span className="text-[rgb(var(--accent))]">Mx</span>
      <span className="text-white">Crypto</span>
    </div>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t mx-hairline bg-black/30">
      <div className="mx-container py-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link href="/" className="inline-flex items-center">
            <Wordmark />
          </Link>
          <div className="mx-mono text-[11px] text-white/45">
            © {new Date().getFullYear()} MxCrypto
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[
            { href: "/", label: "Warar" },
            { href: "/data", label: "Xogta Suuqa" },
            { href: "/chat", label: "MxCrypto AI" },
            { href: "/crypto-somali", label: "Crypto Somali" },
            { href: "/baro", label: "Free Courses" },
            { href: "/authors", label: "Authors" },
            { href: "/editorial-policy", label: "Editorial Policy" },
            { href: "/corrections-policy", label: "Corrections Policy" },
            { href: "/methodology", label: "Methodology" },
            { href: "/ku-saabsan", label: "Ku Saabsan" },
            { href: "/ka-dhaafid", label: "Ka-dhaafid" },
            { href: "/asturnaanta", label: "Asturnaanta" },
            { href: "/xeerar", label: "Xeerar" },
          ].map((x) => (
            <Link
              key={x.href}
              href={x.href}
              className="mx-mono text-[11px] text-white/55 transition-colors hover:text-white/85"
            >
              {x.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
