/**
 * Ping IndexNow (Bing, Yandex, etc.) with all project URLs after build.
 * Requires INDEXNOW_KEY env var or generates one automatically.
 */
import { writeFileSync, readFileSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { loadSeoProjects, SITE } from './lib/seo-projects.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const projects = loadSeoProjects();

// IndexNow key — use env or fallback to a stable generated key
const KEY = process.env.INDEXNOW_KEY || '9d9d075bb721bf59db380903d83f672c';
const keyFilePath = join(root, 'public', `${KEY}.txt`);

// Write the key file so the verification endpoint works
if (!existsSync(keyFilePath)) {
  writeFileSync(keyFilePath, KEY, 'utf8');
  console.log(`Wrote IndexNow key file: ${KEY}.txt`);
}

const appUrls = [
  ...new Set(
    projects
      .map((p) => p.liveDemoUrl)
      .filter((u) => typeof u === 'string' && u.startsWith(`${SITE.origin}/`)),
  ),
];

const urls = [
  `${SITE.origin}/`,
  ...appUrls,
  ...projects.map((p) => `${SITE.origin}/p/${p.slug}/`),
];

async function pingIndexNow() {
  const body = JSON.stringify({
    host: 'nrnworld.one',
    key: KEY,
    keyLocation: `${SITE.origin}/${KEY}.txt`,
    urlList: urls,
  });

  // Ett gront jobb ska betyda att inlamningen accepterades. process.exitCode
  // anvands, inte process.exit (Windows kan klippa buffrad stdout).
  const submit = async (engine) => {
    try {
      const res = await fetch(engine, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body,
      });
      if (res.ok) {
        console.log(`IndexNow ${engine}: ${res.status} ${res.statusText}`);
        return null;
      }
      // 403 = nyckeln/verifieringen avslogs, 422 = URL:erna tillhor inte varden,
      // 429 = for manga anrop. Svarskroppen anger orsaken, t.ex. UserForbiddedToAccessSite.
      const detail = (await res.text()).replace(/\s+/g, ' ').slice(0, 200);
      console.warn(`IndexNow ${engine}: ${res.status} ${res.statusText} — ${detail}`);
      return `${engine} (${res.status})`;
    } catch (err) {
      console.warn(`IndexNow ${engine} failed:`, err.message);
      return `${engine} (${err.message})`;
    }
  };

  const primary = 'https://api.indexnow.org/indexnow';
  const fallback = 'https://yandex.com/indexnow';

  const rejected = [];
  let attempts = 1;
  const primaryFailure = await submit(primary);
  if (primaryFailure) {
    rejected.push(primaryFailure);
    // api.indexnow.org distribuerar sjalv vidare till alla IndexNow-motorer. Yandex
    // far listan bara nar den avvisar, sa en lyckad inlamning dubbelskickas aldrig.
    attempts++;
    const fallbackFailure = await submit(fallback);
    if (fallbackFailure) rejected.push(fallbackFailure);
  }

  return { rejected, total: attempts };
}

pingIndexNow()
  .then(({ rejected, total }) => {
    if (rejected.length > 0) {
      console.error(`IndexNow: misslyckades — ${rejected.length} av ${total} motorer avvisade inlamningen: ${rejected.join(', ')}`);
      process.exitCode = 1;
      return;
    }
    console.log(`Pinged IndexNow with ${urls.length} URLs`);
  })
  .catch((err) => {
    console.error('IndexNow: ovantat fel —', err.message);
    process.exitCode = 1;
  });
