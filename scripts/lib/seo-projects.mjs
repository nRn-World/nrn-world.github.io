/**
 * Shared project extraction for SEO scripts (sitemap, JSON-LD, prerender).
 */
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '../..');

/**
 * @typedef {{
 *   id: string,
 *   name: string,
 *   tagline: string,
 *   description: string,
 *   category: string,
 *   githubUrl: string,
 *   slug: string,
 *   coverImage: string,
 *   releaseDate: string,
 *   projectType: string,
 *   liveDemoUrl: string | null,
 * }} SeoProject
 */

/** @returns {SeoProject[]} */
export function loadSeoProjects() {
  const projectsSrc = readFileSync(join(root, 'src/data/projectsData.ts'), 'utf8');
  const imagesSrc = readFileSync(join(root, 'src/data/projectImages.ts'), 'utf8');

  /** @type {Record<string, string>} */
  const imgMap = {};
  for (const line of imagesSrc.split('\n')) {
    const keyMatch = line.match(/^\s+(\w+):\s*\[/);
    if (keyMatch) {
      const nextImg = imagesSrc
        .slice(imagesSrc.indexOf(line))
        .split('\n')
        .slice(0, 6)
        .map((l) => l.match(/'(https?:\/\/[^']+|\/images\/projects\/[^']+)'/)?.[1])
        .find(Boolean);
      if (nextImg) imgMap[keyMatch[1]] = nextImg;
    }
  }

  /** @type {SeoProject[]} */
  const projects = [];
  const blocks = projectsSrc.split(/\n  \{\n/);

  for (const chunk of blocks) {
    const id = chunk.match(/id:\s*'([^']+)'/)?.[1];
    const name = chunk.match(/name:\s*'([^']+)'/)?.[1];
    const tagline = chunk.match(/tagline:\s*'([^']+)'/)?.[1] ?? '';
    const description = chunk.match(/description:\s*'([^']+)'/)?.[1] ?? '';
    const category = chunk.match(/category:\s*'([^']+)'/)?.[1];
    const githubUrl = chunk.match(/githubUrl:\s*'([^']+)'/)?.[1];
    const releaseDate = chunk.match(/releaseDate:\s*'([^']+)'/)?.[1] ?? '';
    const projectType = chunk.match(/projectType:\s*'([^']+)'/)?.[1] ?? 'downloadable';
    const liveDemoUrl = chunk.match(/liveDemoUrl:\s*'([^']+)'/)?.[1] ?? null;
    const imgKey = chunk.match(/PROJECT_IMAGES\.(\w+)/)?.[1];

    if (!id || !name || !category || !githubUrl) continue;

    const repoName = githubUrl.replace(/\/+$/, '').split('/').pop() ?? id;
    const slug = repoName.replace(/[-_]/g, '').toLowerCase();
    let coverImage = imgKey ? imgMap[imgKey] : undefined;
    if (coverImage && coverImage.startsWith('/')) {
      coverImage = `https://nrnworld.one${coverImage}`;
    }
    if (!coverImage) {
      coverImage = 'https://nrnworld.one/og-image.png';
    }

    projects.push({
      id,
      name,
      tagline,
      description,
      category,
      githubUrl,
      slug,
      coverImage,
      releaseDate,
      projectType,
      liveDemoUrl,
    });
  }

  return projects;
}

export const SITE = {
  origin: 'https://nrnworld.one',
  name: 'nRnWorld',
  defaultTitle: 'nRnWorld - Project Hub & Direct Downloads',
  defaultDescription:
    'Official software repository and direct downloads hub for Windows utilities, AI agents, audio engines, and tools created by nRnWorld (@nRn-World).',
  defaultImage: 'https://nrnworld.one/og-image.png',
  githubOrg: 'https://github.com/nRn-World',
};
