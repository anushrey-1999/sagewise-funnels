"use client";

import { FormField } from "@/types/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { CheckIcon } from "lucide-react";
import { useId, useState } from "react";

interface DynamicFormFieldProps {
  field: FormField;
  value: any;
  onChange: (value: any) => void;
  error?: string;
  isLastStep?: boolean;
  isLastField?: boolean;
}

export function DynamicFormField({ field, value, onChange, error, isLastStep = false, isLastField = false }: DynamicFormFieldProps) {
  const errorId = useId();
  const descriptionId = useId();
  
  // Validation function to check if value is valid
  const isValidValue = (field: FormField, value: any): boolean => {
    // If there's an error, it's not valid
    if (error) return false;
    
    // Check required fields
    if (field.required) {
      if (field.type === "checkbox") {
        const checked = Array.isArray(value) && value.includes(field.id);
        if (!checked) return false;
      } else if (field.type === "radio" || field.type === "select" || field.type === "dropdown") {
        if (!value || value === "") return false;
      } else {
        if (!value || value.toString().trim() === "") return false;
      }
    }
    
    // Type-specific validation
    if (field.type === "email" && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value.toString())) return false;
    }
    
    // Zip code validation (exactly 5 digits)
    if (field.id === "zipCode" && value) {
      const zipValue = value.toString().trim();
      if (zipValue.length !== 5 || !/^\d{5}$/.test(zipValue)) return false;
    }
    
    // Pattern validation
    if (field.validation?.pattern && value) {
      const pattern = new RegExp(field.validation.pattern);
      if (!pattern.test(value.toString())) return false;
    }
    
    // Min/Max validation
    if (field.validation?.min !== undefined && value) {
      const numValue = typeof value === "number" ? value : parseFloat(value.toString());
      if (isNaN(numValue) || numValue < field.validation.min) return false;
    }
    
    if (field.validation?.max !== undefined && value) {
      const numValue = typeof value === "number" ? value : parseFloat(value.toString());
      if (isNaN(numValue) || numValue > field.validation.max) return false;
    }
    
    // For non-required fields, if there's no value, it's valid (optional)
    if (!field.required && (!value || value === "" || (Array.isArray(value) && value.length === 0))) {
      return true;
    }
    
    return true;
  };
  
  const renderField = () => {
    switch (field.type) {
      case "checkbox":
        const isChecked = Array.isArray(value) && value.includes(field.id);
        // Only show green border and checkmark when checkbox is actually checked AND valid
        const isCheckboxValid = isChecked && isValidValue(field, value);
        const [isCheckboxFocused, setIsCheckboxFocused] = useState(false);
        
        // Check if this is the newsletter checkbox (plain style, no container)
        const isNewsletter = field.id === "newsletter";
        
        // Plain checkbox style for newsletter
        if (isNewsletter) {
          return (
            <div className="w-full sm:w-[380px] md:w-[342px] flex flex-col gap-3 mt-3">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={isChecked}
                  onCheckedChange={(checked) => {
                    const currentValue = Array.isArray(value) ? value : [];
                    const newValue = checked
                      ? [...currentValue, field.id]
                      : currentValue.filter((id) => id !== field.id);
                    onChange(newValue);
                  }}
                  className="h-4 w-4 border-2 border-gray-500 rounded data-[state=checked]:bg-gray-600 data-[state=checked]:border-gray-600 data-[state=checked]:text-white shadow-none outline-none focus:ring-0 focus-visible:ring-0"
                  aria-label={field.label || field.id}
                  aria-invalid={!!error}
                  aria-describedby={error ? errorId : undefined}
                />
                {field.label && (
                  <label 
                    htmlFor={field.id}
                    className="text-xs text-foreground cursor-pointer select-none"
                    onClick={() => {
                      const currentValue = Array.isArray(value) ? value : [];
                      const newValue = currentValue.includes(field.id)
                        ? currentValue.filter((id) => id !== field.id)
                        : [...currentValue, field.id];
                      onChange(newValue);
                    }}
                  >
                    {field.label.startsWith("Yes,") ? (
                      <>
                        <span className="font-bold">Yes,</span>
                        <span className="font-normal">{field.label.substring(4)}</span>
                      </>
                    ) : (
                      field.label
                    )}
                  </label>
                )}
              </div>
            </div>
          );
        }
        
        // Regular checkbox with container styling
        return (
          <div
            className={cn(
              "border-[3px] border-[#e5e5e5] h-[55px] min-h-[55px] rounded-lg w-full max-w-[342px] flex items-center gap-3 px-4 cursor-pointer hover:border-[var(--sw-green-accent)] hover:shadow-md transition-[border-color,background-color,box-shadow,transform] duration-200 ease-out will-change-[border-color,transform] motion-reduce:transition-none motion-reduce:will-change-auto relative",
              isCheckboxFocused 
                ? "!bg-[var(--sw-input-bg)] !border-[var(--sw-green-accent)]" 
                : "!bg-white",
              isCheckboxValid && !isCheckboxFocused && "border-[var(--sw-green-accent)]",
              error && "border-red-500"
            )}
            onFocus={() => setIsCheckboxFocused(true)}
            onBlur={() => setIsCheckboxFocused(false)}
            onClick={() => {
              const currentValue = Array.isArray(value) ? value : [];
              const newValue = currentValue.includes(field.id)
                ? currentValue.filter((id) => id !== field.id)
                : [...currentValue, field.id];
              onChange(newValue);
            }}
            onMouseDown={(e) => e.preventDefault()}
            tabIndex={0}
            role="checkbox"
            aria-checked={isChecked}
            aria-label={field.label || field.id}
            aria-invalid={!!error}
            aria-describedby={error ? errorId : undefined}
          >
            <div className="relative shrink-0 size-5">
              <Checkbox
                checked={isChecked}
                onCheckedChange={(checked) => {
                  const currentValue = Array.isArray(value) ? value : [];
                  const newValue = checked
                    ? [...currentValue, field.id]
                    : currentValue.filter((id) => id !== field.id);
                  onChange(newValue);
                }}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-4 w-4"
                aria-hidden="true"
              />
            </div>
            {field.label && (
              <span className="text-base text-foreground leading-[1.5] tracking-[0.08px]">{field.label}</span>
            )}
            {isCheckboxValid && (
              <CheckIcon className="size-5 text-[var(--sw-success-green)] pointer-events-none shrink-0 ml-auto" />
            )}
          </div>
        );

      case "radio":
        // Radio option component with focus state
        const RadioOption = ({ option, isSelected, isValid }: { option: { value: string; label: string }, isSelected: boolean, isValid: boolean }) => {
          const [isFocused, setIsFocused] = useState(false);
          return (
            <div
              className={cn(
                "border-[3px] border-gray-200 h-[55px] min-h-[55px] rounded-lg flex items-center gap-3 px-4 cursor-pointer hover:border-[var(--sw-green-accent)] hover:shadow-md transition-[border-color,background-color,box-shadow,transform] duration-200 ease-out will-change-[border-color,transform] motion-reduce:transition-none motion-reduce:will-change-auto mb-3 relative",
                isFocused 
                  ? "!bg-[var(--sw-input-bg)] !border-[var(--sw-green-accent)]" 
                  : "!bg-white",
                isValid && !isFocused && "border-[var(--sw-green-accent)]",
                error && "border-red-500"
              )}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onClick={() => onChange(option.value)}
              onMouseDown={(e) => e.preventDefault()}
              tabIndex={0}
            >
              <RadioGroupItem value={option.value} id={option.value} className="h-4 w-4" />
              <Label htmlFor={option.value} className="text-base text-foreground cursor-pointer flex-1">
                {option.label}
              </Label>
              {isValid && (
                <CheckIcon className="size-5 text-[var(--sw-success-green)] pointer-events-none shrink-0" />
              )}
            </div>
          );
        };
        
        return (
          <RadioGroup
            value={value || ""}
            onValueChange={onChange}
            className="w-full sm:w-[380px] md:w-[342px]"
            aria-label={field.label || field.id}
            aria-invalid={!!error}
            aria-describedby={error ? errorId : undefined}
          >
            {field.options?.map((option) => {
              const isSelected = value === option.value;
              const isValid = isSelected && isValidValue(field, value);
              return (
                <RadioOption 
                  key={option.value}
                  option={option}
                  isSelected={isSelected}
                  isValid={isValid}
                />
              );
            })}
          </RadioGroup>
        );

      case "text":
      case "email":
      case "tel":
      case "number":
        // Special handling for zip code field
        const isZipCode = field.id === "zipCode";
        const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          let inputValue = e.target.value;
          if (isZipCode) {
            // Only allow digits and limit to 5 characters
            inputValue = inputValue.replace(/\D/g, "").slice(0, 5);
          }
          onChange(inputValue);
        };
        
        const isValid = isValidValue(field, value);
        
        return (
          <div className="w-full sm:w-[380px] md:w-[342px]">
            {field.label && (
              <Label htmlFor={field.id} className="text-base font-medium text-foreground mb-2 block">
                {field.label}
                {field.required && <span className="text-red-500 ml-1" aria-label="required">*</span>}
              </Label>
            )}
            <div className="relative">
              <Input
                id={field.id}
                type={field.type}
                placeholder={field.placeholder}
                value={value || ""}
                onChange={handleInputChange}
                maxLength={isZipCode ? 5 : undefined}
                className={cn(
                  "h-[55px] min-h-[55px] rounded-lg pr-10",
                  isValid && "border-[var(--sw-green-accent)]",
                  error && "border-red-500"
                )}
                required={field.required}
                aria-label={field.label || field.placeholder || field.id}
                aria-invalid={!!error}
                aria-describedby={error ? errorId : field.placeholder ? descriptionId : undefined}
                aria-required={field.required}
              />
              {isValid && (
                <CheckIcon className="absolute right-3 top-1/2 -translate-y-1/2 size-5 text-[var(--sw-success-green)] pointer-events-none" />
              )}
            </div>
            {field.placeholder && (
              <span id={descriptionId} className="sr-only">
                {field.placeholder}
              </span>
            )}
            {error && (
              <p 
                id={errorId}
                className="text-sm text-red-500 mt-1" 
                role="alert"
                aria-live="polite"
              >
                {error}
              </p>
            )}
          </div>
        );

      case "select":
      case "dropdown": {
        const isSelectValid = isValidValue(field, value);
        const [isSelectFocused, setIsSelectFocused] = useState(false);
        
        return (
          <div className="w-full sm:w-[380px] md:w-[342px]">
            {field.label && (
              <Label htmlFor={field.id} className="text-base font-medium text-foreground mb-2 block">
                {field.label}
                {field.required && <span className="text-red-500 ml-1" aria-label="required">*</span>}
              </Label>
            )}
            <div className="relative">
              <select
                id={field.id}
                value={value || ""}
                onChange={(e) => onChange(e.target.value)}
                onFocus={() => setIsSelectFocused(true)}
                onBlur={() => setIsSelectFocused(false)}
                className={cn(
                  "h-[55px] min-h-[55px] w-full rounded-lg border-[3px] border-[#e5e5e5] px-3 py-2 pr-10 text-base text-foreground outline-none transition-[border-color,background-color,box-shadow,transform] duration-200 ease-out will-change-[border-color,transform] motion-reduce:transition-none motion-reduce:will-change-auto hover:border-[var(--sw-green-accent)] hover:shadow-md cursor-pointer disabled:cursor-not-allowed disabled:opacity-50",
                  isSelectFocused 
                    ? "!bg-[var(--sw-input-bg)] !border-[var(--sw-green-accent)]" 
                    : "!bg-white",
                  isSelectValid && !isSelectFocused && "border-[var(--sw-green-accent)]",
                  error && "border-red-500"
                )}
                required={field.required}
                aria-label={field.label || field.id}
                aria-invalid={!!error}
                aria-describedby={error ? errorId : undefined}
                aria-required={field.required}
              >
                <option value="">Select an option...</option>
                {field.options?.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {isSelectValid && (
                <CheckIcon className="absolute right-3 top-1/2 -translate-y-1/2 size-5 text-[var(--sw-success-green)] pointer-events-none" />
              )}
            </div>
            {error && (
              <p 
                id={errorId}
                className="text-sm text-red-500 mt-1" 
                role="alert"
                aria-live="polite"
              >
                {error}
              </p>
            )}
          </div>
        );
      }

      default:
        return null;
    }
  };

  return <div className="w-full flex justify-center">{renderField()}</div>;
}

