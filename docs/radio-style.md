# ACI Skywave 99.9 FM — the radio, portable

A reference for reusing this site's radio (the look **and** the engine) on another
project (Tim's portfolio). Everything below is extracted from `src/01-style-a.html`
(chip + ticker CSS) and `src/05-app.html` (the WebAudio engine); the live original is
CH-hopping at [andrewcalebintl.com](https://www.andrewcalebintl.com/).

## The look

The radio is a **VCR OSD chip**, not a media player. No play triangle icons, no
progress bar, no album art. It reads like text burned into a CRT by the tuner:

- **Font:** VT323 (Google Fonts, OFL) — the whole radio UI is this one monospace
  terminal face, uppercase, letter-spaced. Fallback `'Courier New', monospace`.
- **Palette:** amber `#ffcc00` for OSD text (with a soft amber glow), signal cyan
  `#00f2ff` for the on-state border/dot, on a near-black violet ground `#120230`.
- **Off state:** `FM 99.9 [Tune]` — square brackets are the affordance ("this is a
  control"), thin amber border at 40% opacity.
- **On state:** `■ 99.9 On Air` + a small blinking cyan "live" dot. The stop-square
  glyph makes the chip read as the off switch while it plays. Border turns cyan
  with an outer glow.
- **Now playing:** a marquee ticker next to the chip — `NOW PLAYING: "Track" ·
  Artist · STATION NAME` — that only exists while the radio is on.
- **Auto-start cue (if you auto-start):** pulse the chip 3 blinks when audio starts
  from anything other than a direct click, so the sound has a visible source.

### Chip CSS (copy-paste, tokens inlined)

```css
.audio-btn {
  background: none; border: 1px solid rgba(255,204,0,.4);
  padding: 1px 8px 0; cursor: pointer;
  font-family: 'VT323', 'Courier New', monospace; font-size: 16px;
  letter-spacing: .08em; color: #ffcc00;
  text-transform: uppercase;
}
.audio-btn:hover { border-color: #ffcc00; background: rgba(255,204,0,.08); }
.audio-btn.on { border-color: #00f2ff; box-shadow: 0 0 10px rgba(0,242,255,.45); }
.audio-btn.on .livedot {
  display: inline-block; width: .45em; height: .45em;
  background: #00f2ff; border-radius: 50%;
  margin-left: .35em; vertical-align: .08em;
  animation: osdblink 1.2s steps(1) infinite;
}
@keyframes osdblink { 0%, 100% { opacity: 1; } 50% { opacity: .15; } }
.audio-btn.pulse { animation: osdblink .45s steps(1) 3; } /* auto-start attention cue */
```

### Marquee ticker CSS

```css
.np {
  display: inline-block; max-width: 26ch; overflow: hidden; white-space: nowrap;
  font-family: 'VT323', monospace; font-size: 16px;
  color: rgba(255,204,0,.85); letter-spacing: .06em;
  text-shadow: 2px 2px 0 rgba(0,0,0,.85);
}
.np[hidden] { display: none; } /* author display beats [hidden] — must be explicit */
.np .np-inner { display: inline-block; padding-left: 100%; animation: npmarq 12s linear infinite; }
@keyframes npmarq { to { transform: translateX(-100%); } }
```

### Markup + a11y (this part is what makes it not-ugly to a screen reader)

```html
<button class="audio-btn" id="audioBtn" aria-pressed="false"
        aria-label="Play radio: Station Name">FM 99.9 [Tune]</button>
<span class="np" id="npTicker" hidden><span class="np-inner" id="npText"></span></span>
```

- Toggle `aria-pressed`, and flip `aria-label` between "Play radio…"/"Stop radio…".
- Never put the chip inside an `aria-hidden` wrapper (a hidden ancestor cannot be
  re-exposed by a descendant — the control becomes a focusable ghost).
- Reduced motion: kill `osdblink` / `npmarq` under `html.rm` AND inside
  `@media (prefers-reduced-motion: reduce)`.

## The engine (WebAudio, zero audio files)

All synthesized at runtime — no MP3s, nothing to host. Architecture in
`src/05-app.html`, search `ACI SKYWAVE`:

- **Graph:** voices → `musicBus` / `sfxBus` → one `DynamicsCompressor`
  (threshold −20, ratio 4) → `masterGain 0.12` → destination. A looped noise
  buffer low-passed at 6kHz sits under everything at gain 0.01 (tape hiss floor).
- **Data-driven tracks:** `TRACK_DEFS` — each record is pure data: `bpm`, an 8-bar
  `prog` of chord names, `chords` (pad voicings + bass root per name), `arps`
  (8-step figures per chord), `kick/snare/hat` 16-step patterns (hat `2` = open),
  `padCut` (pad lowpass cutoff = mood), and a sparse `melody` for bars 7–8.
  One `playStep(stepInBar, bar, time)` engine reads whatever the current def says.
- **Voices:** kick = sine 150→45Hz pitch drop; snare = highpassed noise + 190Hz
  triangle; hats = highpassed noise (7kHz); bass = saw + sub-square through a
  closing lowpass; pad = 3 detuned saws/triangle per note through a lowpass;
  arp = square through lowpass with a send into a **dotted-8th feedback delay**
  (delayTime = 3 × sixteenth, feedback 0.35 through a 500Hz highpass — this delay
  is 80% of the synthwave feel); lead = detuned saw+triangle with delayed vibrato.
- **Scheduler:** `setInterval(25ms)` + 0.12s look-ahead writing to the WebAudio
  clock; guard `if (nextT < now) nextT = now + 0.03` so stalls skip steps instead
  of flamming them. Track rotation waits for the loop boundary and lands under a
  **station ident** (rising bandpass noise sweep + root-fifth-octave motif in the
  new track's key).
- **Autoplay policy:** build the AudioContext lazily on first use; commit the UI
  to "on" only when `ctx.state === 'running'` (resume() silently stays suspended
  without a real user activation — synthetic `.click()` doesn't count).
- **Off means off:** ramp music AND hiss gains down, then `ctx.suspend()` ~500ms
  later so "off" stops rendering (battery, OS audio session). Resume + restore
  hiss gain on re-tune. Suspend on `visibilitychange` hidden; resume when visible
  if the radio was on.
- **Tuning hook:** `window.__aciSkipTrack()` jumps to the next record.

## Porting checklist for the portfolio

1. Load VT323 (`<link href="https://fonts.googleapis.com/css2?family=VT323&display=swap">`
   is fine on a portfolio; this repo embeds it as base64 woff2 to stay
   zero-request).
2. Copy the chip + ticker CSS above; adapt the two accent colors to the
   portfolio's palette if needed (keep the amber/cyan relationship: warm = text,
   cool = "live").
3. Lift the whole `ACI SKYWAVE` block from `src/05-app.html` (from `var NOTE_IDX`
   through `applyAudioUI`) — it has no dependencies beyond the `store`/`RM`
   helpers at the top of the file and the `$` query helper.
4. Rewrite `TRACK_DEFS` for the portfolio's mood, or keep one track and drop the
   rotation timer.
5. Keep the a11y contract: `aria-pressed`, dynamic `aria-label`, no aria-hidden
   ancestors, reduced-motion kills for the blink/marquee.
6. Decide the start policy. This site arms on scroll-down and starts on the next
   real activation; a portfolio is probably better off click-to-play only (skip
   the primer block entirely).
