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
              "bg-white border border-gray-200 h-[43px] min-h-[40px] rounded-lg w-full sm:w-[380px] md:w-[342px] flex items-center gap-3 px-4 cursor-pointer hover:border-gray-300 transition-colors",
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
            <Checkbox
              checked={Array.isArray(value) && value.includes(field.id)}
              onCheckedChange={(checked) => {
                const currentValue = Array.isArray(value) ? value : [];
                const newValue = checked
                  ? [...currentValue, field.id]
                  : currentValue.filter((id) => id !== field.id);
                onChange(newValue);
              }}
              className="h-4 w-4 shrink-0"
            />
            <span className="text-base text-foreground">{field.label}</span>
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
              onChange={(e) => onChange(e.target.value)}
              className={cn(
                "h-[43px] min-h-[40px] rounded-lg",
                error && "border-red-500"
              )}
              required={field.required}
            />
            {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
          </div>
        );

      default:
        return null;
    }
  };

  return <div className="w-full flex justify-center">{renderField()}</div>;
}

