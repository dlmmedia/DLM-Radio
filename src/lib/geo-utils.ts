import type { Station } from "./types";

const R = 6371; // Earth radius in km

export function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

export function getNearbyStations(
  station: Station,
  allStations: Station[],
  radiusKm: number = 200,
  limit: number = 20
): Station[] {
  if (!station.geo_lat || !station.geo_long) return [];

  return allStations
    .filter(
      (s) =>
        s.stationuuid !== station.stationuuid &&
        s.geo_lat != null &&
        s.geo_long != null
    )
    .map((s) => ({
      station: s,
      distance: haversineDistance(station.geo_lat!, station.geo_long!, s.geo_lat!, s.geo_long!),
    }))
    .filter((s) => s.distance <= radiusKm)
    .sort((a, b) => a.distance - b.distance)
    .slice(0, limit)
    .map((s) => s.station);
}

export function stationsToGeoJSON(stations: Station[]): GeoJSON.FeatureCollection<GeoJSON.Point> {
  return {
    type: "FeatureCollection",
    features: stations
      .filter((s) => s.geo_lat != null && s.geo_long != null)
      .map((s) => ({
        type: "Feature" as const,
        geometry: {
          type: "Point" as const,
          coordinates: [s.geo_long!, s.geo_lat!],
        },
        properties: {
          stationuuid: s.stationuuid,
          name: s.name,
          tags: s.tags,
          country: s.country,
          countrycode: s.countrycode,
          state: s.state,
          codec: s.codec,
          bitrate: s.bitrate,
          votes: s.votes,
          clickcount: s.clickcount,
          favicon: s.favicon,
          url_resolved: s.url_resolved,
          url: s.url,
          homepage: s.homepage,
          language: s.language,
          lastcheckok: s.lastcheckok,
        },
      })),
  };
}
