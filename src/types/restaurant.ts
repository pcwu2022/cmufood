export interface Restaurant {
  id: string;
  name: string;
  neighborhood: string;
  type: string;
  price: string;
  lat: number | null;
  lng: number | null;
  remarks: string;
}

export interface FilterState {
  neighborhoods: Set<string> | null;
  types: Set<string> | null;
  prices: Set<string> | null;
}

export const emptyFilterState = (): FilterState => ({
  neighborhoods: null,
  types: null,
  prices: null,
});
