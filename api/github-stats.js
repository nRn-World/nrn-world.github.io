import { handleGithubStatsRequest } from '../server/github-stats-api.mjs';

export default async function handler(req, res) {
  await handleGithubStatsRequest(req, res);
}
