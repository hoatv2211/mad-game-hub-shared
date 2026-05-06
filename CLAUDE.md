# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Unity game sample showcase for learning and portfolio building. This repository focuses on showcase pages and metadata, while source code and demos are hosted externally.

## Repository Structure

- `docs/ShareNNN_GameName.html` — Individual showcase pages
- `docs/data/games.json` — Metadata registry for showcase entries
- `docs/PROJECT_FORMAT.md` — Canonical format and naming conventions
- `AGENTS.md` — Rules for coding agents working in this repo
- `CONTRIBUTING.md` — PR checklist and contribution workflow

Note: `demos/` and `hubs/` directories exist but are currently empty.

## Showcase Entry Format

Each entry follows `ShareNNN_GameName` naming (zero-padded 3-digit number). Each entry should include:

```
docs/data/games.json entry
docs/ShareNNN_GameName.html
external source repository link
optional external live demo link
```

## Key Conventions

- **Learning-first**: readable, teachable code over clever abstractions
- **Prototype-fast**: avoid unnecessary architecture or over-engineering
- **Minimal changes**: don't rename files/folders or restructure without explicit request
- **No generated binaries**: don't commit build artifacts or large assets
- **Documentation**: update nearest relevant doc in the same PR; link instead of duplicating

## Working with Showcase Entries

- Keep metadata fields complete and consistent in `docs/data/games.json`
- Ensure external links are reachable and correct
- Keep learning outcomes concise and useful for portfolio readers
- Keep page content aligned with linked source repository

## Commit Messages

Use conventional format with scope:
- `docs(showcase): add Share003_TowerDefense entry`
- `fix(links): update Share002 source repository URL`
- `chore(metadata): refine learning outcomes for Share001`

## Build / Test

No automated build or test commands are configured yet. Showcase updates are validated by:
1. Checking sample pages render correctly
2. Verifying metadata JSON is valid
3. Verifying external links resolve

## Web/UI Development (UI/UX Pro Max Skill)

When receiving requests to build web pages, landing pages, dashboards, or UI components, **must use the UI/UX Pro Max skill** installed at `.claude/skills/ui-ux-pro-max/`.

### Required Workflow:

**Step 1:** Analyze requirements (product type, style, industry, stack)

**Step 2:** Generate design system (MUST run first):
```bash
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "<product> <industry> <style>" --design-system -p "Project Name"
```

**Step 3:** Reference stack-specific guidelines (default: html-tailwind):
```bash
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "<keyword>" --stack html-tailwind
```

**Step 4:** Search by domain if more details needed:
```bash
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "<keyword>" --domain <domain>
```
Available domains: `product`, `style`, `color`, `typography`, `landing`, `chart`, `ux`, `react`, `web`, `prompt`

### Notes:
- Always run `--design-system` before implementing UI
- Default to `html-tailwind` if user doesn't specify a stack
- Check Pre-Delivery Checklist in `.claude/skills/ui-ux-pro-max/SKILL.md` before delivering code
- Do not use emojis as icons (use SVG from Heroicons/Lucide)
- Ensure minimum 4.5:1 color contrast ratio for text
