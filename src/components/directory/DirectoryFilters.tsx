import { useEffect, useState } from "preact/hooks";
import { REGION_LABELS } from "../../lib/labels";

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

const regionOption = (value: string) => ({ value, label: REGION_LABELS[value] });

const GYM_REGION_OPTIONS = ["north", "sharon", "center", "shfela", "jerusalem", "yosh", "south"].map(
  regionOption,
);

// Crags don't get the שרון/שפלה split - too few natural sites in those
// areas to justify it, so both are folded into "מרכז" (both in the
// filter chips here and in the crags' own region tag in generate-content.ts).
const CRAG_REGION_OPTIONS = ["north", "center", "jerusalem", "yosh", "south"].map(regionOption);

type Kind = "gym" | "crag";
type ViewMode = "cards" | "table" | "map";

const VIEW_MODES: [ViewMode, string][] = [
  ["cards", "אריחים"],
  ["table", "טבלה"],
  ["map", "מפה"],
];

declare global {
  interface Window {
    __directoryFilterState?: { visibleIds: string[]; kind: string };
    __directoryViewMode?: string;
  }
}

function styleOptionsFor(kind: Kind): StyleOption[] {
  return kind === "gym" ? GYM_STYLE_OPTIONS : CRAG_STYLE_OPTIONS;
}

function regionOptionsFor(kind: Kind) {
  return kind === "gym" ? GYM_REGION_OPTIONS : CRAG_REGION_OPTIONS;
}

function styleLabelsFromParam(kind: Kind, param: string | null): Set<string> {
  if (!param) return new Set();
  const requested = new Set(param.split(","));
  return new Set(
    styleOptionsFor(kind)
      .filter((opt) => opt.values.some((v) => requested.has(v)))
      .map((opt) => opt.label),
  );
}

// Chips are 36px tall on phones (finger-sized), compact from `sm` up.
const chipBase =
  "min-h-9 rounded-sm border border-dashed px-3 py-1 font-mono text-xs tracking-wide transition-colors sm:min-h-0 sm:px-2.5";

export default function DirectoryFilters() {
  // Always start from the same neutral defaults Astro's SSR pass renders
  // (it has no `window`, so it can't know the URL's ?kind=/?style=/?region=
  // yet). Reading those on the client's very first render would make that
  // render disagree with the server-rendered HTML - e.g. crag needs 5 style
  // buttons where gym's SSR markup only has 3 - and Preact's hydration
  // can't reconcile a structural mismatch like that; it just leaves the
  // stale SSR content on screen. Applying the URL in a useEffect instead
  // runs strictly after hydration, as an ordinary client-side state update.
  const [kind, setKind] = useState<Kind>("gym");
  const [styleLabels, setStyleLabels] = useState<Set<string>>(new Set());
  const [regions, setRegions] = useState<Set<string>>(new Set());
  const [guidebookOnly, setGuidebookOnly] = useState(false);
  const [search, setSearch] = useState("");
  const [visibleCount, setVisibleCount] = useState<number | null>(null);
  // null = untouched: CSS decides (chips collapsed on phones, where they'd
  // push every result below the fold, and open from `sm` up). Using CSS for
  // the default avoids a layout jump after hydration on either screen size.
  const [filtersVisible, setFiltersVisible] = useState<boolean | null>(null);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("cards");
  // Flipped once the URL has been read - until that state update has
  // rendered, the URL-writing effect below must not run, or it would wipe
  // the incoming ?kind=... params with the SSR defaults.
  const [urlLoaded, setUrlLoaded] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlKind: Kind = params.get("kind") === "crag" ? "crag" : "gym";
    const validRegions = new Set(regionOptionsFor(urlKind).map((o) => o.value));
    const urlView = params.get("view");
    setKind(urlKind);
    setStyleLabels(styleLabelsFromParam(urlKind, params.get("style")));
    setRegions(
      new Set((params.get("region")?.split(",") ?? []).filter((r) => validRegions.has(r))),
    );
    setGuidebookOnly(urlKind === "crag" && params.get("guidebook") === "1");
    setSearch(params.get("q") ?? "");
    if (urlView === "table" || urlView === "map") setViewMode(urlView);
    // A shared link with chip filters already applied: show the chips, so
    // it's visible on a phone too what is filtering the list.
    if (params.has("style") || params.has("region") || params.get("guidebook") === "1") {
      setFiltersVisible(true);
    }
    setUrlLoaded(true);
  }, []);

  useEffect(() => {
    const query = window.matchMedia("(max-width: 639.98px)");
    const update = () => setIsSmallScreen(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  const options = styleOptionsFor(kind);
  const regionOptions = regionOptionsFor(kind);
  const hasActiveFilters =
    styleLabels.size > 0 || regions.size > 0 || guidebookOnly || search.trim().length > 0;
  const activeChipCount = styleLabels.size + regions.size + (guidebookOnly ? 1 : 0);
  const chipsExpanded = filtersVisible ?? !isSmallScreen;
  // Classes for the chips panel and the toggle button; in the untouched
  // state they follow the breakpoint purely in CSS.
  const chipsPanelClass =
    filtersVisible === null ? "hidden sm:block" : filtersVisible ? "block" : "hidden";
  const toggleOnClass = "border-rope bg-rope text-paper";
  const toggleOffClass = "border-stone/60 text-ink hover:border-rust hover:text-rust";
  const toggleClass =
    filtersVisible === null
      ? `${toggleOffClass} sm:border-rope sm:bg-rope sm:text-paper sm:hover:border-rope sm:hover:text-paper`
      : filtersVisible
        ? toggleOnClass
        : toggleOffClass;

  useEffect(() => {
    const cards = Array.from(document.querySelectorAll<HTMLElement>("[data-location-card]"));
    const q = search.trim().toLowerCase();
    const activeValues = new Set(
      options.filter((opt) => styleLabels.has(opt.label)).flatMap((opt) => opt.values),
    );
    const visibleIds = new Set<string>();

    for (const card of cards) {
      const matchesKind = card.dataset.kind === kind;
      const cardStyles = (card.dataset.styles ?? "").split(",");
      const matchesStyles = activeValues.size === 0 || cardStyles.some((s) => activeValues.has(s));
      const matchesRegion = regions.size === 0 || regions.has(card.dataset.region ?? "");
      const matchesGuidebook = !guidebookOnly || card.dataset.guidebook === "true";
      const matchesSearch = q.length === 0 || (card.dataset.search ?? "").includes(q);

      const visible =
        matchesKind && matchesStyles && matchesRegion && matchesGuidebook && matchesSearch;
      card.classList.toggle("hidden", !visible);
      if (visible && card.dataset.locationId) visibleIds.add(card.dataset.locationId);
    }

    setVisibleCount(visibleIds.size);

    document.getElementById("crag-guidebook-note")?.classList.toggle("hidden", kind !== "crag");

    const detail = { visibleIds: Array.from(visibleIds), kind };
    window.__directoryFilterState = detail;
    window.dispatchEvent(new CustomEvent("directory:filterchange", { detail }));
  }, [kind, styleLabels, regions, guidebookOnly, search]);

  useEffect(() => {
    document.getElementById("location-cards-view")?.classList.toggle("hidden", viewMode !== "cards");
    document.getElementById("location-table-view")?.classList.toggle("hidden", viewMode !== "table");
    document.getElementById("location-map-view")?.classList.toggle("hidden", viewMode !== "map");
    window.__directoryViewMode = viewMode;
    window.dispatchEvent(new CustomEvent("directory:viewmode", { detail: viewMode }));
  }, [viewMode]);

  // Mirror the current filters into the address bar (replaceState, so it
  // doesn't flood the back-button history) - a filtered view can now be
  // bookmarked or shared, and survives a reload or coming back from a
  // location's page.
  useEffect(() => {
    if (!urlLoaded) return;
    const params = new URLSearchParams();
    if (kind === "crag") params.set("kind", "crag");
    const styleValues = options
      .filter((opt) => styleLabels.has(opt.label))
      .flatMap((opt) => opt.values);
    if (styleValues.length > 0) params.set("style", styleValues.join(","));
    if (regions.size > 0) params.set("region", [...regions].join(","));
    if (guidebookOnly) params.set("guidebook", "1");
    if (search.trim()) params.set("q", search.trim());
    if (viewMode !== "cards") params.set("view", viewMode);
    const query = params.toString();
    const next = `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`;
    if (next !== `${window.location.pathname}${window.location.search}${window.location.hash}`) {
      window.history.replaceState(window.history.state, "", next);
    }
  }, [urlLoaded, kind, styleLabels, regions, guidebookOnly, search, viewMode]);

  function changeKind(next: Kind) {
    setKind(next);
    setStyleLabels(new Set());
    if (next !== "crag") setGuidebookOnly(false);
    // A region chip like שרון/שפלה only exists for gyms - if one was
    // selected there, carrying it into the crag view would silently
    // filter out every crag with no visible chip left to undo it.
    setRegions((prev) => {
      const validValues = new Set(regionOptionsFor(next).map((o) => o.value));
      return new Set([...prev].filter((r) => validValues.has(r)));
    });
  }

  function toggleIn(setter: (fn: (prev: Set<string>) => Set<string>) => void, value: string) {
    setter((prev) => {
      const next = new Set(prev);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });
  }

  function clearFilters() {
    setStyleLabels(new Set());
    setRegions(new Set());
    setGuidebookOnly(false);
    setSearch("");
  }

  return (
    <div class="border border-stone/50 bg-paper-dark p-4">
      <div class="grid grid-cols-2 gap-2" role="group" aria-label="סוג מקום">
        {(
          [
            ["gym", "קירות טיפוס", "Wall climbing"],
            ["crag", "טבע", "Rock climbing"],
          ] as [Kind, string, string][]
        ).map(([value, label, subLabel]) => (
          <button
            type="button"
            onClick={() => changeKind(value)}
            aria-pressed={kind === value}
            class={`border-2 px-4 py-3 text-center transition-colors ${
              kind === value
                ? "border-rope bg-rope text-paper"
                : "border-stone/60 text-ink hover:border-rust hover:text-rust"
            }`}
          >
            <span class="block font-display text-base font-bold">{label}</span>
            <span
              class={`block font-mono text-xs uppercase tracking-wide ${
                kind === value ? "text-paper" : "text-ink-soft"
              }`}
              aria-hidden="true"
            >
              {subLabel}
            </span>
          </button>
        ))}
      </div>

      <div class="mt-3 flex flex-wrap items-center gap-2">
        {/* 16px text on phones: iOS Safari zooms the whole page into any
            field with smaller text when it's focused. */}
        <input
          type="search"
          value={search}
          onInput={(e) => setSearch((e.target as HTMLInputElement).value)}
          placeholder={kind === "gym" ? "חיפוש לפי שם, עיר או רשת..." : "חיפוש לפי שם או אזור..."}
          aria-label="חיפוש מקום טיפוס"
          class="min-w-0 flex-1 basis-48 border border-stone bg-paper px-3 py-2 text-base text-ink placeholder:text-ink-soft focus:border-rope focus:outline-none sm:text-sm"
        />
        <button
          type="button"
          onClick={() => setFiltersVisible(!chipsExpanded)}
          aria-expanded={chipsExpanded}
          aria-controls="directory-filter-chips"
          class={`flex min-h-10 shrink-0 items-center gap-1.5 border px-3 py-2 font-body text-sm font-bold transition-colors ${toggleClass}`}
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
          {activeChipCount > 0 && !chipsExpanded && (
            <span class="font-mono text-xs" aria-label={`${activeChipCount} מסננים פעילים`}>
              ({activeChipCount})
            </span>
          )}
        </button>
      </div>

      <div id="directory-filter-chips" class={chipsPanelClass}>
        <div class="mt-3 flex flex-wrap items-center gap-2 sm:gap-1.5" role="group" aria-labelledby="filter-style-label">
          <span id="filter-style-label" class="shrink-0 font-body text-xs font-bold text-ink-soft">
            סגנון
          </span>
          {options.map((opt) => (
            <button
              type="button"
              onClick={() => toggleIn(setStyleLabels, opt.label)}
              aria-pressed={styleLabels.has(opt.label)}
              class={`${chipBase} ${
                styleLabels.has(opt.label)
                  ? "border-rust bg-rust text-paper"
                  : "border-stone text-ink-soft hover:border-rust hover:text-rust"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div class="mt-3 flex flex-wrap items-center gap-2 sm:gap-1.5" role="group" aria-labelledby="filter-region-label">
          <span id="filter-region-label" class="shrink-0 font-body text-xs font-bold text-ink-soft">
            אזור בארץ
          </span>
          {regionOptions.map((opt) => (
            <button
              type="button"
              onClick={() => toggleIn(setRegions, opt.value)}
              aria-pressed={regions.has(opt.value)}
              class={`${chipBase} ${
                regions.has(opt.value)
                  ? "border-olive bg-olive text-paper"
                  : "border-stone text-ink-soft hover:border-olive hover:text-olive"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Filters that are neither a climbing style nor a region. Only
            crags have guidebooks, so the group exists only for them. */}
        {kind === "crag" && (
          <div class="mt-3 flex flex-wrap items-center gap-2 sm:gap-1.5" role="group" aria-labelledby="filter-extra-label">
            <span id="filter-extra-label" class="shrink-0 font-body text-xs font-bold text-ink-soft">
              נוספים
            </span>
            <button
              type="button"
              onClick={() => setGuidebookOnly((v) => !v)}
              aria-pressed={guidebookOnly}
              class={`${chipBase} ${
                guidebookOnly
                  ? "border-rope bg-rope text-paper"
                  : "border-stone text-ink-soft hover:border-rope hover:text-rope"
              }`}
            >
              עם גיידבוק
            </button>
          </div>
        )}
      </div>

      <div class="mt-3 flex flex-wrap items-center justify-between gap-2">
        <div class="flex flex-wrap items-center gap-3">
          <p class="font-mono text-xs text-ink-soft" role="status" aria-live="polite">
            {visibleCount === null ? "" : `מציג ${visibleCount} מקומות`}
          </p>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              class="py-2 font-body text-xs font-bold text-rope underline-offset-2 hover:underline sm:py-0"
            >
              ניקוי סינון
            </button>
          )}
        </div>

        <div class="flex overflow-hidden border border-stone/60" role="group" aria-label="אופן תצוגה">
          {VIEW_MODES.map(([mode, label], i) => (
            <button
              type="button"
              onClick={() => setViewMode(mode)}
              aria-pressed={viewMode === mode}
              class={`min-h-10 px-3.5 font-mono text-xs tracking-wide transition-colors sm:min-h-0 sm:px-3 sm:py-1.5 ${
                i > 0 ? "border-s border-stone/60" : ""
              } ${viewMode === mode ? "bg-rope text-paper" : "text-ink-soft hover:text-rust"}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {visibleCount === 0 && (
        <p class="mt-4 border-t border-dashed border-stone/50 pt-4 text-sm text-ink-soft">
          לא נמצאו מקומות שתואמים לחיפוש ולסינון.{" "}
          <button
            type="button"
            onClick={clearFilters}
            class="font-bold text-rope underline underline-offset-2"
          >
            ניקוי הסינון
          </button>
        </p>
      )}
    </div>
  );
}
