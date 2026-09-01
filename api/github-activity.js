import { handleGithubActivityRequest } from '../server/github-activity-api.mjs';

export default async function handler(req, res) {
  await handleGithubActivityRequest(req, res);
}
