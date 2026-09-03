import { Project, DownloadOption } from '../types';

export interface GitHubReleaseAsset {
  id: number;
  name: string;
  size: number;
  download_count: number;
  browser_download_url: string;
  content_type: string;
  created_at: string;
}

export interface RepoLiveStats {
  repoName: string;
  totalDownloads: number;
  starsCount: number;
  latestVersion?: string;
  assets: GitHubReleaseAsset[];
  latestReleaseDate?: string;
  githubPushedAt?: string;
  lastFetched: number;
  fetchOk: boolean;
}

export interface GithubStatsPayload {
  fetchedAt: string;
  successCount: number;
  totalRepos: number;
  repos: Record<string, RepoLiveStats | null>;
}

const INSTALLER_PATTERN = /\.(zip|exe|apk|dmg|appimage|deb|rar)$/i;
const METADATA_PATTERN = /\.(blockmap|yml|yaml|json|nupkg)$/i;

export function isCountableInstallerAsset(filename: string): boolean {
  const lower = filename.toLowerCase();
  if (METADATA_PATTERN.test(lower)) return false;
  if (lower === 'releases' || lower === 'release') return false;
  return INSTALLER_PATTERN.test(lower);
}

/**
 * Extract repository name from GitHub URL (e.g., https://github.com/nRn-World/Doggy-Player -> Doggy-Player)
 */
export function extractRepoName(githubUrl: string): string {
  try {
    const clean = githubUrl.replace(/\/+$/, '');
    const parts = clean.split('/');
    return parts[parts.length - 1] || '';
  } catch {
    return '';
  }
}

function findAssetForFilename(
  assets: GitHubReleaseAsset[],
  filename: string
): GitHubReleaseAsset | undefined {
  const target = filename.toLowerCase();
  return assets.find((asset) => asset.name.toLowerCase() === target);
}

function applyStatsToProject(project: Project, stats: RepoLiveStats): Project {
  const isOnlineProject =
    project.projectType === 'web_game' ||
    project.projectType === 'web_app' ||
    project.projectType === 'browser_extension';
  const hasDownloadPackages = project.downloadOptions.length > 0;

  const updatedDownloadOptions: DownloadOption[] = project.downloadOptions.map((opt) => {
    const matchingAsset =
      findAssetForFilename(stats.assets, opt.filename) ??
      (opt.fileType === 'apk'
        ? stats.assets.find((asset) => asset.name.toLowerCase().endsWith('.apk'))
        : undefined);

    if (matchingAsset) {
      return {
        ...opt,
        filename: matchingAsset.name,
        directUrl: matchingAsset.browser_download_url,
        githubReleaseUrl: matchingAsset.browser_download_url,
        size: `${(matchingAsset.size / (1024 * 1024)).toFixed(1)} MB`,
        downloadCount: isCountableInstallerAsset(matchingAsset.name)
          ? (matchingAsset.download_count ?? 0)
          : 0,
      };
    }
    return { ...opt, downloadCount: 0 };
  });

  const liveVersion = stats.latestVersion
    ? stats.latestVersion.startsWith('v')
      ? stats.latestVersion
      : `v${stats.latestVersion}`
    : undefined;

  return {
    ...project,
    downloadsCount: hasDownloadPackages ? stats.totalDownloads : isOnlineProject ? 0 : stats.totalDownloads,
    starsCount: stats.starsCount,
    version: hasDownloadPackages
      ? liveVersion ?? project.version
      : isOnlineProject
        ? project.version
        : liveVersion ?? project.version,
    downloadOptions: updatedDownloadOptions,
    githubPushedAt: stats.githubPushedAt ?? project.githubPushedAt,
  };
}

async function fetchStatsPayload(): Promise<GithubStatsPayload | null> {
  try {
    const liveRes = await fetch('/api/github-stats');
    if (liveRes.ok) {
      const payload = (await liveRes.json()) as GithubStatsPayload;
      if (payload.successCount > 0) return payload;
    }
  } catch {
    // fall through to static snapshot
  }

  try {
    const snapshotRes = await fetch('/github-stats.json');
    if (snapshotRes.ok) {
      const payload = (await snapshotRes.json()) as GithubStatsPayload;
      if (payload.successCount > 0) return payload;
    }
  } catch {
    // no snapshot
  }

  return null;
}

export interface GithubSyncResult {
  projects: Project[];
  successCount: number;
  totalRepos: number;
}

/**
 * Merge a GitHub stats payload into projects (shared by live sync + build snapshot seed).
 */
export function mergeGithubStatsPayload(
  projects: Project[],
  payload: GithubStatsPayload
): Project[] {
  return projects.map((project) => {
    const repoName = extractRepoName(project.githubUrl);
    if (!repoName) return project;

    const stats = payload.repos[repoName];
    if (!stats?.fetchOk) return project;

    return applyStatsToProject(project, stats);
  });
}

/**
 * Merge live GitHub data into projects via server-side batched API (avoids browser rate limits).
 */
export async function syncProjectsWithGitHub(projects: Project[]): Promise<GithubSyncResult> {
  const payload = await fetchStatsPayload();

  if (!payload) {
    return { projects, successCount: 0, totalRepos: 0 };
  }

  return {
    projects: mergeGithubStatsPayload(projects, payload),
    successCount: payload.successCount,
    totalRepos: payload.totalRepos,
  };
}
