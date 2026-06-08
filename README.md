# MAD Game Hub Shared

Static GitHub Pages hub for playable browser games and Unity portfolio samples.

This repository is documentation-first. It hosts the public hub page, hub game builds, shared assets, and showcase metadata. Unity learning sample source code remains linked from each sample entry instead of being stored here.

Vietnamese version: [README.VN.md](README.VN.md)

## Quick Start

Run the site locally on port `13000`:

```bat
run.bat
```

Then open:

```text
http://localhost:13000/
```

The script serves the `docs/` folder with Python's built-in HTTP server. No Node.js dependency is required.

## Hub Games

The hub includes 40 playable HTML games under:

```text
docs/hubgames/
```

The main page reads [docs/data/hub-games.json](docs/data/hub-games.json) and links each game to its own `index.html` page, for example:

```text
http://localhost:13000/hubgames/000001_10_Ten/index.html
```

When published with GitHub Pages from the `docs/` folder, the same relative links work from the live site.

## Project Goals

- Provide one clean hub for playable browser games.
- Keep the site ready for GitHub Pages publishing.
- Preserve the Unity learning showcase with beginner-friendly descriptions.
- Centralize playable links, source links, learning outcomes, and metadata.
- Keep dependencies lightweight: static HTML, CSS, JavaScript, and JSON.

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
      000001_10_Ten/
      ...
    Share001_Ludo.html
    Share002_PixelShooter3D.html
    Share003_AgeOfBattle.html
    data/
      games.json
      hub-games.json
```

Detailed showcase format rules are documented in [docs/PROJECT_FORMAT.md](docs/PROJECT_FORMAT.md).
Agent working rules are documented in [AGENTS.md](AGENTS.md).

## Data Files

- [docs/data/hub-games.json](docs/data/hub-games.json): playable hub game catalog.
- [docs/data/games.json](docs/data/games.json): Unity portfolio showcase metadata.

Each hub game entry should include a number, title, folder name, and `playPath` that points to `hubgames/<folder>/index.html`.

## Unity Showcase Format

Unity sample pages use this naming pattern:

```text
ShareNNN_GameName
```

Example files:

```text
docs/Share001_Ludo.html
docs/Share002_PixelShooter3D.html
docs/Share003_AgeOfBattle.html
```

Each Unity sample should have:

- One metadata entry in [docs/data/games.json](docs/data/games.json)
- One detail page in `docs/`
- A valid external source repository link
- A valid live demo link when available
- Clear learning outcomes for readers and recruiters

## Current Unity Samples

| Sample | Genre | Difficulty | Focus | Source | Demo |
| --- | --- | --- | --- | --- | --- |
| `Share001_Ludo` | Board Game | Beginner | Deterministic turn-based board logic | [GitHub](https://github.com/hoatv2211/Share001_Ludo) | [Play](https://hoatv2211.github.io/Share001_Ludo/) |
| `Share002_PixelShooter3D` | Action Shooter | Intermediate | Movement, combat loop, enemy spawn pacing, and scoring | [GitHub](https://github.com/hoatv2211/Share002_PixelShooter3D) | [Play](https://hoatv2211.github.io/Share002_PixelShooter3D/) |
| `Share003_AgeOfBattle` | Strategy / Battle | Intermediate | Unit waves, positioning, combat flow, and progression | [GitHub](https://github.com/hoatv2211/Share003_AgeOfBattle) | [Play](https://hoatv2211.github.io/Share003_AgeOfBattle/) |

## Add A Hub Game

1. Add the game folder to `docs/hubgames/<folder>/`.
2. Confirm the game has `index.html` at the folder root.
3. Add an entry to [docs/data/hub-games.json](docs/data/hub-games.json).
4. Use a relative `playPath` like `hubgames/<folder>/index.html`.
5. Run `run.bat` and test the game card from `http://localhost:13000/`.

## Add A Unity Showcase Sample

1. Add a new object to [docs/data/games.json](docs/data/games.json).
2. Add a matching detail page in `docs/`, for example `docs/Share004_NewGame.html`.
3. Confirm `sampleDoc`, `sourceRepo`, and `liveDemo` links are correct.
4. Update this README sample table when the new entry is ready.
5. Keep setup notes short and link to the external source repository for full implementation details.

## Validation Checklist

Before publishing a change:

- Run `run.bat` and check `http://localhost:13000/`.
- Confirm `docs/data/hub-games.json` is valid JSON.
- Confirm every folder in `docs/hubgames/` has an `index.html` file.
- Confirm `docs/data/games.json` is valid JSON.
- Confirm external Unity source and demo links are reachable.
- Avoid committing unrelated generated files or Unity build artifacts.

## GitHub Pages

Recommended Pages source:

```text
Branch: main
Folder: /docs
```

With that setup, `docs/index.html` becomes the site homepage and hub game links resolve through `docs/hubgames/`.

## Contributing

Read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request.

## License

This repository is licensed under Apache License 2.0. See [LICENSE](LICENSE).
