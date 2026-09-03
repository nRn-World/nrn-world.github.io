const GITHUB_OWNER = 'nRn-World';
const RELEASES_PER_PAGE = 100;
const INSTALLER_PATTERN = /\.(zip|exe|apk|dmg|appimage|deb|rar)$/i;
const METADATA_PATTERN = /\.(blockmap|yml|yaml|json|nupkg)$/i;

export function isCountableInstallerAsset(filename) {
  const lower = filename.toLowerCase();
  if (METADATA_PATTERN.test(lower)) return false;
  if (lower === 'releases' || lower === 'release') return false;
  return INSTALLER_PATTERN.test(lower);
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

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function githubHeaders(token) {
  const headers = {
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'nRnWorld-Project-Hub',
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

async function fetchAllReleases(repoName, token) {
  const releases = [];
  let page = 1;

  while (true) {
    const response = await fetch(
      `https://api.github.com/repos/${GITHUB_OWNER}/${repoName}/releases?per_page=${RELEASES_PER_PAGE}&page=${page}`,
      { headers: githubHeaders(token) }
    );

    if (!response.ok) {
      if (page === 1) {
        throw new Error(`GitHub releases ${response.status} for ${repoName}`);
      }
      break;
    }

    const batch = await response.json();
    if (!Array.isArray(batch) || batch.length === 0) break;

    releases.push(...batch);
    if (batch.length < RELEASES_PER_PAGE) break;
    page += 1;
  }

  return releases;
}

export async function fetchRepoLiveStats(repoName, token) {
  const releases = await fetchAllReleases(repoName, token);

  let latestVersion;
  let latestReleaseDate;
  const usefulAssets = [];
  let totalDownloads = 0;

  if (releases.length > 0) {
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

  let starsCount = 0;
  let githubPushedAt;
  const repoRes = await fetch(`https://api.github.com/repos/${GITHUB_OWNER}/${repoName}`, {
    headers: githubHeaders(token),
  });
  if (repoRes.ok) {
    const repoData = await repoRes.json();
    starsCount = repoData.stargazers_count ?? 0;
    githubPushedAt = repoData.pushed_at ?? repoData.updated_at;
  }

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

/**
 * Fetch stats for many repos sequentially to avoid GitHub rate limits.
 */
export async function fetchAllReposStats(repoNames, token) {
  const unique = [...new Set(repoNames.filter(Boolean))];
  const repos = {};
  let successCount = 0;

  for (const repoName of unique) {
    try {
      repos[repoName] = await fetchRepoLiveStats(repoName, token);
      successCount += 1;
    } catch (error) {
      console.warn(`[github-stats] ${repoName}:`, error.message);
      repos[repoName] = null;
    }
    await delay(120);
  }

  return {
    fetchedAt: new Date().toISOString(),
    successCount,
    totalRepos: unique.length,
    repos,
  };
}
