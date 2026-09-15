/**
 * Clears optional cover preloads. Real LCP on mobile is logo/H1 —
 * grid covers are below the fold and must not compete for bandwidth.
 */
import { readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const markerStart = '<!-- LCP_PRELOADS_START -->';
const markerEnd = '<!-- LCP_PRELOADS_END -->';
const block = `${markerStart}\n    ${markerEnd}`;

const indexPath = join(root, 'index.html');
let html = readFileSync(indexPath, 'utf8');
if (html.includes(markerStart) && html.includes(markerEnd)) {
  html = html.replace(new RegExp(`${markerStart}[\\s\\S]*?${markerEnd}`), block);
  writeFileSync(indexPath, html, 'utf8');
  console.log('Cleared cover LCP preloads (logo remains the high-priority preload)');
} else {
  console.warn('inject-lcp-preloads: markers missing in index.html');
}
