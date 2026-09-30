import { useEffect, useState } from "preact/hooks";

interface StyleOption {
  label: string;
  values: string[];
}

const GYM_STYLE_OPTIONS: StyleOption[] = [
  { label: "בולדרינג", values: ["bouldering"] },
  { label: "הובלה / טופ-רופ", values: ["lead", "top-rope"] },
  { label: "טיפוס מהירות", values: ["speed"] },
];

const CRAG_STYLE_OPTIONS: StyleOption[] = [
  { label: "בולדרינג", values: ["bouldering"] },
  { label: "הובלה / ספורט", values: ["lead"] },
  { label: "טראד", values: ["trad"] },
  { label: "מולטי-פיץ'", values: ["multi-pitch"] },
  { label: "ויה פראטה", values: ["via-ferrata"] },
];

const GYM_REGION_OPTIONS: { value: string; label: string }[] = [
  { value: "north", label: "צפון" },
  { value: "sharon", label: "שרון" },
  { value: "center", label: "מרכז" },
  { value: "shfela", label: "שפלה" },
  { value: "jerusalem", label: "אזור ירושלים" },
  { value: "yosh", label: "יהודה ושומרון" },
  { value: "south", label: "דרום" },
];

// Crags don't get the שרון/שפלה split - too few natural sites in those
// areas to justify it, so both are folded into "מרכז" (both in the
// filter chips here and in the crags' own region tag in generate-content.ts).
const CRAG_REGION_OPTIONS: { value: string; label: string }[] = [
  { value: "north", label: "צפון" },
  { value: "center", label: "מרכז" },
  { value: "jerusalem", label: "אזור ירושלים" },
  { value: "yosh", label: "יהודה ושומרון" },
  { value: "south", label: "דרום" },
];

const ALL_REGION_OPTIONS = GYM_REGION_OPTIONS;

type Kind = "gym" | "crag";
type ViewMode = "cards" | "table" | "map";

declare global {
  interface Window {
    __directoryFilterState?: { visibleIds: string[]; kind: string };
  }
}

// No "all" option on purpose - the environment choice (indoor vs outdoor)
// is mandatory, since gym/crag results need different mental context
// (opening hours vs. weather and approach), not just a narrower list.
function initialKind(): Kind {
  if (typeof window === "undefined") return "gym";
  const param = new URLSearchParams(window.location.search).get("kind");
  return param === "crag" ? "crag" : "gym";
}

function initialStyleLabels(kind: Kind): Set<string> {
  if (typeof window === "undefined") return new Set();
  const param = new URLSearchParams(window.location.search).get("style");
  if (!param) return new Set();
  const requested = new Set(param.split(","));
  const options = kind === "gym" ? GYM_STYLE_OPTIONS : CRAG_STYLE_OPTIONS;
  return new Set(
    options
      .filter((opt) => opt.values.some((v) => requested.has(v)))
      .map((opt) => opt.label),
  );
}

function initialRegions(): Set<string> {
  if (typeof window === "undefined") return new Set();
  const param = new URLSearchParams(window.location.search).get("region");
  if (!param) return new Set();
  const valid = new Set(ALL_REGION_OPTIONS.map((o) => o.value));
  return new Set(param.split(",").filter((r) => valid.has(r)));
}

export default function DirectoryFilters() {
  const [kind, setKind] = useState<Kind>(initialKind);
  const [styleLabels, setStyleLabels] = useState<Set<string>>(() =>
    initialStyleLabels(initialKind()),
  );
  const [regions, setRegions] = useState<Set<string>>(initialRegions);
  const [search, setSearch] = useState("");
  const [visibleCount, setVisibleCount] = useState<number | null>(null);
  const [filtersVisible, setFiltersVisible] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("cards");

  const options = kind === "gym" ? GYM_STYLE_OPTIONS : CRAG_STYLE_OPTIONS;
  const regionOptions = kind === "gym" ? GYM_REGION_OPTIONS : CRAG_REGION_OPTIONS;

  useEffect(() => {
    const cards = Array.from(
      document.querySelectorAll<HTMLElement>("[data-location-card]"),
    );
    const q = search.trim().toLowerCase();
    const activeValues = new Set(
      options.filter((opt) => styleLabels.has(opt.label)).flatMap((opt) => opt.values),
    );
    const visibleIds = new Set<string>();

    for (const card of cards) {
      const matchesKind = card.dataset.kind === kind;
      const cardStyles = (card.dataset.styles ?? "").split(",");
      const matchesStyles =
        activeValues.size === 0 || cardStyles.some((s) => activeValues.has(s));
      const matchesRegion = regions.size === 0 || regions.has(card.dataset.region ?? "");
      const matchesSearch =
        q.length === 0 || (card.dataset.search ?? "").includes(q);

      const visible = matchesKind && matchesStyles && matchesRegion && matchesSearch;
      card.classList.toggle("hidden", !visible);
      if (visible && card.dataset.locationId) visibleIds.add(card.dataset.locationId);
    }

    setVisibleCount(visibleIds.size);

    document
      .getElementById("crag-guidebook-note")
      ?.classList.toggle("hidden", kind !== "crag");

    const detail = { visibleIds: Array.from(visibleIds), kind };
    window.__directoryFilterState = detail;
    window.dispatchEvent(new CustomEvent("directory:filterchange", { detail }));
  }, [kind, styleLabels, regions, search]);

  useEffect(() => {
    document
      .getElementById("location-cards-view")
      ?.classList.toggle("hidden", viewMode !== "cards");
    document
      .getElementById("location-table-view")
      ?.classList.toggle("hidden", viewMode !== "table");
    document
      .getElementById("location-map-view")
      ?.classList.toggle("hidden", viewMode !== "map");
    window.dispatchEvent(new CustomEvent("directory:viewmode", { detail: viewMode }));
  }, [viewMode]);

  function changeKind(next: Kind) {
    setKind(next);
    setStyleLabels(new Set());
    // A region chip like שרון/שפלה only exists for gyms - if one was
    // selected there, carrying it into the crag view would silently
    // filter out every crag with no visible chip left to undo it.
    setRegions((prev) => {
      const validValues = new Set(
        (next === "gym" ? GYM_REGION_OPTIONS : CRAG_REGION_OPTIONS).map((o) => o.value),
      );
      return new Set([...prev].filter((r) => validValues.has(r)));
    });
  }

  function toggleStyle(label: string) {
    setStyleLabels((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  }

  function toggleRegion(value: string) {
    setRegions((prev) => {
      const next = new Set(prev);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });
  }

  return (
    <div class="border border-stone/50 bg-paper-dark p-4">
      <div class="grid grid-cols-2 gap-2">
        {(
          [
            ["gym", "קירות טיפוס", "Indoor"],
            ["crag", "טבע", "Outdoor"],
          ] as [Kind, string, string][]
        ).map(([value, label, subLabel]) => (
          <button
            type="button"
            onClick={() => changeKind(value)}
            class={`border-2 px-4 py-3 text-center transition-colors ${
              kind === value
                ? "border-rope bg-rope text-paper"
                : "border-stone/60 text-ink hover:border-rust hover:text-rust"
            }`}
          >
            <span class="block font-display text-base font-bold">{label}</span>
            <span
              class={`block font-mono text-[11px] uppercase tracking-wide ${
                kind === value ? "text-paper/80" : "text-ink-soft"
              }`}
            >
              {subLabel}
            </span>
          </button>
        ))}
      </div>

      <div class="mt-3 flex flex-wrap items-center gap-2">
        <input
          type="text"
          value={search}
          onInput={(e) => setSearch((e.target as HTMLInputElement).value)}
          placeholder="חיפוש לפי שם, עיר או רשת..."
          class="min-w-[200px] flex-1 border border-stone/60 bg-paper px-3 py-2 text-sm text-ink placeholder:text-ink-soft/70 focus:border-rope focus:outline-none"
        />
        <button
          type="button"
          onClick={() => setFiltersVisible((v) => !v)}
          aria-pressed={filtersVisible}
          class={`flex shrink-0 items-center gap-1.5 border px-3 py-2 font-body text-sm font-bold transition-colors ${
            filtersVisible
              ? "border-rope bg-rope text-paper"
              : "border-stone/60 text-ink hover:border-rust hover:text-rust"
          }`}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M4 5h16l-6.5 7.5V19l-3 1.5v-8z"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          סינון
        </button>
      </div>

      {filtersVisible && (
        <>
          <div class="mt-3 flex flex-wrap items-center gap-1.5">
            <span class="shrink-0 font-mono text-[11px] uppercase tracking-wide text-ink-soft">
              סגנון
            </span>
            {options.map((opt) => (
              <button
                type="button"
                onClick={() => toggleStyle(opt.label)}
                class={`rounded-sm border border-dashed px-2.5 py-1 font-mono text-xs uppercase tracking-wide transition-colors ${
                  styleLabels.has(opt.label)
                    ? "border-rust bg-rust text-paper"
                    : "border-stone text-ink-soft hover:border-rust hover:text-rust"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div class="mt-3 flex flex-wrap items-center gap-1.5">
            <span class="shrink-0 font-mono text-[11px] uppercase tracking-wide text-ink-soft">
              אזור בארץ
            </span>
            {regionOptions.map((opt) => (
              <button
                type="button"
                onClick={() => toggleRegion(opt.value)}
                class={`rounded-sm border border-dashed px-2.5 py-1 font-mono text-xs uppercase tracking-wide transition-colors ${
                  regions.has(opt.value)
                    ? "border-olive bg-olive text-paper"
                    : "border-stone text-ink-soft hover:border-olive hover:text-olive"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </>
      )}

      <div class="mt-3 flex flex-wrap items-center justify-between gap-2">
        {visibleCount !== null && (
          <p class="font-mono text-xs text-ink-soft">
            מציג {visibleCount} מקומות
          </p>
        )}

        <div class="flex overflow-hidden border border-stone/60">
          <button
            type="button"
            onClick={() => setViewMode("cards")}
            aria-pressed={viewMode === "cards"}
            class={`px-3 py-1.5 font-mono text-xs uppercase tracking-wide transition-colors ${
              viewMode === "cards"
                ? "bg-rope text-paper"
                : "text-ink-soft hover:text-rust"
            }`}
          >
            אריחים
          </button>
          <button
            type="button"
            onClick={() => setViewMode("table")}
            aria-pressed={viewMode === "table"}
            class={`border-r border-stone/60 px-3 py-1.5 font-mono text-xs uppercase tracking-wide transition-colors ${
              viewMode === "table"
                ? "bg-rope text-paper"
                : "text-ink-soft hover:text-rust"
            }`}
          >
            טבלה
          </button>
          <button
            type="button"
            onClick={() => setViewMode("map")}
            aria-pressed={viewMode === "map"}
            class={`border-r border-stone/60 px-3 py-1.5 font-mono text-xs uppercase tracking-wide transition-colors ${
              viewMode === "map"
                ? "bg-rope text-paper"
                : "text-ink-soft hover:text-rust"
            }`}
          >
            מפה
          </button>
        </div>
      </div>
    </div>
  );
}
