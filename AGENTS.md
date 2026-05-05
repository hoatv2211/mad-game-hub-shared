# AGENTS.md

## Purpose
This repository shares Unity game source code and blueprint-style examples for learning and portfolio building.

Primary goals for coding agents:
- Keep examples educational, readable, and easy to adapt.
- Preserve beginner-friendly structure over over-engineering.
- Favor practical prototype velocity while keeping code quality stable.

## Project Context
- Source of truth for project intent: [README.md](README.md)
- Repository format standard: [docs/PROJECT_FORMAT.md](docs/PROJECT_FORMAT.md)
- Contribution workflow: [CONTRIBUTING.md](CONTRIBUTING.md)
- Current repository is minimal and may be expanded into multiple Unity sample modules over time.

## Agent Working Rules
- Treat this as an open-source teaching project first, production game second.
- Prefer clear naming, short methods, and comments only when needed for learning context.
- Avoid introducing complex architecture unless it solves a real maintainability issue.
- Keep dependencies lightweight and justify any new package in pull-request notes.
- Preserve backward compatibility of public example APIs and scene wiring where possible.

## Unity-Focused Conventions
- Use deterministic, easy-to-test gameplay logic where possible.
- Keep game loop behavior explicit and avoid hidden side effects in lifecycle callbacks.
- For shared sample code, prioritize plain C# readability over clever abstractions.
- Add concise setup notes when adding a new sample folder (scene entry point, required assets, run steps).

## Documentation Guidance
- Link to existing docs instead of duplicating long explanations.
- When adding features, update the nearest relevant documentation file in the same change.
- If no dedicated doc exists yet, start from [README.md](README.md) and keep additions short.
- Keep sample structure and naming aligned with [docs/PROJECT_FORMAT.md](docs/PROJECT_FORMAT.md).

## Safe Defaults for AI Edits
- Make minimal, targeted changes.
- Do not rename files/folders or reorganize project structure unless explicitly requested.
- Do not add generated binaries or large assets by default.
- If build/test commands are not documented yet, avoid guessing destructive workflows.

## Web/UI Development

When the user asks to build a **web page, landing page, portfolio page, dashboard, or any UI component** (HTML, Tailwind, React, Next.js…), you **must** use the `ui-ux-pro-max` skill installed at `.claude/skills/ui-ux-pro-max/`.

### Required Workflow

1. **Analyze** requirements (product type, style, industry, stack).
2. **Generate design system first** (always run before implementing):
   ```
   python3 .claude/skills/ui-ux-pro-max/scripts/search.py "<product> <industry> <style>" --design-system -p "Project Name"
   ```
3. **Get stack-specific guidelines** (default stack: `html-tailwind`):
   ```
   python3 .claude/skills/ui-ux-pro-max/scripts/search.py "<keyword>" --stack html-tailwind
   ```
4. **Implement** following the design system and guidelines.

### Trigger Phrases
Any of the following should activate this workflow:
- "tạo landing page", "tạo web", "tạo trang", "build page", "create website"
- "thiết kế UI", "làm dashboard", "portfolio page", "sample index page"
- Any `.html`, `.tsx`, `.vue`, `.svelte` file creation task

### Rules
- Never use emojis as icons — use SVG from Heroicons or Lucide.
- Minimum 4.5:1 color contrast ratio for all text.
- Always run `--design-system` before writing any UI code.
- Default to `html-tailwind` stack unless user specifies otherwise.
- Check Pre-Delivery Checklist in `.claude/skills/ui-ux-pro-max/SKILL.md` before delivering.

## Suggested Next Customizations
- Add `.github/instructions/unity.instructions.md` for Unity-specific coding rules (folder layout, scene conventions, ScriptableObject usage).
- Add `.github/instructions/contribution.instructions.md` for PR checklist style (docs update, sample scene validation, naming consistency).
- Add `.github/prompts/new-sample.prompt.md` to scaffold a new mini-game sample consistently.
