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

export function cleanWireItems(items: WireItem[]) {
  // MVP guard:
  // - remove obvious non-target translations (Korean/Filipino)
  // - remove non-Latin scripts that make the feed look broken (CJK/Hangul/Cyrillic)
  // - de-dupe CoinDesk translation variants by preferring the non-prefixed URL
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
    const a = urlInfo(existing.url);
    const b = ui;
    const score = (i: ReturnType<typeof urlInfo>) => (i.ok && !i.hasLang ? 10 : 0);
    if (score(b) > score(a)) bestByCanonical.set(key, it);
  }

  return [...bestByCanonical.values()];
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
  // Fallback for build time.
  return "http://localhost:3000";
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

    const res = await fetch(u.toString(), { next: { revalidate: 60 } });
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

    const res = await fetch(u.toString(), { next: { revalidate: 300 } });
    if (!res.ok) return null;
    const data = (await res.json()) as { ok: boolean; item?: WireItem };
    return data.item ?? null;
  } catch {
    return null;
  }
}
