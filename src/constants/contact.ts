const RAW_WEB3FORMS_KEY =
  import.meta.env.VITE_WEB3FORMS_ACCESS_KEY || '14b7a724-6fa9-415d-9689-56101e828c81';

/** Public Web3Forms access key — client-side only (Web3Forms free plan). */
export const WEB3FORMS_ACCESS_KEY = RAW_WEB3FORMS_KEY.replace(/\s+/g, '');

/**
 * Web3Forms' own public hCaptcha site key (required on the free plan; it verifies the token itself).
 * Set it to '' to turn the captcha off. hCaptcha must also be selected in the form's Spam & Security settings.
 */
export const HCAPTCHA_SITE_KEY = (import.meta.env.VITE_HCAPTCHA_SITE_KEY || '50b2fe65-b00b-4b9e-ad62-3ba471098be2').trim();
