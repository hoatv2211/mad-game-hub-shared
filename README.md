# mad-game-hub-shared

Curated Unity source code and project blueprints for casual game development.
This repository is designed for learning, fast prototyping, and portfolio building.

## Why This Repo Exists
- Share practical Unity examples that are easy to read and adapt.
- Help beginners and intermediate developers learn by shipping small playable samples.
- Keep each sample portfolio-friendly with clear setup and demo steps.

## Repository Format
This project follows a sample-driven format.

High-level layout:

```text
mad-game-hub-shared/
	README.md
	AGENTS.md
	CONTRIBUTING.md
	docs/
		PROJECT_FORMAT.md
	samples/
		Share001_Ludo/
		Share002_PixelShooter3D/
```

Detailed conventions for sample naming, folder layout, and documentation are in [docs/PROJECT_FORMAT.md](docs/PROJECT_FORMAT.md).

## Naming Convention
Sample projects should use this pattern:

`ShareNNN_GameName`

Examples:
- `Share001_Ludo`
- `Share002_PixelShooter3D`

## Add A New Sample
1. Create a new folder under `samples/` with the naming convention above.
2. Add a short sample README with:
	 - What the sample teaches.
	 - Unity version used.
	 - Scene entry point.
	 - Required packages/assets.
	 - Quick run steps.
3. Update this root README with a short entry in the sample index section.

## Sample Index
- Coming soon. Add entries here as sample folders are added.

## Contributing
Please read [CONTRIBUTING.md](CONTRIBUTING.md) before opening PRs.

## License
This repository is licensed under Apache License 2.0. See [LICENSE](LICENSE).
