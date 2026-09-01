export interface ContributionDay {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

export interface GithubActivityPayload {
  fetchedAt: string;
  login: string;
  totalContributions: number;
  days: ContributionDay[];
  fetchOk: boolean;
  error?: string;
}

export async function fetchGithubActivity(): Promise<GithubActivityPayload | null> {
  try {
    const liveRes = await fetch('/api/github-activity');
    if (liveRes.ok) {
      const payload = (await liveRes.json()) as GithubActivityPayload;
      if (payload.fetchOk && payload.days?.length > 0) return payload;
    }
  } catch {
    // fall through
  }

  try {
    const snapshotRes = await fetch('/github-activity.json');
    if (snapshotRes.ok) {
      const payload = (await snapshotRes.json()) as GithubActivityPayload;
      if (payload.fetchOk && payload.days?.length > 0) return payload;
    }
  } catch {
    // no snapshot
  }

  return null;
}
