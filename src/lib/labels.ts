// Single source of truth for every enum -> Hebrew label mapping used in
// the UI. These used to be copy-pasted into each page/component that
// needed them (the location labels alone lived in five places), which
// meant a rename had to be hunted down everywhere. Keys mirror the Zod
// enums in src/content.config.ts.

export const STYLE_LABELS: Record<string, string> = {
  bouldering: "בולדרינג",
  lead: "הובלה",
  "top-rope": "טופ-רופ",
  speed: "טיפוס מהירות",
  trad: "טראד",
  "multi-pitch": "מולטי-פיץ'",
  "via-ferrata": "ויה פראטה",
};

export const REGION_LABELS: Record<string, string> = {
  north: "צפון",
  sharon: "שרון",
  center: "מרכז",
  shfela: "שפלה",
  jerusalem: "אזור ירושלים",
  yosh: "יהודה ושומרון",
  south: "דרום",
};

export const HOLD_FAMILY_LABELS: Record<string, string> = {
  foundational: "אחיזות יסוד",
  directional: "אחיזות כיווניות",
  "structural-special": "אחיזות גדולות, מבניות ומיוחדות",
  "feet-only": "רגליים בלבד",
  "outdoor-rock": "אופייניות לטיפוס בטבע",
};

export const GLOSSARY_CATEGORY_LABELS: Record<string, string> = {
  "movement-technique": "תנועה וטכניקה על הקיר",
  "sending-attempts": "הצלחה, ניסיונות ומהלך הטיפוס",
  "discipline-style": "סגנונות טיפוס",
  "wall-safety": "מושגי מבנה קיר ובטיחות",
};

export const TECHNIQUE_CATEGORY_LABELS: Record<string, string> = {
  fundamentals: "יסודות התנועה",
  "advanced-movement": "טכניקות תנועה מתקדמות",
  "effort-safety": "ניהול מאמץ ובטיחות",
};

export const INJURY_CATEGORY_LABELS: Record<string, string> = {
  "warmup-prep": "חימום והכנה",
  "common-injuries": "פציעות נפוצות ומניעתן",
  "recovery-training": "התאוששות ואימון מונע",
};

export const GEAR_CATEGORY_LABELS: Record<string, string> = {
  "personal-basics": "ציוד אישי בסיסי",
  "safety-rope-lead": "ציוד אבטחה, חבלים והובלה",
  bouldering: "ציוד בולדרינג",
  trad: "ציוד טיפוס מסורתי (טראד)",
  "training-recovery": "ציוד אימון ושיקום",
};

// Discipline "environment" badge. "קיר מלאכותי" (not the older "קיר סגור")
// to match the site-wide "קיר טיפוס (מלאכותי)" wording.
export const ENVIRONMENT_LABELS: Record<string, string> = {
  indoor: "קיר מלאכותי",
  outdoor: "טבע",
  both: "קיר וטבע",
};

export const ENVIRONMENT_VARIANTS: Record<string, "rope" | "olive" | "rust"> = {
  indoor: "rope",
  outdoor: "olive",
  both: "rust",
};

/** Keys of a label map, in declaration order - for rendering grouped sections. */
export function orderedKeys(labels: Record<string, string>): string[] {
  return Object.keys(labels);
}
