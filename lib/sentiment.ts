export type SentimentMeta = {
  label: string;
  className: string;
};

export type FearGreedValue = {
  value: number;
  classification: string;
  timestamp?: string;
};

function hasAny(value: string, needles: string[]) {
  return needles.some((n) => value.includes(n));
}

export function getSentimentMeta(raw?: string | null): SentimentMeta | null {
  const s = (raw || "").trim().toLowerCase();
  if (!s) return null;

  if (hasAny(s, ["war fiican", "fiican", "positive", "bullish", "up"])) {
    return { label: "War fiican", className: "text-emerald-400/95" };
  }
  if (hasAny(s, ["war xun", "xun", "negative", "bearish", "down"])) {
    return { label: "War xun", className: "text-red-400/95" };
  }
  if (hasAny(s, ["dhexdhexaad", "neutral", "mixed"])) {
    return { label: "Dhexdhexaad", className: "text-white/60" };
  }

  return null;
}

export async function fetchFearGreed(): Promise<FearGreedValue | null> {
  try {
    const res = await fetch("https://api.alternative.me/fng/?limit=1&format=json", {
      next: { revalidate: 900 },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      data?: Array<{
        value?: string;
        value_classification?: string;
        timestamp?: string;
      }>;
    };
    const first = data?.data?.[0];
    if (!first) return null;

    const n = Number.parseInt(first.value || "", 10);
    if (!Number.isFinite(n)) return null;

    return {
      value: n,
      classification: first.value_classification || "Neutral",
      timestamp: first.timestamp,
    };
  } catch {
    return null;
  }
}
