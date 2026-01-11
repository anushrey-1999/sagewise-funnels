import { AdwallConfig } from "@/types/adwall";

// Import adwall configs
// To add a new adwall:
// 1. Create a JSON file in ./adwall-configs/ with format: {funnelId}-{adwallType}.json
//    Note: Most funnels will only have one adwall (type: "one")
//    Only specific funnels may have multiple adwalls (e.g., cc-one has one, two, three)
// 2. Import it above
// 3. Add it to the adwallConfigs object below
import ccAdwallOne from "./adwall-configs/cc-one.json";
import ccAdwallTwo from "./adwall-configs/cc-two.json";
import ccAdwallThree from "./adwall-configs/cc-three.json";
import autoinsAdwallOne from "./adwall-configs/autoins-one.json";
import autoinsAdwallTwo from "./adwall-configs/autoins-two.json";
import autoinsAdwallThree from "./adwall-configs/autoins-three.json";

// Map of [funnelId]-[adwallType] to their configs
// Format: "funnelId-adwallType" -> config
// Example: "mortgage-one", "dental-one", "cc-one-one", "cc-one-two", "cc-one-three"
// Most funnels will only have "funnelId-one", but some may have multiple types
const adwallConfigs: Record<string, AdwallConfig> = {
  "cc-one": ccAdwallOne as AdwallConfig,
  "cc-two": ccAdwallTwo as AdwallConfig,
  "cc-three": ccAdwallThree as AdwallConfig,
  "autoins-one": autoinsAdwallOne as AdwallConfig,
  "autoins-two": autoinsAdwallTwo as AdwallConfig,
  "autoins-three": autoinsAdwallThree as AdwallConfig,
  // Add more adwall configs here as they are created
  // Format: "routePrefix-adwallType": config
  // Example: "mortgage-one": mortgageAdwallOne as AdwallConfig,
};

/**
 * Get the config key for a given route prefix
 * For credit card routes, "cc" + "one" = "cc-one" (matches file naming)
 * For other routes, routePrefix + adwallType = config key
 * @param routePrefix - The route prefix (e.g., "cc", "mortgage")
 * @returns The config key to use for looking up adwalls (same as routePrefix)
 */
function getConfigKeyForRoute(routePrefix: string): string {
  return routePrefix;
}

/**
 * Get adwall configuration for a specific route prefix and adwall type
 * Route structure: /adwall/{routePrefix}/{adwallType}
 * Config key: {routePrefix}-{adwallType}
 * Example: /adwall/cc/one -> config key "cc-one"
 * @param routePrefix - The route prefix (e.g., "cc", "mortgage")
 * @param adwallType - The type of adwall (e.g., "one", "two", "three")
 * @returns AdwallConfig or null if not found
 */
export function getAdwallConfig(routePrefix: string, adwallType: string): AdwallConfig | null {
  const configKey = getConfigKeyForRoute(routePrefix);
  const key = `${configKey}-${adwallType}`;
  return adwallConfigs[key] || null;
}

/**
 * Get all available adwall keys
 */
export function getAvailableAdwalls(): string[] {
  return Object.keys(adwallConfigs);
}

/**
 * Check if an adwall exists for a given route prefix
 * @param routePrefix - The route prefix (e.g., "cc", "mortgage")
 * @param adwallType - The type of adwall (e.g., "one", "two", "three")
 * @returns true if the adwall exists
 */
export function adwallExists(routePrefix: string, adwallType: string): boolean {
  const configKey = getConfigKeyForRoute(routePrefix);
  const key = `${configKey}-${adwallType}`;
  return key in adwallConfigs;
}
