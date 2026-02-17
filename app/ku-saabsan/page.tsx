import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Ku Saabsan",
  description:
    "MxCrypto waa warar crypto oo af-Soomaali ah: degdeg, kooban, oo la fahmi karo.",
  keywords: [
    "mxcrypto",
    "wararka crypto somali",
    "bitcoin somali",
    "ethereum somali",
    "qiimaha bitcoin maanta",
  ],
  alternates: { canonical: "/ku-saabsan" },
  openGraph: {
    title: "Ku Saabsan MxCrypto",
    description:
      "MxCrypto waa warar crypto oo af-Soomaali ah: degdeg, kooban, oo la fahmi karo.",
    type: "website",
    images: [{ url: "/brand/mxcrypto-logo.png" }],
  },
};

export default function AboutPage() {
  return (
    <main className="mx-container pt-10 pb-16">
      <div className="mx-mono text-[11px] font-semibold tracking-widest text-[rgb(var(--accent))]">
        KU SAABSAN
      </div>
      <h1 className="mx-headline mt-3 text-[44px] font-semibold leading-[1.02] text-white md:text-[56px]">
        MxCrypto
      </h1>

      <div className="mt-6 max-w-[78ch] space-y-4 text-[16px] leading-relaxed text-white/75">
        <p>
          MxCrypto waxa uu kuu keenaa wararka crypto ee ugu muhiimsan, si af-Soomaali
          dabiici u eg, oo habaysan. Hadafkeenu waa in bulshada Soomaaliyeed ay hesho
          warar iyo macluumaad si fudud loo fahmi karo.
        </p>
        <p>
          Waxaan diiradda saarnaa: nadiif, kooban, iyo xawli. Qoraallada qaar waxay
          noqon karaan soo koobid ama tarjumid; haddii aad rabto faahfaahin buuxda,
          waxaad mar walba furi kartaa link-ga asalka ah.
        </p>
        <p>
          MxCrypto ma bixiyo talo maaliyadeed. Ka hor inta aanad go&apos;aan maalgashi
          gaarin, xaqiiji xogta oo samee cilmi-baaris.
        </p>
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-2">
        <Link
          href="/qiimaha-bitcoin-maanta"
          className="mx-mono rounded-full border mx-hairline bg-white/[0.02] px-4 py-2 text-[12px] font-semibold text-white/75 hover:bg-white/[0.06] hover:text-white"
        >
          Qiimaha Bitcoin Maanta
        </Link>
        <Link
          href="/wararka-bitcoin"
          className="mx-mono rounded-full border mx-hairline bg-white/[0.02] px-4 py-2 text-[12px] font-semibold text-white/75 hover:bg-white/[0.06] hover:text-white"
        >
          Wararka Bitcoin
        </Link>
        <Link
          href="/wararka-ethereum"
          className="mx-mono rounded-full border mx-hairline bg-white/[0.02] px-4 py-2 text-[12px] font-semibold text-white/75 hover:bg-white/[0.06] hover:text-white"
        >
          Wararka Ethereum
        </Link>
        <Link
          href="/crypto-somali"
          className="mx-mono rounded-full border mx-hairline bg-white/[0.02] px-4 py-2 text-[12px] font-semibold text-white/75 hover:bg-white/[0.06] hover:text-white"
        >
          Crypto Somali
        </Link>
        <Link
          href="/memecoin-somali"
          className="mx-mono rounded-full border mx-hairline bg-white/[0.02] px-4 py-2 text-[12px] font-semibold text-white/75 hover:bg-white/[0.06] hover:text-white"
        >
          Memecoin Somali
        </Link>
      </div>
    </main>
  );
}
