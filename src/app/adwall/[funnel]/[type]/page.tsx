import AdsWallTemplate from "@/templates/AdsWallTemplate";
import { getPublishedAdwallConfig } from "@/lib/published-config";
import { getAdminUserFromCookies } from "@/lib/admin/session";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { Suspense } from "react";
import { resolveCityFromZip } from "@/lib/geo/resolveCityFromZip";
import { buildAdwallTemplateVars, interpolateTemplate } from "@/lib/adwall-template-vars";

export const revalidate = 86400; // revalidate daily
export const dynamic = "force-dynamic";

interface AdwallPageProps {
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

export async function generateMetadata({ params, searchParams }: AdwallPageProps): Promise<Metadata> {
  const { funnel, type } = await params;
  const config = await getPublishedAdwallConfig(funnel, type);

  if (!config) {
    return {
      title: "Adwall - Sagewise",
      description: "Browse the best offers and products.",
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
    title: interpolateTemplate(config.metadata?.title || "Adwall - Sagewise", vars),
    description: interpolateTemplate(
      config.metadata?.description || config.subtitle,
      vars
    ),
  };
}

export default async function AdwallPage({ params, searchParams }: AdwallPageProps) {
  const { funnel, type } = await params;

  // Back-compat: mortgage adwalls were renamed from one/two/three to heloc/refi/purchase.
  if (funnel === "mortgage") {
    if (type === "one") redirect("/adwall/mortgage/heloc");
    if (type === "two") redirect("/adwall/mortgage/refi");
    if (type === "three") redirect("/adwall/mortgage/purchase");
  }

  const sp = (await searchParams) || {};
  const wantsPreview = firstParam(sp.preview) === "1";
  const adminUser = wantsPreview ? await getAdminUserFromCookies() : null;
  const useDraft = wantsPreview && !!adminUser;

  const config = await getPublishedAdwallConfig(funnel, type, { useDraft });

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
    <Suspense fallback={<div className="min-h-screen bg-[#FAFAF7]" />}>
      <AdsWallTemplate
        config={config}
        resolvedCity={resolvedCity}
        updatedAtOverride={updatedAtOverride}
        currentDate={now.toISOString()}
      />
    </Suspense>
  );
}
