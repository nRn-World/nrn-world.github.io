/**
 * Verifierar att alla gamla sokvagar redirectar till ratt mal och att malet svarar 200.
 *
 * Bakgrund: 2026-11-14 skapade sex Cloudflare-regler en oandlig loop, eftersom
 * wildcard-monstret matchade sitt eget mal (Cloudflare matchar skiftlagesokansligt).
 * En enkel "kalla svarar 301"-kontroll sag det inte: /NewzLocal/ svarade 301, men
 * till sig sjalv. Skriptet foljer darfor hela kedjan, upptacker loopar och kraver
 * att slutmalet svarar 200 utan att sjalvt redirecta.
 *
 * Cloudflares "*" matchar inte over ett avslutande snedstreck, sa /newzlocal och
 * /newzlocal/ ar tva olika sokvagar for en regel. Varje regel provas darfor i bada
 * varianterna. Varianter utan regel ar markerade gap: true och listas som kanda
 * luckor; blir en sadan tackt rapporteras den som FIXED, sa flaggan kan tas bort.
 *
 * Kor: node scripts/check-redirects.mjs
 * (SITE_ORIGIN overrider domanen, t.ex. vid test mot en staging-host.)
 */

const ORIGIN = (process.env.SITE_ORIGIN || 'https://nrnworld.one').replace(/\/+$/, '');
const WWW_ORIGIN = ORIGIN.replace('://', '://www.');
const MAX_HOPS = 5;
const TIMEOUT_MS = 20_000;

/**
 * Gammal sokvag -> forvantat mal. En path tolkas mot ORIGIN.
 * gap: true = ingen regel tacker sokvagen an; den ska synas som lucka, inte som fel.
 */
const CASES = [
  // Verifierade regler.
  { from: '/newzlocal', to: '/NewNewz/' },
  { from: '/nexnote', to: '/NexNote/' },
  { from: '/shadowpaw', to: '/ShadowPaw/' },
  { from: '/neonpathpuzzle', to: '/NeonPathPuzzle/' },
  { from: '/globalemergency', to: '/GLOBAL_EMERGENCY/' },
  { from: '/donetogether', to: '/DoneTogether/' },
  { from: '/timearchitect', to: '/TimeArchitect/' },
  { from: '/DoggyPlayer/', to: '/p/doggyplayer/' },
  { from: '/FlashVideoDownloader/welcome.html', to: '/p/flashvideodownloader/' },
  // www ska alltid landa pa apex, med sokvagen bevarad.
  { from: `${WWW_ORIGIN}/`, to: '/' },
  { from: `${WWW_ORIGIN}/p/doggyplayer/`, to: '/p/doggyplayer/' },

  // Samma regler, snedstrecksvarianten. Dessa svarar redan 301 idag.
  { from: '/globalemergency/', to: '/GLOBAL_EMERGENCY/' },
  { from: '/FlashVideoDownloader/welcome.html/', to: '/p/flashvideodownloader/' },

  // Kanda luckor: snedstrecksvarianten har ingen regel (Cloudflares "*" nar inte
  // over snedstrecket, sa regeln "/newzlocal" tacker inte "/newzlocal/").
  { from: '/newzlocal/', to: '/NewNewz/', gap: true },
  { from: '/nexnote/', to: '/NexNote/', gap: true },
  { from: '/shadowpaw/', to: '/ShadowPaw/', gap: true },
  { from: '/neonpathpuzzle/', to: '/NeonPathPuzzle/', gap: true },
  { from: '/donetogether/', to: '/DoneTogether/', gap: true },
  { from: '/timearchitect/', to: '/TimeArchitect/', gap: true },
  // Har ar det i stallet den snedstreckslosa varianten som saknas.
  { from: '/DoggyPlayer', to: '/p/doggyplayer/', gap: true },

  // Gamla sokvagar helt utan regel: alla 10 platser pa gratisplanen ar anvanda.
  { from: '/ribegatan', gap: true },
  { from: '/ribegatan/', gap: true },
  { from: '/BluetoothSafetyLock', gap: true },
  { from: '/BluetoothSafetyLock/', gap: true },
  { from: '/nobreakaudiobuilder', gap: true },
  { from: '/nobreakaudiobuilder/', gap: true },
];

const abs = (path) => (/^https?:\/\//.test(path) ? path : `${ORIGIN}${path}`);
const isRedirect = (res) => res.status >= 300 && res.status < 400 && res.location;

async function fetchOnce(url) {
  const res = await fetch(url, {
    redirect: 'manual',
    signal: AbortSignal.timeout(TIMEOUT_MS),
    headers: { 'user-agent': 'nrnworld-redirect-check/1.0' },
  });
  return { status: res.status, location: res.headers.get('location') };
}

/** Foljer en URL till den slutar redirecta. ok kraver att start-URL:en sjalv svarar 200. */
async function followChain(start) {
  const chain = [start];

  for (let hop = 0; hop <= MAX_HOPS; hop += 1) {
    const url = chain[chain.length - 1];
    const res = await fetchOnce(url);

    if (res.status === 200) return { ok: chain.length === 1, chain };
    if (!isRedirect(res)) return { ok: false, chain, problem: `status ${res.status}` };

    const next = new URL(res.location, url).toString();
    if (chain.includes(next)) return { ok: false, chain: [...chain, next], problem: 'loop' };
    chain.push(next);
  }

  return { ok: false, chain, problem: `fler an ${MAX_HOPS} hopp` };
}

/** Verifierad regel: exakt 301 till ratt mal, och malet svarar 200 utan att redirecta. */
async function checkRule({ from, to }) {
  const source = abs(from);
  const expected = abs(to);

  const first = await fetchOnce(source);
  if (first.status !== 301) return { kind: 'fail', detail: `forvantade 301, fick ${first.status}` };

  const location = first.location ? new URL(first.location, source).toString() : '';
  if (location !== expected) {
    return { kind: 'fail', detail: `redirectar till ${location || '(ingen location)'} istallet for ${expected}` };
  }

  const target = await followChain(expected);
  const trail = target.chain.map((u) => u.replace(ORIGIN, '')).join(' -> ');
  if (!target.ok) {
    return {
      kind: 'fail',
      detail: target.problem
        ? `malet svarar inte 200 (${target.problem}): ${trail}`
        : `malet redirectar vidare: ${trail}`,
    };
  }

  return { kind: 'ok', detail: '301 -> 200' };
}

/** Kand lucka: ska inte redirecta an. Ratt mal = tackt, fel mal = riktigt fel. */
async function checkGap({ from, to }) {
  const source = abs(from);
  const res = await fetchOnce(source);

  if (res.status !== 301) return { kind: 'gap', detail: `${res.status} - ingen regel tacker sokvagen` };
  if (!res.location) return { kind: 'fail', detail: '301 utan Location-header' };

  const target = new URL(res.location, source).toString();
  if (to && target !== abs(to)) {
    return { kind: 'fail', detail: `redirectar till ${target} istallet for ${abs(to)}` };
  }
  return { kind: 'fixed', detail: `301 -> ${to || target}` };
}

const LABEL = { ok: 'ok   ', fail: 'FAIL ', gap: 'GAP  ', fixed: 'FIXED' };

async function run() {
  const results = [];

  for (const testCase of CASES) {
    let result;
    try {
      result = testCase.gap ? await checkGap(testCase) : await checkRule(testCase);
    } catch (err) {
      // Ett natverksfel ska inte stoppa resten av kontrollerna.
      result = { kind: 'fail', detail: `natverksfel: ${err.message}` };
    }
    results.push({ ...result, from: testCase.from, to: testCase.to });
  }

  console.log(`check-redirects: ${CASES.length} kontroller mot ${ORIGIN}\n`);
  for (const r of results) {
    const path = r.to ? `${r.from} -> ${r.to}` : r.from;
    console.log(`${LABEL[r.kind]} ${path}${r.detail ? `  (${r.detail})` : ''}`);
  }

  const broken = results.filter((r) => r.kind === 'fail');
  const gaps = results.filter((r) => r.kind === 'gap');
  const fixed = results.filter((r) => r.kind === 'fixed');
  const okCount = results.filter((r) => r.kind === 'ok').length;

  console.log('');
  if (broken.length) {
    console.error(`check-redirects: ${broken.length} av ${CASES.length} kontroller ar trasiga.`);
    // exitCode i stallet for process.exit(): oppna fetch-anslutningar far stadas,
    // annars kraschar Node pa Windows (libuv UV_HANDLE_CLOSING) och exit-koden blir 127.
    process.exitCode = 1;
    return;
  }

  if (okCount) console.log(`check-redirects: ok (${okCount} regler, alla 301 -> 200)`);
  console.log(
    gaps.length
      ? `check-redirects: ${gaps.length} kanda luckor utan regel: ${gaps.map((g) => g.from).join(', ')}`
      : 'check-redirects: inga kanda luckor kvar.',
  );
  if (fixed.length) {
    console.log(
      `check-redirects: ${fixed.length} lucka/luckor ar nu tackta - ta bort gap-flaggan: ${fixed.map((f) => f.from).join(', ')}`,
    );
  }
}

run().catch((err) => {
  console.error('check-redirects: ovantat fel:', err);
  process.exitCode = 1;
});
