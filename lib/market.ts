export type GlobalMarketSnapshot = {
  totalMarketCapUsd: number;
  totalVolumeUsd: number;
  btcDominancePct: number | null;
  ethDominancePct: number | null;
  marketCapChange24hPct: number | null;
  updatedAtIso: string | null;
};

type CoinGeckoGlobalResponse = {
  data?: {
    total_market_cap?: Record<string, number>;
    total_volume?: Record<string, number>;
    market_cap_percentage?: Record<string, number>;
    market_cap_change_percentage_24h_usd?: number;
    updated_at?: number;
  };
};

export async function fetchGlobalMarketSnapshot(): Promise<GlobalMarketSnapshot | null> {
  try {
    const res = await fetch("https://api.coingecko.com/api/v3/global", {
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    const json = (await res.json()) as CoinGeckoGlobalResponse;
    const d = json.data;
    if (!d) return null;

    const totalMarketCapUsd = d.total_market_cap?.usd;
    const totalVolumeUsd = d.total_volume?.usd;
    if (typeof totalMarketCapUsd !== "number" || typeof totalVolumeUsd !== "number") {
      return null;
    }

    const btcDominancePct =
      typeof d.market_cap_percentage?.btc === "number" ? d.market_cap_percentage.btc : null;
    const ethDominancePct =
      typeof d.market_cap_percentage?.eth === "number" ? d.market_cap_percentage.eth : null;

    const updatedAtIso =
      typeof d.updated_at === "number" ? new Date(d.updated_at * 1000).toISOString() : null;

    return {
      totalMarketCapUsd,
      totalVolumeUsd,
      btcDominancePct,
      ethDominancePct,
      marketCapChange24hPct:
        typeof d.market_cap_change_percentage_24h_usd === "number"
          ? d.market_cap_change_percentage_24h_usd
          : null,
      updatedAtIso,
    };
  } catch {
    return null;
  }
}

