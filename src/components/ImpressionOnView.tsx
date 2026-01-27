"use client";

import { ReactNode, useEffect, useRef } from "react";
import { injectImpressionScript } from "@/lib/injectImpressionScript";

interface ImpressionOnViewProps {
  impressionScript?: string;
  children: ReactNode;
  /**
   * Optional unique key to dedupe across re-mounts (route transitions).
   */
  dedupeKey?: string;
  /**
   * Optional label for debugging (e.g., card heading/advertiser).
   */
  debugLabel?: string;
}

const firedKeys = new Set<string>();

export default function ImpressionOnView({
  impressionScript,
  children,
  dedupeKey,
  debugLabel,
}: ImpressionOnViewProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const hasFiredRef = useRef(false);

  useEffect(() => {
    if (!impressionScript) return;
    if (!ref.current) return;

    if (dedupeKey && firedKeys.has(dedupeKey)) {
      hasFiredRef.current = true;
      return;
    }

    const el = ref.current;
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry?.isIntersecting) return;

        if (hasFiredRef.current) return;
        hasFiredRef.current = true;
        if (dedupeKey) firedKeys.add(dedupeKey);

        // Dev-only debug logging to verify viewport trigger.
        if (process.env.NODE_ENV !== "production") {
          // eslint-disable-next-line no-console
          console.debug("[ImpressionOnView] card became visible", {
            dedupeKey,
            debugLabel,
            intersectionRatio: entry.intersectionRatio,
          });
        }

        // Fire and forget; script tags do their own work.
        void injectImpressionScript(impressionScript);
        observer.disconnect();
      },
      {
        // Preload slightly before fully in-view for smoother tracking on fast scroll.
        rootMargin: "200px 0px",
        threshold: 0.15,
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [impressionScript, dedupeKey]);

  // Wrap without affecting layout.
  return (
    <div ref={ref} className="w-full">
      {children}
    </div>
  );
}

