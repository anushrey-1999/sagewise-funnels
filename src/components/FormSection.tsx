"use client";

import { useState } from "react";
import { MultiStepForm } from "./MultiStepForm";
import { FormConfig, FormData } from "@/types/form";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { Loader } from "./Loader";
import { resolvePostSubmitRedirect } from "@/lib/funnel-redirect";
import { appendQueryParams, isAbsoluteUrl } from "@/lib/url";

interface FormSectionProps {
  config: FormConfig;
  funnelId: string;
}

export function FormSection({ config, funnelId }: FormSectionProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState<FormData | null>(null);

  const handleFormSubmit = async (data: FormData) => {
    try {
      console.log("Submitting form data:", { funnelId, data });

      setSubmittedData(data);
      setIsSubmitting(true);

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

      // Complete the API call before showing the loader so the request is not cancelled when we redirect
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

      // Show loader only after user is created so redirect does not cancel the request
      setIsSubmitting(false);
      setIsLoading(true);
    } catch (error) {
      console.error("Error submitting form:", error);
      setIsSubmitting(false);
      setIsLoading(false);
      alert(`There was an error submitting your form: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  const handleLoaderComplete = () => {
    const destination = resolvePostSubmitRedirect(config, submittedData || {});

    const cleanParam = (value: string | null): string | null => {
      const cleaned = value?.replace(/^["']|["']$/g, "").trim();
      return cleaned ? cleaned : null;
    };

    // Preserve incoming tracking IDs when present (funnel -> adwall -> offer)
    const incomingS1 = cleanParam(searchParams.get("s1"));
    const incomingS2 = cleanParam(searchParams.get("s2"));
    const incomingSub5 = cleanParam(searchParams.get("sub5"));

    // Generate IDs only if not provided on the funnel URL
    const affiliateId = incomingS1 ?? Math.random().toString(36).substring(2, 11);
    const transactionId =
      incomingS2 ?? incomingSub5 ?? Math.random().toString(36).substring(2, 11);

    // Extract form data for adwall personalization
    const formData = submittedData || {};
    let firstName: string | undefined;
    let zipCode: string | undefined;

    // Search through all steps to find firstName and zipCode
    for (const stepId in formData) {
      const stepData = formData[stepId];
      if (stepData) {
        if (!firstName && stepData.firstName) {
          firstName = String(stepData.firstName).trim();
        }
        if (!zipCode && stepData.zipCode) {
          zipCode = String(stepData.zipCode).trim();
        }
      }
    }

    const finalUrl = appendQueryParams(destination, {
      s1: affiliateId,
      s2: transactionId,
      sub5: transactionId,
      name: firstName,
      zip: zipCode,
    });

    // Use full page redirect so the destination page has a clean document (no leftover
    // form-injected scripts like EF.conversion that would otherwise persist with client-side nav)
    if (isAbsoluteUrl(finalUrl)) {
      window.location.assign(finalUrl);
      return;
    }
    window.location.assign(finalUrl);
  };

  if (isLoading) {
    return <Loader onComplete={handleLoaderComplete} loaderText={config.finalStep?.loaderText} />;
  }

  return (
    <MultiStepForm
      config={config}
      onSubmit={handleFormSubmit}
      isSubmitting={isSubmitting}
    />
  );
}

