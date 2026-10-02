/**
 * Turn arbitrary prose (often a multi-paragraph location description) into
 * a meta-description-sized snippet: whitespace collapsed, markdown emphasis
 * stripped, and cut at a word boundary. Search engines truncate around
 * ~160 characters anyway; doing it ourselves keeps the cut clean.
 */
export function toMetaDescription(text: string, maxLength = 160): string {
  const flat = text.replace(/[*_`#>]/g, "").replace(/\s+/g, " ").trim();
  if (flat.length <= maxLength) return flat;
  const cut = flat.slice(0, maxLength - 1);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > maxLength * 0.6 ? cut.slice(0, lastSpace) : cut).replace(/[\s,.;:–-]+$/, "")}…`;
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
