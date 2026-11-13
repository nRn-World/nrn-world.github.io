/**
 * Mark external <script src="…"> tags in the built HTML as non-blocking.
 *
 * Vite emits the entry bundle as <script type="module" crossorigin src="/assets/index-*.js">
 * in <head> and every prerendered project page inherits that tag. Module scripts are
 * deferred by default, but the tag still reads as render-blocking to auditors, so add an
 * explicit `defer` (document order is preserved). Inline scripts, JSON-LD blocks and
 * scripts that are already async/defer are left untouched.
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

let touched = 0;
let total = 0;

for (const path of findHtml(dist)) {
  const html = readFileSync(path, 'utf8');
  let changed = 0;

  const out = html.replace(/<script\b([^>]*)>/gi, (tag, attrs) => {
    if (!/\bsrc\s*=/i.test(attrs)) return tag;
    if (/\b(?:async|defer)\b/i.test(attrs)) return tag;
    changed += 1;
    return `<script defer${attrs}>`;
  });

  if (changed > 0) {
    writeFileSync(path, out, 'utf8');
    touched += 1;
    total += changed;
  }
}

console.log(`defer-scripts: added defer to ${total} external script(s) in ${touched} page(s)`);
