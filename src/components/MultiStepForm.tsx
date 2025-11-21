"use client";

import { useState, useEffect, useRef } from "react";
import { FormConfig, FormData } from "@/types/form";
import { DynamicFormField } from "./DynamicFormField";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { z } from "zod";
import { cn } from "@/lib/utils";

// Progress bar component
function ProgressBar({ progress }: { progress: number }) {
  // Ensure progress is between 0 and 100
  const clampedProgress = Math.max(0, Math.min(100, progress));
  
  // Calculate position for percentage text to follow the progress
  // Position it at the end of the progress fill, but keep it within bounds
  const percentagePosition = Math.max(0, Math.min(100, clampedProgress));
  
  return (
    <div className="flex flex-col items-center w-full">
      <div className="h-[8px] overflow-visible relative rounded-[10px] w-full mb-2.5">
        <div className="absolute bg-[#d4d4d4] inset-0 rounded-[10px]" />
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
          <p className="font-medium leading-[1.5] text-[18px] text-primary-main whitespace-nowrap">
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
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({});
  const [errors, setErrors] = useState<Record<string, Record<string, string>>>({});
  const autoForwardTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const checkCompleteTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const currentStepRef = useRef(currentStep);

  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === config.steps.length;
  const currentStepData = isLastStep ? null : config.steps[currentStep];
  const totalSteps = config.steps.length + (config.finalStep ? 1 : 0);
  const progress = Math.round(((currentStep + 1) / totalSteps) * 100);

  useEffect(() => {
    if (onProgressChange) {
      onProgressChange(progress);
    }
  }, [progress, onProgressChange]);

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

  const handleNext = () => {
    // If we're on the final step, submit the form
    if (isLastStep) {
      console.log("Final step - submitting form with data:", formData);
      if (onSubmit) {
        onSubmit(formData);
      } else {
        console.warn("No onSubmit handler provided");
      }
      return;
    }

    // For regular steps, validate and move to next
    if (!currentStepData) return;
    
    if (!validateStep()) {
      return;
    }

    setCurrentStep((prev) => prev + 1);
  };

  const handleBack = () => {
    if (!isFirstStep) {
      setCurrentStep((prev) => prev - 1);
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
        } else if (field.type === "select") {
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
    
    // Update form data with new value
    const updatedStepData = {
      ...(formData[currentStepData.id] || {}),
      [fieldId]: value,
    };
    
    setFormData((prev) => ({
      ...prev,
      [currentStepData.id]: updatedStepData,
    }));

    // Clear error for this field
    setErrors((prev) => {
      const stepErrors = { ...(prev[currentStepData.id] || {}) };
      delete stepErrors[fieldId];
      return {
        ...prev,
        [currentStepData.id]: stepErrors,
      };
    });

    // Determine if this field should be debounced
    // Only debounce text inputs (text, email, tel, number), but NOT zip code
    const shouldDebounce = 
      (field.type === "text" || field.type === "email" || field.type === "tel" || field.type === "number") &&
      field.id !== "zipCode";

    // Capture current step data for use in timeout closure
    const stepDataForCheck = currentStepData;
    const stepIdForCheck = currentStepData.id;
    const stepAtCheck = currentStep;

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
            setCurrentStep((prev) => {
              const nextStep = prev + 1;
              // Don't go beyond the final step (which is at config.steps.length)
              const maxStep = config.steps.length;
              return Math.min(nextStep, maxStep);
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
      // For radio, checkbox, select, and zip code - check immediately (no debounce)
      // Clear any pending debounce timeout
      if (checkCompleteTimeoutRef.current) {
        clearTimeout(checkCompleteTimeoutRef.current);
        checkCompleteTimeoutRef.current = null;
      }
      checkAndForward();
    }
  };

  // Render final step
  if (isLastStep && config.finalStep) {
    return (
      <>
        <ProgressBar progress={progress} />
        <div className="w-full flex flex-col gap-12 items-center">
          <Card className="w-full border border-general-border rounded-lg p-6">
            <CardHeader className="text-center space-y-0.5 p-0 pb-0 flex  flex-col justify-center items-center gap-1">
              <CardTitle className="text-2xl font-semibold text-foreground tracking-[-0.48px]">
                {config.finalStep.title}
              </CardTitle>
              <CardDescription className="text-base text-muted-foreground">
                {config.finalStep.description}
              </CardDescription>
            </CardHeader>
          </Card>
          
          <Button
            onClick={handleNext}
            className="bg-primary-main hover:bg-primary-main/90 text-white min-h-[40px] px-6 py-[9.5px] w-full max-w-[445px] flex items-center justify-center gap-2"
          >
            <span className="text-base font-medium leading-normal">{config.finalStep.buttonText || "Continue"}</span>
            <ArrowRight className="h-[13.25px] w-[13.25px]" />
          </Button>
        </div>
      </>
    );
  }

  // Render form step
  if (!currentStepData) return null;

  return (
    <>
      <ProgressBar progress={progress} />
      <div className="w-full flex flex-col gap-[48px] items-center">
        <Card className="w-full border border-general-border rounded-lg p-6">
          <CardHeader className="text-center space-y-0.5 p-0 pb-0 flex  flex-col justify-center items-center gap-1">
            <CardTitle className="text-2xl font-semibold text-foreground">
              {currentStepData.title}
            </CardTitle>
            <CardDescription className="text-base text-muted-foreground">
              {currentStepData.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 items-center p-0 pt-6">
            {currentStepData.fields.map((field) => {
              const fieldValue = formData[currentStepData.id]?.[field.id];
              const fieldError = errors[currentStepData.id]?.[field.id];
              
              return (
                <DynamicFormField
                  key={field.id}
                  field={field}
                  value={fieldValue}
                  onChange={(value) => handleFieldChange(field.id, value)}
                  error={fieldError}
                />
              );
            })}
          </CardContent>
        </Card>

        <div className={`flex gap-3 w-full ${isFirstStep ? 'max-w-[445px]' : 'w-full'}`}>
          {!isFirstStep && (
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              className="flex-1 bg-white border border-general-border text-primary-main hover:bg-gray-50 min-h-[40px] px-6 py-[9.5px] flex items-center justify-center gap-2"
            >
              <ArrowLeft className="h-[13.25px] w-[13.25px]" />
              <span className="text-base font-medium leading-normal">Go Back</span>
            </Button>
          )}
          <Button
            type="button"
            onClick={handleNext}
            disabled={!isStepValid()}
            className={cn(
              "bg-primary-main hover:bg-primary-main/90 text-white min-h-[40px] px-6 py-[9.5px] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2",
              isFirstStep ? "w-full" : "flex-1"
            )}
          >
            <span className="text-base font-medium leading-normal">
              {isLastStep ? (config.finalStep?.buttonText || "Submit") : "Continue"}
            </span>
            {!isLastStep && <ArrowRight className="h-[13.25px] w-[13.25px]" />}
          </Button>
        </div>
      </div>
    </>
  );
}

