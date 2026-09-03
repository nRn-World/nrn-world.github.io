import React, { useEffect, useState } from 'react';
import { X, Code2, Heart, Share2, Sparkles } from 'lucide-react';
import { useI18n } from '../i18n/context';
import { GITHUB_PROFILE_URL, INSTAGRAM_URL } from '../constants/social';
import { GitHubMarkIcon, InstagramGlyphIcon } from './BrandSocialIcons';
import { SwishModal } from './SwishModal';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  const { t } = useI18n();
  const [swishOpen, setSwishOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const highlights = [
    { icon: Code2, text: t('about.highlightCode') },
    { icon: Share2, text: t('about.highlightShare') },
    { icon: Heart, text: t('about.highlightOpen') },
    { icon: Sparkles, text: t('about.highlightLearn') },
  ];

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-md flex items-start sm:items-center justify-center p-3 sm:p-4 overflow-y-auto overscroll-contain"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="about-modal-title"
    >
      <div
        className="bg-[#121212] rounded-2xl max-w-3xl w-full border border-white/10 shadow-2xl relative my-4 sm:my-8 max-h-[calc(100dvh-2rem)] overflow-y-auto overscroll-contain"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-br from-blue-600/20 via-transparent to-transparent pointer-events-none rounded-t-2xl" />

        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-lg bg-black/40 hover:bg-white/10 text-white/60 hover:text-white transition-colors cursor-pointer z-10"
          aria-label={t('about.close')}
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-5 sm:p-6 md:p-8">
          <div className="flex flex-col sm:flex-row gap-5 sm:gap-6 md:gap-8 items-center sm:items-start mb-6">
            <div className="relative shrink-0 w-[148px] h-[222px] sm:w-[168px] sm:h-[252px]">
              <div className="w-full h-full rounded-2xl overflow-hidden border-2 border-blue-500/40 shadow-xl shadow-blue-950/50 ring-2 ring-blue-500/10 bg-[#1a1a1a]">
                <img
                  src="/profile.jpg"
                  alt={t('about.photoAlt')}
                  width={168}
                  height={252}
                  loading="eager"
                  decoding="async"
                  className="block w-full h-full object-cover object-top"
                />
              </div>
            </div>

            <div className="text-center sm:text-left flex-1 min-w-0 w-full sm:pt-2">
              <p className="font-mono text-[11px] uppercase tracking-widest text-blue-400 mb-1">
                {t('about.badge')}
              </p>
              <h2 id="about-modal-title" className="font-sora text-2xl md:text-3xl font-black text-white mb-1">
                {t('about.name')}
              </h2>
              <p className="font-mono text-sm text-white/50">{t('about.role')}</p>

              <div className="flex flex-col items-center sm:items-start gap-2.5 mt-4">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 w-full">
                  <a
                    href={INSTAGRAM_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 hover:border-pink-500/40 hover:bg-pink-500/10 transition-all"
                    aria-label={t('about.instagramLabel')}
                    title={t('about.instagramLabel')}
                  >
                    <InstagramGlyphIcon className="w-5 h-5 shrink-0" />
                    <span className="font-mono text-[11px] text-white/70 group-hover:text-white transition-colors">
                      {t('about.instagram')}
                    </span>
                  </a>
                  <a
                    href={GITHUB_PROFILE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 hover:border-white/25 hover:bg-white/[0.06] transition-all"
                    aria-label={t('about.githubLabel')}
                    title={t('about.githubLabel')}
                  >
                    <span className="w-5 h-5 shrink-0 rounded-md bg-white text-[#0d1117] flex items-center justify-center">
                      <GitHubMarkIcon className="w-4 h-4" />
                    </span>
                    <span className="font-mono text-[11px] text-white/70 group-hover:text-white transition-colors">
                      {t('about.github')}
                    </span>
                  </a>
                </div>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 w-full">
                  <button
                    type="button"
                    onClick={() => setSwishOpen(true)}
                    className="group flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 hover:border-emerald-500/40 hover:bg-emerald-500/10 transition-all cursor-pointer"
                    title={t('footer.swishTitle')}
                    aria-label={t('footer.swishAria')}
                  >
                    <img
                      src="/swish-logo.png"
                      alt=""
                      width={54}
                      height={20}
                      className="h-5 w-[54px] shrink-0 object-contain"
                      aria-hidden
                      loading="lazy"
                      decoding="async"
                    />
                    <span className="font-mono text-[11px] text-white/70 group-hover:text-white transition-colors">
                      Swish
                    </span>
                  </button>
                  <a
                    href="https://ko-fi.com/nrnworld"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 hover:border-blue-500/40 hover:bg-blue-500/10 transition-all"
                    title={t('footer.kofiTitle')}
                    aria-label={t('footer.kofiAria')}
                  >
                    <img src="/ko-fi.png" alt="" className="h-5 w-5 rounded-md object-cover shrink-0" aria-hidden />
                    <span className="font-mono text-[11px] text-white/70 group-hover:text-white transition-colors">
                      {t('footer.kofiLabel')}
                    </span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4 font-inter text-sm md:text-[15px] text-white/75 leading-relaxed mb-6">
            <p>{t('about.p1')}</p>
            <p>{t('about.p2')}</p>
            <p>{t('about.p3')}</p>
            <p>{t('about.p4')}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-6">
            {highlights.map(({ icon: Icon, text }) => (
              <div
                key={text}
                className="flex items-center gap-2.5 bg-white/[0.03] border border-white/5 rounded-xl px-3.5 py-2.5"
              >
                <Icon className="w-4 h-4 text-blue-400 shrink-0" />
                <span className="font-mono text-[11px] text-white/70">{text}</span>
              </div>
            ))}
          </div>

          <p className="font-inter text-xs text-white/45 italic border-t border-white/5 pt-4">
            {t('about.closing')}
          </p>
        </div>
      </div>

      <SwishModal isOpen={swishOpen} onClose={() => setSwishOpen(false)} />
    </div>
  );
};
