import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ka-dhaafid Mas'uuliyad",
  description:
    "Ogeysiis muhiim ah: MxCrypto waa waxbarasho, ma aha talo maaliyadeed.",
  alternates: { canonical: "/ka-dhaafid" },
};

export default function DisclaimerPage() {
  return (
    <main className="mx-container pt-10 pb-16">
      <div className="mx-mono text-[11px] font-semibold tracking-widest text-[rgb(var(--accent))]">
        OGAAL
      </div>
      <h1 className="mx-headline mt-3 text-[44px] font-semibold leading-[1.02] text-white md:text-[56px]">
        Ka-dhaafid Mas&apos;uuliyad
      </h1>

      <div className="mt-6 max-w-[82ch] space-y-4 text-[16px] leading-relaxed text-white/75">
        <p>
          MxCrypto waxa uu bixiyaa warar, soo koobid, iyo macluumaad waxbarasho oo ku
          saabsan crypto. Ma aha talo maaliyadeed.
        </p>
        <p>
          <span className="text-white/90 font-semibold">Khatarta:</span> Crypto waa suuq
          khatar sare leh. Qiimuhu si degdeg ah ayuu isu beddeli karaa. Samee cilmi
          baaris (DYOR) ka hor go&apos;aan kasta.
        </p>
        <p>
          <span className="text-white/90 font-semibold">Saxnaanta:</span> Xogta, qiimaha,
          iyo tirakoobyada waxay ka iman karaan adeegyo saddexaad, waxaana dhici karta
          dib-u-dhac ama khalad. Had iyo jeer xaqiiji xogta.
        </p>
        <p>
          <span className="text-white/90 font-semibold">Wararka:</span> Qoraallo qaar
          waxay noqon karaan soo koobid ama tarjumid si ay u noqdaan af-Soomaali la
          fahmi karo. Haddii aad u baahan tahay faahfaahin dheeraad ah, isticmaal
          link-ga “Fur Asalka”.
        </p>
      </div>
    </main>
  );
}
