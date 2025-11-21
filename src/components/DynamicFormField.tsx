"use client";

import { FormField } from "@/types/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface DynamicFormFieldProps {
  field: FormField;
  value: any;
  onChange: (value: any) => void;
  error?: string;
}

export function DynamicFormField({ field, value, onChange, error }: DynamicFormFieldProps) {
  const renderField = () => {
    switch (field.type) {
      case "checkbox":
        return (
          <div
            className={cn(
              "bg-white border border-[#e5e5e5] h-[43px] min-h-[40px] rounded-lg w-full max-w-[342px] flex items-center gap-3 px-4 cursor-pointer hover:border-gray-300 transition-colors",
              Array.isArray(value) && value.includes(field.id) && "border-[#204c4b]",
              error && "border-red-500"
            )}
            onClick={() => {
              const currentValue = Array.isArray(value) ? value : [];
              const newValue = currentValue.includes(field.id)
                ? currentValue.filter((id) => id !== field.id)
                : [...currentValue, field.id];
              onChange(newValue);
            }}
          >
            <div className="relative shrink-0 size-5">
              <Checkbox
                checked={Array.isArray(value) && value.includes(field.id)}
                onCheckedChange={(checked) => {
                  const currentValue = Array.isArray(value) ? value : [];
                  const newValue = checked
                    ? [...currentValue, field.id]
                    : currentValue.filter((id) => id !== field.id);
                  onChange(newValue);
                }}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-4 w-4"
              />
            </div>
            <span className="text-base text-foreground leading-[1.5] tracking-[0.08px]">{field.label}</span>
          </div>
        );

      case "radio":
        return (
          <RadioGroup
            value={value || ""}
            onValueChange={onChange}
            className="w-full sm:w-[380px] md:w-[342px]"
          >
            {field.options?.map((option) => (
              <div
                key={option.value}
                className={cn(
                  "bg-white border border-gray-200 h-[43px] min-h-[40px] rounded-lg flex items-center gap-3 px-4 cursor-pointer hover:border-gray-300 transition-colors mb-3",
                  value === option.value && "border-[#204c4b]",
                  error && "border-red-500"
                )}
                onClick={() => onChange(option.value)}
              >
                <RadioGroupItem value={option.value} id={option.value} className="h-4 w-4" />
                <Label htmlFor={option.value} className="text-base text-foreground cursor-pointer flex-1">
                  {option.label}
                </Label>
              </div>
            ))}
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
        
        return (
          <div className="w-full sm:w-[380px] md:w-[342px]">
            <Label htmlFor={field.id} className="text-base font-medium text-foreground mb-2 block">
              {field.label}
            </Label>
            <Input
              id={field.id}
              type={field.type}
              placeholder={field.placeholder}
              value={value || ""}
              onChange={handleInputChange}
              maxLength={isZipCode ? 5 : undefined}
              className={cn(
                "h-[43px] min-h-[40px] rounded-lg",
                error && "border-red-500"
              )}
              required={field.required}
            />
            {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
          </div>
        );

      case "select":
        return (
          <div className="w-full sm:w-[380px] md:w-[342px]">
            <Label htmlFor={field.id} className="text-base font-medium text-foreground mb-2 block">
              {field.label}
            </Label>
            <select
              id={field.id}
              value={value || ""}
              onChange={(e) => onChange(e.target.value)}
              className={cn(
                "h-[43px] min-h-[40px] w-full rounded-lg border border-[#e5e5e5] bg-white px-3 py-2 text-base text-foreground outline-none transition-colors hover:border-gray-300 focus-visible:border-[#204c4b] focus-visible:ring-2 focus-visible:ring-[#204c4b]/20 disabled:cursor-not-allowed disabled:opacity-50",
                error && "border-red-500"
              )}
              required={field.required}
            >
              <option value="">Select an option...</option>
              {field.options?.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
          </div>
        );

      default:
        return null;
    }
  };

  return <div className="w-full flex justify-center">{renderField()}</div>;
}

