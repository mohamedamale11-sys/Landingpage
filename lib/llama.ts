export type DefiTvlPoint = { tsSec: number; tvlUsd: number };

type LlamaTvlRow = { date: string; totalLiquidityUSD: number };

export async function fetchDefiTvlHistory(days = 30): Promise<DefiTvlPoint[]> {
  try {
    const res = await fetch("https://api.llama.fi/charts", { next: { revalidate: 600 } });
    if (!res.ok) return [];
    const raw = (await res.json()) as LlamaTvlRow[];
    if (!Array.isArray(raw)) return [];

    const points = raw
      .map((r) => {
        const ts = Number.parseInt(String(r.date), 10);
        const tvl = r.totalLiquidityUSD;
        if (!Number.isFinite(ts) || typeof tvl !== "number") return null;
        return { tsSec: ts, tvlUsd: tvl };
      })
      .filter(Boolean) as DefiTvlPoint[];

    if (!points.length) return [];
    return points.slice(-Math.max(7, days));
  } catch {
    return [];
  }
}

export type StablecoinRow = {
  id: string;
  name: string;
  symbol: string;
  pegType: string;
  circulatingUsd: number;
  circulatingPrevDayUsd: number | null;
};

type StablecoinsResponse = {
  peggedAssets?: Array<{
    id?: string;
    name?: string;
    symbol?: string;
    pegType?: string;
    circulating?: { peggedUSD?: number };
    circulatingPrevDay?: { peggedUSD?: number };
  }>;
};

export async function fetchStablecoins(): Promise<StablecoinRow[]> {
  try {
    const res = await fetch("https://stablecoins.llama.fi/stablecoins", {
      next: { revalidate: 900 },
    });
    if (!res.ok) return [];
    const json = (await res.json()) as StablecoinsResponse;
    const assets = json.peggedAssets;
    if (!Array.isArray(assets)) return [];

    const out: StablecoinRow[] = [];
    for (const a of assets) {
      const id = String(a.id || "");
      const name = String(a.name || "");
      const symbol = String(a.symbol || "");
      const pegType = String(a.pegType || "");
      const circulatingUsd = a.circulating?.peggedUSD;
      if (!id || !name || !symbol || typeof circulatingUsd !== "number") continue;
      out.push({
        id,
        name,
        symbol,
        pegType,
        circulatingUsd,
        circulatingPrevDayUsd:
          typeof a.circulatingPrevDay?.peggedUSD === "number" ? a.circulatingPrevDay.peggedUSD : null,
      });
    }

    return out;
  } catch {
    return [];
  }
}

