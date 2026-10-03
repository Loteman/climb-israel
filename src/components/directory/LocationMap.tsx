import { useEffect, useRef, useState } from "preact/hooks";
import type L from "leaflet";
import { withBase } from "../../lib/url";
import { REGION_LABELS } from "../../lib/labels";

export interface MapLocation {
  id: string;
  kind: "gym" | "crag";
  name: string;
  region: string;
  city?: string;
  lat: number;
  lng: number;
}

interface Props {
  locations: MapLocation[];
}

// Israel's rough bounding box - used as the default view before markers
// exist for the currently selected kind (e.g. crags before they're
// geocoded). Padded well beyond the country's actual extent (not just a
// tight box around it) so Leaflet's popup auto-pan always has room to
// shift the view when opening a marker near the edge of the visible
// map - a tight box blocks that pan and leaves the popup clipped.
const ISRAEL_CENTER: [number, number] = [31.4, 35.0];
const ISRAEL_BOUNDS: [[number, number], [number, number]] = [
  [27.3, 32.1],
  [35.4, 37.9],
];

export default function LocationMap({ locations }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [emptyKind, setEmptyKind] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");

  useEffect(() => {
    let cancelled = false;
    let map: L.Map | null = null;
    let Lmod: typeof L | null = null;
    let initStarted = false;
    let isMapVisible = false;
    let lastVisibleIds: string[] = window.__directoryFilterState?.visibleIds ?? locations.map((l) => l.id);
    let lastKind = window.__directoryFilterState?.kind ?? "gym";
    const markers = new Map<string, L.Marker>();

    function applyVisible(visibleIds: Set<string>): L.Marker[] {
      if (!map) return [];
      const shown: L.Marker[] = [];
      for (const [id, marker] of markers) {
        const shouldShow = visibleIds.has(id);
        const isShown = map.hasLayer(marker);
        if (shouldShow && !isShown) marker.addTo(map);
        if (!shouldShow && isShown) map.removeLayer(marker);
        if (shouldShow) shown.push(marker);
      }
      return shown;
    }

    // Only touches the viewport (setView/fitBounds) - Leaflet computes this
    // from the container's current pixel size, so it must never run while
    // the map is sitting inside a hidden (display:none) tab, or the zoom
    // math comes out wrong and invalidateSize() alone won't fix it later.
    function fitToShown(shown: L.Marker[]) {
      if (!map || !Lmod || !isMapVisible || shown.length === 0) return;
      if (shown.length === 1) {
        map.setView(shown[0].getLatLng(), 12);
      } else {
        map.fitBounds(Lmod.latLngBounds(shown.map((m) => m.getLatLng())), {
          padding: [30, 30],
        });
      }
    }

    function handleFilterChange(visibleIds: string[], kind: string) {
      lastVisibleIds = visibleIds;
      lastKind = kind;
      if (!map) return;
      const shown = applyVisible(new Set(visibleIds));
      setEmptyKind(visibleIds.length > 0 && shown.length === 0 ? kind : null);
      fitToShown(shown);
    }

    function onFilterChange(e: Event) {
      const { visibleIds, kind } = (e as CustomEvent<{ visibleIds: string[]; kind: string }>).detail;
      handleFilterChange(visibleIds, kind);
    }

    // Leaflet (~45KB gzipped JS + its CSS) is only fetched the first time
    // someone actually opens the map view, not on every directory visit.
    async function initMap() {
      initStarted = true;
      setStatus("loading");
      let leaflet: typeof L;
      try {
        [leaflet] = await Promise.all([
          import("leaflet").then((m) => m.default),
          import("leaflet/dist/leaflet.css"),
        ]);
      } catch {
        // Flaky connection (or a deploy that replaced the chunk): let the
        // next switch to the map view try again instead of hanging.
        initStarted = false;
        if (!cancelled) setStatus("error");
        return;
      }
      if (cancelled || !containerRef.current) return;

      Lmod = leaflet;
      map = leaflet
        .map(containerRef.current, {
          maxBounds: ISRAEL_BOUNDS,
          maxBoundsViscosity: 0.6,
          minZoom: 6,
        })
        .setView(ISRAEL_CENTER, 7.5);

      leaflet
        .tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
          maxZoom: 19,
        })
        .addTo(map);

      const dotIcon = leaflet.divIcon({
        className: "",
        // border-white (not border-paper) on purpose: the map tiles
        // themselves are always light regardless of site theme, so the
        // marker's halo needs to stay light too, not follow dark mode.
        html: '<span class="block h-[18px] w-[18px] rounded-full border-2 border-white bg-rope shadow-[0_1px_3px_rgba(0,0,0,0.4)]"></span>',
        iconSize: [18, 18],
        iconAnchor: [9, 9],
        popupAnchor: [0, -10],
      });

      for (const loc of locations) {
        const marker = leaflet.marker([loc.lat, loc.lng], {
          icon: dotIcon,
          title: loc.name,
        });

        marker.bindPopup(
          () => {
            const wrap = document.createElement("div");
            wrap.className = "min-w-[170px]";

            const title = document.createElement("p");
            title.className = "font-display font-bold";
            title.textContent = loc.name;
            wrap.appendChild(title);

            const sub = document.createElement("p");
            sub.className = "text-xs text-ink-soft";
            sub.textContent = [REGION_LABELS[loc.region], loc.city].filter(Boolean).join(" · ");
            wrap.appendChild(sub);

            const link = document.createElement("a");
            link.href = withBase(`/מקומות-טיפוס/${loc.id}/`);
            // Block + padding: a finger-sized tap target inside the popup.
            link.className = "mt-1 inline-block py-1.5 text-sm font-bold hover:underline";
            link.textContent = "לדף המקום ←";
            wrap.appendChild(link);

            return wrap;
          },
          // Extra top padding so auto-pan clears the zoom control and the
          // popup's own tip/arrow, not just the bare container edge.
          { autoPanPadding: [16, 16], autoPanPaddingTopLeft: [16, 60] },
        );

        markers.set(loc.id, marker);
      }

      setStatus("ready");
      map.invalidateSize();
      handleFilterChange(lastVisibleIds, lastKind);
    }

    function showMap() {
      isMapVisible = true;
      if (!initStarted) {
        void initMap();
        return;
      }
      requestAnimationFrame(() => {
        map?.invalidateSize();
        fitToShown(applyVisible(new Set(lastVisibleIds)));
      });
    }

    function onViewMode(e: Event) {
      if ((e as CustomEvent<string>).detail === "map") showMap();
      else isMapVisible = false;
    }

    window.addEventListener("directory:filterchange", onFilterChange);
    window.addEventListener("directory:viewmode", onViewMode);
    // The filters island may have hydrated first and already switched to
    // the map (e.g. a shared ?view=map link) before these listeners existed.
    if (window.__directoryViewMode === "map") showMap();

    return () => {
      cancelled = true;
      window.removeEventListener("directory:filterchange", onFilterChange);
      window.removeEventListener("directory:viewmode", onViewMode);
      map?.remove();
      map = null;
    };
  }, [locations]);

  return (
    <div>
      {/* The loading note is a sibling, not a child, of the map container:
          Leaflet takes over that element's children once it initializes. */}
      <div class="relative">
        {/* Israel is tall and narrow: on a phone the map gets most of the
            screen height (but leaves a strip to scroll the page past it). */}
        <div
          ref={containerRef}
          class="h-[clamp(420px,70svh,640px)] w-full border border-stone/50 bg-paper-dark sm:h-[520px]"
          role="region"
          aria-label="מפת מקומות הטיפוס"
        />
        {status === "loading" && (
          <p class="pointer-events-none absolute inset-0 flex items-center justify-center font-body text-sm text-ink-soft">
            טוען מפה...
          </p>
        )}
        {status === "error" && (
          <p class="absolute inset-0 flex items-center justify-center p-6 text-center font-body text-sm text-ink-soft">
            לא הצלחנו לטעון את המפה - בדקו את החיבור לאינטרנט ונסו שוב. כל
            המקומות זמינים גם בתצוגת אריחים וטבלה.
          </p>
        )}
      </div>
      {emptyKind === "crag" && (
        <p class="mt-3 text-center font-body text-sm text-ink-soft">
          לאתרים שנבחרו עדיין אין מיקום מדויק על המפה.
        </p>
      )}
    </div>
  );
}
