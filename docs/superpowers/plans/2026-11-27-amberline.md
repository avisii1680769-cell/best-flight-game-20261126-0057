# Amberline Airpost Implementation Plan

> Execute in this session using executing-plans and test-driven-development. The user explicitly authorizes the supplied brief; do not pause for design approval.

**Goal:** Original, offline 2D Canvas flight game and a verified ready-to-submit entry.
**Architecture:** Pure simulation in flight.js, projected vector terrain in terrain.js, aircraft and HUD in render.js, input/audio/frame orchestration in main.js. Node standard-library entrypoint packages the files deterministically.
**Tech Stack:** Canvas 2D, vanilla JavaScript, Node 24, Chromium + Playwright.
**Spec:** ../build-brief.md, kit RULES.txt and competition.yaml.

## Global Constraints
- Kit init before game writes: anchor c7f4813bcff3e013330e2a737b76bd3bd096ea8b.
- game/ static files, no build step, no network dependencies, own code/art/audio.
- Unchanged kit vendor; main.ts uses buildDossier with exact caps.
- Three or four real browser screenshots, <=256 KiB, longest side <=1280, shortest >=480.
- Bundle dry run first, explicit build session, scheduled prompt and SUBMIT-NOTES flags.
- Stop at bundle/check green; hard stop 2026-11-27 12:30 UTC (20:30 China Standard Time).
- Do not submit, create GitHub repository, or pay.

## Review Focus
- Slow/fast approach, runway alignment and missed gates: simulation tests and full browser sortie.
- Input stuck after blur/pause: browser key/mouse/pause tests.
- Resizing and offline file loading: browser viewport/file URL checks.
- Screenshots show actual flight and instruments: inspect real Chromium captures.
- Output determinism and transcript completeness: compare two output manifests; kit checks.

### Task 1: Runnable slice + early gate
- [x] Write failing simulation tests for start, movement, pass/miss, stall/crash, delivery and landing.
- [x] Implement flight.js and minimum Canvas entry, main.ts and vendored dossier library.
- [x] Run Node tests and Chromium smoke test; take real screenshots.
- [x] Run main.ts and early bundle/check to discover transcript issues (14 passed, 0 failed).

### Task 2: Complete flight experience
- [x] Add recognisable canyon/river/town/bridge/airfield terrain and original aircraft.
- [x] Add readable HUD, mission brief, checkpoints, pause/restart, sound and reduced motion.
- [x] Validate all controls and full sortie with real browser interactions; inspect captures.

### Task 3: Freeze and handoff
- [x] README badges, MIT, owner file, deterministic export, checks and screenshots evidence.
- [ ] Commit, final bundle dry run + bundle + check; stop building when green.
- [ ] Report commit, archive sha256, counts, real screenshots and exact submit command.
