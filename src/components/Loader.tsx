"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Lock } from "lucide-react";

interface LoaderProps {
  onComplete?: () => void;
}

export function Loader({ onComplete }: LoaderProps) {
  const [fillProgress, setFillProgress] = useState(0);

  useEffect(() => {
    // Animate the leaf fill from 0 to 100% over 2 seconds
    const duration = 2000; // 2 seconds
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      setFillProgress(progress * 100);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Animation complete, call onComplete after a brief delay
        setTimeout(() => {
          if (onComplete) {
            onComplete();
          }
        }, 200);
      }
    };

    requestAnimationFrame(animate);
  }, [onComplete]);

  return (
    <div className="w-full flex flex-col items-center justify-center min-h-[400px] px-4">
      {/* Desktop: max-w-[656px], Mobile: full width with padding */}
      <Card className="w-full max-w-[656px] border border-general-border rounded-lg p-6 md:p-6">
        <CardHeader className="text-center space-y-1 p-0 pb-6">
          {/* Desktop: text-2xl, Mobile: text-xl */}
          <CardTitle className="text-xl md:text-2xl font-semibold text-primary-main tracking-[-0.4px] md:tracking-[-0.48px]">
            Sit tight while we secure your free quotes.
          </CardTitle>
          <CardDescription className="flex items-start lg:items-center justify-center gap-1 text-xs md:text-base text-general-muted-foreground">
            <Lock className="h-3 w-3 md:h-4 md:w-4" />
            <span>Your data is encrypted and kept confidential.</span>
          </CardDescription>
        </CardHeader>

        {/* Leaf Animation Container */}
        <div className="flex items-center justify-center pb-8">
          <div className="relative w-[126px] h-[243px]">
            {/* Base leaf (light green with opacity) */}
            <svg
              width="126"
              height="243"
              viewBox="0 0 126 243"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="absolute inset-0"
            >
              <path
                opacity="0.3"
                d="M62.4418 209.866C65.3801 199.804 71.012 190.846 74.0727 180.415C83.1326 149.738 81.4186 117.588 65.5026 89.6101C62.9315 86.9105 63.6661 88.9966 64.1558 90.9599C72.3587 125.932 65.0129 166.917 44.5669 196.245C-5.87455 165.568 -15.4242 91.4508 25.835 48.625C55.2184 18.193 84.6018 33.6544 107.741 62.0004C138.349 99.6723 127.085 162.377 92.4373 193.914C88.5195 197.472 70.8895 210.725 66.7269 210.97C62.5642 211.216 63.911 209.989 62.4418 209.866Z"
                fill="#16A34A"
              />
            </svg>

            {/* Dark green fill (animated from bottom) */}
            <svg
              width="126"
              height="243"
              viewBox="0 0 126 243"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="absolute inset-0"
            >
              <defs>
                <clipPath id="clip-leaf-loader">
                  <rect
                    width="126"
                    height={243 * (fillProgress / 100)}
                    fill="white"
                    transform={`translate(0 ${243 - (243 * fillProgress / 100)})`}
                  />
                </clipPath>
              </defs>
              <g clipPath="url(#clip-leaf-loader)">
                <path
                  d="M62.4418 209.866C65.3801 199.804 71.012 190.846 74.0727 180.415C83.1326 149.738 81.4186 117.588 65.5026 89.6101C62.9315 86.9105 63.6661 88.9966 64.1558 90.9599C72.3587 125.932 65.0129 166.917 44.5669 196.245C-5.87455 165.568 -15.4242 91.4508 25.835 48.625C55.2184 18.193 84.6018 33.6544 107.741 62.0004C138.349 99.6723 127.085 162.377 92.4373 193.914C88.5195 197.472 70.8895 210.725 66.7269 210.97C62.5642 211.216 63.911 209.989 62.4418 209.866Z"
                  fill="#16A34A"
                />
              </g>
            </svg>
          </div>
        </div>
      </Card>
    </div>
  );
}

