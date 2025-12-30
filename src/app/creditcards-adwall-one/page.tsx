import AdsWallOneTemplate from "@/templates/AdsWallOneTemplate";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Best credit cards- Sagewise",
  description: "Browse the best credit cards of 2025 for cash back, travel rewards, 0% APR, credit building and more. Find the best one for you and apply in seconds.",
};

export default function AdsWallPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <AdsWallOneTemplate />
    </Suspense>
  );
}
