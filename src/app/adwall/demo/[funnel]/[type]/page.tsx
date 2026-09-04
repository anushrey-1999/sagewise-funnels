import AdsWallTemplate from "@/templates/AdsWallTemplate";
import { getPublishedDemoAdwallConfig } from "@/lib/published-config";
import { getAdminUserFromCookies } from "@/lib/admin/session";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Suspense } from "react";
import { resolveCityFromZip } from "@/lib/geo/resolveCityFromZip";
import { buildAdwallTemplateVars, interpolateTemplate } from "@/lib/adwall-template-vars";

export const revalidate = 86400; // revalidate daily (overridden to force-dynamic when DB row exists)
export const dynamic = "force-dynamic";

interface DemoAdwallPageProps {
  params: Promise<{
    funnel: string;
    type: string;
  }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

function firstParam(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

export async function generateMetadata({ params, searchParams }: DemoAdwallPageProps): Promise<Metadata> {
  const { funnel, type } = await params;
  const config = await getPublishedDemoAdwallConfig(funnel, type);

  if (!config) {
    return {
      title: "Demo Adwall - Sagewise",
      description: "Browse the demo offers and products.",
    };
  }

  const sp = (await searchParams) || {};
  const zip = firstParam(sp.zip);
  // A personal name has no place in a page title, so {NAME} resolves to "".
  const vars = buildAdwallTemplateVars({
    zip,
    city: resolveCityFromZip(zip),
    now: new Date(),
  });

  return {
    title: interpolateTemplate(config.metadata?.title || "Demo Adwall - Sagewise", vars),
    description: interpolateTemplate(
      config.metadata?.description || config.subtitle,
      vars
    ),
  };
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
  const now = new Date();
  const updatedAtOverride = `Updated ${new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(now)}`;

  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <AdsWallTemplate
        config={config}
        resolvedCity={resolvedCity}
        updatedAtOverride={updatedAtOverride}
        currentDate={now.toISOString()}
      />
    </Suspense>
  );
}
