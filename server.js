import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { config } from 'dotenv';
import { handleGithubStatsRequest } from './server/github-stats-api.mjs';
import { handleGithubActivityRequest } from './server/github-activity-api.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = __dirname;

config({ path: path.join(root, '.env') });
config({ path: path.join(root, '.env.local') });

const app = express();
const port = Number(process.env.PORT) || 3000;
const distPath = path.join(root, 'dist');

app.get('/api/github-stats', (req, res) => {
  void handleGithubStatsRequest(req, res);
});

app.get('/api/github-activity', (req, res) => {
  void handleGithubActivityRequest(req, res);
});

app.use(express.static(distPath));

app.get('*', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(port, () => {
  console.log(`nRnWorld hub running at http://localhost:${port}`);
});
