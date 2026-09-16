import { writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { loadSeoProjects, SITE } from './lib/seo-projects.mjs';
import { readFileSync } from 'fs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const indexPath = join(root, 'index.html');
let indexHtml = readFileSync(indexPath, 'utf8');
const projects = loadSeoProjects();

const listItems = projects.map((p, i) => ({
  '@type': 'ListItem',
  position: i + 1,
  item: {
    '@type': 'SoftwareApplication',
    name: p.name,
    description: p.tagline || p.description,
    url: `${SITE.origin}/${p.slug}`,
    image: p.coverImage,
    applicationCategory: p.category === 'Games' ? 'GameApplication' : 'UtilitiesApplication',
    operatingSystem:
      p.projectType === 'web_game' || p.projectType === 'web_app'
        ? 'Web Browser'
        : 'Windows 10, Windows 11, Web',
    downloadUrl: `${p.githubUrl}/releases/latest`,
    ...(p.liveDemoUrl ? { installUrl: p.liveDemoUrl } : {}),
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    author: {
      '@type': 'Organization',
      name: SITE.name,
      url: SITE.origin,
    },
  },
}));

const graph = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${SITE.origin}/#organization`,
      name: SITE.name,
      url: SITE.origin,
      logo: `${SITE.origin}/logo-72.webp`,
      sameAs: [SITE.githubOrg, 'https://ko-fi.com/nrnworld'],
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE.origin}/#website`,
      url: SITE.origin,
      name: SITE.defaultTitle,
      description: SITE.defaultDescription,
      publisher: { '@id': `${SITE.origin}/#organization` },
      inLanguage: ['en', 'sv', 'tr', 'es', 'fr', 'ar'],
      potentialAction: {
        '@type': 'SearchAction',
        target: `${SITE.origin}/?q={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@type': 'ItemList',
      '@id': `${SITE.origin}/#projects`,
      name: 'nRnWorld – Open tools, apps and games',
      numberOfItems: listItems.length,
      itemListElement: listItems,
    },
  ],
};

const scriptTag = `<script type="application/ld+json">\n${JSON.stringify(graph)}\n    </script>`;

if (indexHtml.includes('application/ld+json')) {
  indexHtml = indexHtml.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>\s*/g, '');
}

if (indexHtml.includes('</body>')) {
  indexHtml = indexHtml.replace('</body>', `    ${scriptTag}\n  </body>`);
} else {
  indexHtml += `\n${scriptTag}\n`;
}

writeFileSync(indexPath, indexHtml, 'utf8');
console.log(`Injected JSON-LD graph with Organization, WebSite and ${listItems.length} projects`);
