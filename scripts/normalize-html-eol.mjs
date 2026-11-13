/**
 * Normalise the built HTML to LF line endings.
 *
 * The CSP in vercel.json pins the site's inline scripts by SHA-256, and those hashes
 * depend on the exact bytes served. A Windows checkout (autocrlf) produces CRLF while
 * the CI runner checks out LF, which made local and deployed hashes disagree and broke
 * the Pages build. Rewriting dist to a single line ending makes the served bytes
 * deterministic no matter where the build runs.
 */
import { readFileSync, readdirSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');

function findHtml(dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...findHtml(full));
    else if (entry.name.endsWith('.html')) out.push(full);
  }
  return out;
}

const pages = findHtml(dist);
let changed = 0;

for (const path of pages) {
  const source = readFileSync(path, 'utf8');
  const normalised = source.replace(/\r\n/g, '\n');
  if (normalised !== source) {
    writeFileSync(path, normalised, 'utf8');
    changed += 1;
  }
}

console.log(`normalize-html-eol: ${changed} of ${pages.length} page(s) rewritten to LF`);
