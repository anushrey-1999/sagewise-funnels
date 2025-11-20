"use client";

import { FormSection } from "@/components/FormSection";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { getFunnelConfig } from "@/lib/funnel-loader";
import PageHeader from "@/organisms/PageHeader";

// Provider logos - using placeholder images from Figma
const providerLogos = [
  // { src: "http://localhost:3845/assets/f372255f073d35a83f14b4c310f558156a3da533.png", alt: "State Farm", width: 132, height: 34 },
  { src: "http://localhost:3845/assets/f630bd854fde3ece0d4e1a4dffe01aac613a35ef.svg", alt: "Mutual of Omaha", width: 192, height: 34 },
  { src: "http://localhost:3845/assets/66504f2593ee1632cc5ffc14f00dbd5541591c1d.svg", alt: "Colonial Penn", width: 102, height: 34 },
  { src: "http://localhost:3845/assets/c6a2fe20901f50119d0dbb5e235b8268b5a128d1.svg", alt: "Globe Life", width: 196, height: 34 },
  { src: "http://localhost:3845/assets/6a99fbee7df616142171925a70c0720445074070.svg", alt: "Aflac", width: 106, height: 34 },
  { src: "http://localhost:3845/assets/4ae44be915cb1b4b6094258c5b2cf7e43a25b4b6.svg", alt: "Aetna", width: 175, height: 34 },
];

function FormPageContent() {
  const searchParams = useSearchParams();
  const funnelId = searchParams.get("funnel");
  
  // Load the appropriate funnel config
  const formConfig = getFunnelConfig(funnelId);

  // If funnel config not found, show error
  if (!formConfig) {
    return (
      <div className="bg-[#f5f5f5] flex flex-col items-center justify-center min-h-screen w-full px-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-semibold mb-4">Funnel Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The funnel you're looking for doesn't exist. Please check the URL and try again.
          </p>
          <a href="/" className="text-[#204c4b] hover:underline">
            Return to Homepage
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f5f5f5] flex flex-col items-start min-h-screen w-full">
  
      <PageHeader title={formConfig.title} subtitle={formConfig.subtitle} />

      {/* Main Content */}
      <div className="bg-white flex flex-col gap-9 sm:gap-10 md:gap-6 items-center justify-center px-6 pt-16 pb-9 sm:p-10 md:p-16 w-full">
        <div className="flex flex-col gap-8 sm:gap-8 md:gap-8 items-start w-full max-w-[890px]">
          <div className="flex flex-col gap-12 md:gap-12 items-center w-full">
            <FormSection config={formConfig} funnelId={funnelId || formConfig.id} />
          </div>
        </div>

        <Separator className="w-full" />

        {/* Provider Logos */}
        <div className="flex flex-col gap-6 items-center w-full">
          <h2 className="font-medium sm:font-semibold md:font-semibold leading-[1.5] sm:leading-[1.3] md:leading-[1.2] text-[18px] sm:text-[19px] md:text-[20px] text-foreground text-center tracking-[-0.4px]">
            Discover quotes from 12 providers, including:
          </h2>
          {/* Desktop & Tablet: Single row */}
          <div className="hidden sm:flex gap-6 sm:gap-7 md:gap-8 items-start flex-wrap justify-center">
            {providerLogos.map((logo, index) => (
              <div key={index} className="h-[28px] sm:h-[30px] md:h-[34px] relative" style={{ width: logo.width * 0.85 + 'px' }}>
                <Image
                  src={logo.src}
                  alt={logo.alt}
                  width={logo.width}
                  height={logo.height}
                  className="h-full w-auto object-contain"
                />
              </div>
            ))}
          </div>
          {/* Mobile: 2 rows of 3 */}
          <div className="flex flex-col gap-4 sm:hidden items-center justify-center w-full">
            <div className="flex gap-8 items-start justify-center">
              {providerLogos.slice(0, 3).map((logo, index) => (
                <div key={index} className="h-[24px] relative" style={{ width: Math.min(logo.width * 0.7, 100) }}>
                  <Image
                    src={logo.src}
                    alt={logo.alt}
                    width={logo.width}
                    height={logo.height}
                    className="h-full w-auto object-contain"
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-8 items-start justify-center">
              {providerLogos.slice(3).map((logo, index) => (
                <div key={index + 3} className="h-[24px] relative" style={{ width: Math.min(logo.width * 0.7, 100) }}>
                  <Image
                    src={logo.src}
                    alt={logo.alt}
                    width={logo.width}
                    height={logo.height}
                    className="h-full w-auto object-contain"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FormPage() {
  return (
    <Suspense fallback={
      <div className="bg-[#f5f5f5] flex items-center justify-center min-h-screen w-full">
        <p className="text-lg text-muted-foreground">Loading...</p>
      </div>
    }>
      <FormPageContent />
    </Suspense>
  );
}

