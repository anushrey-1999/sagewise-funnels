"use client";

import { useState, useEffect, useMemo, useRef, type CSSProperties } from "react";
import { FormConfig, FormData } from "@/types/form";
import { DynamicFormField } from "./DynamicFormField";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { Loader } from "./Loader";
import { useRouter } from "next/navigation";
import { resolvePostSubmitRedirect, resolveRedirectOnAnswer } from "@/lib/funnel-redirect";
import { appendQueryParams, isAbsoluteUrl } from "@/lib/url";
import { useSearchParams } from "next/navigation";
import { injectImpressionScript } from "@/lib/injectImpressionScript";

// Progress bar component
function ProgressBar({ progress }: { progress: number }) {
  // Ensure progress is between 0 and 100
  const clampedProgress = Math.max(0, Math.min(100, progress));
  
  // Calculate position for percentage text to follow the progress
  // Position it at the end of the progress fill, but keep it within bounds
  const percentagePosition = Math.max(0, Math.min(100, clampedProgress));
  
  return (
    <div className="flex flex-col items-center w-full">
      <div className="h-[20px] overflow-visible relative rounded-[10px] w-full mb-2.5">
        <div className="absolute bg-[#DEF1F1] inset-0 rounded-[10px]" />
        <div
          className="absolute bottom-0 left-0 top-0 bg-primary-main rounded-[10px] transition-all duration-300"
          style={{ width: `${clampedProgress}%` }}
        />
        {/* Percentage label that moves with progress */}
        <div
          className="absolute top-[-28px] transition-all duration-300"
          style={{ 
            left: percentagePosition <= 5 
              ? '0%' 
              : percentagePosition >= 95 
              ? '100%' 
              : `${percentagePosition}%`,
            transform: percentagePosition <= 5 
              ? 'translateX(0)' 
              : percentagePosition >= 95 
              ? 'translateX(-100%)' 
              : 'translateX(-50%)'
          }}
        >
          <p className="font-medium leading-normal text-[18px] text-primary-main whitespace-nowrap">
            {clampedProgress}%
          </p>
        </div>
      </div>
    </div>
  );
}

interface MultiStepFormProps {
  config: FormConfig;
  onSubmit?: (data: FormData) => void;
  onProgressChange?: (progress: number) => void;
}

export function MultiStepForm({ config, onSubmit, onProgressChange }: MultiStepFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({});
  const [errors, setErrors] = useState<Record<string, Record<string, string>>>({});
  const [showLoader, setShowLoader] = useState(false);
  const autoForwardTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const checkCompleteTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const currentStepRef = useRef(currentStep);

  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === config.steps.length - 1;
  const currentStepData = config.steps[currentStep];
  const totalSteps = config.steps.length;
  const progress = Math.round(((currentStep + 1) / totalSteps) * 100);

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

  useEffect(() => {
    if (onProgressChange) {
      onProgressChange(progress);
    }
  }, [progress, onProgressChange]);

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

  // Initialize newsletter checkbox as checked by default when step loads
  useEffect(() => {
    if (currentStepData) {
      const newsletterField = currentStepData.fields.find(f => f.id === "newsletter" && f.type === "checkbox");
      if (newsletterField) {
        const stepData = formData[currentStepData.id] || {};
        // Only initialize if not already set
        if (!stepData.newsletter) {
          setFormData((prev) => ({
            ...prev,
            [currentStepData.id]: {
              ...(prev[currentStepData.id] || {}),
              newsletter: [newsletterField.id], // Checkbox values are arrays
            },
          }));
        }
      }
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
    
    const schemaFields: Record<string, any> = {};
    step.fields.forEach((field) => {
      if (field.type === "checkbox") {
        schemaFields[field.id] = field.required
          ? z.array(z.string()).min(1, `${field.label} is required`)
          : z.array(z.string()).optional();
      } else if (field.type === "radio") {
        schemaFields[field.id] = field.required
          ? z.string().min(1, `${field.label} is required`)
          : z.string().optional();
      } else {
        let fieldSchema = z.string();
        if (field.required) {
          fieldSchema = fieldSchema.min(1, `${field.label} is required`);
        }
        if (field.validation?.pattern) {
          fieldSchema = fieldSchema.regex(
            new RegExp(field.validation.pattern),
            field.validation.message || "Invalid format"
          );
        }
        if (field.type === "email") {
          fieldSchema = fieldSchema.email("Invalid email address");
        }
        schemaFields[field.id] = fieldSchema;
      }
    });
    return z.object(schemaFields);
  };

  const validateStep = () => {
    if (!currentStepData) return true;
    
    const schema = createStepSchema(currentStepData);
    const stepData = formData[currentStepData.id] || {};
    
    // Ensure all checkbox fields have arrays (even if empty)
    const normalizedData = { ...stepData };
    currentStepData.fields.forEach((field) => {
      if (field.type === "checkbox" && !normalizedData[field.id]) {
        normalizedData[field.id] = [];
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
              stepErrors[issue.path[0].toString()] = issue.message;
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
          // For radio, check if value exists and is not empty
          if (!value || value === "") {
            return false;
          }
        } else {
          // For text inputs, check if value exists and is not empty
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

  const handleLoaderComplete = () => {
    // Generate IDs for s1 and s2
    const { affiliateId, transactionId } = generateIds();

    const destination = resolvePostSubmitRedirect(config, formData);
    const finalUrl = appendQueryParams(destination, {
      s1: affiliateId,
      s2: transactionId,
    });
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

  const handleNext = () => {
    // If we're on the last step, show loader and then redirect
    if (isLastStep) {
      // Validate the last step first
      if (!currentStepData || !validateStep()) {
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
      setShowLoader(true);
      return;
    }

    // For regular steps, validate and move to next
    if (!currentStepData) return;
    
    if (!validateStep()) {
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
  const checkStepComplete = (stepData: Record<string, any>) => {
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


  const handleFieldChange = (fieldId: string, value: any) => {
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

        // cc-finbuzz only: pass s1/s2 from funnel URL as sub4/sub5 on external links, s1/s2/sub5 on internal
        let finalUrl = destination;
        if (config.id === "cc-finbuzz") {
          const clean = (v: string | null) => v?.replace(/^["']|["']$/g, "").trim() || null;
          const s1 = clean(searchParams.get("s1"));
          const s2 = clean(searchParams.get("s2"));
          finalUrl = isAbsoluteUrl(destination)
            ? appendQueryParams(destination, { sub4: s1 ?? undefined, sub5: s2 ?? undefined })
            : appendQueryParams(destination, { s1: s1 ?? undefined, s2: s2 ?? undefined, sub5: s2 ?? undefined });
        }

        if (isAbsoluteUrl(destination)) {
          window.location.assign(finalUrl);
        } else {
          router.push(finalUrl);
        }
        return;
      }
    }

    // Determine if this field should trigger auto-forward
    // Check field.autoForward property first (manual control)
    // If not set, default to true only for radio, checkbox, and select
    // All other types (text, email, tel, number) default to false unless explicitly set
    const shouldAutoForward = field.autoForward !== undefined 
      ? field.autoForward 
      : (field.type === "radio" || field.type === "checkbox" || field.type === "select" || field.type === "dropdown");

    // Determine if this field should be debounced
    // Only debounce text inputs (text, email, tel, number), but NOT zip code
    const shouldDebounce = 
      (field.type === "text" || field.type === "email" || field.type === "tel" || field.type === "number") &&
      field.id !== "zipCode";

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
              
              setCurrentStep((prev) => {
                // Get the next step index, skipping any steps that should be skipped
                // Pass updated form data so skip conditions can check the latest values
                const nextStepIndex = getNextStepIndex(prev, updatedFormData);
                // Don't go beyond the last step (which is at config.steps.length - 1)
                const maxStep = config.steps.length - 1;
                return Math.min(nextStepIndex, maxStep);
              });
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
    return <Loader onComplete={handleLoaderComplete} loaderText={config.finalStep?.loaderText || "Sit tight while we secure your free quotes."} />;
  }

  // Render form step
  if (!currentStepData) return null;

  return (
    <>
      <ProgressBar progress={progress} />
      <div className="w-full flex flex-col gap-[48px] items-center">
        <Card className="w-full border-none rounded-lg pt-6 pb-10 px-6 shadow-xl">
          <CardHeader className="text-center space-y-0.5 p-0 pb-0 flex  flex-col justify-center items-center gap-1">
            <CardTitle className="text-3xl lg:text-[40px] font-bold text-primary-main">
              {currentStepData.title}
            </CardTitle>
            {currentStepData.description?.trim() ? (
              <CardDescription className="text-base text-muted-foreground">
                {currentStepData.description}
              </CardDescription>
            ) : null}
          </CardHeader>
          <CardContent className="flex flex-col gap-3 items-center p-0 pt-6">
            {currentStepData.fields.map((field, index) => {
              const fieldValue = formData[currentStepData.id]?.[field.id];
              const fieldError = errors[currentStepData.id]?.[field.id];
              const isLastField = index === currentStepData.fields.length - 1;
              
              return (
                <DynamicFormField
                  key={field.id}
                  field={field}
                  value={fieldValue}
                  onChange={(value) => handleFieldChange(field.id, value)}
                  error={fieldError}
                  isLastStep={isLastStep}
                  isLastField={isLastField}
                />
              );
            })}
            
            {/* For last step, render Continue button inside card after checkbox */}
            {isLastStep && (
              <>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleNext}
                  disabled={!isStepValid()}
                  className="w-full sm:w-[380px] md:w-[342px] px-6 py-[9.5px] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-3"
                >
                  <span className="text-base font-medium leading-none">
                    {config.finalStep?.buttonText || "See Instant Matches"}
                  </span>
                </Button>
                <p className="text-xs text-general-muted-foreground text-left w-full sm:w-[380px] md:w-[342px] mt-3">
                  {config.finalStep?.disclaimerText?.includes("<a ") ? (
                    <span
                      className="[&_a]:underline [&_a]:text-primary-main [&_a]:hover:opacity-90"
                      dangerouslySetInnerHTML={{
                        __html:
                          config.finalStep.disclaimerText ||
                          `By pressing "${config.finalStep?.buttonText || "See Instant Matches"}" you agree to our privacy policy and consent to have an agent from one our partners contact you by email, phone call, text/SMS message at the phone number and email you provide. Consent isn't a condition to purchase our products.`,
                      }}
                    />
                  ) : (
                    config.finalStep?.disclaimerText ||
                    `By pressing "${config.finalStep?.buttonText || "See Instant Matches"}" you agree to our privacy policy and consent to have an agent from one our partners contact you by email, phone call, text/SMS message at the phone number and email you provide. Consent isn't a condition to purchase our products.`
                  )}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Buttons outside card for non-last steps, Go Back button for last step */}
        {!isLastStep && (
          <div className={`flex gap-3 w-full ${isFirstStep ? 'max-w-[445px]' : 'w-full'}`}>
            {!isFirstStep && (
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                className="flex-1 bg-white border border-general-border text-primary-main hover:bg-gray-50 px-6 py-[9.5px] flex items-center justify-center gap-2"
              >
                <ArrowLeft className="h-[13.25px] w-[13.25px]" />
                <span className="text-base font-medium leading-none">Go Back</span>
              </Button>
            )}
            <Button
              type="button"
              variant="default"
              onClick={handleNext}
              disabled={!isStepValid()}
              style={firstStepButtonVars}
              className={cn(
                "px-6 py-[9.5px] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2",
                isFirstStep
                  ? "w-full"
                  : "flex-1",
                isFirstStep && config.firstStepButton
                  ? "bg-[var(--sw-first-step-cta-bg)] hover:bg-[var(--sw-first-step-cta-hover)] text-[var(--sw-first-step-cta-text)]"
                  : "bg-primary-main hover:bg-primary-main/90 text-white"
              )}
            >
              <span className="text-base font-medium leading-none">
                {firstStepButtonText}
              </span>
              <ArrowRight className="h-[13.25px] w-[13.25px]" />
            </Button>
          </div>
        )}
        
        {/* Go Back button for last step (outside card) */}
        {isLastStep && !isFirstStep && (
          <div className="flex gap-3 w-full justify-start">
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              className="bg-white border border-general-border text-primary-main hover:bg-gray-50 px-6 py-[9.5px] flex items-center justify-center gap-2"
            >
              <ArrowLeft className="h-[13.25px] w-[13.25px]" />
              <span className="text-base font-medium leading-none">Go Back</span>
            </Button>
          </div>
        )}
      </div>
    </>
  );
}

