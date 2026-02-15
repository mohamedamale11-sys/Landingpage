import type { Metadata } from "next";
import Link from "next/link";
import { COURSE_HREF } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Baro Crypto (Free Courses)",
  description:
    "Baro aasaaska crypto: wallet, exchanges, amni, DeFi, iyo sida loo fahmo suuqa. Free courses oo ka socota MxCrypto.",
  keywords: [
    "baro crypto",
    "koorso crypto",
    "free crypto course",
    "free crypto courses",
    "bitcoin somali",
    "ethereum somali",
    "wallet",
    "amni",
    "defi",
    "blockchain",
  ],
  alternates: { canonical: "/baro" },
  openGraph: {
    title: "Baro Crypto (Free Courses)",
    description:
      "Baro aasaaska crypto: wallet, exchanges, amni, DeFi, iyo sida loo fahmo suuqa. Free courses.",
    type: "website",
    images: [{ url: "/brand/mxcrypto-logo.png" }],
  },
};

export default function BaroPage() {
  return (
    <main className="mx-container pt-10 pb-16">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_360px]">
        <section className="min-w-0">
          <div className="mx-mono text-[11px] font-semibold tracking-widest text-[rgb(var(--accent))]">
            BARO
          </div>
          <h1 className="mx-headline mt-3 text-[42px] font-semibold leading-[1.02] text-white md:text-[56px]">
            Free courses: Baro Crypto si sax ah
          </h1>
          <p className="mt-5 text-[18px] leading-relaxed text-white/75">
            Hadafkeenu waa in qof walba uu helo aqoon nadiif ah oo af-Soomaali ah:
            sida loo bilaabo, waxa la iska ilaaliyo, iyo sida loo fahmo wararka iyo
            dhaqdhaqaaqa suuqa.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <a
              href={COURSE_HREF}
              target="_blank"
              rel="noopener noreferrer"
              className="mx-mono rounded-full border mx-hairline bg-[rgb(var(--accent))] px-5 py-2.5 text-[12px] font-semibold text-black hover:opacity-90"
            >
              Free courses ↗
            </a>
            <Link
              href="/"
              className="mx-mono rounded-full border mx-hairline bg-white/[0.02] px-5 py-2.5 text-[12px] font-semibold text-white/75 hover:bg-white/[0.06] hover:text-white"
            >
              Ku noqo Wararka
            </Link>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="mx-panel p-5">
              <div className="mx-mono text-[11px] font-semibold tracking-widest text-white/55">
                QAYBTA 1
              </div>
              <div className="mx-headline mt-2 text-[20px] font-semibold text-white">
                Aasaaska Crypto
              </div>
              <div className="mt-2 text-[14px] leading-relaxed text-white/65">
                Bitcoin, Ethereum, stablecoins, iyo erayada muhiimka ah.
              </div>
            </div>
            <div className="mx-panel p-5">
              <div className="mx-mono text-[11px] font-semibold tracking-widest text-white/55">
                QAYBTA 2
              </div>
              <div className="mx-headline mt-2 text-[20px] font-semibold text-white">
                Wallet + Amni
              </div>
              <div className="mt-2 text-[14px] leading-relaxed text-white/65">
                Sidee loo ilaaliyaa seed phrase, scams, iyo qaladaadka caadiga ah.
              </div>
            </div>
            <div className="mx-panel p-5">
              <div className="mx-mono text-[11px] font-semibold tracking-widest text-white/55">
                QAYBTA 3
              </div>
              <div className="mx-headline mt-2 text-[20px] font-semibold text-white">
                Suuqyada
              </div>
              <div className="mt-2 text-[14px] leading-relaxed text-white/65">
                Qiimaha, volatilty, wararka saameeya suuqa, iyo sida loo akhriyo chart.
              </div>
            </div>
            <div className="mx-panel p-5">
              <div className="mx-mono text-[11px] font-semibold tracking-widest text-white/55">
                QAYBTA 4
              </div>
              <div className="mx-headline mt-2 text-[20px] font-semibold text-white">
                DeFi (Bilow)
              </div>
              <div className="mt-2 text-[14px] leading-relaxed text-white/65">
                Lending, DEX, staking, iyo waxa loo baahan yahay ka hor inta aan la gelin.
              </div>
            </div>
          </div>
        </section>

        <aside className="space-y-4">
          <section className="mx-panel p-5">
            <div className="mx-mono text-[11px] font-semibold tracking-widest text-white/55">
              BILAABID DEGDEG AH
            </div>
            <ol className="mt-3 list-decimal space-y-2 pl-5 text-[14px] leading-relaxed text-white/70">
              <li>Fur free courses-ka.</li>
              <li>Dhamee qaybaha aasaasiga ah (wallet + amni).</li>
              <li>Ku laabo wararka si aad u fahanto waxa dhacaya.</li>
            </ol>
          </section>

          <section className="mx-panel p-5">
            <div className="mx-mono text-[11px] font-semibold tracking-widest text-white/55">
              OGAAL
            </div>
            <div className="mt-2 text-[13px] leading-relaxed text-white/70">
              Macluumaadkan waa waxbarasho. Ma aha talo maaliyadeed.
            </div>
          </section>
        </aside>
      </div>
    </main>
  );
}
