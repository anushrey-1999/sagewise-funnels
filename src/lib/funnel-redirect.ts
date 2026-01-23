import { FormConfig, FormData, RedirectOnAnswer } from "@/types/form";
import { adwallExists } from "@/lib/adwall-loader";

function isAbsoluteUrl(path: string): boolean {
  return /^https?:\/\//i.test(path);
}

function normalizePath(path: string): string {
  if (!path) return "/";
  if (isAbsoluteUrl(path)) return path;
  return path.startsWith("/") ? path : `/${path}`;
}

function getSelectedValues(fieldType: string, value: unknown): string[] {
  if (value === undefined || value === null) return [];

  if (fieldType === "checkbox") {
    return Array.isArray(value) ? value.map(String) : [];
  }

  if (fieldType === "radio" || fieldType === "select") {
    return [String(value)];
  }

  return [];
}

function matchRedirect(redirectOnAnswer: RedirectOnAnswer, selectedValues: string[]): string | null {
  for (const rule of redirectOnAnswer.rules || []) {
    if (!rule?.to || !Array.isArray(rule.whenValues)) continue;

    const matches = rule.whenValues.some((candidate) => selectedValues.includes(candidate));
    if (matches) {
      return normalizePath(rule.to);
    }
  }

  if (redirectOnAnswer.defaultTo) {
    return normalizePath(redirectOnAnswer.defaultTo);
  }

  return null;
}

export function resolveRedirectOnAnswer(redirectOnAnswer: RedirectOnAnswer, fieldType: string, value: unknown, funnelId?: string): string | null {
  const selectedValues = getSelectedValues(fieldType, value);
  if (selectedValues.length === 0) return null;
  const matched = matchRedirect(redirectOnAnswer, selectedValues);
  if (!matched) return null;
  
  // Convert old-style routes to new format if funnelId is provided
  if (funnelId) {
    return convertToNewAdwallRoute(matched, funnelId);
  }
  
  return matched;
}

/**
 * Converts old-style adwall routes to new dynamic route format
 * Old: /creditcards-adwall-one -> New: /adwall/cc/one (for credit card funnels)
 * Old: /creditcards-adwall-two -> New: /adwall/cc/two
 * Old: /creditcards-adwall-three -> New: /adwall/cc/three
 * 
 * For credit card funnels (cc-one, cc-two, cc-three), routes use "cc" prefix:
 * - cc-one, cc-two, cc-three -> /adwall/cc/one, /adwall/cc/two, /adwall/cc/three
 * 
 * For other funnels, routes use the funnel ID:
 * - mortgage funnel -> /adwall/mortgage/one
 * - autoins funnel -> /adwall/autoins/one
 * 
 * Note: If the route is already in the new format (e.g., /adwall/cc/one),
 * it will be returned as-is. This allows funnels to specify their own adwall routes.
 * 
 * If the route doesn't match old format, returns as-is
 */
function convertToNewAdwallRoute(path: string, funnelId: string): string {
  if (isAbsoluteUrl(path)) return path;
  const normalizedPath = normalizePath(path);
  
  // If already in new format, return as-is
  if (normalizedPath.startsWith("/adwall/")) {
    return normalizedPath;
  }
  
  // Determine route prefix based on funnel type
  const routePrefix = getRoutePrefixForFunnel(funnelId);
  
  // Map old routes to new format
  const oldRouteMap: Record<string, string> = {
    "/creditcards-adwall-one": `/adwall/${routePrefix}/one`,
    "/creditcards-adwall-two": `/adwall/${routePrefix}/two`,
    "/creditcards-adwall-three": `/adwall/${routePrefix}/three`,
  };

  return oldRouteMap[normalizedPath] || normalizedPath;
}

/**
 * Maps funnel IDs to their route prefixes
 * Credit card funnels (cc-one, cc-two, cc-three) all use "cc" as the route prefix
 * Other funnels use their own ID as the prefix
 */
function getRoutePrefixForFunnel(funnelId: string): string {
  // Credit card funnels all use "cc" prefix
  if (funnelId.startsWith("cc-")) {
    return "cc";
  }
  // Other funnels use their own ID
  return funnelId;
}

/**
 * Gets the appropriate adwall route for a funnel
 * Credit card funnels (cc-one, cc-two, cc-three) use /adwall/cc/{type}
 * Other funnels use /adwall/{funnelId}/{type}
 * @param funnelId - The funnel ID
 * @param adwallType - The adwall type (default: "one")
 * @returns The adwall route path
 */
function getAdwallRoute(funnelId: string, adwallType: string = "one"): string {
  const routePrefix = getRoutePrefixForFunnel(funnelId);
  
  // Check if the adwall exists for this route prefix
  if (adwallExists(routePrefix, adwallType)) {
    return `/adwall/${routePrefix}/${adwallType}`;
  }
  
  // Fallback: still return the route (the page will handle 404 gracefully)
  return `/adwall/${routePrefix}/${adwallType}`;
}

/**
 * Computes where to send the user after submission.
 *
 * Priority:
 * 1) First matching `field.redirectOnAnswer.rules` in config order (steps then fields)
 * 2) `config.finalStep.redirectTo`
 * 3) Default: `/adwall/{funnelId}/one` (with fallback to shared adwalls if needed)
 * 
 * Note: Most funnels will only have one adwall (type: "one").
 * Only specific funnels like credit card funnels may have multiple adwalls (one, two, three)
 * based on user selections (e.g., credit score).
 * 
 * If a funnel doesn't have its own adwall, it will automatically fall back to a shared adwall
 * (e.g., cc-two and cc-three use cc-one adwalls).
 */
export function resolvePostSubmitRedirect(config: FormConfig, data: FormData): string {
  const funnelId = config.id || "cc-one";

  for (const step of config.steps) {
    const stepData = data[step.id];
    if (!stepData) continue;

    for (const field of step.fields) {
      if (!field.redirectOnAnswer) continue;

      const rawValue = stepData[field.id];
      const selectedValues = getSelectedValues(field.type, rawValue);
      if (selectedValues.length === 0) continue;

      const matched = matchRedirect(field.redirectOnAnswer, selectedValues);
      if (matched) {
        // Convert old-style routes to new format, or use the route as-is if already in new format
        const route = convertToNewAdwallRoute(matched, funnelId);
        
        // If route is in new format, extract funnel and type to check for fallback
        const routeMatch = route.match(/^\/adwall\/([^/]+)\/([^/]+)$/);
        if (routeMatch) {
          const [, targetFunnel, adwallType] = routeMatch;
          return getAdwallRoute(targetFunnel, adwallType);
        }
        
        return route;
      }
    }
  }

  if (config.finalStep?.redirectTo) {
    const redirectPath = normalizePath(config.finalStep.redirectTo);
    const route = convertToNewAdwallRoute(redirectPath, funnelId);
    
    // If route is in new format, extract funnel and type to check for fallback
    const routeMatch = route.match(/^\/adwall\/([^/]+)\/([^/]+)$/);
    if (routeMatch) {
      const [, targetFunnel, adwallType] = routeMatch;
      return getAdwallRoute(targetFunnel, adwallType);
    }
    
    return route;
  }

  // Default to "one" adwall for the funnel (with automatic fallback to shared adwalls)
  return getAdwallRoute(funnelId, "one");
}
