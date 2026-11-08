/**
 * Inject a crawlable index into the hub's static HTML.
 *
 * The React app renders the project list client-side, so the HTML Googlebot
 * gets first contains no links at all. This adds real <a href> links to every
 * project page and every live app (which lives on its own GitHub Pages site).
 */
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { loadSeoProjects, SITE } from './lib/seo-projects.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
const projects = loadSeoProjects();

function esc(s) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const appUrls = [
  ...new Set(
    projects
      .map((p) => p.liveDemoUrl)
      .filter((u) => typeof u === 'string' && u.startsWith(`${SITE.origin}/`)),
  ),
];

const appItems = projects
  .filter((p) => p.liveDemoUrl && appUrls.includes(p.liveDemoUrl))
  .map((p) => `<li><a href="${esc(p.liveDemoUrl)}">${esc(p.name)}</a> – ${esc(p.tagline)}</li>`)
  .join('');

const projectItems = projects
  .map((p) => `<li><a href="/p/${p.slug}/">${esc(p.name)}</a> – ${esc(p.tagline)}</li>`)
  .join('');

const block = `
      <p>${projects.length} open source projects and ${appUrls.length} live web apps, built by nRnWorld. Everything runs in the browser, free of charge.</p>
      <h2>Live web apps</h2>
      <ul>${appItems}</ul>
      <h2>Guides</h2>
      <ul><li><a href="/parkering-stockholm/">Parkering i Stockholm – taxor och priser</a></li><li><a href="/nodnummer-europa/">Nödnummer i Europa – 112 och lokala nummer</a></li></ul>
      <h2>All projects</h2>
      <ul>${projectItems}</ul>`;

const rootRe = /(<div id="root">\s*<main>\s*<h1>[^<]*<\/h1>)([\s\S]*?)(<\/main>)/;

let changed = 0;
for (const file of ['index.html', '404.html']) {
  const path = join(dist, file);
  if (!existsSync(path)) continue;
  const html = readFileSync(path, 'utf8');
  if (!rootRe.test(html)) {
    console.warn(`inject-site-index: no root placeholder in ${file}`);
    continue;
  }
  writeFileSync(path, html.replace(rootRe, (_, open, _inner, close) => `${open}${block}${close}`), 'utf8');
  changed += 1;
}

console.log(`Injected static site index into ${changed} page(s): ${appUrls.length} apps, ${projects.length} projects`);
