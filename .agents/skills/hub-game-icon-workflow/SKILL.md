---
name: hub-game-icon-workflow
description: Reusable workflow for MAD Game Hub icon generation. Use when creating, regenerating, or improving docs/assets/game-icons thumbnails for games in docs/hubgames using agent-browser screenshots and 9Router image generation with cx/gpt-5.4-image.
---

# Hub Game Icon Workflow

Use this skill for MAD Game Hub game icons.

Goal: create a polished square icon for each game while preserving real game identity.

## Project Paths

- Catalog: `docs/data/hub-games.json`
- Game root: `docs/hubgames/<folder>/index.html`
- Local URL: `http://localhost:13000/<playPath>`
- Raw captures: `.tmp-captures/game-icons/`
- AI drafts: `.tmp-captures/9router-icons/`
- Final icons: `docs/assets/game-icons/<folder>.png`
- Target final size: `256x256` PNG

## Tools

Use these skills/tools together:

- `agent-browser`: open local games, wait, click, screenshot.
- `9router-image`: generate/edit icon art from screenshots.

Use `cx/gpt-5.4-image` unless user asks for another model.

## Inputs

Read `.env` for 9Router config:

- `NINEROUTER_URL` may already include `/v1`; trim trailing slash only.
- `NINEROUTER_KEY` is secret. Never print it.

Check models:

```powershell
$base=$env:NINEROUTER_URL.TrimEnd('/')
Invoke-RestMethod -Uri "$base/models/image" -Headers @{Authorization="Bearer $env:NINEROUTER_KEY"}
```

If env vars are not loaded in shell, parse `.env` into local variables and keep key out of logs.

## Screenshot Workflow

1. Confirm `http://localhost:13000/` is up. If down, start `run.bat` or a Python server for `docs/` on port `13000`.
2. Read target games from `docs/data/hub-games.json`.
3. For each game:
   - `agent-browser open`
   - `agent-browser set viewport 960 720`
   - `agent-browser open http://localhost:13000/<playPath>`
   - `agent-browser wait 5000`
   - If a clear Play/Start button exists in the canvas, click it with ordered mouse commands, not parallel commands.
   - `agent-browser wait 3000`
   - Save screenshot to `.tmp-captures/game-icons/<folder>.png`.
4. If the game shows a modal, quality prompt, or menu, either close it and click Play, or keep it only if it represents the game better than a blank/loading scene.

Important: mouse actions must be sequential:

```powershell
npx.cmd agent-browser --session icon-1 mouse move 480 315
npx.cmd agent-browser --session icon-1 mouse down
npx.cmd agent-browser --session icon-1 mouse up
```

Do not run `mouse move/down/up` in parallel.

## 9Router Generation Workflow

Use screenshot as reference image.

Request binary output for easy saving:

```http
POST <NINEROUTER_URL>/images/generations?response_format=binary
```

Body pattern:

```json
{
  "model": "cx/gpt-5.4-image",
  "prompt": "...",
  "image": "data:image/png;base64,...",
  "size": "1024x1024",
  "output_format": "png",
  "background": "opaque",
  "image_detail": "high"
}
```

Prompt template:

```text
Create a polished square mobile game app icon based on the reference screenshot of the game "<title>".
Preserve the core identity, main colors, gameplay subject, characters or board shapes from the screenshot.
Make it readable at small size, centered, high contrast, crisp, professional app icon style.
Do not include browser chrome, menus, UI buttons, watermarks, random extra text, or unrelated characters.
Use no title text unless the game's identity would be lost without a small mark.
```

For puzzle games, mention board/tiles. For character games, mention main character/action. For racing/shooter games, mention vehicle/weapon/action.

## Finalization

1. Save AI draft to `.tmp-captures/9router-icons/<folder>-1024.png`.
2. Resize to `256x256` PNG with high-quality bicubic sampling.
3. Save final to `docs/assets/game-icons/<folder>.png`.
4. Do not overwrite an existing good icon without user approval when testing variants. Use `<folder>-ai.png` for previews.
5. If user approves AI icon style, replace the canonical `<folder>.png`.

## Validation

Run dimension check:

```powershell
Add-Type -AssemblyName System.Drawing
$img=[System.Drawing.Image]::FromFile((Resolve-Path 'docs/assets/game-icons/<folder>.png'))
"$($img.Width)x$($img.Height)"
$img.Dispose()
```

Expected:

```text
256x256
```

For batches, create a contact sheet under `.tmp-captures/9router-icons/contact-*.png` and inspect it before claiming quality.

## Failure Handling

- 9Router timeout: retry once, then report model/url/status.
- Model missing: list `/models/image` and use the closest user-approved model.
- Screenshot blank: wait longer, click Play/Start, or capture first meaningful menu.
- `npx agent-browser` sandbox `EACCES`: rerun with approved `npx.cmd` outside sandbox.
- Path issue in `agent-browser screenshot`: use `./.tmp-captures/...` so path is not parsed as selector.

