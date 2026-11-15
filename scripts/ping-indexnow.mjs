/**
 * Ping IndexNow (Bing, Yandex) med de URL:er som faktiskt har andrats.
 *
 * Att skicka alla 40 URL:er varje dygn ar onodig trafik mot en motor som redan
 * har sidorna, och en nyckel som uppfattas spamma blir blockerad (vilket redan
 * har hant en gang). Darfor jamfors HEAD mot en tidigare revision och bara
 * andrade sidor skickas. INDEXNOW_ALL=1 tvingar en full inlamning.
 */
import { writeFileSync, existsSync } from 'fs';
import { execFileSync } from 'child_process';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { loadSeoProjects, parseSeoProjects, SITE } from './lib/seo-projects.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const projects = loadSeoProjects();

// IndexNow key — use env or fallback to a stable generated key.
// Den gamla nyckeln (9d9d...) svarar 403 UserForbiddedToAccessSite hos Bing
// medan en ny nyckel accepteras, sa den ar utbytt.
const KEY = process.env.INDEXNOW_KEY || '8180857973443a4e7d88419353099639';
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

const allUrls = [
  `${SITE.origin}/`,
  ...appUrls,
  ...projects.map((p) => `${SITE.origin}/p/${p.slug}/`),
];

// Fonstret har overlaOpp sa att en misslyckad korning inte tappar en andring.
// Dubbletter kostar nastan inget; uteblivna inlamningar kostar indexering.
const WINDOW_HOURS = Number(process.env.INDEXNOW_SINCE_HOURS || 30);
const FORCE_ALL = process.env.INDEXNOW_ALL === '1';

function git(args) {
  return execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim();
}

function isShallow() {
  try {
    return git(['rev-parse', '--is-shallow-repository']) === 'true';
  } catch {
    return false;
  }
}

/** @returns {string[]} URL:er att lamna in */
function changedUrls() {
  if (FORCE_ALL) return allUrls;

  // Utan historik gar det inte att veta vad som andrats; hellre allt an inget.
  if (isShallow()) {
    console.warn('IndexNow: grund klon utan historik — skickar alla URL:er');
    return allUrls;
  }

  const before = new Date(Date.now() - WINDOW_HOURS * 3600 * 1000).toISOString();
  const base = git(['rev-list', '-1', `--before=${before}`, 'HEAD']);
  if (!base) return allUrls;

  const changed = git(['diff', '--name-only', base, 'HEAD']).split('\n').filter(Boolean);
  if (changed.length === 0) return [];

  const targets = new Set();

  // Projektmetadata avgor projektsidorna. Jamfor per slug, sa bara de projekt
  // som faktiskt andrats skickas i stallet for alla 26.
  if (changed.some((f) => f.startsWith('src/data/'))) {
    let previous = null;
    try {
      previous = parseSeoProjects(
        git(['show', `${base}:src/data/projectsData.ts`]),
        git(['show', `${base}:src/data/projectImages.ts`]),
      );
    } catch {
      return allUrls;
    }

    const beforeBySlug = new Map(previous.map((p) => [p.slug, JSON.stringify(p)]));
    const nowBySlug = new Map(projects.map((p) => [p.slug, JSON.stringify(p)]));

    for (const [slug, json] of nowBySlug) {
      if (beforeBySlug.get(slug) === json) continue;
      targets.add(`${SITE.origin}/p/${slug}/`);
      const project = projects.find((p) => p.slug === slug);
      if (project?.liveDemoUrl?.startsWith(`${SITE.origin}/`)) {
        targets.add(project.liveDemoUrl);
      }
    }

    // Borttagna projekt syns i hubben, inte pa en egen URL.
    const removed = [...beforeBySlug.keys()].some((slug) => !nowBySlug.has(slug));
    if (removed) targets.add(`${SITE.origin}/`);
  }

  // Hubben renderas av index.html och applikationskoden utanfor src/data.
  const shellChanged = changed.some(
    (f) => f === 'index.html' || (f.startsWith('src/') && !f.startsWith('src/data/')),
  );
  if (shellChanged) targets.add(`${SITE.origin}/`);

  return [...targets].filter((u) => allUrls.includes(u));
}

async function pingIndexNow() {
  const targetUrls = changedUrls();
  if (targetUrls.length === 0) {
    console.log(`IndexNow: inga andrade URL:er de senaste ${WINDOW_HOURS} timmarna — hoppar over`);
    return { rejected: [], total: 0, sent: 0 };
  }

  const preview = targetUrls.length > 10 ? `${targetUrls.slice(0, 10).join(', ')} …` : targetUrls.join(', ');
  console.log(`IndexNow: ${targetUrls.length} andrade URL:er — ${preview}`);

  const body = JSON.stringify({
    host: 'nrnworld.one',
    key: KEY,
    keyLocation: `${SITE.origin}/${KEY}.txt`,
    urlList: targetUrls,
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
        console.log(`IndexNow ${engine}: ${res.status} ${res.statusText} (${targetUrls.length} URL:er)`);
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

  return { rejected, total: attempts, sent: targetUrls.length };
}

pingIndexNow()
  .then(({ rejected, total, sent }) => {
    if (rejected.length > 0) {
      console.error(`IndexNow: misslyckades — ${rejected.length} av ${total} motorer avvisade inlamningen: ${rejected.join(', ')}`);
      process.exitCode = 1;
      return;
    }
    if (sent > 0) {
      console.log(`Pinged IndexNow with ${sent} URLs`);
    }
  })
  .catch((err) => {
    console.error('IndexNow: ovantat fel —', err.message);
    process.exitCode = 1;
  });
