import { fetchGithubActivity } from './github-activity.mjs';

let cachedPayload = null;
let cachedAt = 0;
const CACHE_MS = 15 * 60 * 1000;

export async function getGithubActivityPayload() {
  if (cachedPayload?.fetchOk && Date.now() - cachedAt < CACHE_MS) {
    return cachedPayload;
  }

  const payload = await fetchGithubActivity();
  cachedPayload = payload;
  cachedAt = Date.now();
  return payload;
}

export async function handleGithubActivityRequest(_req, res) {
  try {
    const payload = await getGithubActivityPayload();
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'public, max-age=300');
    res.statusCode = 200;
    res.end(JSON.stringify(payload));
  } catch (error) {
    res.statusCode = 503;
    res.setHeader('Content-Type', 'application/json');
    res.end(
      JSON.stringify({
        fetchOk: false,
        error: error.message || 'GitHub activity fetch failed',
      })
    );
  }
}
