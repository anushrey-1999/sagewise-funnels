"use client";

import { useLayoutEffect, useRef, useState } from "react";

/**
 * Measures the widest stats box (via [data-stats-equalize="true"]) within a
 * container and returns a min-width in pixels so all stats boxes align.
 */
export function useEqualStatsWidthPx(deps: unknown[] = []) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [statsMinWidthPx, setStatsMinWidthPx] = useState<number | undefined>(undefined);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let raf = 0;
    let ro: ResizeObserver | null = null;

    const measure = () => {
      const nodes = el.querySelectorAll<HTMLElement>('[data-stats-equalize="true"]');
      let max = 0;
      nodes.forEach((n) => {
        const w = Math.ceil(n.getBoundingClientRect().width);
        if (w > max) max = w;
      });
      setStatsMinWidthPx(max > 0 ? max : undefined);
    };

    const schedule = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(measure);
    };

    schedule();

    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(schedule);
      ro.observe(el);
    }
    window.addEventListener("resize", schedule);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", schedule);
      ro?.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { statsContainerRef: containerRef, statsMinWidthPx };
}
