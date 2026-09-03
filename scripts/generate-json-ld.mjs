import fs from 'node:fs';
import path from 'node:path';

const indexPath = path.resolve('index.html');
let indexHtml = fs.readFileSync(indexPath, 'utf8');

const projectsData = fs.readFileSync(path.resolve('src/data/projectsData.ts'), 'utf8');

const regex = /name:\s*'([^']+)',[\s\S]*?category:\s*'([^']+)',[\s\S]*?githubUrl:\s*'([^']+)'/g;
let m;
const items = [];
let pos = 1;

while ((m = regex.exec(projectsData)) !== null) {
  const name = m[1];
  const category = m[2];
  const githubUrl = m[3];
  const repoName = githubUrl.split('/').pop();
  const slug = repoName.replace(/[-_]/g, '').toLowerCase();

  items.push({
    '@type': 'ListItem',
    position: pos++,
    item: {
      '@type': 'SoftwareApplication',
      name: name,
      url: `https://nrnworld.one/${slug}`,
      applicationCategory: category === 'Games' ? 'GameApplication' : 'UtilitiesApplication',
      operatingSystem: 'Windows 10, Windows 11, Web',
      downloadUrl: `${githubUrl}/releases/latest`,
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD'
      },
      author: {
        '@type': 'Organization',
        name: 'nRnWorld',
        url: 'https://nrnworld.one/'
      }
    }
  });
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'nRnWorld – Öppna verktyg, appar och spel',
  numberOfItems: items.length,
  itemListElement: items
};

const scriptTag = `<script type="application/ld+json">\n${JSON.stringify(jsonLd)}\n    </script>`;

// Keep JSON-LD at end of body so it does not delay first paint parsing.
if (indexHtml.includes('application/ld+json')) {
  indexHtml = indexHtml.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>\s*/g, '');
}

if (indexHtml.includes('</body>')) {
  indexHtml = indexHtml.replace('</body>', `    ${scriptTag}\n  </body>`);
} else {
  indexHtml += `\n${scriptTag}\n`;
}

fs.writeFileSync(indexPath, indexHtml);
console.log(`Injected JSON-LD with ${items.length} projects into index.html`);
