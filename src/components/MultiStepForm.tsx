"use client";

import { useState, useEffect, useMemo, useRef, type CSSProperties } from "react";
import { FormConfig, FormData } from "@/types/form";
import { DynamicFormField } from "./DynamicFormField";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, Loader2, Check } from "lucide-react";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { Loader } from "./Loader";
import { useRouter } from "next/navigation";
import { resolvePostSubmitRedirect, resolveRedirectOnAnswer } from "@/lib/funnel-redirect";
import { appendQueryParams, isAbsoluteUrl } from "@/lib/url";
import { buildAdwallRankingQueryParams } from "@/lib/adwall-ranking-query-params";
import { useSearchParams } from "next/navigation";
import { injectImpressionScript } from "@/lib/injectImpressionScript";

function ProgressBarRow({
  progress,
  onBack,
  isFirstStep,
}: {
  progress: number;
  onBack: () => void;
  isFirstStep: boolean;
}) {
  const clampedProgress = Math.max(0, Math.min(100, progress));

  return (
    <div className="flex w-full items-center gap-3">
      {/* Back button — hidden on the first step */}
      {!isFirstStep && (
        <button
          type="button"
          onClick={onBack}
          aria-label="Go back"
          className="flex shrink-0 items-center gap-1 text-primary-main transition-opacity hover:opacity-70 cursor-pointer"
        >
          <ArrowLeft className="size-4" aria-hidden />
          <span className="hidden sm:inline text-sm font-medium">Back</span>
        </button>
      )}
      {/* Progress bar fills remaining space */}
      <div className="relative h-1.5 flex-1 rounded-full">
        <div className="absolute inset-0 rounded-full bg-sg-primary-tint" />
        <div
          className="absolute bottom-0 left-0 top-0 rounded-full bg-sg-primary-green transition-all duration-300"
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
    </div>
  );
}


interface MultiStepFormProps {
  config: FormConfig;
  onSubmit?: (data: FormData) => void;
  onProgressChange?: (progress: number) => void;
  isSubmitting?: boolean;
}

export function MultiStepForm({ config, onSubmit, onProgressChange, isSubmitting = false }: MultiStepFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({});
  const [errors, setErrors] = useState<Record<string, Record<string, string>>>({});
  const [showLoader, setShowLoader] = useState(false);
  const [loaderSubheading, setLoaderSubheading] = useState<string | undefined>(undefined);
  const [isShaking, setIsShaking] = useState(false);
  const autoForwardTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const checkCompleteTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const currentStepRef = useRef(currentStep);

  const isFirstStep = currentStep === 0;
  const currentStepData = config.steps[currentStep];
  const isCreditScoreQuestion = Boolean(
    currentStepData?.title.toLowerCase().includes("credit score") &&
    currentStepData.fields.some((field) => {
      const normalizedFieldId = field.id.toLowerCase().replace(/[-_\s]/g, "");
      return (
        normalizedFieldId.includes("creditscore") &&
        field.options?.some((option) => ["excellent", "good", "fair", "bad", "poor"].includes(option.value))
      );
    })
  );
  const creditScoreStepIndex = config.steps.findIndex((step) =>
    step.title.toLowerCase().includes("credit score") &&
    step.fields.some((field) => {
      const normalizedFieldId = field.id.toLowerCase().replace(/[-_\s]/g, "");
      return (
        normalizedFieldId.includes("creditscore") &&
        field.options?.some((option) => ["excellent", "good", "fair", "bad", "poor"].includes(option.value))
      );
    })
  );
  const isPastCreditScoreStep = creditScoreStepIndex !== -1 && currentStep > creditScoreStepIndex;

  const currentStepDescription =
    isCreditScoreQuestion
      ? "Won't affect credit score | 100% free | Takes two minutes"
      : isPastCreditScoreStep
        ? "Get rates with no credit check required!"
        : (currentStepData?.description?.trim() || "");

  const firstStepButtonVars = useMemo(() => {
    if (!isFirstStep || !config.firstStepButton) return undefined;

    const bg = config.firstStepButton.bgColor || "var(--sw-cta-primary)";
    const hover = config.firstStepButton.hoverBgColor || "var(--sw-cta-hover)";
    const text = config.firstStepButton.textColor || "#ffffff";

    return {
      ["--sw-first-step-cta-bg" as unknown as string]: bg,
      ["--sw-first-step-cta-hover" as unknown as string]: hover,
      ["--sw-first-step-cta-text" as unknown as string]: text,
    } as CSSProperties;
  }, [config.firstStepButton, isFirstStep]);

  const firstStepButtonText = isFirstStep
    ? (config.firstStepButton?.text || "Continue")
    : "Continue";

  // Inject onLoadScript when funnel first loads
  useEffect(() => {
    if (config.onLoadScript) {
      void injectImpressionScript(config.onLoadScript);
    }
  }, [config.onLoadScript]);

  // Keep currentStepRef in sync with currentStep
  useEffect(() => {
    currentStepRef.current = currentStep;
    // Clear any pending auto-forward when step changes
    if (autoForwardTimeoutRef.current) {
      clearTimeout(autoForwardTimeoutRef.current);
      autoForwardTimeoutRef.current = null;
    }
    // Clear any pending completion check when step changes
    if (checkCompleteTimeoutRef.current) {
      clearTimeout(checkCompleteTimeoutRef.current);
      checkCompleteTimeoutRef.current = null;
    }
  }, [currentStep]);

  // Initialize default field values when step loads
  useEffect(() => {
    if (!currentStepData) return;
    const stepData = formData[currentStepData.id] || {};
    const defaults: Record<string, string | string[] | number | boolean> = {};

    for (const f of currentStepData.fields) {
      if (f.id === "newsletter" && f.type === "checkbox" && !stepData.newsletter) {
        defaults.newsletter = [f.id];
      }
      if (f.type === "slider" && stepData[f.id] === undefined) {
        if (typeof f.defaultValue === "number") {
          defaults[f.id] = f.defaultValue;
        } else {
          const min = f.validation?.min ?? 0;
          const max = f.validation?.max ?? 1000000;
          defaults[f.id] = Math.round((min + max) / 2);
        }
      }
      if (f.type === "year-slider" && stepData[f.id] === undefined) {
        if (typeof f.defaultValue === "number") {
          defaults[f.id] = f.defaultValue;
        } else {
          const min = f.validation?.min ?? 1985;
          const max = f.validation?.max ?? new Date().getFullYear();
          defaults[f.id] = Math.round((min + max) / 2);
        }
      }
    }

    if (Object.keys(defaults).length > 0) {
      setFormData((prev) => ({
        ...prev,
        [currentStepData.id]: {
          ...(prev[currentStepData.id] || {}),
          ...defaults,
        },
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (autoForwardTimeoutRef.current) {
        clearTimeout(autoForwardTimeoutRef.current);
        autoForwardTimeoutRef.current = null;
      }
      if (checkCompleteTimeoutRef.current) {
        clearTimeout(checkCompleteTimeoutRef.current);
        checkCompleteTimeoutRef.current = null;
      }
    };
  }, []);

  // Create validation schema for current step
  const createStepSchema = (step: typeof currentStepData) => {
    if (!step) return z.object({});
    
    // Derive a human-readable name from label → placeholder → humanised field id
    const getFieldName = (field: (typeof step.fields)[number]): string => {
      const label = typeof field.label === "string" ? field.label.trim() : "";
      if (label) return label;
      // camelCase / kebab-case → "zip code", "full name", etc.
      // Do NOT fall back to placeholder — placeholder text (e.g. "12345") makes
      // no sense in error messages like "Please enter 12345".
      return field.id
        .replace(/([A-Z])/g, " $1")
        .replace(/[-_]/g, " ")
        .trim()
        .toLowerCase();
    };
    const enterMsg  = (field: (typeof step.fields)[number]) => `Please enter ${getFieldName(field)}`;
    const selectMsg = (field: (typeof step.fields)[number]) => `Please select ${getFieldName(field)}`;

    const schemaFields: Record<string, z.ZodTypeAny> = {};
    step.fields.forEach((field) => {
      if (field.type === "checkbox") {
        schemaFields[field.id] = field.required
          ? z.array(z.string()).min(1, selectMsg(field))
          : z.array(z.string()).optional();
      } else if (field.type === "radio") {
        const msg = selectMsg(field);
        schemaFields[field.id] = field.required
          ? z.string({ error: msg }).min(1, msg)
          : z.string().optional();
      } else if (field.type === "select" || field.type === "dropdown") {
        const msg = selectMsg(field);
        schemaFields[field.id] = field.required
          ? z.string({ error: msg }).min(1, msg)
          : z.string().optional();
      } else if (field.type === "slider") {
        let numSchema = z.number();
        if (field.validation?.min !== undefined) numSchema = numSchema.min(field.validation.min, field.validation.message || "Value is too low");
        if (field.validation?.max !== undefined) numSchema = numSchema.max(field.validation.max, field.validation.message || "Value is too high");
        schemaFields[field.id] = field.required ? numSchema : numSchema.optional();
      } else if (field.type === "dependent-dropdown") {
        const msg = selectMsg(field);
        schemaFields[field.id] = field.required
          ? z.string({ error: msg }).min(1, msg)
          : z.string().optional();
      } else if (field.type === "year-slider") {
        const minYear = field.validation?.min ?? 1985;
        const maxYear = field.validation?.max ?? new Date().getFullYear();
        const minMsg = field.validation?.message || `Please enter a year from ${minYear} or later`;
        let yearSchema = z.number().min(minYear, minMsg).max(maxYear, `Please enter a year no later than ${maxYear}`);
        schemaFields[field.id] = field.required ? yearSchema : yearSchema.optional();
      } else {
        const msg = enterMsg(field);
        if (!field.required) {
          // Optional text fields: skip validation when empty
          let optSchema = z.string().optional();
          if (field.validation?.pattern) {
            optSchema = z.string().regex(
              new RegExp(field.validation.pattern),
              field.validation.message || `Please enter a valid ${field.label ?? "value"}`
            ).optional();
          }
          schemaFields[field.id] = optSchema;
        } else {
          // Required: use superRefine so empty-field error always wins over pattern error
          const patternRe = field.validation?.pattern ? new RegExp(field.validation.pattern) : null;
          const patternMsg = field.validation?.message || `Please enter a valid ${getFieldName(field)}`;
          const isEmail = field.type === "email";

          schemaFields[field.id] = z
            .string({ error: msg })
            .superRefine((val, ctx) => {
              if (!val || val.trim() === "") {
                ctx.addIssue({ code: z.ZodIssueCode.custom, message: msg });
                return;
              }
              if (isEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
                ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Please enter a valid email address" });
                return;
              }
              if (patternRe && !patternRe.test(val)) {
                ctx.addIssue({ code: z.ZodIssueCode.custom, message: patternMsg });
              }
            });
        }
      }
    });
    return z.object(schemaFields);
  };

  const validateStep = () => {
    if (!currentStepData) return true;
    
    const schema = createStepSchema(currentStepData);
    const stepData = formData[currentStepData.id] || {};
    
    // Ensure all checkbox fields have arrays (even if empty)
    // Normalize undefined text/email/tel/number fields to "" so superRefine runs
    // (Zod v4 no longer honours required_error for undefined values before superRefine)
    const normalizedData = { ...stepData };
    currentStepData.fields.forEach((field) => {
      if (field.type === "checkbox" && !normalizedData[field.id]) {
        normalizedData[field.id] = [];
      } else if (
        ["text", "email", "tel", "number"].includes(field.type) &&
        normalizedData[field.id] === undefined
      ) {
        normalizedData[field.id] = "";
      }
    });
    
    try {
      schema.parse(normalizedData);
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[currentStepData.id];
        return newErrors;
      });
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const stepErrors: Record<string, string> = {};
        // ZodError uses 'issues' property, not 'errors'
        if (error.issues && Array.isArray(error.issues)) {
          error.issues.forEach((issue) => {
            if (issue.path && issue.path.length > 0 && issue.path[0] !== undefined) {
              const key = issue.path[0].toString();
              // Keep the first error per field so empty-field message always wins over format errors
              if (!stepErrors[key]) {
                stepErrors[key] = issue.message;
              }
            }
          });
        }
        setErrors((prev) => ({
          ...prev,
          [currentStepData.id]: stepErrors,
        }));
      }
      return false;
    }
  };

  // Check if current step is valid (for button disable state)
  const isStepValid = () => {
    if (!currentStepData) return true;
    
    const stepData = formData[currentStepData.id] || {};
    
    // For steps with checkboxes, check if at least one is selected
    const checkboxFields = currentStepData.fields.filter(f => f.type === "checkbox");
    if (checkboxFields.length > 0) {
      // Check if any checkbox field has selections
      let hasAnyCheckboxSelected = false;
      for (const field of checkboxFields) {
        const value = stepData[field.id];
        if (Array.isArray(value) && value.length > 0) {
          hasAnyCheckboxSelected = true;
          break;
        }
      }
      // If no checkboxes are selected, disable continue
      if (!hasAnyCheckboxSelected) {
        return false;
      }
    }
    
    // Check all required fields
    for (const field of currentStepData.fields) {
      if (field.required) {
        const value = stepData[field.id];
        
        if (field.type === "checkbox") {
          // For checkboxes, check if array exists and has at least one item
          if (!Array.isArray(value) || value.length === 0) {
            return false;
          }
        } else if (field.type === "radio") {
          if (!value || value === "") {
            return false;
          }
        } else if (field.type === "slider") {
          if (value === undefined || value === null) {
            return false;
          }
        } else {
          if (!value || (typeof value === "string" && value.trim() === "")) {
            return false;
          }
        }
      }
    }
    
    return true;
  };

  // Generate affiliate_id and transaction_id (preserve incoming when present)
  const generateIds = () => {
    const cleanParam = (value: string | null): string | null => {
      const cleaned = value?.replace(/^["']|["']$/g, "").trim();
      return cleaned ? cleaned : null;
    };

    const incomingS1 = cleanParam(searchParams.get("s1"));
    const incomingS2 = cleanParam(searchParams.get("s2"));
    const incomingSub5 = cleanParam(searchParams.get("sub5"));

    const affiliateId = incomingS1 ?? Math.random().toString(36).substring(2, 11);
    const transactionId =
      incomingS2 ?? incomingSub5 ?? Math.random().toString(36).substring(2, 11);

    return { affiliateId, transactionId };
  };

  const getLoaderSubheading = (destination: string): string => {
    const LABELS: Record<string, string> = {
      "mortgage/heloc":     "Curating your HELOC matches...",
      "mortgage/refi":      "Curating your Refinance matches...",
      "mortgage/purchase":  "Curating your Home Purchase matches...",
      "cc/one":             "Curating your Credit Card matches...",
      "cc/two":             "Curating your Credit Card matches...",
      "cc/three":           "Curating your Credit Card matches...",
      "autoins/one":        "Curating your Auto Insurance matches...",
      "autoins/two":        "Curating your Auto Insurance matches...",
      "autoins/three":      "Curating your Auto Insurance matches...",
      "homeWarranty/one":   "Curating your Home Warranty matches...",
      "tubs/one":           "Curating your Walk-In Tub matches...",
      "reverse/one":        "Curating your Reverse Mortgage matches...",
      "dental/one":         "Curating your Dental Plan matches...",
      "gold/one":           "Curating your Gold IRA matches...",
      "taxprep/one":        "Curating your Tax Prep matches...",
    };

    // Match the last two path segments: /adwall/{funnel}/{type}
    const match = destination.match(/adwall\/([^/?#]+\/[^/?#]+)/);
    if (match) {
      const key = match[1];
      if (LABELS[key]) return LABELS[key];
    }

    return config.finalStep?.loaderText || "Curating your best matches...";
  };

  const handleLoaderComplete = () => {
    // Generate IDs for s1 and s2
    const { affiliateId, transactionId } = generateIds();

    const destination = resolvePostSubmitRedirect(config, formData);
    const destinationPath = destination.split("?")[0];
    const baseParams: Record<string, string> = {
      s1: affiliateId,
      s2: transactionId,
      fromFunnel: "1",
      ...buildAdwallRankingQueryParams(config, formData, destinationPath),
    };
    if (searchParams.get("preview") === "1") {
      baseParams.preview = "1";
    }
    if (config.id === "cc-finbuzz") {
      baseParams.sub4 = affiliateId;
      baseParams.sub5 = transactionId;
      baseParams.sub3 = "155";
    }
    const finalUrl = appendQueryParams(destination, baseParams);
    if (isAbsoluteUrl(finalUrl)) {
      window.location.assign(finalUrl);
      return;
    }
    router.push(finalUrl);
  };

  // Check if a step should be skipped based on skipIf condition
  // Works with radio buttons, select/dropdown fields, and other field types
  // Optionally accepts formDataOverride to use updated data that might not be in state yet
  const shouldSkipStep = (stepIndex: number, formDataOverride?: FormData): boolean => {
    if (stepIndex < 0 || stepIndex >= config.steps.length) {
      return false;
    }
    
    const step = config.steps[stepIndex];
    if (!step.skipIf) {
      return false;
    }

    const conditions = Array.isArray(step.skipIf) ? step.skipIf : [step.skipIf];

    // Use override data if provided, otherwise use current formData state
    const dataToCheck = formDataOverride || formData;

    // Skip if ANY condition matches
    return conditions.some((condition) => {
      const { checkStepId, checkFieldId, whenValues } = condition;

      // Get the step data for the step we need to check
      const checkStepData = dataToCheck[checkStepId];
      if (!checkStepData) {
        return false;
      }

      // Get the field value from the step we're checking
      // This works with radio buttons (returns string), select/dropdown (returns string),
      // and other field types
      const fieldValue = checkStepData[checkFieldId];
      if (fieldValue === undefined || fieldValue === null) {
        return false;
      }

      // Convert to string for comparison (handles both string and array values)
      // For radio and select/dropdown, this will be the selected option's value
      const valueToCheck = Array.isArray(fieldValue) ? fieldValue[0] : String(fieldValue);

      // Check if the value matches any of the skip conditions
      return whenValues.includes(valueToCheck);
    });
  };

  const visibleStepIndices = useMemo(() => {
    return config.steps.reduce<number[]>((indices, _step, index) => {
      if (!shouldSkipStep(index)) {
        indices.push(index);
      }
      return indices;
    }, []);
  }, [config.steps, formData]);

  const currentVisibleStepPosition = Math.max(visibleStepIndices.indexOf(currentStep), 0);
  const isLastStep = currentVisibleStepPosition === visibleStepIndices.length - 1;
  const totalVisibleSteps = Math.max(visibleStepIndices.length, 1);
  const computedProgress = Math.round(((currentVisibleStepPosition + 1) / totalVisibleSteps) * 100);
  const progress = computedProgress;

  const finalStepDisclaimer =
    config.finalStep?.disclaimerText ||
    `By pressing "${config.finalStep?.buttonText || "See Instant Matches"}" you agree to our privacy policy and consent to have an agent from one our partners contact you by email, phone call, text/SMS message at the phone number and email you provide. Consent isn't a condition to purchase our products.`;

  useEffect(() => {
    if (onProgressChange) {
      onProgressChange(progress);
    }
  }, [progress, onProgressChange]);

  // Get the next valid step index, skipping any steps that should be skipped
  // Optionally accepts formDataOverride to use updated data that might not be in state yet
  const getNextStepIndex = (fromStepIndex: number, formDataOverride?: FormData): number => {
    let nextIndex = fromStepIndex + 1;
    
    // Keep skipping steps until we find one that shouldn't be skipped or reach the end
    while (nextIndex < config.steps.length && shouldSkipStep(nextIndex, formDataOverride)) {
      nextIndex++;
    }
    
    return nextIndex;
  };

  // Get the previous valid step index, skipping any steps that should be skipped
  // This ensures when going back, we skip over steps that were skipped when going forward
  const getPreviousStepIndex = (fromStepIndex: number): number => {
    let prevIndex = fromStepIndex - 1;
    
    // Keep going back until we find a step that shouldn't be skipped or reach the beginning
    while (prevIndex >= 0 && shouldSkipStep(prevIndex)) {
      prevIndex--;
    }
    
    return Math.max(0, prevIndex);
  };

  const triggerShake = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 450);
  };

  const handleNext = () => {
    // If we're on the last step, show loader and then redirect
    if (isLastStep) {
      // Validate the last step first
      if (!currentStepData || !validateStep()) {
        triggerShake();
        return;
      }
      
      // Inject script if provided in config before submission
      if (config.finalStep?.onSubmitScript) {
        void injectImpressionScript(config.finalStep.onSubmitScript);
      }
      
      // Submit form data if handler provided
      if (onSubmit) {
        onSubmit(formData);
        // Parent is responsible for showing loader + redirect.
        return;
      }
      
      // Show loader which will redirect to ad wall on completion
      const destination = resolvePostSubmitRedirect(config, formData);
      setLoaderSubheading(getLoaderSubheading(destination));
      setShowLoader(true);
      return;
    }

    // For regular steps, validate and move to next
    if (!currentStepData) return;
    
    if (!validateStep()) {
      triggerShake();
      return;
    }

    // Get the next step index, skipping any steps that should be skipped
    const nextStepIndex = getNextStepIndex(currentStep);
    setCurrentStep(nextStepIndex);
  };

  const handleBack = () => {
    if (!isFirstStep) {
      // Get the previous step index, skipping any steps that should be skipped
      setCurrentStep((prev) => getPreviousStepIndex(prev));
    }
  };

  // Check if all fields in the step are filled and valid
  const checkStepComplete = (stepData: Record<string, string | string[] | number | boolean>) => {
    if (!currentStepData) return false;
    
    // If step has no required fields, it's always considered complete
    const hasRequiredFields = currentStepData.fields.some(f => f.required);
    if (!hasRequiredFields) {
      return true;
    }
    
    // Check all required fields are filled
    for (const field of currentStepData.fields) {
      if (field.required) {
        const value = stepData[field.id];
        
        if (field.type === "checkbox") {
          if (!Array.isArray(value) || value.length === 0) {
            return false;
          }
        } else if (field.type === "radio") {
          if (!value || value === "") {
            return false;
          }
        } else if (field.type === "select" || field.type === "dropdown") {
          if (!value || value === "") {
            return false;
          }
        } else {
          // For text, email, tel, number
          if (!value || (typeof value === "string" && value.trim() === "")) {
            return false;
          }
        }
      }
    }
    
    // Validate with schema
    const schema = createStepSchema(currentStepData);
    const normalizedData = { ...stepData };
    currentStepData.fields.forEach((f) => {
      if (f.type === "checkbox" && !normalizedData[f.id]) {
        normalizedData[f.id] = [];
      }
    });
    
    try {
      schema.parse(normalizedData);
      return true;
    } catch (error) {
      return false;
    }
  };


  const handleFieldChange = (fieldId: string, value: string | string[] | number | boolean) => {
    if (!currentStepData) return;
    
    const field = currentStepData.fields.find(f => f.id === fieldId);
    if (!field) return;
    
    // Update form data with new value and clear all subsequent steps' data
    // This ensures skip conditions evaluate correctly based on current answers,
    // not stale data from steps that should have been skipped
    setFormData((prev) => {
      const newFormData = { ...prev };
      
      // Update current step data
      newFormData[currentStepData.id] = {
        ...(newFormData[currentStepData.id] || {}),
        [fieldId]: value,
      };
      
      // Clear data for all steps after the current step
      for (let i = currentStep + 1; i < config.steps.length; i++) {
        const stepId = config.steps[i].id;
        delete newFormData[stepId];
      }
      
      return newFormData;
    });

    // Clear error for this field and clear errors for subsequent steps
    setErrors((prev) => {
      const newErrors = { ...prev };
      const stepErrors = { ...(newErrors[currentStepData.id] || {}) };
      delete stepErrors[fieldId];
      newErrors[currentStepData.id] = stepErrors;
      
      // Clear errors for all steps after the current step
      for (let i = currentStep + 1; i < config.steps.length; i++) {
        const stepId = config.steps[i].id;
        delete newErrors[stepId];
      }
      
      return newErrors;
    });

    // Optional: immediately redirect based on this answer (opt-in per field)
    if (field.redirectImmediately && field.redirectOnAnswer) {
      const destination = resolveRedirectOnAnswer(field.redirectOnAnswer, field.type, value, config.id);
      if (destination) {
        if (autoForwardTimeoutRef.current) {
          clearTimeout(autoForwardTimeoutRef.current);
          autoForwardTimeoutRef.current = null;
        }
        if (checkCompleteTimeoutRef.current) {
          clearTimeout(checkCompleteTimeoutRef.current);
          checkCompleteTimeoutRef.current = null;
        }

        // cc-finbuzz only: pass s1/s2 from funnel URL as sub4/sub5 and sub3=155.
        // For internal (relative) routes we also keep canonical s1/s2 for app-level tracking.
        let finalUrl = appendQueryParams(destination, { fromFunnel: "1" });
        if (config.id === "cc-finbuzz") {
          const clean = (v: string | null) => v?.replace(/^["']|["']$/g, "").trim() || null;
          const s1 = clean(searchParams.get("s1"));
          const s2 = clean(searchParams.get("s2"));
          const finbuzzParams = {
            sub4: s1 ?? undefined,
            sub5: s2 ?? undefined,
            sub3: "155",
          };
          finalUrl = isAbsoluteUrl(destination)
            ? appendQueryParams(destination, { fromFunnel: "1", ...finbuzzParams })
            : appendQueryParams(destination, {
                s1: s1 ?? undefined,
                s2: s2 ?? undefined,
                fromFunnel: "1",
                ...finbuzzParams,
              });
        }

        // Full page navigation so the destination has a clean document (no form-injected scripts)
        window.location.assign(finalUrl);
        return;
      }
    }

    const isZipCodeField = field.id === "zipCode";

    // Determine if this field should trigger auto-forward
    // Check field.autoForward property first (manual control)
    // If not set, default to true only for radio, checkbox, and select
    // All other types (text, email, tel, number) default to false unless explicitly set
    // Zip code steps must wait for the Continue CTA even if config opts into autoForward.
    const shouldAutoForward =
      !isZipCodeField &&
      (field.autoForward !== undefined
        ? field.autoForward
        : (field.type === "radio" || field.type === "checkbox" || field.type === "select" || field.type === "dropdown"));

    // Determine if this field should be debounced
    // Only debounce text inputs (text, email, tel, number), but NOT zip code
    const shouldDebounce = 
      (field.type === "text" || field.type === "email" || field.type === "tel" || field.type === "number") &&
      !isZipCodeField;

    // Only proceed with auto-forward logic if this field should auto-forward
    if (shouldAutoForward) {
      // Capture current step data for use in timeout closure
      const stepDataForCheck = currentStepData;
      const stepIdForCheck = currentStepData.id;
      const stepAtCheck = currentStep;
      
      // Create updated step data for use in closure
      const updatedStepData = {
        ...(formData[currentStepData.id] || {}),
        [fieldId]: value,
      };

      // Function to check step completion and auto-forward
      const checkAndForward = () => {
        // Check if all fields in the step are complete and valid, then auto-proceed
        if (checkStepComplete(updatedStepData)) {
          // Clear any existing auto-forward timeout to prevent multiple forwards
          if (autoForwardTimeoutRef.current) {
            clearTimeout(autoForwardTimeoutRef.current);
            autoForwardTimeoutRef.current = null;
          }
          
          // 500ms delay for better UX - gives user time to review what they typed
          autoForwardTimeoutRef.current = setTimeout(() => {
              // Only auto-forward if we're still on the same step (prevent skipping)
            if (currentStepRef.current === stepAtCheck && stepDataForCheck?.id === stepIdForCheck) {
              // Create updated form data with the current step's data for skip checking
              // Also clear all subsequent steps' data to ensure skip conditions evaluate correctly
              const updatedFormData: FormData = {
                ...formData,
                [stepIdForCheck]: updatedStepData,
              };
              
              // Clear data for all steps after the current step in the updated form data
              // This ensures skip conditions don't see stale data from steps that should be cleared
              for (let i = stepAtCheck + 1; i < config.steps.length; i++) {
                const stepId = config.steps[i].id;
                delete updatedFormData[stepId];
              }
              
              const nextStepIndex = getNextStepIndex(stepAtCheck, updatedFormData);

              if (nextStepIndex >= config.steps.length) {
                // On the last visible step — trigger submission directly
                if (config.finalStep?.onSubmitScript) {
                  void injectImpressionScript(config.finalStep.onSubmitScript);
                }
                // Ensure state has the latest step data before submitting
                setFormData(updatedFormData);
                if (onSubmit) {
                  onSubmit(updatedFormData);
                } else {
                  const destination = resolvePostSubmitRedirect(config, updatedFormData);
                  setLoaderSubheading(getLoaderSubheading(destination));
                  setShowLoader(true);
                }
              } else {
                setCurrentStep(Math.min(nextStepIndex, config.steps.length - 1));
              }
            }
            autoForwardTimeoutRef.current = null;
          }, 500);
        }
      };

      if (shouldDebounce) {
        // Debounce the step completion check to wait until user stops typing
        // Clear any existing completion check timeout
        if (checkCompleteTimeoutRef.current) {
          clearTimeout(checkCompleteTimeoutRef.current);
          checkCompleteTimeoutRef.current = null;
        }

        // Wait 500ms after user stops typing before checking if step is complete
        checkCompleteTimeoutRef.current = setTimeout(() => {
          checkAndForward();
          checkCompleteTimeoutRef.current = null;
        }, 500);
      } else {
        // For radio, checkbox, select, tel, number, and zip code - check immediately (no debounce)
        // Clear any pending debounce timeout
        if (checkCompleteTimeoutRef.current) {
          clearTimeout(checkCompleteTimeoutRef.current);
          checkCompleteTimeoutRef.current = null;
        }
        checkAndForward();
      }
    } else {
      // For text and email fields, clear any pending timeouts but don't auto-forward
      // User must manually click Continue button
      if (checkCompleteTimeoutRef.current) {
        clearTimeout(checkCompleteTimeoutRef.current);
        checkCompleteTimeoutRef.current = null;
      }
      if (autoForwardTimeoutRef.current) {
        clearTimeout(autoForwardTimeoutRef.current);
        autoForwardTimeoutRef.current = null;
      }
    }
  };

  // Show loader if on last step and button was clicked
  if (showLoader) {
    return <Loader onComplete={handleLoaderComplete} loaderText={loaderSubheading} />;
  }

  // Render form step
  if (!currentStepData) return null;

  // Show Continue button only for steps that require manual input
  // (text, email, tel, number, slider, checkbox) or informational/display steps.
  // Pure radio / select / dropdown steps auto-advance on selection — no button needed.
  // Exception: radio/select with no options can't auto-advance, so they also need a button.
  const AUTO_ADVANCE_TYPES = new Set(["radio", "select", "dropdown"]);
  const stepNeedsManualContinue =
    currentStepData.fields.length === 0 ||
    currentStepData.fields.some((f) => {
      if (!AUTO_ADVANCE_TYPES.has(f.type)) return true;
      // A radio/select/dropdown with no options can never auto-advance
      if (!f.options || f.options.length === 0) return true;
      return false;
    });

  return (
    <>
      <div className="flex w-full justify-center">
        <div className="w-full sm:w-[380px] md:w-[650px]">
          <ProgressBarRow
            progress={progress}
            onBack={handleBack}
            isFirstStep={isFirstStep}
          />
        </div>
      </div>
      <div className="w-full flex flex-col gap-[48px] items-center">
        <div className="w-full">
          <div className="text-center space-y-0.5 flex flex-col justify-center items-center gap-1">
            <h2 className="text-2xl lg:text-[40px] font-bold text-primary-main">
              {currentStepData.title}
            </h2>
            {currentStepDescription ? (
              <p className="hidden md:block text-base text-muted-foreground">
                {currentStepDescription}
              </p>
            ) : null}
          </div>
          <div className="flex flex-col gap-1.5 md:gap-[14px] items-center mt-4 md:mt-5">
            {currentStepData.fields.map((field, index) => {
              const fieldValue = formData[currentStepData.id]?.[field.id];
              const fieldError = errors[currentStepData.id]?.[field.id];
              const isLastField = index === currentStepData.fields.length - 1;
              
              const dependencyValue =
                field.type === "dependent-dropdown" && field.dependsOn
                  ? String(formData[field.dependsOn.stepId]?.[field.dependsOn.fieldId] ?? "")
                  : undefined;

              return (
                <DynamicFormField
                  key={field.id}
                  field={field}
                  value={fieldValue}
                  onChange={(value) => handleFieldChange(field.id, value)}
                  error={fieldError}
                  isLastStep={isLastStep}
                  isLastField={isLastField}
                  dependencyValue={dependencyValue}
                />
              );
            })}


            {/* Continue button inside card for non-last manual-input steps */}
            {!isLastStep && stepNeedsManualContinue && (
              <Button
                type="button"
                variant="default"
                onClick={handleNext}
                style={firstStepButtonVars}
                className={cn(
                  "w-full sm:w-[460px] h-[52px] px-6 mt-1 flex items-center justify-center gap-2 rounded-full",
                  isFirstStep && config.firstStepButton
                    ? "bg-(--sw-first-step-cta-bg) hover:bg-(--sw-first-step-cta-hover) text-(--sw-first-step-cta-text)"
                    : "bg-sw-cta-primary hover:bg-sw-cta-hover text-white",
                  isShaking && "animate-shake"
                )}
              >
                <span className="text-base font-bold leading-none">{firstStepButtonText}</span>
                <ArrowRight className="h-[13.25px] w-[13.25px]" />
              </Button>
            )}

            {/* Trust bar — shown on all steps except the final form step */}
            {!isLastStep && (
              <div className="w-full mt-2">
              <div className="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-6 pt-3 w-full border-t border-general-border">
                {[
                  "Free to check",
                  "Secure and confidential",
                  "No pressure to commit",
                ].map((label) => (
                  <span key={label} className="flex items-center gap-1.5 text-xs md:text-sm text-general-muted-foreground">
                    <Check className="size-3.5 shrink-0 text-sg-primary-green" strokeWidth={2.5} />
                    {label}
                  </span>
                ))}
              </div>
              </div>
            )}

            {/* Submit button + disclaimer inside card for last step (only when manual input is needed) */}
            {isLastStep && stepNeedsManualContinue && (
              <>
                <Button
                  type="button"
                  variant="default"
                  onClick={handleNext}
                  disabled={isSubmitting}
                  className={cn(
                    "w-full sm:w-[460px] h-[52px] px-6 mt-1 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 rounded-full bg-sw-cta-primary hover:bg-sw-cta-hover text-white",
                    isShaking && "animate-shake"
                  )}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                      <span className="text-base font-bold leading-none">Submitting...</span>
                    </>
                  ) : (
                    <>
                      <span className="text-base font-bold leading-none">
                        {config.finalStep?.buttonText || "See Instant Matches"}
                      </span>
                      <ArrowRight className="h-[13.25px] w-[13.25px]" />
                    </>
                  )}
                </Button>
                <p className="text-[11px] text-[#9CA3AF] text-left w-full sm:w-[460px] leading-relaxed">
                  {finalStepDisclaimer.includes("<a ") ? (
                    <span
                      className="[&_a]:underline [&_a]:text-inherit [&_a]:hover:opacity-90"
                      dangerouslySetInnerHTML={{ __html: finalStepDisclaimer }}
                    />
                  ) : (
                    finalStepDisclaimer
                  )}
                </p>
              </>
            )}
          </div>
        </div>

        
      </div>
    </>
  );
}

