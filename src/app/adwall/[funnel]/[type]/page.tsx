import AdsWallTemplate from "@/templates/AdsWallTemplate";
import { getAdwallConfig } from "@/lib/adwall-loader";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { Suspense } from "react";
import { resolveCityFromZip } from "@/lib/geo/resolveCityFromZip";

export const revalidate = 60 * 60 * 24; // revalidate daily

interface AdwallPageProps {
  params: Promise<{
    funnel: string;
    type: string;
  }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
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

function firstParam(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

export default async function AdwallPage({ params, searchParams }: AdwallPageProps) {
  const { funnel, type } = await params;

  // Back-compat: mortgage adwalls were previously addressed as one/two/three.
  if (funnel === "mortgage") {
    if (type === "one") redirect("/adwall/mortgage/heloc");
    if (type === "two") redirect("/adwall/mortgage/refi");
    if (type === "three") redirect("/adwall/mortgage/purchase");
  }

  const config = getAdwallConfig(funnel, type);

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
