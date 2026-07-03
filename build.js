#!/usr/bin/env node
/*
 * Build: concatenates src parts, embeds fonts + map data, emits:
 *   index.html    (standalone page, served by GitHub Pages)
 *   fragment.html (headless fragment for claude.ai artifact redeploys; gitignored)
 */
const fs = require('fs');
const path = require('path');
const src = p => path.join(__dirname, 'src', p);

let html = ['01-style-a.html', '02-style-b.html', '03-body.html', '05-app.html']
  .map(f => fs.readFileSync(src(f), 'utf8'))
  .join('\n');

// Map data injected as its own script before the app script
const mapData = fs.readFileSync(src('04-mapdata.js'), 'utf8');
html = html.replace('/*__MAPDATA__*/', mapData);

// Fonts
for (const [ph, file] of [
  ['__AUDIOWIDE__', 'fonts/audiowide.b64'],
  ['__VT323__', 'fonts/vt323.b64'],
  ['__YELLOWTAIL__', 'fonts/yellowtail.b64'],
]) {
  html = html.replace(ph, fs.readFileSync(src(file), 'utf8').trim());
}

if (/__[A-Z]+__/.test(html)) {
  console.error('ERROR: unreplaced placeholder remains');
  process.exit(1);
}

fs.writeFileSync(path.join(__dirname, 'fragment.html'), html);
const wrapped = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="description" content="Andrew Caleb International. Go Anywhere, Meet Anyone. Global prospecting, fleet tracking, and ventures worldwide.">
</head>
<body>
${html}
</body>
</html>
`;
fs.writeFileSync(path.join(__dirname, 'index.html'), wrapped);
console.log('built index.html (' + (wrapped.length / 1024).toFixed(0) + 'KB) + fragment.html');
