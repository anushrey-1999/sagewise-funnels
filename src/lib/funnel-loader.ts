import { FormConfig } from "@/types/form";

// Import funnel configs
import financeConfig from "./funnel-configs/finance.json";
import faConfig from "./funnel-configs/fa.json";
// Add more funnel configs as they are created
// import insuranceConfig from "./funnel-configs/insurance.json";

// Map of funnel IDs to their configs
const funnelConfigs: Record<string, FormConfig> = {
  "finance": financeConfig as FormConfig,
  "fa": faConfig as FormConfig,
  // Add more funnels here as they are created
  // "insurance": insuranceConfig as FormConfig,
};

/**
 * Get form configuration for a specific funnel
 * @param funnelId - The ID of the funnel (e.g., "finance", "insurance")
 * @returns FormConfig or null if funnel not found
 */
export function getFunnelConfig(funnelId: string | null): FormConfig | null {
  if (!funnelId) {
    // Default to walk-in-bathtubs if no funnel specified
    return funnelConfigs["fa"] || null;
  }

  return funnelConfigs[funnelId] || null;
}

/**
 * Get all available funnel IDs
 */
export function getAvailableFunnels(): string[] {
  return Object.keys(funnelConfigs);
}

/**
 * Check if a funnel exists
 */
export function funnelExists(funnelId: string): boolean {
  return funnelId in funnelConfigs;
}

