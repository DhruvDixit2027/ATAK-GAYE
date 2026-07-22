# Atak Gaye Frontend — Setup

## 1. Create the app (agar abhi tak nahi kiya)
```
npx create-react-app atak-gaye-frontend
cd atak-gaye-frontend
```

## 2. Install Tailwind
```
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

## 3. Copy these files in
- `tailwind.config.js` → project root (overwrite the default)
- `src/index.css` → overwrite existing
- `src/App.jsx` → overwrite existing (rename `src/App.js` to `.jsx`, or just point CRA to it — see note below)
- `src/context/AppContext.jsx` → new folder
- `src/components/*.jsx` → new folder
- `src/data/helperPool.js` → new folder

**Note on file extensions:** CRA's default template ships `.js` files. If you keep `App.js`, either rename the import in `src/index.js` to `./App` (works either way since both `.js` and `.jsx` resolve), or just delete `src/App.js` and use this `App.jsx` — CRA resolves both extensions automatically, no config change needed.

## 4. Run it
```
npm start
```

## What's wired up
- `AppContext` holds `screen`, `selectedIssue`, `winner`, and `toast` — this replaces the prototype's `goTo()` / `showToast()` global functions, no prop drilling needed.
- `helperPool.js` is the AI matching engine (`scoreHelper`, `getRankedCandidates`) — pure JS, easy to swap for a real backend call later (Person 2/3's API can just replace `getRankedCandidates`).
- All screen transitions, animations (SOS pulse rings, AI scan bars, tracking dot movement, star rating) are preserved 1:1 from the HTML prototype.
- Hindi text uses the `font-hindi` Tailwind class (Noto Sans Devanagari).

## Next for you (Person 1)
- Hook up real geolocation for the map card instead of the static SVG path.
- Once Person 2/3 have an API, swap `getRankedCandidates()` for a `fetch` call and keep the same shape (`matchPercent`, `distScore`, etc.) so the UI doesn't need to change.
