import { FormConfig, FormData, RedirectOnAnswer } from "@/types/form";

function normalizePath(path: string): string {
  if (!path) return "/";
  return path.startsWith("/") ? path : `/${path}`;
}

function getSelectedValues(fieldType: string, value: unknown): string[] {
  if (value === undefined || value === null) return [];

  if (fieldType === "checkbox") {
    return Array.isArray(value) ? value.map(String) : [];
  }

  if (fieldType === "radio" || fieldType === "select") {
    return [String(value)];
  }

  return [];
}

function matchRedirect(redirectOnAnswer: RedirectOnAnswer, selectedValues: string[]): string | null {
  for (const rule of redirectOnAnswer.rules || []) {
    if (!rule?.to || !Array.isArray(rule.whenValues)) continue;

    const matches = rule.whenValues.some((candidate) => selectedValues.includes(candidate));
    if (matches) {
      return normalizePath(rule.to);
    }
  }

  if (redirectOnAnswer.defaultTo) {
    return normalizePath(redirectOnAnswer.defaultTo);
  }

  return null;
}

export function resolveRedirectOnAnswer(redirectOnAnswer: RedirectOnAnswer, fieldType: string, value: unknown): string | null {
  const selectedValues = getSelectedValues(fieldType, value);
  if (selectedValues.length === 0) return null;
  return matchRedirect(redirectOnAnswer, selectedValues);
}

/**
 * Computes where to send the user after submission.
 *
 * Priority:
 * 1) First matching `field.redirectOnAnswer.rules` in config order (steps then fields)
 * 2) `config.finalStep.redirectTo`
 * 3) Default: `/creditcards-adwall-one`
 */
export function resolvePostSubmitRedirect(config: FormConfig, data: FormData): string {
  for (const step of config.steps) {
    const stepData = data[step.id];
    if (!stepData) continue;

    for (const field of step.fields) {
      if (!field.redirectOnAnswer) continue;

      const rawValue = stepData[field.id];
      const selectedValues = getSelectedValues(field.type, rawValue);
      if (selectedValues.length === 0) continue;

      const matched = matchRedirect(field.redirectOnAnswer, selectedValues);
      if (matched) return matched;
    }
  }

  if (config.finalStep?.redirectTo) {
    return normalizePath(config.finalStep.redirectTo);
  }

  return "/creditcards-adwall-one";
}
