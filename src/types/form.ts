export type InputType = "checkbox" | "text" | "radio" | "select" | "textarea" | "email" | "tel" | "number";

export interface FormField {
  id: string;
  type: InputType;
  label?: string; // Optional label - if not provided, no label and no required asterisk will be shown
  placeholder?: string;
  required?: boolean;
  autoForward?: boolean; // Control whether this field triggers auto-forward when complete
  validation?: {
    pattern?: string;
    min?: number;
    max?: number;
    message?: string;
  };
  options?: Array<{ value: string; label: string }>; // For radio, select, checkbox
}

export interface SkipCondition {
  checkStepId: string; // The step ID to check for the condition
  checkFieldId: string; // The field ID in that step to check
  whenValues: string[]; // Array of values that trigger the skip (if field value matches any of these, skip this step)
}

export interface FormStep {
  id: string;
  title: string;
  description: string;
  fields: FormField[];
  skipIf?: SkipCondition; // Condition that determines if this step should be skipped
}

export interface FormConfig {
  id: string;
  title: string; // Hero title
  subtitle: string; // Hero subtitle
  metaDescription?: string; // Meta description for SEO
  steps: FormStep[];
  finalStep?: {
    buttonText?: string; // Text for the final submit button
    disclaimerText?: string; // Privacy disclaimer text
    loaderText?: string; // Text shown in the loader screen
  };
}

export interface FormData {
  [stepId: string]: {
    [fieldId: string]: string | string[] | number | boolean;
  };
}

