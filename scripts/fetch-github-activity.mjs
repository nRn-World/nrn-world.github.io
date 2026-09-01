import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { config } from 'dotenv';
import { fetchGithubActivity } from '../server/github-activity.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

config({ path: join(root, '.env') });
config({ path: join(root, '.env.local') });

async function main() {
  console.log('Fetching GitHub contribution activity...');
  const payload = await fetchGithubActivity();
  const outPath = join(root, 'public', 'github-activity.json');
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, JSON.stringify(payload, null, 2), 'utf8');
  console.log(
    `Wrote ${outPath} (${payload.totalContributions} contributions, ${payload.days.length} days)`
  );
}

main().catch((err) => {
  console.warn('[github-activity]', err.message);
  process.exit(0);
});
