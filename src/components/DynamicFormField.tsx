"use client";

import { FormField } from "@/types/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { CheckIcon, Minus, Plus } from "lucide-react";
import React, { useEffect, useId, useState } from "react";

type FieldValue = string | string[] | number | boolean;

function SliderField({
  field,
  value,
  onChange,
  error,
  errorId,
  isValidValue,
}: {
  field: FormField;
  value: FieldValue | undefined;
  onChange: (v: FieldValue) => void;
  error?: string;
  errorId: string;
  isValidValue: (f: FormField, v: FieldValue | undefined) => boolean;
}) {
  const min = field.validation?.min ?? 0;
  const max = field.validation?.max ?? 1000000;
  const isPercent = max <= 100;
  const step = isPercent ? 0.25 : Math.max(1, Math.round((max - min) / 100));
  const midpoint = isPercent ? parseFloat(((min + max) / 2).toFixed(2)) : Math.round((min + max) / 2);
  const fallbackValue = typeof field.defaultValue === "number" ? field.defaultValue : midpoint;
  const currentNum = typeof value === "number" ? value : fallbackValue;

  const [sliderVal, setSliderVal] = useState(currentNum);
  const [inputText, setInputText] = useState("");

  useEffect(() => {
    setSliderVal(currentNum);
  }, [currentNum]);

  const effectiveValue = inputText.trim() ? currentNum : sliderVal;
  const isValid = isValidValue(field, effectiveValue);

  const formatValue = (v: number) =>
    isPercent ? `${v}%` : v.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

  const handleInputChange = (raw: string) => {
    if (isPercent) {
      const cleaned = raw.replace(/[^0-9.]/g, "");
      setInputText(cleaned);
      if (cleaned === "") {
        onChange(sliderVal);
      } else {
        const parsed = parseFloat(cleaned);
        onChange(Number.isNaN(parsed) ? sliderVal : Math.min(parsed, max));
      }
    } else {
      const digits = raw.replace(/[^0-9]/g, "");
      setInputText(digits);
      if (digits === "") {
        onChange(sliderVal);
      } else {
        const parsed = parseInt(digits, 10);
        onChange(Number.isNaN(parsed) ? sliderVal : Math.min(parsed, max));
      }
    }
  };

  const handleSliderChange = (val: number) => {
    const rounded = isPercent ? parseFloat(val.toFixed(2)) : val;
    setSliderVal(rounded);
    if (!inputText.trim()) {
      onChange(rounded);
    }
  };

  const handleDecrement = () => {
    const next = Math.max(min, isPercent ? parseFloat((sliderVal - step).toFixed(2)) : sliderVal - step);
    setSliderVal(next);
    setInputText("");
    onChange(next);
  };

  const handleIncrement = () => {
    const next = Math.min(max, isPercent ? parseFloat((sliderVal + step).toFixed(2)) : sliderVal + step);
    setSliderVal(next);
    setInputText("");
    onChange(next);
  };

  const displayInput = inputText.trim()
    ? isPercent ? inputText : parseInt(inputText, 10).toLocaleString("en-US")
    : "";

  const prefix = isPercent ? "" : "$";
  const suffix = isPercent ? "%" : "";

  return (
    <div className="w-full sm:w-[460px] flex flex-col gap-4">
      {field.label && (
        <Label htmlFor={field.id} className="text-base font-medium text-foreground">
          {field.label}
        </Label>
      )}
      <div className="relative">
        {prefix && (
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-general-muted-foreground text-base pointer-events-none">{prefix}</span>
        )}
        <Input
          id={field.id}
          type="text"
          inputMode={isPercent ? "decimal" : "numeric"}
          placeholder={isPercent ? `${sliderVal}%` : formatValue(sliderVal)}
          value={displayInput}
          onChange={(e) => handleInputChange(e.target.value)}
          className={cn(
            "h-[58px] min-h-[58px] rounded-2xl text-lg font-semibold text-primary-main",
            prefix ? "pl-8" : "pl-4",
            isValid && "border-[var(--sg-primary-green)]",
            error && "border-red-500"
          )}
          aria-label={field.label || field.placeholder || field.id}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
        />
        {suffix && displayInput && (
          <span className="absolute right-10 top-1/2 -translate-y-1/2 text-lg font-semibold text-primary-main pointer-events-none">{suffix}</span>
        )}
        {isValid && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 size-6 rounded-full bg-sg-green-tint flex items-center justify-center pointer-events-none">
            <CheckIcon className="size-3.5 text-[var(--sw-success-green)]" />
          </div>
        )}
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleDecrement}
          disabled={sliderVal <= min}
          aria-label="Decrease value"
          className="size-9 shrink-0 rounded-full border border-gray-300 bg-white flex items-center justify-center shadow-sm hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <Minus className="size-4 text-primary-main" />
        </button>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={sliderVal}
          onChange={(e) => handleSliderChange(parseFloat(e.target.value))}
          className="flex-1 h-2 rounded-full appearance-none cursor-pointer bg-gray-200 accent-primary-main [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-7 [&::-webkit-slider-thumb]:h-7 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary-main [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-moz-range-thumb]:w-7 [&::-moz-range-thumb]:h-7 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary-main [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:shadow-md"
          aria-label={`${field.label || field.id} slider`}
        />
        <button
          type="button"
          onClick={handleIncrement}
          disabled={sliderVal >= max}
          aria-label="Increase value"
          className="size-9 shrink-0 rounded-full border border-gray-300 bg-white flex items-center justify-center shadow-sm hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <Plus className="size-4 text-primary-main" />
        </button>
      </div>
      <div className="flex justify-between text-xs text-general-muted-foreground">
        <span>{formatValue(min)}</span>
        <span>{formatValue(max)}</span>
      </div>
      {error && (
        <p id={errorId} className="text-sm text-red-500" role="alert" aria-live="polite">
          {error}
        </p>
      )}
    </div>
  );
}

function FloatingLabelInput({
  field,
  value,
  onChange,
  error,
  errorId,
  isValidValue,
}: {
  field: FormField;
  value: FieldValue | undefined;
  onChange: (v: FieldValue) => void;
  error?: string;
  errorId: string;
  isValidValue: (f: FormField, v: FieldValue | undefined) => boolean;
}) {
  const [isFocused, setIsFocused] = useState(false);
  const isZipCode = field.id === "zipCode";

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let inputValue = e.target.value;
    if (isZipCode) {
      inputValue = inputValue.replace(/\D/g, "").slice(0, 5);
    }
    onChange(inputValue);
  };

  const isValid = isValidValue(field, value);
  const hasValue =
    typeof value === "string"
      ? value.length > 0
      : typeof value === "number" && !Number.isNaN(value);
  const isFloating = isFocused || hasValue;

  return (
    <div className="w-full sm:w-[460px]">
      <div className="relative">
        {field.label && (
          <label
            htmlFor={field.id}
            className={cn(
              "absolute left-3 pointer-events-none transition-all duration-200 ease-out z-10 origin-left",
              isFloating
                ? "top-[8px] text-[11px] text-muted-foreground"
                : "top-1/2 -translate-y-1/2 text-base text-muted-foreground"
            )}
          >
            {field.label}
          </label>
        )}
        <Input
          id={field.id}
          type={field.type}
          placeholder={!field.label ? field.placeholder : undefined}
          value={typeof value === "string" || typeof value === "number" ? String(value) : ""}
          onChange={handleInputChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          maxLength={isZipCode ? 5 : undefined}
          className={cn(
            "h-[58px] min-h-[58px] rounded-2xl pr-10",
            field.label ? "pt-5 pb-1" : "",
            isValid && "border-[var(--sg-primary-green)]",
            error && "border-red-500"
          )}
          required={field.required}
          aria-label={field.label || field.placeholder || field.id}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          aria-required={field.required}
        />
        {isValid && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 size-6 rounded-full bg-sg-green-tint flex items-center justify-center pointer-events-none">
            <CheckIcon className="size-3.5 text-[var(--sw-success-green)]" />
          </div>
        )}
      </div>
      {error && (
        <p id={errorId} className="text-sm text-red-500 mt-1" role="alert" aria-live="polite">
          {error}
        </p>
      )}
    </div>
  );
}

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
            <div className="w-full sm:w-[460px] flex flex-col gap-3 mt-3">
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
              "border-[3px] border-[#e5e5e5] h-[58px] min-h-[58px] rounded-lg w-full max-w-[460px] flex items-center gap-3 px-4 cursor-pointer hover:border-[var(--sg-primary-green)] hover:shadow-md transition-[border-color,background-color,box-shadow,transform] duration-200 ease-out will-change-[border-color,transform] motion-reduce:transition-none motion-reduce:will-change-auto relative",
              "focus-visible:!bg-[var(--sg-primary-tint)] focus-visible:!border-[var(--sg-primary-green)] !bg-white outline-none",
              isCheckboxValid && "border-[var(--sg-primary-green)]",
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
            className="w-full sm:w-[380px] md:w-[650px] gap-2 md:gap-5 md:pt-5"
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
                    "border-[3px] border-gray-200 h-[72px] min-h-[72px] rounded-3xl flex items-center justify-center px-4 cursor-pointer hover:border-[var(--sg-primary-green)] hover:shadow-md transition-[border-color,background-color,box-shadow,transform] duration-200 ease-out will-change-[border-color,transform] motion-reduce:transition-none motion-reduce:will-change-auto relative !bg-white outline-none",
                    "focus-visible:!bg-[var(--sg-primary-tint)] focus-visible:!border-[var(--sg-primary-green)]",
                    isValid && "border-[var(--sg-primary-green)] !bg-sg-green-50",
                    error && "border-red-500"
                  )}
                  onClick={() => onChange(option.value)}
                  onKeyDown={(e) => onKeyboardActivate(e, () => onChange(option.value))}
                  onMouseDown={(e) => e.preventDefault()}
                  tabIndex={0}
                  role="radio"
                  aria-checked={isSelected}
                >
                  <Label htmlFor={option.value} className="text-base font-bold text-sg-primary-text cursor-pointer text-center">
                    {option.label}
                  </Label>
                  {isValid && (
                    <div className="absolute right-4 size-6 rounded-full bg-sg-green-tint flex items-center justify-center pointer-events-none shrink-0">
                      <CheckIcon className="size-3.5 text-[var(--sw-success-green)]" />
                    </div>
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
        return (
          <FloatingLabelInput
            field={field}
            value={value}
            onChange={onChange}
            error={error}
            errorId={errorId}
            isValidValue={isValidValue}
          />
        );

      case "select":
      case "dropdown": {
        const isSelectValid = isValidValue(field, value);
        
        return (
          <div className="w-full sm:w-[460px]">
            {field.label && (
              <Label htmlFor={field.id} className="text-base font-medium text-foreground mb-2 block">
                {field.label}
              </Label>
            )}
            <div className="relative">
              <select
                id={field.id}
                value={typeof value === "string" ? value : ""}
                onChange={(e) => onChange(e.target.value)}
                className={cn(
                  "h-[58px] min-h-[58px] w-full rounded-2xl border-[3px] border-[#e5e5e5] px-3 py-2 pr-10 text-base text-foreground outline-none transition-[border-color,background-color,box-shadow,transform] duration-200 ease-out will-change-[border-color,transform] motion-reduce:transition-none motion-reduce:will-change-auto hover:border-[var(--sg-primary-green)] hover:shadow-md cursor-pointer disabled:cursor-not-allowed disabled:opacity-50",
                  "!bg-white",
                  "focus-visible:!bg-[var(--sg-primary-tint)] focus-visible:!border-[var(--sg-primary-green)]",
                  isSelectValid && "border-[var(--sg-primary-green)]",
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
                <div className="absolute right-3 top-1/2 -translate-y-1/2 size-6 rounded-full bg-sg-green-tint flex items-center justify-center pointer-events-none">
                  <CheckIcon className="size-3.5 text-[var(--sw-success-green)]" />
                </div>
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

      case "slider": {
        return (
          <SliderField
            field={field}
            value={value}
            onChange={onChange}
            error={error}
            errorId={errorId}
            isValidValue={isValidValue}
          />
        );
      }

      default:
        return null;
    }
  };

  return <div className="w-full flex justify-center">{renderField()}</div>;
}

