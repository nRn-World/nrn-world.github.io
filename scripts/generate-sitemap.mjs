import { writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { loadSeoProjects, SITE } from './lib/seo-projects.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const projects = loadSeoProjects();
const today = new Date().toISOString().slice(0, 10);

const staticPages = [
  {
    loc: `${SITE.origin}/`,
    lastmod: today,
    changefreq: 'daily',
    priority: '1.0',
  },
  {
    loc: `${SITE.origin}/nodnummer-europa/`,
    lastmod: today,
    changefreq: 'monthly',
    priority: '0.8',
  },
  {
    loc: `${SITE.origin}/parkering-stockholm/`,
    lastmod: today,
    changefreq: 'monthly',
    priority: '0.8',
  },
  {
    loc: `${SITE.origin}/privacy/`,
    lastmod: today,
    changefreq: 'yearly',
    priority: '0.3',
  },
];

// Live apps are separate GitHub Pages sites on the same host (e.g. /ParkiSthlm/).
// They carry the real search demand, so list them and let Google discover them here.
const appPages = [
  ...new Map(
    projects
      .filter((p) => p.liveDemoUrl && p.liveDemoUrl.startsWith(`${SITE.origin}/`))
      .map((p) => [
        p.liveDemoUrl,
        {
          loc: p.liveDemoUrl,
          lastmod: p.releaseDate || today,
          changefreq: 'weekly',
          priority: '0.9',
        },
      ]),
  ).values(),
];

const urls = [
  ...staticPages,
  ...appPages,
  ...projects.map((p) => ({
    loc: `${SITE.origin}/p/${p.slug}/`,
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

// A sitemap index gives search engines a second, independent entry point.
// Bing kept a stale "page is not accessible" verdict on /sitemap.xml, so a
// fresh URL lets it re-crawl without waiting for that row to clear.
const indexXml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${SITE.origin}/sitemap.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
</sitemapindex>
`;

writeFileSync(join(root, 'public/sitemap-index.xml'), indexXml, 'utf8');
console.log('Wrote sitemap-index.xml');
