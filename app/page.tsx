import Link from "next/link";
import { FearGreedCard } from "@/components/FearGreedCard";
import { StoryLink } from "@/components/StoryLink";
import { cleanWireItems, encodeStoryID, fetchLatestPage, isSomaliWireItem } from "@/lib/news";
import { timeAgo } from "@/lib/time";
import { COURSE_HREF } from "@/lib/constants";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function firstStr(v: string | string[] | undefined): string {
  return Array.isArray(v) ? v[0] ?? "" : v ?? "";
}

function normalize(s: string) {
  return s.toLowerCase();
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

export default async function Home(props: PageProps) {
  const sp = (await props.searchParams) ?? {};

  const q = firstStr(sp.q).trim();
  const offsetRaw = Number.parseInt(firstStr(sp.offset), 10);
  const offset = Number.isFinite(offsetRaw) && offsetRaw > 0 ? offsetRaw : 0;

  const page = await fetchLatestPage({ limit: 72, offset, lang: "so" });
  const cleaned = cleanWireItems(page.items);
  const somaliOnly = cleaned.filter(isSomaliWireItem);
  const unfiltered = somaliOnly.length >= 8 ? somaliOnly : cleaned;

  let items = unfiltered;
  if (q) {
    const nq = normalize(q);
    items = items.filter((x) => {
      const hay = normalize(`${x.title || ""}\n${x.summary || ""}`);
      return hay.includes(nq);
    });
  }

  // Keep the newest item at the very top. (Desktop can still show imagery; mobile is text-first.)
  const hero = items[0] ?? null;
  const rest = items.slice(1);

  const left = rest.slice(0, 10);
  const desktopStream = rest.slice(10, 28);
  const mobileStream = rest.slice(0, 24);

  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (offset) params.set("offset", String(offset));

  const updatedAt = unfiltered[0]?.published_at || hero?.published_at || "";
  const clearHref = "/";

  const prevOffset = offset > 0 ? Math.max(0, offset - page.limit) : null;
  const nextOffset =
    page.hasMore && typeof page.nextOffset === "number" ? page.nextOffset : null;

  const showMetaOnMobile = Boolean(q);

  return (
    <main className="mx-container pt-4 pb-16 sm:pt-6">
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
          <span className="text-white/25">•</span>
          <Link href="/rss.xml" className="text-white/55 hover:text-white/85">
            RSS
          </Link>
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
      </div>

      <div className="mt-4 grid grid-cols-1 gap-10 sm:mt-6 lg:grid-cols-[320px_minmax(0,1fr)_320px]">
        <aside className="order-2 hidden lg:block lg:order-1 lg:pr-6 lg:border-r mx-hairline">
          <div className="flex items-center justify-between">
            <div className="mx-mono text-[11px] font-semibold tracking-widest text-white/55">
              UGU DAMBEEYAY
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
                  Warar lama helin.
                </div>
              </div>
            )}
          </div>
        </aside>

        <section className="order-1 lg:order-2 lg:px-6">
          {hero ? (
            <Link href={`/news/${encodeStoryID(hero.url)}`} className="group block">
              <div className="relative hidden aspect-[16/9] w-full overflow-hidden rounded-[14px] border mx-hairline bg-black sm:block">
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
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgb(var(--accent)/0.18),transparent_60%),linear-gradient(135deg,rgba(255,255,255,0.07),rgba(255,255,255,0.01))]" />
                )}
                <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/80 to-transparent" />
              </div>

              <div className="mt-0 sm:mt-4">
                <div className="mx-mono text-[11px] font-semibold tracking-widest text-white/60">
                  WARARKA UGU DAMBEEYAY
                </div>
                <h1 className="mx-headline mt-3 text-[44px] font-semibold leading-[1.02] text-white group-hover:underline sm:text-[50px] md:text-[60px]">
                  <span className="mx-clamp-3">{hero.title}</span>
                </h1>
                <div className="mx-mono mt-3 text-[12px] text-white/45">
                  {timeAgo(hero.published_at)}
                  {hero.reading_time ? ` • ${hero.reading_time}` : ""}
                </div>
                {hero.summary ? (
                  <p className="mt-4 hidden text-[16px] leading-relaxed text-white/70 sm:block">
                    <span className="mx-clamp-3">{hero.summary}</span>
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
            <div className="divide-y mx-hairline">
              {mobileStream.map((it) => (
                <div key={it.id || it.url}>
                  <StoryLink item={it} dense showThumb />
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 hidden lg:block">
            <div className="flex items-center justify-between border-b mx-hairline pb-3">
              <div className="mx-mono text-[11px] font-semibold tracking-widest text-white/55">
                WARAR DHEERAAD AH
              </div>
            </div>
            <div className="divide-y mx-hairline">
              {desktopStream.map((it) => (
                <div key={it.id || it.url}>
                  <StoryLink item={it} dense showThumb />
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
            <div className="mx-mono text-[11px] text-white/45">
              {page.total && !q ? (
                <>
                  Muujinaya{" "}
                  <span className="text-white/70">{offset + 1}</span>-
                  <span className="text-white/70">
                    {Math.min(offset + page.limit, page.total)}
                  </span>{" "}
                  ee <span className="text-white/70">{page.total}</span>
                </>
              ) : null}
            </div>

            <div className="flex items-center gap-2">
              {prevOffset !== null ? (
                <Link
                  href={hrefWith(params, { offset: prevOffset ? String(prevOffset) : null })}
                  className="mx-mono rounded-full border mx-hairline bg-white/[0.02] px-4 py-2 text-[12px] font-semibold text-white/70 hover:bg-white/[0.06] hover:text-white"
                >
                  ← Cusub
                </Link>
              ) : null}
              {nextOffset !== null ? (
                <Link
                  href={hrefWith(params, { offset: String(nextOffset) })}
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
                    KOORSO BILAASH
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
                      Fur Bilaash ↗
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

            <FearGreedCard />

            <section className="mx-panel p-4">
              <div className="mx-mono text-[11px] font-semibold tracking-widest text-white/55">
                RAAC
              </div>
              <div className="mt-3 space-y-2 text-[13px] text-white/70">
                <Link
                  href="/rss.xml"
                  className="block rounded-xl border mx-hairline bg-white/[0.02] px-3 py-2 hover:bg-white/[0.06]"
                >
                  RSS
                </Link>
              </div>
            </section>
          </div>
        </aside>
      </div>
    </main>
  );
}
