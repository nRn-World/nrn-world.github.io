import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { loadSeoProjects, SITE } from './lib/seo-projects.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
const template = readFileSync(join(dist, 'index.html'), 'utf8');
const projects = loadSeoProjects();

function escapeHtml(s) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function replaceMeta(html, { title, description, url, image, type }) {
  let out = html;
  out = out.replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(title)}</title>`);

  const setName = (name, content) => {
    const re = new RegExp(`<meta\\s+name="${name}"\\s+content="[^"]*"\\s*/?>`, 'i');
    const tag = `<meta name="${name}" content="${escapeHtml(content)}" />`;
    if (re.test(out)) out = out.replace(re, tag);
    else out = out.replace('</head>', `    ${tag}\n  </head>`);
  };

  const setProp = (property, content) => {
    const re = new RegExp(`<meta\\s+property="${property}"\\s+content="[^"]*"\\s*/?>`, 'i');
    const tag = `<meta property="${property}" content="${escapeHtml(content)}" />`;
    if (re.test(out)) out = out.replace(re, tag);
    else out = out.replace('</head>', `    ${tag}\n  </head>`);
  };

  setName('description', description);
  setName('twitter:title', title);
  setName('twitter:description', description);
  setName('twitter:image', image);
  setName('twitter:card', 'summary_large_image');

  setProp('og:title', title);
  setProp('og:description', description);
  setProp('og:url', url);
  setProp('og:type', type);
  setProp('og:image', image);
  setProp('og:site_name', SITE.name);

  const canonRe = /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/i;
  const canon = `<link rel="canonical" href="${escapeHtml(url)}" />`;
  if (canonRe.test(out)) out = out.replace(canonRe, canon);
  else out = out.replace('</head>', `    ${canon}\n  </head>`);

  // Per-project SoftwareApplication JSON-LD (keep global ItemList too)
  const appLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: title.split(' – ')[0],
    description,
    url,
    image,
    applicationCategory: type === 'website' ? 'WebApplication' : 'UtilitiesApplication',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    author: { '@type': 'Organization', name: SITE.name, url: SITE.origin },
  };
  const appScript = `<script type="application/ld+json">${JSON.stringify(appLd)}</script>`;
  out = out.replace('</body>', `    ${appScript}\n  </body>`);

  return out;
}

let count = 0;
for (const p of projects) {
  const title = `${p.name} – Direct Download & Details | nRnWorld`;
  const description = `${p.tagline || p.description} Download official releases, explore specs, and view changelogs on nRnWorld.`;
  const url = `${SITE.origin}/${p.slug}`;
  const html = replaceMeta(template, {
    title,
    description,
    url,
    image: p.coverImage,
    type: 'article',
  });

  const dir = join(dist, p.slug);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'index.html'), html, 'utf8');
  count += 1;
}

console.log(`Prerendered ${count} project pages into dist/*/index.html`);
