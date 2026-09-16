"use client";

import { useEffect, useRef, useState } from "react";

const CYCLING_LINES = [
  "Reviewing your financial profile...",
  "Scanning rates from top lenders...",
  "Ranking your personalized offers...",
];

const COMPLETION_STATUS = "Matches found! Loading options…";

// Absolute marks from the Sept 2026 Interstitial → AdWall Production Spec.
const STATUS_AT = [400, 1370, 2380] as const;
const COMPLETION_AT = 2900;
const REVEAL_AT = 3800;
const STATUS_FADE_DURATION = 240;
const PROGRESS_DURATION = 190;

const BAR_SEGMENTS = [
  { at: 400, to: 25 },
  { at: 1250, to: 50 },
  { at: 2150, to: 75 },
  { at: 2900, to: 100 },
] as const;

type StatusPhase = "entering" | "visible" | "leaving";

interface LoaderProps {
  onComplete?: () => void;
  loaderText?: string;
  header?: string;
  statusLines?: string[];
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
  const lines = (statusLines?.length ? statusLines : CYCLING_LINES).slice(0, STATUS_AT.length);
  const [stepCount] = useState(lines.length);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    let cancelled = false;
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

    const showLine = (index: number) => {
      setLineIndex(index);
      setStatusPhase("entering");
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (!cancelled) setStatusPhase("visible");
        });
      });
    };

    BAR_SEGMENTS.forEach((segment) => {
      at(segment.at, () => setFillProgress(segment.to));
    });

    STATUS_AT.slice(0, stepCount).forEach((mark, index) => {
      at(mark, () => {
        if (index === 0) {
          showLine(0);
          return;
        }

        setStatusPhase("leaving");
        after(STATUS_FADE_DURATION, () => showLine(index));
      });
    });

    at(COMPLETION_AT, () => {
      setFillProgress(100);
      setIsComplete(true);
      setStatusPhase("leaving");
      after(STATUS_FADE_DURATION, () => {
        setLineIndex(stepCount);
        setStatusPhase("entering");
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            if (!cancelled) setStatusPhase("visible");
          });
        });
      });
    });

    at(REVEAL_AT, () => onCompleteRef.current?.());

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, [stepCount]);

  const statusText = lineIndex >= stepCount ? COMPLETION_STATUS : lines[lineIndex];
  const statusStyle =
    statusPhase === "visible"
      ? { opacity: 1, transform: "translateY(0)" }
      : statusPhase === "leaving"
        ? { opacity: 0, transform: "translateY(7px)" }
        : { opacity: 0, transform: "translateY(-7px)" };

  return (
    <div className="sw-interstitial fixed inset-0 z-9999 bg-intr-top">
      <div
        className="absolute inset-0 overflow-hidden"
        style={{
          background: "linear-gradient(135deg, var(--intr-top) 0%, var(--intr-bottom) 100%)",
        }}
      >
        <div className="absolute top-[28%] left-1/2 flex w-full max-w-[520px] -translate-x-1/2 flex-col items-center px-6">
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

          <span className="mt-[11px] text-[18px] font-semibold tracking-[0.06em] text-white">
            Sagewise
          </span>

          <div
            className="mt-7 h-1 w-[min(350px,calc(100vw-48px))] overflow-hidden rounded-full bg-white/12 md:w-[520px]"
            role="progressbar"
            aria-label={headline}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={fillProgress}
          >
            <div
              className="sw-loader-progress h-full rounded-full bg-white"
              style={{ width: `${fillProgress}%` }}
            />
          </div>

          <p className="mt-8 text-center text-[22px] font-semibold tracking-[-0.018em] text-white/95 md:text-[26px]">
            {headline}
          </p>

          <div className="mt-4 min-h-6" aria-live="polite" aria-atomic="true">
            <p
              className="sw-loader-status text-center text-[14px] font-normal tracking-[0.04em] text-white/65 transition-[opacity,transform] duration-[240ms] ease-out md:text-[16px]"
              style={statusStyle}
            >
              {statusText}
            </p>
          </div>
        </div>

        <div className="absolute bottom-8 flex w-full items-center justify-center gap-1.5 px-6 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-white/70" aria-hidden="true"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          <span className="text-[12px] text-white/60">Your information is secure.</span>
        </div>
      </div>
    </div>
  );
}
