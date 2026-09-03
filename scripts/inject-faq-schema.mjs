/**
 * Inject FAQ schema into prerendered project pages for Google featured snippets.
 */
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { loadSeoProjects, SITE } from './lib/seo-projects.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
const projects = loadSeoProjects();

const projectsSrc = readFileSync(join(root, 'src/data/projectsData.ts'), 'utf8');

function extractSpecs(chunk) {
  const specs = [];
  const specRe = /label:\s*'([^']+)',\s*value:\s*'([^']+)'/g;
  let m;
  while ((m = specRe.exec(chunk)) !== null) {
    specs.push({ label: m[1], value: m[2] });
  }
  return specs;
}

function extractChangelog(chunk) {
  const versionMatch = chunk.match(/version:\s*'([^']+)'/);
  const itemsRe = /'([^']{10,})'/g;
  const changelogSection = chunk.split('changelog:')[1]?.split('],')[0] ?? '';
  const items = [];
  let m;
  while ((m = itemsRe.exec(changelogSection)) !== null) {
    if (!m[1].startsWith('v') && m[1].length > 10) items.push(m[1]);
  }
  return { version: versionMatch?.[1], items };
}

let count = 0;
const blocks = projectsSrc.split(/\n  \{\n/);

for (const p of projects) {
  const htmlPath = join(dist, 'p', p.slug, 'index.html');
  if (!existsSync(htmlPath)) continue;

  const chunk = blocks.find((b) => b.includes(`id: '${p.id}'`)) ?? '';
  const specs = extractSpecs(chunk);
  const cl = extractChangelog(chunk);

  const faqs = [];

  faqs.push({
    '@type': 'Question',
    name: `What is ${p.name}?`,
    acceptedAnswer: {
      '@type': 'Answer',
      text: p.tagline || p.description,
    },
  });

  if (p.liveDemoUrl) {
    faqs.push({
      '@type': 'Question',
      name: `Is ${p.name} free to use?`,
      acceptedAnswer: {
        '@type': 'Answer',
        text: `Yes, ${p.name} is completely free and open source under the MIT license. ${
          p.projectType === 'web_game' || p.projectType === 'web_app'
            ? `You can use it directly at ${p.liveDemoUrl}`
            : `Download it from ${p.githubUrl}/releases/latest`
        }.`,
      },
    });
  } else {
    faqs.push({
      '@type': 'Question',
      name: `How do I download ${p.name}?`,
      acceptedAnswer: {
        '@type': 'Answer',
        text: `Visit ${SITE.origin}/p/${p.slug} for the official download page, or get the latest release directly from GitHub at ${p.githubUrl}/releases/latest.`,
      },
    });
  }

  if (specs.length > 0) {
    const specText = specs.map((s) => `${s.label}: ${s.value}`).join(', ');
    faqs.push({
      '@type': 'Question',
      name: `What are the technical specs of ${p.name}?`,
      acceptedAnswer: {
        '@type': 'Answer',
        text: specText,
      },
    });
  }

  if (cl.items.length > 0) {
    faqs.push({
      '@type': 'Question',
      name: `What's new in ${p.name} ${cl.version || ''}?`.trim(),
      acceptedAnswer: {
        '@type': 'Answer',
        text: cl.items.slice(0, 5).join('. ') + '.',
      },
    });
  }

  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs,
  };

  let html = readFileSync(htmlPath, 'utf8');
  const faqScript = `<script type="application/ld+json">${JSON.stringify(faqLd)}</script>`;
  html = html.replace('</body>', `    ${faqScript}\n  </body>`);
  writeFileSync(htmlPath, html, 'utf8');
  count++;
}

console.log(`Injected FAQ schema into ${count} project pages`);
