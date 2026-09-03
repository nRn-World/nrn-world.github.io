/**
 * Generate RSS 2.0 feed from project data.
 */
import { writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { loadSeoProjects, SITE } from './lib/seo-projects.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const projects = loadSeoProjects();
const now = new Date().toUTCString();

function escapeXml(s) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const items = projects
  .sort((a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime())
  .map((p) => {
    const url = `${SITE.origin}/p/${p.slug}`;
    const desc = p.tagline || p.description;
    const pubDate = p.releaseDate ? new Date(p.releaseDate).toUTCString() : now;
    return `    <item>
      <title>${escapeXml(p.name)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${escapeXml(desc)}</description>
      <pubDate>${pubDate}</pubDate>
      <category>${escapeXml(p.category)}</category>
      ${p.coverImage ? `<enclosure url="${escapeXml(p.coverImage)}" type="image/webp" length="0" />` : ''}
    </item>`;
  })
  .join('\n');

const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE.name)} – Project Releases</title>
    <link>${SITE.origin}</link>
    <description>${escapeXml(SITE.defaultDescription)}</description>
    <language>en</language>
    <lastBuildDate>${now}</lastBuildDate>
    <atom:link href="${SITE.origin}/rss.xml" rel="self" type="application/rss+xml" />
    <image>
      <url>${SITE.origin}/logo-72.webp</url>
      <title>${escapeXml(SITE.name)}</title>
      <link>${SITE.origin}</link>
    </image>
${items}
  </channel>
</rss>
`;

writeFileSync(join(root, 'public/rss.xml'), rss, 'utf8');
console.log(`Wrote rss.xml with ${projects.length} items`);
