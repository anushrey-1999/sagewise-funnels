import "server-only";

const SCRIPT_KEYS = new Set(["impressionScript", "onLoadScript", "onSubmitScript"]);

export function containsScriptFields(value: unknown): boolean {
  const seen = new Set<unknown>();

  const walk = (v: unknown): boolean => {
    if (v === null || v === undefined) return false;
    if (typeof v !== "object") return false;
    if (seen.has(v)) return false;
    seen.add(v);

    if (Array.isArray(v)) {
      for (const item of v) {
        if (walk(item)) return true;
      }
      return false;
    }

    const obj = v as Record<string, unknown>;
    for (const [k, child] of Object.entries(obj)) {
      if (SCRIPT_KEYS.has(k)) {
        if (typeof child === "string" && child.trim().length > 0) return true;
      }
      if (walk(child)) return true;
    }
    return false;
  };

  return walk(value);
}

/**
 * For roles that shouldn't edit script fields, keep script fields exactly as in `existing`
 * while allowing other edits to flow through.
 */
export function preserveScriptFields(existing: unknown, next: unknown): unknown {
  const seen = new Map<unknown, unknown>();

  const walk = (a: unknown, b: unknown): unknown => {
    if (b === null || b === undefined) return b;
    if (typeof b !== "object") return b;

    if (seen.has(b)) return seen.get(b);

    if (Array.isArray(b)) {
      const out: unknown[] = [];
      seen.set(b, out);
      const aArr = Array.isArray(a) ? a : [];
      for (let i = 0; i < b.length; i++) {
        out[i] = walk(aArr[i], b[i]);
      }
      return out;
    }

    const out: Record<string, unknown> = {};
    seen.set(b, out);
    const aObj = a && typeof a === "object" && !Array.isArray(a) ? (a as Record<string, unknown>) : {};
    const bObj = b as Record<string, unknown>;

    for (const [k, v] of Object.entries(bObj)) {
      if (SCRIPT_KEYS.has(k)) {
        out[k] = aObj[k];
        continue;
      }
      out[k] = walk(aObj[k], v);
    }
    return out;
  };

  return walk(existing, next);
}

