const DEFAULT_CONTACT_EMAIL = 'bynrnworld@gmail.com';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_MESSAGE_LENGTH = 5000;

async function readJsonBody(req) {
  if (req.body !== undefined && req.body !== null) {
    if (typeof req.body === 'object' && !Buffer.isBuffer(req.body)) {
      return req.body;
    }
    const raw = Buffer.isBuffer(req.body) ? req.body.toString('utf8') : String(req.body);
    return raw ? JSON.parse(raw) : {};
  }

  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
    });
    req.on('end', () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch {
        reject(new Error('Invalid JSON body'));
      }
    });
    req.on('error', reject);
  });
}

function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(payload));
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

async function sendViaResend({ apiKey, toEmail, fromEmail, name, email, link, message, subject }) {
  const linkLine = link ? `\nLink: ${link}` : '';
  const linkHtml = link
    ? `<p style="margin:0 0 12px"><strong>Link:</strong> <a href="${escapeHtml(link)}">${escapeHtml(link)}</a></p>`
    : '';

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [toEmail],
      reply_to: email,
      subject: subject.slice(0, 200),
      text: `New message from nRnWorld Project Hub\n\nName: ${name}\nEmail: ${email}${linkLine}\n\n${message}`,
      html: `
        <div style="font-family:Inter,Arial,sans-serif;line-height:1.6;color:#111">
          <h2 style="margin:0 0 12px">New message from nRnWorld Project Hub</h2>
          <p style="margin:0 0 8px"><strong>Name:</strong> ${escapeHtml(name)}</p>
          <p style="margin:0 0 16px"><strong>Email:</strong> ${escapeHtml(email)}</p>
          ${linkHtml}
          <div style="white-space:pre-wrap;background:#f4f4f5;padding:16px;border-radius:8px">${escapeHtml(message)}</div>
        </div>
      `,
    }),
  });

  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    console.error('Resend error:', result);
    return { ok: false };
  }

  return { ok: true, id: result.id || null };
}

async function sendViaWeb3Forms({ accessKey, name, email, link, message, subject }) {
  const body = {
    access_key: accessKey,
    subject: subject.slice(0, 200),
    name,
    email,
    replyto: email,
    message,
    botcheck: '',
  };
  if (link) {
    body.link = link;
  }

  const response = await fetch('https://api.web3forms.com/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const result = await response.json().catch(() => ({}));
  if (!response.ok || result.success !== true) {
    console.error('Web3Forms error:', result);
    return { ok: false };
  }

  return { ok: true };
}

async function sendViaFormSubmit({ toEmail, name, email, link, message, subject }) {
  const siteUrl = process.env.SITE_URL || 'https://nrnworld.one';

  const payload = {
    name,
    email,
    message,
    _subject: subject.slice(0, 200),
    _replyto: email,
    _template: 'table',
    _captcha: 'false',
  };
  if (link) {
    payload.link = link;
  }

  const response = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(toEmail)}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Origin: siteUrl,
      Referer: `${siteUrl}/`,
    },
    body: JSON.stringify(payload),
  });

  const result = await response.json().catch(() => ({}));
  const success = response.ok && (result.success === 'true' || result.success === true);

  if (!success) {
    console.error('FormSubmit error:', result);
    return { ok: false, needsActivation: true };
  }

  return { ok: true };
}

async function deliverContactEmail({ name, email, link, message, subject }) {
  const toEmail = process.env.CONTACT_EMAIL || DEFAULT_CONTACT_EMAIL;
  const resendKey = process.env.RESEND_API_KEY;
  const web3Key = process.env.WEB3FORMS_ACCESS_KEY;

  if (resendKey) {
    const fromEmail =
      process.env.CONTACT_FROM_EMAIL || 'nRnWorld Contact <onboarding@resend.dev>';
    return sendViaResend({ apiKey: resendKey, toEmail, fromEmail, name, email, link, message, subject });
  }

  if (web3Key) {
    return sendViaWeb3Forms({ accessKey: web3Key, name, email, link, message, subject });
  }

  return sendViaFormSubmit({ toEmail, name, email, link, message, subject });
}

export async function handleContactRequest(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.statusCode = 204;
    res.end();
    return;
  }

  if (req.method !== 'POST') {
    sendJson(res, 405, { error: 'Method not allowed' });
    return;
  }

  try {
    const body = await readJsonBody(req);
    const name = String(body.name || '').trim();
    const email = String(body.email || '').trim().toLowerCase();
    const link = String(body.link || '').trim();
    const message = String(body.message || '').trim();
    const subject = String(body.subject || 'nRnWorld Project Hub — Contact').trim();

    if (!name) {
      sendJson(res, 400, { error: 'name_required' });
      return;
    }

    if (!email) {
      sendJson(res, 400, { error: 'email_required' });
      return;
    }

    if (!EMAIL_RE.test(email)) {
      sendJson(res, 400, { error: 'email_invalid' });
      return;
    }

    if (!message) {
      sendJson(res, 400, { error: 'message_required' });
      return;
    }

    if (message.length > MAX_MESSAGE_LENGTH) {
      sendJson(res, 400, { error: 'message_too_long' });
      return;
    }

    const result = await deliverContactEmail({ name, email, link, message, subject });

    if (!result.ok) {
      if (result.needsActivation) {
        sendJson(res, 503, { error: 'activation_required' });
        return;
      }
      sendJson(res, 502, { error: 'send_failed' });
      return;
    }

    sendJson(res, 200, { ok: true, id: result.id || null });
  } catch (error) {
    console.error('Contact API error:', error);
    sendJson(res, 500, { error: 'server_error' });
  }
}
