type ParsedScriptTag = {
  src?: string;
  type?: string;
  text?: string;
  attrs: Record<string, string>;
};

const externalScriptPromises = new Map<string, Promise<void>>();

function parseScriptTags(html: string): ParsedScriptTag[] {
  if (typeof window === "undefined") return [];
  const doc = new DOMParser().parseFromString(html, "text/html");
  const scripts = Array.from(doc.querySelectorAll("script"));

  return scripts.map((s) => {
    const attrs: Record<string, string> = {};
    for (const attr of Array.from(s.attributes)) {
      attrs[attr.name] = attr.value;
    }

    const src = s.getAttribute("src") || undefined;
    const type = s.getAttribute("type") || undefined;
    const text = s.textContent || undefined;

    return { src, type, text, attrs };
  });
}

function loadExternalScriptOnce(src: string, attrs: Record<string, string>): Promise<void> {
  const existingPromise = externalScriptPromises.get(src);
  if (existingPromise) return existingPromise;

  // If a script with the same src already exists, attach listeners to it.
  const existingEl = document.querySelector(`script[src="${src}"]`) as HTMLScriptElement | null;
  const scriptEl = existingEl ?? document.createElement("script");

  // Apply attributes (kept as provided); if an attribute already exists, leave it alone.
  for (const [name, value] of Object.entries(attrs)) {
    if (!scriptEl.hasAttribute(name)) {
      scriptEl.setAttribute(name, value);
    }
  }
  if (!scriptEl.src) {
    scriptEl.src = src;
  }

  const promise = new Promise<void>((resolve, reject) => {
    // If we've already marked it loaded, resolve immediately.
    if (scriptEl.dataset.loaded === "true") {
      resolve();
      return;
    }

    const onLoad = () => {
      scriptEl.dataset.loaded = "true";
      resolve();
    };
    const onError = () => reject(new Error(`Failed to load external script: ${src}`));

    scriptEl.addEventListener("load", onLoad, { once: true });
    scriptEl.addEventListener("error", onError, { once: true });
  });

  externalScriptPromises.set(src, promise);

  if (!existingEl) {
    // Use <head> for external libraries.
    document.head.appendChild(scriptEl);
  }

  return promise;
}

function appendInlineScript(type: string | undefined, text: string | undefined) {
  const scriptEl = document.createElement("script");
  if (type) scriptEl.type = type;
  if (text) scriptEl.textContent = text;
  // Inline scripts typically run fine from <body>.
  document.body.appendChild(scriptEl);
}

function snippetNeedsEverflowReady(tags: ParsedScriptTag[]): boolean {
  return tags.some((t) => !t.src && !!t.text && /EF\.impression\s*\(/.test(t.text));
}

async function waitForEverflowImpressionReady(timeoutMs = 5000): Promise<void> {
  const start = Date.now();
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const EF = (window as any).EF;
    if (EF && typeof EF.impression === "function") return;
    if (Date.now() - start > timeoutMs) return;
    await new Promise((r) => setTimeout(r, 50));
  }
}

/**
 * Inject a raw snippet containing one or more <script> tags.
 * - External scripts (src=) are loaded (and deduped) before inline scripts.
 * - Keeps the provided tag contents/attributes intact.
 */
export async function injectImpressionScript(snippet: string): Promise<void> {
  if (typeof window === "undefined") return;
  const tags = parseScriptTags(snippet);
  if (tags.length === 0) return;

  // 1) Load all external scripts in order (most snippets rely on that order).
  for (const tag of tags) {
    if (tag.src) {
      await loadExternalScriptOnce(tag.src, tag.attrs);
    }
  }

  // Some vendors (e.g., Everflow) attach globals shortly after the script load event.
  if (snippetNeedsEverflowReady(tags)) {
    await waitForEverflowImpressionReady();
  }

  // 2) Execute inline scripts after externals are ready.
  for (const tag of tags) {
    if (!tag.src) {
      appendInlineScript(tag.type, tag.text);
    }
  }
}

