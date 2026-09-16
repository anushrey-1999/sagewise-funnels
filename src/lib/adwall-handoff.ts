export const ADWALL_HANDOFF_KEY = "sw-handoff";

/** Marks this navigation so the destination can run the incoming 8px settle. */
export function beginAdwallHandoff() {
  try {
    sessionStorage.setItem(ADWALL_HANDOFF_KEY, "1");
  } catch {
    // Ignore private-mode / blocked storage; the outgoing fade still runs.
  }
  document.documentElement.classList.add("sw-handoff");
}

/** Warm the adwall document while the interstitial plays. */
export function prefetchAdwallDocument(url: string) {
  if (typeof document === "undefined" || !url) return;
  if (document.querySelector(`link[data-sw-handoff-prefetch="1"]`)) return;

  const link = document.createElement("link");
  link.rel = "prefetch";
  link.setAttribute("as", "document");
  link.href = url;
  link.dataset.swHandoffPrefetch = "1";
  document.head.appendChild(link);
}
