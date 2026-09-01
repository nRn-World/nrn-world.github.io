export const LOCALES = ['en', 'sv', 'tr', 'es', 'fr', 'ar'] as const;
export type Locale = (typeof LOCALES)[number];

export interface LanguageOption {
  code: Locale;
  label: string;
  native: string;
  dir: 'ltr' | 'rtl';
}

export type TranslationValue = string | TranslationDictionary;
export interface TranslationDictionary {
  [key: string]: TranslationValue;
}

export interface ProjectTranslation {
  name: string;
  tagline: string;
  description: string;
  detailedAbout: string;
}
