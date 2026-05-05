# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Unity game sample hub for learning and portfolio building. Contains standalone Unity mini-game samples following a consistent format. Each sample is isolated and can be opened independently in Unity.

## Repository Structure

- `samples/ShareNNN_GameName/` — Individual Unity samples (numeric prefix, PascalCase name)
- `docs/PROJECT_FORMAT.md` — Canonical format and naming conventions
- `AGENTS.md` — Rules for coding agents working in this repo
- `CONTRIBUTING.md` — PR checklist and contribution workflow

Note: `demos/` and `hubs/` directories exist but are currently empty.

## Sample Format

Each sample must follow `ShareNNN_GameName` naming (zero-padded 3-digit number). Structure per sample:

```
ShareNNN_GameName/
  README.md          # Required: overview, Unity version, entry scene, run steps
  project/           # Unity project root
    Assets/
    Packages/
    ProjectSettings/
```

## Key Conventions

- **Learning-first**: readable, teachable code over clever abstractions
- **Prototype-fast**: avoid unnecessary architecture or over-engineering
- **Minimal changes**: don't rename files/folders or restructure without explicit request
- **No generated binaries**: don't commit build artifacts or large assets
- **Documentation**: update nearest relevant doc in the same PR; link instead of duplicating

## Working with Samples

- Entry scene path and Unity version must be documented in each sample's README
- Preserve backward compatibility of public APIs and scene wiring
- Use plain C# readability over complex patterns for shared sample code
- Keep Unity lifecycle behavior explicit (avoid hidden side effects in Awake/Update/etc.)

## Commit Messages

Use conventional format with scope:
- `feat(sample): add Share003_TowerDefense prototype loop`
- `docs(sample): add setup notes for Share002_PixelShooter3D`
- `fix(sample): remove hidden side effect in player update`

## Build / Test

No automated build or test commands are configured yet. Samples are validated by:
1. Opening the Unity project
2. Loading the documented entry scene
3. Entering Play mode

When adding samples, document Unity version and required packages in the sample README.

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
