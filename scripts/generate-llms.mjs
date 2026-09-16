import { writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { loadSeoProjects, SITE } from './lib/seo-projects.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const projects = loadSeoProjects();

const lines = [
  `# ${SITE.name}`,
  `> Open Windows tools, AI agents, audio engines and browser games. ${projects.length} projects with direct downloads and source on GitHub (@nRn-World).`,
  '',
  '## Projects',
];

for (const p of projects) {
  const bits = [`${SITE.origin}/p/${p.slug}: ${p.tagline || p.description}`];
  if (p.liveDemoUrl) bits.push(`Live: ${p.liveDemoUrl}`);
  bits.push(`GitHub: ${p.githubUrl}`);
  lines.push(`- [${p.name}](${SITE.origin}/p/${p.slug}): ${bits.join(' | ')}`);
}

lines.push(
  '',
  '## About',
  `- Website: ${SITE.origin}/`,
  `- GitHub organization: ${SITE.githubOrg}`,
  '- License: Open source (MIT)',
  '- Contact: via Connect form on the website',
  ''
);

writeFileSync(join(root, 'public/llms.txt'), lines.join('\n'), 'utf8');
console.log(`Wrote llms.txt with ${projects.length} projects`);
