# Amberline Airpost

[![make.fun flight game bounty](https://make.fun/badge/best-flight-game-20261126-0057.svg)](https://make.fun/c/best-flight-game-20261126-0057)
[![Live rank](https://make.fun/badge/best-flight-game-20261126-0057/avisii1680769-cell/best-flight-game-20261126-0057/rank.svg)](https://make.fun/c/best-flight-game-20261126-0057)
[![Reward](https://make.fun/badge/best-flight-game-20261126-0057/avisii1680769-cell/best-flight-game-20261126-0057/reward.svg)](https://make.fun/c/best-flight-game-20261126-0057)

**A valley. A plane. A promise.**

An original, complete Canvas 2D flight game about an evening airmail run through a mountain valley. Fly five amber navigation rings, drop the mail over the village clock tower, then bring the aeroplane home to Amberline Field. A meandering river, pine forests, a stone viaduct, snowy ridges and a village form the route. Every aircraft part and landscape shape is drawn in code; event sounds are synthesised locally.

## Play

Serve `game/` with any static HTTP server. No install, bundling, external library, remote asset, or network service is needed by the game. Node 22.18+ can run the included development server:

```sh
node serve.ts
```

Open `http://127.0.0.1:8080` in desktop Chrome. Press Enter or click to launch.

| Input | Action |
| --- | --- |
| Arrow left / right | Bank and steer |
| Arrow up / down | Climb / descend |
| W / S | Increase / decrease throttle |
| M or click in flight | Toggle mouse steering; move around screen centre |
| Mouse wheel | Adjust throttle |
| Space | Drop airmail in the cyan beacon zone, at 65–270 m |
| G | Toggle landing gear |
| P / Escape | Pause / resume |
| R | Restart |
| F | Fullscreen; Escape exits |
| Q / V | Toggle sound / reduced motion |

Fly through ring centres for 350 points, or inside the outer ring for 200. A missed ring reduces your postmark count but does not prevent a safe return. Delivering the parcel earns 800 points. Landing earns a bonus for a gentle descent and centreline accuracy. Watch fuel and airspeed: low speed causes a stall. For landing, lower the gear, align within the runway edges, hold 75–118 kt, and keep vertical/lateral speed below 18 m/s. Reduce throttle well before touchdown. Crossing terrain or arriving too fast ends the sortie with a reason and restart.

## Verification and entry output

```sh
npm test
mkdir -p out
MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` uses only Node standard libraries and the competition kit's unchanged `vendor/makefun-game.ts`. It copies `game/` and `screenshots/` and builds the deterministic dossier. The game itself has no build step.

`scripts/browser-test.mjs` checks controls in real Chromium. `scripts/sortie-test.mjs` flies the entire mission with mouse/keyboard inputs and captures screenshots with Playwright. These development scripts use the workspace's installed Playwright/Chromium paths; they are not runtime dependencies. Screenshots are unedited 1280×720 browser renders, not generated illustrations. `shots.json` records their provenance and associated flight states.

## Source map

- `game/src/flight.js`: inertial flight, fuel, navigation, airmail, terrain collision, landing and scoring.
- `game/src/terrain.js`: projected Canvas terrain, river, trees, village, viaduct, airfield and navigation rings.
- `game/src/render.js`: original aircraft, cockpit-style instruments, route map and game screens.
- `game/src/main.js`: keyboard/mouse input, audio, accessibility options and deterministic frame stepping.
- `tests/flight.test.mjs`: simulation tests using Node's built-in runner.

MIT licensed. Created from scratch after the competition's opening. No starter game code or starter screenshots are used.
