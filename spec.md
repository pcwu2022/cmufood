# CMU Food — Spec

A frontend-only random food picker for the Carnegie Mellon University area, in the spirit of
[NTU Food](https://ntufood.com). Built with React + TypeScript + Vite, hosted on GitHub Pages,
data sourced live from a shared Google Sheet.

- Repo: `github.com/pcwu2022/cmufood`
- Live site: `https://pcwu2022.github.io/cmufood`
- Data sheet: [CMU Food collaboration spreadsheet](https://docs.google.com/spreadsheets/d/1n-hqQO6TSDbK_mBBMKzMwUxBYnE6zElA46_3x6psPAM/edit?gid=0#gid=0)

## 1. Goals

1. Let a user filter the list of nearby food options and get a random suggestion.
2. Let a user browse food options as a list and on a map at the same time.
3. Require zero backend — all data is read client-side from a published Google Sheet, and the
   whole thing is a static bundle deployable to GitHub Pages.
4. Work well as the primary use case: someone on their phone, standing outside, deciding where
   to eat right now.

## 2. Functional requirements

| # | Requirement | Where it's implemented |
|---|---|---|
| 1 | Random selection, respecting active filters | `RandomPicker.tsx` picks uniformly at random from the currently filtered list |
| 2 | Filter by Neighborhood, Type, and Price, each multi-select | `FilterBar.tsx` + `MultiSelectFilter.tsx` |
| 3 | Each filter has an "All" option | `MultiSelectFilter.tsx` — `null` means "no restriction"; the "All" checkbox can clear every option |
| 4 | Interactive map with markers for listed options | `MapView.tsx`, `react-leaflet` + OpenStreetMap tiles |
| 5 | Cards list food options; clicking a card pans/zooms the map to it | `RestaurantCard.tsx` (click) → `App.tsx` `handleSelect` → `MapView.tsx`'s `FlyToController` |
| 6 | Restaurants without coordinates are omitted from the map (but still listed as cards) | `MapView.tsx` filters to `restaurants` with non-null `lat`/`lng`; card shows a "No map location" badge instead |
| 7 | Card has a link to `https://www.google.com/maps/search/{name}` | `googleMapsSearchUrl()` in `utils/csv.ts`, used by the restaurant name link and the "Google Maps" button |
| 8 | Footer fine print about map accuracy + creator credit | `Footer.tsx` |
| 9 | Button linking to the collaboration spreadsheet | `Header.tsx` "Add Restaurants" button |
| 10 | Button linking to the GitHub repo | `Header.tsx` "GitHub" button |
| 11 | Mobile-first, installable to a phone home screen | Mobile-first CSS (`App.css`), collapsible map panel on small screens, `manifest.json` + Apple/mobile meta tags in `index.html` for "Add to Home Screen" |
| 12 | CMU color palette (red / white / black / grey) | CSS custom properties in `index.css` (`--cmu-red: #c41230`, etc.) |

## 3. Data source & schema

Data lives in a Google Sheet, tab `CMU Food`, and is fetched at runtime as CSV via the Google
Visualization API export endpoint (no API key required):

```
https://docs.google.com/spreadsheets/d/1n-hqQO6TSDbK_mBBMKzMwUxBYnE6zElA46_3x6psPAM/gviz/tq?tqx=out:csv&sheet=CMU%20Food
```

Expected columns (header row, order does not matter — looked up by name):

| Column | Required | Notes |
|---|---|---|
| `Name` | Yes | Row is skipped if blank |
| `Neighborhood` | Yes | Free text; sheet uses a dropdown to keep values consistent. Falls back to `"Unspecified"` if blank |
| `Type` | Yes | Same as above (cuisine / venue type) |
| `Price` | Yes | Same as above (e.g. `Under $15`, `$15 - $30`, …) — treated as a category, not parsed as a number |
| `Coordinates` | No | `"lat, lng"` as plain text, e.g. `40.4433, -79.9436`. Blank ⇒ no map marker |
| `Remarks` | No | Free text shown on the card if present |

Because `Neighborhood`, `Type`, and `Price` are spreadsheet dropdowns that editors can change over
time, the app does **not** hardcode their possible values. Filter options are derived at runtime
from whatever values are actually present in the fetched data (`App.tsx`, via `uniqueSorted`).

CSV parsing (`utils/csv.ts`) is a small hand-written parser that supports quoted fields, escaped
`""` quotes, and commas/newlines inside quoted fields — sufficient for the Google Sheets CSV
export.

## 4. Filtering & random pick semantics

- Filter state is three `Set<string> | null` values — one per column. **`null` = "All"** (no
  filter applied on that column). A set restricts results to values in that set, including an
  empty set, which matches no results.
- A restaurant passes if, for each of the three columns, the column's filter is `null` or the
  restaurant's value is a member of the set.
- The random picker (`RandomPicker.tsx`) always draws from the currently *filtered* list — filters
  are applied before randomness, so "give me a random cheap Squirrel Hill place" is expressible by
  filtering to Squirrel Hill + `Under $15` and then hitting the dice button.
- Picking (via card click, map marker click, or the random button) sets the same `selected` state
  in `App.tsx`, which the map reads to fly to that restaurant and highlight its marker, and which
  the card list reads to highlight the matching card.

## 5. Map behavior

- Built with `react-leaflet` + `leaflet`, tiles from the public OpenStreetMap tile server (same as
  NTU Food, which also uses Leaflet/OSM — no API key required).
- Default view centers on the CMU campus (`40.4433, -79.9436`) at zoom 14.
- Only restaurants with valid, parseable coordinates get a marker. Coordinates that are blank or
  fail to parse as two numbers are treated as "no location" — those restaurants are simply excluded
  from the map's marker set (requirement #6), not shown with a placeholder pin.
- Selecting a restaurant (from a card, the random button, or another marker) calls
  `map.flyTo([lat, lng], 17)`. The selected marker renders slightly larger and its popup opens
  automatically.
- Marker icons are loaded from the `unpkg` CDN copy of Leaflet's default marker images, since
  Vite's bundling of Leaflet's own bundled image URLs is unreliable.

## 6. Mobile-first / installable

- Layout is written mobile-first: a single column (map above list) that only becomes a two-column
  sticky-map layout at `min-width: 900px` (`App.css`).
- On small screens the map starts collapsed behind a "▲ Show map" toggle to keep the list above the
  fold; selecting any restaurant auto-expands it.
- `index.html` includes a `manifest.json`, `theme-color`, and Apple/`mobile-web-app` meta tags so
  the site can be added to a phone's home screen and launches full-screen like an installed app.

## 7. Tech stack

- **React 19 + TypeScript**, built with **Vite**.
- **react-leaflet** / **leaflet** for the map, OpenStreetMap tiles.
- No UI framework/component library — hand-rolled CSS using CSS custom properties for the CMU
  palette (`#c41230` red, black, greys, white).
- No backend, no build-time data fetching — the CSV is fetched client-side on every page load, so
  edits to the Google Sheet show up on refresh with no redeploy needed.
- **gh-pages** npm package for deployment (`npm run deploy` → pushes `dist/` to the `gh-pages`
  branch). `vite.config.ts` sets `base: "/cmufood/"` to match the GitHub Pages project-site path.

## 8. Project structure

```
cmufood/
├── index.html
├── vite.config.ts
├── package.json
├── public/
│   ├── manifest.json
│   ├── favicon.png / icon-192.png / icon-512.png / apple-touch-icon.png
├── src/
│   ├── main.tsx              # entry point, imports leaflet.css
│   ├── App.tsx                # data fetching, filter state, layout
│   ├── App.css / index.css    # styling (CMU palette, mobile-first)
│   ├── types/restaurant.ts    # Restaurant + FilterState types
│   ├── utils/csv.ts           # CSV fetch + parse, google maps url helper
│   └── components/
│       ├── Header.tsx
│       ├── Footer.tsx
│       ├── FilterBar.tsx
│       ├── MultiSelectFilter.tsx
│       ├── RandomPicker.tsx
│       ├── RestaurantCard.tsx
│       └── MapView.tsx
└── spec.md                    # this file
```

## 9. Non-goals / out of scope (for now)

- No accounts, no server-side persistence — editing data means editing the Google Sheet directly.
- No offline support beyond what "Add to Home Screen" gives for free (no service worker/cache-first
  strategy).
- No automated geocoding — `Coordinates` must be filled in by hand in the sheet; blank coordinates
  are a supported, expected state (see requirement #6) rather than an error.

## 10. Possible future work

- Cache the last successful fetch in `localStorage` so the app still shows something if the sheet
  is briefly unreachable.
- "Copy shareable link" that encodes current filters in the URL.
- Distance-from-me sort/filter using the browser Geolocation API.
