"use client";

import { useEffect, useState } from "react";

const CYCLING_LINES = [
  "Reviewing your financial profile...",
  "Scanning rates from top lenders...",
  "Ranking your personalized offers...",
  "Almost ready with your matches...",
];

const TOTAL_DURATION = 4500; // ms — must match the fill animation
const LINE_DURATION = TOTAL_DURATION / CYCLING_LINES.length; // ms per line

interface LoaderProps {
  onComplete?: () => void;
  loaderText?: string;
}

export function Loader({
  onComplete,
  loaderText = "Sit tight while we secure your free quotes.",
}: LoaderProps) {
  const [fillProgress, setFillProgress] = useState(0);
  const [visible, setVisible] = useState(true);
  const [lineIndex, setLineIndex] = useState(0);

  // Fill animation
  useEffect(() => {
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / TOTAL_DURATION, 1);
      setFillProgress(progress * 100);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setTimeout(() => {
          if (onComplete) onComplete();
        }, 200);
      }
    };

    requestAnimationFrame(animate);
  }, [onComplete]);

  // Schedule each line swap independently on mount — no fillProgress dependency,
  // so React never cancels these timeouts between animation frames.
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    CYCLING_LINES.forEach((_, i) => {
      if (i === 0) return; // line 0 is the initial state

      // Fade out just before the swap, then swap + fade in
      const fadeOutAt = LINE_DURATION * i - 300;
      const swapAt    = LINE_DURATION * i;

      timers.push(setTimeout(() => setVisible(false), fadeOutAt));
      timers.push(setTimeout(() => {
        setLineIndex(i);
        setVisible(true);
      }, swapAt));
    });

    return () => timers.forEach(clearTimeout);
  }, []); // runs once on mount

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
      style={{
        background:
          "linear-gradient(160deg, #0c1d35 0%, #0a1628 60%, #081220 100%)",
      }}
    >
      <div className="flex flex-col items-center gap-5">
        {/* Leaf fill animation */}
        <div className="relative w-[52px] h-[100px]">
          <svg
            width="52"
            height="100"
            viewBox="0 0 126 243"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="absolute inset-0"
          >
            <path
              opacity="0.18"
              d="M62.4418 209.866C65.3801 199.804 71.012 190.846 74.0727 180.415C83.1326 149.738 81.4186 117.588 65.5026 89.6101C62.9315 86.9105 63.6661 88.9966 64.1558 90.9599C72.3587 125.932 65.0129 166.917 44.5669 196.245C-5.87455 165.568 -15.4242 91.4508 25.835 48.625C55.2184 18.193 84.6018 33.6544 107.741 62.0004C138.349 99.6723 127.085 162.377 92.4373 193.914C88.5195 197.472 70.8895 210.725 66.7269 210.97C62.5642 211.216 63.911 209.989 62.4418 209.866Z"
              fill="white"
            />
          </svg>

          <svg
            width="52"
            height="100"
            viewBox="0 0 126 243"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="absolute inset-0"
          >
            <defs>
              <clipPath id="clip-leaf-loader-dark">
                <rect
                  width="126"
                  height={243 * (fillProgress / 100)}
                  fill="white"
                  transform={`translate(0 ${243 - (243 * fillProgress) / 100})`}
                />
              </clipPath>
            </defs>
            <g clipPath="url(#clip-leaf-loader-dark)">
              <path
                d="M62.4418 209.866C65.3801 199.804 71.012 190.846 74.0727 180.415C83.1326 149.738 81.4186 117.588 65.5026 89.6101C62.9315 86.9105 63.6661 88.9966 64.1558 90.9599C72.3587 125.932 65.0129 166.917 44.5669 196.245C-5.87455 165.568 -15.4242 91.4508 25.835 48.625C55.2184 18.193 84.6018 33.6544 107.741 62.0004C138.349 99.6723 127.085 162.377 92.4373 193.914C88.5195 197.472 70.8895 210.725 66.7269 210.97C62.5642 211.216 63.911 209.989 62.4418 209.866Z"
                fill="white"
              />
            </g>
          </svg>
        </div>

        {/* Sagewise wordmark */}
        <span className="text-white text-[18px] font-bold tracking-[0.02em]">
          Sagewise
        </span>

        {/* Horizontal progress bar */}
        <div className="w-[180px] h-[2px] rounded-full overflow-hidden bg-white/20">
          <div
            className="h-full bg-white rounded-full"
            style={{ width: `${fillProgress}%` }}
          />
        </div>

        {/* Static subheading from config */}
        <p className="text-white text-[20px] font-semibold tracking-[-0.02em]">
          {loaderText}
        </p>

        {/* Cycling subtext — 4 lines, timed independently of fill animation */}
        <p
          className="text-white/60 text-[14px] tracking-[-0.01em]"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(6px)",
            transition: "opacity 300ms ease, transform 300ms ease",
          }}
        >
          {CYCLING_LINES[lineIndex]}
        </p>
      </div>

      {/* Bottom security notice */}
      <div className="absolute bottom-8 flex items-center gap-1.5 text-white/40 text-[11px]">
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        <span>Your information is secure. 256-bit SSL encryption</span>
      </div>
    </div>
  );
}
