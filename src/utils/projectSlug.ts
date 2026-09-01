import { Project } from '../types';
import { extractRepoName } from '../services/githubService';

/** Public URL segment: lowercase GitHub repo name without hyphens or underscores. */
export function getProjectSlug(project: Project): string {
  return extractRepoName(project.githubUrl).replace(/[-_]/g, '').toLowerCase();
}

export function getProjectPath(project: Project): string {
  return `/${getProjectSlug(project)}`;
}

export function getProjectUrl(project: Project): string {
  if (typeof window === 'undefined') {
    return getProjectPath(project);
  }
  return `${window.location.origin}${getProjectPath(project)}`;
}

export function getSlugFromLocation(): string {
  const segment = window.location.pathname.replace(/^\/+|\/+$/g, '').split('/')[0] ?? '';
  return segment.toLowerCase();
}

export function findProjectBySlug(projects: Project[], slug: string): Project | undefined {
  const normalized = slug.toLowerCase();
  if (!normalized) return undefined;

  const byRepoSlug = projects.find((project) => getProjectSlug(project) === normalized);
  if (byRepoSlug) return byRepoSlug;

  // Legacy: old hash ids like "the-silent-room-1986"
  return projects.find(
    (project) =>
      project.id === normalized ||
      project.id.replace(/-/g, '') === normalized ||
      getProjectSlug(project) === normalized
  );
}
