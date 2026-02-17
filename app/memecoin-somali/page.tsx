import type { Metadata } from "next";
import Link from "next/link";
import { HistoryPager } from "@/components/HistoryPager";
import { StoryLink } from "@/components/StoryLink";
import { cleanWireItems, encodeStoryID, fetchLatestPage } from "@/lib/news";
import { getSentimentMeta } from "@/lib/sentiment";
import { timeAgo } from "@/lib/time";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function firstStr(v: string | string[] | undefined): string {
  return Array.isArray(v) ? v[0] ?? "" : v ?? "";
}

export const metadata: Metadata = {
  title: "Memecoin Somali: Wararka Meme Coins",
  description:
    "Wararka memecoin ee af-Soomaali: Dogecoin, Shiba Inu, PEPE, BONK, WIF, iyo meme market updates.",
  keywords: [
    "memecoin somali",
    "wararka memecoin",
    "meme coin somali",
    "dogecoin somali",
    "shiba inu somali",
    "pepe coin somali",
    "bonk somali",
    "wif coin somali",
  ],
  alternates: { canonical: "/memecoin-somali" },
  openGraph: {
    title: "Memecoin Somali | MxCrypto",
    description:
      "Wararka memecoin ee af-Soomaali: Dogecoin, Shiba Inu, PEPE, BONK, WIF, iyo meme market updates.",
    type: "website",
    images: [{ url: "/brand/mxcrypto-logo.png" }],
  },
};

function isMemecoinStory(text: string) {
  const t = text.toLowerCase();
  return [
    "memecoin",
    "meme coin",
    "dogecoin",
    "doge",
    "shiba",
    "shib",
    "pepe",
    "bonk",
    "wif",
    "floki",
    "meme token",
  ].some((k) => t.includes(k));
}

export default async function MemecoinSomaliPage(props: PageProps) {
  const sp = (await props.searchParams) ?? {};
  const offsetRaw = Number.parseInt(firstStr(sp.offset), 10);
  const offset = Number.isFinite(offsetRaw) && offsetRaw > 0 ? offsetRaw : 0;
  const batchLimit = 180;

  const page = await fetchLatestPage({ limit: batchLimit, offset, lang: "so" });
  const all = cleanWireItems(page.items);
  const filtered = all.filter((x) =>
    isMemecoinStory(`${x.title || ""}\n${x.summary || ""}\n${(x.tags || []).join(" ")}`),
  );
  const items = filtered.length ? filtered : all.slice(0, 24);

  const hero = items[0] ?? null;
  const rest = items.slice(1, 36);
  const sentiment = getSentimentMeta(hero?.sentiment);

  const siteBase =
    process.env.SITE_URL && process.env.SITE_URL.trim() !== ""
      ? process.env.SITE_URL.replace(/\/+$/, "")
      : "";
  const abs = (p: string) => (siteBase ? `${siteBase}${p}` : p);
  const listJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Memecoin Somali wararka ugu dambeeya",
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
        name: "Memecoin maxaa loola jeedaa?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Memecoin waa crypto token badanaa ku dhisan bulshada iyo hype, sida DOGE ama SHIB.",
        },
      },
      {
        "@type": "Question",
        name: "Memecoin ma khatar sare baa?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Haa, memecoins badankood volatility sare ayay leeyihiin. Ka taxaddar risk management.",
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
          MEMECOIN SOMALI
        </div>
        <h1 className="mx-headline mt-3 text-[40px] font-semibold leading-[1.03] text-white md:text-[56px]">
          Memecoin Somali: wararka meme market
        </h1>
        <p className="mt-3 max-w-[86ch] text-[15px] leading-relaxed text-white/68">
          DOGE, SHIB, PEPE, BONK, WIF iyo tokens kale oo meme ah. Wararka cusub iyo
          dhaq-dhaqaaqa suuqa oo Somali ah.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Link
            href="/crypto-somali"
            className="mx-mono rounded-full border mx-hairline bg-white/[0.02] px-4 py-2 text-[12px] font-semibold text-white/75 hover:bg-white/[0.06] hover:text-white"
          >
            Crypto Somali Hub
          </Link>
          <Link
            href="/wararka-bitcoin"
            className="mx-mono rounded-full border mx-hairline bg-white/[0.02] px-4 py-2 text-[12px] font-semibold text-white/75 hover:bg-white/[0.06] hover:text-white"
          >
            Wararka Bitcoin
          </Link>
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
              {sentiment ? (
                <>
                  <span className="text-white/25"> • </span>
                  <span className={["font-semibold", sentiment.className].join(" ")}>
                    {sentiment.label}
                  </span>
                </>
              ) : null}
            </div>
          </Link>
        </section>
      ) : null}

      <section className="mt-8">
        <div className="flex items-center justify-between border-b mx-hairline pb-3">
          <div className="mx-mono text-[11px] font-semibold tracking-widest text-white/55">
            MEMECOIN NEWS
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
        basePath="/memecoin-somali"
        offset={offset}
        limit={batchLimit}
        hasMore={page.hasMore}
        nextOffset={page.nextOffset}
        loadedCount={items.length}
      />
    </main>
  );
}
