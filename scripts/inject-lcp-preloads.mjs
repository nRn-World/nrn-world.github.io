/**
 * Inject <link rel="preload"> for the top hub cover images (featured/newest order)
 * so LCP is discoverable in the initial HTML document.
 */
import { readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const seed = JSON.parse(readFileSync(join(root, 'src/data/githubStatsSeed.json'), 'utf8'));
const projectsSrc = readFileSync(join(root, 'src/data/projectsData.ts'), 'utf8');
const imagesSrc = readFileSync(join(root, 'src/data/projectImages.ts'), 'utf8');

/** @type {Record<string, string>} */
const imgMap = {};
for (const line of imagesSrc.split('\n')) {
  const keyMatch = line.match(/^\s+(\w+):\s*\[/);
  if (keyMatch) {
    const nextImg = imagesSrc
      .slice(imagesSrc.indexOf(line))
      .split('\n')
      .slice(0, 6)
      .map((l) => l.match(/'(\/images\/projects\/[^']+)'/)?.[1])
      .find(Boolean);
    if (nextImg) imgMap[keyMatch[1]] = nextImg;
  }
}

/** @type {{ id: string, img: string, ts: number }[]} */
const projects = [];
const projectBlocks = projectsSrc.split(/\n  \{\n/);
for (const chunk of projectBlocks) {
  const id = chunk.match(/id:\s*'([^']+)'/)?.[1];
  const githubUrl = chunk.match(/githubUrl:\s*'([^']+)'/)?.[1];
  const imgKey = chunk.match(/PROJECT_IMAGES\.(\w+)/)?.[1];
  if (!id || !githubUrl || !imgKey) continue;
  const repo = githubUrl.replace(/\/+$/, '').split('/').pop();
  const pushed = seed.repos?.[repo]?.githubPushedAt;
  const ts = pushed ? Date.parse(pushed) : 0;
  const img = imgMap[imgKey];
  if (img) projects.push({ id, img, ts });
}

projects.sort((a, b) => b.ts - a.ts);
const top = [...new Set(projects.map((p) => p.img))].slice(0, 1);

if (top.length === 0) {
  console.warn('inject-lcp-preloads: no cover images found');
} else {
  console.log(
    'LCP preload order:',
    projects
      .slice(0, 1)
      .map((p) => `${p.id}→${p.img}`)
      .join(', ')
  );
}

const preloadHtml = top
  .map((src, i) => {
    const type = src.endsWith('.svg') ? 'image/svg+xml' : 'image/webp';
    const prio = i === 0 ? ' fetchpriority="high"' : '';
    return `    <link rel="preload" as="image" href="${src}" type="${type}"${prio} />`;
  })
  .join('\n');

const markerStart = '<!-- LCP_PRELOADS_START -->';
const markerEnd = '<!-- LCP_PRELOADS_END -->';
const block = `${markerStart}\n${preloadHtml}\n    ${markerEnd}`;

const indexPath = join(root, 'index.html');
let html = readFileSync(indexPath, 'utf8');
if (html.includes(markerStart) && html.includes(markerEnd)) {
  html = html.replace(new RegExp(`${markerStart}[\\s\\S]*?${markerEnd}`), block);
} else {
  html = html.replace(
    '<link rel="manifest" href="/manifest.json" />',
    `<link rel="manifest" href="/manifest.json" />\n    ${block}`
  );
}
writeFileSync(indexPath, html, 'utf8');
console.log('Injected LCP preloads:', top.join(', ') || '(none)');
