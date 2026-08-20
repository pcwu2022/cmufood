import type { Restaurant } from "../types/restaurant";

export const LOCATION_UPDATE_INTERVAL = 60_000;
export const ONE_MILE_IN_KILOMETERS = 1.609344;
export const WITHIN_ONE_MILE_OPTION = "Within 1 mile";
const WALKING_SPEED_MILES_PER_HOUR = 3;

export interface UserLocation {
  lat: number;
  lng: number;
}

export function distanceInKilometers(
  first: UserLocation,
  second: UserLocation,
): number {
  const earthRadius = 6371;
  const latitudeDelta = ((second.lat - first.lat) * Math.PI) / 180;
  const longitudeDelta = ((second.lng - first.lng) * Math.PI) / 180;
  const latitudeOne = (first.lat * Math.PI) / 180;
  const latitudeTwo = (second.lat * Math.PI) / 180;
  const haversine =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(latitudeOne) * Math.cos(latitudeTwo) * Math.sin(longitudeDelta / 2) ** 2;

  return earthRadius * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
}

export function isWithinOneMile(restaurant: Restaurant, location: UserLocation): boolean {
  return (
    restaurant.lat !== null &&
    restaurant.lng !== null &&
    distanceInKilometers(location, { lat: restaurant.lat, lng: restaurant.lng }) <=
      ONE_MILE_IN_KILOMETERS
  );
}

export function formatDistanceAndWalk(
  restaurant: Restaurant,
  location: UserLocation,
): string | null {
  if (restaurant.lat === null || restaurant.lng === null) return null;

  const distanceInMiles =
    distanceInKilometers(location, { lat: restaurant.lat, lng: restaurant.lng }) / 1.609344;
  const walkingMinutes = Math.max(
    1,
    Math.round((distanceInMiles / WALKING_SPEED_MILES_PER_HOUR) * 60),
  );
  return `${distanceInMiles.toFixed(1)}mi (${walkingMinutes} min${walkingMinutes === 1 ? "" : "s"})`;
}