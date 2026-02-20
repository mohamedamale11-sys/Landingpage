import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Methodology",
  description:
    "MxCrypto methodology: data pipeline, scraping schedule, Somali localization, and content quality filters.",
  keywords: [
    "mxcrypto methodology",
    "somali crypto news methodology",
    "crypto scraper schedule",
    "somali news localization",
  ],
  alternates: { canonical: "/methodology" },
  openGraph: {
    title: "Methodology | MxCrypto",
    description: "How MxCrypto gathers and localizes Somali crypto news.",
    type: "article",
    images: [{ url: "/brand/mxcrypto-logo.png" }],
  },
};

export default function MethodologyPage() {
  const dataJsonLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How MxCrypto builds Somali crypto news",
    step: [
      { "@type": "HowToStep", name: "Collect latest crypto articles from trusted feeds" },
      { "@type": "HowToStep", name: "Filter low-quality and non-news content" },
      { "@type": "HowToStep", name: "Localize to natural Somali" },
      { "@type": "HowToStep", name: "Save and rank by publication time" },
      { "@type": "HowToStep", name: "Publish to website and channels" },
    ],
  };

  return (
    <main className="mx-container pt-10 pb-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(dataJsonLd) }}
      />
      <div className="mx-mono text-[11px] font-semibold tracking-widest text-[rgb(var(--accent))]">
        METHODOLOGY
      </div>
      <h1 className="mx-headline mt-3 text-[42px] font-semibold leading-[1.03] text-white md:text-[56px]">
        Sida MxCrypto u shaqeeyo
      </h1>

      <div className="mt-6 max-w-[84ch] space-y-4 text-[16px] leading-relaxed text-white/75">
        <p>
          MxCrypto wuxuu soo ururiyaa wararka crypto si joogto ah (15 daqiiqo), kadibna
          wuxuu kala saaraa wararka saxda ah iyo bogagga aan war ahayn.
        </p>
        <p>
          Qoraallada la aqbalo waxaa loo habeeyaa Somali dabiici ah, waxaana lagu keydiyaa
          DB iyadoo lagu kala hormarinayo waqtiga daabacaadda.
        </p>
        <p>
          Waxaan isticmaalnaa filters tayo si looga saaro pages aan ku habboonayn feed-ka:
          terms, privacy, sponsored, iyo content aan khuseyn.
        </p>
        <p>
          Markii war cusub yimaado, waxaa loo faafiyaa website-ka iyo channels-ka bulshada
          si degdeg ah.
        </p>
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-2">
        <Link
          href="/editorial-policy"
          className="mx-mono rounded-full border mx-hairline bg-white/[0.02] px-4 py-2 text-[12px] font-semibold text-white/75 hover:bg-white/[0.06] hover:text-white"
        >
          Editorial Policy
        </Link>
        <Link
          href="/corrections-policy"
          className="mx-mono rounded-full border mx-hairline bg-white/[0.02] px-4 py-2 text-[12px] font-semibold text-white/75 hover:bg-white/[0.06] hover:text-white"
        >
          Corrections Policy
        </Link>
      </div>
    </main>
  );
}

