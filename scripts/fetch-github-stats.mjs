import { spawnSync } from 'node:child_process';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { config } from 'dotenv';
import {
  fetchAllReposStats,
  fetchRepoLiveStats,
  isCountableInstallerAsset,
} from '../server/github-stats.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

config({ path: join(root, '.env') });
config({ path: join(root, '.env.local') });

const REPOS = [
  'ShadowPaw',
  'Doggy-Player',
  'WindowsSmartTaskbar',
  'NOBreak-Audio-Builder',
  'OctosArmy',
  'TheSilentRoom1986',
  'Farm-Guardian-TD',
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

const GITHUB_OWNER = 'nRn-World';
const RELEASES_PER_PAGE = 100;

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
    // --paginate may return newline-delimited JSON objects
    const items = [];
    for (const line of raw.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      items.push(...JSON.parse(trimmed));
    }
    return items;
  }
}

function sumInstallerDownloads(assets) {
  return assets.reduce(
    (sum, asset) =>
      isCountableInstallerAsset(asset.name)
        ? sum + (asset.download_count || 0)
        : sum,
    0
  );
}

function fetchRepoViaGh(repoName) {
  const releases = ghApiJson(
    `repos/${GITHUB_OWNER}/${repoName}/releases?per_page=${RELEASES_PER_PAGE}`
  );

  let latestVersion;
  let latestReleaseDate;
  let totalDownloads = 0;
  const usefulAssets = [];

  if (Array.isArray(releases) && releases.length > 0) {
    const latest = releases[0];
    latestVersion = latest.tag_name || latest.name;
    latestReleaseDate =
      latest.published_at ||
      latest.created_at ||
      releases.find((r) => r.published_at)?.published_at ||
      null;

    const latestReleaseAssets = releases[0]?.assets || [];
    const addedNames = new Set();
    for (const asset of latestReleaseAssets) {
      usefulAssets.push({
        name: asset.name,
        size: asset.size || 0,
        download_count: asset.download_count || 0,
        browser_download_url: asset.browser_download_url || '',
      });
      addedNames.add(asset.name.toLowerCase());
    }

    for (const rel of releases) {
      if (Array.isArray(rel.assets)) {
        for (const asset of rel.assets) {
          if (isCountableInstallerAsset(asset.name)) {
            totalDownloads += asset.download_count || 0;
            const lower = asset.name.toLowerCase();
            if (!addedNames.has(lower) && (lower.includes('setup') || lower.includes('portable') || lower.includes('win'))) {
              usefulAssets.push({
                name: asset.name,
                size: asset.size || 0,
                download_count: asset.download_count || 0,
                browser_download_url: asset.browser_download_url || '',
              });
              addedNames.add(lower);
            }
          }
        }
      }
    }
  }

  const repoData = ghApiJson(`repos/${GITHUB_OWNER}/${repoName}`);
  const starsCount = Array.isArray(repoData)
    ? (repoData[0]?.stargazers_count ?? 0)
    : (repoData?.stargazers_count ?? 0);
  const githubPushedAt = Array.isArray(repoData)
    ? (repoData[0]?.pushed_at ?? repoData[0]?.updated_at)
    : (repoData?.pushed_at ?? repoData?.updated_at);

  return {
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
}

async function fetchAllWithGhFallback(repoNames, token) {
  const unique = [...new Set(repoNames.filter(Boolean))];
  const repos = {};
  let successCount = 0;
  const useGh = ghAvailable();

  for (const repoName of unique) {
    try {
      if (useGh) {
        repos[repoName] = fetchRepoViaGh(repoName);
      } else {
        repos[repoName] = await fetchRepoLiveStats(repoName, token);
      }
      successCount += 1;
      console.log(`  OK ${repoName} (${repos[repoName].totalDownloads} installer downloads)`);
    } catch (error) {
      console.warn(`  FAIL ${repoName}:`, error.message);
      repos[repoName] = null;
    }
  }

  return {
    fetchedAt: new Date().toISOString(),
    successCount,
    totalRepos: unique.length,
    repos,
  };
}

async function main() {
  const token = process.env.GITHUB_TOKEN || process.env.VITE_GITHUB_TOKEN || '';
  console.log('Fetching GitHub stats for', REPOS.length, 'repos...');
  if (ghAvailable()) {
    console.log('Using GitHub CLI (gh) for authenticated API access.');
  } else if (token) {
    console.log('Using GITHUB_TOKEN from environment.');
  } else {
    console.log('No gh auth or token — may hit rate limits.');
  }

  const payload = await fetchAllWithGhFallback(REPOS, token);
  const outPath = join(root, 'public', 'github-stats.json');
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, JSON.stringify(payload, null, 2), 'utf8');
  console.log(
    `Wrote ${outPath} (${payload.successCount}/${payload.totalRepos} repos OK)`
  );

  if (payload.successCount === 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
