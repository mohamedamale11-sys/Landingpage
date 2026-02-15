export type FearGreed = {
  value: number;
  classification: string;
  updatedAtMs: number | null;
};

type FngResponse = {
  data?: Array<{
    value?: string;
    value_classification?: string;
    timestamp?: string;
  }>;
};

export async function fetchFearGreed(): Promise<FearGreed | null> {
  const u = new URL("https://api.alternative.me/fng/");
  u.searchParams.set("limit", "1");
  u.searchParams.set("format", "json");

  try {
    const res = await fetch(u.toString(), { next: { revalidate: 600 } });
    if (!res.ok) return null;
    const data = (await res.json()) as FngResponse;
    const row = data.data?.[0];
    if (!row) return null;

    const value = Number.parseInt(row.value || "", 10);
    if (!Number.isFinite(value)) return null;

    const ts = row.timestamp ? Number.parseInt(row.timestamp, 10) : NaN;
    return {
      value,
      classification: row.value_classification || "Sentiment",
      updatedAtMs: Number.isFinite(ts) ? ts * 1000 : null,
    };
  } catch {
    return null;
  }
}

