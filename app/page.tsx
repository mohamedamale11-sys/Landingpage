import Link from "next/link";
import { StoryLink } from "@/components/StoryLink";
import { encodeStoryID, fetchLatestPage, type WireItem } from "@/lib/news";
import { timeAgo } from "@/lib/time";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function firstStr(v: string | string[] | undefined): string {
  return Array.isArray(v) ? v[0] ?? "" : v ?? "";
}

function cleanFeed(items: WireItem[]) {
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

function normalize(s: string) {
  return s.toLowerCase();
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

function hrefWith(params: URLSearchParams, patch: Record<string, string | null>) {
  const next = new URLSearchParams(params.toString());
  for (const [k, v] of Object.entries(patch)) {
    if (v === null || v === "") next.delete(k);
    else next.set(k, v);
  }
  // When changing filters, reset pagination.
  if ("section" in patch || "q" in patch) next.delete("offset");
  const qs = next.toString();
  return qs ? `/?${qs}` : "/";
}

export default async function Home(props: PageProps) {
  const sp = (await props.searchParams) ?? {};

  const q = firstStr(sp.q).trim();
  const section = firstStr(sp.section).trim();
  const offsetRaw = Number.parseInt(firstStr(sp.offset), 10);
  const offset = Number.isFinite(offsetRaw) && offsetRaw > 0 ? offsetRaw : 0;

  const page = await fetchLatestPage({ limit: 72, offset, lang: "so" });
  const unfiltered = cleanFeed(page.items);

  let items = unfiltered;
  if (section) items = items.filter((x) => (x.section || "") === section);
  if (q) {
    const nq = normalize(q);
    items = items.filter((x) => {
      const hay = normalize(`${x.title || ""}\n${x.summary || ""}`);
      return hay.includes(nq);
    });
  }

  const heroIndex = Math.max(
    0,
    items.findIndex((x) => Boolean(x.image_url)),
  );
  const hero = items[heroIndex] ?? null;
  const rest = items.filter((_, i) => i !== heroIndex);

  const left = rest.slice(0, 10);
  const stream = rest.slice(10, 28);

  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (section) params.set("section", section);
  if (offset) params.set("offset", String(offset));

  const updatedAt = unfiltered[0]?.published_at || hero?.published_at || "";
  const clearHref = "/";

  const prevOffset = offset > 0 ? Math.max(0, offset - page.limit) : null;
  const nextOffset =
    page.hasMore && typeof page.nextOffset === "number" ? page.nextOffset : null;

  // Section counts from the current page (unfiltered) for a working "Browse" sidebar.
  const sectionCounts = new Map<string, number>();
  for (const it of unfiltered) {
    const key = it.section || "News";
    sectionCounts.set(key, (sectionCounts.get(key) || 0) + 1);
  }
  const browse = [...sectionCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([key, count]) => ({ key, count, label: displaySection(key) }));

  return (
    <main className="mx-container pt-6 pb-16">
      <div className="border-b mx-hairline pb-4">
        <div className="mx-mono text-[12px] font-semibold tracking-widest text-white/60">
          LATEST CRYPTO NEWS
        </div>
        <div className="mx-mono mt-2 flex flex-wrap items-center gap-2 text-[11px] text-white/45">
          <span>{updatedAt ? `Updated ${timeAgo(updatedAt)}` : "Live"}</span>
          <span className="text-white/25">•</span>
          <Link href="/rss.xml" className="text-white/55 hover:text-white/85">
            RSS
          </Link>
          {page.total && !q && !section ? (
            <>
              <span className="text-white/25">•</span>
              <span>{page.total} stories</span>
            </>
          ) : null}
          {q || section ? (
            <>
              <span className="text-white/25">•</span>
              <span>{items.length} results</span>
            </>
          ) : null}
        </div>

        {q || section ? (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {section ? (
              <span className="mx-mono rounded-full border mx-hairline bg-white/[0.03] px-3 py-1 text-[11px] font-semibold text-white/75">
                Section: {displaySection(section)}
              </span>
            ) : null}
            {q ? (
              <span className="mx-mono rounded-full border mx-hairline bg-white/[0.03] px-3 py-1 text-[11px] font-semibold text-white/75">
                Search: {q}
              </span>
            ) : null}
            <Link
              href={clearHref}
              className="mx-mono rounded-full border mx-hairline bg-white/[0.02] px-3 py-1 text-[11px] font-semibold text-white/60 hover:bg-white/[0.06] hover:text-white/85"
            >
              Clear
            </Link>
          </div>
        ) : null}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-[320px_minmax(0,1fr)_320px]">
        <aside className="order-2 lg:order-1 lg:pr-6 lg:border-r mx-hairline">
          <div className="flex items-center justify-between">
            <div className="mx-mono text-[11px] font-semibold tracking-widest text-white/55">
              LATEST
            </div>
          </div>
          <div className="mt-3 divide-y mx-hairline">
            {left.length ? (
              left.map((it) => (
                <div key={it.id || it.url}>
                  <StoryLink item={it} dense />
                </div>
              ))
            ) : (
              <div className="py-10">
                <div className="mx-mono text-[12px] text-white/55">
                  No stories found.
                </div>
              </div>
            )}
          </div>
        </aside>

        <section className="order-1 lg:order-2 lg:px-6">
          {hero ? (
            <Link href={`/news/${encodeStoryID(hero.url)}`} className="group block">
              <div className="relative aspect-[16/9] w-full overflow-hidden rounded-[14px] border mx-hairline bg-black">
                {hero.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={hero.image_url}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover"
                    loading="eager"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.18),transparent_60%),linear-gradient(135deg,rgba(255,255,255,0.07),rgba(255,255,255,0.01))]" />
                )}
                <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/80 to-transparent" />
              </div>

              <div className="mt-4">
                <div className="mx-mono text-[11px] font-semibold tracking-widest text-white/60">
                  {displaySection(hero.section).toUpperCase()}{" "}
                  <span className="text-white/25">•</span>{" "}
                  <span className="text-white/55">{hero.source || "Wire"}</span>
                </div>
                <h1 className="mx-headline mt-3 text-[34px] font-semibold leading-[1.03] text-white group-hover:underline md:text-[52px]">
                  <span className="mx-clamp-3">{hero.title}</span>
                </h1>
                <div className="mx-mono mt-3 text-[12px] text-white/45">
                  {timeAgo(hero.published_at)}
                  {hero.reading_time ? ` • ${hero.reading_time}` : ""}
                </div>
                {hero.summary ? (
                  <p className="mt-4 text-[16px] leading-relaxed text-white/70">
                    <span className="mx-clamp-3">{hero.summary}</span>
                  </p>
                ) : null}
              </div>
            </Link>
          ) : (
            <div className="mx-panel p-6">
              <div className="mx-mono text-[12px] text-white/55">Loading…</div>
            </div>
          )}

          <div className="mt-8">
            <div className="flex items-center justify-between border-b mx-hairline pb-3">
              <div className="mx-mono text-[11px] font-semibold tracking-widest text-white/55">
                MORE NEWS
              </div>
            </div>
            <div className="divide-y mx-hairline">
              {stream.map((it) => (
                <div key={it.id || it.url}>
                  <StoryLink item={it} dense showThumb />
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
            <div className="mx-mono text-[11px] text-white/45">
              {page.total && !q && !section ? (
                <>
                  Showing{" "}
                  <span className="text-white/70">{offset + 1}</span>-
                  <span className="text-white/70">
                    {Math.min(offset + page.limit, page.total)}
                  </span>{" "}
                  of <span className="text-white/70">{page.total}</span>
                </>
              ) : null}
            </div>

            <div className="flex items-center gap-2">
              {prevOffset !== null ? (
                <Link
                  href={hrefWith(params, { offset: prevOffset ? String(prevOffset) : null })}
                  className="mx-mono rounded-full border mx-hairline bg-white/[0.02] px-4 py-2 text-[12px] font-semibold text-white/70 hover:bg-white/[0.06] hover:text-white"
                >
                  ← Newer
                </Link>
              ) : null}
              {nextOffset !== null ? (
                <Link
                  href={hrefWith(params, { offset: String(nextOffset) })}
                  className="mx-mono rounded-full border mx-hairline bg-white/[0.02] px-4 py-2 text-[12px] font-semibold text-white/70 hover:bg-white/[0.06] hover:text-white"
                >
                  Older →
                </Link>
              ) : null}
            </div>
          </div>
        </section>

        <aside className="order-3 lg:border-l mx-hairline lg:pl-6">
          <div className="space-y-4">
            <section className="mx-panel p-4">
              <div className="mx-mono text-[11px] font-semibold tracking-widest text-white/55">
                BROWSE
              </div>
              <div className="mt-3 space-y-1">
                {browse.map((b) => (
                  <Link
                    key={b.key}
                    href={hrefWith(params, { section: b.key === "News" ? null : b.key })}
                    className={[
                      "flex items-center justify-between rounded-xl px-3 py-2 transition",
                      (section || "News") === b.key
                        ? "bg-white/[0.06] text-white"
                        : "hover:bg-white/[0.04] text-white/80",
                    ].join(" ")}
                  >
                    <span className="mx-mono text-[12px] font-semibold">
                      {b.label}
                    </span>
                    <span className="mx-mono text-[11px] text-white/50">
                      {b.count}
                    </span>
                  </Link>
                ))}
              </div>
              <div className="mx-mono mt-3 text-[11px] text-white/35">
                Browse by section, or use search for keywords.
              </div>
            </section>

            <section className="mx-panel p-4">
              <div className="mx-mono text-[11px] font-semibold tracking-widest text-white/55">
                FEEDS
              </div>
              <div className="mt-3 space-y-2 text-[13px] text-white/70">
                <Link
                  href="/rss.xml"
                  className="block rounded-xl border mx-hairline bg-white/[0.02] px-3 py-2 hover:bg-white/[0.06]"
                >
                  RSS feed
                </Link>
                <a
                  href="/api/news/latest?limit=20"
                  className="block rounded-xl border mx-hairline bg-white/[0.02] px-3 py-2 hover:bg-white/[0.06]"
                >
                  Developer API (JSON)
                </a>
              </div>
            </section>
          </div>
        </aside>
      </div>
    </main>
  );
}
