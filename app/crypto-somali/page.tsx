import type { Metadata } from "next";
import Link from "next/link";
import { HistoryPager } from "@/components/HistoryPager";
import { StoryLink } from "@/components/StoryLink";
import { cleanWireItems, encodeStoryID, fetchLatestPage } from "@/lib/news";
import { timeAgo } from "@/lib/time";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function firstStr(v: string | string[] | undefined): string {
  return Array.isArray(v) ? v[0] ?? "" : v ?? "";
}

const baseMetadata: Metadata = {
  title: "Crypto Somali: Warar, Qiimo, iyo Barasho",
  description:
    "Crypto Somali hub: wararka crypto ee af-Soomaali, qiimaha Bitcoin/Ethereum maanta, iyo free courses bilow ilaa advanced.",
  keywords: [
    "crypto somali",
    "crypto af soomaali",
    "wararka crypto somali",
    "suuqa crypto somalia",
    "bitcoin somali",
    "ethereum somali",
    "baro crypto",
  ],
  alternates: { canonical: "/crypto-somali" },
  openGraph: {
    title: "Crypto Somali Hub | MxCrypto",
    description:
      "Warar, qiimo, iyo barasho crypto oo af-Soomaali ah. Hal meel oo nadiif ah.",
    type: "website",
    images: [{ url: "/brand/mxcrypto-logo.png" }],
  },
};

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const sp = (await props.searchParams) ?? {};
  const offsetRaw = Number.parseInt(firstStr(sp.offset), 10);
  const offset = Number.isFinite(offsetRaw) && offsetRaw > 0 ? offsetRaw : 0;
  const noIndex = offset > 0;

  return {
    ...baseMetadata,
    alternates: { canonical: "/crypto-somali" },
    robots: noIndex ? { index: false, follow: true } : { index: true, follow: true },
  };
}

export default async function CryptoSomaliPage(props: PageProps) {
  const sp = (await props.searchParams) ?? {};
  const offsetRaw = Number.parseInt(firstStr(sp.offset), 10);
  const offset = Number.isFinite(offsetRaw) && offsetRaw > 0 ? offsetRaw : 0;
  const batchLimit = 140;

  const page = await fetchLatestPage({ limit: batchLimit, offset, lang: "so" });
  const items = cleanWireItems(page.items);
  const hero = items[0] ?? null;
  const rest = items.slice(1, 32);

  const siteBase =
    process.env.SITE_URL && process.env.SITE_URL.trim() !== ""
      ? process.env.SITE_URL.replace(/\/+$/, "")
      : "";
  const abs = (p: string) => (siteBase ? `${siteBase}${p}` : p);

  const listJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Crypto Somali wararka ugu dambeeya",
    itemListElement: items.slice(0, 25).map((it, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      url: abs(`/news/${encodeStoryID(it.url)}`),
      name: it.title,
    })),
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Crypto Somali maxaa laga helaa?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Waxaad ka helaysaa wararka crypto, qiimaha tooska ah, iyo casharro free ah oo af-Soomaali ah.",
        },
      },
      {
        "@type": "Question",
        name: "Wararka ma yihiin kuwa ugu cusub?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Haa, feed-ka waxa lagu kala hormariyaa waqtiga daabacaadda si wararka cusub ay dusha uga muuqdaan.",
        },
      },
    ],
  };

  return (
    <main className="mx-container pt-6 pb-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(listJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <header className="border-b mx-hairline pb-4">
        <div className="mx-mono text-[12px] font-semibold tracking-widest text-[rgb(var(--accent))]">
          CRYPTO SOMALI
        </div>
        <h1 className="mx-headline mt-3 text-[40px] font-semibold leading-[1.03] text-white md:text-[56px]">
          Crypto Somali: warar, qiimo, iyo barasho
        </h1>
        <p className="mt-3 max-w-[86ch] text-[15px] leading-relaxed text-white/68">
          Halkan waxaad ka heli kartaa dhammaan waxyaabaha muhiimka ah ee crypto ee
          bulshada Soomaaliyeed: news cusub, suuq xog, iyo free courses.
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          {[
            { href: "/qiimaha-bitcoin-maanta", label: "Qiimaha Bitcoin Maanta" },
            { href: "/wararka-bitcoin", label: "Wararka Bitcoin" },
            { href: "/wararka-ethereum", label: "Wararka Ethereum" },
            { href: "/memecoin-somali", label: "Memecoin Somali" },
            { href: "/baro", label: "Free courses" },
          ].map((x) => (
            <Link
              key={x.href}
              href={x.href}
              className="mx-mono rounded-full border mx-hairline bg-white/[0.02] px-4 py-2 text-[12px] font-semibold text-white/75 hover:bg-white/[0.06] hover:text-white"
            >
              {x.label}
            </Link>
          ))}
        </div>
      </header>

      {hero ? (
        <section className="mt-6">
          <Link href={`/news/${encodeStoryID(hero.url)}`} scroll className="group block">
            <h2 className="mx-headline text-[34px] font-semibold leading-[1.06] text-white group-hover:underline md:text-[46px]">
              {hero.title}
            </h2>
            <div className="mx-mono mt-2 text-[12px] text-white/45">
              {timeAgo(hero.published_at)}
            </div>
          </Link>
        </section>
      ) : null}

      <section className="mt-8">
        <div className="flex items-center justify-between border-b mx-hairline pb-3">
          <div className="mx-mono text-[11px] font-semibold tracking-widest text-white/55">
            WARARKA CRYPTO
          </div>
          <div className="mx-mono text-[10px] text-white/45">{rest.length} war</div>
        </div>
        <div className="mt-2 space-y-1">
          {rest.map((it) => (
            <div key={it.id || it.url}>
              <StoryLink item={it} dense showThumb clean />
            </div>
          ))}
          {rest.length === 0 ? (
            <div className="py-8">
              <div className="mx-mono text-[12px] text-white/55">Warar lama helin.</div>
            </div>
          ) : null}
        </div>
      </section>

      <HistoryPager
        basePath="/crypto-somali"
        offset={offset}
        limit={batchLimit}
        hasMore={page.hasMore}
        nextOffset={page.nextOffset}
        loadedCount={items.length}
      />
    </main>
  );
}
