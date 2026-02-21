import type { Metadata } from "next";
import Link from "next/link";
import { fetchGlobalMarketSnapshot } from "@/lib/market";
import { fetchDefiTvlHistory, fetchStablecoins } from "@/lib/llama";
import { fetchBitcoinEtfList } from "@/lib/etf";
import { timeAgo } from "@/lib/time";

export const metadata: Metadata = {
  title: "Xogta Suuqa",
  description:
    "Xogta suuqa crypto: market cap, volume, BTC dominance, DeFi TVL, stablecoins, iyo Bitcoin ETFs.",
  keywords: [
    "qiimaha bitcoin maanta",
    "qiimaha ethereum maanta",
    "crypto price somali",
    "wararka bitcoin",
    "wararka ethereum",
    "xogta crypto",
    "data crypto somali",
    "bitcoin etf",
    "btc dominance",
    "defi tvl",
    "stablecoins",
    "qiimaha bitcoin",
  ],
  alternates: { canonical: "/data" },
  openGraph: {
    title: "Xogta Suuqa | MxCrypto",
    description:
      "Xogta suuqa crypto: market cap, volume, BTC dominance, DeFi TVL, stablecoins, iyo Bitcoin ETFs.",
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

function formatCompactUSD(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 2,
  }).format(n);
}

function formatPct(n: number) {
  const sign = n > 0 ? "+" : "";
  return `${sign}${n.toFixed(2)}%`;
}

function sum(nums: number[]) {
  return nums.reduce((a, b) => a + b, 0);
}

function sparkPath(values: number[], w: number, h: number) {
  if (!values.length) return "";
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = Math.max(1e-9, max - min);
  const step = values.length === 1 ? 0 : w / (values.length - 1);
  const pts = values.map((v, i) => {
    const x = i * step;
    const y = h - ((v - min) / span) * h;
    return [x, y] as const;
  });
  return pts
    .map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(2)},${p[1].toFixed(2)}`)
    .join(" ");
}

function Sparkline(props: { values: number[] }) {
  const w = 180;
  const h = 48;
  const d = sparkPath(props.values, w, h);
  if (!d) return null;
  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      className="block"
      aria-hidden="true"
    >
      <path
        d={d}
        fill="none"
        stroke="rgb(var(--accent))"
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

function parseNum(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string") {
    const n = Number.parseFloat(v.replaceAll(",", ""));
    if (Number.isFinite(n)) return n;
  }
  return null;
}

export default async function DataPage() {
  const [global, tvl, stables, etfs] = await Promise.all([
    fetchGlobalMarketSnapshot(),
    fetchDefiTvlHistory(30),
    fetchStablecoins(),
    fetchBitcoinEtfList(),
  ]);

  const stableUsdTotal = sum(stables.map((s) => s.circulatingUsd));
  const stableTop = [...stables]
    .filter((s) => s.pegType === "peggedUSD")
    .sort((a, b) => b.circulatingUsd - a.circulatingUsd)
    .slice(0, 8);

  const tvlValues = tvl.slice(-30).map((p) => p.tvlUsd);
  const tvlLatest = tvlValues.length ? tvlValues[tvlValues.length - 1] : null;
  const tvl7dAgo = tvlValues.length >= 8 ? tvlValues[tvlValues.length - 8] : null;
  const tvl7dPct =
    typeof tvlLatest === "number" && typeof tvl7dAgo === "number" && tvl7dAgo > 0
      ? ((tvlLatest - tvl7dAgo) / tvl7dAgo) * 100
      : null;

  const etfRows = etfs || [];
  const etfAumTotal = sum(
    etfRows.map((r) => parseNum(r.aum_usd)).filter((x): x is number => typeof x === "number"),
  );
  const etfBtcTotal = sum(
    etfRows
      .map((r) => (typeof r.asset_details?.btc_holding === "number" ? r.asset_details.btc_holding : null))
      .filter((x): x is number => typeof x === "number"),
  );
  const etfTop = [...etfRows]
    .sort((a, b) => (parseNum(b.aum_usd) || 0) - (parseNum(a.aum_usd) || 0))
    .slice(0, 8);

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Qiimaha Bitcoin maanta xaggee laga helaa?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Bogga data-ga iyo bogga Qiimaha Bitcoin Maanta ayaa kuu soo bandhigaya qiimaha live ee BTC.",
        },
      },
      {
        "@type": "Question",
        name: "BTC dominance maxay ka dhigan tahay?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "BTC dominance waa boqolkiiba market cap-ka crypto ee uu Bitcoin keliya ka hayo.",
        },
      },
    ],
  };

  return (
    <main className="mx-container pt-6 pb-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <div className="border-b mx-hairline pb-4">
        <div className="mx-mono text-[12px] font-semibold tracking-widest text-white/60">
          XOGTA SUUQA
        </div>
        <h1 className="mx-headline mt-3 text-[42px] font-semibold leading-[1.02] text-white md:text-[56px]">
          Data: Suuqa, DeFi, Stablecoins, ETFs
        </h1>
        <div className="mt-3 max-w-[84ch] text-[15px] leading-relaxed text-white/65">
          Boggan wuxuu kuu soo koobayaa xogta ugu muhiimsan ee crypto: market cap, volume,
          BTC dominance, DeFi TVL, stablecoins, iyo (haddii la heli karo) Bitcoin ETFs.
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Link
            href="/chat"
            className="mx-mono rounded-full border border-[rgb(var(--accent)/0.4)] bg-[rgb(var(--accent)/0.14)] px-4 py-2 text-[12px] font-semibold text-[rgb(var(--accent))] hover:bg-[rgb(var(--accent)/0.2)]"
          >
            MxCrypto AI Chat
          </Link>
          <Link
            href="/qiimaha-bitcoin-maanta"
            className="mx-mono rounded-full border mx-hairline bg-white/[0.02] px-4 py-2 text-[12px] font-semibold text-white/75 hover:bg-white/[0.06] hover:text-white"
          >
            Qiimaha Bitcoin Maanta
          </Link>
          <Link
            href="/wararka-bitcoin"
            className="mx-mono rounded-full border mx-hairline bg-white/[0.02] px-4 py-2 text-[12px] font-semibold text-white/75 hover:bg-white/[0.06] hover:text-white"
          >
            Wararka Bitcoin
          </Link>
          <Link
            href="/wararka-ethereum"
            className="mx-mono rounded-full border mx-hairline bg-white/[0.02] px-4 py-2 text-[12px] font-semibold text-white/75 hover:bg-white/[0.06] hover:text-white"
          >
            Wararka Ethereum
          </Link>
          <Link
            href="/crypto-somali"
            className="mx-mono rounded-full border mx-hairline bg-white/[0.02] px-4 py-2 text-[12px] font-semibold text-white/75 hover:bg-white/[0.06] hover:text-white"
          >
            Crypto Somali
          </Link>
          <Link
            href="/memecoin-somali"
            className="mx-mono rounded-full border mx-hairline bg-white/[0.02] px-4 py-2 text-[12px] font-semibold text-white/75 hover:bg-white/[0.06] hover:text-white"
          >
            Memecoin Somali
          </Link>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_360px]">
        <section className="space-y-4">
          <section className="mx-panel p-5">
            <div className="flex items-start justify-between gap-6">
              <div>
                <div className="mx-mono text-[11px] font-semibold tracking-widest text-white/55">
                  SUUQA GUUD
                </div>
                <div className="mx-headline mt-2 text-[24px] font-semibold text-white">
                  Market snapshot
                </div>
                <div className="mx-mono mt-2 text-[11px] text-white/40">
                  {global?.updatedAtIso ? `La cusbooneysiiyay ${timeAgo(global.updatedAtIso)}` : ""}
                </div>
              </div>

              {typeof global?.marketCapChange24hPct === "number" ? (
                <div
                  className={[
                    "mx-mono rounded-full border px-3 py-2 text-[12px] font-semibold",
                    global.marketCapChange24hPct < 0
                      ? "border-red-500/20 bg-red-500/10 text-red-200"
                      : "border-emerald-500/20 bg-emerald-500/10 text-emerald-200",
                  ].join(" ")}
                >
                  {formatPct(global.marketCapChange24hPct)} (24h)
                </div>
              ) : null}
            </div>

            <div className="mt-5 grid grid-cols-2 gap-4">
              <div className="rounded-xl border mx-hairline bg-white/[0.02] p-4">
                <div className="mx-mono text-[11px] font-semibold tracking-widest text-white/55">
                  MARKET CAP
                </div>
                <div className="mx-headline mt-2 text-[22px] font-semibold text-white">
                  {typeof global?.totalMarketCapUsd === "number"
                    ? formatCompactUSD(global.totalMarketCapUsd)
                    : "—"}
                </div>
              </div>
              <div className="rounded-xl border mx-hairline bg-white/[0.02] p-4">
                <div className="mx-mono text-[11px] font-semibold tracking-widest text-white/55">
                  VOLUME (24H)
                </div>
                <div className="mx-headline mt-2 text-[22px] font-semibold text-white">
                  {typeof global?.totalVolumeUsd === "number"
                    ? formatCompactUSD(global.totalVolumeUsd)
                    : "—"}
                </div>
              </div>
              <div className="rounded-xl border mx-hairline bg-white/[0.02] p-4">
                <div className="mx-mono text-[11px] font-semibold tracking-widest text-white/55">
                  BTC DOMINANCE
                </div>
                <div className="mx-headline mt-2 text-[22px] font-semibold text-white">
                  {typeof global?.btcDominancePct === "number"
                    ? `${global.btcDominancePct.toFixed(1)}%`
                    : "—"}
                </div>
              </div>
              <div className="rounded-xl border mx-hairline bg-white/[0.02] p-4">
                <div className="mx-mono text-[11px] font-semibold tracking-widest text-white/55">
                  ETH DOMINANCE
                </div>
                <div className="mx-headline mt-2 text-[22px] font-semibold text-white">
                  {typeof global?.ethDominancePct === "number"
                    ? `${global.ethDominancePct.toFixed(1)}%`
                    : "—"}
                </div>
              </div>
            </div>
          </section>

          <section className="mx-panel p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="mx-mono text-[11px] font-semibold tracking-widest text-white/55">
                  DEFI
                </div>
                <div className="mx-headline mt-2 text-[24px] font-semibold text-white">
                  Total value locked (TVL)
                </div>
                <div className="mx-mono mt-2 text-[11px] text-white/40">
                  {typeof tvlLatest === "number" ? `Hadda: ${formatUSD(tvlLatest)}` : ""}
                </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                <div className="hidden sm:block">
                  <Sparkline values={tvlValues} />
                </div>
                {typeof tvl7dPct === "number" ? (
                  <div
                    className={[
                      "mx-mono text-[12px] font-semibold",
                      tvl7dPct < 0 ? "text-red-300" : "text-emerald-300",
                    ].join(" ")}
                  >
                    {formatPct(tvl7dPct)} (7d)
                  </div>
                ) : null}
              </div>
            </div>
          </section>

          <section className="mx-panel overflow-hidden">
            <div className="border-b mx-hairline px-5 py-4">
              <div className="mx-mono text-[11px] font-semibold tracking-widest text-white/55">
                STABLECOINS
              </div>
              <div className="mx-headline mt-2 text-[24px] font-semibold text-white">
                Stablecoins snapshot
              </div>
              <div className="mx-mono mt-2 text-[11px] text-white/40">
                {stableUsdTotal ? `Wadar: ${formatCompactUSD(stableUsdTotal)}` : ""}
              </div>
            </div>

            <div className="divide-y mx-hairline">
              {stableTop.map((s) => {
                const prev = s.circulatingPrevDayUsd;
                const pct =
                  typeof prev === "number" && prev > 0
                    ? ((s.circulatingUsd - prev) / prev) * 100
                    : null;
                return (
                  <div key={s.id} className="flex items-center justify-between gap-4 px-5 py-3">
                    <div className="min-w-0">
                      <div className="mx-headline text-[16px] font-semibold text-white">
                        <span className="mx-clamp-1">{s.name}</span>
                      </div>
                      <div className="mx-mono mt-1 text-[11px] text-white/45">
                        {s.symbol}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="mx-mono text-[12px] font-semibold text-white/80">
                        {formatCompactUSD(s.circulatingUsd)}
                      </div>
                      {typeof pct === "number" ? (
                        <div
                          className={[
                            "mx-mono mt-1 text-[11px] font-semibold",
                            pct < 0 ? "text-red-300" : "text-emerald-300",
                          ].join(" ")}
                        >
                          {formatPct(pct)} (24h)
                        </div>
                      ) : (
                        <div className="mx-mono mt-1 text-[11px] text-white/35"> </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {etfs ? (
            <section className="mx-panel overflow-hidden">
              <div className="border-b mx-hairline px-5 py-4">
                <div className="mx-mono text-[11px] font-semibold tracking-widest text-white/55">
                  BITCOIN ETFS
                </div>
                <div className="mx-headline mt-2 text-[24px] font-semibold text-white">
                  Spot Bitcoin ETFs
                </div>
                <div className="mx-mono mt-2 flex flex-wrap gap-3 text-[11px] text-white/45">
                  <span>
                    Wadar AUM:{" "}
                    <span className="text-white/70">
                      {etfAumTotal ? formatCompactUSD(etfAumTotal) : "—"}
                    </span>
                  </span>
                  <span>
                    BTC holdings:{" "}
                    <span className="text-white/70">
                      {etfBtcTotal ? etfBtcTotal.toLocaleString("en-US") : "—"}
                    </span>
                  </span>
                </div>
              </div>

              <div className="divide-y mx-hairline">
                {etfTop.map((r) => {
                  const aum = parseNum(r.aum_usd);
                  const btc = r.asset_details?.btc_holding;
                  const btcChg = r.asset_details?.btc_change_percent_24h;
                  return (
                    <div key={r.ticker} className="grid grid-cols-[1fr_auto] gap-4 px-5 py-3">
                      <div className="min-w-0">
                        <div className="mx-headline text-[16px] font-semibold text-white">
                          {r.ticker}
                        </div>
                        <div className="mx-mono mt-1 text-[11px] text-white/45">
                          <span className="mx-clamp-1">{r.fund_name}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="mx-mono text-[12px] font-semibold text-white/80">
                          {typeof aum === "number" ? formatCompactUSD(aum) : "—"}
                        </div>
                        <div className="mx-mono mt-1 text-[11px] text-white/45">
                          {typeof btc === "number" ? `${btc.toLocaleString("en-US")} BTC` : ""}
                          {typeof btcChg === "number" ? (
                            <span
                              className={[
                                "ml-2 font-semibold",
                                btcChg < 0 ? "text-red-300" : "text-emerald-300",
                              ].join(" ")}
                            >
                              {formatPct(btcChg)}
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ) : null}
        </section>

        <aside className="space-y-4">
          <section className="mx-panel p-5">
            <div className="mx-mono text-[11px] font-semibold tracking-widest text-white/55">
              TALO
            </div>
            <div className="mt-2 text-[13px] leading-relaxed text-white/70">
              Haddii aad cusub tahay, ka bilow “Baro” si aad u fahanto wallet, amni, iyo
              erayada muhiimka ah. Kadib ku laabo Data si aad u fahanto dhaqdhaqaaqa suuqa.
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Link
                href="/baro"
                className="mx-mono rounded-full border mx-hairline bg-white/[0.02] px-4 py-2 text-[12px] font-semibold text-white/75 hover:bg-white/[0.06] hover:text-white"
              >
                Tag Baro
              </Link>
              <Link
                href="/"
                className="mx-mono rounded-full border mx-hairline bg-white/[0.02] px-4 py-2 text-[12px] font-semibold text-white/75 hover:bg-white/[0.06] hover:text-white"
              >
                Tag Warar
              </Link>
            </div>
          </section>

          <section className="mx-panel p-5">
            <div className="mx-mono text-[11px] font-semibold tracking-widest text-white/55">
              OGAAL
            </div>
            <div className="mt-2 text-[13px] leading-relaxed text-white/70">
              Xogtan waa soo koobid. Mar walba xaqiiji xogta ka hor go&apos;aan maaliyadeed.
            </div>
          </section>
        </aside>
      </div>
    </main>
  );
}
