"use client";

import { FormField } from "@/types/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { CheckIcon } from "lucide-react";
import React, { useId } from "react";

type FieldValue = string | string[] | number | boolean;

interface DynamicFormFieldProps {
  field: FormField;
  value: FieldValue | undefined;
  onChange: (value: FieldValue) => void;
  error?: string;
  isLastStep?: boolean;
  isLastField?: boolean;
}

export function DynamicFormField({ field, value, onChange, error }: DynamicFormFieldProps) {
  const errorId = useId();
  const descriptionId = useId();
  
  // Validation function to check if value is valid
  const isValidValue = (fieldToValidate: FormField, valueToValidate: FieldValue | undefined): boolean => {
    // If there's an error, it's not valid
    if (error) return false;
    
    // Check required fields
    if (fieldToValidate.required) {
      if (fieldToValidate.type === "checkbox") {
        const checked = Array.isArray(valueToValidate) && valueToValidate.includes(fieldToValidate.id);
        if (!checked) return false;
      } else if (
        fieldToValidate.type === "radio" ||
        fieldToValidate.type === "select" ||
        fieldToValidate.type === "dropdown"
      ) {
        if (!valueToValidate || valueToValidate === "") return false;
      } else {
        if (!valueToValidate || String(valueToValidate).trim() === "") return false;
      }
    }
    
    // Type-specific validation
    if (fieldToValidate.type === "email" && valueToValidate) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(String(valueToValidate))) return false;
    }
    
    // Zip code validation (exactly 5 digits)
    if (fieldToValidate.id === "zipCode" && valueToValidate) {
      const zipValue = String(valueToValidate).trim();
      if (zipValue.length !== 5 || !/^\d{5}$/.test(zipValue)) return false;
    }
    
    // Pattern validation
    if (fieldToValidate.validation?.pattern && valueToValidate) {
      const pattern = new RegExp(fieldToValidate.validation.pattern);
      if (!pattern.test(String(valueToValidate))) return false;
    }
    
    // Min/Max validation
    if (fieldToValidate.validation?.min !== undefined && valueToValidate) {
      const numValue =
        typeof valueToValidate === "number" ? valueToValidate : parseFloat(String(valueToValidate));
      if (Number.isNaN(numValue) || numValue < fieldToValidate.validation.min) return false;
    }
    
    if (fieldToValidate.validation?.max !== undefined && valueToValidate) {
      const numValue =
        typeof valueToValidate === "number" ? valueToValidate : parseFloat(String(valueToValidate));
      if (Number.isNaN(numValue) || numValue > fieldToValidate.validation.max) return false;
    }
    
    // For non-required fields, if there's no value, it's valid (optional)
    if (
      !fieldToValidate.required &&
      (!valueToValidate ||
        valueToValidate === "" ||
        (Array.isArray(valueToValidate) && valueToValidate.length === 0))
    ) {
      return true;
    }
    
    return true;
  };
  
  const onKeyboardActivate = (e: React.KeyboardEvent, fn: () => void) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      fn();
    }
  };

  const renderField = (): React.ReactNode => {
    switch (field.type) {
      case "checkbox":
        const isChecked = Array.isArray(value) && value.includes(field.id);
        // Only show green border and checkmark when checkbox is actually checked AND valid
        const isCheckboxValid = isChecked && isValidValue(field, value);
        
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
              "focus-visible:!bg-[var(--sw-input-bg)] focus-visible:!border-[var(--sw-green-accent)] !bg-white outline-none",
              isCheckboxValid && "border-[var(--sw-green-accent)]",
              error && "border-red-500"
            )}
            onClick={() => {
              const currentValue = Array.isArray(value) ? value : [];
              const newValue = currentValue.includes(field.id)
                ? currentValue.filter((id) => id !== field.id)
                : [...currentValue, field.id];
              onChange(newValue);
            }}
            onKeyDown={(e) =>
              onKeyboardActivate(e, () => {
                const currentValue = Array.isArray(value) ? value : [];
                const newValue = currentValue.includes(field.id)
                  ? currentValue.filter((id) => id !== field.id)
                  : [...currentValue, field.id];
                onChange(newValue);
              })
            }
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
        return (
          <RadioGroup
            value={typeof value === "string" ? value : ""}
            onValueChange={(v) => onChange(v)}
            className="w-full sm:w-[380px] md:w-[342px]"
            aria-label={field.label || field.id}
            aria-invalid={!!error}
            aria-describedby={error ? errorId : undefined}
          >
            {field.options?.map((option) => {
              const isSelected = value === option.value;
              const isValid = isSelected && isValidValue(field, value);
              return (
                <div
                  key={option.value}
                  className={cn(
                    "border-[3px] border-gray-200 h-[55px] min-h-[55px] rounded-lg flex items-center gap-3 px-4 cursor-pointer hover:border-[var(--sw-green-accent)] hover:shadow-md transition-[border-color,background-color,box-shadow,transform] duration-200 ease-out will-change-[border-color,transform] motion-reduce:transition-none motion-reduce:will-change-auto mb-3 relative !bg-white outline-none",
                    "focus-visible:!bg-[var(--sw-input-bg)] focus-visible:!border-[var(--sw-green-accent)]",
                    isValid && "border-[var(--sw-green-accent)]",
                    error && "border-red-500"
                  )}
                  onClick={() => onChange(option.value)}
                  onKeyDown={(e) => onKeyboardActivate(e, () => onChange(option.value))}
                  onMouseDown={(e) => e.preventDefault()}
                  tabIndex={0}
                  role="radio"
                  aria-checked={isSelected}
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
                value={typeof value === "string" || typeof value === "number" ? String(value) : ""}
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
                value={typeof value === "string" ? value : ""}
                onChange={(e) => onChange(e.target.value)}
                className={cn(
                  "h-[55px] min-h-[55px] w-full rounded-lg border-[3px] border-[#e5e5e5] px-3 py-2 pr-10 text-base text-foreground outline-none transition-[border-color,background-color,box-shadow,transform] duration-200 ease-out will-change-[border-color,transform] motion-reduce:transition-none motion-reduce:will-change-auto hover:border-[var(--sw-green-accent)] hover:shadow-md cursor-pointer disabled:cursor-not-allowed disabled:opacity-50",
                  "!bg-white",
                  "focus-visible:!bg-[var(--sw-input-bg)] focus-visible:!border-[var(--sw-green-accent)]",
                  isSelectValid && "border-[var(--sw-green-accent)]",
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

