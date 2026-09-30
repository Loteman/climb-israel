import { defineCollection, z, reference } from "astro:content";
import { glob } from "astro/loaders";

const holdFamily = z.enum([
  "foundational", // אחיזות יסוד (על בסיס צורה)
  "directional", // אחיזות כיווניות (על בסיס זווית משיכה)
  "structural-special", // אחיזות גדולות, מבניות ומיוחדות
  "feet-only", // רגליים בלבד
  "outdoor-rock", // אחיזות אופייניות לטיפוס בטבע
]);

const holdTypes = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/hold-types" }),
  schema: z.object({
    nameHe: z.string(),
    nameEn: z.string(),
    family: holdFamily,
    order: z.number(),
    iconId: z.string(),
    summary: z.string(),
    relatedHoldSlugs: z.array(reference("hold-types")).optional(),
  }),
});

const glossaryCategory = z.enum([
  "movement-technique", // תנועה וטכניקה על הקיר
  "sending-attempts", // הצלחה, ניסיונות ומהלך הטיפוס
  "discipline-style", // סגנונות טיפוס
  "wall-safety", // מושגי מבנה קיר ובטיחות
]);

const glossary = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/glossary" }),
  schema: z.object({
    termHe: z.string(),
    termEn: z.string(),
    category: glossaryCategory,
    order: z.number(),
    summary: z.string(),
    relatedDisciplineSlug: reference("disciplines").optional(),
    relatedTermSlugs: z.array(reference("glossary")).optional(),
  }),
});

const disciplines = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/disciplines" }),
  schema: z.object({
    nameHe: z.string(),
    nameEn: z.string(),
    order: z.number(),
    environment: z.enum(["indoor", "outdoor", "both"]),
    summary: z.string(),
  }),
});

const techniqueCategory = z.enum([
  "fundamentals", // יסודות התנועה
  "advanced-movement", // טכניקות תנועה מתקדמות
  "effort-safety", // ניהול מאמץ ובטיחות
]);

const techniques = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/techniques" }),
  schema: z.object({
    nameHe: z.string(),
    nameEn: z.string(),
    category: techniqueCategory,
    order: z.number(),
    summary: z.string(),
  }),
});

const injuryPreventionCategory = z.enum([
  "warmup-prep", // חימום והכנה
  "common-injuries", // פציעות נפוצות ומניעתן
  "recovery-training", // התאוששות ואימון מונע
]);

const injuryPrevention = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/injury-prevention" }),
  schema: z.object({
    nameHe: z.string(),
    nameEn: z.string(),
    category: injuryPreventionCategory,
    order: z.number(),
    summary: z.string(),
  }),
});

const gearCategory = z.enum([
  "personal-basics", // ציוד אישי בסיסי
  "safety-rope-lead", // ציוד אבטחה, חבלים והובלה
  "bouldering", // ציוד בולדרינג
  "trad", // ציוד טיפוס מסורתי
  "training-recovery", // ציוד אימון ושיקום
]);

const gear = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/gear" }),
  schema: z.object({
    nameHe: z.string(),
    nameEn: z.string(),
    category: gearCategory,
    order: z.number(),
    iconId: z.string(),
    relevantDisciplines: z.array(reference("disciplines")).optional(),
    summary: z.string(),
  }),
});

const climbingStyle = z.enum([
  "bouldering",
  "lead",
  "top-rope",
  "speed",
  "trad",
  "multi-pitch",
  "via-ferrata",
]);

// General-area filter shown on the directory page, independent of city
// (gyms) - broader and more colloquial than the old 3-way crag-only split.
const region = z.enum(["north", "sharon", "center", "shfela", "jerusalem", "yosh", "south"]);

const locationBase = {
  name: z.string(),
  styles: z.array(climbingStyle).min(1),
  region,
  description: z.string().optional(),
  sourceNote: z.string().optional(),
  // Not yet available for any location - do not invent a handle.
  instagram: z.string().url().optional(),
  // Geocoded from `address` (gyms) or looked up by name (crags) - see
  // scripts/geocode-locations.mjs. Powers the "ניווט" button and the map.
  coordinates: z.object({ lat: z.number(), lng: z.number() }).optional(),
};

const gymSchema = z.object({
  ...locationBase,
  kind: z.literal("gym"),
  chain: z.string().optional(),
  city: z.string(),
  address: z.string().optional(),
  hours: z.record(z.string(), z.string()).optional(),
  phone: z.string().optional(),
  website: z.string().url().optional(),
});

const cragSchema = z.object({
  ...locationBase,
  kind: z.literal("crag"),
  // Sourced from the ILCA (Israel Climbing Federation) crag database -
  // see scripts/generate-content.ts for the per-crag data. Left unpopulated
  // for crags ILCA has no published write-up for - never fabricated.
  locationDescription: z.string().optional(), // "מיקום" - approximate area/access, not a formal street address
  rockType: z.string().optional(), // "סלע"
  routeLength: z.string().optional(), // "אורך המסלולים"
  routeCount: z.string().optional(), // "כמות מסלולים"
  season: z.string().optional(), // "עונה"
  shade: z.string().optional(), // "צל"
  lodging: z.string().optional(), // "לינה"
  // "להורדת הגיידבוק" - one or more sources (site-hosted PDF or an
  // external link); the tile/table show only the first, the crag page
  // lists all of them.
  guidebooks: z.array(z.object({ label: z.string(), url: z.string() })).optional(),
  externalBetaUrl: z.string().url().optional(), // extra map/beta link when ILCA links one that isn't the PDF guidebook
  // Site is documented (per the IMGA wiki) as sitting inside a nature
  // reserve where climbing is prohibited. Kept in the collection for the
  // record, but filtered out of every public listing/detail page via
  // src/lib/locations.ts - see that file before changing this behavior.
  climbingProhibited: z.boolean().optional(),
});

const locations = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/locations" }),
  schema: z.discriminatedUnion("kind", [gymSchema, cragSchema]),
});

export const collections = {
  "hold-types": holdTypes,
  glossary,
  disciplines,
  gear,
  techniques,
  "injury-prevention": injuryPrevention,
  locations,
};
