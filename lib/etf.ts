export type BitcoinEtfRow = {
  ticker: string;
  fund_name: string;
  region: string;
  fund_type: string;
  primary_exchange: string;
  aum_usd: string;
  volume_usd: number | null;
  price_change_percent: number | null;
  asset_details?: {
    net_asset_value_usd?: number;
    premium_discount_percent?: number;
    btc_holding?: number;
    btc_change_24h?: number;
    btc_change_percent_24h?: number;
    update_date?: string;
  };
  update_timestamp: number | null;
};

type CoinGlassResp<T> = { code?: string; msg?: string; data?: T };

export async function fetchBitcoinEtfList(): Promise<BitcoinEtfRow[] | null> {
  const key = process.env.COINGLASS_API_KEY;
  if (!key || !key.trim()) return null;

  try {
    const res = await fetch("https://open-api-v4.coinglass.com/api/etf/bitcoin/list", {
      headers: { "cg-api-key": key.trim(), accept: "application/json" },
      next: { revalidate: 1800 },
    });
    if (!res.ok) return null;
    const json = (await res.json()) as CoinGlassResp<BitcoinEtfRow[]>;
    if (json.code !== "0" || !Array.isArray(json.data)) return null;
    return json.data;
  } catch {
    return null;
  }
}

