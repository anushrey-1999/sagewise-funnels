import type { AdwallCard, AdwallConfig, RankingConfig } from "@/types/adwall";
import type { FormData } from "@/types/form";

export type MortgageAdwallType = "heloc" | "refi" | "purchase";
export type MortgageCreditBucket = "excellent" | "good" | "fair" | "poor";
export type MortgageAmountBucket = "50-150" | "150-300" | "300-500" | "500-plus";

export interface MortgageRankingParams {
  rankCredit: MortgageCreditBucket;
  rankAmount: MortgageAmountBucket;
}

const amountBuckets: MortgageAmountBucket[] = ["50-150", "150-300", "300-500", "500-plus"];

function normalizeLenderKey(rawName: string): string {
  const normalizedName = rawName.trim().toLowerCase();

  if (normalizedName === "quicken loans") return "quicken";
  if (normalizedName === "figure") return "figure.com";
  if (normalizedName === "loandepot" || normalizedName === "loan depot") return "loandepot";
  if (normalizedName === "veterans united home loans") return "veterans united";

  return normalizedName;
}

function normalizeLenderName(card: Pick<AdwallCard, "advertiserName" | "heading">): string {
  return normalizeLenderKey(card.advertiserName || card.heading);
}

export function normalizeMortgageCreditBucket(value: string | null | undefined): MortgageCreditBucket | null {
  if (value === "excellent" || value === "good" || value === "fair" || value === "poor") {
    return value;
  }
  if (value === "bad" || value === "below-580") {
    return "poor";
  }
  return null;
}

export function getMortgageAmountBucket(amount: number | null | undefined): MortgageAmountBucket | null {
  if (typeof amount !== "number" || Number.isNaN(amount)) return null;
  if (amount < 300000) return amount < 150000 ? "50-150" : "150-300";
  return amount < 500000 ? "300-500" : "500-plus";
}

export function getMortgageAmountBucketFromString(value: string | null | undefined): MortgageAmountBucket | null {
  if (value === "50-150" || value === "150-300" || value === "300-500" || value === "500-plus") {
    return value;
  }
  return null;
}

function getFormValue(data: FormData, fieldId: string): string | number | boolean | string[] | undefined {
  for (const stepData of Object.values(data)) {
    if (stepData && fieldId in stepData) {
      return stepData[fieldId];
    }
  }
  return undefined;
}

function toNumber(value: string | number | boolean | string[] | undefined): number | null {
  if (typeof value === "number") return Number.isNaN(value) ? null : value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
  }
  return null;
}

export function getMortgageAdwallTypeFromPath(path: string): MortgageAdwallType | null {
  if (path === "/adwall/mortgage/heloc") return "heloc";
  if (path === "/adwall/mortgage/refi") return "refi";
  if (path === "/adwall/mortgage/purchase") return "purchase";
  return null;
}

function getDerivedMortgageAmount(data: FormData, adwallType: MortgageAdwallType): number | null {
  if (adwallType === "purchase") {
    const purchasePrice = toNumber(getFormValue(data, "purchasePrice"));
    if (purchasePrice === null) return null;

    const downPayment = toNumber(getFormValue(data, "downPayment"));
    if (downPayment === null) return purchasePrice;

    return Math.max(0, purchasePrice - purchasePrice * (downPayment / 100));
  }

  const homeValue = toNumber(getFormValue(data, "homeValue"));
  const mortgageBalance = toNumber(getFormValue(data, "mortgageBalance"));
  if (homeValue === null || mortgageBalance === null) return null;

  return Math.max(0, homeValue - mortgageBalance);
}


export function buildMortgageRankingParams(
  data: FormData,
  destinationPath: string
): MortgageRankingParams | null {
  const adwallType = getMortgageAdwallTypeFromPath(destinationPath);
  if (!adwallType) return null;

  const creditBucket = normalizeMortgageCreditBucket(String(getFormValue(data, "creditScore") ?? ""));

  // Prefer the new direct loanAmount string field; fall back to the legacy derived calculation
  const loanAmountStr = String(getFormValue(data, "loanAmount") ?? "");
  const amountBucket =
    getMortgageAmountBucketFromString(loanAmountStr) ??
    getMortgageAmountBucket(getDerivedMortgageAmount(data, adwallType));

  if (!creditBucket || !amountBucket) return null;

  return {
    rankCredit: creditBucket,
    rankAmount: amountBucket,
  };
}

function getRankingMatrix(
  config: AdwallConfig | null | undefined,
  creditBucket: MortgageCreditBucket,
  amountBucket: MortgageAmountBucket
): Record<string, number> | null {
  if (!config?.rankingConfig) return null;
  return getRankingMatrixFromConfig(config.rankingConfig, creditBucket, amountBucket);
}

function getRankingMatrixFromConfig(
  rankingConfig: RankingConfig,
  creditBucket: MortgageCreditBucket,
  amountBucket: MortgageAmountBucket
): Record<string, number> | null {
  const creditDim = rankingConfig.dimensions.find((d) => d.id === "creditScore");
  const amountDim = rankingConfig.dimensions.find((d) => d.id === "loanAmount");

  if (!creditDim || !amountDim) return null;

  const creditBucketExists = creditDim.buckets.some((b) => b.id === creditBucket);
  const amountBucketExists = amountDim.buckets.some((b) => b.id === amountBucket);

  if (!creditBucketExists || !amountBucketExists) return null;

  const comboKey = `${creditBucket}:${amountBucket}`;
  const matrix: Record<string, number> = {};

  for (const [lenderName, rankings] of Object.entries(rankingConfig.lenders)) {
    if (rankings[comboKey] !== undefined) {
      matrix[normalizeLenderKey(lenderName)] = rankings[comboKey];
    }
  }

  return Object.keys(matrix).length > 0 ? matrix : null;
}

export function sortMortgageAdwallCards<T extends AdwallCard>(
  cards: T[],
  adwallType: string,
  rankCredit: string | null | undefined,
  rankAmount: string | null | undefined,
  config?: AdwallConfig | null
): T[] {
  if (!isMortgageAmountBucket(rankAmount)) {
    return cards;
  }

  const creditBucket = normalizeMortgageCreditBucket(rankCredit);
  if (!creditBucket) return cards;

  const matrix =
    getRankingMatrix(config, creditBucket, rankAmount) ??
    (creditBucket === "poor" ? getRankingMatrix(config, "fair", rankAmount) : null);
  if (!matrix) return cards;

  return cards
    .map((card, index) => ({
      card,
      index,
      rank: matrix[normalizeLenderName(card)] ?? Number.POSITIVE_INFINITY,
    }))
    .sort((a, b) => {
      if (a.rank !== b.rank) return a.rank - b.rank;
      return a.index - b.index;
    })
    .map(({ card }) => card);
}

function isMortgageAmountBucket(value: string | null | undefined): value is MortgageAmountBucket {
  return typeof value === "string" && amountBuckets.includes(value as MortgageAmountBucket);
}
