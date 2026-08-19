import type { Restaurant } from "../types/restaurant";
import { googleMapsSearchUrl } from "../utils/csv";

interface RestaurantCardProps {
  restaurant: Restaurant;
  selected: boolean;
  onSelect: (restaurant: Restaurant) => void;
}

export default function RestaurantCard({ restaurant, selected, onSelect }: RestaurantCardProps) {
  const hasLocation = restaurant.lat !== null && restaurant.lng !== null;

  return (
    <div
      id={`card-${restaurant.id}`}
      className={`restaurant-card${selected ? " restaurant-card--selected" : ""}`}
      onClick={() => onSelect(restaurant)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onSelect(restaurant);
      }}
    >
      <div className="restaurant-card-header">
        <a
          className="restaurant-card-name"
          href={googleMapsSearchUrl(restaurant.name)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
        >
          {restaurant.name}
        </a>
        {!hasLocation && <span className="badge badge--muted">No map location</span>}
      </div>

      <div className="restaurant-card-tags">
        <span className="badge badge--neighborhood">{restaurant.neighborhood}</span>
        <span className="badge badge--type">{restaurant.type}</span>
        <span className="badge badge--price">{restaurant.price}</span>
      </div>

      {restaurant.remarks && <p className="restaurant-card-remarks">{restaurant.remarks}</p>}

      <div className="restaurant-card-actions">
        {hasLocation && (
          <button
            type="button"
            className="btn btn--ghost btn--small"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(restaurant);
            }}
          >
            📍 View on map
          </button>
        )}
        <a
          className="btn btn--ghost btn--small"
          href={googleMapsSearchUrl(restaurant.name)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
        >
          🔗 Google Maps
        </a>
      </div>
    </div>
  );
}
