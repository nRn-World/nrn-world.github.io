const STORAGE_KEY = 'nrnworld_play_counts_v1';
const COUNT_API_BASE = 'https://api.countapi.xyz';
const COUNT_NAMESPACE = 'nrnworld-hub-v1';

export type EngagementKind = 'plays';

function counterKey(projectId: string, kind: EngagementKind): string {
  return `${projectId}-${kind}`;
}

function readStoredCounts(): Record<string, number> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, number>;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function writeStoredCounts(counts: Record<string, number>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(counts));
  } catch {
    // ignore quota / private mode
  }
}

export function getLocalPlayCount(projectId: string): number {
  return readStoredCounts()[projectId] ?? 0;
}

export function incrementLocalPlayCount(projectId: string): number {
  const counts = readStoredCounts();
  const next = (counts[projectId] ?? 0) + 1;
  counts[projectId] = next;
  writeStoredCounts(counts);
  return next;
}

async function tryRemoteHit(projectId: string, kind: EngagementKind): Promise<void> {
  try {
    await fetch(`${COUNT_API_BASE}/hit/${COUNT_NAMESPACE}/${counterKey(projectId, kind)}`, {
      mode: 'no-cors',
    });
  } catch {
    // Remote counter is optional — local storage is the source of truth
  }
}

export async function fetchEngagementCount(
  projectId: string,
  _kind: EngagementKind = 'plays'
): Promise<number> {
  return getLocalPlayCount(projectId);
}

export function recordEngagement(
  projectId: string,
  kind: EngagementKind = 'plays'
): number {
  const next = incrementLocalPlayCount(projectId);
  void tryRemoteHit(projectId, kind);
  return next;
}

export async function fetchPlayCounts(projectIds: string[]): Promise<Record<string, number>> {
  const stored = readStoredCounts();
  const result: Record<string, number> = {};
  for (const id of projectIds) {
    result[id] = stored[id] ?? 0;
  }
  return result;
}

export function isOnlineProjectType(projectType?: string): boolean {
  return (
    projectType === 'web_game' ||
    projectType === 'web_app' ||
    projectType === 'browser_extension'
  );
}
