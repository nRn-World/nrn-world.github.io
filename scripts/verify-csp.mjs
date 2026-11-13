/**
 * Guard the CSP in vercel.json against the built HTML.
 *
 * The policy allows the site's inline scripts by SHA-256 hash instead of
 * 'unsafe-inline'. If an inline script changes (or a new one appears), the hash
 * list goes stale and the browser silently blocks that script, so fail the build
 * and print the exact directive to paste back into vercel.json.
 */
import { createHash } from 'crypto';
import { readFileSync, readdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');

const csp = JSON.parse(readFileSync(join(root, 'vercel.json'), 'utf8'))
  .headers.flatMap((rule) => rule.headers)
  .find((h) => h.key.toLowerCase() === 'content-security-policy')?.value;

if (!csp) {
  console.error('verify-csp: no Content-Security-Policy header in vercel.json');
  process.exit(1);
}

// public/_headers ships the same policy on hosts that read it (Cloudflare Pages, Netlify).
const headersCsp = readFileSync(join(root, 'public/_headers'), 'utf8').match(
  /^\s*Content-Security-Policy:[ \t]*([^\r\n]*)/m,
)?.[1];
if (headersCsp !== csp) {
  console.error('verify-csp: public/_headers and vercel.json disagree on Content-Security-Policy.');
  process.exit(1);
}

const directives = new Map(
  csp
    .split(';')
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const [name, ...values] = part.split(/\s+/);
      return [name.toLowerCase(), values];
    }),
);

function findHtml(dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...findHtml(full));
    else if (entry.name.endsWith('.html')) out.push(full);
  }
  return out;
}

const inlineHashes = new Set();
const externalOrigins = new Set();

for (const path of findHtml(dist)) {
  const html = readFileSync(path, 'utf8');
  for (const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    const attrs = match[1] ?? '';
    const body = match[2] ?? '';
    const src = attrs.match(/\bsrc\s*=\s*"([^"]+)"/i)?.[1];

    if (src) {
      if (/^https?:\/\//i.test(src)) externalOrigins.add(new URL(src).origin);
      continue;
    }
    // JSON-LD and other data blocks are not executed, so CSP ignores them.
    if (/type\s*=\s*"application\/(?:ld\+json|json)"/i.test(attrs)) continue;
    if (!body.trim()) continue;

    inlineHashes.add(`'sha256-${createHash('sha256').update(body, 'utf8').digest('base64')}'`);
  }
}

const allowedHashes = new Set((directives.get('script-src') ?? []).filter((v) => v.startsWith("'sha256-")));
const scriptSrc = directives.get('script-src') ?? [];

const missingHashes = [...inlineHashes].filter((h) => !allowedHashes.has(h));
const staleHashes = [...allowedHashes].filter((h) => !inlineHashes.has(h));
const missingOrigins = [...externalOrigins].filter((origin) => !scriptSrc.includes(origin));

if (missingHashes.length || missingOrigins.length) {
  if (missingHashes.length) {
    console.error(`verify-csp: script-src is missing ${missingHashes.length} inline script hash(es):`);
    for (const h of missingHashes) console.error(`  ${h}`);
  }
  if (missingOrigins.length) {
    console.error(`verify-csp: script-src is missing ${missingOrigins.length} script origin(s):`);
    for (const o of missingOrigins) console.error(`  ${o}`);
  }
  console.error('verify-csp: update the Content-Security-Policy value in vercel.json.');
  process.exit(1);
}

if (staleHashes.length) {
  console.warn(`verify-csp: ${staleHashes.length} unused inline script hash(es) in script-src (harmless, can be pruned):`);
  for (const h of staleHashes) console.warn(`  ${h}`);
}

console.log(
  `verify-csp: ok (${inlineHashes.size} inline script hash(es), ${externalOrigins.size} external script origin(s))`,
);
