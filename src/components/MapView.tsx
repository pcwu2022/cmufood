import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import type { Restaurant } from "../types/restaurant";
import { googleMapsSearchUrl } from "../utils/csv";

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

interface MapViewProps {
  restaurants: Restaurant[];
  selected: Restaurant | null;
  onSelect: (restaurant: Restaurant) => void;
}

export default function MapView({ restaurants, selected, onSelect }: MapViewProps) {
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
      center={DEFAULT_CENTER}
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
      {withLocation.map((r) => (
        <Marker
          key={r.id}
          position={[r.lat as number, r.lng as number]}
          icon={selected?.id === r.id ? selectedMarkerIcon : markerIcon}
          ref={(el) => {
            markerRefs.current[r.id] = el;
          }}
          eventHandlers={{ click: () => onSelect(r) }}
        >
          <Popup>
            <strong>{r.name}</strong>
            <br />
            {r.neighborhood} · {r.type} · {r.price}
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
