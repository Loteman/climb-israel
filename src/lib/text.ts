/**
 * Turn arbitrary prose (often a multi-paragraph location description) into
 * a meta-description-sized snippet: whitespace collapsed, markdown emphasis
 * stripped, and cut at a word boundary. Search engines truncate around
 * ~160 characters anyway; doing it ourselves keeps the cut clean.
 */
export function toMetaDescription(text: string, maxLength = 160): string {
  const flat = flattenMarkdown(text);
  if (flat.length <= maxLength) return flat;
  const cut = flat.slice(0, maxLength - 1);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > maxLength * 0.6 ? cut.slice(0, lastSpace) : cut).replace(/[\s,.;:–-]+$/, "")}…`;
}

/** Markdown to one line of plain text: links keep their text, list and heading marks go. */
function flattenMarkdown(text: string): string {
  return text
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/^\s*(?:[-*+]|\d+\.)\s+/gm, "")
    .replace(/[*_`#>]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * A meta description of a useful length. Many entries have a one-line
 * summary (under ~100 characters) - too short for a search snippet, so
 * Google tends to replace it with a random excerpt. Short summaries are
 * extended with the page's own text (its markdown body, or extra facts),
 * skipping a body that just repeats the summary, then cut to ~160.
 */
export function extendedDescription(summary: string, ...more: (string | undefined)[]): string {
  const base = flattenMarkdown(summary);
  if (base.length >= 120) return toMetaDescription(base);
  let rest = flattenMarkdown(more.filter(Boolean).join(" "));
  if (rest.startsWith(base)) rest = rest.slice(base.length).trim();
  return toMetaDescription(rest ? `${base} ${rest}` : base);
}

const TITLE_MAX = 60;

/**
 * The page <title> at a length search results show in full (~60
 * characters). Prefers, in order: "title | site", the title alone, the
 * title without its parenthesised English name, then without any
 * parenthesised aside (each with the site name when that still fits).
 */
export function fitTitle(title: string, siteName: string): string {
  const withSite = (t: string) => (t === siteName ? t : `${t} | ${siteName}`);
  if (withSite(title).length <= TITLE_MAX) return withSite(title);
  if (title.length <= TITLE_MAX) return title;
  const hebrewOnly = title.replace(/\s*\([^)]*[A-Za-z][^)]*\)/g, "").trim();
  if (withSite(hebrewOnly).length <= TITLE_MAX) return withSite(hebrewOnly);
  if (hebrewOnly.length <= TITLE_MAX) return hebrewOnly;
  // Last resort: drop every parenthesised aside.
  const bare = title.replace(/\s*\([^)]*\)/g, "").trim();
  return withSite(bare).length <= TITLE_MAX ? withSite(bare) : bare;
}

let counter = 0;

/**
 * Build-time unique id for inline SVG <defs> (markers, patterns). Ids
 * must be unique per document, and the same icon component can render
 * dozens of times on one page.
 */
export function uniqueId(prefix: string): string {
  counter += 1;
  return `${prefix}-${counter}`;
}
