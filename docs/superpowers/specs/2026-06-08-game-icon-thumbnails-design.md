# Game Icon Thumbnails Design

## Goal

Make the hub page feel richer by showing one square title icon for each hub game while keeping the site static and GitHub Pages friendly.

## Approved Approach

Use local game source assets first. A generator scans every folder listed in `docs/data/hub-games.json`, chooses the best existing image asset, crops it to a square, resizes it to `256x256`, and writes the result to `docs/assets/game-icons/`.

## Data Shape

Each hub game keeps the existing fields and gains one optional image field:

```json
{
  "number": 1,
  "title": "10 Ten!",
  "folder": "000001_10_Ten",
  "playPath": "hubgames/000001_10_Ten/index.html",
  "iconPath": "assets/game-icons/000001_10_Ten.png"
}
```

## Generator Rules

- Read `docs/data/hub-games.json`.
- Search inside `docs/hubgames/<folder>/` for local image assets.
- Prefer names such as `icon-256`, `loading-logo`, `logo`, `game_title`, `title`, `cover`, and `Build.jpg`.
- Crop center-square and resize to `256x256`.
- Generate a fallback title icon when no readable image exists.
- Update `iconPath` in metadata.

## Hub UI Rules

- Game cards show `iconPath` above game text.
- Missing icons fall back to `assets/hubmad.png`.
- Cards keep search, sort, play, and new-tab behavior unchanged.

## Testing

- Run the generator.
- Validate `docs/data/hub-games.json`.
- Confirm every `iconPath` file exists.
- Serve `docs/` and verify card images render from `http://localhost:13000/`.
