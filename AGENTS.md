# AGENTS.md

## Purpose
This file is the primary instruction source for coding agents working in this repository.

This repository is a GitHub Pages-ready game hub and portfolio showcase. It hosts a static public site, playable browser game builds, shared web assets, and metadata for Unity learning samples.

Primary goals for agents:
- Keep the hub easy to run, publish, browse, and maintain.
- Preserve clear metadata for hub games and Unity showcase samples.
- Keep the project static and lightweight unless the user explicitly asks otherwise.
- Update documentation together with structural, metadata, or workflow changes.

## Project Context
- Main project overview: [README.md](README.md)
- Vietnamese overview: [README.VN.md](README.VN.md)
- Showcase format rules: [docs/PROJECT_FORMAT.md](docs/PROJECT_FORMAT.md)
- Contribution workflow: [CONTRIBUTING.md](CONTRIBUTING.md)
- Local preview command: [run.bat](run.bat)

Recommended local URL:

```text
http://localhost:13000/
```

Recommended GitHub Pages source:

```text
Branch: main
Folder: /docs
```

## Repository Structure
```text
mad-game-hub-shared/
  README.md
  README.VN.md
  run.bat
  AGENTS.md
  CONTRIBUTING.md
  docs/
    index.html
    PROJECT_FORMAT.md
    assets/
      hubmad.png
    hubgames/
      <game-folder>/
        index.html
    ShareNNN_GameName.html
    data/
      games.json
      hub-games.json
```

## Static Site Rules
- Treat `docs/` as the published site root.
- Keep paths relative to `docs/` so local preview and GitHub Pages use the same links.
- Keep `docs/index.html` dependency-light: plain HTML, CSS, JavaScript, and JSON.
- Do not introduce Node, build tools, or package managers unless the user explicitly requests them.
- Shared assets required by the live site should live under `docs/assets/`.

## Hub Game Rules
Hub games live in:

```text
docs/hubgames/
```

Hub game catalog lives in:

```text
docs/data/hub-games.json
```

Each hub game entry should keep:
- `number`
- `title`
- `folder`
- `playPath` using `hubgames/<folder>/index.html`

When adding or changing hub games:
- Confirm every game folder has a root `index.html`.
- Keep folder names and `playPath` values aligned.
- Do not add `sourceZip` metadata unless the user asks to track source archives again.
- Validate `docs/data/hub-games.json` after edits.

## Unity Showcase Rules
Unity showcase metadata lives in:

```text
docs/data/games.json
```

Unity sample pages live in:

```text
docs/ShareNNN_GameName.html
```

Use naming pattern:

```text
ShareNNN_GameName
```

Rules:
- `NNN` is zero-padded and incremental.
- `GameName` uses PascalCase with no spaces.
- Unity source code is usually external; do not assume Unity projects are stored in this repo.
- Keep source repository and live demo links accurate.
- Keep learning outcomes short, readable, and useful for portfolio readers.

## Documentation Rules
- Update [README.md](README.md) and [README.VN.md](README.VN.md) when project structure, run flow, Pages setup, or public purpose changes.
- Update [docs/PROJECT_FORMAT.md](docs/PROJECT_FORMAT.md) when metadata or showcase format changes.
- Update [CONTRIBUTING.md](CONTRIBUTING.md) when contribution or validation workflow changes.
- Link to existing docs instead of duplicating long explanations.
- Keep docs beginner-friendly and practical.

## UI Rules
- Preserve the hub as an actual usable first screen, not a marketing landing page.
- Keep game browsing fast: search, filters, cards, and play links should stay easy to scan.
- Use accessible contrast for text and controls.
- Use icons or compact labels where they help, but avoid decorative clutter.
- Do not use emoji as UI icons.
- Avoid heavy visual dependencies and generated UI frameworks unless requested.

## Safe Defaults For Edits
- Make minimal, targeted changes.
- Do not rename folders, reorganize large game builds, or delete assets unless the user explicitly asks.
- Do not revert unrelated user changes in a dirty worktree.
- Avoid committing generated binaries, temporary files, caches, or unrelated tool output.
- Preserve metadata consistency across JSON files, detail pages, and README tables.

## Validation Checklist
Before saying a change is complete, run the smallest useful checks for the touched area:
- Open or serve the site with `run.bat` when UI behavior changed.
- Confirm `http://localhost:13000/` loads when local preview is relevant.
- Validate `docs/data/hub-games.json` after hub game metadata changes.
- Validate `docs/data/games.json` after Unity showcase metadata changes.
- Confirm changed links and relative paths resolve from the `docs/` site root.

## Commit Message Style
Use concise conventional commits when the user asks for commits:
- `docs(readme): update hub game instructions`
- `fix(hub): correct game play paths`
- `chore(metadata): remove source zip fields`
- `style(hub): refine launcher hero`
