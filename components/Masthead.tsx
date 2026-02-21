"use client";

import Link from "next/link";
import { Search, X } from "lucide-react";
import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { COURSE_HREF } from "@/lib/constants";

function Wordmark(props: { size?: "sm" | "md" }) {
  const isSm = props.size === "sm";
  return (
    <div
      className={[
        "mx-brand font-semibold leading-none tracking-tight",
        isSm ? "text-[18px]" : "text-[20px]",
      ].join(" ")}
      aria-label="MxCrypto"
    >
      <span className="text-[rgb(var(--accent))]">Mx</span>
      <span className="text-white">Crypto</span>
    </div>
  );
}

function buildHref(params: URLSearchParams, patch: Record<string, string | null>) {
  const next = new URLSearchParams(params.toString());
  for (const [k, v] of Object.entries(patch)) {
    if (v === null || v === "") next.delete(k);
    else next.set(k, v);
  }
  // MVP: one unified feed, no section filters.
  next.delete("section");
  // When changing query, reset pagination.
  if ("q" in patch) next.delete("offset");
  const qs = next.toString();
  return qs ? `/?${qs}` : "/";
}

export function Masthead() {
  const pathname = usePathname() || "/";
  const sp = useSearchParams();
  const router = useRouter();

  const onData = pathname.startsWith("/data");
  const onChat = pathname.startsWith("/chat");
  const onBaro = pathname === "/baro";
  const onBitcoin =
    pathname === "/wararka-bitcoin" ||
    pathname === "/wararka-ethereum" ||
    pathname === "/qiimaha-bitcoin-maanta";
  const onCrypto = pathname === "/crypto-somali";
  const onMeme = pathname === "/memecoin-somali";
  const onNews = !onData && !onChat && !onBaro && !onBitcoin && !onCrypto && !onMeme;

  const q = sp.get("q") || "";

  const [searchOpen, setSearchOpen] = useState<boolean>(q.trim() !== "");
  const [draft, setDraft] = useState<string>(q);

  function submitSearch(nextQ: string) {
    const params = new URLSearchParams(sp.toString());
    router.push(buildHref(params, { q: nextQ.trim() || null }));
  }

  return (
    <header className="sticky top-0 z-50 border-b mx-hairline bg-[rgba(0,0,0,0.82)] backdrop-blur-xl">
      <div className="mx-container">
        <div className="flex h-14 items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-3">
            <div className="leading-tight">
              <Wordmark />
              <div className="mx-mono hidden text-[11px] font-semibold tracking-widest text-white/55 sm:block">
                WARARKA CRYPTO
              </div>
            </div>
          </Link>

          <nav className="hidden items-center gap-6 lg:flex">
            <Link
              href="/"
              className={[
                "mx-mono text-[12px] font-semibold tracking-widest transition",
                onNews ? "text-white" : "text-white/55 hover:text-white/85",
              ].join(" ")}
            >
              Warar
            </Link>

            <Link
              href="/data"
              className={[
                "mx-mono text-[12px] font-semibold tracking-widest transition",
                onData ? "text-white" : "text-white/55 hover:text-white/85",
              ].join(" ")}
            >
              Xog
            </Link>

            <Link
              href="/chat"
              className={[
                "mx-mono text-[12px] font-semibold tracking-widest transition",
                onChat ? "text-white" : "text-white/55 hover:text-white/85",
              ].join(" ")}
            >
              AI
            </Link>

            <Link
              href="/crypto-somali"
              className={[
                "mx-mono text-[12px] font-semibold tracking-widest transition",
                onCrypto ? "text-white" : "text-white/55 hover:text-white/85",
              ].join(" ")}
            >
              Crypto
            </Link>

            <Link
              href="/wararka-bitcoin"
              className={[
                "mx-mono text-[12px] font-semibold tracking-widest transition",
                onBitcoin ? "text-white" : "text-white/55 hover:text-white/85",
              ].join(" ")}
            >
              Bitcoin
            </Link>

            <Link
              href="/memecoin-somali"
              className={[
                "mx-mono text-[12px] font-semibold tracking-widest transition",
                onMeme ? "text-white" : "text-white/55 hover:text-white/85",
              ].join(" ")}
            >
              Meme
            </Link>

            <Link
              href="/baro"
              className={[
                "mx-mono text-[12px] font-semibold tracking-widest transition",
                onBaro ? "text-white" : "text-white/55 hover:text-white/85",
              ].join(" ")}
            >
              Baro
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <a
              href={COURSE_HREF}
              target="_blank"
              rel="noopener noreferrer"
              className="mx-mono hidden rounded-full border mx-hairline bg-white/[0.02] px-4 py-2 text-[12px] font-semibold text-white/70 hover:bg-white/[0.06] hover:text-white lg:inline-flex"
            >
              Free courses
            </a>
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
        <div className="lg:hidden border-t mx-hairline">
          <div className="-mx-4 overflow-x-auto px-4 py-2">
            <div className="mx-mono flex items-center gap-6 text-[12px] font-semibold tracking-widest">
              <Link
                href="/"
                aria-current={onNews ? "page" : undefined}
                className={[
                  "shrink-0 border-b-2 pb-2 transition",
                  onNews
                    ? "border-white/70 text-white"
                    : "border-transparent text-white/55 hover:text-white/85",
                ].join(" ")}
              >
                Warar
              </Link>
              <Link
                href="/data"
                className={[
                  "shrink-0 border-b-2 pb-2 transition",
                  onData
                    ? "border-white/70 text-white"
                    : "border-transparent text-white/55 hover:text-white/85",
                ].join(" ")}
              >
                Xog
              </Link>
              <Link
                href="/chat"
                className={[
                  "shrink-0 border-b-2 pb-2 transition",
                  onChat
                    ? "border-white/70 text-white"
                    : "border-transparent text-white/55 hover:text-white/85",
                ].join(" ")}
              >
                AI
              </Link>
              <Link
                href="/crypto-somali"
                className={[
                  "shrink-0 border-b-2 pb-2 transition",
                  onCrypto
                    ? "border-white/70 text-white"
                    : "border-transparent text-white/55 hover:text-white/85",
                ].join(" ")}
              >
                Crypto
              </Link>
              <Link
                href="/wararka-bitcoin"
                className={[
                  "shrink-0 border-b-2 pb-2 transition",
                  onBitcoin
                    ? "border-white/70 text-white"
                    : "border-transparent text-white/55 hover:text-white/85",
                ].join(" ")}
              >
                Bitcoin
              </Link>
              <Link
                href="/memecoin-somali"
                className={[
                  "shrink-0 border-b-2 pb-2 transition",
                  onMeme
                    ? "border-white/70 text-white"
                    : "border-transparent text-white/55 hover:text-white/85",
                ].join(" ")}
              >
                Meme
              </Link>
              <Link
                href="/baro"
                className={[
                  "shrink-0 border-b-2 pb-2 transition",
                  onBaro
                    ? "border-white/70 text-white"
                    : "border-transparent text-white/55 hover:text-white/85",
                ].join(" ")}
              >
                Baro
              </Link>
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
                className="h-10 w-full rounded-xl border mx-hairline bg-black/20 px-3 text-[14px] text-white/85 placeholder:text-white/35 focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent)/0.28)]"
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
