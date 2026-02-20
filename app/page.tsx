import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { StoryLink } from "@/components/StoryLink";
import { cleanWireItems, encodeStoryID, fetchLatestPage } from "@/lib/news";
import { timeAgo } from "@/lib/time";
import { COURSE_HREF, EXCHANGE_PARTNERS } from "@/lib/constants";
import { getSentimentMeta } from "@/lib/sentiment";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function firstStr(v: string | string[] | undefined): string {
  return Array.isArray(v) ? v[0] ?? "" : v ?? "";
}

function normalize(s: string) {
  return s.toLowerCase();
}

function formatTimelineStamp(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const day = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(date);
  const clock = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })
    .format(date)
    .toLowerCase();

  return `${day}, ${clock}`;
}

function hrefWith(params: URLSearchParams, patch: Record<string, string | null>) {
  const next = new URLSearchParams(params.toString());
  for (const [k, v] of Object.entries(patch)) {
    if (v === null || v === "") next.delete(k);
    else next.set(k, v);
  }
  // MVP: one unified feed. Ignore any legacy section filters.
  next.delete("section");
  // When changing query, reset pagination.
  if ("q" in patch) next.delete("offset");
  const qs = next.toString();
  return qs ? `/?${qs}` : "/";
}

function buildPageWindow(currentPage: number, totalPages: number) {
  if (totalPages <= 0) return [] as number[];
  const start = Math.max(1, currentPage - 2);
  const end = Math.min(totalPages, currentPage + 2);
  const out: number[] = [];
  for (let p = start; p <= end; p += 1) out.push(p);
  return out;
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const sp = (await props.searchParams) ?? {};
  const q = firstStr(sp.q).trim();
  const offsetRaw = Number.parseInt(firstStr(sp.offset), 10);
  const offset = Number.isFinite(offsetRaw) && offsetRaw > 0 ? offsetRaw : 0;

  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (offset > 0 && !q) params.set("offset", String(offset));
  const qs = params.toString();
  const shouldNoIndex = q.length > 0 || offset > 0;
  const canonical = shouldNoIndex ? "/" : (qs ? `/?${qs}` : "/");

  return {
    title: q ? `Raadi: ${q}` : "Wararka Crypto Somali",
    description:
      "Wararka Bitcoin, Ethereum, iyo crypto ee af-Soomaali. News cusub oo la kala hormariyey waqtiga daabacaadda. Somali + English mixed crypto search hub.",
    alternates: { canonical },
    robots: shouldNoIndex
      ? { index: false, follow: true }
      : { index: true, follow: true },
    openGraph: {
      title: q ? `Raadi: ${q} | MxCrypto` : "Wararka Crypto Somali | MxCrypto",
      description:
        "Wararka Bitcoin, Ethereum, iyo crypto ee af-Soomaali. News cusub oo la kala hormariyey waqtiga daabacaadda. Somali + English mixed crypto search hub.",
      type: "website",
      images: [{ url: "/brand/mxcrypto-logo.png" }],
    },
  };
}

export default async function Home(props: PageProps) {
  const pageSize = 40; // hero + center + scrollable left timeline
  const centerCountDesktop = 12;
  const centerCountMobile = 10;

  const sp = (await props.searchParams) ?? {};

  const q = firstStr(sp.q).trim();
  const offsetRaw = Number.parseInt(firstStr(sp.offset), 10);
  const offset = Number.isFinite(offsetRaw) && offsetRaw > 0 ? offsetRaw : 0;

  const page = await fetchLatestPage({ limit: pageSize, offset, lang: "so" });
  const cleaned = cleanWireItems(page.items);
  // Backend enforces Somali; frontend keeps only a lightweight “broken script” guard via cleanWireItems.
  let items = cleaned;
  if (q) {
    const nq = normalize(q);
    items = items.filter((x) => {
      const hay = normalize(`${x.title || ""}\n${x.summary || ""}`);
      return hay.includes(nq);
    });
  }

  // Keep the newest item at the very top. (Desktop can still show imagery; mobile is text-first.)
  const hero = items[0] ?? null;
  const heroSentiment = getSentimentMeta(hero?.sentiment);
  const rest = items.slice(1);

  const desktopStream = rest.slice(0, centerCountDesktop);
  const leftTimeline = rest.slice(centerCountDesktop);
  const mobileStream = rest.slice(0, centerCountMobile);

  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (offset) params.set("offset", String(offset));

  const updatedAt = items[0]?.published_at || hero?.published_at || "";
  const clearHref = "/";

  const prevOffset = offset > 0 ? Math.max(0, offset - page.limit) : null;
  const nextOffset =
    page.hasMore && typeof page.nextOffset === "number" ? page.nextOffset : null;
  const currentPage = Math.floor(offset / page.limit) + 1;
  const totalPages =
    typeof page.total === "number" && page.total > 0
      ? Math.max(1, Math.ceil(page.total / page.limit))
      : null;
  const pageWindow = buildPageWindow(
    currentPage,
    totalPages ?? (nextOffset !== null ? currentPage + 1 : currentPage),
  );
  const showPagination = prevOffset !== null || nextOffset !== null;
  const pageHref = (pageNum: number) =>
    hrefWith(params, {
      offset: pageNum <= 1 ? null : String((pageNum - 1) * page.limit),
    });

  const showMetaOnMobile = Boolean(q);
  const siteBase =
    process.env.SITE_URL && process.env.SITE_URL.trim() !== ""
      ? process.env.SITE_URL.replace(/\/+$/, "")
      : "";
  const abs = (p: string) => (siteBase ? `${siteBase}${p}` : p);
  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Wararka crypto ee ugu dambeeyay",
    itemListOrder: "https://schema.org/ItemListOrderDescending",
    numberOfItems: Math.min(items.length, 24),
    itemListElement: items.slice(0, 24).map((it, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      url: abs(`/news/${encodeStoryID(it.url)}`),
      name: it.title,
    })),
  };
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Wararka crypto ma yihiin af-Soomaali?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Haa. MxCrypto wuxuu daabacaa wararka crypto oo Somali ah si akhristaha uu si fudud u fahmo.",
        },
      },
      {
        "@type": "Question",
        name: "Immisa jeer ayaad cusboonaysiisaa news-ka?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "News feed-ka waxaa si joogto ah loo cusboonaysiiyaa maalintii oo dhan, si aad u hesho wararka ugu dambeeyay.",
        },
      },
      {
        "@type": "Question",
        name: "Halkee ka helaa free courses crypto Somali?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Bogga Baro/Free courses ee MxCrypto waxaad ka heli kartaa casharro aasaasi ah oo crypto af-Soomaali ah.",
        },
      },
    ],
  };

  return (
    <main className="mx-container pt-4 pb-28 sm:pt-6 sm:pb-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <div
        className={[
          "border-b mx-hairline pb-4",
          showMetaOnMobile ? "" : "hidden sm:block",
        ].join(" ")}
      >
        <div className="mx-mono hidden text-[12px] font-semibold tracking-widest text-white/60 sm:block">
          WARARKII UGU DAMBEEYAY EE CRYPTO
        </div>
        <div className="mt-2 hidden max-w-[76ch] text-[14px] leading-relaxed text-white/65 sm:block">
          Wararka Bitcoin, Ethereum, iyo suuqa crypto ee af-Soomaali. Qiimaha tooska ah
          iyo soo koobid nadiif ah.
        </div>
        <div className="mx-mono mt-2 flex flex-wrap items-center gap-2 text-[11px] text-white/45">
          <span>
            {updatedAt ? `La cusbooneysiiyay ${timeAgo(updatedAt)}` : "Toos"}
          </span>
          {page.total && !q ? (
            <>
              <span className="text-white/25">•</span>
              <span>{page.total} qoraal</span>
            </>
          ) : null}
          {q ? (
            <>
              <span className="text-white/25">•</span>
              <span>{items.length} natiijo</span>
            </>
          ) : null}
        </div>

        {q ? (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {q ? (
              <span className="mx-mono rounded-full border mx-hairline bg-white/[0.03] px-3 py-1 text-[11px] font-semibold text-white/75">
                Raadi: {q}
              </span>
            ) : null}
            <Link
              href={clearHref}
              className="mx-mono rounded-full border mx-hairline bg-white/[0.02] px-3 py-1 text-[11px] font-semibold text-white/60 hover:bg-white/[0.06] hover:text-white/85"
            >
              Nadiifi
            </Link>
          </div>
        ) : null}

        {!q && offset === 0 ? (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {[
              { href: "/crypto-somali", label: "crypto somali" },
              { href: "/wararka-bitcoin", label: "bitcoin news somali" },
              { href: "/qiimaha-bitcoin-maanta", label: "bitcoin price somali" },
              { href: "/wararka-ethereum", label: "ethereum somali" },
              { href: "/memecoin-somali", label: "memecoin somali" },
            ].map((x) => (
              <Link
                key={x.label}
                href={x.href}
                className="mx-mono rounded-full border mx-hairline bg-white/[0.02] px-3 py-1 text-[10px] font-semibold text-white/58 hover:bg-white/[0.06] hover:text-white/85"
              >
                {x.label}
              </Link>
            ))}
          </div>
        ) : null}
      </div>

      {showPagination ? (
        <div className="mt-4 hidden flex-wrap items-center justify-between gap-3 border-b mx-hairline pb-4 sm:flex">
          <div className="mx-mono flex items-center gap-2 text-[11px] text-white/50">
            <span>History</span>
            <span className="text-white/25">•</span>
            <span>
              Bogga <span className="text-white/70">{currentPage}</span>
              {totalPages ? (
                <>
                  {" "}
                  / <span className="text-white/70">{totalPages}</span>
                </>
              ) : null}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {prevOffset !== null ? (
              <Link
                href={hrefWith(params, { offset: prevOffset ? String(prevOffset) : null })}
                scroll
                className="mx-mono rounded-full border mx-hairline bg-white/[0.02] px-3 py-1.5 text-[11px] font-semibold text-white/70 hover:bg-white/[0.06] hover:text-white"
              >
                ← Cusub
              </Link>
            ) : null}
            {pageWindow.map((p) => {
              const active = p === currentPage;
              return (
                <Link
                  key={p}
                  href={pageHref(p)}
                  scroll
                  aria-current={active ? "page" : undefined}
                  className={[
                    "mx-mono rounded-full border px-3 py-1.5 text-[11px] font-semibold",
                    active
                      ? "border-[rgb(var(--accent))] bg-[rgb(var(--accent))/0.17] text-[rgb(var(--accent))]"
                      : "mx-hairline bg-white/[0.02] text-white/65 hover:bg-white/[0.06] hover:text-white",
                  ].join(" ")}
                >
                  {p}
                </Link>
              );
            })}
            {nextOffset !== null ? (
              <Link
                href={hrefWith(params, { offset: String(nextOffset) })}
                scroll
                className="mx-mono rounded-full border mx-hairline bg-white/[0.02] px-3 py-1.5 text-[11px] font-semibold text-white/70 hover:bg-white/[0.06] hover:text-white"
              >
                Hore →
              </Link>
            ) : null}
          </div>
        </div>
      ) : null}

      <div className="mt-4 grid grid-cols-1 gap-10 sm:mt-6 lg:grid-cols-[320px_minmax(0,1fr)_320px]">
        <aside className="order-2 hidden lg:block lg:order-1 lg:pr-6">
          <div className="lg:sticky lg:top-[116px]">
            <div className="flex items-center justify-between">
              <div className="mx-mono text-[11px] font-semibold tracking-widest text-white/55">
                UGU DAMBEEYAY
              </div>
              <div className="mx-mono text-[10px] text-white/40">
                {leftTimeline.length} qoraal
              </div>
            </div>

            <div className="mt-3">
              <ol className="max-h-[calc(100vh-280px)] overflow-y-auto pr-2 [scrollbar-color:rgba(255,255,255,0.28)_transparent] [scrollbar-width:thin]">
                {leftTimeline.length ? (
                  leftTimeline.map((it) => {
                    const timelineSentiment = getSentimentMeta(it.sentiment);
                    return (
                    <li key={it.id || it.url} className="pr-3 pb-5 last:pb-0">
                      <div className="relative pl-4">
                        <span className="absolute left-0 top-[7px] h-[calc(100%-7px)] w-px bg-white/18" />
                        <span className="absolute -left-[2px] top-[7px] h-[5px] w-[5px] rounded-full bg-[rgb(var(--accent))]" />
                        <div className="mx-mono text-[11px] font-semibold text-[rgb(var(--accent))]">
                          {formatTimelineStamp(it.published_at)}
                        </div>
                        <Link
                          href={`/news/${encodeStoryID(it.url)}`}
                          scroll
                          className="mt-1 block text-[15px] leading-[1.35] text-white/90 transition-colors hover:text-white"
                        >
                          <span className="mx-clamp-3">{it.title}</span>
                        </Link>
                        <div className="mx-mono mt-2 flex items-center gap-2 text-[10px] text-white/40">
                          <span>{timeAgo(it.published_at)}</span>
                          {timelineSentiment ? (
                            <>
                              <span className="text-white/25">•</span>
                              <span
                                className={["font-semibold", timelineSentiment.className].join(
                                  " ",
                                )}
                              >
                                {timelineSentiment.label}
                              </span>
                            </>
                          ) : null}
                        </div>
                      </div>
                    </li>
                  );
                  })
                ) : (
                  <li className="px-4 py-8">
                    <div className="mx-mono text-[12px] text-white/55">
                      Warar hore lama helin.
                    </div>
                  </li>
                )}
              </ol>
            </div>

            {showPagination ? (
              <div className="mt-4 flex items-center justify-between border-t mx-hairline pt-3">
                <div className="mx-mono text-[10px] text-white/45">Wararkii hore</div>
                <div className="flex items-center gap-2">
                  {prevOffset !== null ? (
                    <Link
                      href={hrefWith(params, { offset: prevOffset ? String(prevOffset) : null })}
                      scroll
                      className="mx-mono text-[10px] text-white/62 hover:text-white"
                    >
                      ← Cusub
                    </Link>
                  ) : null}
                  {nextOffset !== null ? (
                    <Link
                      href={hrefWith(params, { offset: String(nextOffset) })}
                      scroll
                      className="mx-mono text-[10px] text-white/62 hover:text-white"
                    >
                      Hore →
                    </Link>
                  ) : null}
                </div>
              </div>
            ) : null}
          </div>
        </aside>

        <section className="order-1 lg:order-2 lg:px-6">
          {hero ? (
            <Link href={`/news/${encodeStoryID(hero.url)}`} scroll className="group block">
              <div className="relative aspect-[16/10] w-full overflow-hidden rounded-[10px] bg-black sm:aspect-[16/9] sm:rounded-none">
                {hero.image_url ? (
                  <Image
                    src={hero.image_url}
                    alt=""
                    fill
                    sizes="(max-width: 1024px) 100vw, 720px"
                    className="absolute inset-0 h-full w-full object-cover"
                    loading="eager"
                    fetchPriority="high"
                    unoptimized
                  />
                ) : (
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgb(var(--accent)/0.18),transparent_60%),linear-gradient(135deg,rgba(255,255,255,0.07),rgba(255,255,255,0.01))]" />
                )}
                <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/80 to-transparent" />
              </div>

              <div className="mt-0 sm:mt-4">
                <div className="mx-mono text-[11px] font-semibold tracking-widest text-white/60">
                  WARARKA UGU DAMBEEYAY
                </div>
                <h1 className="mx-headline mt-3 text-[36px] font-semibold leading-[1.05] text-white group-hover:underline sm:text-[50px] md:text-[60px]">
                  <span className="mx-clamp-3">{hero.title}</span>
                </h1>
                <div className="mx-mono mt-3 text-[12px] text-white/45">
                  {timeAgo(hero.published_at)}
                  {hero.reading_time ? ` • ${hero.reading_time}` : ""}
                  {heroSentiment ? (
                    <>
                      <span className="text-white/25"> • </span>
                      <span className={["font-semibold", heroSentiment.className].join(" ")}>
                        {heroSentiment.label}
                      </span>
                    </>
                  ) : null}
                </div>
                {hero.summary ? (
                  <p className="mt-3 text-[15px] leading-relaxed text-white/68 sm:mt-4 sm:text-[16px]">
                    <span className="mx-clamp-2 sm:mx-clamp-3">{hero.summary}</span>
                  </p>
                ) : null}
              </div>
            </Link>
          ) : (
            <div className="mx-panel p-6">
              <div className="mx-mono text-[12px] text-white/55">Soo dhacaya…</div>
            </div>
          )}

          <div className="mt-8 lg:hidden">
            <div className="flex items-center justify-between border-b mx-hairline pb-3">
              <div className="mx-mono text-[11px] font-semibold tracking-widest text-white/55">
                WARAR
              </div>
            </div>
            <div className="mt-2 space-y-1">
              {mobileStream.map((it) => (
                <div key={it.id || it.url}>
                  <StoryLink item={it} dense showThumb clean />
                </div>
              ))}
            </div>

            {showPagination ? (
              <div className="mt-5 flex flex-wrap items-center justify-center gap-2 border-t mx-hairline pt-4">
                {prevOffset !== null ? (
                  <Link
                    href={hrefWith(params, { offset: prevOffset ? String(prevOffset) : null })}
                    scroll
                    className="mx-mono rounded-full border mx-hairline bg-white/[0.02] px-4 py-2 text-[12px] font-semibold text-white/70 hover:bg-white/[0.06] hover:text-white"
                  >
                    ← Cusub
                  </Link>
                ) : null}
                {nextOffset !== null ? (
                  <Link
                    href={hrefWith(params, { offset: String(nextOffset) })}
                    scroll
                    className="mx-mono rounded-full border mx-hairline bg-white/[0.02] px-4 py-2 text-[12px] font-semibold text-white/70 hover:bg-white/[0.06] hover:text-white"
                  >
                    Hore →
                  </Link>
                ) : null}
              </div>
            ) : null}
          </div>

          <div className="mt-8 lg:hidden">
            <div className="flex items-center justify-between border-b mx-hairline pb-3">
              <div className="mx-mono text-[11px] font-semibold tracking-widest text-white/55">
                EXCHANGES
              </div>
              <div className="mx-mono text-[10px] text-white/45">Links</div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {EXCHANGE_PARTNERS.map((x) => (
                <a
                  key={x.name}
                  href={x.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-[12px] border mx-hairline bg-white/[0.02] px-3 py-3 transition-colors hover:bg-white/[0.06]"
                >
                  <div className="mx-mono text-[10px] font-semibold tracking-widest text-white/45">
                    EXCHANGE
                  </div>
                  <div className="mt-1 text-[15px] font-semibold text-white">{x.name}</div>
                  <div className="mt-0.5 text-[12px] text-white/60">{x.blurb}</div>
                </a>
              ))}
            </div>
          </div>

          <div className="mt-8 lg:hidden">
            <div className="flex items-center justify-between border-b mx-hairline pb-3">
              <div className="mx-mono text-[11px] font-semibold tracking-widest text-white/55">
                MOWDUUCYO CAAN AH
              </div>
            </div>
            <div className="mt-3 grid grid-cols-1 gap-2">
              {[
                { href: "/qiimaha-bitcoin-maanta", label: "Qiimaha Bitcoin Maanta" },
                { href: "/wararka-bitcoin", label: "Wararka Bitcoin" },
                { href: "/wararka-ethereum", label: "Wararka Ethereum" },
                { href: "/memecoin-somali", label: "Memecoin Somali" },
                { href: "/crypto-somali", label: "Crypto Somali Hub" },
              ].map((x) => (
                <Link
                  key={x.href}
                  href={x.href}
                  className="rounded-[12px] border mx-hairline bg-white/[0.02] px-3 py-3 text-[14px] font-semibold text-white/82 transition-colors hover:bg-white/[0.06] hover:text-white"
                >
                  {x.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="mt-8 hidden lg:block">
            <div className="flex items-center justify-between border-b mx-hairline pb-3">
              <div className="mx-mono text-[11px] font-semibold tracking-widest text-white/55">
                WARAR DHEERAAD AH
              </div>
            </div>
            <div className="mt-2 max-h-[calc(100vh-280px)] overflow-y-auto pr-1 [scrollbar-color:rgba(255,255,255,0.28)_transparent] [scrollbar-width:thin]">
              <div className="space-y-1">
                {desktopStream.map((it) => (
                  <div key={it.id || it.url}>
                    <StoryLink item={it} dense showThumb clean />
                  </div>
                ))}
                {desktopStream.length === 0 ? (
                  <div className="py-10">
                    <div className="mx-mono text-[12px] text-white/55">Warar lama helin.</div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          <div className="mt-8 hidden flex-wrap items-center justify-between gap-3 border-t mx-hairline pt-4 lg:flex">
            <div className="mx-mono flex items-center gap-2 text-[11px] text-white/45">
              {totalPages ? (
                <span>
                  Bogga <span className="text-white/70">{currentPage}</span> /{" "}
                  <span className="text-white/70">{totalPages}</span>
                </span>
              ) : null}
              {page.total && !q ? (
                <>
                  {totalPages ? <span className="text-white/25">•</span> : null}
                  <span>Muujinaya </span>
                  <span className="text-white/70">{offset + 1}</span>-
                  <span className="text-white/70">
                    {Math.min(offset + page.limit, page.total)}
                  </span>{" "}
                  <span>
                    ee <span className="text-white/70">{page.total}</span>
                  </span>
                </>
              ) : null}
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {prevOffset !== null ? (
                <Link
                  href={hrefWith(params, { offset: prevOffset ? String(prevOffset) : null })}
                  scroll
                  className="mx-mono rounded-full border mx-hairline bg-white/[0.02] px-4 py-2 text-[12px] font-semibold text-white/70 hover:bg-white/[0.06] hover:text-white"
                >
                  ← Cusub
                </Link>
              ) : null}
              {pageWindow.map((p) => {
                const active = p === currentPage;
                return (
                  <Link
                    key={`bottom-${p}`}
                    href={pageHref(p)}
                    scroll
                    aria-current={active ? "page" : undefined}
                    className={[
                      "mx-mono rounded-full border px-3 py-2 text-[11px] font-semibold",
                      active
                        ? "border-[rgb(var(--accent))] bg-[rgb(var(--accent))/0.17] text-[rgb(var(--accent))]"
                        : "mx-hairline bg-white/[0.02] text-white/65 hover:bg-white/[0.06] hover:text-white",
                    ].join(" ")}
                  >
                    {p}
                  </Link>
                );
              })}
              {nextOffset !== null ? (
                <Link
                  href={hrefWith(params, { offset: String(nextOffset) })}
                  scroll
                  className="mx-mono rounded-full border mx-hairline bg-white/[0.02] px-4 py-2 text-[12px] font-semibold text-white/70 hover:bg-white/[0.06] hover:text-white"
                >
                  Hore →
                </Link>
              ) : null}
            </div>
          </div>
        </section>

        <aside className="order-3 hidden lg:block lg:border-l mx-hairline lg:pl-6">
          <div className="space-y-4">
            <section className="mx-panel overflow-hidden">
              <div className="relative p-4">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgb(var(--accent)/0.22),transparent_58%),linear-gradient(135deg,rgba(255,255,255,0.05),rgba(255,255,255,0.01))]" />
                <div className="relative">
                  <div className="mx-mono text-[11px] font-semibold tracking-widest text-white/60">
                    FREE COURSES
                  </div>
                  <div className="mx-headline mt-2 text-[22px] font-semibold leading-tight text-white">
                    Baro crypto af-Soomaali
                  </div>
                  <div className="mt-2 text-[13px] leading-relaxed text-white/70">
                    Wallet + amni, aasaaska Bitcoin/Ethereum, iyo sida loo fahmo suuqa.
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2 text-[12px] text-white/70">
                    <div className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-[rgb(var(--accent))]" />
                      Wallet + Amni
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-[rgb(var(--accent))]" />
                      Suuqyada
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-[rgb(var(--accent))]" />
                      DeFi (Bilow)
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-[rgb(var(--accent))]" />
                      Qaladka Caadiga ah
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <a
                      href={COURSE_HREF}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mx-mono rounded-full border mx-hairline bg-[rgb(var(--accent))] px-4 py-2 text-[12px] font-semibold text-black hover:opacity-90"
                    >
                      Free courses ↗
                    </a>
                    <Link
                      href="/baro"
                      className="mx-mono rounded-full border mx-hairline bg-white/[0.02] px-4 py-2 text-[12px] font-semibold text-white/75 hover:bg-white/[0.06] hover:text-white"
                    >
                      Faahfaahin
                    </Link>
                  </div>
                </div>
              </div>
            </section>

            <section className="mx-panel p-4">
              <div className="mx-mono text-[11px] font-semibold tracking-widest text-white/60">
                EXCHANGES
              </div>
              <div className="mt-1 text-[13px] text-white/65">Exchange links for signup and trading.</div>
              <div className="mt-3 space-y-2">
                {EXCHANGE_PARTNERS.map((x) => (
                  <a
                    key={x.name}
                    href={x.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between rounded-[10px] border mx-hairline bg-white/[0.02] px-3 py-2.5 transition-colors hover:bg-white/[0.06]"
                  >
                    <div>
                      <div className="text-[14px] font-semibold text-white">{x.name}</div>
                      <div className="mx-mono text-[10px] text-white/45">{x.blurb}</div>
                    </div>
                    <div className="mx-mono text-[11px] text-[rgb(var(--accent))]">Open ↗</div>
                  </a>
                ))}
              </div>
            </section>

            <section className="mx-panel p-4">
              <div className="mx-mono text-[11px] font-semibold tracking-widest text-white/60">
                MOWDUUCYO CAAN AH
              </div>
              <div className="mt-3 space-y-2">
                {[
                  { href: "/qiimaha-bitcoin-maanta", label: "Qiimaha Bitcoin Maanta" },
                  { href: "/wararka-bitcoin", label: "Wararka Bitcoin" },
                  { href: "/wararka-ethereum", label: "Wararka Ethereum" },
                  { href: "/memecoin-somali", label: "Memecoin Somali" },
                  { href: "/crypto-somali", label: "Crypto Somali Hub" },
                  { href: "/baro", label: "Free courses: Baro Crypto" },
                ].map((x) => (
                  <Link
                    key={x.href}
                    href={x.href}
                    className="group flex items-center justify-between rounded-[10px] border mx-hairline bg-white/[0.02] px-3 py-2.5 transition-colors hover:bg-white/[0.06]"
                  >
                    <span className="text-[14px] text-white/82 group-hover:text-white">{x.label}</span>
                    <span className="mx-mono text-[11px] text-white/35 group-hover:text-white/60">→</span>
                  </Link>
                ))}
              </div>
            </section>
          </div>
        </aside>
      </div>
    </main>
  );
}
