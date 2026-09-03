import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { ALL_PROJECTS } from '../data/projectsData';
import { Project } from '../types';
import { DEFAULT_LOCALE, LANGUAGES, STORAGE_KEY } from './languages';
import { enUi } from './locales/en';
import { Locale, ProjectTranslation, TranslationDictionary } from './types';
import { getNestedValue, interpolate } from './utils';

type ProjectMap = Record<string, ProjectTranslation>;

const uiCache: Partial<Record<Locale, TranslationDictionary>> = {
  en: enUi,
};

const projectCache: Partial<Record<Locale, ProjectMap>> = {};

async function loadLocalePack(locale: Locale): Promise<void> {
  if (locale === 'en') return;

  switch (locale) {
    case 'sv': {
      if (!uiCache.sv) uiCache.sv = (await import('./locales/sv')).svUi;
      if (!projectCache.sv) projectCache.sv = (await import('./projects/sv')).svProjects;
      break;
    }
    case 'tr': {
      if (!uiCache.tr) uiCache.tr = (await import('./locales/tr')).trUi;
      if (!projectCache.tr) projectCache.tr = (await import('./projects/tr')).trProjects;
      break;
    }
    case 'es': {
      if (!uiCache.es) uiCache.es = (await import('./locales/es')).esUi;
      if (!projectCache.es) projectCache.es = (await import('./projects/es')).esProjects;
      break;
    }
    case 'fr': {
      if (!uiCache.fr) uiCache.fr = (await import('./locales/fr')).frUi;
      if (!projectCache.fr) projectCache.fr = (await import('./projects/fr')).frProjects;
      break;
    }
    case 'ar': {
      if (!uiCache.ar) uiCache.ar = (await import('./locales/ar')).arUi;
      if (!projectCache.ar) projectCache.ar = (await import('./projects/ar')).arProjects;
      break;
    }
  }
}

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
    if (stored && LANGUAGES.some((l) => l.code === stored)) {
      return stored as Locale;
    }
  } catch {
    // ignore
  }
  return DEFAULT_LOCALE;
}

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locale, setLocaleState] = useState<Locale>(readStoredLocale);
  const [localeTick, setLocaleTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    if (locale === 'en') return;
    loadLocalePack(locale).then(() => {
      if (!cancelled) setLocaleTick((n) => n + 1);
    });
    return () => {
      cancelled = true;
    };
  }, [locale]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore
    }
  }, []);

  const dir = LANGUAGES.find((lang) => lang.code === locale)?.dir ?? 'ltr';
  const activeUi = uiCache[locale] ?? enUi;

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = dir;
    document.title = getNestedValue(activeUi, 'meta.title') ?? document.title;
  }, [locale, dir, activeUi, localeTick]);

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) => {
      const value =
        getNestedValue(activeUi, key) ??
        getNestedValue(enUi, key) ??
        key;
      return interpolate(value, vars);
    },
    [activeUi, localeTick]
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

      const translated = projectCache[locale]?.[project.id];
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
    [locale, localizeTag, localeTick]
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
