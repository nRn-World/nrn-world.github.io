const RAW_WEB3FORMS_KEY =
  import.meta.env.VITE_WEB3FORMS_ACCESS_KEY || '14b7a724-6fa9-415d-9689-56101e828c81';

/** Public Web3Forms access key — client-side only (Web3Forms free plan). */
export const WEB3FORMS_ACCESS_KEY = RAW_WEB3FORMS_KEY.replace(/\s+/g, '');

/**
 * hCaptcha is OFF (no visible captcha; spam is handled by Web3Forms' filter and the hidden honeypot fields).
 * To turn it on again: set VITE_HCAPTCHA_SITE_KEY to Web3Forms' public key 50b2fe65-b00b-4b9e-ad62-3ba471098be2
 * and select hCaptcha under the form's Spam & Security settings in Web3Forms.
 */
export const HCAPTCHA_SITE_KEY = (import.meta.env.VITE_HCAPTCHA_SITE_KEY || '').trim();
