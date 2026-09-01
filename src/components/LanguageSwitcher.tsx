import React, { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, Globe } from 'lucide-react';
import { LANGUAGES } from '../i18n/languages';
import { useI18n } from '../i18n/context';
import { Locale } from '../i18n/types';

export const LanguageSwitcher: React.FC = () => {
  const { locale, setLocale, t, dir } = useI18n();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const current = LANGUAGES.find((lang) => lang.code === locale) ?? LANGUAGES[0];

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, []);

  const handleSelect = (code: Locale) => {
    setLocale(code);
    setOpen(false);
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-blue-500/40 text-xs font-mono text-white/80 hover:text-white transition-all cursor-pointer shrink-0"
        aria-label={t('language.choose')}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <Globe className="w-4 h-4 text-blue-400 shrink-0" />
        <span className="hidden sm:inline max-w-[5.5rem] truncate">{current.native}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-white/50 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div
          className={`absolute mt-2 min-w-[11rem] z-[60] rounded-xl border border-white/10 bg-[#121212] shadow-2xl shadow-black/60 py-1.5 overflow-hidden ${
            dir === 'rtl' ? 'left-0' : 'right-0'
          }`}
          role="listbox"
          aria-label={t('language.label')}
        >
          {LANGUAGES.map((lang) => {
            const isActive = lang.code === locale;
            return (
              <button
                key={lang.code}
                type="button"
                role="option"
                aria-selected={isActive}
                onClick={() => handleSelect(lang.code)}
                className={`w-full px-3.5 py-2.5 text-sm font-inter flex items-center justify-between gap-3 transition-colors cursor-pointer ${
                  dir === 'rtl' ? 'text-right' : 'text-left'
                } ${
                  isActive
                    ? 'bg-blue-600/15 text-blue-300'
                    : 'text-white/75 hover:bg-white/5 hover:text-white'
                }`}
              >
                <span className="flex flex-col leading-tight">
                  <span className="font-medium">{lang.native}</span>
                  <span className="text-[10px] text-white/40 font-mono">{lang.label}</span>
                </span>
                {isActive && <Check className="w-4 h-4 text-blue-400 shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
