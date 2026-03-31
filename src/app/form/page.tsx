import { Suspense } from "react";
import { FormPageContent } from "./FormPageContent";
import type { Metadata } from "next";
import { getPublishedFunnelConfig } from "@/lib/published-config";
import { getAdminUserFromCookies } from "@/lib/admin/session";
import Link from "next/link";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ funnel?: string }>;
}): Promise<Metadata> {
  const params = await searchParams;
  const funnel = params?.funnel;
  
  if (funnel) {
    const config = await getPublishedFunnelConfig(funnel);
    // Capitalize first letter of funnel name
    const funnelName = funnel.charAt(0).toUpperCase() + funnel.slice(1);
    return {
      title: `Sagewise - ${funnelName}`,
      description: config?.metaDescription || undefined,
    };
  }
  
  // Default title if no funnel specified
  return {
    title: "Sagewise -",
  };
}

export default async function FormPage({
  searchParams,
}: {
  searchParams: Promise<{ funnel?: string; preview?: string }>;
}) {
  const params = await searchParams;
  const funnelId = params?.funnel || null;
  const wantsPreview = params?.preview === "1";
  const adminUser = wantsPreview ? await getAdminUserFromCookies() : null;
  const useDraft = wantsPreview && !!adminUser;

  const formConfig = await getPublishedFunnelConfig(funnelId, { useDraft });

  return (
    <Suspense
      fallback={
        <div className="bg-white flex items-center justify-center min-h-screen w-full">
          <p className="text-lg text-muted-foreground">Loading...</p>
        </div>
      }
    >
      {formConfig ? (
        <FormPageContent formConfig={formConfig} funnelId={funnelId || formConfig.id} />
      ) : (
        <div className="bg-[#F8F8F8] flex flex-col items-center justify-center min-h-screen w-full px-4">
          <div className="text-center max-w-md">
            <h1 className="text-2xl font-semibold mb-4">Funnel Not Found</h1>
            <p className="text-muted-foreground mb-6">
              The funnel you&apos;re looking for doesn&apos;t exist. Please check the URL and try
              again.
            </p>
            <Link href="/" className="text-[#204c4b] hover:underline">
              Return to Homepage
            </Link>
          </div>
        </div>
      )}
    </Suspense>
  );
}
