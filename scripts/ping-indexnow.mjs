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

  // api.indexnow.org distribuerar sjalv vidare till alla IndexNow-motorer, men
  // Bing har blockerat den har varden. Yandex far darfor listan direkt, sa att
  // URL:erna nar en motor medan blocken bestar.
  const engines = [
    'https://api.indexnow.org/indexnow',
    'https://yandex.com/indexnow',
  ];

  // Ett gront jobb ska betyda att inlamningen accepterades. Avvisar API:et den
  // (403 = vardnamnet blockerat) ska korningen falla i stallet for att se ut som
  // en lyckad ping. process.exitCode anvands, inte process.exit.
  const rejected = [];
  for (const engine of engines) {
    try {
      const res = await fetch(engine, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body,
      });
      if (res.ok) {
        console.log(`IndexNow ${engine}: ${res.status} ${res.statusText}`);
      } else {
        // 403 = nyckeln/verifieringen avslogs, 422 = URL:erna tillhor inte varden,
        // 429 = for manga anrop. Svarskroppen anger orsaken, t.ex. UserForbiddedToAccessSite.
        const detail = (await res.text()).replace(/\s+/g, ' ').slice(0, 200);
        console.warn(`IndexNow ${engine}: ${res.status} ${res.statusText} — ${detail}`);
        rejected.push(`${engine} (${res.status})`);
      }
    } catch (err) {
      console.warn(`IndexNow ${engine} failed:`, err.message);
      rejected.push(`${engine} (${err.message})`);
    }
  }
  return { rejected, total: engines.length };
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
