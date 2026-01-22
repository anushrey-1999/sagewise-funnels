export type InputType =
  | "checkbox"
  | "text"
  | "radio"
  | "select"
  | "dropdown"
  | "textarea"
  | "email"
  | "tel"
  | "number";

export interface RedirectRule {
  whenValues: string[];
  to: string;
}

export interface RedirectOnAnswer {
  rules: RedirectRule[];
  defaultTo?: string;
}

export interface FormField {
  id: string;
  type: InputType;
  label?: string; // Optional label - if not provided, no label and no required asterisk will be shown
  placeholder?: string;
  required?: boolean;
  autoForward?: boolean; // Control whether this field triggers auto-forward when complete
  redirectOnAnswer?: RedirectOnAnswer; // Optional: redirect after submission based on this field's answer
  redirectImmediately?: boolean; // Optional: if true, apply redirectOnAnswer immediately when this field is answered
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

export type SkipIf = SkipCondition | SkipCondition[];

export interface FormStep {
  id: string;
  title: string;
  description: string;
  fields: FormField[];
  skipIf?: SkipIf; // Condition(s) that determine if this step should be skipped
}

export interface FormConfig {
  id: string;
  title: string; // Hero title
  subtitle: string; // Hero subtitle
  metaDescription?: string; // Meta description for SEO
  firstStepButton?: {
    /**
     * Text label for the "next" button on step 1.
     * Defaults to "Continue" when omitted.
     */
    text?: string;
    /**
     * Background color for step-1 button. Prefer CSS vars like:
     * "var(--sw-cta-primary)" to match adwall CTA styling.
     */
    bgColor?: string;
    /**
     * Hover background color for step-1 button.
     */
    hoverBgColor?: string;
    /**
     * Text/icon color for step-1 button.
     */
    textColor?: string;
  };
  navbar?: {
    tagline?: string; // e.g., "Speak to a licensed agent:"
    phone?: string; // display value, e.g., "1-833-906-2737"
  };
  postFormInfoBar?: {
    items: Array<{
      icon: string; // e.g., "monitor", "lock", "clock" (lucide key) or "/icons/..."
      text: string;
    }>;
  };
  providerLogos?: {
    heading?: string;
    logos: Array<{
      src: string;
      alt: string;
      width: number;
      height: number;
    }>;
  };
  belowLogosImage?: {
    src: string;
    alt?: string;
    width: number;
    height: number;
  };
  postContent?: {
    details?: {
      blocks: Array<
        | { type: "h2"; text: string }
        | { type: "h3"; text: string }
        | { type: "pHtml"; html: string }
        | {
            type: "iconList";
            items: Array<{ icon: string; textHtml: string }>;
          }
        | { type: "bulletsHtml"; itemsHtml: string[] }
        | {
            type: "definitionListHtml";
            items: Array<{ term: string; html: string }>;
          }
        | { type: "numberedHtml"; itemsHtml: string[] }
        | {
            type: "steps";
            items: Array<{ icon: string; textHtml: string }>;
          }
        | { type: "calloutHtml"; icon: string; html: string }
        | {
            type: "textRow";
            icon?: string;
            text: string;
            linkText?: string;
            href?: string;
          }
      >;
    };
    faqs?: {
      heading: string;
      items: Array<{
        q: string;
        aBlocks: Array<
          | { type: "p"; text: string }
          | { type: "bullets"; items: string[] }
          | { type: "split"; left: string; right: string }
        >;
      }>;
    };
    bottomLine?: {
      heading: string;
      bodyHtml: string;
      icon?: string;
    };
  };
  steps: FormStep[];
  finalStep?: {
    buttonText?: string; // Text for the final submit button
    disclaimerText?: string; // Privacy disclaimer text
    loaderText?: string; // Text shown in the loader screen
    redirectTo?: string; // Fallback redirect path after submission (if no redirectOnAnswer matches)
  };
}

export interface FormData {
  [stepId: string]: {
    [fieldId: string]: string | string[] | number | boolean;
  };
}

