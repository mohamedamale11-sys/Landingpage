"use client";

import Link from "next/link";
import { Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function LogoMark() {
  return (
    <div className="grid h-9 w-9 place-items-center rounded-xl border mx-hairline bg-white/[0.03]">
      <div className="h-4 w-4 rotate-45 border mx-hairline" />
    </div>
  );
}

type NavItem = { label: string; section: string | null };

const NAV: NavItem[] = [
  { label: "Warar", section: null },
  { label: "Suuqyada", section: "Suuqyada" },
  { label: "Siyaasad", section: "Siyaasad & Sharci" },
  { label: "Maaliyad", section: "Finance" },
  { label: "Teknooloji", section: "Teknoolojiyad" },
];

function buildHref(params: URLSearchParams, patch: Record<string, string | null>) {
  const next = new URLSearchParams(params.toString());
  for (const [k, v] of Object.entries(patch)) {
    if (v === null || v === "") next.delete(k);
    else next.set(k, v);
  }
  // When changing section/query, reset pagination.
  if ("section" in patch || "q" in patch) next.delete("offset");
  const qs = next.toString();
  return qs ? `/?${qs}` : "/";
}

export function Masthead() {
  const sp = useSearchParams();
  const router = useRouter();

  const activeSection = sp.get("section");
  const q = sp.get("q") || "";

  const [searchOpen, setSearchOpen] = useState<boolean>(q.trim() !== "");
  const [draft, setDraft] = useState<string>(q);

  const nav = useMemo(() => {
    const params = new URLSearchParams(sp.toString());
    return NAV.map((it) => {
      const href = buildHref(params, { section: it.section });
      const isActive = (it.section ?? null) === (activeSection ?? null);
      return { ...it, href, isActive };
    });
  }, [sp, activeSection]);

  function submitSearch(nextQ: string) {
    const params = new URLSearchParams(sp.toString());
    router.push(buildHref(params, { q: nextQ.trim() || null }));
  }

  return (
    <header className="sticky top-0 z-50 border-b mx-hairline bg-[rgba(0,0,0,0.82)] backdrop-blur-xl">
      <div className="mx-container">
        <div className="flex h-14 items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-3">
            <LogoMark />
            <div className="leading-tight">
              <div className="mx-headline text-[18px] font-semibold text-white">
                MxCrypto
              </div>
              <div className="mx-mono text-[11px] font-semibold tracking-widest text-white/55">
                WARARKA CRYPTO
              </div>
            </div>
          </Link>

          <nav className="hidden items-center gap-6 lg:flex">
            {nav.map((it) => (
              <Link
                key={it.label}
                href={it.href}
                className={[
                  "mx-mono text-[12px] font-semibold tracking-widest transition",
                  it.isActive
                    ? "text-white"
                    : "text-white/55 hover:text-white/85",
                ].join(" ")}
              >
                {it.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="grid h-10 w-10 place-items-center rounded-xl border mx-hairline bg-white/[0.02] text-white/75 hover:bg-white/[0.05] hover:text-white"
              aria-label="Raadi"
              onClick={() => setSearchOpen((v) => !v)}
            >
              {searchOpen ? <X size={18} /> : <Search size={18} />}
            </button>
          </div>
        </div>

        {/* Mobile/Tablet section tabs */}
        <div className="lg:hidden">
          <div className="-mx-4 overflow-x-auto px-4 pb-3">
            <div className="mx-mono flex items-center gap-2 text-[12px] font-semibold tracking-widest">
              {nav.map((it) => (
                <Link
                  key={it.label}
                  href={it.href}
                  aria-current={it.isActive ? "page" : undefined}
                  className={[
                    "shrink-0 rounded-full border px-3 py-2 transition",
                    it.isActive
                      ? "border-white/15 bg-white/[0.06] text-white"
                      : "border-white/10 bg-white/[0.02] text-white/70 hover:bg-white/[0.05] hover:text-white",
                  ].join(" ")}
                >
                  {it.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {searchOpen ? (
          <div className="pb-4">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                submitSearch(draft);
              }}
              className="flex items-center gap-2"
            >
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Raadi cinwaanada…"
                className="h-10 w-full rounded-xl border mx-hairline bg-black/20 px-3 text-[14px] text-white/85 placeholder:text-white/35 focus:outline-none focus:ring-2 focus:ring-[rgba(56,189,248,0.25)]"
              />
              <button
                type="submit"
                className="h-10 shrink-0 rounded-xl border mx-hairline bg-white/[0.04] px-4 mx-mono text-[12px] font-semibold text-white/80 hover:bg-white/[0.08]"
              >
                Raadi
              </button>
            </form>
          </div>
        ) : null}
      </div>
    </header>
  );
}
