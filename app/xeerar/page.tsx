import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Xeerar",
  description: "Xeerarka iyo shuruudaha isticmaalka MxCrypto.",
  alternates: { canonical: "/xeerar" },
};

export default function TermsPage() {
  return (
    <main className="mx-container pt-10 pb-16">
      <div className="mx-mono text-[11px] font-semibold tracking-widest text-[rgb(var(--accent))]">
        XEERAR
      </div>
      <h1 className="mx-headline mt-3 text-[44px] font-semibold leading-[1.02] text-white md:text-[56px]">
        Shuruudaha Isticmaalka
      </h1>

      <div className="mt-6 max-w-[82ch] space-y-4 text-[16px] leading-relaxed text-white/75">
        <p>
          Markaad isticmaasho MxCrypto, waxaad ogolaatay shuruudahaan. Haddii aadan
          ogolayn, fadlan ha isticmaalin website-ka.
        </p>
        <p>
          <span className="text-white/90 font-semibold">Waxbarasho:</span> Dhammaan
          macluumaadka waxa loo bixiyaa ujeeddo waxbarasho. Ma aha talo maaliyadeed,
          maalgashi, ama sharci.
        </p>
        <p>
          <span className="text-white/90 font-semibold">Mas&apos;uuliyad:</span> Ma dammaanad
          qaadeyno saxnaanta, dhameystirka, ama waqtiga xogta. Isticmaaluhu wuxuu
          mas&apos;uul ka yahay go&apos;aamadiisa iyo xaqiijinta xogta.
        </p>
        <p>
          <span className="text-white/90 font-semibold">Link-yo dibadda ah:</span>{" "}
          Website-ku waxa uu yeelan karaa link-yo dibadda ah. Ma xukumno waxyaabaha ku
          jira link-yadaas.
        </p>
        <p>
          Waxaan beddeli karnaa shuruudahaan mar kasta. Isbeddellada waxay dhaqan
          galayaan marka la daabaco.
        </p>
      </div>
    </main>
  );
}
