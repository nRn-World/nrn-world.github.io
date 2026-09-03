import React, { useState } from 'react';
import { Github, Copy, Check } from 'lucide-react';
import { CONTACT_EMAIL } from '../constants/contact';
import { SwishModal } from './SwishModal';
import { useI18n } from '../i18n/context';

interface FooterProps {
  onOpenConnect: () => void;
  onOpenAbout: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenConnect, onOpenAbout }) => {
  const { t } = useI18n();
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [swishOpen, setSwishOpen] = useState(false);

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(CONTACT_EMAIL);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = CONTACT_EMAIL;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    }
  };

  return (
    <footer className="w-full pt-5 pb-8 md:pb-7 bg-[#0D0D0D] border-t border-white/5 mt-auto safe-area-bottom overflow-x-hidden">
      <div className="px-4 md:px-8 max-w-[1440px] mx-auto text-xs font-mono text-white/50 text-center min-w-0">
        {/* Copyright + links — wrap on mobile, no horizontal scroll */}
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 max-w-full">
          <div className="flex items-start sm:items-center gap-2.5 min-w-0 max-w-full justify-center">
            <span className="w-2 h-2 mt-1 sm:mt-0 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)] animate-pulse shrink-0" />
            <span className="leading-relaxed text-center sm:text-left">
              {t('footer.copyright')}{' '}
              <span className="text-white/80 font-bold">
                n<span className="text-blue-400">R</span>nWorld
              </span>{' '}
              {t('footer.systems')}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setSwishOpen(true)}
            className="hover:opacity-90 transition-opacity cursor-pointer p-0.5 shrink-0"
            title={t('footer.swishTitle')}
            aria-label={t('footer.swishAria')}
          >
            <img
              src="/swish-logo.png"
              alt="Swish"
              width={67}
              height={24}
              className="h-6 w-[67px] object-contain"
              loading="lazy"
              decoding="async"
            />
          </button>

          <a
            href="https://ko-fi.com/nrnworld"
            target="_blank"
            rel="noreferrer"
            className="hover:text-blue-400 transition-colors flex items-center gap-1.5 shrink-0"
            title={t('footer.kofiTitle')}
            aria-label={t('footer.kofiAria')}
          >
            <img
              src="/ko-fi.png"
              alt="Ko-fi"
              width={28}
              height={28}
              className="h-7 w-7 rounded-md object-cover shrink-0"
              loading="lazy"
              decoding="async"
            />
            <span className="sm:hidden">Ko-fi</span>
            <span className="hidden sm:inline">{t('footer.kofiLabel')}</span>
          </a>

          <button
            onClick={onOpenConnect}
            className="hover:text-blue-400 transition-colors cursor-pointer shrink-0"
          >
            {t('footer.contact')}
          </button>

          <a
            href="https://github.com/nRn-World?tab=repositories"
            target="_blank"
            rel="noreferrer"
            className="hover:text-blue-400 transition-colors flex items-center gap-1.5 shrink-0"
          >
            <Github className="w-3.5 h-3.5 shrink-0" />
            <span className="sm:hidden">GitHub</span>
            <span className="hidden sm:inline">{t('footer.github')}</span>
          </a>
        </div>

        {/* About + email — only row below */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-1.5 text-xs tracking-wide text-white/65 font-mono">
          <button
            type="button"
            onClick={onOpenAbout}
            className="text-blue-400 hover:text-blue-300 font-semibold transition-colors cursor-pointer shrink-0"
          >
            {t('footer.about')}
          </button>
          <div className="flex items-center gap-2 min-w-0">
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="text-white/75 hover:text-blue-400 transition-colors truncate"
            >
              {CONTACT_EMAIL}
            </a>
            <button
              onClick={handleCopyEmail}
              className="p-1 rounded-md hover:bg-white/10 text-white/50 hover:text-blue-400 transition-colors cursor-pointer shrink-0"
              title={copiedEmail ? t('footer.copied') : t('footer.copyEmail')}
              aria-label={t('footer.copyEmail')}
            >
              {copiedEmail ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>
      </div>

      <SwishModal isOpen={swishOpen} onClose={() => setSwishOpen(false)} />
    </footer>
  );
};
