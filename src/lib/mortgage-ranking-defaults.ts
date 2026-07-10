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
      { id: "excellent", label: "Excellent (720+)", matchValues: ["excellent"] },
      { id: "good", label: "Good (680-719)", matchValues: ["good"] },
      { id: "fair", label: "Fair (620-679)", matchValues: ["fair"] },
      { id: "poor", label: "Poor (580-619)", matchValues: ["poor"] },
      { id: "bad", label: "Bad (Below 580)", matchValues: ["bad", "below-580"] },
    ],
  },
  {
    id: "loanAmount",
    label: "Loan Amount",
    fieldId: "loanAmount",
    valueType: "direct",
    buckets: [
      { id: "upto-150", label: "Upto $150k", matchValues: ["upto-150", "50-150"] },
      { id: "100-250", label: "$100k-$250k", matchValues: ["100-250", "150-300"] },
      { id: "250-400", label: "$250k-$400k", matchValues: ["250-400", "300-500"] },
      { id: "400-plus", label: "$400k and up", matchValues: ["400-plus", "500-plus"] },
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

export function withMortgageCreditRankings(lenders: RankingConfig["lenders"]): RankingConfig["lenders"] {
  const nextLenders: RankingConfig["lenders"] = {};

  for (const [lenderName, rankings] of Object.entries(lenders)) {
    const nextRankings = { ...rankings };
    const hasLegacyPoorRankings = Object.keys(rankings).some((comboKey) => comboKey.startsWith("poor:"));

    for (const [comboKey, rank] of Object.entries(rankings)) {
      if (comboKey.startsWith("fair:")) {
        const poorComboKey = comboKey.replace(/^fair:/, "poor:");
        const badComboKey = comboKey.replace(/^fair:/, "bad:");
        nextRankings[poorComboKey] = rank;
        if (!hasLegacyPoorRankings) {
          nextRankings[badComboKey] ??= rank;
        }
      }

      if (comboKey.startsWith("poor:")) {
        const badComboKey = comboKey.replace(/^poor:/, "bad:");
        nextRankings[badComboKey] ??= rank;
      }
    }

    nextLenders[lenderName] = nextRankings;
  }

  return nextLenders;
}

function getUpdatedMortgageAmountComboKey(comboKey: string): string | null {
  const parts = comboKey.split(":");
  const amountIndex = 1;
  const legacyAmountBucket = parts[amountIndex];

  if (legacyAmountBucket === "50-150") parts[amountIndex] = "upto-150";
  else if (legacyAmountBucket === "150-300") parts[amountIndex] = "100-250";
  else if (legacyAmountBucket === "300-500") parts[amountIndex] = "250-400";
  else if (legacyAmountBucket === "500-plus") parts[amountIndex] = "400-plus";
  else return null;

  return parts.join(":");
}

export function withMortgageLoanAmountRankings(lenders: RankingConfig["lenders"]): RankingConfig["lenders"] {
  const nextLenders: RankingConfig["lenders"] = {};

  for (const [lenderName, rankings] of Object.entries(lenders)) {
    const nextRankings = { ...rankings };

    for (const [comboKey, rank] of Object.entries(rankings)) {
      const updatedComboKey = getUpdatedMortgageAmountComboKey(comboKey);
      if (updatedComboKey) {
        nextRankings[updatedComboKey] ??= rank;
      }
    }

    nextLenders[lenderName] = nextRankings;
  }

  return nextLenders;
}

export function ensureMortgagePoorCreditBucket(config: RankingConfig): RankingConfig {
  const dimensions = config.dimensions.map((dimension) => {
    if (dimension.id === "loanAmount") {
      return {
        ...dimension,
        buckets: MORTGAGE_RANKING_DIMENSIONS[1]!.buckets,
      };
    }

    if (dimension.id !== "creditScore") return dimension;

    return {
      ...dimension,
      buckets: MORTGAGE_RANKING_DIMENSIONS[0]!.buckets,
    };
  });

  return {
    ...config,
    dimensions,
    lenders: withMortgageLoanAmountRankings(withMortgageCreditRankings(config.lenders)),
  };
}

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

  return ensureMortgagePoorCreditBucket({
    dimensions: MORTGAGE_RANKING_DIMENSIONS,
    lenders,
  });
}
