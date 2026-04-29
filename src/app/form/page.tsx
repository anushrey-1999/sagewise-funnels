import { Suspense } from "react";
import { FormPageContent } from "./FormPageContent";
import type { Metadata } from "next";
import { getPublishedAdwallConfig, getPublishedFunnelConfig } from "@/lib/published-config";
import { getAdminUserFromCookies } from "@/lib/admin/session";
import { resolvePostSubmitRedirect } from "@/lib/funnel-redirect";
import Link from "next/link";

export const dynamic = "force-dynamic";

type FormPageSearchParams = {
  funnel?: string | string[];
  preview?: string | string[];
  funnelType?: string | string[];
};

function firstParam(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

function parseAdwallRoute(path: string): { routePrefix: string; adwallType: string } | null {
  const match = path.match(/^\/adwall\/([^/?#]+)\/([^/?#]+)/);
  if (!match) return null;
  return {
    routePrefix: decodeURIComponent(match[1]),
    adwallType: decodeURIComponent(match[2]),
  };
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<FormPageSearchParams>;
}): Promise<Metadata> {
  const params = await searchParams;
  const funnel = firstParam(params?.funnel);
  
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
  searchParams: Promise<FormPageSearchParams>;
}) {
  const params = await searchParams;
  const funnelId = firstParam(params?.funnel) || null;
  const wantsPreview = firstParam(params?.preview) === "1";
  const funnelType = firstParam(params?.funnelType)?.toLowerCase();
  const isModalFunnel = funnelType === "modal";
  const adminUser = wantsPreview ? await getAdminUserFromCookies() : null;
  const useDraft = wantsPreview && !!adminUser;

  const formConfig = await getPublishedFunnelConfig(funnelId, { useDraft });
  const modalAdwallRoute =
    formConfig && isModalFunnel ? parseAdwallRoute(resolvePostSubmitRedirect(formConfig, {})) : null;
  const modalAdwallConfig = modalAdwallRoute
    ? await getPublishedAdwallConfig(modalAdwallRoute.routePrefix, modalAdwallRoute.adwallType, { useDraft })
    : null;

  return (
    <Suspense
      fallback={
        <div className="bg-white flex items-center justify-center min-h-screen w-full">
          <p className="text-lg text-muted-foreground">Loading...</p>
        </div>
      }
    >
      {formConfig ? (
        <FormPageContent
          formConfig={formConfig}
          funnelId={funnelId || formConfig.id}
          modalAdwallConfig={isModalFunnel ? modalAdwallConfig : null}
        />
      ) : (
        <div className="bg-sg-canvas flex flex-col items-center justify-center min-h-screen w-full px-4">
          <div className="text-center max-w-md">
            <h1 className="text-2xl font-semibold mb-4">Funnel Not Found</h1>
            <p className="text-muted-foreground mb-6">
              The funnel you&apos;re looking for doesn&apos;t exist. Please check the URL and try
              again.
            </p>
            <Link href="/" className="text-sg-funnel-header hover:underline">
              Return to Homepage
            </Link>
          </div>
        </div>
      )}
    </Suspense>
  );
}
