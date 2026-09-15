import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const GIST_MARKER = 'nrnworld-hub-engagement-v1';
const GIST_FILENAME = 'hub-engagement.json';
const VALID_KINDS = new Set(['stars', 'downloads', 'plays', 'opens']);
const PROJECT_ID_RE = /^[a-z0-9][a-z0-9-]{0,63}$/;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOCAL_STORE_PATH = path.join(__dirname, '..', '.data', 'hub-engagement.json');

/** @type {{ id: string, sha?: string } | null} */
let gistCache = null;
/** @type {{ payload: object, loadedAt: number } | null} */
let memoryCache = null;
const MEMORY_CACHE_MS = 15_000;

function emptyPayload() {
  return {
    updatedAt: new Date().toISOString(),
    projects: {},
  };
}

function normalizePayload(raw) {
  const base = emptyPayload();
  if (!raw || typeof raw !== 'object') return base;

  const projects = {};
  const source = raw.projects && typeof raw.projects === 'object' ? raw.projects : {};

  for (const [projectId, counts] of Object.entries(source)) {
    if (!PROJECT_ID_RE.test(projectId) || !counts || typeof counts !== 'object') continue;
    projects[projectId] = {
      stars: Math.max(0, Math.floor(Number(counts.stars) || 0)),
      downloads: Math.max(0, Math.floor(Number(counts.downloads) || 0)),
      plays: Math.max(0, Math.floor(Number(counts.plays) || 0)),
      opens: Math.max(0, Math.floor(Number(counts.opens) || 0)),
    };
  }

  return {
    updatedAt: typeof raw.updatedAt === 'string' ? raw.updatedAt : base.updatedAt,
    projects,
  };
}

function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(payload));
}

async function readJsonBody(req) {
  if (req.body !== undefined && req.body !== null) {
    if (typeof req.body === 'object' && !Buffer.isBuffer(req.body)) {
      return req.body;
    }
    const raw = Buffer.isBuffer(req.body) ? req.body.toString('utf8') : String(req.body);
    return raw ? JSON.parse(raw) : {};
  }

  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
    });
    req.on('end', () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch {
        reject(new Error('Invalid JSON body'));
      }
    });
    req.on('error', reject);
  });
}

function getGithubToken() {
  return process.env.GITHUB_TOKEN || process.env.VITE_GITHUB_TOKEN || '';
}

async function githubFetch(pathname, { method = 'GET', body, token } = {}) {
  const response = await fetch(`https://api.github.com${pathname}`, {
    method,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'nRnWorld-hub-engagement',
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await response.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = null;
  }

  if (!response.ok) {
    const message = json?.message || text || `GitHub HTTP ${response.status}`;
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  return json;
}

async function readLocalStore() {
  try {
    const raw = await readFile(LOCAL_STORE_PATH, 'utf8');
    return normalizePayload(JSON.parse(raw));
  } catch {
    return emptyPayload();
  }
}

async function writeLocalStore(payload) {
  await mkdir(path.dirname(LOCAL_STORE_PATH), { recursive: true });
  await writeFile(LOCAL_STORE_PATH, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
}

async function findEngagementGist(token) {
  if (process.env.HUB_ENGAGEMENT_GIST_ID) {
    return { id: process.env.HUB_ENGAGEMENT_GIST_ID };
  }

  if (gistCache?.id) return gistCache;

  const gists = await githubFetch('/gists?per_page=100', { token });
  const match = Array.isArray(gists)
    ? gists.find((gist) => gist?.description === GIST_MARKER)
    : null;

  if (match?.id) {
    gistCache = { id: match.id };
    return gistCache;
  }

  return null;
}

async function createEngagementGist(token, payload) {
  const created = await githubFetch('/gists', {
    method: 'POST',
    token,
    body: {
      description: GIST_MARKER,
      public: false,
      files: {
        [GIST_FILENAME]: {
          content: JSON.stringify(payload, null, 2),
        },
      },
    },
  });

  gistCache = { id: created.id };
  return gistCache;
}

async function readGistStore(token) {
  let gistMeta = await findEngagementGist(token);
  if (!gistMeta) {
    const payload = emptyPayload();
    gistMeta = await createEngagementGist(token, payload);
    memoryCache = { payload, loadedAt: Date.now() };
    return payload;
  }

  const gist = await githubFetch(`/gists/${gistMeta.id}`, { token });
  const file = gist?.files?.[GIST_FILENAME];
  const content = file?.content;
  const payload = content ? normalizePayload(JSON.parse(content)) : emptyPayload();

  gistCache = {
    id: gistMeta.id,
    sha: file?.raw_url || undefined,
  };
  memoryCache = { payload, loadedAt: Date.now() };
  return payload;
}

async function writeGistStore(token, payload) {
  let gistMeta = await findEngagementGist(token);
  if (!gistMeta) {
    gistMeta = await createEngagementGist(token, payload);
    memoryCache = { payload, loadedAt: Date.now() };
    return;
  }

  await githubFetch(`/gists/${gistMeta.id}`, {
    method: 'PATCH',
    token,
    body: {
      description: GIST_MARKER,
      files: {
        [GIST_FILENAME]: {
          content: JSON.stringify(payload, null, 2),
        },
      },
    },
  });

  memoryCache = { payload, loadedAt: Date.now() };
}

async function loadPayload({ bypassCache = false } = {}) {
  if (!bypassCache && memoryCache && Date.now() - memoryCache.loadedAt < MEMORY_CACHE_MS) {
    return memoryCache.payload;
  }

  const token = getGithubToken();
  if (token) {
    try {
      return await readGistStore(token);
    } catch (err) {
      console.warn('[engagement] Gist read failed, using local store:', err.message);
    }
  }

  const local = await readLocalStore();
  memoryCache = { payload: local, loadedAt: Date.now() };
  return local;
}

async function savePayload(payload) {
  payload.updatedAt = new Date().toISOString();
  memoryCache = { payload, loadedAt: Date.now() };

  const token = getGithubToken();
  if (token) {
    try {
      await writeGistStore(token, payload);
      return { storage: 'gist' };
    } catch (err) {
      console.warn('[engagement] Gist write failed, using local store:', err.message);
    }
  }

  await writeLocalStore(payload);
  return { storage: 'local' };
}

function ensureProject(payload, projectId) {
  if (!payload.projects[projectId]) {
    payload.projects[projectId] = { stars: 0, downloads: 0, plays: 0, opens: 0 };
  }
  return payload.projects[projectId];
}

/**
 * Shared engagement counters for hub stars / downloads / plays / opens.
 * Persists to a private GitHub Gist when GITHUB_TOKEN is available.
 */
export async function handleEngagementRequest(req, res) {
  const method = req.method || 'GET';

  if (method === 'OPTIONS') {
    res.statusCode = 204;
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.end();
    return;
  }

  try {
    if (method === 'GET') {
      const payload = await loadPayload();
      sendJson(res, 200, payload);
      return;
    }

    if (method === 'POST') {
      let body;
      try {
        body = await readJsonBody(req);
      } catch {
        sendJson(res, 400, { error: 'invalid_json' });
        return;
      }

      const projectId = typeof body.projectId === 'string' ? body.projectId.trim() : '';
      const kind = typeof body.kind === 'string' ? body.kind.trim() : '';

      if (!PROJECT_ID_RE.test(projectId) || !VALID_KINDS.has(kind)) {
        sendJson(res, 400, { error: 'invalid_payload' });
        return;
      }

      const payload = await loadPayload({ bypassCache: true });
      const entry = ensureProject(payload, projectId);
      entry[kind] = (entry[kind] || 0) + 1;

      const saveMeta = await savePayload(payload);

      sendJson(res, 200, {
        ok: true,
        projectId,
        kind,
        count: entry[kind],
        project: entry,
        storage: saveMeta.storage,
        updatedAt: payload.updatedAt,
      });
      return;
    }

    sendJson(res, 405, { error: 'method_not_allowed' });
  } catch (err) {
    console.error('[engagement] request failed:', err);
    sendJson(res, 500, { error: 'engagement_unavailable' });
  }
}
