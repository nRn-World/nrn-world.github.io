import express from 'express';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { config } from 'dotenv';
import { handleGithubStatsRequest } from './server/github-stats-api.mjs';
import { handleGithubActivityRequest } from './server/github-activity-api.mjs';
import { handleContactRequest } from './server/contact-api.mjs';
import { handleEngagementRequest } from './server/engagement-api.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = __dirname;

config({ path: path.join(root, '.env') });
config({ path: path.join(root, '.env.local') });

const app = express();
// Do not advertise the framework in X-Powered-By.
app.disable('x-powered-by');
const port = Number(process.env.PORT) || 3000;
const distPath = path.join(root, 'dist');

// vercel.json is the single source of truth for the CSP (public/_headers mirrors it and
// scripts/inject-csp-meta.mjs copies it into the HTML for hosts that cannot send headers).
const contentSecurityPolicy = JSON.parse(readFileSync(path.join(root, 'vercel.json'), 'utf8'))
  .headers.flatMap((rule) => rule.headers)
  .find((header) => header.key.toLowerCase() === 'content-security-policy')?.value;

if (!contentSecurityPolicy) {
  throw new Error('server: no Content-Security-Policy in vercel.json');
}

app.use(express.json({ limit: '32kb' }));

// Force HTTPS for a year, subdomains included. Browsers only honour this over HTTPS.
// Refuse framing: frame-ancestors for modern browsers, X-Frame-Options for older ones.
app.use((_req, res, next) => {
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Content-Security-Policy', contentSecurityPolicy);
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  next();
});

app.get('/api/github-stats', (req, res) => {
  void handleGithubStatsRequest(req, res);
});

app.get('/api/github-activity', (req, res) => {
  void handleGithubActivityRequest(req, res);
});

app.post('/api/contact', (req, res) => {
  void handleContactRequest(req, res);
});

app.get('/api/engagement', (req, res) => {
  void handleEngagementRequest(req, res);
});

app.post('/api/engagement', (req, res) => {
  void handleEngagementRequest(req, res);
});

app.use(express.static(distPath));

app.get('*', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(port, () => {
  console.log(`nRnWorld hub running at http://localhost:${port}`);
});
