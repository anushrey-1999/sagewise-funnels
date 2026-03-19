import AdsWallTemplate from "@/templates/AdsWallTemplate";
import { getDemoAdwallConfig } from "@/lib/demo-adwall-loader";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Suspense } from "react";
import { resolveCityFromZip } from "@/lib/geo/resolveCityFromZip";

export const revalidate = 86400; // revalidate daily

interface DemoAdwallPageProps {
  params: Promise<{
    funnel: string;
    type: string;
  }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({ params }: DemoAdwallPageProps): Promise<Metadata> {
  const { funnel, type } = await params;
  const config = getDemoAdwallConfig(funnel, type);

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
  const config = getDemoAdwallConfig(funnel, type);

  if (!config) {
    notFound();
  }

  const sp = (await searchParams) || {};
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
