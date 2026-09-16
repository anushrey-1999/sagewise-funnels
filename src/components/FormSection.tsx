"use client";

import { useRef, useState } from "react";
import { MultiStepForm } from "./MultiStepForm";
import { FormConfig, FormData } from "@/types/form";
import { useSearchParams } from "next/navigation";
import { Loader } from "./Loader";
import { resolvePostSubmitRedirect } from "@/lib/funnel-redirect";
import { appendQueryParams } from "@/lib/url";
import { buildAdwallRankingQueryParams } from "@/lib/adwall-ranking-query-params";
import { resolveMortgageInterstitialCopy } from "@/lib/mortgage-interstitial-copy";
import { beginAdwallHandoff, prefetchAdwallDocument } from "@/lib/adwall-handoff";

interface FormSectionProps {
  config: FormConfig;
  funnelId: string;
  onStepChange?: (stepIndex: number) => void;
}

function getContactFields(data: FormData) {
  let firstName: string | undefined;
  let lastName: string | undefined;
  let email: string | undefined;
  let phone: string | undefined;

  const getValue = (value: string | string[] | number | boolean | undefined): string | undefined => {
    if (value === undefined || value === null) return undefined;
    const str = String(value).trim();
    return str.length > 0 ? str : undefined;
  };

  for (const stepId in data) {
    const stepData = data[stepId];
    if (!stepData) continue;
    if (!firstName && stepData.firstName) firstName = getValue(stepData.firstName);
    if (!lastName && stepData.lastName) lastName = getValue(stepData.lastName);
    if (!email && stepData.email) email = getValue(stepData.email);
    if (!phone && stepData.phone) phone = getValue(stepData.phone);
  }

  return { firstName, lastName, email, phone };
}

export function FormSection({ config, funnelId, onStepChange }: FormSectionProps) {
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState<FormData | null>(null);
  const saveUserPromiseRef = useRef<Promise<void>>(Promise.resolve());
  const submittedDataRef = useRef<FormData | null>(null);
  const handoffUrlRef = useRef<string | null>(null);

  const handleFormSubmit = (data: FormData) => {
    if (isLoading || isSubmitting) return;

    setSubmittedData(data);
    submittedDataRef.current = data;
    setIsSubmitting(true);
    // Show the interstitial immediately. The user save runs in the background
    // during the 3.8s loader so we don't sit on the last step waiting on /api/users.
    setIsLoading(true);
    const handoffUrl = buildHandoffUrl(data);
    handoffUrlRef.current = handoffUrl;
    prefetchAdwallDocument(handoffUrl);

    saveUserPromiseRef.current = (async () => {
      const { firstName, lastName, email, phone } = getContactFields(data);
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: firstName || null,
          lastName: lastName || null,
          email: email || null,
          phone: phone || null,
        }),
        keepalive: true,
      });

      if (!response.ok) {
        throw new Error("Failed to save user data");
      }
    })()
      .catch((error) => {
        console.error("Error submitting form:", error);
        setIsLoading(false);
        alert(
          `There was an error submitting your form: ${error instanceof Error ? error.message : "Unknown error"}`
        );
        throw error;
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  const buildHandoffUrl = (formData: FormData) => {
    const destination = resolvePostSubmitRedirect(config, formData);
    const destinationPath = destination.split("?")[0];

    const cleanParam = (value: string | null): string | null => {
      const cleaned = value?.replace(/^["']|["']$/g, "").trim();
      return cleaned ? cleaned : null;
    };

    const incomingS1 = cleanParam(searchParams.get("s1"));
    const incomingS2 = cleanParam(searchParams.get("s2"));
    const incomingEfTransactionId = cleanParam(searchParams.get("_ef_transaction_id"));
    const incomingS3 = cleanParam(searchParams.get("s3"));
    const incomingOid = cleanParam(searchParams.get("oid"));

    const affiliateId = incomingS1 ?? Math.random().toString(36).substring(2, 11);
    const transactionId =
      incomingS2 ?? incomingEfTransactionId ?? Math.random().toString(36).substring(2, 11);

    let firstName: string | undefined;
    let zipCode: string | undefined;

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

    let sub5Value: string | undefined;
    if (funnelId === "mortgage" && formData["loan-type"]?.loanType) {
      const loanType = String(formData["loan-type"].loanType);
      const sub5Map: Record<string, string> = {
        "refinance": "Refinance",
        "home-equity-heloc": "Home_Equity",
        "purchase": "Purchase",
      };
      sub5Value = sub5Map[loanType];
    }

    const params: Record<string, string | undefined> = {
      s1: affiliateId,
      s2: transactionId,
      s3: incomingS3 ?? "funnel",
      oid: incomingOid ?? undefined,
      sub1: transactionId,
      sub2: affiliateId,
      sub3: incomingOid ?? undefined,
      sub4: incomingS3 ?? "funnel",
      sub5: sub5Value,
      fromFunnel: "1",
      preview: cleanParam(searchParams.get("preview")) === "1" ? "1" : undefined,
      name: firstName,
      zip: zipCode,
      ...buildAdwallRankingQueryParams(config, formData, destinationPath),
    };

    return appendQueryParams(destination, params);
  };

  const handleLoaderComplete = async () => {
    try {
      await saveUserPromiseRef.current;
    } catch {
      return;
    }

    const finalUrl = handoffUrlRef.current;
    if (!finalUrl) return;

    // Full page redirect so the destination has a clean document. Reveal only
    // after 3.8s and this save has finished, matching the production spec.
    beginAdwallHandoff();
    window.location.assign(finalUrl);
  };

  const interstitialCopy =
    isLoading && funnelId === "mortgage"
      ? resolveMortgageInterstitialCopy(submittedData || {})
      : undefined;

  return (
    <>
      <MultiStepForm
        config={config}
        onSubmit={handleFormSubmit}
        onStepChange={onStepChange}
        isSubmitting={isSubmitting}
      />
      {isLoading ? (
        <Loader
          onComplete={handleLoaderComplete}
          loaderText={config.finalStep?.loaderText}
          header={interstitialCopy?.header}
          statusLines={interstitialCopy?.statusLines}
        />
      ) : null}
    </>
  );
}

