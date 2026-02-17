import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cleanWireItems, decodeStoryID, fetchLatest, fetchNewsItemByURL } from "@/lib/news";
import { formatDateUTC, timeAgo } from "@/lib/time";
import { StoryLink } from "@/components/StoryLink";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const { id } = await props.params;
  const siteBase = (process.env.SITE_URL || "http://localhost:3000").replace(/\/+$/, "");
  let url = "";
  try {
    url = decodeStoryID(id);
  } catch {
    return { title: "Qoraal lama helin" };
  }
  const item = await fetchNewsItemByURL(url, "so");
  if (!item) return { title: "Qoraal lama helin" };

  const title = item.title || "Warar";
  const description = item.summary || "Wararka MxCrypto";
  const canonical = `/news/${id}`;
  return {
    title,
    description,
    alternates: { canonical },
    authors: [{ name: "MxCrypto" }],
    publisher: "MxCrypto",
    openGraph: {
      title,
      description,
      type: "article",
      url: `${siteBase}${canonical}`,
      images: item.image_url ? [{ url: item.image_url }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: item.image_url ? [item.image_url] : undefined,
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

  const published = item.published_at;
  const siteBase = (process.env.SITE_URL || "http://localhost:3000").replace(/\/+$/, "");
  const canonical = `${siteBase}/news/${id}`;
  const sentimentRaw = (item.sentiment || "").toLowerCase().trim();
  const sentiment =
    sentimentRaw.includes("fiican")
      ? { label: "War fiican", className: "text-emerald-400/90" }
      : sentimentRaw.includes("xun")
        ? { label: "War xun", className: "text-red-400/90" }
        : sentimentRaw.includes("dhexdhexaad")
          ? { label: "Dhexdhexaad", className: "text-white/55" }
          : null;

  // Minimal JSON-LD for SEO.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: item.title,
    datePublished: published,
    dateModified: published,
    author: item.author
      ? [{ "@type": "Person", name: item.author }]
      : [{ "@type": "Organization", name: "MxCrypto" }],
    publisher: {
      "@type": "Organization",
      name: "MxCrypto",
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": canonical,
    },
    image: item.image_url ? [item.image_url] : undefined,
    description: item.summary || undefined,
  };
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Warar",
        item: `${siteBase}/`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: item.title,
        item: canonical,
      },
    ],
  };

  return (
    <main className="mx-container pt-5 pb-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px] lg:gap-10">
        <article className="min-w-0">
          <div className="mx-mono text-[11px] font-semibold tracking-widest text-[rgb(var(--accent))]">
            MXCRYPTO
          </div>

          <h1 className="mx-headline mt-3 text-[38px] font-semibold leading-[1.03] text-white md:text-[56px]">
            <span className="mx-clamp-3">{item.title}</span>
          </h1>

          <div className="mx-mono mt-4 flex flex-wrap items-center gap-2 text-[12px] text-white/45">
            <span className="text-white/65">{formatDateUTC(published)} UTC</span>
            {item.reading_time ? (
              <>
                <span className="text-white/25">•</span>
                <span>{item.reading_time}</span>
              </>
            ) : null}
            {sentiment ? (
              <>
                <span className="text-white/25">•</span>
                <span className={["font-semibold", sentiment.className].join(" ")}>
                  {sentiment.label}
                </span>
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
                Qoraalka buuxa lama helin.
              </div>
            </div>
          )}

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/"
              className="mx-mono rounded-full border mx-hairline bg-white/[0.02] px-4 py-2 text-[12px] font-semibold text-white/70 hover:bg-white/[0.06] hover:text-white"
            >
              Ku noqo Wararka
            </Link>
          </div>
        </article>

        <aside className="space-y-4">
          <section className="mx-panel p-4">
            <div className="mx-mono text-[11px] font-semibold tracking-widest text-white/55">
              LA CUSBOONEYSIYAY
            </div>
            <div className="mt-2 text-[13px] leading-relaxed text-white/70">
              {timeAgo(published)}.
            </div>
          </section>

          <section className="mx-panel overflow-hidden">
            <div className="border-b mx-hairline px-4 py-3">
              <div className="mx-mono text-[11px] font-semibold tracking-widest text-white/55">
                WARAR DHEERAAD AH
              </div>
            </div>
            <MoreNews currentUrl={item.url} />
          </section>
        </aside>
      </div>
    </main>
  );
}

async function MoreNews(props: { currentUrl: string }) {
  const raw = await fetchLatest(36, "so");
  const cleaned = cleanWireItems(raw);
  // Backend enforces Somali; frontend keeps only lightweight “broken script” guard via cleanWireItems.
  const items = cleaned.filter((x) => x.url !== props.currentUrl);

  const list = items.slice(0, 6);

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
