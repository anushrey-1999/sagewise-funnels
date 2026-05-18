import type { FormConfig, FormData } from "@/types/form";
import { buildMortgageRankingParams } from "@/lib/mortgage-adwall-ranking";

const excludedRankingFieldIds = new Set([
  "firstname",
  "first_name",
  "lastname",
  "last_name",
  "fullname",
  "full_name",
  "name",
  "email",
  "phone",
  "phonenumber",
  "phone_number",
]);

function toRankingParamKey(fieldId: string): string {
  return `rank${fieldId.charAt(0).toUpperCase()}${fieldId.slice(1)}`;
}

function cleanRankingValue(value: string | number | boolean | string[] | undefined): string | null {
  const rawValue = Array.isArray(value) ? value[0] : value;
  if (rawValue === undefined || rawValue === null) return null;

  const cleaned = String(rawValue).trim();
  return cleaned ? cleaned : null;
}

function getGenericRankingParams(formData: FormData): Record<string, string> {
  const params: Record<string, string> = {};

  for (const stepData of Object.values(formData)) {
    if (!stepData) continue;

    for (const [fieldId, value] of Object.entries(stepData)) {
      const normalizedFieldId = fieldId.toLowerCase().replace(/[-_\s]/g, "");
      if (excludedRankingFieldIds.has(normalizedFieldId)) continue;

      const rankingValue = cleanRankingValue(value);
      if (rankingValue) {
        params[toRankingParamKey(fieldId)] = rankingValue;
      }
    }
  }

  return params;
}

export function buildAdwallRankingQueryParams(
  config: FormConfig,
  formData: FormData,
  destinationPath: string
): Record<string, string> {
  const params = getGenericRankingParams(formData);
  const mortgageRankingParams =
    config.id === "mortgage" ? buildMortgageRankingParams(formData, destinationPath) : null;

  if (mortgageRankingParams) {
    params.rankCredit = mortgageRankingParams.rankCredit;
    params.rankAmount = mortgageRankingParams.rankAmount;
    params.rankCreditScore = mortgageRankingParams.rankCredit;
    params.rankLoanAmount = mortgageRankingParams.rankAmount;
  }

  return params;
}
