export type EngagementKind = 'stars' | 'downloads' | 'plays' | 'opens';

export interface ProjectEngagementCounts {
  stars: number;
  downloads: number;
  plays: number;
  opens: number;
}

export interface EngagementPayload {
  updatedAt: string;
  projects: Record<string, ProjectEngagementCounts>;
}

const EMPTY_COUNTS: ProjectEngagementCounts = {
  stars: 0,
  downloads: 0,
  plays: 0,
  opens: 0,
};

function normalizeCounts(raw?: Partial<ProjectEngagementCounts> | null): ProjectEngagementCounts {
  return {
    stars: Math.max(0, Math.floor(Number(raw?.stars) || 0)),
    downloads: Math.max(0, Math.floor(Number(raw?.downloads) || 0)),
    plays: Math.max(0, Math.floor(Number(raw?.plays) || 0)),
    opens: Math.max(0, Math.floor(Number(raw?.opens) || 0)),
  };
}

export function emptyEngagementPayload(): EngagementPayload {
  return { updatedAt: new Date(0).toISOString(), projects: {} };
}

export function getProjectEngagement(
  payload: EngagementPayload | null | undefined,
  projectId: string
): ProjectEngagementCounts {
  return normalizeCounts(payload?.projects?.[projectId]);
}

/**
 * Merge GitHub-synced project stats with shared hub engagement counters.
 * Hub stars/downloads are additive so every visitor sees live activity.
 */
export function mergeEngagementIntoProjects<T extends {
  id: string;
  starsCount?: number;
  downloadsCount: number;
  downloadOptions: Array<{ isPrimary?: boolean; downloadCount?: number }>;
}>(projects: T[], payload: EngagementPayload | null | undefined): T[] {
  if (!payload?.projects) return projects;

  return projects.map((project) => {
    const hub = getProjectEngagement(payload, project.id);
    const githubStars = project.starsCount ?? 0;
    const githubDownloads = project.downloadsCount ?? 0;
    const primaryIndex = Math.max(
      0,
      project.downloadOptions.findIndex((opt) => opt.isPrimary)
    );

    return {
      ...project,
      starsCount: githubStars + hub.stars,
      downloadsCount: githubDownloads + hub.downloads,
      downloadOptions: project.downloadOptions.map((opt, index) =>
        index === primaryIndex
          ? { ...opt, downloadCount: (opt.downloadCount ?? 0) + hub.downloads }
          : opt
      ),
    };
  });
}

export async function fetchEngagementPayload(): Promise<EngagementPayload | null> {
  try {
    const res = await fetch('/api/engagement', { cache: 'no-store' });
    if (!res.ok) return null;
    const data = (await res.json()) as EngagementPayload;
    if (!data || typeof data !== 'object' || !data.projects) return null;

    const projects: Record<string, ProjectEngagementCounts> = {};
    for (const [id, counts] of Object.entries(data.projects)) {
      projects[id] = normalizeCounts(counts);
    }
    return {
      updatedAt: typeof data.updatedAt === 'string' ? data.updatedAt : new Date().toISOString(),
      projects,
    };
  } catch {
    return null;
  }
}

export async function recordEngagement(
  projectId: string,
  kind: EngagementKind
): Promise<ProjectEngagementCounts | null> {
  try {
    const res = await fetch('/api/engagement', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId, kind }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { project?: ProjectEngagementCounts };
    return data.project ? normalizeCounts(data.project) : null;
  } catch {
    return null;
  }
}

export function isOnlineProjectType(projectType?: string): boolean {
  return (
    projectType === 'web_game' ||
    projectType === 'web_app' ||
    projectType === 'browser_extension'
  );
}

export function getLiveEngagementKind(projectType?: string): 'plays' | 'opens' {
  return projectType === 'web_game' ? 'plays' : 'opens';
}

export { EMPTY_COUNTS };
