import { spawnSync } from 'node:child_process';
import { buildAssetsFromReleases, fetchAllReposStats } from './github-stats.mjs';

const REPOS = [
  'ShadowPaw',
  'Doggy-Player',
  'WindowsSmartTaskbar',
  'NOBreak-Audio-Builder',
  'OctosArmy',
  'TheSilentRoom1986',
  'NeonPathPuzzle',
  'DoneTogether',
  'NexNote',
  'SecretPromts',
  'SiteScannerPro',
  'GLOBAL_EMERGENCY',
  'PrivateLinkSaver',
  'BUGRAIDER',
  'BluetoothSafetyLock',
  'FlashVideoDownloader',
  'NotePin',
  'ParkeraiSthlm',
];

let cachedPayload = null;
let cachedAt = 0;
const CACHE_MS = 5 * 60 * 1000;

function ghAvailable() {
  const result = spawnSync('gh', ['auth', 'status'], { encoding: 'utf8' });
  return result.status === 0;
}

function ghApiJson(endpoint) {
  const result = spawnSync('gh', ['api', endpoint, '--paginate'], {
    encoding: 'utf8',
    maxBuffer: 50 * 1024 * 1024,
  });
  if (result.status !== 0) {
    throw new Error(result.stderr || result.stdout || `gh api failed: ${endpoint}`);
  }
  const raw = result.stdout.trim();
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    const items = [];
    for (const line of raw.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      items.push(...JSON.parse(trimmed));
    }
    return items;
  }
}

async function fetchAllWithGhFallback() {
  const token = process.env.GITHUB_TOKEN || process.env.VITE_GITHUB_TOKEN || '';

  if (ghAvailable()) {
    const repos = {};
    let successCount = 0;

    for (const repoName of REPOS) {
      try {
        const releases = ghApiJson(`repos/nRn-World/${repoName}/releases?per_page=100`);
        const { latestVersion, latestReleaseDate, usefulAssets, totalDownloads } =
          buildAssetsFromReleases(Array.isArray(releases) ? releases : []);

        const repoData = ghApiJson(`repos/nRn-World/${repoName}`);
        const starsCount = Array.isArray(repoData)
          ? (repoData[0]?.stargazers_count ?? 0)
          : (repoData?.stargazers_count ?? 0);
        const githubPushedAt = Array.isArray(repoData)
          ? (repoData[0]?.pushed_at ?? repoData[0]?.updated_at)
          : (repoData?.pushed_at ?? repoData?.updated_at);

        repos[repoName] = {
          repoName,
          totalDownloads,
          starsCount,
          latestVersion,
          latestReleaseDate,
          githubPushedAt,
          assets: usefulAssets,
          lastFetched: Date.now(),
          fetchOk: true,
        };
        successCount += 1;
      } catch {
        repos[repoName] = null;
      }
    }

    return {
      fetchedAt: new Date().toISOString(),
      successCount,
      totalRepos: REPOS.length,
      repos,
    };
  }

  return fetchAllReposStats(REPOS, token);
}

export async function getGithubStatsPayload() {
  const token = process.env.GITHUB_TOKEN || process.env.VITE_GITHUB_TOKEN || '';

  if (cachedPayload && Date.now() - cachedAt < CACHE_MS) {
    return cachedPayload;
  }

  const payload = await fetchAllWithGhFallback();
  if (payload.successCount > 0) {
    cachedPayload = payload;
    cachedAt = Date.now();
  }
  return payload;
}

export async function handleGithubStatsRequest(_req, res) {
  try {
    const payload = await getGithubStatsPayload();
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'public, max-age=600');
    res.statusCode = payload.successCount > 0 ? 200 : 503;
    res.end(JSON.stringify(payload));
  } catch (error) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: error.message || 'GitHub stats failed' }));
  }
}
