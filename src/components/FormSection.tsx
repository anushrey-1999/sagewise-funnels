"use client";

import { useState } from "react";
import { MultiStepForm } from "./MultiStepForm";
import { FormConfig, FormData } from "@/types/form";
import { useRouter } from "next/navigation";
import { Loader } from "./Loader";

interface FormSectionProps {
  config: FormConfig;
  funnelId: string;
}

export function FormSection({ config, funnelId }: FormSectionProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleFormSubmit = async (data: FormData) => {
    try {
      console.log("Submitting form data:", { funnelId, data });
      
      // Show loader
      setIsLoading(true);
      
      // The loader will call handleLoaderComplete after 2 seconds
    } catch (error) {
      console.error("Error submitting form:", error);
      setIsLoading(false);
      alert(`There was an error submitting your form: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  const handleLoaderComplete = () => {
    // Create mock ads data structure with funnel title and subtitle
    const mockAdsWall = {
      title: config.title || "Final Expense Insurance Quote Calculator",
      subtitle: config.subtitle || "Compare quotes from top providers",
      ads: [
        {
          id: "1",
          title: "eCoverage",
          description: "Thoughtfully designed policies for over 100 years",
          image: "/ads-logo.png",
          link: "#",
          provider: "eCoverage",
          rating: 9.5,
          badges: ["Excellent", "51,237+ families covered"],
          features: [
            "Unique RAPIDecision® Final Expense products",
            "Coverage up-to $2 million, terms up-to 30 years",
            "Fast and easy online application",
            "Multiple options with no medical exam required"
          ],
          phone: "1-833-906-2737",
          amBestRating: "AA++",
          isTopPick: true,
          badgeLabel: "TOP PICK"
        }
      ]
    };

    // Redirect to Ads Wall page with mock ads data
    const adsParam = encodeURIComponent(JSON.stringify(mockAdsWall));
    console.log("Redirecting to ads-wall with mock data");
    router.push(`/creditcards-adwall?ads=${adsParam}`);
  };

  if (isLoading) {
    return <Loader onComplete={handleLoaderComplete} />;
  }

  return <MultiStepForm config={config} onSubmit={handleFormSubmit} />;
}

