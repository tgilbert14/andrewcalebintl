# Andrew Caleb International

Retro VHS / Vice City site for [andrewcalebintl.com](https://www.andrewcalebintl.com/): "Go Anywhere, Meet Anyone."

One self-contained page, zero external requests: fonts, world map, music, and FX are all embedded. Vanilla HTML/CSS/JS, no frameworks.

## Features

- CRT boot screen, scanlines, VHS tracking rolls, channel-change static
- Operations Fleet Tracker: real world map (Natural Earth data) with live planes, boats, a satellite, hub tooltips, and a transmission log
- ACI Skywave 99.9 FM: four original synthwave tracks synthesized in WebAudio (own tempo, key, drums, and lead per track), rotating under a station-ident sting (toggle in the corner HUD)
- CH 07 &middot; ACI TEXT: a working Ceefax-style teletext service — the company pages (capabilities, engagement terms, the operator) dialed by page number, colour keys, or keyboard, with a date-seeded HUBS TODAY page and a certain page that isn't in the index
- CH 06 &middot; The Traffic Desk: contact as a working answering machine — traffic-class routing, message-as-tape with a TAPE REMAINING counter, spinning reels + VU meter, a live-composed mailto with the day's REF number, co-equal copy-transmission fallback, and an ejectable vCard contact card
- Skywave Intercept: leave the radio on long enough and a numbers station cuts in — five two-figure groups that decode against TEXT P888 into the broadcast day's codeword (the desk knows the word)
- The Remote: a Popover-API VCR remote in the HUD (`RC` chip) — punch channels 1–7, transport keys, FX/FM, share-a-channel, and the cheat index
- Tape Remaining: a zero-JS CSS scroll-driven reel gauge in the HUD — scroll position is tape position (`animation-timeline: scroll()`)
- Eject Sequence: flipping to Side B performs a cross-document View Transition (with Speculation-Rules prerender so the cut is instant); Firefox just navigates
- A certain car that drives by now and then
- Cheat code: the footer tells you; the Remote's CODES card tells you more

See `docs/broadcast-day.md` for how the daily seed, the teletext service, the desk, and the numbers station interlock.

## Develop

Edit files in `src/`, then:

```
node build.js
```

Outputs `index.html` (the site, served by GitHub Pages from the repo root) and `fragment.html` (headless copy for artifact embeds, gitignored).

Optional: drop base64-encoded webp portraits at `src/profile.b64` (feed A) and `src/profile_alt.b64` (feed B) and the build inlines them into the CH 05 feed. First scroll-in plays the "signal acquisition" reveal; with both feeds present, tap/Enter retunes between A and B, and the tape's tracking occasionally slips to the other frame for a blink. Without the files, the classified silhouette ships and all of it stays dormant.

`og.png` is the social-share card (referenced by `og:image`; fetched by link scrapers only, never by the page itself — the zero-external-request rule holds at runtime).

Map geometry is derived from [Natural Earth](https://www.naturalearthdata.com/) (public domain) via `world-atlas` 110m, pre-baked into `src/04-mapdata.js`.

Fonts (Audiowide, Yellowtail, VT323, all OFL) are embedded as base64 woff2 latin subsets in `src/fonts/`.
