import { Project } from '../types';
import { extractRepoName } from '../services/githubService';

/** Public URL segment: lowercase GitHub repo name without hyphens or underscores. */
export function normalizeProjectSlug(raw: string): string {
  return raw.replace(/[-_]/g, '').toLowerCase();
}

export function getProjectSlug(project: Project): string {
  return normalizeProjectSlug(extractRepoName(project.githubUrl));
}

/** Hub detail pages live under /p/ so root paths stay free for GitHub Pages project sites. */
export function getProjectPath(project: Project): string {
  return `/p/${getProjectSlug(project)}`;
}

export function getProjectUrl(project: Project): string {
  if (typeof window === 'undefined') {
    return getProjectPath(project);
  }
  return `${window.location.origin}${getProjectPath(project)}`;
}

export function getSlugFromLocation(): string {
  const parts = window.location.pathname.replace(/^\/+|\/+$/g, '').split('/');
  if (parts[0] === 'p' && parts[1]) {
    return normalizeProjectSlug(parts[1]);
  }
  return '';
}

export function findProjectBySlug(projects: Project[], slug: string): Project | undefined {
  const normalized = normalizeProjectSlug(slug);
  if (!normalized) return undefined;

  const byRepoSlug = projects.find((project) => getProjectSlug(project) === normalized);
  if (byRepoSlug) return byRepoSlug;

  // Legacy: old hash ids like "the-silent-room-1986"
  return projects.find(
    (project) =>
      project.id === normalized ||
      normalizeProjectSlug(project.id) === normalized ||
      getProjectSlug(project) === normalized
  );
}
