import { cleanWireItems, fetchLatestPage, type WireItem } from "@/lib/news";

export type AuthorSummary = {
  name: string;
  slug: string;
  count: number;
  latestAt: string;
};

function collapseWS(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

export function normalizeAuthorName(raw?: string) {
  const base = collapseWS(raw || "");
  if (!base) return "";
  return collapseWS(base.replace(/^by\s+/i, ""));
}

export function authorSlug(name: string) {
  return normalizeAuthorName(name)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function fetchAuthorCorpus(opts?: { pages?: number; pageSize?: number }) {
  const pages = Math.max(1, Math.min(8, opts?.pages ?? 4));
  const pageSize = Math.max(40, Math.min(200, opts?.pageSize ?? 140));
  const rows: WireItem[] = [];
  let offset = 0;

  for (let i = 0; i < pages; i += 1) {
    const page = await fetchLatestPage({ limit: pageSize, offset, lang: "so" });
    if (!page.items.length) break;
    rows.push(...page.items);
    if (!page.hasMore || page.nextOffset === null) break;
    offset = page.nextOffset;
  }

  return cleanWireItems(rows);
}

export function collectAuthorSummaries(items: WireItem[], maxAuthors = 80): AuthorSummary[] {
  const bySlug = new Map<string, AuthorSummary>();

  for (const it of items) {
    const name = normalizeAuthorName(it.author);
    if (!name) continue;
    const slug = authorSlug(name);
    if (!slug) continue;

    const current = bySlug.get(slug);
    const ts = it.published_at || "";
    if (!current) {
      bySlug.set(slug, { name, slug, count: 1, latestAt: ts });
      continue;
    }

    current.count += 1;
    if (Date.parse(ts || "") > Date.parse(current.latestAt || "")) {
      current.latestAt = ts;
    }
  }

  return [...bySlug.values()]
    .sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count;
      return Date.parse(b.latestAt || "") - Date.parse(a.latestAt || "");
    })
    .slice(0, Math.max(1, maxAuthors));
}

export function filterItemsByAuthor(items: WireItem[], slug: string) {
  const want = (slug || "").trim().toLowerCase();
  if (!want) return [];
  return items.filter((it) => authorSlug(normalizeAuthorName(it.author)) === want);
}

