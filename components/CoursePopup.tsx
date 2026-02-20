"use client";

import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { useMemo, useState } from "react";
import { COURSE_HREF } from "@/lib/constants";

function shouldShowOnRoute(pathname: string) {
  if (!pathname) return false;
  return pathname === "/" || pathname.startsWith("/news/");
}

const SESSION_KEY = "mxcrypto_course_popup_dismissed";

export function CoursePopup() {
  const pathname = usePathname();
  const allowed = useMemo(() => shouldShowOnRoute(pathname || ""), [pathname]);

  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      const raw = window.sessionStorage.getItem(SESSION_KEY);
      return raw === "1";
    } catch {
      // Ignore storage errors (private mode).
      return false;
    }
  });

  function dismiss() {
    setDismissed(true);
    try {
      window.sessionStorage.setItem(SESSION_KEY, "1");
    } catch {
      // Ignore storage errors.
    }
  }

  if (!allowed || dismissed) return null;

  return (
    <div
      className="fixed left-3 right-3 z-[60] md:hidden"
      style={{ bottom: "calc(10px + env(safe-area-inset-bottom))" }}
    >
      <div className="relative overflow-hidden rounded-2xl border mx-hairline bg-[rgba(9,11,15,0.95)] backdrop-blur-md shadow-[0_16px_40px_rgba(0,0,0,0.5)]">
        <div className="h-px bg-[linear-gradient(90deg,rgba(0,255,170,0),rgba(0,255,170,0.85),rgba(0,255,170,0))]" />
        <div className="relative flex items-center gap-3 p-3 pr-10">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <div className="mx-brand text-[16px] font-semibold leading-none tracking-tight">
                <span className="text-[rgb(var(--accent))]">Mx</span>
                <span className="text-white">Crypto</span>
              </div>
              <div className="mx-mono text-[9px] font-semibold tracking-widest text-white/50">
                FREE COURSES
              </div>
            </div>
            <div className="mt-1 text-[12px] leading-relaxed text-white/72">
              Bilow free courses crypto ah oo af-Soomaali ah.
            </div>
          </div>

          <a
            href={COURSE_HREF}
            target="_blank"
            rel="noopener noreferrer"
            className="mx-mono shrink-0 rounded-full bg-[rgb(var(--accent))] px-3 py-2 text-[11px] font-semibold text-black hover:opacity-90"
          >
            Free courses ↗
          </a>

          <button
            type="button"
            onClick={dismiss}
            aria-label="Xir"
            className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-lg border mx-hairline bg-black/30 text-white/55 hover:bg-white/[0.06] hover:text-white"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
