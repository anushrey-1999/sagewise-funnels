import { Suspense } from "react";
import { FormPageContent } from "./FormPageContent";
import type { Metadata } from "next";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ funnel?: string }>;
}): Promise<Metadata> {
  const params = await searchParams;
  const funnel = params?.funnel;
  
  if (funnel) {
    // Capitalize first letter of funnel name
    const funnelName = funnel.charAt(0).toUpperCase() + funnel.slice(1);
    return {
      title: `Sagewise - ${funnelName}`,
    };
  }
  
  // Default title if no funnel specified
  return {
    title: "Sagewise -",
  };
}

export default function FormPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-white flex items-center justify-center min-h-screen w-full">
          <p className="text-lg text-muted-foreground">Loading...</p>
        </div>
      }
    >
      <FormPageContent />
    </Suspense>
  );
}
