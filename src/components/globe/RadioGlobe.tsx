"use client";

import { useEffect, useState, useCallback, useRef } from "react";
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

function GlobeContent() {
  const { map, isLoaded } = useMap();
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

  // When currentStation changes (from any source), update the audio layer
  // position and fly the globe to the station's location.
  useEffect(() => {
    if (!currentStation?.geo_lat || !currentStation?.geo_long) return;

    if (audioLayerRef.current) {
      audioLayerRef.current.setStationPosition(
        currentStation.geo_long,
        currentStation.geo_lat
      );
    }

    // Skip the flyTo if triggered by a globe click (it already called flyTo)
    if (flyingFromClickRef.current) {
      flyingFromClickRef.current = false;
      return;
    }

    if (map) {
      map.flyTo({
        center: [currentStation.geo_long, currentStation.geo_lat],
        zoom: Math.max(map.getZoom(), 5),
        duration: 2000,
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

      // Mark that this change originated from a globe click so the
      // currentStation effect skips its own flyTo (we do it here with
      // the exact click coordinates for better accuracy).
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
        zoom: Math.max(map.getZoom(), 6),
        duration: 1500,
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
            <div className="relative flex items-center justify-center">
              <div
                className="absolute h-8 w-8 rounded-full animate-ping opacity-40"
                style={{
                  backgroundColor: getGenreColor(currentStation.tags),
                  animationDuration: "1.5s",
                }}
              />
              <div
                className="relative h-4 w-4 rounded-full border-2 border-white shadow-lg"
                style={{
                  backgroundColor: getGenreColor(currentStation.tags),
                  boxShadow: `0 0 12px ${getGenreColor(currentStation.tags)}`,
                }}
              />
            </div>
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
      theme="dark"
      projection={{ type: "globe" }}
      center={[0, 20]}
      zoom={2}
      maxPitch={60}
      canvasContextAttributes={{ antialias: true }}
    >
      <GlobeContent />
    </Map>
  );
}
