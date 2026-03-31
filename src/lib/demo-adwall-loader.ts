import { AdwallConfig } from "@/types/adwall";

import mortgageDemoAdwallHeloc from "./demo-adwall-configs/mortgage-heloc.json";
import mortgageDemoAdwallRefi from "./demo-adwall-configs/mortgage-refi.json";
import mortgageDemoAdwallPurchase from "./demo-adwall-configs/mortgage-purchase.json";

const demoAdwallConfigs: Record<string, AdwallConfig> = {
  "mortgage-heloc": mortgageDemoAdwallHeloc as AdwallConfig,
  "mortgage-refi": mortgageDemoAdwallRefi as AdwallConfig,
  "mortgage-purchase": mortgageDemoAdwallPurchase as AdwallConfig,
};

export function getDemoAdwallConfig(routePrefix: string, adwallType: string): AdwallConfig | null {
  const key = `${routePrefix}-${adwallType}`;
  return demoAdwallConfigs[key] || null;
}

export function demoAdwallExists(routePrefix: string, adwallType: string): boolean {
  const key = `${routePrefix}-${adwallType}`;
  return key in demoAdwallConfigs;
}

export function getAvailableDemoAdwalls(): { key: string; routePrefix: string; adwallType: string }[] {
  return Object.entries(demoAdwallConfigs).map(([key, config]) => {
    // Key format: "{routePrefix}-{adwallType}" e.g. "mortgage-heloc"
    // Split on first "-" won't work for multi-segment prefixes, so use adwallType from config
    return {
      key,
      routePrefix: config.funnelId,
      adwallType: config.adwallType,
    };
  });
}
