"use client";

import { useForm } from "@tanstack/react-form";
import { bathtubFeaturesSchema } from "@/lib/schemas";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const features = [
  { id: "fast-filling", label: "Fast filling" },
  { id: "quick-draining", label: "Quick draining" },
  { id: "heated-seats", label: "Heated seats" },
  { id: "handrails", label: "Handrails" },
];

export function BathtubFeaturesForm() {
  const form = useForm({
    defaultValues: {
      features: [] as string[],
    },
    onSubmit: async ({ value }) => {
      const result = bathtubFeaturesSchema.safeParse(value);
      if (result.success) {
        console.log("Form submitted:", result.data);
        // Handle form submission
      } else {
        console.error("Validation errors:", result.error);
      }
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className="w-full flex flex-col items-center"
    >

      <Card className="w-full border border-gray-200">
        <CardHeader className="text-center space-y-1 px-4 sm:px-5 md:px-6">
          <CardTitle className="text-[20px] sm:text-[22px] md:text-2xl font-semibold text-foreground tracking-[-0.4px] sm:tracking-[-0.44px] md:tracking-[-0.48px]">
            What walk-in bathtub features would you like?
          </CardTitle>
          <CardDescription className="text-base text-muted-foreground">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 items-center px-4 sm:px-5 md:px-6">
          {features.map((feature) => (
            <form.Field
              key={feature.id}
              name="features"
            >
              {(field) => (
                <div
                  className={cn(
                    "bg-white border border-gray-200 h-[43px] min-h-[40px] rounded-lg w-full sm:w-[380px] md:w-[342px] flex items-center gap-3 px-4 cursor-pointer hover:border-gray-300 transition-colors",
                    field.state.value.includes(feature.id) && "border-[#204c4b]"
                  )}
                  onClick={() => {
                    const currentValue = field.state.value;
                    const newValue = currentValue.includes(feature.id)
                      ? currentValue.filter((id) => id !== feature.id)
                      : [...currentValue, feature.id];
                    field.handleChange(newValue);
                  }}
                >
                  <Checkbox
                    checked={field.state.value.includes(feature.id)}
                    onCheckedChange={(checked) => {
                      const currentValue = field.state.value;
                      const newValue = checked
                        ? [...currentValue, feature.id]
                        : currentValue.filter((id) => id !== feature.id);
                      field.handleChange(newValue);
                    }}
                    className="h-4 w-4 shrink-0"
                  />
                  <span className="text-base text-foreground">{feature.label}</span>
                </div>
              )}
            </form.Field>
          ))}
        </CardContent>
      </Card>
      
      <form.Subscribe
        selector={(state) => [state.values.features.length > 0, state.isSubmitting]}
      >
        {([hasFeatures, isSubmitting]) => (
          <Button
            type="submit"
            disabled={!hasFeatures || isSubmitting}
            className="bg-[#204c4b] hover:bg-[#204c4b]/90 text-white h-10 px-6 mt-8 sm:mt-10 md:mt-12 w-full sm:w-[400px] md:w-[445px] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="text-base font-medium">Continue</span>
            <ArrowRight className="h-3.5 w-3.5 ml-2" />
          </Button>
        )}
      </form.Subscribe>
    </form>
  );
}

