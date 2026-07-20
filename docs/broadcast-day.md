# The Broadcast Day — CH 06/CH 07/Skywave systems

The expansion turns Side A from a diorama into a service: the site now explains
itself (ACI TEXT), takes structured traffic (the desk), and runs a daily ARG
loop across radio, teletext, and contact. Everything below is procedural,
zero-request, and lives in `src/03-body.html` (markup), `src/02-style-b.html`
(styles), and `src/05-app.html` (modules at the end of the IIFE).

## The shared seed

`mulberry32(daySeed())` in `05-app.html` — one deterministic PRNG keyed to the
UTC date, so every visitor on the same broadcast day sees the same paperwork:

- **Codeword** — `codewordFor(offsetDays)` picks from `ITC_WORDS` (all five
  letters, never a J: P888 promises FIVE GROUPS and the square files J under I).
- **REF number** — `refNum()` gives the day's `86-XXXX` file reference; it
  appears on the desk and in every composed subject line.
- **P500 HUBS TODAY** — hub conditions roll daily (`daySeed(0) ^ 0x7EB5` so the
  conditions don't correlate with the codeword pick); local times are real
  (`Intl.DateTimeFormat` with per-hub IANA zones).
- **Broadcast day** — days since 2026-01-01, printed on P500.

## CH 07 — ACI TEXT

Stacked real `<article class="tt-page">`s inside `#ttScreen`. With no JS the
section reads top-to-bottom as a plain document (`html:not(.js)` hides only
the keypad). The JS module adds `.live` to collapse it into a one-page
decoder:

- Page numbers dial via on-screen keypad, keyboard digits (only while the
  section is on screen via IntersectionObserver, never while a form field or
  the remote has focus, and never on a `defaultPrevented` event), FASTEXT
  colour keys, or index links (real `#tt-NNN` anchors, so they still work
  no-JS by jumping down the stack).
- The row-reveal paints rows in scanline order: each child gets `--r` at init;
  CSS staggers `animation-delay: calc(var(--r) * 42ms)`. Dual RM kill.
- Unknown page: the P-number blinks red, "not in service", reverts.
- The mosaic wordmark is decoded from bitmask strings into SVG rects at init —
  the same trick a SAA5050 pulled with 2×3 sixels, done in ~20 lines.
- P888 (CIPHER DESK) is deliberately not in the index; the numbers station's
  ticker and the fleet log point to it.

## CH 06 — The Traffic Desk

The desk is a real `<form>` (labeled fields, native radios restyled) that
live-composes an honest `mailto:` into `#btnRec` — subject
`[ACI-86-XXXX] CLASS — NAME [AUTH]`, body with a filing header. Law: the UI
promises *filing*, never *receipt* ("handed to your mail app. Not sent yet").
`[Copy Transmission]` is co-equal, reusing the copyEmail clipboard idiom.

- The textarea is the tape: 1400 chars ≈ 90 seconds; `TAPE REM M:SS` counts
  down and the supply reel's pancake radius drains into the take-up reel
  (SVG `r` attributes, updated on input only).
- Reels spin and the VU needle kicks with keystroke cadence through the shared
  `addTask` ticker (velocity decay; the task returns false when settled so the
  rAF loop can sleep). All of it is `aria-hidden` decoration; RM keeps it
  static while the form stays fully functional.
- REC adds a DTMF dial-out — three genuine 852+1477 Hz "9"s for 99.9 — before
  the existing answering-machine tone. Gated on `AE.on` like all SFX.
- The codeword field checks against today's and yesterday's word (UTC-midnight
  grace); a match flips the status line and stamps `[AUTH]` on the subject.
- `⏏ Eject Contact Card` downloads a client-side vCard (Blob + `a[download]`,
  ~15 lines, zero requests).
- Draft survives the tab via the `store` facade (`aci_desk`).

## Skywave Intercept — the numbers station

`itcArm()` is called by `radioOn` (cleared by `radioOff`): every 4–7 radio
minutes, gated on `AE.on && !document.hidden`, the record ducks
(`musicBus` ramp — the 128-step engine is never touched), a filtered-noise
carrier swells, a minor interval signal plays twice, and five two-figure
groups beep out (dual sines pitched by digit, scheduled on the WebAudio
clock). The ticker narrates in step; the `intercepting` flag keeps
`npUpdate()` out until MSG ENDS (same ownership pattern as `spooling` on the
tape counter). Afterwards the fleet log gets `INTERCEPT LOGGED, SEE TEXT P888`
— the silent path for radio-off visitors. Debug: `window.__aciIntercept()`.

Decode: groups are row-col on P888's Polybius square → the day's codeword →
the desk's codeword field → `[AUTH]` in the owner's inbox. That subject flag
is the point: it marks correspondents who actually explored the tape.

## The Remote

`#remote` is a `popover` (top layer — clears the fx stack with no z-index),
opened by the declarative `popovertarget` chip in the HUD, animated in via
`@starting-style` + `transition-behavior: allow-discrete`. Channel keys are
real `data-ch` anchors, so they ride the existing nav delegation (burst +
scroll + focus) and work no-JS; FX/FM/Rew delegate to the canonical buttons
(`.click()` inside a real activation, so FM works first press); digits 1–7
punch channels while it's open. Feature-detect hides the chip where popover
is unsupported. On phones it docks as a bottom sheet.

## Tape Remaining (HUD gauge)

Pure CSS scroll-driven animation inside
`@supports (animation-timeline: scroll())`: reels spin, the supply pancake
shrinks while take-up grows, and the `REM 0:NN` countdown is a registered
`<integer>` custom property keyframed along the scroll timeline and rendered
with `counter()`. Zero JS, zero rAF cost. Firefox (no support) never sees it;
the 640px media query hides it too. `#hudCounter` and its `spooling`
arbitration are untouched — this is a separate read-only surface.

## Eject Sequence (Side A ↔ Side B)

`@view-transition { navigation: auto }` in both pages plus old/new root
keyframes (transform/opacity only): Side A drops into the deck, Side B rises.
`<script type="speculationrules">` prerenders the other side on hover intent
(`eagerness: moderate`), which is safe because Side B self-heals zero-size
loads (`drive/03-app.html`, the `vh < 2` power-on recovery). RM is dual-path:
the media query sets `navigation: none`; `html.rm` gets `animation: none`
(instant cut).

## The html.js law (new, and it fixed a latent bug)

JS-only chrome gates on `html.js` (class added by the boot inline script),
because the head `<noscript>` block **cannot** hide anything that declares its
own `display` in the body stylesheet — the body sheet wins the cascade. That
was silently breaking `.boot` for no-JS visitors (stuck curtain, since
`.boot` is `display:flex`); `.boot` and `.fleet-actions` are now gated on
`html:not(.js)` alongside the desk, the teletext keypad, and the remote's JS
keys. Rule going forward: never add a JS-only element to the noscript list —
gate it on `html.js`.
