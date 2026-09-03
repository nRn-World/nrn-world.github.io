/**
 * After Vite build: make CSS non-blocking and keep a tiny critical inline style.
 */
import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';

const dist = join(process.cwd(), 'dist');
const indexPath = join(dist, 'index.html');
let html = readFileSync(indexPath, 'utf8');

const critical =
  '<style>html,body{background:#0C1014;color:#E0E0E0;margin:0}#root{min-height:100vh}</style>';

if (!html.includes('html,body{background:#0C1014')) {
  html = html.replace('</head>', `    ${critical}\n  </head>`);
}

html = html.replace(
  /<link([^>]*\brel="stylesheet"[^>]*href="[^"]+\.css"[^>]*)\/?>/gi,
  (full, attrs) => {
    if (attrs.includes('media=')) return full;
    return `<link${attrs} media="print" onload="this.media='all'" /><noscript><link${attrs} /></noscript>`;
  }
);

// Also handle href-before-rel attribute order from Vite
html = html.replace(
  /<link([^>]*\bhref="[^"]+\.css"[^>]*\brel="stylesheet"[^>]*)\/?>/gi,
  (full, attrs) => {
    if (full.includes("media=\"print\"") || attrs.includes('media=')) return full;
    return `<link${attrs} media="print" onload="this.media='all'" /><noscript><link${attrs} /></noscript>`;
  }
);

writeFileSync(indexPath, html, 'utf8');
console.log('Deferred CSS in dist/index.html');
