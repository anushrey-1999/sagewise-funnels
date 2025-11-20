"use client";

import { useState, useEffect } from "react";
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
  
  return (
    <div className="flex flex-col items-center w-full">
      <div className="h-2 overflow-visible relative rounded-[10px] w-full mb-2.5">
        <div className="absolute bg-[#d4d4d4] inset-0 rounded-[10px]" />
        <div
          className="absolute bottom-0 left-0 top-0 bg-[#204c4b] rounded-[10px] transition-all duration-300"
          style={{ width: `${clampedProgress}%` }}
        />
        {/* Percentage label that moves with progress */}
        <div
          className="absolute top-[-28px] transition-all duration-300"
          style={{ 
            left: clampedProgress <= 5 
              ? '0%' 
              : clampedProgress >= 95 
              ? '100%' 
              : `${clampedProgress}%`,
            transform: clampedProgress <= 5 
              ? 'translateX(0)' 
              : clampedProgress >= 95 
              ? 'translateX(-100%)' 
              : 'translateX(-50%)'
          }}
        >
          <p className="font-medium leading-normal text-[18px] text-[#204c4b] whitespace-nowrap">
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

  const handleFieldChange = (fieldId: string, value: any) => {
    if (!currentStepData) return;
    
    setFormData((prev) => ({
      ...prev,
      [currentStepData.id]: {
        ...(prev[currentStepData.id] || {}),
        [fieldId]: value,
      },
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
  };

  // Render final step
  if (isLastStep && config.finalStep) {
    return (
      <>
        <ProgressBar progress={progress} />
        <div className="w-full flex flex-col items-center mt-8">
        <Card className="w-full border border-gray-200">
          <CardHeader className="text-center space-y-1 px-4 sm:px-5 md:px-6">
            <CardTitle className="text-[20px] sm:text-[22px] md:text-2xl font-semibold text-foreground tracking-[-0.4px] sm:tracking-[-0.44px] md:tracking-[-0.48px]">
              {config.finalStep.title}
            </CardTitle>
            <CardDescription className="text-base text-muted-foreground">
              {config.finalStep.description}
            </CardDescription>
          </CardHeader>
        </Card>
        
        <Button
          onClick={handleNext}
          className="bg-[#204c4b] hover:bg-[#204c4b]/90 text-white h-10 px-6 mt-8 sm:mt-10 md:mt-12 w-full sm:w-[400px] md:w-[445px]"
        >
          <span className="text-base font-medium">{config.finalStep.buttonText || "Continue"}</span>
          <ArrowRight className="h-3.5 w-3.5 ml-2" />
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
      <div className="w-full flex flex-col items-center mt-8">
        <Card className="w-full border border-gray-200">
          <CardHeader className="text-center space-y-1 px-4 sm:px-5 md:px-6">
            <CardTitle className="text-[20px] sm:text-[22px] md:text-2xl font-semibold text-foreground tracking-[-0.4px] sm:tracking-[-0.44px] md:tracking-[-0.48px]">
              {currentStepData.title}
            </CardTitle>
            <CardDescription className="text-base text-muted-foreground">
              {currentStepData.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 items-center px-4 sm:px-5 md:px-6">
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

        <div className="flex gap-3 mt-8 sm:mt-10 md:mt-12 w-full sm:w-[400px] md:w-[445px]">
          {!isFirstStep && (
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              className="flex-1 bg-white border border-gray-200 text-[#204c4b] hover:bg-gray-50 h-10"
            >
              <ArrowLeft className="h-3.5 w-3.5 mr-2" />
              <span className="text-base font-medium">Go Back</span>
            </Button>
          )}
          <Button
            type="button"
            onClick={handleNext}
            disabled={!isStepValid()}
            className={cn(
              "bg-[#204c4b] hover:bg-[#204c4b]/90 text-white h-10 px-6 disabled:opacity-50 disabled:cursor-not-allowed",
              isFirstStep ? "w-full" : "flex-1"
            )}
          >
            <span className="text-base font-medium">
              {isLastStep ? (config.finalStep?.buttonText || "Submit") : "Continue"}
            </span>
            {!isLastStep && <ArrowRight className="h-3.5 w-3.5 ml-2" />}
          </Button>
        </div>
      </div>
    </>
  );
}

