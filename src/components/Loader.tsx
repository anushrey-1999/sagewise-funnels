"use client";

import { useEffect, useRef, useState } from "react";

const CYCLING_LINES = [
  "Reviewing your financial profile...",
  "Scanning rates from top lenders...",
  "Ranking your personalized offers...",
  "Almost ready with your matches...",
];

// Absolute marks from the Interstitial Routing & Timing Fix Spec (section 5).
const FIRST_STATUS_AT = 400;
const LAST_STATUS_AT = 2420;
const COMPLETION_AT = 3180;
const PIVOT_AT = 3600;

const STATUS_FADE_DURATION = 240;
const STATUS_GAP = 80;

// Four discrete bursts with deliberate pauses between them, never a continuous pour.
const BAR_SEGMENTS = [
  { at: 400, to: 25, duration: 280 },
  { at: 1400, to: 50, duration: 260 },
  { at: 2420, to: 75, duration: 240 },
  { at: 2960, to: 100, duration: 220 },
];

type StatusPhase = "entering" | "visible" | "leaving";

interface LoaderProps {
  onComplete?: () => void;
  loaderText?: string;
  header?: string;
  statusLines?: string[];
}

/**
 * Spreads the status steps evenly across the readable window so each line gets
 * roughly a second of dwell, whatever the variant's step count.
 */
function getStatusSchedule(count: number): number[] {
  if (count <= 1) return [FIRST_STATUS_AT];

  const spacing = (LAST_STATUS_AT - FIRST_STATUS_AT) / (count - 1);
  return Array.from({ length: count }, (_, index) =>
    Math.round(FIRST_STATUS_AT + index * spacing)
  );
}

export function Loader({
  onComplete,
  loaderText = "Sit tight while we secure your free quotes.",
  header,
  statusLines,
}: LoaderProps) {
  const [fillProgress, setFillProgress] = useState(0);
  const [lineIndex, setLineIndex] = useState(0);
  const [statusPhase, setStatusPhase] = useState<StatusPhase>("entering");
  const [isComplete, setIsComplete] = useState(false);
  const onCompleteRef = useRef(onComplete);

  const headline = header ?? loaderText;
  const lines = statusLines?.length ? statusLines : CYCLING_LINES;
  // The step count is fixed for the life of the interstitial, so the schedule is built once.
  const [stepCount] = useState(lines.length);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    let cancelled = false;
    let frameId = 0;
    let progress = 0;
    const timers = new Set<ReturnType<typeof setTimeout>>();
    const mountedAt = performance.now();

    const after = (wait: number, run: () => void) => {
      const timer = setTimeout(() => {
        timers.delete(timer);
        if (!cancelled) run();
      }, Math.max(0, wait));
      timers.add(timer);
    };

    const at = (mark: number, run: () => void) =>
      after(mark - (performance.now() - mountedAt), run);

    const easeOutCubic = (value: number) => 1 - Math.pow(1 - value, 3);

    const fillTo = (target: number, duration: number) => {
      const startProgress = progress;
      const startTime = performance.now();

      const animate = (now: number) => {
        if (cancelled) return;

        const elapsed = Math.min((now - startTime) / duration, 1);
        progress = startProgress + (target - startProgress) * easeOutCubic(elapsed);
        setFillProgress(progress);

        if (elapsed < 1) {
          frameId = requestAnimationFrame(animate);
        } else {
          progress = target;
          setFillProgress(target);
        }
      };

      frameId = requestAnimationFrame(animate);
    };

    BAR_SEGMENTS.forEach((segment) => {
      at(segment.at, () => fillTo(segment.to, segment.duration));
    });

    getStatusSchedule(stepCount).forEach((mark, index) => {
      at(mark, () => {
        if (index === 0) {
          setLineIndex(0);
          setStatusPhase("visible");
          return;
        }

        // Outgoing drops away, then the incoming line rises into place after the gap.
        setStatusPhase("leaving");
        after(STATUS_FADE_DURATION, () => {
          setLineIndex(index);
          setStatusPhase("entering");
          after(STATUS_GAP, () => setStatusPhase("visible"));
        });
      });
    });

    // Leaf motion settles as the bar lands on 100%, then nothing moves until the pivot.
    at(COMPLETION_AT, () => setIsComplete(true));

    // The interstitial stays fully painted until the browser swaps in the adwall
    // document, so the completed state holds if the adwall is not ready yet.
    at(PIVOT_AT, () => onCompleteRef.current?.());

    return () => {
      cancelled = true;
      cancelAnimationFrame(frameId);
      timers.forEach(clearTimeout);
    };
  }, [stepCount]);

  // Outgoing drops away; incoming waits below and rises into place.
  const statusStyle =
    statusPhase === "visible"
      ? { opacity: 1, transform: "translateY(0)" }
      : { opacity: 0, transform: "translateY(7px)" };

  return (
    <div className="sw-interstitial fixed inset-0 z-9999 bg-[#0D1B2A]">
      <div
        className="absolute inset-0 overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #0D1B2A 0%, #1B3A5C 100%)",
        }}
      >
        <div className="absolute top-[28%] left-1/2 flex w-full max-w-[520px] -translate-x-1/2 flex-col items-center px-6">
          {/* Leaf — 2.2s curated pulse synced with the shimmer, settling at completion */}
          <div
            className={`sw-loader-leaf relative h-[60px] w-[31px] md:h-[76px] md:w-[39px] ${
              isComplete ? "sw-loader-leaf--settled" : ""
            }`}
          >
            <svg
              viewBox="0 0 126 243"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="absolute inset-0 h-full w-full"
              aria-hidden="true"
            >
              <path
                d="M62.4418 209.866C65.3801 199.804 71.012 190.846 74.0727 180.415C83.1326 149.738 81.4186 117.588 65.5026 89.6101C62.9315 86.9105 63.6661 88.9966 64.1558 90.9599C72.3587 125.932 65.0129 166.917 44.5669 196.245C-5.87455 165.568 -15.4242 91.4508 25.835 48.625C55.2184 18.193 84.6018 33.6544 107.741 62.0004C138.349 99.6723 127.085 162.377 92.4373 193.914C88.5195 197.472 70.8895 210.725 66.7269 210.97C62.5642 211.216 63.911 209.989 62.4418 209.866Z"
                fill="white"
              />
            </svg>
            <span className="sw-loader-leaf-shimmer" aria-hidden="true" />
          </div>

          {/* Sagewise wordmark */}
          <span className="mt-[11px] text-[18px] font-semibold tracking-[0.06em] text-white">
            Sagewise
          </span>

          {/* Four-segment progress bar */}
          <div className="mt-7 h-1 w-[min(350px,calc(100vw-48px))] overflow-hidden rounded-full bg-white/12 md:w-[520px]">
            <div
              className="h-full rounded-full bg-white"
              style={{ width: `${fillProgress}%` }}
            />
          </div>

          {/* Header — still and present from frame 0 */}
          <p className="mt-8 text-center text-[22px] font-semibold tracking-[-0.018em] text-white/95 md:text-[26px]">
            {headline}
          </p>

          <div className="mt-3 min-h-6">
            <p
              className="sw-loader-status text-center text-[14px] font-normal tracking-[0.04em] text-white/65 transition-[opacity,transform] duration-[240ms] ease-out md:text-[16px]"
              style={statusStyle}
              aria-live="polite"
            >
              {lines[lineIndex]}
            </p>
          </div>
        </div>

        {/* Trust row */}
        <div className="absolute bottom-8 flex w-full items-center justify-center gap-1.5 px-6 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-white/70" aria-hidden="true"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          <span className="text-[12px] text-white/60">Your information is secure.</span>
        </div>
      </div>
    </div>
  );
}
