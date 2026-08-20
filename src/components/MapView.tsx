import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap } from "react-leaflet";
import L from "leaflet";
import type { Restaurant } from "../types/restaurant";
import { googleMapsSearchUrl } from "../utils/csv";
import { formatDistanceAndWalk, isWithinOneMile, type UserLocation } from "../utils/location";

// Default Leaflet marker icons reference bundled assets in a way that
// breaks under Vite. Point them at the CDN copies instead.
const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const selectedMarkerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [32, 52],
  iconAnchor: [16, 52],
  popupAnchor: [1, -42],
  shadowSize: [52, 52],
  className: "marker-selected",
});

const nearbyMarkerIcon = new L.Icon({
  ...markerIcon.options,
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  className: "marker-nearby",
});

const userLocationIcon = L.divIcon({
  className: "user-location-marker",
  html: '<span aria-hidden="true"></span>',
  iconSize: [22, 22],
  iconAnchor: [11, 11],
});

// Pittsburgh / CMU campus
const DEFAULT_CENTER: [number, number] = [40.4433, -79.9436];
const DEFAULT_ZOOM = 14;

interface FlyToControllerProps {
  restaurant: Restaurant | null;
}

function FlyToController({ restaurant }: FlyToControllerProps) {
  const map = useMap();

  useEffect(() => {
    if (restaurant && restaurant.lat !== null && restaurant.lng !== null) {
      map.flyTo([restaurant.lat, restaurant.lng], 17, { duration: 0.8 });
    }
  }, [restaurant, map]);

  return null;
}

function MapSizeController() {
  const map = useMap();

  useEffect(() => {
    const container = map.getContainer();
    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize({ pan: false });
    });

    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, [map]);

  return null;
}

function LocationViewController({
  location,
  restaurants,
}: {
  location: UserLocation | null;
  restaurants: Restaurant[];
}) {
  const map = useMap();

  useEffect(() => {
    if (!location) return;
    const nearby = restaurants.filter((restaurant) => isWithinOneMile(restaurant, location));
    const points: L.LatLngExpression[] = [
      [location.lat, location.lng],
      ...nearby.map(
        (restaurant): L.LatLngTuple => [restaurant.lat as number, restaurant.lng as number],
      ),
    ];

    if (points.length === 1) {
      map.flyTo(points[0], 15, { duration: 0.8 });
    } else {
      map.fitBounds(L.latLngBounds(points), { padding: [24, 24], maxZoom: 15, animate: true });
    }
  }, [location, restaurants, map]);

  return null;
}

interface MapViewProps {
  restaurants: Restaurant[];
  selected: Restaurant | null;
  onSelect: (restaurant: Restaurant) => void;
  userLocation: UserLocation | null;
}

export default function MapView({ restaurants, selected, onSelect, userLocation }: MapViewProps) {
  const markerRefs = useRef<Record<string, L.Marker | null>>({});

  const withLocation = restaurants.filter((r) => r.lat !== null && r.lng !== null);

  useEffect(() => {
    if (selected) {
      const marker = markerRefs.current[selected.id];
      marker?.openPopup();
    }
  }, [selected]);

  return (
    <MapContainer
      center={userLocation ? [userLocation.lat, userLocation.lng] : DEFAULT_CENTER}
      zoom={DEFAULT_ZOOM}
      className="map-container"
      scrollWheelZoom
    >
    <MapSizeController />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FlyToController restaurant={selected} />
      <LocationViewController location={userLocation} restaurants={restaurants} />
      {userLocation && (
        <Marker position={[userLocation.lat, userLocation.lng]} icon={userLocationIcon}>
          <Popup>You are here</Popup>
        </Marker>
      )}
      {withLocation.map((r) => (
        <Marker
          key={r.id}
          position={[r.lat as number, r.lng as number]}
          icon={selected?.id === r.id ? selectedMarkerIcon : userLocation && isWithinOneMile(r, userLocation) ? nearbyMarkerIcon : markerIcon}
          ref={(el) => {
            markerRefs.current[r.id] = el;
          }}
          eventHandlers={{ click: () => onSelect(r) }}
        >
          {userLocation && (
            <Tooltip>{formatDistanceAndWalk(r, userLocation) ?? "No walking distance"}</Tooltip>
          )}
          <Popup>
            <strong>{r.name}</strong>
            <br />
            {r.neighborhood} · {r.type} · {r.price}
            {userLocation && (
              <>
                <br />
                {formatDistanceAndWalk(r, userLocation) ?? "No walking distance"}
              </>
            )}
            <br />
            <a href={googleMapsSearchUrl(r.name)} target="_blank" rel="noopener noreferrer">
              Open in Google Maps
            </a>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
