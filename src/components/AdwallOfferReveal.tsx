"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import ImpressionOnView from "@/components/ImpressionOnView";

interface AdwallOfferRevealProps {
  children: ReactNode;
  animate: boolean;
  index: number;
  impressionScript?: string;
  dedupeKey: string;
  debugLabel: string;
}

/** Keep the real card mounted so its skeleton occupies exactly the same space. */
export default function AdwallOfferReveal({
  children, animate, index, impressionScript, dedupeKey, debugLabel,
}: AdwallOfferRevealProps) {
  // Only the first few offers need entrance layers; long walls don't accumulate them.
  const shouldAnimate = animate && index < 4;
  const [revealed, setRevealed] = useState(!shouldAnimate);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!shouldAnimate) return;
    let cancelled = false;
    // CSS starts at first paint, not hydration. If hydration is late (or motion
    // is reduced), the animation is already over and offers unlock immediately.
    const animations = contentRef.current?.getAnimations() ?? [];
    void Promise.allSettled(animations.map((animation) => animation.finished)).then(() => {
      if (!cancelled) setRevealed(true);
    });
    return () => { cancelled = true; };
  }, [shouldAnimate]);

  const entering = shouldAnimate && !revealed;

  return (
    <div
      className="sw-offer-reveal relative w-full"
      data-entering={entering || undefined}
      style={{ "--offer-delay": `${180 + Math.min(index, 3) * 40}ms` } as CSSProperties}
      aria-busy={entering || undefined}
    >
      {entering && (
        <div className="sw-offer-skeleton" aria-hidden="true">
          <div className="sw-offer-skeleton-logo" />
          <div className="sw-offer-skeleton-copy">
            <span /><span /><span /><span />
          </div>
          <div className="sw-offer-skeleton-cta" />
        </div>
      )}
      <div ref={contentRef} className="sw-offer-content" inert={entering}>
        <ImpressionOnView
          enabled={!entering}
          impressionScript={impressionScript}
          dedupeKey={dedupeKey}
          debugLabel={debugLabel}
        >
          {children}
        </ImpressionOnView>
      </div>
    </div>
  );
}
