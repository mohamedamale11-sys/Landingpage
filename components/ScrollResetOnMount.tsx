"use client";

import { useEffect } from "react";

export function ScrollResetOnMount() {
  useEffect(() => {
    const run = () => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };

    run();
    const raf = requestAnimationFrame(run);
    return () => cancelAnimationFrame(raf);
  }, []);

  return null;
}
