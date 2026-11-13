/**
 * Mirror the Content-Security-Policy into the served HTML as a <meta http-equiv>.
 *
 * The authoritative policy lives in vercel.json and is sent as a response header by
 * Vercel and by server.js. GitHub Pages cannot send response headers at all, so on the
 * live host the policy only exists if it is also delivered in the document. Injected
 * before the project pages are prerendered, so they inherit it from index.html.
 *
 * `frame-ancestors` is dropped: browsers ignore it in a meta element.
 */
import { readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const csp = JSON.parse(readFileSync(join(root, 'vercel.json'), 'utf8'))
  .headers.flatMap((rule) => rule.headers)
  .find((header) => header.key.toLowerCase() === 'content-security-policy')?.value;

if (!csp) {
  console.error('inject-csp-meta: no Content-Security-Policy in vercel.json');
  process.exit(1);
}

const metaValue = csp
  .split(';')
  .map((directive) => directive.trim())
  .filter((directive) => directive && !directive.startsWith('frame-ancestors'))
  .join('; ');

const tag = `<meta http-equiv="Content-Security-Policy" content="${metaValue}" />`;
const path = join(root, 'dist', 'index.html');
const html = readFileSync(path, 'utf8');

if (html.includes('http-equiv="Content-Security-Policy"')) {
  console.log('inject-csp-meta: already present');
  process.exit(0);
}

if (!html.includes('<head>')) {
  console.error('inject-csp-meta: no <head> in dist/index.html');
  process.exit(1);
}

writeFileSync(path, html.replace('<head>', `<head>\n    ${tag}`), 'utf8');
console.log(`inject-csp-meta: injected ${metaValue.split(';').length} directive(s)`);
