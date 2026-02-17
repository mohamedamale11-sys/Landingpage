import { getRequestOrigin } from "@/lib/site";

export type WireItem = {
  id: string;
  title: string;
  url: string;
  summary?: string;
  content?: string;
  author?: string;
  section?: string;
  tags?: string[];
  image_url?: string;
  highlights?: string[];
  sentiment?: string;
  published_at: string;
  source: string;
  reading_time?: string;
};

type LatestResponse = {
  ok: boolean;
  items?: WireItem[];
  has_more?: boolean;
  next_offset?: number;
  offset?: number;
  limit?: number;
  total?: number;
  error?: string;
};

const BLOCKED_NEWS_NEEDLES = [
  "privacy-policy",
  "terms-and-conditions",
  "terms-of-use",
  "terms-of-service",
  "cookie-policy",
  "/privacy/",
  "/terms/",
  "xogta gaarka ah",
  "shuruudaha ilaalinta",
  "shuruudaha isticmaalka",
  "shuruudaha adeegsiga",
  "qawaaniinta isticmaalka",
  "qawaaniinta adeegsiga",
  "privacy policy",
  "terms and conditions",
  "terms of use",
  "terms of service",
  "cookie policy",
];

function isBlockedNewsItem(it: WireItem) {
  const blob = [
    it.url || "",
    it.title || "",
    it.summary || "",
    it.content || "",
    it.section || "",
    (it.tags || []).join(" "),
  ]
    .join("\n")
    .toLowerCase();
  return BLOCKED_NEWS_NEEDLES.some((n) => blob.includes(n));
}

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function countWord(text: string, word: string) {
  const re = new RegExp(`\\b${escapeRegExp(word)}\\b`, "g");
  return (text.match(re) || []).length;
}

function scoreSomaliText(text: string) {
  const t = (text || "").toLowerCase();
  if (!t.trim()) return 0;

  let score = 0;

  // Common Somali function words and phrases (lightweight heuristic).
  const strongPhrases: Array<[string, number]> = [
    ["ku saabsan", 4],
    ["la xiriira", 4],
    ["si ay", 3],
  ];
  for (const [p, w] of strongPhrases) {
    if (t.includes(p)) score += w;
  }

  const words: Array<[string, number]> = [
    ["oo", 2],
    ["iyo", 2],
    ["ayaa", 3],
    ["waxaa", 3],
    ["inay", 2],
    ["u", 1],
    ["ku", 1],
    ["ka", 1],
    ["la", 1],
    ["leh", 2],
    ["sida", 2],
    ["marka", 2],
    ["kadib", 2],
    ["kaddib", 2],
    ["shirkadda", 2],
    ["madaxweynaha", 2],
    ["hay'adda", 2],
    ["suuqa", 2],
    ["qiimaha", 2],
    ["maalgashi", 2],
    ["dhaqaale", 2],
    ["sharci", 2],
    ["siyaasad", 2],
  ];
  for (const [w, weight] of words) {
    const n = countWord(t, w);
    if (n) score += n * weight;
  }

  // Penalize very English-looking strings.
  const englishStop: Array<[string, number]> = [
    ["the", 2],
    ["and", 1],
    ["to", 1],
    ["of", 1],
    ["in", 1],
    ["for", 1],
    ["with", 1],
    ["on", 1],
    ["as", 1],
    ["after", 1],
    ["before", 1],
    ["amid", 1],
    ["says", 1],
  ];
  for (const [w, weight] of englishStop) {
    const n = countWord(t, w);
    if (n) score -= n * weight;
  }

  return score;
}

export function scoreSomaliWireItem(it: WireItem) {
  const title = it.title || "";
  const summary = it.summary || "";
  const rt = (it.reading_time || "").toLowerCase();

  let s = 0;
  s += scoreSomaliText(title) * 3;
  s += scoreSomaliText(summary);
  if (rt.includes("daqiiqo") || rt.includes("saac") || rt.includes("ka yar")) s += 3;
  return s;
}

export function isSomaliWireItem(it: WireItem) {
  return scoreSomaliWireItem(it) >= 4;
}

export function cleanWireItems(
  items: WireItem[],
  opts?: { onlySomali?: boolean },
) {
  // MVP guard:
  // - remove obvious non-target translations (Korean/Filipino)
  // - remove non-Latin scripts that make the feed look broken (CJK/Hangul/Cyrillic)
  // - de-dupe CoinDesk translation variants by preferring Somali-looking text when possible
  const badScript = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uac00-\ud7af\u0400-\u04ff]/;

  function urlInfo(raw: string) {
    try {
      const u = new URL(raw);
      const parts = u.pathname.split("/").filter(Boolean);
      const maybeLang = parts[0] || "";
      const hasLang = /^[a-z]{2,3}$/.test(maybeLang);
      const canonical = hasLang
        ? `${u.origin}/${parts.slice(1).join("/")}`
        : `${u.origin}${u.pathname}`;
      return {
        ok: true as const,
        hasLang,
        lang: hasLang ? maybeLang : null,
        canonical,
      };
    } catch {
      return { ok: false as const, hasLang: false, lang: null, canonical: raw };
    }
  }

  const pruned = items.filter((x) => {
    const title = x.title || "";
    if (!x.url || !title) return false;
    if (isBlockedNewsItem(x)) return false;
    if (badScript.test(title)) return false;
    const ui = urlInfo(x.url);
    if (ui.ok && (ui.lang === "ko" || ui.lang === "fil")) return false;
    return true;
  });

  const bestByCanonical = new Map<string, WireItem>();
  for (const it of pruned) {
    const ui = urlInfo(it.url);
    const key = ui.canonical;
    const existing = bestByCanonical.get(key);
    if (!existing) {
      bestByCanonical.set(key, it);
      continue;
    }

    const a = existing;
    const b = it;
    const sa = scoreSomaliWireItem(a);
    const sb = scoreSomaliWireItem(b);
    if (sb > sa) {
      bestByCanonical.set(key, it);
      continue;
    }
    if (sb < sa) continue;

    // Tie-break: prefer URLs without a locale prefix.
    const ua = urlInfo(a.url);
    const ub = urlInfo(b.url);
    const baseScore = (u: ReturnType<typeof urlInfo>) => (u.ok && !u.hasLang ? 1 : 0);
    if (baseScore(ub) > baseScore(ua)) bestByCanonical.set(key, it);
  }

  function sanitizeTitle(raw: string) {
    let t = (raw || "").trim();
    // Remove visible upstream branding from headlines (keep it "MxCrypto"-native).
    t = t.replace(/^CoinDesk\s+20\s+performance\s+update:\s*/i, "Cusboonaysiin Indhisyada: ");
    return t;
  }

  const out = [...bestByCanonical.values()].map((it) => {
    const nextTitle = sanitizeTitle(it.title || "");
    if (nextTitle !== (it.title || "")) return { ...it, title: nextTitle };
    return it;
  });
  out.sort((a, b) => {
    const ta = Date.parse(a.published_at || "");
    const tb = Date.parse(b.published_at || "");
    const na = Number.isFinite(ta) ? ta : 0;
    const nb = Number.isFinite(tb) ? tb : 0;
    return nb - na;
  });
  if (!opts?.onlySomali) return out;

  // Only show Somali-looking text by default. Keep it conservative: if we filter too hard,
  // the homepage may look empty, so callers can decide to fall back.
  return out.filter(isSomaliWireItem);
}

export function encodeStoryID(url: string) {
  return Buffer.from(url, "utf8").toString("base64url");
}

export function decodeStoryID(id: string) {
  return Buffer.from(id, "base64url").toString("utf8");
}

async function getSiteBase(): Promise<string> {
  const origin = await getRequestOrigin();
  if (origin) return origin;
  const env = process.env.SITE_URL;
  if (env && env.trim()) return env.replace(/\/+$/, "");
  // Build/runtime fallback for production deployments.
  return "https://www.mxcrypto.net";
}

export async function fetchLatestPage(props?: {
  limit?: number;
  offset?: number;
  lang?: string;
}): Promise<{
  items: WireItem[];
  hasMore: boolean;
  nextOffset: number | null;
  offset: number;
  limit: number;
  total?: number;
}> {
  try {
    const limit = Math.max(1, Math.min(200, props?.limit ?? 60));
    const offset = Math.max(0, props?.offset ?? 0);
    const base = await getSiteBase();
    const u = new URL(`${base}/api/news/latest`);
    u.searchParams.set("limit", String(limit));
    u.searchParams.set("offset", String(offset));
    if (props?.lang) u.searchParams.set("lang", props.lang);

    const res = await fetch(u.toString(), { cache: "no-store" });
    if (!res.ok) {
      return { items: [], hasMore: false, nextOffset: null, offset, limit };
    }
    const data = (await res.json()) as LatestResponse;
    return {
      items: data.items ?? [],
      hasMore: Boolean(data.has_more),
      nextOffset:
        typeof data.next_offset === "number" ? data.next_offset : null,
      offset: typeof data.offset === "number" ? data.offset : offset,
      limit: typeof data.limit === "number" ? data.limit : limit,
      total: typeof data.total === "number" ? data.total : undefined,
    };
  } catch {
    return { items: [], hasMore: false, nextOffset: null, offset: 0, limit: 60 };
  }
}

export async function fetchLatest(limit = 60, lang?: string): Promise<WireItem[]> {
  const page = await fetchLatestPage({ limit, lang });
  return page.items;
}

export async function fetchNewsItemByURL(url: string, lang?: string): Promise<WireItem | null> {
  try {
    const base = await getSiteBase();
    const u = new URL(`${base}/api/news/item`);
    u.searchParams.set("url", url);
    if (lang) u.searchParams.set("lang", lang);

    const res = await fetch(u.toString(), { cache: "no-store" });
    if (!res.ok) return null;
    const data = (await res.json()) as { ok: boolean; item?: WireItem };
    return data.item ?? null;
  } catch {
    return null;
  }
}
