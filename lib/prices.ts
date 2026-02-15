export type PriceItem = {
  id: string;
  sym: string;
  priceUsd: number;
  change24hPct: number | null;
  updatedAtMs: number | null;
};

const COINS: Array<{ id: string; sym: string }> = [
  { id: "bitcoin", sym: "BTC" },
  { id: "ethereum", sym: "ETH" },
  { id: "solana", sym: "SOL" },
  { id: "ripple", sym: "XRP" },
  { id: "binancecoin", sym: "BNB" },
];

type CoinGeckoSimplePrice = Record<
  string,
  { usd?: number; usd_24h_change?: number; last_updated_at?: number }
>;

export async function fetchTopPrices(): Promise<PriceItem[]> {
  const ids = COINS.map((c) => c.id).join(",");
  const u = new URL("https://api.coingecko.com/api/v3/simple/price");
  u.searchParams.set("ids", ids);
  u.searchParams.set("vs_currencies", "usd");
  u.searchParams.set("include_24hr_change", "true");
  u.searchParams.set("include_last_updated_at", "true");

  try {
    const res = await fetch(u.toString(), { next: { revalidate: 30 } });
    if (!res.ok) return [];
    const data = (await res.json()) as CoinGeckoSimplePrice;

    const out: PriceItem[] = [];
    for (const c of COINS) {
      const row = data[c.id];
      if (!row || typeof row.usd !== "number") continue;
      out.push({
        id: c.id,
        sym: c.sym,
        priceUsd: row.usd,
        change24hPct: typeof row.usd_24h_change === "number" ? row.usd_24h_change : null,
        updatedAtMs:
          typeof row.last_updated_at === "number" ? row.last_updated_at * 1000 : null,
      });
    }
    return out;
  } catch {
    return [];
  }
}

