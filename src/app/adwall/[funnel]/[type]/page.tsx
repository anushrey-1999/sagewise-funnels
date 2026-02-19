import AdsWallTemplate from "@/templates/AdsWallTemplate";
import { getPublishedAdwallConfig } from "@/lib/published-config";
import { getAdminUserFromCookies } from "@/lib/admin/session";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

interface AdwallPageProps {
  params: Promise<{
    funnel: string;
    type: string;
  }>;
  searchParams?: Promise<{
    preview?: string;
  }>;
}

export async function generateMetadata({ params }: AdwallPageProps): Promise<Metadata> {
  const { funnel, type } = await params;
  const config = await getPublishedAdwallConfig(funnel, type);

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

export default async function AdwallPage({ params, searchParams }: AdwallPageProps) {
  const { funnel, type } = await params;
  const sp = (await searchParams) || {};
  const wantsPreview = sp.preview === "1";
  const adminUser = wantsPreview ? await getAdminUserFromCookies() : null;
  const useDraft = wantsPreview && !!adminUser;

  const config = await getPublishedAdwallConfig(funnel, type, { useDraft });

  if (!config) {
    notFound();
  }

  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <AdsWallTemplate config={config} />
    </Suspense>
  );
}
