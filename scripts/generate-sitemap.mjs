import { writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { loadSeoProjects, SITE } from './lib/seo-projects.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const projects = loadSeoProjects();
const today = new Date().toISOString().slice(0, 10);

const urls = [
  {
    loc: `${SITE.origin}/`,
    lastmod: today,
    changefreq: 'daily',
    priority: '1.0',
  },
  ...projects.map((p) => ({
    loc: `${SITE.origin}/${p.slug}`,
    lastmod: p.releaseDate || today,
    changefreq: 'weekly',
    priority: '0.8',
  })),
];

const body = urls
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
  )
  .join('\n');

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`;

writeFileSync(join(root, 'public/sitemap.xml'), xml, 'utf8');
console.log(`Wrote sitemap.xml with ${urls.length} URLs`);
