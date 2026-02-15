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
      <div className="mx-shadow-card relative overflow-hidden rounded-2xl border mx-hairline bg-[rgba(0,0,0,0.72)] backdrop-blur-xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgb(var(--accent)/0.22),transparent_58%),linear-gradient(135deg,rgba(255,255,255,0.05),rgba(255,255,255,0.01))]" />

        <div className="relative flex items-stretch gap-3 p-3">
          <div className="grid w-[92px] shrink-0 place-items-center rounded-xl border mx-hairline bg-black/35 px-2 py-2">
            <div className="mx-headline text-[18px] font-semibold leading-none">
              <span className="text-[rgb(var(--accent))]">mx</span>
              <span className="text-white">crypto</span>
            </div>
            <div className="mx-mono mt-1 text-[10px] font-semibold tracking-widest text-white/55">
              KOORSO
            </div>
          </div>

          <div className="min-w-0 flex-1 pr-9">
            <div className="mx-mono text-[10px] font-semibold tracking-widest text-white/55">
              BARO CRYPTO
            </div>
            <div className="mx-headline mt-1 text-[15px] font-semibold leading-snug text-white/90">
              Bilaabid fudud: wallet, amni, iyo sida loo fahmo suuqa.
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
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

          <button
            type="button"
            onClick={dismiss}
            aria-label="Xir"
            className="absolute right-2 top-2 grid h-9 w-9 place-items-center rounded-xl border mx-hairline bg-white/[0.02] text-white/70 hover:bg-white/[0.06] hover:text-white"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
