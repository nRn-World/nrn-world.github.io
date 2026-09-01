/** Canonical repo root, e.g. https://github.com/nRn-World/Doggy-Player */
export function normalizeGithubRepoUrl(githubUrl: string): string {
  try {
    const url = new URL(githubUrl.replace(/\/+$/, '').replace(/\.git$/, ''));
    if (url.hostname !== 'github.com') return githubUrl;

    const [owner, repo] = url.pathname.split('/').filter(Boolean);
    if (!owner || !repo) return githubUrl;

    return `https://github.com/${owner}/${repo}`;
  } catch {
    return githubUrl.replace(/\/+$/, '').replace(/\.git$/, '');
  }
}

/** GitHub contribute flow: fork, branch, and open a pull request. */
export function getGithubContributeUrl(githubUrl: string): string {
  return `${normalizeGithubRepoUrl(githubUrl)}/contribute`;
}
