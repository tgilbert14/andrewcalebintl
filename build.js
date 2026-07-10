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

// Operator feeds: profile.b64 is the broadcast portrait (feed A, shades on),
// profile_alt.b64 is the frame that bleeds through on tracking slips and on
// tap-to-tune (feed B, shades off). Both webp base64. Without profile.b64 the
// classified silhouette ships and the reveal code stays dormant.
const FEEDS = [
  ['profile.b64', 'portrait feed-a', 'Andrew Caleb, the operator'],
  ['profile_alt.b64', 'portrait feed-b', 'Andrew Caleb, feed B'],
];
html = html.replace('<!--OPERATOR-->', FEEDS
  .filter(([f]) => fs.existsSync(src(f)))
  .map(([f, cls, alt]) =>
    '<img class="' + cls + '" alt="' + alt + '" src="data:image/webp;base64,'
    + fs.readFileSync(src(f), 'utf8').trim() + '">')
  .join(''));

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

// index.html gets a real <head>: hoist the fragment's <title> up (it stays in
// fragment.html so artifact embeds keep their tab name), plus icon/theme/social
// meta and a no-JS escape hatch for the boot overlay.
const DESC = 'Andrew Caleb International. Go Anywhere, Meet Anyone. Global prospecting, fleet tracking, and ventures worldwide.';
const FAVICON = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='10' fill='%23120230'/%3E%3Cpolygon points='22,16 50,32 22,48' fill='%23ff00ff'/%3E%3Cpolygon points='18,16 46,32 18,48' fill='%2300f2ff' opacity='.55'/%3E%3C/svg%3E";
const bodyHtml = html.replace(/^<title>.*?<\/title>\s*/, '');
const wrapped = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Andrew Caleb International</title>
<meta name="description" content="${DESC}">
<meta name="theme-color" content="#120230">
<link rel="icon" href="${FAVICON}">
<meta property="og:type" content="website">
<meta property="og:title" content="Andrew Caleb International">
<meta property="og:description" content="${DESC}">
<meta property="og:url" content="https://www.andrewcalebintl.com/">
<meta property="og:image" content="https://www.andrewcalebintl.com/og.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<noscript><style>.boot{display:none}.fleet-wrap,.fleet-log,.fleet-actions{display:none}</style></noscript>
</head>
<body>
${bodyHtml}
</body>
</html>
`;
fs.writeFileSync(path.join(__dirname, 'index.html'), wrapped);
console.log('built index.html (' + (wrapped.length / 1024).toFixed(0) + 'KB) + fragment.html');
