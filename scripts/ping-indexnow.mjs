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
const KEY = process.env.INDEXNOW_KEY || 'a248daad5773fc2150eda48e1c31447d';
const keyFilePath = join(root, 'public', `${KEY}.txt`);

// Write the key file so the verification endpoint works
if (!existsSync(keyFilePath)) {
  writeFileSync(keyFilePath, KEY, 'utf8');
  console.log(`Wrote IndexNow key file: ${KEY}.txt`);
}

const urls = [
  `${SITE.origin}/`,
  ...projects.map((p) => `${SITE.origin}/p/${p.slug}`),
];

async function pingIndexNow() {
  const body = JSON.stringify({
    host: 'nrnworld.one',
    key: KEY,
    keyLocation: `${SITE.origin}/${KEY}.txt`,
    urlList: urls,
  });

  const engines = [
    'https://api.indexnow.org/indexnow',
    'https://www.bing.com/indexnow',
  ];

  for (const engine of engines) {
    try {
      const res = await fetch(engine, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body,
      });
      console.log(`IndexNow ${engine}: ${res.status} ${res.statusText}`);
    } catch (err) {
      console.warn(`IndexNow ${engine} failed:`, err.message);
    }
  }
}

pingIndexNow().then(() => {
  console.log(`Pinged IndexNow with ${urls.length} URLs`);
});
