import type { AdwallCard } from "@/types/adwall";

/**
 * Matrix lender rows and adwall cards are edited independently, so the same
 * lender is often spelled differently in each ("QuickenLoans" vs "Quicken
 * Loans"). Matching ignores case, spacing and punctuation, then folds known
 * brand variants onto one canonical key.
 */
const LENDER_ALIAS_GROUPS: readonly (readonly string[])[] = [
  ["quickenloans", "quicken"],
  ["figure", "figurecom"],
  ["loandepot"],
  ["veteransunited", "veteransunitedhomeloans"],
  ["amerisave", "amerisavemortgage"],
  ["better", "bettercom"],
];

const CANONICAL_KEY_BY_VARIANT = new Map<string, string>(
  LENDER_ALIAS_GROUPS.flatMap((group) => group.map((variant) => [variant, group[0]!] as const))
);

/**
 * Returns "" for names that carry no matchable characters, so blank cards and
 * blank lender rows never match each other.
 */
export function getLenderKey(rawName: string | null | undefined): string {
  const compactName = (rawName ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");
  if (!compactName) return "";

  return CANONICAL_KEY_BY_VARIANT.get(compactName) ?? compactName;
}

export function getCardLenderKey(card: Pick<AdwallCard, "advertiserName" | "heading">): string {
  return getLenderKey(card.advertiserName || card.heading);
}
