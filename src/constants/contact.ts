export const CONTACT_EMAIL = 'bynrnworld@gmail.com';

const RAW_WEB3FORMS_KEY =
  import.meta.env.VITE_WEB3FORMS_ACCESS_KEY || '14b7a724-6fa9-415d-9689-56101e828c81';

/** Public Web3Forms access key — client-side only (Web3Forms free plan). */
export const WEB3FORMS_ACCESS_KEY = RAW_WEB3FORMS_KEY.replace(/\s+/g, '');

/**
 * Public hCaptcha site key (safe to publish). Set it to '' to turn the captcha off.
 * Turn it on after enabling hCaptcha for the Web3Forms form above (secret key goes in Web3Forms).
 */
export const HCAPTCHA_SITE_KEY = (import.meta.env.VITE_HCAPTCHA_SITE_KEY || '14986e18-c7de-4550-a8f2-54d8a28a0488').trim();
