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
  title: "Wararka Bitcoin Somali",
  description:
    "Wararka Bitcoin ee af-Soomaali: BTC news, qiimaha, ETF updates, iyo dhaqdhaqaaqa suuqa.",
  keywords: [
    "wararka bitcoin",
    "bitcoin somali",
    "btc somali",
    "bitcoin news somali",
    "qiimaha bitcoin",
    "bitcoin etf",
  ],
  alternates: { canonical: "/wararka-bitcoin" },
  openGraph: {
    title: "Wararka Bitcoin Somali | MxCrypto",
    description:
      "Wararka Bitcoin ee af-Soomaali: BTC news, qiimaha, ETF updates, iyo dhaqdhaqaaqa suuqa.",
    type: "website",
    images: [{ url: "/brand/mxcrypto-logo.png" }],
  },
};

function isBitcoinStory(text: string) {
  const t = text.toLowerCase();
  return ["bitcoin", " btc", "btc ", "satoshi", "hashrate", "etf"].some((x) =>
    t.includes(x),
  );
}

export default async function BitcoinNewsPage(props: PageProps) {
  const sp = (await props.searchParams) ?? {};
  const offsetRaw = Number.parseInt(firstStr(sp.offset), 10);
  const offset = Number.isFinite(offsetRaw) && offsetRaw > 0 ? offsetRaw : 0;
  const batchLimit = 140;

  const page = await fetchLatestPage({ limit: batchLimit, offset, lang: "so" });
  const all = cleanWireItems(page.items);
  const items = all.filter((x) =>
    isBitcoinStory(`${x.title || ""}\n${x.summary || ""}\n${(x.tags || []).join(" ")}`),
  );
  const hero = items[0] ?? null;
  const rest = items.slice(1, 40);
  const sentiment = getSentimentMeta(hero?.sentiment);

  const siteBase =
    process.env.SITE_URL && process.env.SITE_URL.trim() !== ""
      ? process.env.SITE_URL.replace(/\/+$/, "")
      : "";
  const abs = (p: string) => (siteBase ? `${siteBase}${p}` : p);

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Wararka Bitcoin sidee loo kala hormariyaa?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Waxaan ku kala hormarinaa waqtiga la daabacay si aad marka hore u aragto wararka ugu cusub.",
        },
      },
      {
        "@type": "Question",
        name: "Maalin kasta ma cusboonaysiisaan BTC news?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Haa, scraper-keenu wuxuu hubiyaa wararka cusub dhowr jeer saacad kasta si feed-ku u ahaado mid firfircoon.",
        },
      },
    ],
  };

  const listJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Wararka Bitcoin Somali",
    itemListElement: items.slice(0, 25).map((it, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      url: abs(`/news/${encodeStoryID(it.url)}`),
      name: it.title,
    })),
  };

  return (
    <main className="mx-container pt-6 pb-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(listJsonLd) }}
      />

      <header className="border-b mx-hairline pb-4">
        <div className="mx-mono text-[12px] font-semibold tracking-widest text-[rgb(var(--accent))]">
          WARARKA BITCOIN
        </div>
        <h1 className="mx-headline mt-3 text-[40px] font-semibold leading-[1.03] text-white md:text-[56px]">
          Wararka Bitcoin ee af-Soomaali
        </h1>
        <p className="mt-3 max-w-[86ch] text-[15px] leading-relaxed text-white/68">
          Halkan waxaad ka helaysaa BTC news-ka ugu muhiimsan: qiimo, sharci, ETF,
          whales, iyo dhaqdhaqaaqa suuqa. Wax walba waa Somali nadiif ah.
        </p>
      </header>

      {hero ? (
        <section className="mt-6">
          <Link href={`/news/${encodeStoryID(hero.url)}`} className="group block">
            <div className="relative aspect-[16/9] overflow-hidden rounded-[12px] bg-black">
              {hero.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={hero.image_url}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover"
                  loading="eager"
                  decoding="async"
                  fetchPriority="high"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_22%,rgb(var(--accent)/0.18),transparent_62%),linear-gradient(135deg,rgba(255,255,255,0.06),rgba(255,255,255,0.01))]" />
              )}
              <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/80 to-transparent" />
            </div>
            <h2 className="mx-headline mt-4 text-[34px] font-semibold leading-[1.05] text-white group-hover:underline md:text-[46px]">
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
            QORAALLO KALE
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
        basePath="/wararka-bitcoin"
        offset={offset}
        limit={batchLimit}
        hasMore={page.hasMore}
        nextOffset={page.nextOffset}
        loadedCount={items.length}
      />

      <section className="mt-10 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="mx-panel p-4">
          <div className="mx-mono text-[11px] font-semibold tracking-widest text-white/55">
            FAQ
          </div>
          <h3 className="mt-2 text-[18px] font-semibold text-white">
            Wararka Bitcoin sidee loo kala hormariyaa?
          </h3>
          <p className="mt-2 text-[14px] leading-relaxed text-white/68">
            Waxaan ku kala hormarinaa waqtiga la daabacay si aad marka hore u aragto
            wararka ugu cusub.
          </p>
        </div>
        <div className="mx-panel p-4">
          <div className="mx-mono text-[11px] font-semibold tracking-widest text-white/55">
            FAQ
          </div>
          <h3 className="mt-2 text-[18px] font-semibold text-white">
            Maalin kasta ma cusboonaysiisaan BTC news?
          </h3>
          <p className="mt-2 text-[14px] leading-relaxed text-white/68">
            Haa, scraper-keenu wuxuu hubiyaa wararka cusub si joogto ah, markaa feed-ku
            mar walba waa cusub yahay.
          </p>
        </div>
      </section>
    </main>
  );
}
