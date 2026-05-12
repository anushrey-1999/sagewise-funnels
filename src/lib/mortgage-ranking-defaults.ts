/**
 * Default mortgage ranking matrices
 * Used by Admin Panel to populate initial rankings via "Load Defaults" button
 */

import type { RankingConfig } from "@/types/adwall";

export const MORTGAGE_RANKING_DIMENSIONS: RankingConfig["dimensions"] = [
  {
    id: "creditScore",
    label: "Credit Score",
    fieldId: "creditScore",
    valueType: "direct",
    buckets: [
      { id: "excellent", label: "Excellent (740+)", matchValues: ["excellent"] },
      { id: "good", label: "Good (680-739)", matchValues: ["good"] },
      { id: "fair", label: "Fair (620-679)", matchValues: ["fair", "poor", "bad"] },
    ],
  },
  {
    id: "loanAmount",
    label: "Loan Amount",
    fieldId: "loanAmount",
    valueType: "calculated",
    calculation: {
      type: "mortgage-amount",
      requiredFields: ["homeValue", "mortgageBalance", "purchasePrice", "downPayment"],
    },
    buckets: [
      { id: "50-150", label: "$50K–$150K" },
      { id: "150-300", label: "$150K–$300K" },
      { id: "300-500", label: "$300K–$500K" },
      { id: "500-plus", label: "$500K+" },
    ],
  },
];

export const DEFAULT_HELOC_RANKINGS: RankingConfig["lenders"] = {
  "Quicken Loans": {
    "excellent:50-150": 13,
    "excellent:150-300": 13,
    "excellent:300-500": 13,
    "excellent:500-plus": 13,
    "good:50-150": 5,
    "good:150-300": 5,
    "good:300-500": 5,
    "good:500-plus": 5,
    "fair:50-150": 8,
    "fair:150-300": 8,
    "fair:300-500": 8,
    "fair:500-plus": 8,
  },
  Figure: {
    "excellent:50-150": 2,
    "excellent:150-300": 2,
    "excellent:300-500": 2,
    "excellent:500-plus": 2,
    "good:50-150": 2,
    "good:150-300": 2,
    "good:300-500": 2,
    "good:500-plus": 2,
    "fair:50-150": 2,
    "fair:150-300": 2,
    "fair:300-500": 2,
    "fair:500-plus": 2,
  },
  LoanDepot: {
    "excellent:50-150": 8,
    "excellent:150-300": 8,
    "excellent:300-500": 8,
    "excellent:500-plus": 8,
    "good:50-150": 8,
    "good:150-300": 8,
    "good:300-500": 8,
    "good:500-plus": 8,
    "fair:50-150": 5,
    "fair:150-300": 5,
    "fair:300-500": 5,
    "fair:500-plus": 5,
  },
  Aven: {
    "excellent:50-150": 1,
    "excellent:150-300": 1,
    "excellent:300-500": 1,
    "excellent:500-plus": 1,
    "good:50-150": 1,
    "good:150-300": 1,
    "good:300-500": 1,
    "good:500-plus": 1,
    "fair:50-150": 1,
    "fair:150-300": 1,
    "fair:300-500": 1,
    "fair:500-plus": 1,
  },
  Bankrate: {
    "excellent:50-150": 5,
    "excellent:150-300": 5,
    "excellent:300-500": 5,
    "excellent:500-plus": 5,
    "good:50-150": 13,
    "good:150-300": 13,
    "good:300-500": 13,
    "good:500-plus": 13,
    "fair:50-150": 13,
    "fair:150-300": 13,
    "fair:300-500": 13,
    "fair:500-plus": 13,
  },
};

export const DEFAULT_REFI_RANKINGS: RankingConfig["lenders"] = {
  "Quicken Loans": {
    "excellent:50-150": 5,
    "excellent:150-300": 5,
    "excellent:300-500": 5,
    "excellent:500-plus": 5,
    "good:50-150": 5,
    "good:150-300": 5,
    "good:300-500": 5,
    "good:500-plus": 5,
    "fair:50-150": 5,
    "fair:150-300": 5,
    "fair:300-500": 5,
    "fair:500-plus": 5,
  },
  LoanDepot: {
    "excellent:50-150": 4,
    "excellent:150-300": 4,
    "excellent:300-500": 4,
    "excellent:500-plus": 4,
    "good:50-150": 4,
    "good:150-300": 4,
    "good:300-500": 4,
    "good:500-plus": 4,
    "fair:50-150": 4,
    "fair:150-300": 4,
    "fair:300-500": 4,
    "fair:500-plus": 4,
  },
  Bankrate: {
    "excellent:50-150": 6,
    "excellent:150-300": 6,
    "excellent:300-500": 6,
    "excellent:500-plus": 6,
    "good:50-150": 6,
    "good:150-300": 6,
    "good:300-500": 6,
    "good:500-plus": 6,
    "fair:50-150": 6,
    "fair:150-300": 6,
    "fair:300-500": 6,
    "fair:500-plus": 6,
  },
};

export const DEFAULT_PURCHASE_RANKINGS: RankingConfig["lenders"] = {
  "Veterans United Home Loans": {
    "excellent:50-150": 7,
    "excellent:150-300": 7,
    "excellent:300-500": 7,
    "excellent:500-plus": 7,
    "good:50-150": 7,
    "good:150-300": 7,
    "good:300-500": 7,
    "good:500-plus": 7,
    "fair:50-150": 7,
    "fair:150-300": 7,
    "fair:300-500": 7,
    "fair:500-plus": 7,
  },
  "Quicken Loans": {
    "excellent:50-150": 9,
    "excellent:150-300": 9,
    "excellent:300-500": 9,
    "excellent:500-plus": 9,
    "good:50-150": 9,
    "good:150-300": 9,
    "good:300-500": 9,
    "good:500-plus": 9,
    "fair:50-150": 9,
    "fair:150-300": 9,
    "fair:300-500": 9,
    "fair:500-plus": 9,
  },
  Bankrate: {
    "excellent:50-150": 6,
    "excellent:150-300": 6,
    "excellent:300-500": 6,
    "excellent:500-plus": 6,
    "good:50-150": 6,
    "good:150-300": 6,
    "good:300-500": 6,
    "good:500-plus": 6,
    "fair:50-150": 6,
    "fair:150-300": 6,
    "fair:300-500": 6,
    "fair:500-plus": 6,
  },
  AmeriSave: {
    "excellent:50-150": 5,
    "excellent:150-300": 5,
    "excellent:300-500": 5,
    "excellent:500-plus": 5,
    "good:50-150": 5,
    "good:150-300": 5,
    "good:300-500": 5,
    "good:500-plus": 5,
    "fair:50-150": 5,
    "fair:150-300": 5,
    "fair:300-500": 5,
    "fair:500-plus": 5,
  },
  Achieve: {
    "excellent:50-150": 13,
    "excellent:150-300": 13,
    "excellent:300-500": 13,
    "excellent:500-plus": 13,
    "good:50-150": 13,
    "good:150-300": 13,
    "good:300-500": 13,
    "good:500-plus": 13,
    "fair:50-150": 13,
    "fair:150-300": 13,
    "fair:300-500": 13,
    "fair:500-plus": 13,
  },
};

export function getDefaultMortgageRankings(adwallType: string): RankingConfig | null {
  const lenders =
    adwallType === "heloc"
      ? DEFAULT_HELOC_RANKINGS
      : adwallType === "refi"
        ? DEFAULT_REFI_RANKINGS
        : adwallType === "purchase"
          ? DEFAULT_PURCHASE_RANKINGS
          : null;

  if (!lenders) return null;

  return {
    dimensions: MORTGAGE_RANKING_DIMENSIONS,
    lenders,
  };
}
