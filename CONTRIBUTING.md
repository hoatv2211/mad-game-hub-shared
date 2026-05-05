# Contributing Guide

Thanks for contributing to this open-source Unity learning and portfolio project.

## Contribution Goals
- Keep examples educational and beginner-friendly.
- Prefer practical gameplay logic over over-engineered patterns.
- Make every sample easy to open, run, and inspect.

## Before You Open A PR
1. Follow the repository format in [docs/PROJECT_FORMAT.md](docs/PROJECT_FORMAT.md).
2. Keep changes focused and minimal.
3. Add or update documentation near your change.
4. Verify the sample can run from a clearly defined entry scene.

## Pull Request Checklist
- My sample folder follows the `ShareNNN_GameName` naming convention.
- I added a sample README with setup and run steps.
- I documented Unity version and required packages/assets.
- I updated root [README.md](README.md) sample index if needed.
- I avoided committing generated binaries and large unnecessary files.

## Coding Style Expectations
- Use clear names and short methods.
- Keep Unity lifecycle behavior explicit and predictable.
- Add comments only when they improve learning context.
- Preserve backward compatibility for existing sample APIs and scene wiring when possible.

## Commit Message Suggestion
Use concise, purpose-first messages, for example:
- `feat(sample): add Share003_TowerDefense prototype loop`
- `docs(sample): add setup notes for Share002_PixelShooter3D`
- `fix(sample): remove hidden side effect in player update`

## Questions
If something is unclear, open an issue with:
- Expected behavior
- Current behavior
- Unity version
- Steps to reproduce
