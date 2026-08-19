import type { Restaurant } from "../types/restaurant";

// Published Google Sheet, exported as CSV via the gviz endpoint.
export const SHEET_CSV_URL =
  "https://docs.google.com/spreadsheets/d/1n-hqQO6TSDbK_mBBMKzMwUxBYnE6zElA46_3x6psPAM/gviz/tq?tqx=out:csv&sheet=CMU%20Food";

/**
 * Minimal RFC-4180-ish CSV parser that handles quoted fields, escaped
 * quotes (""), commas and newlines inside quoted fields. Good enough for
 * the Google Sheets CSV export we consume here.
 */
export function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (char === '"' && next === '"') {
        field += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (char === "\r") {
      // skip, \n handles the line break
    } else {
      field += char;
    }
  }

  // push any trailing field/row
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows.filter((r) => r.some((cell) => cell.trim().length > 0));
}

function parseCoordinates(raw: string): { lat: number | null; lng: number | null } {
  if (!raw || !raw.trim()) return { lat: null, lng: null };
  const parts = raw.split(",").map((p) => parseFloat(p.trim()));
  if (parts.length !== 2 || parts.some((p) => Number.isNaN(p))) {
    return { lat: null, lng: null };
  }
  return { lat: parts[0], lng: parts[1] };
}

const REQUIRED_HEADERS = ["Name", "Neighborhood", "Type", "Price", "Coordinates", "Remarks"];

export function rowsToRestaurants(rows: string[][]): Restaurant[] {
  if (rows.length === 0) return [];
  const header = rows[0].map((h) => h.trim());

  const idx = (name: string) => header.indexOf(name);
  const nameIdx = idx("Name");
  const neighborhoodIdx = idx("Neighborhood");
  const typeIdx = idx("Type");
  const priceIdx = idx("Price");
  const coordIdx = idx("Coordinates");
  const remarksIdx = idx("Remarks");

  const missing = REQUIRED_HEADERS.filter((h) => idx(h) === -1);
  if (missing.length > 0) {
    throw new Error(`Sheet is missing expected column(s): ${missing.join(", ")}`);
  }

  const restaurants: Restaurant[] = [];
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    const name = (r[nameIdx] ?? "").trim();
    if (!name) continue;

    const { lat, lng } = parseCoordinates((r[coordIdx] ?? "").trim());

    restaurants.push({
      id: `${name}-${i}`,
      name,
      neighborhood: (r[neighborhoodIdx] ?? "").trim() || "Unspecified",
      type: (r[typeIdx] ?? "").trim() || "Unspecified",
      price: (r[priceIdx] ?? "").trim() || "Unspecified",
      lat,
      lng,
      remarks: (r[remarksIdx] ?? "").trim(),
    });
  }

  return restaurants;
}

export async function fetchRestaurants(): Promise<Restaurant[]> {
  const res = await fetch(SHEET_CSV_URL, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to fetch spreadsheet (status ${res.status})`);
  }
  const text = await res.text();
  const rows = parseCSV(text);
  return rowsToRestaurants(rows);
}

export function googleMapsSearchUrl(name: string): string {
  return `https://www.google.com/maps/search/${encodeURIComponent(name)}`;
}
