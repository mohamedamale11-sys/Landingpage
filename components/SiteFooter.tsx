import Link from "next/link";
import { COURSE_HREF } from "@/lib/constants";

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
  const year = new Date().getFullYear();
  return (
    <footer className="border-t mx-hairline bg-black/30">
      <div className="mx-container py-12">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-[1.4fr_1fr]">
          <div className="min-w-0">
            <Link href="/" className="inline-flex items-center">
              <div className="leading-tight">
                <Wordmark />
                <div className="mx-mono mt-1 text-[11px] font-semibold tracking-widest text-white/55">
                  WARARKA CRYPTO
                </div>
              </div>
            </Link>
            <p className="mt-4 max-w-[56ch] text-[14px] leading-relaxed text-white/65">
              Wararka Bitcoin, Ethereum, iyo suuqa crypto ee af-Soomaali. Kooban, nadiif,
              oo la fahmi karo.
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-2">
              <Link
                href="/baro"
                className="mx-mono rounded-full border mx-hairline bg-white/[0.02] px-4 py-2 text-[12px] font-semibold text-white/70 hover:bg-white/[0.06] hover:text-white"
              >
                Baro Crypto
              </Link>
              <a
                href={COURSE_HREF}
                target="_blank"
                rel="noopener noreferrer"
                className="mx-mono rounded-full border mx-hairline bg-[rgb(var(--accent))] px-4 py-2 text-[12px] font-semibold text-black hover:opacity-90"
              >
                Koorso Bilaash ↗
              </a>
              <Link
                href="/rss.xml"
                className="mx-mono rounded-full border mx-hairline bg-white/[0.02] px-4 py-2 text-[12px] font-semibold text-white/70 hover:bg-white/[0.06] hover:text-white"
              >
                RSS
              </Link>
            </div>
          </div>

          <div>
            <div className="mx-mono text-[11px] font-semibold tracking-widest text-white/55">
              BOGAG
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-[13px] text-white/70">
              <Link href="/ku-saabsan" className="hover:text-white">
                Ku Saabsan
              </Link>
              <Link href="/baro" className="hover:text-white">
                Baro
              </Link>
              <Link href="/asturnaanta" className="hover:text-white">
                Asturnaanta
              </Link>
              <Link href="/xeerar" className="hover:text-white">
                Xeerar
              </Link>
              <Link href="/ka-dhaafid" className="hover:text-white">
                Ka-dhaafid Mas&apos;uuliyad
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t mx-hairline pt-6 md:flex-row md:items-center md:justify-between">
          <div className="mx-mono text-[11px] text-white/45">
            © {year} MxCrypto. Dhammaan xuquuqaha way xafidan yihiin.
          </div>
          <div className="mx-mono text-[11px] text-white/35">
            Macluumaadkan waa waxbarasho. Ma aha talo maaliyadeed.
          </div>
        </div>
      </div>
    </footer>
  );
}
