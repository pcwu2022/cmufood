import MultiSelectFilter from "./MultiSelectFilter";
import type { FilterState } from "../types/restaurant";
import { WITHIN_ONE_MILE_OPTION } from "../utils/location";

interface FilterBarProps {
  neighborhoods: string[];
  types: string[];
  prices: string[];
  filters: FilterState;
  onChange: (filters: FilterState) => void;
}

export default function FilterBar({
  neighborhoods,
  types,
  prices,
  filters,
  onChange,
}: FilterBarProps) {
  const anyActive =
    filters.neighborhoods !== null || filters.types !== null || filters.prices !== null;

  return (
    <div className="filter-bar">
      <MultiSelectFilter
        label="Neighborhood"
        options={neighborhoods}
        selected={filters.neighborhoods}
        exclusiveOptions={[WITHIN_ONE_MILE_OPTION]}
        onChange={(next) => onChange({ ...filters, neighborhoods: next })}
      />
      <MultiSelectFilter
        label="Type"
        options={types}
        selected={filters.types}
        onChange={(next) => onChange({ ...filters, types: next })}
      />
      <MultiSelectFilter
        label="Price"
        options={prices}
        selected={filters.prices}
        onChange={(next) => onChange({ ...filters, prices: next })}
      />
      {anyActive && (
        <button
          type="button"
          className="btn btn--ghost btn--small filter-clear"
          onClick={() => onChange({ neighborhoods: null, types: null, prices: null })}
        >
          ✕ Clear filters
        </button>
      )}
    </div>
  );
}
