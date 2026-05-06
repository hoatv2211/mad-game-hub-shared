# AGENTS.md

## Purpose
This repository is a showcase hub for Unity game samples used for learning and portfolio presentation.

Primary goals for coding agents:
- Keep showcase pages educational, readable, and easy to navigate.
- Preserve beginner-friendly structure over over-engineering.
- Favor clear metadata and link quality for portfolio usage.

## Project Context
- Source of truth for project intent: [README.md](README.md)
- Repository format standard: [docs/PROJECT_FORMAT.md](docs/PROJECT_FORMAT.md)
- Showcase contribution workflow: [CONTRIBUTING.md](CONTRIBUTING.md)
- Current repository is minimal and may be expanded into multiple Unity sample modules over time.

## Agent Working Rules
- Treat this as a showcase-first documentation project.
- Prioritize accurate external links to source repositories and live demos.
- Avoid introducing local Unity project requirements in this repository.
- Keep dependencies lightweight and justify any new package in pull-request notes.
- Preserve naming consistency and metadata quality across sample entries.

## Unity-Focused Conventions
- Describe gameplay behavior in clear, beginner-friendly language.
- Keep architecture notes concise and useful for learning context.
- For sample entries, include setup notes and links to external source repositories.
- Do not assume source code is stored locally in this repository.

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
- Default to documentation and metadata updates for showcase entries.

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
- Add `.github/instructions/showcase.instructions.md` for metadata schema and link validation rules.
- Add `.github/instructions/contribution.instructions.md` for docs and metadata review checklist.
- Add `.github/prompts/new-showcase-entry.prompt.md` to scaffold a new sample page consistently.
