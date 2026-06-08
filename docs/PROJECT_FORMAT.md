# Project Format

This document defines the standard format for this repository as a GitHub Pages game hub and source-sharing archive.

## Purpose

This repository has two jobs:

- Showcase games in a clean browser hub.
- Share unpacked game sources so each game can be opened, inspected, and played from the repository.

The hub is not a package manager and does not require a build step. Keep the structure simple, static, and friendly for browsing on GitHub Pages.

## Core Principles

- Hub-first: `docs/index.html` is the main entry point for players and viewers.
- Source-sharing: playable game folders live in `docs/hubgames/`.
- Static hosting: everything under `docs/` must work on GitHub Pages.
- Metadata-driven: the hub reads game entries from `docs/data/hub-games.json`.
- Low maintenance: avoid build tools, generated binaries, and large unused files.

## Repository Structure

```text
mad-game-hub-shared/
  docs/
    index.html
    PROJECT_FORMAT.md
    assets/
      hubmad.png
    data/
      hub-games.json
    hubgames/
      000001_10_Ten/
        index.html
        ...game source files
      000002_2-3-4_Player_Games/
        index.html
        ...game source files
  README.md
  README.VN.md
  AGENTS.md
  run.bat
```

Notes:

- `docs/` is the GitHub Pages root.
- `docs/index.html` should use relative paths only.
- `run.bat` serves `docs/` locally on port `13000`.
- Do not keep original `.zip` archives after sources are unpacked unless there is a clear reason.

## Game Folder Naming

Use this folder convention:

`NNNNNN_Game_Name`

Rules:

- `NNNNNN` is zero-padded and incremental.
- `Game_Name` uses readable words separated by underscores.
- Folder names must stay stable after publishing, because hub links depend on them.
- Each game folder must contain its own `index.html`.

Example:

```text
docs/hubgames/000002_2-3-4_Player_Games/index.html
```

## Required Files Per Game

Each game entry should include:

- A folder in `docs/hubgames/`.
- A playable `index.html` inside that folder.
- Any assets, scripts, and style files needed by that game.
- A metadata object in `docs/data/hub-games.json`.

## Required Metadata Fields

Each game in `docs/data/hub-games.json` must include:

- `number`: numeric display/order value.
- `title`: human-readable game title.
- `folder`: exact folder name under `docs/hubgames/`.
- `playPath`: relative path from `docs/` to the game entry HTML.

Example:

```json
{
  "number": 1,
  "title": "10 Ten!",
  "folder": "000001_10_Ten",
  "playPath": "hubgames/000001_10_Ten/index.html"
}
```

Do not add `sourceZip` to metadata. The shared source is the unpacked game folder.

## Hub Page Rules

- Load metadata from `data/hub-games.json`.
- Build game links from `playPath`.
- Keep paths relative so the hub works locally and on GitHub Pages.
- Keep UI text short and scan-friendly.
- Preserve search/filter behavior when editing the hub.

## Documentation Rules

- Update `README.md` and `README.VN.md` when structure or run steps change.
- Link to this file for format rules instead of duplicating long explanations.
- Keep instructions short enough for beginners to follow.
- Use English in `README.md` and Vietnamese in `README.VN.md`.

## Asset And File Hygiene

- Keep shared hub assets in `docs/assets/`.
- Keep game-specific assets inside that game's folder.
- Avoid committing duplicate archives, temporary files, build caches, or unrelated generated files.
- Do not rename published game folders unless metadata and links are updated in the same change.

## Review Criteria

A game entry is ready when:

- `docs/data/hub-games.json` contains complete metadata.
- `docs/hubgames/<folder>/index.html` exists.
- `playPath` opens the correct game from the hub.
- The game works from `http://localhost:13000/`.
- Folder names and metadata stay consistent.
