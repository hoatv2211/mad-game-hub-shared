# MADStudio Game Hub

![MADStudio Game Hub](docs/assets/hubmad.png)

A GitHub Pages arcade showcase for playable HTML games and Unity learning samples. The hub is built as a static site, so visitors can open the catalog, browse game cards, and jump straight into each browser game without installing anything.

Play online: [https://hoatv2211.github.io/mad-game-hub-shared/](https://hoatv2211.github.io/mad-game-hub-shared/)

Vietnamese version: [README.VN.md](README.VN.md)

## Showcase

MADStudio Game Hub collects two kinds of work in one public portfolio:

- **40 playable hub games** hosted under `docs/hubgames/`, each with its own `index.html`.
- **Unity learning samples** with source links, live demos, notes, and portfolio-style detail pages.
- **GitHub Pages-ready delivery** using plain HTML, CSS, JavaScript, JSON, and static assets.
- **Visual game catalog** with generated square icons for fast browsing.

## Gallery

![Game icon contact sheet](assets/hub-icons-contact-final.png)

The icon sheet gives a quick visual pass over the playable catalog before visitors open the live hub.

## Open The Hub

Online:

```text
https://hoatv2211.github.io/mad-game-hub-shared/
```

Local preview:

```bat
run.bat
```

Then open:

```text
http://localhost:13000/
```

GitHub Pages setup:

```text
Branch: main
Folder: /docs
```

## Featured Hub Games

| Icon | Game | Play path |
| --- | --- | --- |
| <img src="docs/assets/game-icons/000001_10_Ten.png" width="56" alt="10 Ten! icon"> | 10 Ten! | `docs/hubgames/000001_10_Ten/index.html` |
| <img src="docs/assets/game-icons/000002_2-3-4_Player_Games.png" width="56" alt="2-3-4 Player Games icon"> | 2-3-4 Player Games | `docs/hubgames/000002_2-3-4_Player_Games/index.html` |
| <img src="docs/assets/game-icons/000003_2024_Plus.png" width="56" alt="2024 Plus icon"> | 2024 Plus | `docs/hubgames/000003_2024_Plus/index.html` |
| <img src="docs/assets/game-icons/000004_2048_Balls.png" width="56" alt="2048 Balls icon"> | 2048 Balls | `docs/hubgames/000004_2048_Balls/index.html` |
| <img src="docs/assets/game-icons/000007_3D_Russian_Billiards.png" width="56" alt="3D Russian Billiards icon"> | 3D Russian Billiards | `docs/hubgames/000007_3D_Russian_Billiards/index.html` |

The full catalog is driven by [docs/data/hub-games.json](docs/data/hub-games.json). Each entry keeps a title, folder, play path, and icon path for the hub UI.

## Unity Showcase

| Sample | Genre | Difficulty | Focus | Source | Demo |
| --- | --- | --- | --- | --- | --- |
| [Share001_Ludo](docs/Share001_Ludo.html) | Board Game | Beginner | Deterministic turn-based board logic | [GitHub](https://github.com/hoatv2211/Share001_Ludo) | [Play](https://hoatv2211.github.io/Share001_Ludo/) |
| [Share002_PixelShooter3D](docs/Share002_PixelShooter3D.html) | Action Shooter | Intermediate | Movement, combat loop, enemy spawn pacing, scoring | [GitHub](https://github.com/hoatv2211/Share002_PixelShooter3D) | [Play](https://hoatv2211.github.io/Share002_PixelShooter3D/) |
| [Share003_AgeOfBattle](docs/Share003_AgeOfBattle.html) | Strategy / Battle | Intermediate | Unit waves, positioning, combat flow, progression | [GitHub](https://github.com/hoatv2211/Share003_AgeOfBattle) | [Play](https://hoatv2211.github.io/Share003_AgeOfBattle/) |

Unity sample metadata lives in [docs/data/games.json](docs/data/games.json). Source projects stay in their own external repositories so this repo remains a lightweight public showcase.

## What Visitors See

- A retro arcade launcher landing section.
- Searchable and sortable game cards.
- Square icons for quick game recognition.
- Direct play links for every hub game.
- Unity sample cards with demo, source, learning focus, and details.

## Repository Map

```text
mad-game-hub-shared/
  README.md
  README.VN.md
  run.bat
  docs/
    index.html
    assets/
      hubmad.png
      game-icons/
    hubgames/
      <game-folder>/index.html
    ShareNNN_GameName.html
    data/
      hub-games.json
      games.json
  tools/
    generate-game-icons.ps1
    generate-ai-game-icons.ps1
```

Detailed format notes live in [docs/PROJECT_FORMAT.md](docs/PROJECT_FORMAT.md). Agent and maintenance rules live in [AGENTS.md](AGENTS.md).

## Maintenance Notes

Useful commands when updating the showcase:

```powershell
powershell -ExecutionPolicy Bypass -File tools\generate-game-icons.ps1
powershell -ExecutionPolicy Bypass -File tools\generate-ai-game-icons.ps1 -NumberList "2,4,7"
```

Before publishing, check that `docs/data/hub-games.json` and `docs/data/games.json` are valid JSON, every hub game folder has an `index.html`, and icon paths resolve under `docs/assets/game-icons/`.

## License

This repository is licensed under Apache License 2.0. See [LICENSE](LICENSE).
