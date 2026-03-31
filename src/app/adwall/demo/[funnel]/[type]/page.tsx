import AdsWallTemplate from "@/templates/AdsWallTemplate";
import { getPublishedDemoAdwallConfig } from "@/lib/published-config";
import { getAdminUserFromCookies } from "@/lib/admin/session";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Suspense } from "react";
import { resolveCityFromZip } from "@/lib/geo/resolveCityFromZip";

export const revalidate = 86400; // revalidate daily (overridden to force-dynamic when DB row exists)
export const dynamic = "force-dynamic";

interface DemoAdwallPageProps {
  params: Promise<{
    funnel: string;
    type: string;
  }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({ params }: DemoAdwallPageProps): Promise<Metadata> {
  const { funnel, type } = await params;
  const config = await getPublishedDemoAdwallConfig(funnel, type);

  if (!config) {
    return {
      title: "Demo Adwall - Sagewise",
      description: "Browse the demo offers and products.",
    };
  }

  return {
    title: config.metadata?.title || "Demo Adwall - Sagewise",
    description: config.metadata?.description || config.subtitle,
  };
}

function firstParam(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

export default async function DemoAdwallPage({ params, searchParams }: DemoAdwallPageProps) {
  const { funnel, type } = await params;

  const sp = (await searchParams) || {};
  const wantsPreview = (Array.isArray(sp.preview) ? sp.preview[0] : sp.preview) === "1";
  const adminUser = wantsPreview ? await getAdminUserFromCookies() : null;
  const useDraft = wantsPreview && !!adminUser;

  const config = await getPublishedDemoAdwallConfig(funnel, type, { useDraft });

  if (!config) {
    notFound();
  }
  const zip = firstParam(sp.zip);
  const resolvedCity = resolveCityFromZip(zip);
  const updatedAtOverride = `Updated ${new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date())}`;

  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <AdsWallTemplate
        config={config}
        resolvedCity={resolvedCity}
        updatedAtOverride={updatedAtOverride}
      />
    </Suspense>
  );
}
