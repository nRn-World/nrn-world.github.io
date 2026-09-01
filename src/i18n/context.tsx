import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { ALL_PROJECTS } from '../data/projectsData';
import { Project } from '../types';
import { DEFAULT_LOCALE, LANGUAGES, STORAGE_KEY } from './languages';
import { arUi } from './locales/ar';
import { enUi } from './locales/en';
import { esUi } from './locales/es';
import { frUi } from './locales/fr';
import { svUi } from './locales/sv';
import { trUi } from './locales/tr';
import { projectTranslations } from './projects';
import { Locale, TranslationDictionary } from './types';
import { getNestedValue, interpolate } from './utils';

const uiByLocale: Record<Locale, TranslationDictionary> = {
  en: enUi,
  sv: svUi,
  tr: trUi,
  es: esUi,
  fr: frUi,
  ar: arUi,
};

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
  localizeProject: (project: Project) => Project;
  localizeCategory: (category: string) => string;
  localizeTag: (tag: string) => string;
  dir: 'ltr' | 'rtl';
}

const I18nContext = createContext<I18nContextValue | null>(null);

function readStoredLocale(): Locale {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && stored in uiByLocale) {
      return stored as Locale;
    }
  } catch {
    // ignore
  }
  return DEFAULT_LOCALE;
}

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locale, setLocaleState] = useState<Locale>(readStoredLocale);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore
    }
  }, []);

  const dir = LANGUAGES.find((lang) => lang.code === locale)?.dir ?? 'ltr';

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = dir;
    document.title = getNestedValue(uiByLocale[locale], 'meta.title') ?? document.title;
  }, [locale, dir]);

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) => {
      const value =
        getNestedValue(uiByLocale[locale], key) ??
        getNestedValue(uiByLocale.en, key) ??
        key;
      return interpolate(value, vars);
    },
    [locale]
  );

  const localizeCategory = useCallback(
    (category: string) => {
      const value = t(`categories.${category}`);
      return value === `categories.${category}` ? category : value;
    },
    [t]
  );

  const localizeTag = useCallback(
    (tag: string) => {
      const key = `tags.${tag}`;
      const value = t(key);
      return value === key ? tag : value;
    },
    [t]
  );

  const localizeProject = useCallback(
    (project: Project): Project => {
      const localizedTags = project.tags?.map((tag) => localizeTag(tag));

      if (locale === 'en') {
        return localizedTags ? { ...project, tags: localizedTags } : project;
      }

      const translated = projectTranslations[locale]?.[project.id];
      if (!translated) {
        return localizedTags ? { ...project, tags: localizedTags } : project;
      }

      return {
        ...project,
        name: translated.name || project.name,
        tagline: translated.tagline || project.tagline,
        description: translated.description || project.description,
        detailedAbout: translated.detailedAbout || project.detailedAbout,
        tags: localizedTags,
      };
    },
    [locale, localizeTag]
  );

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      t,
      localizeProject,
      localizeCategory,
      localizeTag,
      dir,
    }),
    [locale, setLocale, t, localizeProject, localizeCategory, localizeTag, dir]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return ctx;
}

export function useLocalizedProjects(projects: Project[]): Project[] {
  const { localizeProject } = useI18n();
  return useMemo(() => projects.map(localizeProject), [projects, localizeProject]);
}

export function getProjectCount(): number {
  return ALL_PROJECTS.length;
}
