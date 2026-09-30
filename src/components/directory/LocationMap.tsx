import { useEffect, useRef, useState } from "preact/hooks";
import type L from "leaflet";

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

const regionLabels: Record<string, string> = {
  north: "צפון",
  sharon: "שרון",
  center: "מרכז",
  shfela: "שפלה",
  jerusalem: "אזור ירושלים",
  yosh: "יהודה ושומרון",
  south: "דרום",
};

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

  useEffect(() => {
    let cancelled = false;
    let map: L.Map | null = null;
    let Lmod: typeof L | null = null;
    let isMapVisible = false;
    let lastVisibleIds: string[] = locations.map((l) => l.id);
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
      const shown = applyVisible(new Set(visibleIds));
      setEmptyKind(visibleIds.length > 0 && shown.length === 0 ? kind : null);
      fitToShown(shown);
    }

    function onFilterChange(e: Event) {
      const { visibleIds, kind } = (e as CustomEvent<{ visibleIds: string[]; kind: string }>).detail;
      handleFilterChange(visibleIds, kind);
    }

    function onViewMode(e: Event) {
      isMapVisible = (e as CustomEvent<string>).detail === "map";
      if (isMapVisible) {
        requestAnimationFrame(() => {
          map?.invalidateSize();
          fitToShown(applyVisible(new Set(lastVisibleIds)));
        });
      }
    }

    (async () => {
      const leaflet = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");
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
        html: '<span class="block h-[18px] w-[18px] rounded-full border-2 border-paper bg-rope shadow-[0_1px_3px_rgba(0,0,0,0.4)]"></span>',
        iconSize: [18, 18],
        iconAnchor: [9, 9],
        popupAnchor: [0, -10],
      });

      for (const loc of locations) {
        const marker = leaflet.marker([loc.lat, loc.lng], { icon: dotIcon });

        marker.bindPopup(
          () => {
            const wrap = document.createElement("div");
            wrap.className = "min-w-[170px]";

            const title = document.createElement("p");
            title.className = "font-display font-bold text-ink";
            title.textContent = loc.name;
            wrap.appendChild(title);

            const sub = document.createElement("p");
            sub.className = "mt-1 text-xs text-ink-soft";
            sub.textContent = [regionLabels[loc.region], loc.city].filter(Boolean).join(" · ");
            wrap.appendChild(sub);

            const link = document.createElement("a");
            link.href = `/מקומות-טיפוס/${loc.id}/`;
            link.className = "mt-2 inline-block font-body text-xs font-bold text-rope hover:underline";
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

      applyVisible(new Set(locations.map((l) => l.id)));

      const state = window.__directoryFilterState;
      if (state) handleFilterChange(state.visibleIds, state.kind);

      window.addEventListener("directory:filterchange", onFilterChange);
      window.addEventListener("directory:viewmode", onViewMode);
    })();

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
      <div
        ref={containerRef}
        class="h-[420px] w-full border border-stone/50 sm:h-[520px]"
      />
      {emptyKind === "crag" && (
        <p class="mt-3 text-center font-body text-sm text-ink-soft">
          עדיין אין מיקום מדויק על המפה לאתרי טבע - בקרוב.
        </p>
      )}
    </div>
  );
}
