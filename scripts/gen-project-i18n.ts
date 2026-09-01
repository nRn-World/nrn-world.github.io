import { writeFileSync } from 'fs';
import { ALL_PROJECTS } from '../src/data/projectsData';

const locales = ['sv', 'tr', 'es', 'fr', 'ar'] as const;

const lines: string[] = [
  "import { Locale, ProjectTranslation } from './types';",
  '',
  'type ProjectMap = Record<string, ProjectTranslation>;',
  '',
  'export const projectTranslations: Partial<Record<Locale, ProjectMap>> = {',
];

for (const loc of locales) {
  lines.push(`  ${loc}: {`);
  for (const p of ALL_PROJECTS) {
    lines.push(`    '${p.id}': {`);
    lines.push(`      name: ${JSON.stringify(p.name)},`);
    lines.push(`      tagline: ${JSON.stringify(p.tagline)},`);
    lines.push(`      description: ${JSON.stringify(p.description)},`);
    lines.push(`      detailedAbout: ${JSON.stringify(p.detailedAbout)},`);
    lines.push('    },');
  }
  lines.push('  },');
}

lines.push('};');
writeFileSync('src/i18n/projectTranslations.ts', lines.join('\n'));
console.log(`Generated ${ALL_PROJECTS.length} projects for ${locales.length} locales`);
