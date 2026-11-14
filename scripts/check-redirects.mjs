/**
 * Verifierar att alla gamla sokvagar redirectar till ratt mal och att malet svarar 200.
 *
 * Bakgrund: 2026-11-14 skapade sex Cloudflare-regler en oandlig loop, eftersom
 * wildcard-monstret matchade sitt eget mal (Cloudflare matchar skiftlagesokansligt).
 * En enkel "kalla svarar 301"-kontroll sag det inte: /NewzLocal/ svarade 301, men
 * till sig sjalv. Det har skriptet foljer darfor hela kedjan, upptacker loopar och
 * kraver att slutmalet svarar 200 utan att sjalvt redirecta.
 *
 * Cloudflares "*" matchar inte over ett avslutande snedstreck, sa /newzlocal och
 * /newzlocal/ ar tva olika sokvagar for en regel. Varje regel provas darfor i bada
 * varianterna. De varianter som annu inte har nagon regel ar markerade med gap: true:
 * de listas som kanda luckor i stallet for att tysta rakt igenom som gront, och
 * rapporteras som FIXED nar en regel val tacker dem (ta da bort flaggan).
 *
 * Kor: node scripts/check-redirects.mjs
 * (SITE_ORIGIN kan overrida domanen, t.ex. vid test mot en staging-host.)
 */

const ORIGIN = (process.env.SITE_ORIGIN || 'https://nrnworld.one').replace(/\/+$/, '');
const WWW_ORIGIN = ORIGIN.replace('://', '://www.');
const MAX_HOPS = 5;
const TIMEOUT_MS = 20_000;

/**
 * Gammal sokvag -> forvantat mal. Sokvagen ar en path pa ORIGIN om den inte ar en full URL.
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

async function fetchOnce(url) {
  const res = await fetch(url, {
    redirect: 'manual',
    signal: AbortSignal.timeout(TIMEOUT_MS),
    headers: { 'user-agent': 'nrnworld-redirect-check/1.0' },
  });
  return { status: res.status, location: res.headers.get('location') };
}

/**
 * Foljer en URL till den slutar redirecta och rapporterar hela kedjan.
 * Avbryter vid loop och vid fler hopp an MAX_HOPS.
 */
async function followChain(startUrl) {
  const chain = [];
  let current = startUrl;

  for (let hop = 0; hop <= MAX_HOPS; hop += 1) {
    if (chain.includes(current)) {
      return { ok: false, problem: 'loop', chain: [...chain, current] };
    }
    chain.push(current);

    const res = await fetchOnce(current);
    if (res.status === 200) return { ok: true, hops: hop, chain };

    if (res.status >= 300 && res.status < 400 && res.location) {
      current = new URL(res.location, current).toString();
      continue;
    }

    return { ok: false, problem: `status ${res.status}`, chain };
  }

  return { ok: false, problem: `fler an ${MAX_HOPS} hopp`, chain };
}

const failures = [];
const gaps = [];
const closed = [];

function fail(source, message) {
  failures.push({ source, message });
  console.log(`  FAIL  ${message}`);
}

/** En kand lucka ska bara synas. Blir den tackt ar det ett tecken pa att flaggan ska bort. */
async function reportGap({ from, to }) {
  const source = abs(from);
  const res = await fetchOnce(source);

  if (res.status === 301) {
    const target = new URL(res.location, source).toString();
    if (!to || target === abs(to)) {
      closed.push(from);
      console.log(`  FIXED luckan ar tackt (301 -> ${to || target}) - ta bort gap-flaggan`);
      return;
    }
    // Redirectar, men till nagot annat an forvantat: det ar en riktig avvikelse.
    fail(from, `redirectar till ${target} istallet for ${abs(to)}`);
    return;
  }

  gaps.push({ from, status: res.status });
  console.log(`  GAP   ${res.status} - ingen regel tacker sokvagen`);
}

async function run() {
  const gapCount = CASES.filter((c) => c.gap).length;
  console.log(
    `check-redirects: ${CASES.length - gapCount} regler + ${gapCount} kanda luckor mot ${ORIGIN}\n`,
  );

  for (const testCase of CASES) {
    const { from, to } = testCase;
    console.log(`${from.replace(WWW_ORIGIN, 'https://www...')}${to ? ` -> ${to}` : ''}`);

    try {
      if (testCase.gap) {
        await reportGap(testCase);
        continue;
      }

      const source = abs(from);
      const expected = abs(to);

      const first = await fetchOnce(source);
      if (first.status !== 301) {
        fail(from, `forvantade 301, fick ${first.status}`);
        continue;
      }

      const location = first.location ? new URL(first.location, source).toString() : '';
      if (location !== expected) {
        fail(from, `redirectar till ${location || '(ingen location)'} istallet for ${expected}`);
        continue;
      }

      // Malet maste svara 200 direkt. Redirectar det vidare ar det en kedja --
      // och en loop om det pekar tillbaka, vilket ar precis felet vi vill fanga.
      const target = await followChain(expected);
      if (!target.ok) {
        const trail = target.chain.map((u) => u.replace(ORIGIN, '')).join(' -> ');
        fail(from, `malet svarar inte 200 (${target.problem}): ${trail}`);
        continue;
      }
      if (target.hops > 0) {
        const trail = target.chain.map((u) => u.replace(ORIGIN, '')).join(' -> ');
        fail(from, `malet redirectar vidare: ${trail}`);
        continue;
      }

      console.log('  ok    301 -> 200');
    } catch (err) {
      fail(from, `natverksfel: ${err.message}`);
    }
  }

  console.log('');
  if (failures.length) {
    console.error(`check-redirects: ${failures.length} av ${CASES.length} kontroller ar trasiga.`);
    // exitCode i stallet for process.exit(): oppna fetch-anslutningar far stadas,
    // annars kraschar Node pa Windows (libuv UV_HANDLE_CLOSING) och exit-koden blir 127.
    process.exitCode = 1;
    return;
  }

  const verified = CASES.length - gapCount;
  console.log(`check-redirects: ok (${verified} regler, alla 301 -> 200)`);

  if (gaps.length) {
    const list = gaps.map((g) => `${g.from} (${g.status})`).join(', ');
    console.log(`check-redirects: ${gaps.length} kanda luckor utan regel: ${list}`);
  } else {
    console.log('check-redirects: inga kanda luckor kvar.');
  }

  if (closed.length) {
    console.log(`check-redirects: ${closed.length} lucka/luckor ar nu tackta - ta bort gap-flaggan: ${closed.join(', ')}`);
  }
}

run().catch((err) => {
  console.error('check-redirects: ovantat fel:', err);
  process.exitCode = 1;
});
