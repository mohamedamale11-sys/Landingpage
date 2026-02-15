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
