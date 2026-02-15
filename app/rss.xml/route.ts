import { cleanWireItems, fetchLatest, encodeStoryID } from "@/lib/news";

function escapeXML(s: string) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export async function GET() {
  const items = cleanWireItems(await fetchLatest(60, "so"), { onlySomali: true });
  const base =
    process.env.SITE_URL && process.env.SITE_URL.trim() !== ""
      ? process.env.SITE_URL.replace(/\/+$/, "")
      : "";

  const siteTitle = "MxCrypto | Wararka Crypto";
  const siteURL = base || "";

  const xmlItems = items
    .slice(0, 50)
    .map((it) => {
      const id = encodeStoryID(it.url);
      const link = siteURL ? `${siteURL}/news/${id}` : `/news/${id}`;
      const pubDate = it.published_at ? new Date(it.published_at).toUTCString() : new Date().toUTCString();
      const desc = escapeXML(it.summary || "");
      return [
        "<item>",
        `<title>${escapeXML(it.title || "Warar")}</title>`,
        `<link>${escapeXML(link)}</link>`,
        `<guid isPermaLink="false">${escapeXML(it.url || link)}</guid>`,
        `<pubDate>${escapeXML(pubDate)}</pubDate>`,
        desc ? `<description>${desc}</description>` : "",
        "</item>",
      ]
        .filter(Boolean)
        .join("");
    })
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXML(siteTitle)}</title>
    <link>${escapeXML(siteURL || "/")}</link>
    <description>${escapeXML("Wararka crypto ee af-Soomaali, degdeg oo nadiif ah.")}</description>
    ${xmlItems}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "content-type": "application/rss+xml; charset=utf-8",
      "cache-control": "public, max-age=0, s-maxage=300",
    },
  });
}
