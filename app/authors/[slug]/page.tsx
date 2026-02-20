import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  collectAuthorSummaries,
  fetchAuthorCorpus,
  filterItemsByAuthor,
  normalizeAuthorName,
} from "@/lib/authors";
import { encodeStoryID } from "@/lib/news";
import { timeAgo } from "@/lib/time";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export const revalidate = 900;

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const { slug } = await props.params;
  const items = await fetchAuthorCorpus({ pages: 4, pageSize: 160 });
  const authored = filterItemsByAuthor(items, slug);
  const name = authored[0] ? normalizeAuthorName(authored[0].author) : "";
  if (!name) {
    return {
      title: "Author",
      robots: { index: false, follow: true },
    };
  }

  return {
    title: `${name} - Crypto Author Somali`,
    description: `${name} qoraalladiisa crypto Somali iyo mixed Somali-English ee MxCrypto.`,
    alternates: { canonical: `/authors/${slug}` },
    openGraph: {
      title: `${name} | MxCrypto`,
      description: `${name} qoraalladiisa crypto Somali ee MxCrypto.`,
      type: "profile",
      images: [{ url: "/brand/mxcrypto-logo.png" }],
    },
  };
}

export default async function AuthorDetailPage(props: PageProps) {
  const { slug } = await props.params;
  const items = await fetchAuthorCorpus({ pages: 5, pageSize: 180 });
  const authored = filterItemsByAuthor(items, slug);
  if (!authored.length) notFound();

  const name = normalizeAuthorName(authored[0].author) || "MxCrypto Author";
  const latest = authored.slice(0, 60);
  const authorSummary = collectAuthorSummaries(items, 300).find((x) => x.slug === slug);

  const personJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name,
    jobTitle: "Crypto News Author",
    worksFor: {
      "@type": "NewsMediaOrganization",
      name: "MxCrypto",
      url: "https://www.mxcrypto.net",
    },
    url: `https://www.mxcrypto.net/authors/${slug}`,
  };

  return (
    <main className="mx-container pt-8 pb-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />

      <header className="border-b mx-hairline pb-4">
        <div className="mx-mono text-[12px] font-semibold tracking-widest text-[rgb(var(--accent))]">
          AUTHOR
        </div>
        <h1 className="mx-headline mt-3 text-[40px] font-semibold leading-[1.04] text-white md:text-[54px]">
          {name}
        </h1>
        <div className="mx-mono mt-2 text-[12px] text-white/50">
          {authorSummary?.count || latest.length} qoraal •{" "}
          {authorSummary?.latestAt ? `La cusbooneysiiyay ${timeAgo(authorSummary.latestAt)}` : "MxCrypto"}
        </div>
      </header>

      <section className="mt-6 space-y-2">
        {latest.map((it) => (
          <Link
            key={it.id || it.url}
            href={`/news/${encodeStoryID(it.url)}`}
            className="block rounded-[12px] border mx-hairline bg-white/[0.02] px-4 py-3 transition-colors hover:bg-white/[0.06]"
          >
            <div className="text-[17px] font-semibold text-white/95">{it.title}</div>
            <div className="mx-mono mt-1 text-[11px] text-white/48">{timeAgo(it.published_at)}</div>
          </Link>
        ))}
      </section>

      <div className="mt-8">
        <Link
          href="/authors"
          className="mx-mono rounded-full border mx-hairline bg-white/[0.02] px-4 py-2 text-[12px] font-semibold text-white/75 hover:bg-white/[0.06] hover:text-white"
        >
          ← All Authors
        </Link>
      </div>
    </main>
  );
}

