import { cleanWireItems, encodeStoryID, fetchLatestPage } from "@/lib/news";

function esc(v: string) {
  return (v || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export async function GET() {
  const base = (process.env.SITE_URL || "https://www.mxcrypto.net").replace(/\/+$/, "");
  let rows: Awaited<ReturnType<typeof fetchLatestPage>>["items"] = [];
  try {
    const page = await fetchLatestPage({ limit: 120, offset: 0, lang: "so" });
    rows = cleanWireItems(page.items);
  } catch {
    rows = [];
  }

  const items = rows
    .slice(0, 100)
    .map((it) => {
      const link = `${base}/news/${encodeStoryID(it.url)}`;
      const pubDate = new Date(it.published_at || Date.now()).toUTCString();
      const title = esc(it.title || "War cusub oo crypto ah");
      const desc = esc(it.summary || it.content || "Wararka crypto ee af-Soomaali.");
      return [
        "<item>",
        `<title>${title}</title>`,
        `<link>${esc(link)}</link>`,
        `<guid>${esc(link)}</guid>`,
        `<pubDate>${esc(pubDate)}</pubDate>`,
        `<description>${desc}</description>`,
        "</item>",
      ].join("");
    })
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>MxCrypto - Wararka Crypto Somali</title>
    <link>${esc(base)}</link>
    <description>Wararka Bitcoin, Ethereum, iyo suuqa crypto ee af-Soomaali.</description>
    <language>so</language>
    ${items}
  </channel>
</rss>`;

  return new Response(xml, {
    status: 200,
    headers: {
      "content-type": "application/rss+xml; charset=utf-8",
      "cache-control": "public, s-maxage=900, stale-while-revalidate=3600",
    },
  });
}

