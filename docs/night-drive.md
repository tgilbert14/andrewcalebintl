# Night Drive — Side B (`/drive/`)

Side B of the master tape: one continuous scroll-driven drive that ends with the
car going into the sun. Everything is procedural — no video, no images, no
external requests. Sources live in `src/drive/`, and `node build.js` emits
`drive/index.html` alongside the main page (same fonts, same commit-and-push
deploy).

## How it works

- **Scroll is the accelerator.** An empty spacer `#track` provides the scroll
  length: six scene bands with per-scene weights (`WEIGHTS`) and mid-scene dwell
  (`lingerEase`, the scroll-world remap: `f(x) = (1-L)x + L(4(x-.5)³+.5)`).
  Scroll maps to a journey time `T ∈ [0,6]`, lerped each frame
  (dt-normalized `1-0.82^(dt·60)`) so flicks feel like inertia. Scroll is never
  hijacked — native scrollbar, keyboard, and anchors all work.
- **The world is one fixed canvas** rendered from `T` + wall-clock: sky ramps
  interpolate between per-scene keyframes; buildings/palms are pre-rendered
  offscreen sprites (shadowBlur only at build time, never in the frame loop);
  the grid floor and road are canvas perspective-divide math — deliberately NOT
  the CSS `rotateX` + background-position approach (see the hero-grid GPU
  landmine note in `src/01-style-a.html`).
- **The camera swap** (side view → rear view) happens under a scroll-driven
  static-drift tent centered at `T≈4.8` — the same slow analog handoff grammar
  as the Operator's feed on Side A. The rear car is the same wedge from behind:
  stacked bands, louvred red tail bar, one high mirror, `ACI-86` plate. It
  pulls away by `scale = 1/z` toward a vanishing point inside the sun, then the
  whiteout takes the frame and the end card scrolls up in normal flow.
- **Scene copy** is fixed DOM choreographed on the scrub-engine constants:
  first scene greets at load and fades by 62% of its band, middles tent at 50%,
  the finale holds then yields to the whiteout. With JS off the scenes read as
  a normal page over a static sunset (`html:not(.js)` hides the machinery).
- **The score builds with the drive.** One data-driven record (`DRIVE`, same
  format as Side A's `TRACK_DEFS`, same look-ahead scheduler) whose layers are
  gated by scene: pad+arp at ignition → drums/bass in the city → gated-reverb
  snare on the expressway → melody on the coast → full lead on the grid → a
  +2-semitone lift for TRK 06 (applied at loop boundaries). Past `T≈5.82` the
  tape runs out: a final major chord falls off pitch, hiss swells, and a
  procedural ocean (LFO-swept noise) carries the end card. Sidechain pump is a
  scheduled duck on a `pumpBus` (WebAudio has no sidechain input); the gated
  snare is a shared convolver with a generated decaying-noise IR and a hard
  130 ms gate.
- **Reduced motion** is dual-path, per house law: the `@media` block and
  `html.rm` both kill every animation, and the canvas renders one static
  postcard per scene (repainting whenever the canvas was cleared —
  `lastDrawnT === -9` — not just on scene change). The FX chip and radio chip
  share `aci_fx` / `aci_audio` with Side A.

## Deep links + capture rig

- `#trk04` or `?trk=4` — land mid-track N. `?t=5.9` — land at a journey time.
- `?vt=5.9` — PIN the journey time without scrolling. This exists because
  headless `--virtual-time-budget` screenshots break on any load that scrolls
  (hash and `?t=` captures come out as identical blank frames). Capture with:
  `chrome --headless=new --screenshot=<ABSOLUTE path> --window-size=1600,1000
  --virtual-time-budget=5000 "http://localhost:8137/drive/?vt=5.5"`.
- `&audio=1` — tune in without a gesture; only obeys where autoplay policy
  allows (add `--autoplay-policy=no-user-gesture-required` in headless). Pair
  with `--enable-logging=stderr` to smoke-test the scheduler for exceptions.
- `window.__ndState()` — engine state dump (ctx state, T, scene, lift, runout).
- Konami code (or triple-tap the speedo) — TURBO.
