# Top Out: a 3D tower game for engineers on a break

Date: 2026-10-08, v2. Status: rebuilt after the founder played v1 and found it boring ("make it 3D, fun, catchy, with instructions and demos, branded like QS Mind"). v1 was three flat quiz games; it is in git history before this spec.

## Why

Engineers wait a lot: for an AI run, an email, a drawing, a meeting. Top Out fills that gap with a game you can feel in your thumb, built from real construction numbers. One tap, one floor. The best hyper-casual games (Stack, Crossy Road) win on a single satisfying action, instant restart, and visible progress. Top Out borrows that and adds a QS layer: every floor you place is measured, costed and inspected.

Success: someone opens it during a two-minute wait, understands it in ten seconds from the demo, finishes a round, and wants one more. They come back for the daily tower and the next project unlock, and they screenshot a big contract value for a colleague.

## The game

**One action.** A floor slab slides in from the side. Tap (or press space) to drop it on the tower. Whatever hangs over the edge is cut off and falls. The next slab is only as big as what landed. Miss completely and the tower is over.

**Perfect placement.** Land within 25 cm of the edge and it snaps: a ring of light, a rising note, "APPROVED". Three perfects in a row grow the slab back by half a metre per side (up to the full 10 m). That is the rhythm that makes it addictive.

**Real quantities.** Each floor is a 3 m storey. The live BOQ counts built area, concrete, rebar and formwork from the real slab size, and the contract value grows at the market rate per m² (Egypt, UAE or KSA). The headline score is the contract value: numbers like "EGP 48.2M" feel good to share.

**Site inspection.** Every 8 floors the crane stops and the consultant asks one quick question: two materials, which costs more? Six seconds. Right answer: a variation order (bonus value) and a safety net, which forgives the next bad drop (the slab lands on the previous footprint instead of ending the game). Wrong answer: no penalty, just no bonus. Real prices, same data as before.

**Projects (levels).** Villa (8 floors, Cairo), Mid-rise (16, Dubai), Tower (28, Riyadh), Skyscraper (45, Dubai), Megatall (70, NEOM). Reaching the floor target hands the project over: celebration, next project unlocked, and the round continues as endless. Each project changes the floor colours (brand metals: copper, brass, verdigris, steel, rose gold) and the speed curve.

**Daily tower.** One seeded speed and wind pattern per day. Share: "Top Out Daily #8: 23 floors, EGP 41.2M".

**Profile.** Local only: XP, rank titles (Trainee QS to Partner), best floors, best value, projects unlocked, daily streak.

**Tutorial and demo.** First open shows "How to play": a small live 3D demo tower played by a bot (you watch slabs land, one perfect, one offcut), three one-line steps, then "Tap to build". The "?" button brings it back. The first round also shows a pulsing "TAP" hint until the second floor lands.

**Juice.** Camera rises with the tower, background tone shifts with height, offcuts tumble with gravity, screen shake on a miss, light flash and particles on a perfect, counting numbers, WebAudio synth sounds (place, perfect ladder, cut, crash, cash), mute toggle, haptics on phones. Restart is one tap from the game-over card.

## Brand

Top Out is a QS Mind product in the brand system: the geodesic sphere with its own face colour, Rose gold (#E8A598 to #B76E79), added to `brand/top-out/` and the brand README. Instrument Sans for all text, JetBrains Mono for numbers. Ink background, Paper text, Stone secondary. Floors use the brand metals. No "side project" wording anywhere.

## Build

Static files, no build step, OpenShip from `main` of `qs-mind/top-out`, at play.qsmind.app.

```
index.html, styles.css        full-screen canvas with HTML overlays
src/app.js                    state machine: title, tutorial, playing, inspection, handover, over
src/game/tower.js             pure rules: placement, overlap, perfect, growth, BOQ, value (tested)
src/game/render.js            Three.js: slabs, offcuts, camera, colours, effects, bot demo
src/game/audio.js             WebAudio synth, mute
src/game/inspection.js        the price question (uses data/prices.js and makePair)
src/data/prices.js            items per market (unchanged)
src/data/projects.js          levels
src/store.js, src/rng.js      profile and seeded random
tests/*.test.js               node --test on the pure logic
public/                       Top Out mark, favicon
```

Libraries from CDN: three (importmap). Fonts from Google Fonts. No analytics.

## Out of scope

Accounts, online leaderboards, Arabic, more game modes.
