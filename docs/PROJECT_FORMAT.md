# Project Format

This document defines the standard format for this repository so all shared Unity samples stay consistent and portfolio-ready.

## Core Principles
- Learning-first: code should be readable and teachable.
- Prototype-fast: avoid unnecessary architecture.
- Portfolio-ready: each sample must be easy to demonstrate.

## Repository Structure
```text
mad-game-hub-shared/
  samples/
    ShareNNN_GameName/
      README.md
      project/                 # Unity project root for this sample
      Assets/
      Packages/
      ProjectSettings/
  docs/
    PROJECT_FORMAT.md
```

Notes:
- Keep each sample isolated so users can clone and open one sample independently.
- If a sample is only blueprint-level, include enough files and docs for learners to follow.

## Sample Naming
Use this exact convention:

`ShareNNN_GameName`

Rules:
- `NNN` is zero-padded and incremental.
- `GameName` uses PascalCase with no spaces.

## Required Files Per Sample
Each sample folder should include:
- `README.md`
- Unity project files under a stable structure

Each sample `README.md` should include:
- Summary of gameplay and learning goals
- Unity version
- Entry scene path
- Required packages/assets
- Run steps
- Known limitations and next improvements

## Recommended Sample README Template
```md
# ShareNNN_GameName

## Overview
Short summary of this sample and what it demonstrates.

## Learning Goals
- Goal 1
- Goal 2

## Tech Info
- Unity version:
- Target platform:

## Entry Scene
- Scene path:

## Requirements
- Packages:
- External assets:

## Run
1. Open project in Unity.
2. Open entry scene.
3. Press Play.

## Roadmap
- [ ] Next improvement 1
- [ ] Next improvement 2
```

## Documentation Rules
- Link to existing docs instead of duplicating long text.
- Keep setup instructions short and actionable.
- Update nearby docs in the same PR when behavior changes.

## Asset And File Hygiene
- Do not commit unnecessary generated artifacts.
- Keep sample assets scoped to the sample folder.
- Prefer lightweight placeholder assets for learning examples.

## Review Criteria
A sample is considered ready when:
- It runs from the documented entry scene.
- Setup instructions are accurate.
- Folder and naming conventions are respected.
- Code readability supports learning use cases.
