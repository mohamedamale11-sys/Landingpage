import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base =
    process.env.SITE_URL && process.env.SITE_URL.trim() !== ""
      ? process.env.SITE_URL.replace(/\/+$/, "")
      : "";
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/api/", "/_next/"] },
      { userAgent: "GPTBot", allow: "/" },
    ],
    sitemap: base
      ? [`${base}/sitemap.xml`, `${base}/news-sitemap.xml`]
      : ["/sitemap.xml", "/news-sitemap.xml"],
    host: base || undefined,
  };
}
