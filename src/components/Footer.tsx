import React, { useState } from 'react';
import { Github, Copy, Check } from 'lucide-react';
import { CONTACT_EMAIL } from '../constants/contact';
import { SwishModal } from './SwishModal';
import { AboutModal } from './AboutModal';
import { useI18n } from '../i18n/context';

interface FooterProps {
  onOpenConnect: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenConnect }) => {
  const { t } = useI18n();
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [swishOpen, setSwishOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);

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
    <footer className="w-full py-6 bg-[#0D0D0D] border-t border-white/5 mt-auto">
      <div className="flex flex-col md:flex-row justify-between items-center px-4 md:px-8 max-w-[1440px] mx-auto gap-4 text-xs font-mono text-white/50">
        {/* Left Status */}
        <div className="flex items-center gap-2.5">
          <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)] animate-pulse"></span>
          <span className="flex items-center">
            {t('footer.copyright')}&nbsp;
            <span className="text-white/80 font-bold inline-flex items-center">
              n<span className="text-blue-400">R</span>nWorld
            </span>
            &nbsp;{t('footer.systems')}
          </span>
        </div>

        {/* Center Links */}
        <div className="flex items-center gap-5">
          <button
            type="button"
            onClick={() => setSwishOpen(true)}
            className="hover:opacity-90 transition-opacity cursor-pointer p-0.5"
            title={t('footer.swishTitle')}
            aria-label={t('footer.swishAria')}
          >
            <img src="/swish-logo.png" alt="Swish" className="h-6 w-auto" />
          </button>
          <a
            href="https://ko-fi.com/nrnworld"
            target="_blank"
            rel="noreferrer"
            className="hover:text-blue-400 transition-colors flex items-center gap-1.5"
            title={t('footer.kofiTitle')}
            aria-label={t('footer.kofiAria')}
          >
            <img src="/ko-fi.png" alt="Ko-fi" className="h-7 w-7 rounded-md object-cover" />
            <span>{t('footer.kofiLabel')}</span>
          </a>
          <button
            onClick={onOpenConnect}
            className="hover:text-blue-400 transition-colors cursor-pointer"
          >
            {t('footer.contact')}
          </button>
          <a
            href="https://github.com/nRn-World?tab=repositories"
            target="_blank"
            rel="noreferrer"
            className="hover:text-blue-400 transition-colors flex items-center gap-1.5"
          >
            <Github className="w-3.5 h-3.5" />
            {t('footer.github')}
          </a>
        </div>

        {/* Right: About + contact email */}
        <div className="flex items-center gap-3 text-[11px] tracking-wide text-white/50 font-mono">
          <button
            type="button"
            onClick={() => setAboutOpen(true)}
            className="text-blue-400 hover:text-blue-300 font-semibold transition-colors cursor-pointer"
          >
            {t('footer.about')}
          </button>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="hover:text-blue-400 transition-colors"
          >
            {CONTACT_EMAIL}
          </a>
          <button
            onClick={handleCopyEmail}
            className="p-1 rounded-md hover:bg-white/10 text-white/50 hover:text-blue-400 transition-colors cursor-pointer"
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

      <SwishModal isOpen={swishOpen} onClose={() => setSwishOpen(false)} />
      <AboutModal isOpen={aboutOpen} onClose={() => setAboutOpen(false)} />
    </footer>
  );
};
