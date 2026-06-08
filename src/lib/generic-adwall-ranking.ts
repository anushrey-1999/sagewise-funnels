/**
 * Generic adwall ranking system
 * Works with any funnel by reading dimension configurations
 */

import type { AdwallCard, AdwallConfig, RankingCell, RankingConfig, RankingDimension } from "@/types/adwall";
import type { FormData } from "@/types/form";

interface RankingMatrixEntry {
  rank: number;
  isHidden: boolean;
}

function getRankingCellRank(cell: RankingCell | undefined): number | undefined {
  if (typeof cell === "number") return cell;
  return cell?.rank;
}

function isRankingCellHidden(cell: RankingCell | undefined): boolean {
  return typeof cell === "object" && cell !== null && cell.isHidden === true;
}

/**
 * Extract a field value from form data
 */
function getFormValue(data: FormData, fieldId: string): string | number | boolean | string[] | undefined {
  for (const stepData of Object.values(data)) {
    if (stepData && fieldId in stepData) {
      return stepData[fieldId];
    }
  }
  return undefined;
}

/**
 * Convert value to number
 */
function toNumber(value: string | number | boolean | string[] | undefined): number | null {
  if (typeof value === "number") return Number.isNaN(value) ? null : value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
  }
  return null;
}

/**
 * Calculate mortgage loan amount based on form data and adwall type
 */
function calculateMortgageAmount(data: FormData, adwallType: string): number | null {
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

/**
 * Resolve dimension value from form data
 */
function resolveDimensionValue(
  dimension: RankingDimension,
  formData: FormData,
  adwallType: string
): string | number | null {
  if (dimension.valueType === "calculated" && dimension.calculation) {
    if (dimension.calculation.type === "mortgage-amount") {
      return calculateMortgageAmount(formData, adwallType);
    }
    return null;
  }

  // Direct value from form field (use fieldId if specified, otherwise fall back to dimension.id)
  const fieldId = dimension.fieldId || dimension.id;
  const rawValue = getFormValue(formData, fieldId);
  if (rawValue === undefined) return null;

  return typeof rawValue === "string" || typeof rawValue === "number" ? rawValue : null;
}

/**
 * Map a dimension value to its bucket ID
 */
function mapValueToBucket(value: string | number | null, dimension: RankingDimension): string | null {
  if (value === null) return null;

  // For string values, check matchValues
  if (typeof value === "string") {
    for (const bucket of dimension.buckets) {
      if (bucket.matchValues && bucket.matchValues.includes(value)) {
        return bucket.id;
      }
      if (bucket.id === value) {
        return bucket.id;
      }
    }
    return null;
  }

  // For numeric values, check bucket ranges
  if (typeof value === "number") {
    for (const bucket of dimension.buckets) {
      // Option 1: Use explicit min/max if defined
      if (bucket.min !== undefined) {
        const min = bucket.min;
        const max = bucket.max;
        
        if (max !== undefined) {
          // Range with upper bound
          if (value >= min && value < max) {
            return bucket.id;
          }
        } else {
          // Open-ended range (e.g., "500-plus")
          if (value >= min) {
            return bucket.id;
          }
        }
        continue;
      }

      // Option 2: Fall back to parsing bucket ID format like "50-150"
      const match = bucket.id.match(/^(\d+)-(\d+)$/);
      if (match) {
        const min = parseInt(match[1]!, 10) * 1000;
        const max = parseInt(match[2]!, 10) * 1000;
        if (value >= min && value < max) {
          return bucket.id;
        }
      }
      
      // Handle "500-plus" format
      if (bucket.id.match(/^(\d+)-plus$/)) {
        const minMatch = bucket.id.match(/^(\d+)-plus$/);
        const min = parseInt(minMatch![1]!, 10) * 1000;
        if (value >= min) {
          return bucket.id;
        }
      }
    }
  }

  return null;
}

function mapRankingParamToBucket(value: string, dimension: RankingDimension): string | null {
  const directMatch = mapValueToBucket(value, dimension);
  if (directMatch) return directMatch;

  const numericValue = toNumber(value);
  return mapValueToBucket(numericValue, dimension);
}

/**
 * Build ranking parameters from form data based on adwall config
 */
export function buildRankingParams(
  formData: FormData,
  config: AdwallConfig
): Record<string, string> | null {
  if (!config.rankingConfig || !config.rankingConfig.dimensions) {
    return null;
  }

  const params: Record<string, string> = {};

  for (const dimension of config.rankingConfig.dimensions) {
    const value = resolveDimensionValue(dimension, formData, config.adwallType);
    const bucketId = mapValueToBucket(value, dimension);

    if (!bucketId) {
      // If any dimension fails to resolve, ranking cannot be applied
      return null;
    }

    params[`rank${dimension.id.charAt(0).toUpperCase()}${dimension.id.slice(1)}`] = bucketId;
  }

  return params;
}

/**
 * Normalize lender name for matching
 */
function normalizeLenderKey(rawName: string): string {
  const normalizedName = rawName.trim().toLowerCase();

  // Common name mappings
  if (normalizedName === "quicken loans") return "quicken";
  if (normalizedName === "figure") return "figure.com";
  if (normalizedName === "loandepot" || normalizedName === "loan depot") return "loandepot";
  if (normalizedName === "veterans united home loans") return "veterans united";

  return normalizedName;
}

function normalizeLenderName(card: Pick<AdwallCard, "advertiserName" | "heading">): string {
  return normalizeLenderKey(card.advertiserName || card.heading);
}

/**
 * Get ranking matrix from config based on dimension bucket values
 */
function getRankingMatrix(
  rankingConfig: RankingConfig,
  dimensionValues: Record<string, string>
): Record<string, RankingMatrixEntry> | null {
  // Build combination key from dimension bucket IDs
  const getComboKey = (values: Record<string, string>) =>
    rankingConfig.dimensions
    .map((dim) => values[dim.id])
    .filter(Boolean)
    .join(":");

  const buildMatrix = (comboKey: string) => {
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
  };

  const comboKey = getComboKey(dimensionValues);
  if (!comboKey) return null;

  const matrix = buildMatrix(comboKey);
  if (matrix) return matrix;

  if (dimensionValues.creditScore === "poor") {
    return buildMatrix(getComboKey({ ...dimensionValues, creditScore: "fair" }));
  }

  return null;
}

/**
 * Sort adwall cards based on ranking configuration
 */
export function sortAdwallCards<T extends AdwallCard>(
  cards: T[],
  config: AdwallConfig | null | undefined,
  rankingParams: Record<string, string> | null
): T[] {
  if (!config?.rankingConfig || !rankingParams) {
    return cards;
  }

  // Extract dimension values from ranking params
  const dimensionValues: Record<string, string> = {};
  for (const dimension of config.rankingConfig.dimensions) {
    const paramKey = `rank${dimension.id.charAt(0).toUpperCase()}${dimension.id.slice(1)}`;
    const value = rankingParams[paramKey];
    if (value) {
      const bucketId = mapRankingParamToBucket(value, dimension);
      if (bucketId) {
        dimensionValues[dimension.id] = bucketId;
      }
    }
  }

  const matrix = getRankingMatrix(config.rankingConfig, dimensionValues);
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
