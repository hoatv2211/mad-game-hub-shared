# Project Format

This document defines the standard format for this repository in showcase-only mode.

## Core Principles
- Showcase-first: each sample page should clearly present gameplay and learning value.
- Link-driven: source code and demos are external references.
- Portfolio-ready: metadata and sample pages must stay consistent and easy to scan.

## Repository Structure
```text
mad-game-hub-shared/
  docs/
    index.html
    ShareNNN_GameName.html
    data/
      games.json
    PROJECT_FORMAT.md
```

Notes:
- This repository does not host Unity project source folders.
- Source and demo links are maintained as external references in metadata and sample pages.

## Sample Naming
Use this exact convention:

`ShareNNN_GameName`

Rules:
- `NNN` is zero-padded and incremental.
- `GameName` uses PascalCase with no spaces.

## Required Files Per Sample
Each showcase entry should include:
- A game object in `docs/data/games.json`
- A sample detail page in `docs/` (for example `docs/Share002_PixelShooter3D.html`)
- External links for `sourceRepo` and optionally `liveDemo`

## Required Metadata Fields
Each game in `docs/data/games.json` should include:
- `id`, `number`, `title`, `slug`
- `genre`, `difficulty`, `status`
- `description`, `learningOutcomes`
- `links.sampleDoc`, `links.sourceRepo`, `links.liveDemo`

## Documentation Rules
- Link to existing docs instead of duplicating long text.
- Keep setup instructions short and actionable.
- Update nearby docs and metadata in the same PR.

## Asset And File Hygiene
- Do not commit unnecessary generated artifacts.
- Keep showcase assets scoped to the repository asset folders.
- Prefer lightweight placeholder assets for learning examples.

## Review Criteria
A showcase entry is considered ready when:
- `games.json` contains complete and valid metadata.
- Sample page exists and matches metadata.
- External source and demo links are valid.
- Naming conventions are respected.
