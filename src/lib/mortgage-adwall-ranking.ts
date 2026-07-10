import type { AdwallCard, AdwallConfig, RankingCell, RankingConfig } from "@/types/adwall";
import type { FormData } from "@/types/form";

export type MortgageAdwallType = "heloc" | "refi" | "purchase";
export type MortgageCreditBucket = "excellent" | "good" | "fair" | "poor" | "bad";
export type MortgageAmountBucket = "upto-150" | "100-250" | "250-400" | "400-plus";

export interface MortgageRankingParams {
  rankCredit: MortgageCreditBucket;
  rankAmount: MortgageAmountBucket;
}

interface RankingMatrixEntry {
  rank: number;
  isHidden: boolean;
}

const amountBuckets: MortgageAmountBucket[] = ["upto-150", "100-250", "250-400", "400-plus"];

function getRankingCellRank(cell: RankingCell | undefined): number | undefined {
  if (typeof cell === "number") return cell;
  return cell?.rank;
}

function isRankingCellHidden(cell: RankingCell | undefined): boolean {
  return typeof cell === "object" && cell !== null && cell.isHidden === true;
}

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
  if (value === "excellent" || value === "good" || value === "fair" || value === "poor" || value === "bad") {
    return value;
  }
  if (value === "below-580") {
    return "bad";
  }
  return null;
}

export function getMortgageAmountBucket(amount: number | null | undefined): MortgageAmountBucket | null {
  if (typeof amount !== "number" || Number.isNaN(amount)) return null;
  if (amount < 250000) return amount <= 150000 ? "upto-150" : "100-250";
  return amount < 400000 ? "250-400" : "400-plus";
}

export function getMortgageAmountBucketFromString(value: string | null | undefined): MortgageAmountBucket | null {
  if (value === "upto-150" || value === "100-250" || value === "250-400" || value === "400-plus") {
    return value;
  }
  if (value === "50-150") return "upto-150";
  if (value === "150-300") return "100-250";
  if (value === "300-500") return "250-400";
  if (value === "500-plus") return "400-plus";
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
): Record<string, RankingMatrixEntry> | null {
  if (!config?.rankingConfig) return null;
  return getRankingMatrixFromConfig(config.rankingConfig, creditBucket, amountBucket);
}

function getRankingMatrixFromConfig(
  rankingConfig: RankingConfig,
  creditBucket: MortgageCreditBucket,
  amountBucket: MortgageAmountBucket
): Record<string, RankingMatrixEntry> | null {
  const creditDim = rankingConfig.dimensions.find((d) => d.id === "creditScore");
  const amountDim = rankingConfig.dimensions.find((d) => d.id === "loanAmount");

  if (!creditDim || !amountDim) return null;

  const creditBucketExists = creditDim.buckets.some((b) => b.id === creditBucket);
  const amountBucketExists = amountDim.buckets.some((b) => b.id === amountBucket);

  if (!creditBucketExists || !amountBucketExists) return null;

  const comboKey = `${creditBucket}:${amountBucket}`;
  const matrix: Record<string, RankingMatrixEntry> = {};

  for (const [lenderName, rankings] of Object.entries(rankingConfig.lenders)) {
    const cell = rankings[comboKey];
    const rank = getRankingCellRank(cell);
    if (rank !== undefined) {
      matrix[normalizeLenderKey(lenderName)] = {
        rank,
        isHidden: isRankingCellHidden(cell),
      };
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
    (creditBucket === "poor" ? getRankingMatrix(config, "fair", rankAmount) : null) ??
    (creditBucket === "bad" ? getRankingMatrix(config, "poor", rankAmount) : null);
  if (!matrix) return cards;

  return cards
    .filter((card) => !matrix[normalizeLenderName(card)]?.isHidden)
    .map((card, index) => ({
      card,
      index,
      rank: matrix[normalizeLenderName(card)]?.rank ?? Number.POSITIVE_INFINITY,
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
