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

/** Drop a trailing period so joined sentences don't end up with "..". */
function stripPeriod(text) {
  return text.replace(/\s+/g, ' ').trim().replace(/[.\u3002]+$/, '');
}

const DANGLING = /^(?:med|och|i|på|för|som|till|av|the|and|with|for|in|of|to|a)$/i;

/** Cut at a word boundary so titles/descriptions stay inside the SERP limits. */
function clamp(text, max) {
  const s = text.replace(/\s+/g, ' ').trim();
  if (s.length <= max) return s;
  const cut = s.slice(0, max - 1);
  const words = cut.slice(0, Math.max(cut.lastIndexOf(' '), 20)).split(' ');
  while (words.length > 3 && DANGLING.test(words[words.length - 1])) words.pop();
  return `${words.join(' ').replace(/[.,;:–-]$/, '')}…`;
}

function isSwedish(text) {
  return /[åäöÅÄÖ]/.test(text);
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

/**
 * Static content for the project page. React replaces #root on mount, so this is
 * what crawlers and no-JS visitors read: unique text, specs, changelog and links.
 */
function buildStaticMain(project, siblings) {
  const blob = `${project.tagline} ${project.description} ${project.detailedAbout}`;
  const sv = isSwedish(blob);
  const t = sv
    ? { allProjects: 'Alla projekt', openApp: 'Öppna appen', source: 'Källkod', more: 'Fler projekt' }
    : { allProjects: 'All projects', openApp: 'Open app', source: 'Source code', more: 'More projects' };

  const body = [];
  body.push(`<h1>${escapeHtml(project.name)}</h1>`);

  if (project.tagline) body.push(`<p><strong>${escapeHtml(project.tagline)}</strong></p>`);
  if (project.description && project.description !== project.tagline) {
    body.push(`<p>${escapeHtml(project.description)}</p>`);
  }
  if (project.detailedAbout && project.detailedAbout !== project.description) {
    body.push(`<p>${escapeHtml(project.detailedAbout)}</p>`);
  }

  if (project.specs.length) {
    const rows = project.specs
      .map(
        (s) =>
          `<dt>${escapeHtml(s.label)}</dt><dd>${escapeHtml(s.value)}</dd>`,
      )
      .join('');
    body.push(
      `<dl style="display:grid;grid-template-columns:max-content 1fr;gap:.35em 1.2em;margin:1.4em 0">${rows}</dl>`,
    );
  }

  if (project.changelogItems.length) {
    body.push(
      `<ul>${project.changelogItems.map((i) => `<li>${escapeHtml(i)}</li>`).join('')}</ul>`,
    );
  }

  if (project.tags.length) {
    body.push(`<p>${project.tags.map((tag) => escapeHtml(tag)).join(' · ')}</p>`);
  }

  const links = [];
  if (project.liveDemoUrl) {
    links.push(`<a href="${escapeHtml(project.liveDemoUrl)}">${t.openApp}</a>`);
  }
  if (!project.hideGithubLinks) {
    links.push(`<a href="${escapeHtml(project.githubUrl)}">${t.source}</a>`);
  }
  if (links.length) body.push(`<p>${links.join(' · ')}</p>`);

  if (siblings.length) {
    const items = siblings
      .map((s) => `<li><a href="/p/${s.slug}/">${escapeHtml(s.name)}</a> – ${escapeHtml(clamp(s.tagline, 70))}</li>`)
      .join('');
    body.push(`<h2>${t.more}</h2><ul>${items}</ul>`);
  }

  body.push(`<p><a href="/">nRnWorld – ${t.allProjects}</a></p>`);

  return (
    '<main style="max-width:56rem;margin:0 auto;padding:28px 18px;font-family:system-ui,-apple-system,\'Segoe UI\',sans-serif;line-height:1.65">' +
    body.join('\n') +
    '</main>'
  );
}

let count = 0;
for (const project of projects) {
  const siblings = projects.filter((p) => p.slug !== project.slug).slice(0, 4);
  const tagline = project.tagline || project.description || project.category;
  const title = clamp(`${project.name} – ${tagline}`, 65);
  const description = clamp(
    [stripPeriod(project.tagline), stripPeriod(project.detailedAbout || project.description)]
      .filter(Boolean)
      .join('. '),
    155,
  );
  const url = `${SITE.origin}/p/${project.slug}/`;

  let html = replaceMeta(template, {
    title,
    description,
    url,
    image: project.coverImage,
    type: 'article',
  });

  // Swap the shared placeholder headline for this project's own static content.
  // It is wrapped in .static-site-index so it stays invisible until React
  // mounts (crawlers and no-JS visitors still get the full text).
  html = html.replace(
    /<div id="root">\s*(?:<div class="boot-screen"[\s\S]*?<\/div>\s*)?<div class="static-site-index">[\s\S]*?<\/main>\s*<\/div>\s*<\/div>/,
    `<div id="root"><div class="boot-screen" aria-hidden="true"><img class="boot-screen__logo" src="/logo-v4.webp" alt="nRnWorld logo" width="56" height="56" /><div class="boot-screen__bar"></div></div><div class="static-site-index">${buildStaticMain(project, siblings)}</div></div>`,
  );

  const dir = join(dist, 'p', project.slug);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'index.html'), html, 'utf8');
  count += 1;
}

console.log(`Prerendered ${count} project pages into dist/*/index.html`);
