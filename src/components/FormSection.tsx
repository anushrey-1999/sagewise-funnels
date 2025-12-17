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

      // Extract user details from form data
      // The form data structure is: { [stepId]: { [fieldId]: value } }
      // Contact fields can be in steps like "contact-info", "contact-details", etc.
      let firstName: string | undefined;
      let lastName: string | undefined;
      let email: string | undefined;
      let phone: string | undefined;

      // Search through all steps to find contact fields
      for (const stepId in data) {
        const stepData = data[stepId];
        if (stepData) {
          // Extract values, converting to string and trimming whitespace
          const getValue = (value: string | string[] | number | boolean | undefined): string | undefined => {
            if (value === undefined || value === null) return undefined;
            const str = String(value).trim();
            return str.length > 0 ? str : undefined;
          };

          if (!firstName && stepData.firstName) firstName = getValue(stepData.firstName);
          if (!lastName && stepData.lastName) lastName = getValue(stepData.lastName);
          if (!email && stepData.email) email = getValue(stepData.email);
          if (!phone && stepData.phone) phone = getValue(stepData.phone);
        }
      }

      const userData = {
        firstName: firstName || null,
        lastName: lastName || null,
        email: email || null,
        phone: phone || null,
      };

      console.log("Extracted user data:", userData);

      // Validate that we have at least email or phone
      if (!email && !phone) {
        throw new Error("Email or phone is required to submit the form");
      }

      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error("Failed to save user data");
      }

      const user = await response.json();
      console.log("User created:", user);

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
    return <Loader onComplete={handleLoaderComplete} loaderText={config.finalStep?.loaderText} />;
  }

  return <MultiStepForm config={config} onSubmit={handleFormSubmit} />;
}

