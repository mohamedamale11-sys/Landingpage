import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Asturnaanta",
  description: "Sida MxCrypto u maareeyo xogtaada iyo asturnaantaada.",
  alternates: { canonical: "/asturnaanta" },
};

export default function PrivacyPage() {
  return (
    <main className="mx-container pt-10 pb-16">
      <div className="mx-mono text-[11px] font-semibold tracking-widest text-[rgb(var(--accent))]">
        ASTURNAANTA
      </div>
      <h1 className="mx-headline mt-3 text-[44px] font-semibold leading-[1.02] text-white md:text-[56px]">
        Siyaasadda Asturnaanta
      </h1>

      <div className="mt-6 max-w-[82ch] space-y-4 text-[16px] leading-relaxed text-white/75">
        <p>
          Boggan waxa uu sharxayaa sida MxCrypto u ururiyo una isticmaalo xogta marka
          aad booqato website-ka.
        </p>
        <p>
          <span className="text-white/90 font-semibold">Xogta aan ururino:</span>{" "}
          Waxaan ururin karnaa xog caadi ah oo server-ku qoro (tusaale: IP address,
          browser/user-agent, waqtiga codsiga) si loo ilaaliyo amniga, loo hagaajiyo
          waxqabadka, loona ogaado ciladaha.
        </p>
        <p>
          <span className="text-white/90 font-semibold">Cookies:</span> Hadda
          website-ku ma qasbo cookies gaar ah oo xayeysiis/raadin ah, balse adeegyada
          saddexaad (marka aad furto link-yo dibadda ah) waxay yeelan karaan cookies
          u gaar ah.
        </p>
        <p>
          <span className="text-white/90 font-semibold">La wadaagid:</span> Ma iibinno
          xogtaada. Waxaan la wadaagi karnaa xog kaliya haddii ay sharcigu qasbo ama
          si loo ilaaliyo amniga/adeegga.
        </p>
      </div>
    </main>
  );
}

