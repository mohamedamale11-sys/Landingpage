import { cleanWireItems, encodeStoryID, type WireItem } from "@/lib/news";

type LatestResponse = {
  ok?: boolean;
  items?: Array<{
    id: string;
    url: string;
    title: string;
    published_at: string;
    source?: string;
  }>;
  has_more?: boolean;
  next_offset?: number;
};

const BACKEND = (
  process.env.NEWS_API_BASE || "https://mxcrypto-backend-1.onrender.com"
).replace(/\/+$/, "");
const SITE = (process.env.SITE_URL || "https://www.mxcrypto.net").replace(/\/+$/, "");

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

async function fetchLatestBatch(limit: number, offset: number) {
  const u = new URL(`${BACKEND}/api/news/latest`);
  u.searchParams.set("limit", String(limit));
  u.searchParams.set("offset", String(offset));
  u.searchParams.set("lang", "so");

  const res = await fetch(u.toString(), {
    headers: { accept: "application/json" },
    next: { revalidate: 900 },
  });
  if (!res.ok) return { items: [], hasMore: false, nextOffset: null };
  const data = (await res.json()) as LatestResponse;
  return {
    items: data.items || [],
    hasMore: Boolean(data.has_more),
    nextOffset: typeof data.next_offset === "number" ? data.next_offset : null,
  };
}

export async function GET() {
  const rows: NonNullable<LatestResponse["items"]> = [];
  let offset = 0;
  const limit = 200;

  try {
    for (let i = 0; i < 5; i++) {
      const page = await fetchLatestBatch(limit, offset);
      if (!page.items.length) break;
      rows.push(...page.items);
      if (!page.hasMore || page.nextOffset === null) break;
      offset = page.nextOffset;
    }
  } catch {
    // Return minimal empty news sitemap if backend is unavailable.
  }

  const feedItems: WireItem[] = rows.map((x) => ({
    id: x.id || x.url,
    title: x.title || "",
    url: x.url,
    published_at: x.published_at || "",
    source: x.source || "MxCrypto",
    summary: "",
    content: "",
    author: "",
    section: "",
    tags: [],
    image_url: "",
    highlights: [],
    sentiment: "",
    reading_time: "",
  }));
  const clean = cleanWireItems(feedItems);
  const cutoffMs = Date.now() - 2 * 24 * 60 * 60 * 1000; // Google News: last 2 days
  const latest = clean
    .filter((x) => {
      const ts = Date.parse(x.published_at || "");
      return Number.isFinite(ts) && ts >= cutoffMs;
    })
    .slice(0, 1000);

  const urls = latest
    .map((it) => {
      const loc = `${SITE}/news/${encodeStoryID(it.url)}`;
      const pubDate = new Date(it.published_at).toISOString();
      const title = escapeXml((it.title || "").slice(0, 220));
      return [
        "<url>",
        `<loc>${escapeXml(loc)}</loc>`,
        "<news:news>",
        "<news:publication>",
        "<news:name>MxCrypto</news:name>",
        "<news:language>so</news:language>",
        "</news:publication>",
        `<news:publication_date>${pubDate}</news:publication_date>`,
        `<news:title>${title}</news:title>`,
        "</news:news>",
        "</url>",
      ].join("");
    })
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">${urls}</urlset>`;

  return new Response(xml, {
    status: 200,
    headers: {
      "content-type": "application/xml; charset=utf-8",
      "cache-control": "public, s-maxage=900, stale-while-revalidate=3600",
    },
  });
}
