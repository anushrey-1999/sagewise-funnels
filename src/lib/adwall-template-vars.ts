/**
 * Template macros available in adwall copy.
 *
 * Tokens are matched case-insensitively at render time, so `{MONTH}`, `{month}`
 * and `{Month}` all resolve. Date tokens read from the request-time date supplied
 * by the adwall route, so titles like "Best HELOC Lenders {MONTH} {YEAR}" roll
 * over on their own.
 */

export interface AdwallTemplateVarInput {
  name?: string | null;
  zip?: string | null;
  city?: string | null;
  now?: Date;
}

export type AdwallTemplateVars = Record<string, string>;

export interface AdwallMacro {
  /** Token as authors type it, e.g. "{MONTH}" */
  token: string;
  label: string;
}

/** Drives the macro reference shown in the adwall editor, so help text cannot drift. */
export const ADWALL_MACROS: AdwallMacro[] = [
  { token: "{NAME}", label: "First name from the funnel" },
  { token: "{ZIP}", label: "ZIP code from the funnel" },
  { token: "{CITY}", label: "City resolved from the ZIP" },
  { token: "{MONTH}", label: "Current month, e.g. September" },
  { token: "{MONTH_SHORT}", label: "Current month abbreviated, e.g. Sep" },
  { token: "{YEAR}", label: "Current year, e.g. 2026" },
  { token: "{DAY}", label: "Current day of the month, e.g. 4" },
  { token: "{DATE}", label: "Current full date, e.g. September 4, 2026" },
];

const LOCATION_FALLBACK = "your city";

function formatDatePart(date: Date, options: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat("en-US", options).format(date);
}

export function buildAdwallTemplateVars({
  name,
  zip,
  city,
  now = new Date(),
}: AdwallTemplateVarInput): AdwallTemplateVars {
  const month = formatDatePart(now, { month: "long" });
  const monthShort = formatDatePart(now, { month: "short" });
  const day = formatDatePart(now, { day: "numeric" });
  const year = String(now.getFullYear());

  return {
    NAME: name || "",
    ZIP: zip || LOCATION_FALLBACK,
    CITY: city || LOCATION_FALLBACK,
    MONTH: month,
    MONTH_SHORT: monthShort,
    YEAR: year,
    DAY: day,
    DATE: `${month} ${day}, ${year}`,
  };
}

/**
 * Longest token first so `{MONTH_SHORT}` is not partially eaten by `{MONTH}`.
 */
function buildTokenPattern(vars: AdwallTemplateVars): RegExp {
  const tokens = Object.keys(vars)
    .sort((a, b) => b.length - a.length)
    .map((key) => key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));

  return new RegExp(`\\{(${tokens.join("|")})\\}`, "gi");
}

export function interpolateTemplate(
  template: string,
  vars: AdwallTemplateVars
): string {
  if (!template) return template;

  return template.replace(buildTokenPattern(vars), (match, token: string) => {
    const value = vars[token.toUpperCase()];
    return value ?? match;
  });
}
