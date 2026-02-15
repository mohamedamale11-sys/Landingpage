import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ku Saabsan",
  description:
    "MxCrypto waa warar crypto oo af-Soomaali ah: degdeg, kooban, oo la fahmi karo.",
  alternates: { canonical: "/ku-saabsan" },
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
    </main>
  );
}
