"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useTheme } from "next-themes";
import {
  Map,
  useMap,
  MapClusterLayer,
  MapMarker,
  MarkerContent,
  MapControls,
} from "@/components/ui/map";
import { useRadioStore } from "@/stores/radioStore";
import { stationsToGeoJSON } from "@/lib/geo-utils";
import { getGenreColor } from "@/lib/constants";
import type { Station } from "@/lib/types";
import { AudioReactiveLayer } from "./AudioReactiveLayer";
import { getAudioData } from "@/hooks/useAudioData";

/**
 * Check if a CSS color string is grayish (low saturation).
 */
function isGrayish(color: string): boolean {
  const m = color.match(/^#([0-9a-f]{6})$/i);
  if (!m) return false;
  const r = parseInt(m[1].slice(0, 2), 16);
  const g = parseInt(m[1].slice(2, 4), 16);
  const b = parseInt(m[1].slice(4, 6), 16);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const sat = max === 0 ? 0 : (max - min) / max;
  return sat < 0.15;
}

/**
 * Shift a gray hex color toward a warm cream tone.
 */
function warmTint(hex: string): string {
  const m = hex.match(/^#([0-9a-f]{6})$/i);
  if (!m) return hex;
  let r = parseInt(m[1].slice(0, 2), 16);
  let g = parseInt(m[1].slice(2, 4), 16);
  let b = parseInt(m[1].slice(4, 6), 16);
  const lum = (r + g + b) / 3;
  const warmR = lum + 8;
  const warmG = lum + 4;
  const warmB = lum - 6;
  r = Math.min(255, Math.max(0, Math.round(r * 0.4 + warmR * 0.6)));
  g = Math.min(255, Math.max(0, Math.round(g * 0.4 + warmG * 0.6)));
  b = Math.min(255, Math.max(0, Math.round(b * 0.4 + warmB * 0.6)));
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

/**
 * Convert a hex color string to an HSL hue value (0-1 range).
 */
function hexToHue(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  if (d === 0) return 0;
  let h = 0;
  if (max === r) h = ((g - b) / d + 6) % 6;
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  return h / 6;
}

/**
 * Audio-reactive station marker that pulses with the music.
 */
function ReactiveMarker({ station }: { station: Station }) {
  const markerRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number>(0);

  const genreColor = getGenreColor(station.tags);

  useEffect(() => {
    const el = markerRef.current;
    if (!el) return;

    const update = () => {
      const audio = getAudioData();
      const scale = 1 + audio.bass * 0.4;
      const glowSize = 12 + audio.energy * 20;
      const pingScale = 1 + audio.energy * 0.5;

      el.style.transform = `scale(${scale})`;
      el.style.boxShadow = `0 0 ${glowSize}px ${genreColor}`;

      const pingEl = el.previousElementSibling as HTMLElement | null;
      if (pingEl) {
        pingEl.style.transform = `scale(${pingScale})`;
        pingEl.style.opacity = `${0.3 + audio.energy * 0.3}`;
      }

      animRef.current = requestAnimationFrame(update);
    };

    animRef.current = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animRef.current);
  }, [genreColor]);

  return (
    <div className="relative flex items-center justify-center">
      <div
        className="absolute h-8 w-8 rounded-full animate-ping"
        style={{
          backgroundColor: genreColor,
          animationDuration: "1.5s",
          opacity: 0.4,
        }}
      />
      <div
        ref={markerRef}
        className="relative h-4 w-4 rounded-full border-2 border-white shadow-lg transition-transform duration-75"
        style={{
          backgroundColor: genreColor,
          boxShadow: `0 0 12px ${genreColor}`,
        }}
      />
    </div>
  );
}

function GlobeContent() {
  const { map, isLoaded } = useMap();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const [geoJSON, setGeoJSON] = useState<GeoJSON.FeatureCollection<GeoJSON.Point> | null>(null);
  const {
    currentStation,
    setStation,
    setStationList,
    setExploreLocation,
  } = useRadioStore();
  const stationsRef = useRef<Station[]>([]);
  const audioLayerRef = useRef<AudioReactiveLayer | null>(null);
  const flyingFromClickRef = useRef(false);

  // Load stations for globe
  useEffect(() => {
    async function loadStations() {
      try {
        const res = await fetch(
          "/api/stations?has_geo_info=true&hidebroken=true&limit=30000&order=clickcount&reverse=true"
        );
        const stations: Station[] = await res.json();
        stationsRef.current = stations;
        setGeoJSON(stationsToGeoJSON(stations));
      } catch (err) {
        console.error("Failed to load stations:", err);
      }
    }
    loadStations();
  }, []);

  // Make the map background transparent + refine light-mode Positron colors
  useEffect(() => {
    if (!isLoaded || !map) return;

    const tweakStyle = () => {
      try {
        const style = map.getStyle();
        if (!style?.layers) return;

        for (const layer of style.layers) {
          // Transparent background so Sky/Space shows through
          if (
            layer.type === "background" ||
            layer.id === "background" ||
            layer.id.startsWith("background")
          ) {
            map.setPaintProperty(layer.id, "background-color", "rgba(0,0,0,0)");
            map.setPaintProperty(layer.id, "background-opacity", 0);
            continue;
          }

          if (!isDark) {
            // Warm up water in light mode
            if (layer.id === "water" && layer.type === "fill") {
              map.setPaintProperty(layer.id, "fill-color", "#B8D8E8");
              continue;
            }

            // Warm up land-related fills (grays → warm cream/beige)
            if (layer.type === "fill") {
              const id = layer.id;
              if (id.startsWith("landcover")) {
                try {
                  const c = map.getPaintProperty(id, "fill-color");
                  if (typeof c === "string" && isGrayish(c)) {
                    map.setPaintProperty(id, "fill-color", warmTint(c));
                  }
                } catch {}
              } else if (id.startsWith("landuse")) {
                try {
                  const c = map.getPaintProperty(id, "fill-color");
                  if (typeof c === "string" && isGrayish(c)) {
                    map.setPaintProperty(id, "fill-color", warmTint(c));
                  }
                } catch {}
              } else if (id === "park" || id.startsWith("park")) {
                try {
                  map.setPaintProperty(id, "fill-color", "#D8EDD0");
                } catch {}
              }
            }

            // Soften road colors
            if (layer.type === "line" && layer.id.startsWith("road")) {
              try {
                const c = map.getPaintProperty(layer.id, "line-color");
                if (typeof c === "string" && isGrayish(c)) {
                  map.setPaintProperty(layer.id, "line-color", warmTint(c));
                }
              } catch {}
            }

            // Soften boundary lines
            if (layer.type === "line" && layer.id.startsWith("boundary")) {
              try {
                map.setPaintProperty(layer.id, "line-color", "rgba(120, 110, 100, 0.25)");
              } catch {}
            }

            // Warm up building fills
            if (layer.type === "fill" && layer.id.startsWith("building")) {
              try {
                map.setPaintProperty(layer.id, "fill-color", "#E8E2DA");
              } catch {}
            }
          }
        }
      } catch {
        // Style may not be ready
      }

      const canvas = map.getCanvas();
      if (canvas) {
        canvas.style.background = "transparent";
      }
    };

    tweakStyle();
    map.on("styledata", tweakStyle);

    return () => {
      map.off("styledata", tweakStyle);
    };
  }, [isLoaded, map, isDark]);

  // Add Three.js audio-reactive layer
  useEffect(() => {
    if (!isLoaded || !map) return;

    const layer = new AudioReactiveLayer();
    audioLayerRef.current = layer;

    try {
      map.addLayer(layer as unknown as maplibregl.CustomLayerInterface);
    } catch {
      // Layer may already exist on hot reload
    }

    return () => {
      try {
        if (map.getLayer("audio-reactive")) {
          map.removeLayer("audio-reactive");
        }
      } catch {}
      audioLayerRef.current = null;
    };
  }, [isLoaded, map]);

  // Sync theme to audio-reactive layer
  useEffect(() => {
    if (audioLayerRef.current) {
      audioLayerRef.current.setDarkMode(isDark);
    }
  }, [isDark]);

  // When currentStation changes, update audio layer position + genre hue
  useEffect(() => {
    if (!currentStation?.geo_lat || !currentStation?.geo_long) return;

    if (audioLayerRef.current) {
      audioLayerRef.current.setStationPosition(
        currentStation.geo_long,
        currentStation.geo_lat
      );
      audioLayerRef.current.setGenreHue(
        hexToHue(getGenreColor(currentStation.tags))
      );
    }

    if (flyingFromClickRef.current) {
      flyingFromClickRef.current = false;
      return;
    }

    if (map) {
      const currentCenter = map.getCenter();
      const dlat = currentStation.geo_lat - currentCenter.lat;
      const dlng = currentStation.geo_long - currentCenter.lng;
      const angularDist = Math.sqrt(dlat * dlat + dlng * dlng);
      const duration = Math.min(4000, Math.max(1500, angularDist * 30));

      map.flyTo({
        center: [currentStation.geo_long, currentStation.geo_lat],
        zoom: 7,
        pitch: 45,
        bearing: 0,
        duration,
        essential: true,
        curve: 1.5,
      });
    }
  }, [currentStation, map]);

  const handlePointClick = useCallback(
    (feature: GeoJSON.Feature<GeoJSON.Point>, coordinates: [number, number]) => {
      const props = feature.properties;
      if (!props) return;

      const station = stationsRef.current.find(
        (s) => s.stationuuid === props.stationuuid
      );
      if (!station) return;

      setExploreLocation(
        station.state || null,
        station.country || null,
        station.countrycode || null
      );

      flyingFromClickRef.current = true;
      setStation(station);

      const nearby = stationsRef.current
        .filter(
          (s) =>
            s.countrycode === station.countrycode &&
            s.stationuuid !== station.stationuuid
        )
        .slice(0, 50);
      setStationList([station, ...nearby], 0);

      map?.flyTo({
        center: coordinates,
        zoom: 7,
        pitch: 45,
        bearing: 0,
        duration: 2000,
        essential: true,
        curve: 1.2,
      });
    },
    [map, setStation, setStationList, setExploreLocation]
  );

  return (
    <>
      {geoJSON && (
        <MapClusterLayer
          data={geoJSON}
          clusterMaxZoom={8}
          clusterRadius={60}
          clusterColors={["#22c55e", "#eab308", "#ef4444"]}
          clusterThresholds={[50, 500]}
          pointColor="#3b82f6"
          onPointClick={handlePointClick}
        />
      )}
      {currentStation && currentStation.geo_lat && currentStation.geo_long && (
        <MapMarker
          longitude={currentStation.geo_long}
          latitude={currentStation.geo_lat}
        >
          <MarkerContent>
            <ReactiveMarker station={currentStation} />
          </MarkerContent>
        </MapMarker>
      )}
      <MapControls
        position="bottom-right"
        showZoom
        showLocate
        showCompass
        showFullscreen
        className="bottom-20 right-3"
      />
    </>
  );
}

export function RadioGlobe() {
  return (
    <Map
      className="h-full w-full"
      projection={{ type: "globe" }}
      center={[0, 20]}
      zoom={2}
      maxPitch={60}
      canvasContextAttributes={{ antialias: true, alpha: true }}
    >
      <GlobeContent />
    </Map>
  );
}
