import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { decodeStoryID, fetchLatest, fetchNewsItemByURL } from "@/lib/news";
import { formatDateUTC, timeAgo } from "@/lib/time";
import { StoryLink } from "@/components/StoryLink";

function cleanFeed(items: Awaited<ReturnType<typeof fetchLatest>>) {
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
      return { ok: true as const, hasLang, lang: hasLang ? maybeLang : null, canonical };
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

  const bestByCanonical = new Map<string, (typeof pruned)[number]>();
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

function displaySection(section?: string) {
  switch (section) {
    case "Suuqyada":
      return "Markets";
    case "Siyaasad & Sharci":
      return "Policy";
    case "Teknoolojiyad":
      return "Tech";
    default:
      return section || "News";
  }
}

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const { id } = await props.params;
  let url = "";
  try {
    url = decodeStoryID(id);
  } catch {
    return { title: "Story not found" };
  }
  const item = await fetchNewsItemByURL(url, "so");
  if (!item) return { title: "Story not found" };

  const title = item.title || "News";
  const description = item.summary || "MxCrypto AI News story";
  return {
    title,
    description,
    alternates: { canonical: `/news/${id}` },
    openGraph: {
      title,
      description,
      type: "article",
      images: item.image_url ? [{ url: item.image_url }] : undefined,
    },
  };
}

export default async function NewsDetailPage(props: PageProps) {
  const { id } = await props.params;
  let url = "";
  try {
    url = decodeStoryID(id);
  } catch {
    notFound();
  }

  const item = await fetchNewsItemByURL(url, "so");
  if (!item) notFound();

  const section = displaySection(item.section).toUpperCase();
  const published = item.published_at;
  const canonical = `/news/${id}`;

  // Minimal JSON-LD for SEO.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: item.title,
    datePublished: published,
    dateModified: published,
    author: item.author
      ? [{ "@type": "Person", name: item.author }]
      : [{ "@type": "Organization", name: item.source || "Wire" }],
    publisher: {
      "@type": "Organization",
      name: "MxCrypto AI News",
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": canonical,
    },
    image: item.image_url ? [item.image_url] : undefined,
    description: item.summary || undefined,
  };

  return (
    <main className="mx-container pt-5 pb-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px] lg:gap-10">
        <article className="min-w-0">
          <div className="mx-mono text-[11px] font-semibold tracking-widest text-[rgb(var(--accent))]">
            {section}
          </div>

          <h1 className="mx-headline mt-3 text-[38px] font-semibold leading-[1.03] text-white md:text-[56px]">
            <span className="mx-clamp-3">{item.title}</span>
          </h1>

          <div className="mx-mono mt-4 flex flex-wrap items-center gap-2 text-[12px] text-white/45">
            <span className="text-white/65">{formatDateUTC(published)} UTC</span>
            <span className="text-white/25">•</span>
            <span>{item.source || "Wire"}</span>
            {item.reading_time ? (
              <>
                <span className="text-white/25">•</span>
                <span>{item.reading_time}</span>
              </>
            ) : null}
          </div>

          {item.image_url ? (
            <div className="mt-6">
              <div className="relative aspect-[16/9] w-full overflow-hidden rounded-[14px] border mx-hairline bg-black">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.image_url}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover"
                  loading="eager"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/75 to-transparent" />
              </div>
            </div>
          ) : null}

          {item.summary ? (
            <p className="mt-6 text-[18px] leading-relaxed text-white/75">
              {item.summary}
            </p>
          ) : null}

          {item.content ? (
            <div className="mt-6 max-w-none space-y-4">
              {item.content.split("\n").map((p, idx) => {
                const t = p.trim();
                if (!t) return null;
                return (
                  <p
                    key={idx}
                    className="text-[16px] leading-relaxed text-white/80"
                  >
                    {t}
                  </p>
                );
              })}
            </div>
          ) : (
            <div className="mt-6 mx-panel p-4">
              <div className="mx-mono text-[12px] text-white/55">
                Content not available in the feed.
              </div>
            </div>
          )}

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="mx-mono rounded-full border mx-hairline bg-white/[0.02] px-4 py-2 text-[12px] font-semibold text-white/70 hover:bg-white/[0.06] hover:text-white"
            >
              Open Original ↗
            </a>
            <Link
              href="/"
              className="mx-mono rounded-full border mx-hairline bg-white/[0.02] px-4 py-2 text-[12px] font-semibold text-white/70 hover:bg-white/[0.06] hover:text-white"
            >
              Back to Feed
            </Link>
          </div>
        </article>

        <aside className="space-y-4">
          <section className="mx-panel p-4">
            <div className="mx-mono text-[11px] font-semibold tracking-widest text-white/55">
              UPDATED
            </div>
            <div className="mt-2 text-[13px] leading-relaxed text-white/70">
              {timeAgo(published)}.
            </div>
          </section>

          <section className="mx-panel overflow-hidden">
            <div className="border-b mx-hairline px-4 py-3">
              <div className="mx-mono text-[11px] font-semibold tracking-widest text-white/55">
                MORE NEWS
              </div>
            </div>
            <MoreNews currentUrl={item.url} currentSection={item.section} />
          </section>
        </aside>
      </div>
    </main>
  );
}

async function MoreNews(props: { currentUrl: string; currentSection?: string }) {
  const raw = await fetchLatest(36, "so");
  const items = cleanFeed(raw).filter((x) => x.url !== props.currentUrl);

  const sameSection = props.currentSection
    ? items.filter((x) => x.section === props.currentSection).slice(0, 6)
    : [];
  const fallback = items.filter((x) => x.section !== props.currentSection).slice(0, 6);
  const list = sameSection.length ? sameSection : fallback;

  return (
    <div className="divide-y mx-hairline">
      {list.map((it) => (
        <div key={it.id || it.url}>
          <StoryLink item={it} dense showThumb />
        </div>
      ))}
    </div>
  );
}
