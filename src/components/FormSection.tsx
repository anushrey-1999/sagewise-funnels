"use client";

import { useState } from "react";
import { MultiStepForm } from "./MultiStepForm";
import { FormConfig, FormData } from "@/types/form";
import { useRouter } from "next/navigation";
import { Loader } from "./Loader";
import { resolvePostSubmitRedirect } from "@/lib/funnel-redirect";

interface FormSectionProps {
  config: FormConfig;
  funnelId: string;
}

export function FormSection({ config, funnelId }: FormSectionProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [submittedData, setSubmittedData] = useState<FormData | null>(null);

  const handleFormSubmit = async (data: FormData) => {
    try {
      console.log("Submitting form data:", { funnelId, data });

      setSubmittedData(data);

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
    const destination = resolvePostSubmitRedirect(config, submittedData || {});

    // Generate IDs for s1 and s2
    const affiliateId = Math.random().toString(36).substring(2, 11);
    const transactionId = Math.random().toString(36).substring(2, 11);

    router.push(`${destination}?s1=${encodeURIComponent(affiliateId)}&s2=${encodeURIComponent(transactionId)}`);
  };

  if (isLoading) {
    return <Loader onComplete={handleLoaderComplete} loaderText={config.finalStep?.loaderText} />;
  }

  return <MultiStepForm config={config} onSubmit={handleFormSubmit} />;
}

