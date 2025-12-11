"use client";

import { FormSection } from "@/components/FormSection";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { getFunnelConfig } from "@/lib/funnel-loader";
import PageHeader from "@/organisms/PageHeader";
import { Typography } from "@/components/ui/typography";
import PlainPageHeader from "@/organisms/PlainPageHeader";

// Provider logos - using placeholder images from Figma
const providerLogos = [
  { src: "/logos/StateFarm.png", alt: "State Farm", width: 132, height: 34 },
  {
    src: "/logos/MutualOfOmaha.png",
    alt: "Mutual of Omaha",
    width: 192,
    height: 34,
  },
  {
    src: "/logos/ColonialPenn.png",
    alt: "Colonial Penn",
    width: 102,
    height: 34,
  },
  { src: "/logos/GlobeLife.png", alt: "Globe Life", width: 196, height: 34 },
  { src: "/logos/Aflac.png", alt: "Aflac", width: 106, height: 34 },
  { src: "/logos/Aetna.png", alt: "Aetna", width: 175, height: 34 },
];

export function FormPageContent() {
  const searchParams = useSearchParams();
  const funnelId = searchParams.get("funnel");

  // Load the appropriate funnel config
  const formConfig = getFunnelConfig(funnelId);

  // If funnel config not found, show error
  if (!formConfig) {
    return (
      <div className="bg-[#F8F8F8] flex flex-col items-center justify-center min-h-screen w-full px-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-semibold mb-4">Funnel Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The funnel you're looking for doesn't exist. Please check the URL
            and try again.
          </p>
          <a href="/" className="text-[#204c4b] hover:underline">
            Return to Homepage
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start  w-full bg-[#F8F8F8] h-[90vh]">
      <PlainPageHeader title={formConfig.title} headingFont="lg:text-[25px] font-bold text-primary-dark text-primary-main" />

      {/* Main Container with 64px padding - Contains form, separator, and logos */}
      <div className="flex flex-col items-start w-full pb-9 pt-5 px-6 md:p-16 md:pt-5  justify-between">
        <div className=" flex flex-col w-full flex-1 justify-between ">
          {/* Form Section */}
          <div className="flex flex-col  items-center justify-center w-full">
            <div className="flex flex-col gap-8 items-start w-full max-w-[890px]">
              <FormSection
                config={formConfig}
                funnelId={funnelId || formConfig.id}
              />
            </div>
          </div>

          {/* <Separator className="w-full border-[0.5] border-[#e5e5e5] my-9 md:my-12" /> */}

          {/* Provider Logos Section - Before Footer */}
          {/* <div className="flex flex-col gap-6 items-center w-full">
            <Typography
              variant="h5"
              color="text-general-foreground"
              className="text-xl font-semibold text-center tracking-[-0.4px]"
            >
              Discover quotes from 12 providers, including:
            </Typography>
          
            <div className="hidden sm:flex gap-6 sm:gap-7 md:gap-8 items-center flex-wrap justify-center">
              {providerLogos.map((logo, index) => (
                <div
                  key={index}
                  className="relative h-[34px] flex items-center justify-center"
                  style={{
                    width: logo.width + "px",
                  }}
                >
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

         
            <div className="grid grid-cols-3 gap-4 items-center justify-items-center w-full sm:hidden">
              {providerLogos.map((logo, index) => (
                <div
                  key={index}
                  className="h-[24px] relative flex items-center justify-center w-full"
                >
                  <Image
                    src={logo.src}
                    alt={logo.alt}
                    width={logo.width}
                    height={logo.height}
                    className="h-full w-auto object-contain max-w-full"
                  />
                </div>
              ))}
            </div>
          </div> */}
          
        </div>
      </div>
    </div>
  );
}

