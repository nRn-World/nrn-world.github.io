import { spawnSync } from 'node:child_process';

export const GITHUB_ACTIVITY_LOGIN = 'nRn-World';
const LEVEL_MAP = {
  NONE: 0,
  FIRST_QUARTILE: 1,
  SECOND_QUARTILE: 2,
  THIRD_QUARTILE: 3,
  FOURTH_QUARTILE: 4,
};

const CONTRIBUTIONS_QUERY = `
  query($login: String!) {
    user(login: $login) {
      contributionsCollection {
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              contributionCount
              date
              contributionLevel
            }
          }
        }
      }
    }
  }
`;

function ghAvailable() {
  const result = spawnSync('gh', ['auth', 'status'], { encoding: 'utf8' });
  return result.status === 0;
}

function fetchContributionsViaGh(login) {
  const result = spawnSync(
    'gh',
    ['api', 'graphql', '-f', `query=${CONTRIBUTIONS_QUERY}`, '-f', `login=${login}`],
    { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 }
  );

  if (result.status !== 0) {
    throw new Error(result.stderr || result.stdout || 'gh graphql failed');
  }

  return JSON.parse(result.stdout);
}

async function fetchContributionsViaToken(login, token) {
  const response = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'User-Agent': 'nRnWorld-Project-Hub',
    },
    body: JSON.stringify({
      query: CONTRIBUTIONS_QUERY,
      variables: { login },
    }),
  });

  if (!response.ok) {
    throw new Error(`GitHub GraphQL ${response.status}`);
  }

  return response.json();
}

function normalizeCalendar(data, login) {
  const calendar = data?.data?.user?.contributionsCollection?.contributionCalendar;
  if (!calendar) {
    throw new Error('No contribution calendar in response');
  }

  const days = [];
  for (const week of calendar.weeks) {
    for (const day of week.contributionDays) {
      days.push({
        date: day.date,
        count: day.contributionCount ?? 0,
        level: LEVEL_MAP[day.contributionLevel] ?? 0,
      });
    }
  }

  return {
    fetchedAt: new Date().toISOString(),
    login,
    totalContributions: calendar.totalContributions ?? 0,
    days,
    fetchOk: true,
  };
}

export async function fetchGithubActivity(login = GITHUB_ACTIVITY_LOGIN) {
  const token = process.env.GITHUB_TOKEN || process.env.VITE_GITHUB_TOKEN || '';

  let raw;
  if (ghAvailable()) {
    raw = fetchContributionsViaGh(login);
  } else if (token) {
    raw = await fetchContributionsViaToken(login, token);
  } else {
    throw new Error('No gh auth or GITHUB_TOKEN for activity fetch');
  }

  if (raw.errors?.length) {
    throw new Error(raw.errors[0]?.message || 'GraphQL error');
  }

  return normalizeCalendar(raw, login);
}
