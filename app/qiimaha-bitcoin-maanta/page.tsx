import type { Metadata } from "next";
import Link from "next/link";
import { cleanWireItems, fetchLatest } from "@/lib/news";
import { fetchTopPrices } from "@/lib/prices";
import { timeAgo } from "@/lib/time";
import { StoryLink } from "@/components/StoryLink";

export const metadata: Metadata = {
  title: "Qiimaha Bitcoin Maanta (USD) + Wararka",
  description:
    "Qiimaha Bitcoin maanta oo live ah (USD), isbeddelka 24h, iyo wararka BTC ee af-Soomaali.",
  keywords: [
    "qiimaha bitcoin maanta",
    "bitcoin price somali",
    "btc price today",
    "bitcoin usd",
    "wararka bitcoin",
    "bitcoin somali",
  ],
  alternates: { canonical: "/qiimaha-bitcoin-maanta" },
  openGraph: {
    title: "Qiimaha Bitcoin Maanta + Wararka | MxCrypto",
    description:
      "Qiimaha Bitcoin maanta oo live ah (USD), isbeddelka 24h, iyo wararka BTC ee af-Soomaali.",
    type: "website",
    images: [{ url: "/brand/mxcrypto-logo.png" }],
  },
};

function formatUSD(n: number) {
  const abs = Math.abs(n);
  const maxFrac = abs >= 1000 ? 0 : abs >= 1 ? 2 : 4;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: maxFrac,
  }).format(n);
}

function formatPct(n: number | null) {
  if (typeof n !== "number") return "—";
  const sign = n > 0 ? "+" : "";
  return `${sign}${n.toFixed(2)}%`;
}

function isBitcoinStory(text: string) {
  const t = text.toLowerCase();
  return ["bitcoin", " btc", "btc ", "satoshi", "hashrate", "etf"].some((x) =>
    t.includes(x),
  );
}

export default async function BitcoinPricePage() {
  const [prices, latest] = await Promise.all([fetchTopPrices(), fetchLatest(120, "so")]);
  const btc = prices.find((x) => x.id === "bitcoin") ?? null;
  const eth = prices.find((x) => x.id === "ethereum") ?? null;
  const sol = prices.find((x) => x.id === "solana") ?? null;
  const items = cleanWireItems(latest).filter((x) =>
    isBitcoinStory(`${x.title || ""}\n${x.summary || ""}\n${(x.tags || []).join(" ")}`),
  );

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Qiimaha Bitcoin maanta xaggee laga helaa?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Boggan wuxuu muujinayaa qiimaha Bitcoin live ahaan (USD) iyo isbeddelka 24 saac.",
        },
      },
      {
        "@type": "Question",
        name: "Qiimaha BTC ma daqiiqad kasta ayuu is beddelaa?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Haa, suuqa crypto waa firfircoon. Qiimuhu wuxuu is beddeli karaa ilbiriqsiyo gudahood.",
        },
      },
    ],
  };

  const updatedAt =
    typeof btc?.updatedAtMs === "number" ? new Date(btc.updatedAtMs).toISOString() : undefined;

  const financialJsonLd =
    btc && updatedAt
      ? {
          "@context": "https://schema.org",
          "@type": "Dataset",
          name: "Qiimaha Bitcoin Maanta (USD)",
          description: "Qiimaha Bitcoin live iyo isbeddelka 24h.",
          dateModified: updatedAt,
          creator: { "@type": "Organization", name: "MxCrypto" },
        }
      : null;

  return (
    <main className="mx-container pt-6 pb-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      {financialJsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(financialJsonLd) }}
        />
      ) : null}

      <header className="border-b mx-hairline pb-4">
        <div className="mx-mono text-[12px] font-semibold tracking-widest text-[rgb(var(--accent))]">
          QIIMAHA BITCOIN MAANTA
        </div>
        <h1 className="mx-headline mt-3 text-[40px] font-semibold leading-[1.03] text-white md:text-[56px]">
          Qiimaha Bitcoin Maanta (USD)
        </h1>
        <p className="mt-3 max-w-[86ch] text-[15px] leading-relaxed text-white/68">
          Qiimaha BTC live, isbeddelka 24h, iyo wararka muhiimka ah ee saameynaya suuqa.
        </p>
      </header>

      <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { label: "BTCUSD", item: btc },
          { label: "ETHUSD", item: eth },
          { label: "SOLUSD", item: sol },
        ].map((x) => (
          <article key={x.label} className="mx-panel p-4">
            <div className="mx-mono text-[11px] font-semibold tracking-widest text-white/55">
              {x.label}
            </div>
            <div className="mx-headline mt-2 text-[28px] font-semibold text-white">
              {x.item ? formatUSD(x.item.priceUsd) : "—"}
            </div>
            <div
              className={[
                "mx-mono mt-2 text-[12px] font-semibold",
                (x.item?.change24hPct || 0) < 0 ? "text-red-300" : "text-emerald-300",
              ].join(" ")}
            >
              {formatPct(x.item?.change24hPct || null)} (24h)
            </div>
          </article>
        ))}
      </section>

      <section className="mt-8">
        <div className="flex items-center justify-between border-b mx-hairline pb-3">
          <div className="mx-mono text-[11px] font-semibold tracking-widest text-white/55">
            WARARKA BITCOIN
          </div>
          <Link
            href="/wararka-bitcoin"
            className="mx-mono text-[11px] text-white/55 hover:text-white/85"
          >
            Dhammaan →
          </Link>
        </div>
        <div className="mt-2 space-y-1">
          {items.slice(0, 10).map((it) => (
            <div key={it.id || it.url}>
              <StoryLink item={it} dense showThumb clean />
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="mx-panel p-4">
          <div className="mx-mono text-[11px] font-semibold tracking-widest text-white/55">
            FAQ
          </div>
          <h2 className="mt-2 text-[18px] font-semibold text-white">
            Qiimaha Bitcoin maanta xaggee laga helaa?
          </h2>
          <p className="mt-2 text-[14px] leading-relaxed text-white/68">
            Boggan wuxuu muujinayaa qiimaha Bitcoin live ahaan (USD) iyo isbeddelka 24 saac.
          </p>
        </div>
        <div className="mx-panel p-4">
          <div className="mx-mono text-[11px] font-semibold tracking-widest text-white/55">
            FAQ
          </div>
          <h2 className="mt-2 text-[18px] font-semibold text-white">
            Qiimaha BTC ma daqiiqad kasta ayuu is beddelaa?
          </h2>
          <p className="mt-2 text-[14px] leading-relaxed text-white/68">
            Haa, suuqa crypto waa firfircoon, markaa qiimuhu si degdeg ah ayuu isu beddelaa.
          </p>
        </div>
      </section>

      {updatedAt ? (
        <div className="mx-mono mt-6 text-[11px] text-white/45">
          La cusbooneysiiyay {timeAgo(updatedAt)}
        </div>
      ) : null}
    </main>
  );
}
