# CMU Food

A random food picker for spots around Carnegie Mellon University — filter by neighborhood, type,
and price, browse an interactive map, or just hit the dice button. Frontend-only, data pulled live
from a shared Google Sheet, hosted on GitHub Pages.

Inspired by [NTU Food](https://ntufood.com).

See [`spec.md`](./spec.md) for the full project spec.

## Getting started

```bash
npm install
npm run dev
```

## Editing the restaurant list

Data comes from the [CMU Food spreadsheet](https://docs.google.com/spreadsheets/d/1n-hqQO6TSDbK_mBBMKzMwUxBYnE6zElA46_3x6psPAM/edit?gid=0#gid=0),
tab `CMU Food`. Add a row with at least a `Name`, `Neighborhood`, `Type`, and `Price`. `Coordinates`
(as `lat, lng`) is optional — leave it blank if you don't have it and the restaurant will still show
up in the list, just not on the map. The app re-fetches the sheet on every page load, so there's no
redeploy needed after an edit.

## Deploying to GitHub Pages

```bash
npm run deploy
```

This builds the app and pushes `dist/` to the `gh-pages` branch via the `gh-pages` package. Make
sure the repo's GitHub Pages settings are pointed at the `gh-pages` branch. The site is configured
for `https://pcwu2022.github.io/cmufood` (see `homepage` in `package.json` and `base` in
`vite.config.ts`) — update both if you fork this under a different repo name or user.

Alternatively, `.github/workflows/deploy.yml` auto-builds and deploys on every push to `main` using
GitHub's native Pages Actions (set the repo's Pages source to "GitHub Actions" instead of a branch
if you use this route — no need to run `npm run deploy` by hand).

## Tech stack

React + TypeScript + Vite, react-leaflet/Leaflet + OpenStreetMap tiles for the map, no backend.
