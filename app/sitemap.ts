import type { MetadataRoute } from "next";
import { cleanWireItems, fetchLatest, encodeStoryID } from "@/lib/news";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let items: Awaited<ReturnType<typeof fetchLatest>> = [];
  try {
    items = cleanWireItems(await fetchLatest(120, "so"));
  } catch {
    // During `next build`, the backend might not be running.
    // Return a minimal sitemap so the build never fails.
    items = [];
  }
  const now = new Date();

  const base =
    process.env.SITE_URL && process.env.SITE_URL.trim() !== ""
      ? process.env.SITE_URL.replace(/\/+$/, "")
      : "http://localhost:3000";

  const url = (p: string) => (base ? `${base}${p}` : p);

  const out: MetadataRoute.Sitemap = [
    {
      url: url("/"),
      lastModified: now,
      changeFrequency: "hourly",
      priority: 1,
    },
    {
      url: url("/data"),
      lastModified: now,
      changeFrequency: "hourly",
      priority: 0.8,
    },
    {
      url: url("/baro"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: url("/ku-saabsan"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: url("/ka-dhaafid"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: url("/asturnaanta"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.2,
    },
    {
      url: url("/xeerar"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.2,
    },
  ];

  for (const it of items.slice(0, 100)) {
    const id = encodeStoryID(it.url);
    out.push({
      url: url(`/news/${id}`),
      lastModified: new Date(it.published_at || now),
      changeFrequency: "daily",
      priority: 0.7,
    });
  }

  return out;
}
