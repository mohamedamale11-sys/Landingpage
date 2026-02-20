import type { Metadata } from "next";
import Link from "next/link";
import { collectAuthorSummaries, fetchAuthorCorpus } from "@/lib/authors";
import { timeAgo } from "@/lib/time";

export const metadata: Metadata = {
  title: "Crypto Authors Somali",
  description:
    "Qorayaasha MxCrypto: crypto news Somali iyo mixed Somali-English analysis authors.",
  keywords: [
    "crypto authors somali",
    "somali crypto writers",
    "mxcrypto authors",
    "wararka crypto somali",
  ],
  alternates: { canonical: "/authors" },
  openGraph: {
    title: "Crypto Authors Somali | MxCrypto",
    description: "Qorayaasha MxCrypto ee wararka crypto Somali.",
    type: "website",
    images: [{ url: "/brand/mxcrypto-logo.png" }],
  },
};

export const revalidate = 900;

export default async function AuthorsPage() {
  const items = await fetchAuthorCorpus({ pages: 4, pageSize: 160 });
  const authors = collectAuthorSummaries(items, 120);

  const listJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "MxCrypto authors",
    itemListElement: authors.slice(0, 100).map((a, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      url: `https://www.mxcrypto.net/authors/${a.slug}`,
      name: a.name,
    })),
  };

  return (
    <main className="mx-container pt-8 pb-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(listJsonLd) }}
      />

      <header className="border-b mx-hairline pb-4">
        <div className="mx-mono text-[12px] font-semibold tracking-widest text-[rgb(var(--accent))]">
          AUTHORS
        </div>
        <h1 className="mx-headline mt-3 text-[40px] font-semibold leading-[1.04] text-white md:text-[54px]">
          Qorayaasha Crypto ee MxCrypto
        </h1>
        <p className="mt-3 max-w-[84ch] text-[15px] leading-relaxed text-white/68">
          Liiskan wuxuu muujinayaa qorayaasha wararka crypto Somali iyo mixed
          Somali-English ee ka muuqda MxCrypto.
        </p>
      </header>

      <section className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {authors.map((a) => (
          <Link
            key={a.slug}
            href={`/authors/${a.slug}`}
            className="rounded-[12px] border mx-hairline bg-white/[0.02] px-4 py-4 transition-colors hover:bg-white/[0.06]"
          >
            <div className="text-[17px] font-semibold text-white">{a.name}</div>
            <div className="mx-mono mt-1 text-[11px] text-white/48">
              {a.count} qoraal • {a.latestAt ? timeAgo(a.latestAt) : "—"}
            </div>
          </Link>
        ))}
      </section>
    </main>
  );
}

