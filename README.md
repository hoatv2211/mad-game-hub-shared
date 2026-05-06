# mad-game-hub-shared

Showcase hub for Unity game samples focused on learning and portfolio presentation.

This repository is showcase-only. Source code and playable demos are hosted in external repositories and links.

## Why This Repo Exists
- Present Unity sample projects in a portfolio-friendly format.
- Centralize sample descriptions, learning goals, and links.
- Keep discovery and navigation simple for recruiters and learners.

## Repository Format
This project follows a metadata-driven showcase format.

High-level layout:

```text
mad-game-hub-shared/
	README.md
	AGENTS.md
	CONTRIBUTING.md
	docs/
		index.html
		PROJECT_FORMAT.md
		Share001_Ludo.html
		Share002_PixelShooter3D.html
		data/
			games.json
```

Detailed conventions for naming and metadata fields are in [docs/PROJECT_FORMAT.md](docs/PROJECT_FORMAT.md).

## Naming Convention
Sample entries should use this pattern:

`ShareNNN_GameName`

Examples:
- `Share001_Ludo`
- `Share002_PixelShooter3D`

## Add A New Showcase Entry
1. Add or update a game entry in `docs/data/games.json`.
2. Add or update the sample detail page in `docs/` (for example `docs/Share003_TowerDefense.html`).
3. Make sure `liveDemo` and `sourceRepo` links are valid.
4. Update this README sample index if needed.

## Quick Start
1. Open [docs/index.html](docs/index.html) to browse the showcase.
2. Pick a sample and open its external source or demo link.
3. Review learning outcomes and gameplay notes on the sample page.

## Sample Index
- `Share001_Ludo`
	- Source: https://github.com/hoatv2211/Share001_Ludo
	- Demo: https://hoatv2211.github.io/Share001_Ludo/
	- Focus: deterministic turn-based board logic
- `Share002_PixelShooter3D`
	- Source: https://github.com/hoatv2211/Share002_PixelShooter3D
	- Demo: https://hoatv2211.github.io/Share002_PixelShooter3D/
	- Focus: movement, shooting loop, and enemy spawn pacing
- `Share003_TowerDefense`
	- Source: add when available
	- Demo: add when available
	- Focus: wave system, tower targeting, and basic economy

## Contributing
Please read [CONTRIBUTING.md](CONTRIBUTING.md) before opening PRs.

## License
This repository is licensed under Apache License 2.0. See [LICENSE](LICENSE).
