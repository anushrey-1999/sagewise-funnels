"use client";

import { FormField } from "@/types/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { RadioGroup } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { CheckIcon, Minus, Plus, MapPin, icons } from "lucide-react";
import React, { useCallback, useEffect, useId, useRef, useState } from "react";
import vehicleModels from "@/lib/vehicle-models.json";

function LucideIcon({ name, className }: { name: string; className?: string }) {
  const Icon = icons[name as keyof typeof icons] as React.ComponentType<{ className?: string }> | undefined;
  if (!Icon) return null;
  return <Icon className={className} />;
}

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

  const progressPercent = ((sliderVal - min) / (max - min)) * 100;

  return (
    <div className="w-full sm:w-[460px] flex flex-col gap-4">
      {field.label && (
        <Label htmlFor={field.id} className="text-base font-medium text-aw-text">
          {field.label}
        </Label>
      )}
      
      {/* Stepper row: minus button, value display, plus button */}
      <div className="flex items-center justify-center gap-4">
        <button
          type="button"
          onClick={handleDecrement}
          disabled={sliderVal <= min}
          aria-label="Decrease value"
          className="size-12 shrink-0 rounded-[var(--radius-field)] border border-sg-primary-green bg-sg-green-50 flex items-center justify-center hover:bg-sg-green-100 disabled:opacity-40 disabled:cursor-not-allowed transition-[background-color] duration-200 focus-visible:shadow-[var(--focus-ring)] outline-none"
        >
          <Minus className="size-5 text-sg-primary-green" strokeWidth={2.5} />
        </button>
        
        <div className="text-[32px] font-bold text-aw-text tracking-tight min-w-[140px] text-center">
          {formatValue(sliderVal)}
        </div>
        
        <button
          type="button"
          onClick={handleIncrement}
          disabled={sliderVal >= max}
          aria-label="Increase value"
          className="size-12 shrink-0 rounded-[var(--radius-field)] border border-sg-primary-green bg-sg-green-50 flex items-center justify-center hover:bg-sg-green-100 disabled:opacity-40 disabled:cursor-not-allowed transition-[background-color] duration-200 focus-visible:shadow-[var(--focus-ring)] outline-none"
        >
          <Plus className="size-5 text-sg-primary-green" strokeWidth={2.5} />
        </button>
      </div>

      {/* Slider track */}
      <div className="relative w-full h-6 flex items-center">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={sliderVal}
          onChange={(e) => handleSliderChange(parseFloat(e.target.value))}
          className="w-full h-2 rounded-full appearance-none cursor-pointer bg-transparent relative z-10 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-sg-primary-green [&::-webkit-slider-thumb]:shadow-[var(--shadow-slider-thumb)] [&::-webkit-slider-thumb]:border-[3px] [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-runnable-track]:bg-transparent [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-sg-primary-green [&::-moz-range-thumb]:border-[3px] [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:shadow-[var(--shadow-slider-thumb)] [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-track]:bg-transparent"
          aria-label={`${field.label || field.id} slider`}
          style={{ background: 'transparent' }}
        />
        {/* Track background */}
        <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-2 rounded-full overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-neutral-track" />
          <div 
            className="absolute top-0 left-0 h-full bg-sg-primary-green rounded-full" 
            style={{ width: `${progressPercent}%` }} 
          />
        </div>
      </div>

      {/* Min/Max labels */}
      <div className="flex justify-between text-sm text-aw-tertiary">
        <span>{formatValue(min)}</span>
        <span>{formatValue(max)}</span>
      </div>

      {/* Input field */}
      <div className="relative">
        {prefix && (
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-aw-tertiary text-base pointer-events-none">{prefix}</span>
        )}
        <Input
          id={field.id}
          type="text"
          inputMode={isPercent ? "decimal" : "numeric"}
          placeholder={isPercent ? `${sliderVal}%` : formatValue(sliderVal)}
          value={displayInput}
          onChange={(e) => handleInputChange(e.target.value)}
          className={cn(
            "!rounded-[var(--radius-field)] h-[58px] min-h-[58px] text-lg font-semibold text-aw-text",
            prefix ? "pl-8" : "pl-4",
            // Filled state: border stays gray per spec §04. Green border = focus only (isFocused in Input).
            error && "border-feedback-error"
          )}
          aria-label={field.label || field.placeholder || field.id}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
        />
        {suffix && displayInput && (
          <span className="absolute right-10 top-1/2 -translate-y-1/2 text-lg font-semibold text-aw-text pointer-events-none">{suffix}</span>
        )}
        {isValid && (
          <CheckIcon className="absolute right-4 top-1/2 -translate-y-1/2 size-6 text-sg-primary-green pointer-events-none" strokeWidth={2.5} />
        )}
      </div>

      {error && (
        <p id={errorId} className="text-sm text-feedback-error" role="alert" aria-live="polite">
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
  const isDateField = field.type === "date";
  const inputMode: React.InputHTMLAttributes<HTMLInputElement>["inputMode"] =
    field.type === "tel" ? "tel" : isZipCode ? "numeric" : undefined;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let inputValue = e.target.value;
    if (isZipCode) {
      inputValue = inputValue.replace(/\D/g, "").slice(0, 5);
    }
    onChange(inputValue);
  };

  const handleInputClick = (e: React.MouseEvent<HTMLInputElement>) => {
    if (!isDateField) return;

    const input = e.currentTarget as HTMLInputElement & { showPicker?: () => void };
    try {
      input.showPicker?.();
    } catch {
      // Some browsers only allow showPicker from specific trusted interactions.
    }
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
        {/* Location pin icon for ZIP code */}
        {isZipCode && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
            <MapPin className="size-4 text-aw-tertiary" strokeWidth={2} />
          </div>
        )}
        {(field.label || isZipCode) && (
          <label
            htmlFor={field.id}
            className={cn(
              "absolute pointer-events-none transition-all duration-200 ease-out z-10 origin-left",
              isZipCode ? "left-9" : "left-3",
              isFloating
                ? "top-2 text-[11px] font-semibold tracking-[0.02em] uppercase text-aw-tertiary field-label"
                : "top-1/2 -translate-y-1/2 text-[15px] font-medium text-aw-tertiary field-label"
            )}
          >
            {isZipCode ? "Please enter your answer" : field.label}
          </label>
        )}
        <Input
          id={field.id}
          type={field.type}
          inputMode={inputMode}
          placeholder={(!field.label && !isZipCode) ? field.placeholder : undefined}
          value={typeof value === "string" || typeof value === "number" ? String(value) : ""}
          onChange={handleInputChange}
          onClick={handleInputClick}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          maxLength={isZipCode ? 5 : undefined}
          className={cn(
            "!rounded-[var(--radius-field)] h-[58px] min-h-[58px] pr-10",
            (field.label || isZipCode) ? "pt-5 pb-1" : "",
            isZipCode && "pl-9",
            isDateField && "pr-3 [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none",
            isDateField && !hasValue && "text-transparent caret-transparent selection:bg-transparent selection:text-transparent [&::-webkit-date-and-time-value]:text-transparent [&::-webkit-datetime-edit]:text-transparent [&::-webkit-datetime-edit-fields-wrapper]:text-transparent [&::-webkit-datetime-edit-text]:text-transparent [&::-webkit-datetime-edit-day-field]:text-transparent [&::-webkit-datetime-edit-month-field]:text-transparent [&::-webkit-datetime-edit-year-field]:text-transparent",
            "mobile-field-input field-input font-semibold tracking-[0.01em] text-aw-text",
            // Filled state: border stays at --border (gray) per spec §04.
            // Green border is focus-only — handled by the Input component's isFocused state.
            error && "border-feedback-error"
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
        <p id={errorId} className="text-sm text-feedback-error mt-1" role="alert" aria-live="polite">
          {error}
        </p>
      )}
    </div>
  );
}

function YearSliderField({
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
  const min = field.validation?.min ?? 1985;
  const max = field.validation?.max ?? new Date().getFullYear();
  const fallback = typeof field.defaultValue === "number" ? field.defaultValue : Math.round((min + max) / 2);
  const currentNum = typeof value === "number" ? value : fallback;

  const [sliderVal, setSliderVal] = useState(currentNum);
  const [inputText, setInputText] = useState("");

  useEffect(() => {
    setSliderVal(currentNum);
  }, [currentNum]);

  const isValid = isValidValue(field, typeof inputText === "string" && inputText.trim() ? currentNum : sliderVal);

  const handleInputChange = (raw: string) => {
    const digits = raw.replace(/[^0-9]/g, "").slice(0, 4);
    setInputText(digits);
    if (digits === "") {
      onChange(sliderVal);
    } else {
      const parsed = parseInt(digits, 10);
      onChange(Number.isNaN(parsed) ? sliderVal : parsed);
    }
  };

  const handleSliderChange = (val: number) => {
    setSliderVal(val);
    if (!inputText.trim()) {
      onChange(val);
    }
  };

  const handleDecrement = () => {
    const next = Math.max(min, sliderVal - 1);
    setSliderVal(next);
    setInputText("");
    onChange(next);
  };

  const handleIncrement = () => {
    const next = Math.min(max, sliderVal + 1);
    setSliderVal(next);
    setInputText("");
    onChange(next);
  };

  const displayInput = inputText.trim() ? inputText : "";
  const progressPercent = ((sliderVal - min) / (max - min)) * 100;

  return (
    <div className="w-full sm:w-[460px] flex flex-col gap-4">
      {field.label && (
        <Label htmlFor={field.id} className="text-base font-medium text-aw-text">
          {field.label}
        </Label>
      )}
      
      {/* Stepper row: minus button, value display, plus button */}
      <div className="flex items-center justify-center gap-4">
        <button
          type="button"
          onClick={handleDecrement}
          disabled={sliderVal <= min}
          aria-label="Decrease year"
          className="size-12 shrink-0 rounded-[var(--radius-field)] border border-sg-primary-green bg-sg-green-50 flex items-center justify-center hover:bg-sg-green-100 disabled:opacity-40 disabled:cursor-not-allowed transition-[background-color] duration-200 focus-visible:shadow-[var(--focus-ring)] outline-none"
        >
          <Minus className="size-5 text-sg-primary-green" strokeWidth={2.5} />
        </button>
        
        <div className="text-[32px] font-bold text-aw-text tracking-tight min-w-[100px] text-center">
          {sliderVal}
        </div>
        
        <button
          type="button"
          onClick={handleIncrement}
          disabled={sliderVal >= max}
          aria-label="Increase year"
          className="size-12 shrink-0 rounded-[var(--radius-field)] border border-sg-primary-green bg-sg-green-50 flex items-center justify-center hover:bg-sg-green-100 disabled:opacity-40 disabled:cursor-not-allowed transition-[background-color] duration-200 focus-visible:shadow-[var(--focus-ring)] outline-none"
        >
          <Plus className="size-5 text-sg-primary-green" strokeWidth={2.5} />
        </button>
      </div>

      {/* Slider track */}
      <div className="relative w-full h-6 flex items-center">
        <input
          type="range"
          min={min}
          max={max}
          step={1}
          value={sliderVal}
          onChange={(e) => handleSliderChange(parseInt(e.target.value, 10))}
          className="w-full h-2 rounded-full appearance-none cursor-pointer bg-transparent relative z-10 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-sg-primary-green [&::-webkit-slider-thumb]:shadow-[var(--shadow-slider-thumb)] [&::-webkit-slider-thumb]:border-[3px] [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-runnable-track]:bg-transparent [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-sg-primary-green [&::-moz-range-thumb]:border-[3px] [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:shadow-[var(--shadow-slider-thumb)] [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-track]:bg-transparent"
          aria-label={`${field.label || field.id} slider`}
          style={{ background: 'transparent' }}
        />
        {/* Track background */}
        <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-2 rounded-full overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-neutral-track" />
          <div 
            className="absolute top-0 left-0 h-full bg-sg-primary-green rounded-full" 
            style={{ width: `${progressPercent}%` }} 
          />
        </div>
      </div>

      {/* Min/Max labels */}
      <div className="flex justify-between text-sm text-aw-tertiary">
        <span>{min}</span>
        <span>{max}</span>
      </div>

      {/* Input field */}
      <div className="relative">
        <Input
          id={field.id}
          type="text"
          inputMode="numeric"
          placeholder={String(sliderVal)}
          value={displayInput}
          onChange={(e) => handleInputChange(e.target.value)}
          className={cn(
            "!rounded-[var(--radius-field)] h-[58px] min-h-[58px] pl-4 mobile-field-input field-input font-semibold tracking-[0.01em] text-aw-text",
            // Filled state: border stays gray per spec §04. Green border = focus only.
            error && "border-feedback-error"
          )}
          aria-label={field.label || field.placeholder || field.id}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
        />
        {isValid && (
          <CheckIcon className="absolute right-4 top-1/2 -translate-y-1/2 size-6 text-sg-primary-green pointer-events-none" strokeWidth={2.5} />
        )}
      </div>

      {error && (
        <p id={errorId} className="text-sm text-feedback-error" role="alert" aria-live="polite">
          {error}
        </p>
      )}
    </div>
  );
}

function DependentDropdownField({
  field,
  value,
  onChange,
  error,
  errorId,
  isValidValue,
  dependencyValue,
}: {
  field: FormField;
  value: FieldValue | undefined;
  onChange: (v: FieldValue) => void;
  error?: string;
  errorId: string;
  isValidValue: (f: FormField, v: FieldValue | undefined) => boolean;
  dependencyValue?: string;
}) {
  const models =
    dependencyValue && dependencyValue in vehicleModels
      ? (vehicleModels as Record<string, string[]>)[dependencyValue]
      : [];
  const isSelectValid = isValidValue(field, value);

  return (
    <div className="w-full sm:w-[460px]">
      {field.label && (
        <Label htmlFor={field.id} className="text-base font-medium text-aw-text mb-2 block">
          {field.label}
        </Label>
      )}
      <div className="relative">
        <select
          id={field.id}
          value={typeof value === "string" ? value : ""}
          onChange={(e) => onChange(e.target.value)}
          disabled={!dependencyValue}
          className={cn(
            "h-[58px] min-h-[58px] w-full rounded-[var(--radius-field)] border-[1.5px] border-aw-border px-3 py-2 pr-10 text-base text-aw-text outline-none shadow-[var(--field-shadow)] transition-[border-color,background-color,box-shadow,transform] duration-200 ease-out will-change-[border-color,transform] motion-reduce:transition-none motion-reduce:will-change-auto hover:border-sg-primary-green hover:shadow-[var(--focus-ring)] cursor-pointer disabled:cursor-not-allowed disabled:opacity-50",
            "!bg-white",
            "focus-visible:!border-[var(--sg-primary-green)] focus-visible:shadow-[var(--focus-ring)]",
            isSelectValid && "border-[var(--sg-primary-green)]",
          // Error: red border + red ring always on (spec §04), kept on hover and focus-visible.
            error && "border-feedback-error shadow-[var(--focus-ring-error)] hover:border-feedback-error hover:shadow-[var(--focus-ring-error)] focus-visible:shadow-[var(--focus-ring-error)]"
          )}
          required={field.required}
          aria-label={field.label || field.placeholder || field.id}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          aria-required={field.required}
        >
          <option value="">
            {dependencyValue ? "Select a model..." : "Select a make first..."}
          </option>
          {models.map((model) => (
            <option key={model} value={model}>
              {model}
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
        <p id={errorId} className="text-sm text-feedback-error mt-1" role="alert" aria-live="polite">
          {error}
        </p>
      )}
    </div>
  );
}

function RadioOptionsField({
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
  const visibleOptions = field.options?.filter((option) => !option.uiHidden) ?? [];
  const hasIcons = visibleOptions.some((o) => o.icon);
  const optionRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Keep refs array in sync with option count.
  // Do NOT auto-focus any option on mount — focus is managed by the parent
  // step container, which moves focus to the question heading on each step load.
  useEffect(() => {
    optionRefs.current = optionRefs.current.slice(0, visibleOptions.length);
  }, [visibleOptions.length]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, currentIndex: number) => {
      const optionsCount = visibleOptions.length;
      let nextIndex = currentIndex;

      switch (e.key) {
        case "ArrowDown":
        case "ArrowRight":
          e.preventDefault();
          e.stopPropagation();
          nextIndex = (currentIndex + 1) % optionsCount;
          break;
        case "ArrowUp":
        case "ArrowLeft":
          e.preventDefault();
          e.stopPropagation();
          nextIndex = (currentIndex - 1 + optionsCount) % optionsCount;
          break;
        case "Enter":
        case " ":
          e.preventDefault();
          e.stopPropagation();
          const option = visibleOptions[currentIndex];
          if (option) {
            onChange(option.value);
          }
          return;
        case "Home":
          e.preventDefault();
          e.stopPropagation();
          nextIndex = 0;
          break;
        case "End":
          e.preventDefault();
          e.stopPropagation();
          nextIndex = optionsCount - 1;
          break;
        default:
          return;
      }

      const nextEl = optionRefs.current[nextIndex];
      if (nextEl) {
        nextEl.focus();
      }
    },
    [visibleOptions, onChange]
  );

  return (
    <RadioGroup
      value={typeof value === "string" ? value : ""}
      onValueChange={(v) => onChange(v)}
      className="w-full sm:w-[460px] flex flex-col gap-2 md:gap-3"
      aria-label={field.label || field.id}
      aria-invalid={!!error}
      aria-describedby={error ? errorId : undefined}
    >
      {visibleOptions.map((option, index) => {
        const isSelected = value === option.value;
        const isValid = isSelected && isValidValue(field, value);
        // showSelected is driven ONLY by whether this option's value matches
        // the stored answer. Never hint or pre-style the first option.
        const showSelected = isValid;

        return (
          <div
            key={option.value}
            ref={(el) => {
              optionRefs.current[index] = el;
            }}
            className={cn(
              // Default: 1px border (spec §04 — radio chips use 1px, NOT 1.5px).
              // Hover: border darkens to --border-strong (#BFCBC7) — NOT green, NO translateY (guide has no lift on chips).
              // Transition: border-color + bg + box-shadow at 140ms ease (§04 spec).
              "border border-aw-border rounded-[var(--radius-field)] flex items-center px-4 cursor-pointer shadow-[var(--field-shadow)] hover:border-aw-border-strong transition-[border-color,background-color,box-shadow] duration-[140ms] ease relative !bg-white outline-none",
              // Unselected hover: deeper shadow (no translate — spec has none).
              !showSelected && "hover:shadow-[var(--field-shadow-hover)]",
              // focus-visible: keyboard-only focus ring. Guide: ring only, border color unchanged by focus.
              // No bare focus: rule so programmatic .focus() / mouse clicks don't paint the ring.
              "focus-visible:shadow-[var(--focus-ring)]",
              // Selected: 2px green border, green-50 bg, green glow shadow (--shadow-selected).
              // focus-visible on selected: combined ring + glow via --focus-ring-selected.
              showSelected && "![border-width:2px] border-[var(--sg-primary-green)] !bg-sg-green-50 shadow-[var(--shadow-selected)] focus-visible:shadow-[var(--focus-ring-selected)]",
              // Error: red border + red ring always on (spec §04), kept on hover and focus-visible.
              error && "border-feedback-error shadow-[var(--focus-ring-error)] hover:border-feedback-error hover:shadow-[var(--focus-ring-error)] focus-visible:border-feedback-error focus-visible:shadow-[var(--focus-ring-error)]",
              hasIcons ? "h-[66px] min-h-[66px] gap-4" : "h-[58px] min-h-[58px] justify-center"
            )}
            onClick={() => onChange(option.value)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            tabIndex={0}
            role="radio"
            aria-checked={isSelected}
          >
            {option.icon && (
              <div className={cn(
                "shrink-0 size-11 rounded-2xl flex items-center justify-center transition-colors duration-200",
                showSelected
                  ? "bg-sg-primary-green text-white"
                  : "bg-sg-green-tint text-sg-primary-green"
              )}>
                <LucideIcon name={option.icon} className="size-5" />
              </div>
            )}
            <Label
              htmlFor={option.value}
              className={cn(
                "text-aw-text cursor-pointer font-[650] mobile-choice-label choice-label text-[17px] leading-[22px] md:text-[18px] md:leading-[24px]",
                !hasIcons && "text-center"
              )}
            >
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
}

interface DynamicFormFieldProps {
  field: FormField;
  value: FieldValue | undefined;
  onChange: (value: FieldValue) => void;
  error?: string;
  isLastStep?: boolean;
  isLastField?: boolean;
  dependencyValue?: string;
}

export function DynamicFormField({ field, value, onChange, error, dependencyValue }: DynamicFormFieldProps) {
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
                  className="h-4 w-4 border-2 border-neutral-control-border rounded data-[state=checked]:bg-neutral-control-active data-[state=checked]:border-neutral-control-active data-[state=checked]:text-white shadow-none outline-none focus-visible:ring-0 focus-visible:outline-none focus-visible:shadow-[var(--focus-ring)]"
                  aria-label={field.label || field.id}
                  aria-invalid={!!error}
                  aria-describedby={error ? errorId : undefined}
                />
                {field.label && (
                  <label 
                    htmlFor={field.id}
                    className="text-xs text-aw-tertiary cursor-pointer select-none"
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
              // Same chip spec as radio tiles: 1px default border, hover darkens to --border-strong (NOT green), 140ms ease.
              "border border-aw-border h-[58px] min-h-[58px] rounded-[var(--radius-field)] w-full sm:w-[460px] flex items-center gap-3 px-4 cursor-pointer shadow-[var(--field-shadow)] hover:border-aw-border-strong transition-[border-color,background-color,box-shadow] duration-[140ms] ease relative",
              !isCheckboxValid && "hover:shadow-[var(--field-shadow-hover)]",
              "focus-visible:shadow-[var(--focus-ring)] !bg-white outline-none",
              isCheckboxValid && "![border-width:2px] border-[var(--sg-primary-green)] !bg-sg-green-50 shadow-[var(--shadow-selected)] focus-visible:shadow-[var(--focus-ring-selected)]",
              // Error: red border + red ring always on (spec §04), kept on hover and focus-visible.
              error && "border-feedback-error shadow-[var(--focus-ring-error)] hover:border-feedback-error hover:shadow-[var(--focus-ring-error)] focus-visible:border-feedback-error focus-visible:shadow-[var(--focus-ring-error)]"
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
              <span className="text-base text-aw-text leading-[1.5] tracking-[0.08px]">{field.label}</span>
            )}
            {isCheckboxValid && (
              <CheckIcon className="size-5 text-[var(--sw-success-green)] pointer-events-none shrink-0 ml-auto" />
            )}
          </div>
        );

      case "radio": {
        return (
          <RadioOptionsField
            field={field}
            value={value}
            onChange={onChange}
            error={error}
            errorId={errorId}
            isValidValue={isValidValue}
          />
        );
      }

      case "text":
      case "email":
      case "tel":
      case "number":
      case "date":
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
              <Label htmlFor={field.id} className="text-base font-medium text-aw-text mb-2 block">
                {field.label}
              </Label>
            )}
            <div className="relative">
              <select
                id={field.id}
                value={typeof value === "string" ? value : ""}
                onChange={(e) => onChange(e.target.value)}
                className={cn(
                  "h-[58px] min-h-[58px] w-full rounded-[var(--radius-field)] border-[1.5px] border-aw-border px-3 py-2 pr-10 text-base text-aw-text outline-none shadow-[var(--field-shadow)] transition-[border-color,background-color,box-shadow,transform] duration-200 ease-out will-change-[border-color,transform] motion-reduce:transition-none motion-reduce:will-change-auto hover:border-sg-primary-green hover:shadow-[var(--focus-ring)] cursor-pointer disabled:cursor-not-allowed disabled:opacity-50",
                  "!bg-white",
                  "focus-visible:!border-[var(--sg-primary-green)] focus-visible:shadow-[var(--focus-ring)]",
                  isSelectValid && "border-[var(--sg-primary-green)]",
                  // Error: red border + red ring always on (spec §04).
                  error && "border-feedback-error shadow-[var(--focus-ring-error)] hover:border-feedback-error hover:shadow-[var(--focus-ring-error)] focus-visible:shadow-[var(--focus-ring-error)]"
                )}
                required={field.required}
                aria-label={field.label || field.id}
                aria-invalid={!!error}
                aria-describedby={error ? errorId : undefined}
                aria-required={field.required}
              >
                <option value="">Select an option...</option>
                {field.options?.filter((option) => !option.uiHidden).map((option) => (
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
                className="text-sm text-feedback-error mt-1"
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

      case "year-slider": {
        return (
          <YearSliderField
            field={field}
            value={value}
            onChange={onChange}
            error={error}
            errorId={errorId}
            isValidValue={isValidValue}
          />
        );
      }

      case "dependent-dropdown": {
        return (
          <DependentDropdownField
            field={field}
            value={value}
            onChange={onChange}
            error={error}
            errorId={errorId}
            isValidValue={isValidValue}
            dependencyValue={dependencyValue}
          />
        );
      }

      default:
        return null;
    }
  };

  return <div className="w-full flex justify-center">{renderField()}</div>;
}

