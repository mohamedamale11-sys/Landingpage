import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Corrections Policy",
  description:
    "MxCrypto corrections policy: how factual errors are fixed and transparently updated.",
  keywords: [
    "mxcrypto corrections policy",
    "somali crypto corrections",
    "crypto news corrections",
  ],
  alternates: { canonical: "/corrections-policy" },
  openGraph: {
    title: "Corrections Policy | MxCrypto",
    description: "How MxCrypto corrects and updates Somali crypto content.",
    type: "article",
    images: [{ url: "/brand/mxcrypto-logo.png" }],
  },
};

export default function CorrectionsPolicyPage() {
  return (
    <main className="mx-container pt-10 pb-16">
      <div className="mx-mono text-[11px] font-semibold tracking-widest text-[rgb(var(--accent))]">
        CORRECTIONS POLICY
      </div>
      <h1 className="mx-headline mt-3 text-[42px] font-semibold leading-[1.03] text-white md:text-[56px]">
        Siyaasadda Sixitaanka
      </h1>

      <div className="mt-6 max-w-[84ch] space-y-4 text-[16px] leading-relaxed text-white/75">
        <p>
          Haddii qalad xaqiiqo ah lagu arko qoraal, MxCrypto wuxuu sameeyaa sixid sida
          ugu dhakhsaha badan.
        </p>
        <p>
          Noocyada sixidda: tiro khaldan, taariikh khaldan, magac khaldan, ama macluumaad
          aan sax ahayn oo saameynaya fahamka wararka.
        </p>
        <p>
          Marka sixid la sameeyo, waxa la cusbooneysiiyaa qoraalka, waxaana la ilaaliyaa
          nuxurka saxda ah ee wararka.
        </p>
        <p>
          Haddii aad aragto khalad, noogu soo gudbi faahfaahinta adigoo tilmaamaya
          cinwaanka qoraalka iyo waxa khaldan.
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
          href="/methodology"
          className="mx-mono rounded-full border mx-hairline bg-white/[0.02] px-4 py-2 text-[12px] font-semibold text-white/75 hover:bg-white/[0.06] hover:text-white"
        >
          Methodology
        </Link>
      </div>
    </main>
  );
}

