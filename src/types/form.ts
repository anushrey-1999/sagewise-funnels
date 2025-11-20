export type InputType = "checkbox" | "text" | "radio" | "select" | "textarea" | "email" | "tel" | "number";

export interface FormField {
  id: string;
  type: InputType;
  label: string;
  placeholder?: string;
  required?: boolean;
  validation?: {
    pattern?: string;
    min?: number;
    max?: number;
    message?: string;
  };
  options?: Array<{ value: string; label: string }>; // For radio, select, checkbox
}

export interface FormStep {
  id: string;
  title: string;
  description: string;
  fields: FormField[];
}

export interface FormConfig {
  id: string;
  title: string; // Hero title
  subtitle: string; // Hero subtitle
  steps: FormStep[];
  finalStep?: {
    title: string;
    description: string;
    buttonText?: string;
  };
}

export interface FormData {
  [stepId: string]: {
    [fieldId: string]: string | string[] | number | boolean;
  };
}

