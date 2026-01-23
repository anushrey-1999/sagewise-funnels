export function isAbsoluteUrl(url: string): boolean {
  return /^https?:\/\//i.test(url);
}

/**
 * Append query params to either an absolute URL (https://...) or a relative path (/adwall/..).
 * Preserves existing query params.
 */
export function appendQueryParams(baseUrl: string, params: Record<string, string | undefined | null>): string {
  const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== null && String(v).length > 0) as Array<[string, string]>;
  if (entries.length === 0) return baseUrl;

  // Absolute URL: use URL() for correctness
  if (isAbsoluteUrl(baseUrl)) {
    const url = new URL(baseUrl);
    for (const [k, v] of entries) url.searchParams.set(k, v);
    return url.toString();
  }

  // Relative URL: merge query string manually (URL() needs a base)
  const [path, existingQuery = ""] = baseUrl.split("?");
  const sp = new URLSearchParams(existingQuery);
  for (const [k, v] of entries) sp.set(k, v);
  const qs = sp.toString();
  return qs ? `${path}?${qs}` : path;
}

