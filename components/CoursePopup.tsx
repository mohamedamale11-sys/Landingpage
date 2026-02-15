"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { COURSE_HREF } from "@/lib/constants";

const STORAGE_KEY = "mx_course_promo_dismissed_v1";
const DISMISS_FOR_DAYS = 7;

function shouldShowOnRoute(pathname: string) {
  if (!pathname) return false;
  return pathname === "/" || pathname.startsWith("/news/");
}

export function CoursePopup() {
  const pathname = usePathname();
  const allowed = useMemo(() => shouldShowOnRoute(pathname || ""), [pathname]);

  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!allowed) return;

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const ts = Number(raw);
        if (Number.isFinite(ts) && Date.now() - ts < DISMISS_FOR_DAYS * 86400_000) {
          return;
        }
      }
    } catch {
      // ignore
    }

    const t = window.setTimeout(() => setOpen(true), 1600);
    return () => window.clearTimeout(t);
  }, [allowed]);

  function dismiss() {
    setOpen(false);
    try {
      localStorage.setItem(STORAGE_KEY, String(Date.now()));
    } catch {
      // ignore
    }
  }

  if (!allowed || !open) return null;

  return (
    <div
      className="fixed left-3 right-3 z-[60] md:hidden"
      style={{ bottom: "calc(12px + env(safe-area-inset-bottom))" }}
    >
      <div className="relative overflow-hidden rounded-2xl border border-black/10 bg-white shadow-[0_18px_50px_rgba(0,0,0,0.55)]">
        <div className="relative flex items-stretch gap-3 p-3">
          <div className="flex w-[108px] shrink-0 flex-col items-center justify-center rounded-xl bg-black px-2 py-2">
            <div className="mx-brand text-[16px] font-semibold leading-none tracking-tight">
              <span className="text-[rgb(var(--accent))]">Mx</span>
              <span className="text-white">Crypto</span>
            </div>
            <div className="mx-mono mt-2 text-[10px] font-semibold tracking-widest text-white/55">
              BARO
            </div>
          </div>

          <div className="min-w-0 flex-1 pr-9">
            <div className="mx-mono text-[10px] font-semibold tracking-widest text-black/55">
              KOORSO BILAASH
            </div>
            <div className="mx-headline mt-1 text-[16px] font-semibold leading-snug text-black">
              Baro Crypto Af-Soomaali
            </div>
            <div className="mt-1 text-[12px] leading-relaxed text-black/70">
              Wallet + amni, aasaaska Bitcoin/Ethereum, iyo fahamka suuqa.
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <a
                href={COURSE_HREF}
                target="_blank"
                rel="noopener noreferrer"
                className="mx-mono rounded-full bg-black px-4 py-2 text-[12px] font-semibold text-white hover:bg-black/90"
              >
                Fur ↗
              </a>
              <Link
                href="/baro"
                className="mx-mono rounded-full border border-black/10 bg-white px-4 py-2 text-[12px] font-semibold text-black/80 hover:bg-black/[0.03]"
              >
                Faahfaahin
              </Link>
            </div>
          </div>

          <button
            type="button"
            onClick={dismiss}
            aria-label="Xir"
            className="absolute right-2 top-2 grid h-9 w-9 place-items-center rounded-xl border border-black/10 bg-white text-black/55 hover:bg-black/[0.04] hover:text-black"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
