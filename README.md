# Andrew Caleb International

Retro VHS / Vice City site for [andrewcalebintl.com](https://www.andrewcalebintl.com/): "Go Anywhere, Meet Anyone."

One self-contained page, zero external requests: fonts, world map, music, and FX are all embedded. Vanilla HTML/CSS/JS, no frameworks.

## Features

- CRT boot screen, scanlines, VHS tracking rolls, channel-change static
- Operations Fleet Tracker: real world map (Natural Earth data) with live planes, boats, a satellite, hub tooltips, and a transmission log
- Original synthwave radio loop synthesized in WebAudio (toggle in the corner HUD)
- A certain car that drives by now and then
- Cheat code: the footer tells you

## Develop

Edit files in `src/`, then:

```
node build.js
```

Outputs `index.html` (the site, served by GitHub Pages from the repo root) and `fragment.html` (headless copy for artifact embeds, gitignored).

Map geometry is derived from [Natural Earth](https://www.naturalearthdata.com/) (public domain) via `world-atlas` 110m, pre-baked into `src/04-mapdata.js`.

Fonts (Audiowide, Yellowtail, VT323, all OFL) are embedded as base64 woff2 latin subsets in `src/fonts/`.
