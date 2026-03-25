import zipcodes from "zipcodes";

const US_ZIP_RE = /^\d{5}(?:-\d{4})?$/;

/**
 * Resolve a (US) ZIP code to a primary city name.
 *
 * - Only attempts lookup for US ZIP formats: 12345 or 12345-6789
 * - Returns null when unknown/invalid/non-US
 */
export function resolveCityFromZip(zipRaw: string | null | undefined): string | null {
  if (!zipRaw) return null;
  const zip = zipRaw.trim();
  if (!US_ZIP_RE.test(zip)) return null;

  const fiveDigitZip = zip.slice(0, 5);
  const result = zipcodes.lookup(fiveDigitZip) as { city?: string } | null;
  const city = result?.city?.trim();
  return city || null;
}

