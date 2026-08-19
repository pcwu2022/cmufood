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

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchRestaurants()
      .then((data) => {
        if (cancelled) return;
        setRestaurants(data);
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

  const neighborhoods = useMemo(
    () => uniqueSorted(restaurants.map((r) => r.neighborhood)),
    [restaurants],
  );
  const types = useMemo(() => uniqueSorted(restaurants.map((r) => r.type)), [restaurants]);
  const prices = useMemo(() => uniqueSorted(restaurants.map((r) => r.price)), [restaurants]);

  const filtered = useMemo(() => {
    return restaurants.filter((r) => {
      if (filters.neighborhoods !== null && !filters.neighborhoods.has(r.neighborhood)) {
        return false;
      }
      if (filters.types !== null && !filters.types.has(r.type)) {
        return false;
      }
      if (filters.prices !== null && !filters.prices.has(r.price)) {
        return false;
      }
      return true;
    });
  }, [restaurants, filters]);

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
                <MapView restaurants={filtered} selected={selected} onSelect={handleSelect} />
              </div>
            </section>

            <section className="list-panel" aria-label="List of food options">
              {filtered.length === 0 ? (
                <p className="status-message">No restaurants match the current filters.</p>
              ) : (
                <div className="restaurant-list">
                  {filtered.map((r) => (
                    <RestaurantCard
                      key={r.id}
                      restaurant={r}
                      selected={selected?.id === r.id}
                      onSelect={handleSelect}
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
