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
      { id: "excellent", label: "Excellent (760+)", matchValues: ["excellent"] },
      { id: "good", label: "Good (700-759)", matchValues: ["good"] },
      { id: "fair", label: "Fair (640-699)", matchValues: ["fair"] },
      { id: "poor", label: "Poor (Below 640)", matchValues: ["poor", "bad", "below-580"] },
    ],
  },
  {
    id: "loanAmount",
    label: "Loan Amount",
    fieldId: "loanAmount",
    valueType: "direct",
    buckets: [
      { id: "50-150", label: "$50K–$150K", matchValues: ["50-150"] },
      { id: "150-300", label: "$150K–$300K", matchValues: ["150-300"] },
      { id: "300-500", label: "$300K–$500K", matchValues: ["300-500"] },
      { id: "500-plus", label: "$500K+", matchValues: ["500-plus"] },
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

export function withPoorCreditRankings(lenders: RankingConfig["lenders"]): RankingConfig["lenders"] {
  const nextLenders: RankingConfig["lenders"] = {};

  for (const [lenderName, rankings] of Object.entries(lenders)) {
    const nextRankings = { ...rankings };

    for (const [comboKey, rank] of Object.entries(rankings)) {
      if (comboKey.startsWith("fair:")) {
        const poorComboKey = comboKey.replace(/^fair:/, "poor:");
        nextRankings[poorComboKey] ??= rank;
      }
    }

    nextLenders[lenderName] = nextRankings;
  }

  return nextLenders;
}

export function ensureMortgagePoorCreditBucket(config: RankingConfig): RankingConfig {
  const dimensions = config.dimensions.map((dimension) => {
    if (dimension.id !== "creditScore") return dimension;

    const hasPoorBucket = dimension.buckets.some((bucket) => bucket.id === "poor");
    const buckets = dimension.buckets.map((bucket) => {
      if (bucket.id !== "fair") return bucket;
      return {
        ...bucket,
        matchValues: bucket.matchValues?.filter((value) => value !== "poor" && value !== "bad"),
      };
    });

    if (!hasPoorBucket) {
      const fairIndex = buckets.findIndex((bucket) => bucket.id === "fair");
      const poorBucket = { id: "poor", label: "Poor (<620)", matchValues: ["poor", "bad"] };

      if (fairIndex === -1) {
        buckets.push(poorBucket);
      } else {
        buckets.splice(fairIndex + 1, 0, poorBucket);
      }
    }

    return {
      ...dimension,
      buckets,
    };
  });

  return {
    ...config,
    dimensions,
    lenders: withPoorCreditRankings(config.lenders),
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
