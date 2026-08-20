import { useEffect, useMemo, useState } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import FilterBar from "./components/FilterBar";
import RandomPicker from "./components/RandomPicker";
import RestaurantCard from "./components/RestaurantCard";
import MapView from "./components/MapView";
import { fetchRestaurants } from "./utils/csv";
import type { FilterState, Restaurant } from "./types/restaurant";
import { emptyFilterState } from "./types/restaurant";
import {
  distanceInKilometers,
  isWithinOneMile,
  LOCATION_UPDATE_INTERVAL,
  WITHIN_ONE_MILE_OPTION,
  type UserLocation,
} from "./utils/location";
import "./App.css";

function uniqueSorted(values: string[]): string[] {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b));
}

export default function App() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>(emptyFilterState());
  const [selected, setSelected] = useState<Restaurant | null>(null);
  const [mapOpenMobile, setMapOpenMobile] = useState(false);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [randomOrder, setRandomOrder] = useState<Record<string, number>>({});

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchRestaurants()
      .then((data) => {
        if (cancelled) return;
        setRestaurants(data);
        setRandomOrder(
          Object.fromEntries(data.map((restaurant) => [restaurant.id, Math.random()])),
        );
        setError(null);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Failed to load restaurant data.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) return;

    const updateLocation = () => {
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => setUserLocation({ lat: coords.latitude, lng: coords.longitude }),
        () => undefined,
        { enableHighAccuracy: true, maximumAge: 30_000, timeout: 15_000 },
      );
    };

    updateLocation();
    const intervalId = window.setInterval(updateLocation, LOCATION_UPDATE_INTERVAL);
    return () => window.clearInterval(intervalId);
  }, []);

  const neighborhoods = useMemo(() => {
    const sortedNeighborhoods = uniqueSorted(restaurants.map((r) => r.neighborhood));
    return userLocation ? [WITHIN_ONE_MILE_OPTION, ...sortedNeighborhoods] : sortedNeighborhoods;
  }, [restaurants, userLocation]);
  const types = useMemo(() => uniqueSorted(restaurants.map((r) => r.type)), [restaurants]);
  const prices = useMemo(() => uniqueSorted(restaurants.map((r) => r.price)), [restaurants]);

  const filtered = useMemo(() => {
    return restaurants.filter((r) => {
      if (filters.neighborhoods !== null) {
        const wantsNearby = filters.neighborhoods.has(WITHIN_ONE_MILE_OPTION);
        const selectedNeighborhoods = [...filters.neighborhoods].filter(
          (neighborhood) => neighborhood !== WITHIN_ONE_MILE_OPTION,
        );
        if (wantsNearby && (!userLocation || !isWithinOneMile(r, userLocation))) {
          return false;
        }
        if (
          selectedNeighborhoods.length > 0 &&
          !selectedNeighborhoods.includes(r.neighborhood)
        ) {
          return false;
        }
        if (!wantsNearby && selectedNeighborhoods.length === 0) {
          return false;
        }
      }
      if (filters.types !== null && !filters.types.has(r.type)) {
        return false;
      }
      if (filters.prices !== null && !filters.prices.has(r.price)) {
        return false;
      }
      return true;
    });
  }, [restaurants, filters, userLocation]);

  const orderedFiltered = useMemo(() => {
    const ordered = [...filtered].sort((first, second) => {
      if (userLocation) {
        const firstDistance =
          first.lat !== null && first.lng !== null
            ? distanceInKilometers(userLocation, { lat: first.lat, lng: first.lng })
            : Number.POSITIVE_INFINITY;
        const secondDistance =
          second.lat !== null && second.lng !== null
            ? distanceInKilometers(userLocation, { lat: second.lat, lng: second.lng })
            : Number.POSITIVE_INFINITY;
        return firstDistance - secondDistance;
      }
      return (randomOrder[first.id] ?? 0) - (randomOrder[second.id] ?? 0);
    });

    if (!selected || !ordered.some((restaurant) => restaurant.id === selected.id)) {
      return ordered;
    }
    return [selected, ...ordered.filter((restaurant) => restaurant.id !== selected.id)];
  }, [filtered, randomOrder, selected, userLocation]);

  const handleSelect = (restaurant: Restaurant) => {
    setSelected(restaurant);
    setMapOpenMobile(true);
  };

  return (
    <div className="app-shell">
      <Header />

      <main className="app-main">
        <div className="controls-row">
          <FilterBar
            neighborhoods={neighborhoods}
            types={types}
            prices={prices}
            filters={filters}
            onChange={setFilters}
          />
          <RandomPicker restaurants={filtered} onPick={handleSelect} />
        </div>

        {loading && <p className="status-message">Loading restaurants…</p>}
        {error && (
          <p className="status-message status-message--error">
            {error} Please try refreshing the page.
          </p>
        )}

        {!loading && !error && (
          <div className="content-grid">
            <section
              className={`map-panel${mapOpenMobile ? " map-panel--mobile-open" : ""}`}
              aria-label="Map of food options"
            >
              <button
                type="button"
                className="map-panel-mobile-toggle"
                onClick={() => setMapOpenMobile((v) => !v)}
              >
                {mapOpenMobile ? "▼ Hide map" : "▲ Show map"}
              </button>
              <div className="map-panel-body">
                <MapView
                  restaurants={filtered}
                  selected={selected}
                  onSelect={handleSelect}
                  userLocation={userLocation}
                />
              </div>
            </section>

            <section className="list-panel" aria-label="List of food options">
              {filtered.length === 0 ? (
                <p className="status-message">No restaurants match the current filters.</p>
              ) : (
                <div className="restaurant-list">
                  {orderedFiltered.map((r) => (
                    <RestaurantCard
                      key={r.id}
                      restaurant={r}
                      selected={selected?.id === r.id}
                      onSelect={handleSelect}
                      userLocation={userLocation}
                    />
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
