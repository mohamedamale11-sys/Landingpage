import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Editorial Policy",
  description:
    "MxCrypto editorial policy: how we source, summarize, review, and publish Somali crypto news.",
  keywords: [
    "mxcrypto editorial policy",
    "somali crypto news policy",
    "crypto news standards",
    "wararka crypto somali",
  ],
  alternates: { canonical: "/editorial-policy" },
  openGraph: {
    title: "Editorial Policy | MxCrypto",
    description: "How MxCrypto creates and reviews Somali crypto news.",
    type: "article",
    images: [{ url: "/brand/mxcrypto-logo.png" }],
  },
};

export default function EditorialPolicyPage() {
  const policyJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "MxCrypto Editorial Policy",
    url: "https://www.mxcrypto.net/editorial-policy",
    inLanguage: "so",
  };

  return (
    <main className="mx-container pt-10 pb-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(policyJsonLd) }}
      />
      <div className="mx-mono text-[11px] font-semibold tracking-widest text-[rgb(var(--accent))]">
        EDITORIAL POLICY
      </div>
      <h1 className="mx-headline mt-3 text-[42px] font-semibold leading-[1.03] text-white md:text-[56px]">
        Habraaca Tafatirka MxCrypto
      </h1>

      <div className="mt-6 max-w-[84ch] space-y-4 text-[16px] leading-relaxed text-white/75">
        <p>
          MxCrypto wuxuu diiradda saaraa warar crypto Somali ah oo kooban, la fahmi
          karo, isla markaana ku saleysan ilo la hubiyay.
        </p>
        <p>
          Waxaan ka shaqeynaa habkan: <span className="font-semibold text-white/90">source → verify → summarize → review → publish.</span>
        </p>
        <p>
          Qoraal walba waxaa la hubiyaa inuu yahay war ku saabsan crypto, lagana saaro
          bogagga aan war ahayn (terms/privacy/sponsored pages).
        </p>
        <p>
          Tarjumidda ama soo koobidda waxaa loo sameeyaa Somali dabiici ah. Hadafku waa
          caddeyn, saxnaan, iyo waxtar akhriste.
        </p>
        <p>
          MxCrypto ma bixiyo talo maalgashi. Qoraalladu waa macluumaad iyo waxbarasho.
        </p>
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-2">
        <Link
          href="/corrections-policy"
          className="mx-mono rounded-full border mx-hairline bg-white/[0.02] px-4 py-2 text-[12px] font-semibold text-white/75 hover:bg-white/[0.06] hover:text-white"
        >
          Corrections Policy
        </Link>
        <Link
          href="/methodology"
          className="mx-mono rounded-full border mx-hairline bg-white/[0.02] px-4 py-2 text-[12px] font-semibold text-white/75 hover:bg-white/[0.06] hover:text-white"
        >
          Methodology
        </Link>
      </div>
    </main>
  );
}

