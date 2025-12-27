import type { Layer2Encrypted } from "./l2crypto";

function parseHtml(html: string): Document | null {
  if (typeof DOMParser !== "undefined") {
    return new DOMParser().parseFromString(html, "text/html");
  }
  if (typeof document !== "undefined") {
    const doc = document.implementation.createHTMLDocument("");
    doc.documentElement.innerHTML = html;
    return doc;
  }
  return null;
}

function extractScriptById(html: string, id: string): string | null {
  const doc = parseHtml(html);
  if (doc) {
    const script = doc.getElementById(id);
    return script?.textContent ?? null;
  }
  const re = new RegExp(`<script[^>]*id=[\"']${id}[\"'][^>]*>([\\s\\S]*?)<\\/script>`, "i");
  const match = html.match(re);
  return match ? match[1] : null;
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function extractScriptByType(html: string, type: string): string | null {
  const doc = parseHtml(html);
  if (doc) {
    const script = doc.querySelector(`script[type="${type}"]`);
    return script?.textContent ?? null;
  }
  const re = new RegExp(
    `<script[^>]*type=[\"']${escapeRegex(type)}[\"'][^>]*>([\\s\\S]*?)<\\/script>`,
    "i",
  );
  const match = html.match(re);
  return match ? match[1] : null;
}

export function extractJsonLdFromHtml(html: string): any | null {
  const dataLayer = extractScriptById(html, "data-layer");
  if (dataLayer) {
    try {
      return JSON.parse(dataLayer);
    } catch {
      return null;
    }
  }
  const ldScript = extractScriptByType(html, "application/ld+json");
  if (ldScript) {
    try {
      return JSON.parse(ldScript);
    } catch {
      return null;
    }
  }
  return null;
}

export function extractL2EnvelopeFromHtml(html: string): Layer2Encrypted | null {
  const script = extractScriptById(html, "weba-l2-envelope");
  if (!script) return null;
  try {
    return JSON.parse(script) as Layer2Encrypted;
  } catch {
    return null;
  }
}
