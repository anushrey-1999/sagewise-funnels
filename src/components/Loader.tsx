"use client";

import { useEffect, useRef, useState } from "react";

const CYCLING_LINES = [
  "Reviewing your financial profile...",
  "Scanning rates from top lenders...",
  "Ranking your personalized offers...",
  "Almost ready with your matches...",
];

const MASTER_DURATION = 3200;
const EXIT_DURATION = 310;
const STATUS_FADE_DURATION = 260;
const STATUS_GAP = 80;

type StatusPhase = "entering" | "visible" | "leaving";

interface LoaderProps {
  onComplete?: () => void;
  loaderText?: string;
}

export function Loader({
  onComplete,
  loaderText = "Sit tight while we secure your free quotes.",
}: LoaderProps) {
  const [fillProgress, setFillProgress] = useState(0);
  const [isExiting, setIsExiting] = useState(false);
  const [lineIndex, setLineIndex] = useState(0);
  const [statusPhase, setStatusPhase] = useState<StatusPhase>("entering");
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    let cancelled = false;
    let frameId = 0;
    let progress = 0;
    const timers = new Set<ReturnType<typeof setTimeout>>();

    const delay = (duration: number) =>
      new Promise<void>((resolve) => {
        const timer = setTimeout(() => {
          timers.delete(timer);
          resolve();
        }, duration);
        timers.add(timer);
      });

    const fillTo = (
      target: number,
      duration: number,
      easing: (value: number) => number
    ) =>
      new Promise<void>((resolve) => {
        const startProgress = progress;
        const startTime = performance.now();

        const animate = (now: number) => {
          if (cancelled) {
            resolve();
            return;
          }

          const elapsed = Math.min((now - startTime) / duration, 1);
          progress =
            startProgress + (target - startProgress) * easing(elapsed);
          setFillProgress(progress);

          if (elapsed < 1) {
            frameId = requestAnimationFrame(animate);
          } else {
            progress = target;
            setFillProgress(target);
            resolve();
          }
        };

        frameId = requestAnimationFrame(animate);
      });

    const easeOutCubic = (value: number) => 1 - Math.pow(1 - value, 3);
    const easeOutBurst = (value: number) => 1 - Math.pow(1 - value, 5);

    const runBar = async () => {
      await delay(300);
      await fillTo(18, 280, easeOutCubic);
      await delay(250);
      await fillTo(38, 240, easeOutCubic);
      await delay(230);
      await fillTo(56, 200, easeOutCubic);
      await delay(210);
      await fillTo(70, 160, easeOutCubic);
      await delay(190);
      await fillTo(100, 200, easeOutBurst);
    };

    const transitionStatus = async (nextIndex: number) => {
      setStatusPhase("leaving");
      await delay(STATUS_FADE_DURATION);
      if (cancelled) return;
      setLineIndex(nextIndex);
      setStatusPhase("entering");
      await delay(STATUS_GAP);
      if (cancelled) return;
      setStatusPhase("visible");
      await delay(STATUS_FADE_DURATION);
    };

    const runStatus = async () => {
      await delay(300);
      if (cancelled) return;
      setStatusPhase("visible");
      await delay(STATUS_FADE_DURATION);
      await delay(300);
      await transitionStatus(1);
      await delay(220);
      await transitionStatus(2);
      await delay(180);
      await transitionStatus(3);
    };

    void runBar();
    void runStatus();

    const completionTimer = setTimeout(() => {
      if (cancelled) return;
      setIsExiting(true);

      const redirectTimer = setTimeout(() => {
        if (!cancelled) onCompleteRef.current?.();
      }, EXIT_DURATION);
      timers.add(redirectTimer);
    }, MASTER_DURATION);
    timers.add(completionTimer);

    return () => {
      cancelled = true;
      cancelAnimationFrame(frameId);
      timers.forEach(clearTimeout);
    };
  }, []);

  const statusStyle =
    statusPhase === "visible"
      ? { opacity: 1, transform: "translateY(0)" }
      : statusPhase === "leaving"
        ? { opacity: 0, transform: "translateY(8px)" }
        : { opacity: 0, transform: "translateY(-8px)" };

  return (
    <div
      className={`sw-interstitial fixed inset-0 z-9999 bg-[#0D1B2A] ${
        isExiting ? "sw-interstitial--exiting" : ""
      }`}
    >
      <div
        className="sw-interstitial-layer absolute inset-0 overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, #0D1B2A 0%, #1B3A5C 100%)",
        }}
      >
        <div className="absolute top-[28%] left-1/2 flex w-full -translate-x-1/2 flex-col items-center px-6">
        {/* Leaf breathing and shimmer */}
        <div className="sw-loader-stagger sw-loader-stagger--leaf">
          <div className="sw-loader-leaf relative h-[94px] w-[54px]">
            <svg
              width="54"
              height="94"
              viewBox="0 0 126 243"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="absolute inset-0"
              aria-hidden="true"
            >
              <path
                d="M62.4418 209.866C65.3801 199.804 71.012 190.846 74.0727 180.415C83.1326 149.738 81.4186 117.588 65.5026 89.6101C62.9315 86.9105 63.6661 88.9966 64.1558 90.9599C72.3587 125.932 65.0129 166.917 44.5669 196.245C-5.87455 165.568 -15.4242 91.4508 25.835 48.625C55.2184 18.193 84.6018 33.6544 107.741 62.0004C138.349 99.6723 127.085 162.377 92.4373 193.914C88.5195 197.472 70.8895 210.725 66.7269 210.97C62.5642 211.216 63.911 209.989 62.4418 209.866Z"
                fill="white"
              />
            </svg>
            <span className="sw-loader-leaf-shimmer" aria-hidden="true" />
          </div>
        </div>

        {/* Sagewise wordmark */}
        <span className="sw-loader-stagger sw-loader-stagger--word mt-4 text-[18px] font-semibold tracking-[0.06em] text-white">
          Sagewise
        </span>

        {/* Horizontal progress bar */}
        <div className="sw-loader-stagger sw-loader-stagger--bar mt-7 h-1 w-[min(350px,calc(100vw-48px))] overflow-hidden rounded-full bg-white/12 md:w-[520px]">
          <div
            className="h-full bg-white rounded-full"
            style={{ width: `${fillProgress}%` }}
          />
        </div>

        {/* Static subheading from config */}
        <p className="sw-loader-stagger sw-loader-stagger--header mt-8 px-6 text-center text-[22px] font-semibold tracking-[-0.018em] text-white/95 md:text-[26px]">
          {loaderText}
        </p>

        <div className="sw-loader-stagger sw-loader-stagger--status mt-3 min-h-7">
          <p
            className="text-center text-[16px] tracking-[0.04em] text-white/75 transition-[opacity,transform] duration-[240ms] ease-out md:text-[18px]"
            style={statusStyle}
            aria-live="polite"
          >
            {CYCLING_LINES[lineIndex]}
          </p>
        </div>
        </div>

        {/* Bottom security notice */}
        <div className="absolute bottom-8 flex w-full items-center justify-center gap-1.5 px-6 text-center text-[11px] text-white/65">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          <span>Your information is secure. 256-bit SSL encryption</span>
        </div>
      </div>
    </div>
  );
}
