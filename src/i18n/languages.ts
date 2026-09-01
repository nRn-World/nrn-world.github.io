import { LanguageOption } from './types';

export const LANGUAGES: LanguageOption[] = [
  { code: 'en', label: 'English', native: 'English', dir: 'ltr' },
  { code: 'sv', label: 'Swedish', native: 'Svenska', dir: 'ltr' },
  { code: 'tr', label: 'Turkish', native: 'Türkçe', dir: 'ltr' },
  { code: 'es', label: 'Spanish', native: 'Español', dir: 'ltr' },
  { code: 'fr', label: 'French', native: 'Français', dir: 'ltr' },
  { code: 'ar', label: 'Arabic', native: 'العربية', dir: 'rtl' },
];

export const DEFAULT_LOCALE = 'en' as const;
export const STORAGE_KEY = 'nrnworld_language_v1';
