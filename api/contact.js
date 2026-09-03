import { handleContactRequest } from '../server/contact-api.mjs';

async function readRequestBody(req) {
  if (req.body !== undefined && req.body !== null) {
    return req.body;
  }

  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }

  if (chunks.length === 0) {
    return {};
  }

  const raw = Buffer.concat(chunks).toString('utf8');
  return raw ? JSON.parse(raw) : {};
}

export default async function handler(req, res) {
  try {
    if (req.method === 'POST') {
      req.body = await readRequestBody(req);
    }
  } catch {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'invalid_json' }));
    return;
  }

  await handleContactRequest(req, res);
}
