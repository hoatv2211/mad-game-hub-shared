# Game Icon Thumbnails Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Generate and display 256x256 title icons for all hub games.

**Architecture:** A local PowerShell generator creates static PNG icons from source assets and updates hub metadata. The static hub reads `iconPath` and renders it in existing game cards.

**Tech Stack:** PowerShell, .NET `System.Drawing`, static HTML/CSS/JavaScript, JSON.

---

### Task 1: Generator

**Files:**
- Create: `tools/generate-game-icons.ps1`
- Modify: `docs/data/hub-games.json`

- [ ] Create a PowerShell script that reads `docs/data/hub-games.json`, scans each `docs/hubgames/<folder>/`, selects the best local image, crops/resizes it to `256x256`, writes `docs/assets/game-icons/<folder>.png`, and writes `iconPath` into metadata.
- [ ] Run `powershell -ExecutionPolicy Bypass -File tools/generate-game-icons.ps1`.
- [ ] Verify JSON parses and every generated `iconPath` exists.

### Task 2: Hub Card UI

**Files:**
- Modify: `docs/index.html`

- [ ] Add CSS for a stable square thumbnail area in `.game-card`.
- [ ] Render `<img class="game-thumb">` from `game.iconPath || 'assets/hubmad.png'`.
- [ ] Keep existing search, sort, play, and new-tab behavior unchanged.

### Task 3: Documentation

**Files:**
- Modify: `README.md`
- Modify: `README.VN.md`
- Modify: `docs/PROJECT_FORMAT.md`

- [ ] Document `tools/generate-game-icons.ps1`.
- [ ] Document `iconPath` and `docs/assets/game-icons/`.
- [ ] Add icon generation to validation/checklist instructions.
