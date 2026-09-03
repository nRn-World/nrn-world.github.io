export const CONTACT_EMAIL = 'bynrnworld@gmail.com';

const RAW_WEB3FORMS_KEY =
  import.meta.env.VITE_WEB3FORMS_ACCESS_KEY || '14279ab5-2141-42ae-844f-6db939cef664';

/** Public Web3Forms access key — client-side only (Web3Forms free plan). */
export const WEB3FORMS_ACCESS_KEY = RAW_WEB3FORMS_KEY.replace(/\s+/g, '');
