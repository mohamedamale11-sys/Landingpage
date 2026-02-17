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
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="inline-flex items-center">
            <Wordmark />
          </Link>
          <div className="mx-mono text-[11px] text-white/45">
            © {new Date().getFullYear()} MxCrypto
          </div>
        </div>
      </div>
    </footer>
  );
}
