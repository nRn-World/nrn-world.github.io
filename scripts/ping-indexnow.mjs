/**
 * Ping IndexNow (Bing, Yandex) med de URL:er som faktiskt har andrats.
 *
 * Att skicka alla 40 URL:er varje dygn ar onodig trafik mot en motor som redan
 * har sidorna, och en nyckel som uppfattas spamma blir blockerad (vilket redan
 * har hant en gang). Utgangspunkten ar den commit som senast lamnades in — inte
 * ett tidsfonster — sa att en missad korning inte tappar andringar: nasta
 * korning jamfors mot samma position och tar med allt som hant sedan dess.
 *
 * Tillstandet ligger i .indexnow-state (en rad med commit-sha) och bevaras
 * mellan korningar av workflowens cache. Saknas det skickas allt, vilket ar
 * sakert men dyrt; INDEXNOW_ALL=1 tvingar samma sak manuellt.
 * INDEXNOW_DRY_RUN=1 visar bara vad som skulle skickas.
 */
import { writeFileSync, readFileSync, existsSync } from 'fs';
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

const STATE_FILE = join(root, '.indexnow-state');
const FORCE_ALL = process.env.INDEXNOW_ALL === '1';
const DRY_RUN = process.env.INDEXNOW_DRY_RUN === '1';

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

function commitExists(ref) {
  try {
    git(['cat-file', '-e', `${ref}^{commit}`]);
    return true;
  } catch {
    return false;
  }
}

function readState() {
  try {
    return readFileSync(STATE_FILE, 'utf8').trim();
  } catch {
    return '';
  }
}

function writeState(sha) {
  writeFileSync(STATE_FILE, `${sha}\n`, 'utf8');
}

/**
 * Delad kod (komponenter, App, stilar, index.html) renderas in i varje
 * forrenderad sida, sa en andring dar motiverar alla URL:er. Projektmetadata
 * avgor bara sina egna sidor.
 * @returns {string[]} URL:er att lamna in
 */
function changedUrls(base) {
  if (FORCE_ALL) return allUrls;

  // Utan historik gar det inte att veta vad som andrats; hellre allt an inget.
  if (isShallow()) {
    console.warn('IndexNow: grund klon utan historik — skickar alla URL:er');
    return allUrls;
  }

  const changed = git(['diff', '--name-only', base, 'HEAD']).split('\n').filter(Boolean);
  if (changed.length === 0) return [];

  if (changed.some(isSharedCode)) return allUrls;

  const targets = new Set();

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

  return [...targets].filter((u) => allUrls.includes(u));
}

/**
 * Byggkonfig och de skript som kor efter vite build och skriver om varje sidas
 * HTML (prerender, CSP-metataggar, preloads, JSON-LD, deferred CSS/JS). Andras
 * nagon av dem renderas alla sidor om, aven utan andrad projektdata.
 */
const SHARED_BUILD_PATTERNS = [
  /^vite\.config\./,
  /^tailwind\.config\./,
  /^postcss\.config\./,
  /^scripts\/prerender-/,
  /^scripts\/inject-/,
  /^scripts\/defer-/,
  /^scripts\/generate-json-ld\.mjs$/,
  /^scripts\/normalize-html-eol\.mjs$/,
];

/** Kod som renderas in i varje sida. */
function isSharedCode(file) {
  const path = file.replace(/\\/g, '/');
  if (path === 'index.html') return true;
  if (path.startsWith('src/data/')) return false;
  if (path.startsWith('src/')) return true;
  if (/\.(css|scss|sass)$/.test(path)) return true;
  return SHARED_BUILD_PATTERNS.some((re) => re.test(path));
}

async function pingIndexNow() {
  const head = git(['rev-parse', 'HEAD']);
  const state = readState();
  const base = state && commitExists(state) ? state : null;

  let targetUrls;
  if (base) {
    targetUrls = changedUrls(base);
  } else {
    // Utan sparad position finns inget att jamfora mot: hellre allt an inget.
    if (!FORCE_ALL) console.warn('IndexNow: ingen sparad position — skickar alla URL:er');
    targetUrls = allUrls;
  }

  if (targetUrls.length === 0) {
    console.log(`IndexNow: inga andrade URL:er sedan ${base.slice(0, 7)} — hoppar over`);
    return { rejected: [], total: 0, sent: 0, head, advance: true };
  }

  const preview =
    targetUrls.length > 10 ? `${targetUrls.slice(0, 10).join(', ')} …` : targetUrls.join(', ');
  console.log(`IndexNow: ${targetUrls.length} andrade URL:er — ${preview}`);

  if (DRY_RUN) {
    console.log('IndexNow: torrkorning — inget skickas');
    return { rejected: [], total: 0, sent: 0, head, advance: false };
  }

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

  return { rejected, total: attempts, sent: targetUrls.length, head, advance: rejected.length === 0 };
}

pingIndexNow()
  .then(({ rejected, total, sent, head, advance }) => {
    if (rejected.length > 0) {
      // Positionen flyttas inte framat: nasta korning forsoker samma URL:er igen.
      console.error(`IndexNow: misslyckades — ${rejected.length} av ${total} motorer avvisade inlamningen: ${rejected.join(', ')}`);
      process.exitCode = 1;
      return;
    }
    if (advance) {
      writeState(head);
    }
    if (sent > 0) {
      console.log(`Pinged IndexNow with ${sent} URLs`);
    }
  })
  .catch((err) => {
    console.error('IndexNow: ovantat fel —', err.message);
    process.exitCode = 1;
  });
