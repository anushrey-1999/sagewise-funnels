import AdsWallTemplate from "@/templates/AdsWallTemplate";
import { getAdwallConfig } from "@/lib/adwall-loader";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Suspense } from "react";

interface AdwallPageProps {
  params: Promise<{
    funnel: string;
    type: string;
  }>;
}

export async function generateMetadata({ params }: AdwallPageProps): Promise<Metadata> {
  const { funnel, type } = await params;
  const config = getAdwallConfig(funnel, type);

  if (!config) {
    return {
      title: "Adwall - Sagewise",
      description: "Browse the best offers and products.",
    };
  }

  return {
    title: config.metadata?.title || "Adwall - Sagewise",
    description: config.metadata?.description || config.subtitle,
  };
}

export default async function AdwallPage({ params }: AdwallPageProps) {
  const { funnel, type } = await params;
  const config = getAdwallConfig(funnel, type);

  if (!config) {
    notFound();
  }

  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <AdsWallTemplate config={config} />
    </Suspense>
  );
}
