import React from 'react';
import { Star, Github, ExternalLink, Check, Copy, X, Sparkles, Heart } from 'lucide-react';
import { Project } from '../types';
import { useI18n } from '../i18n/context';

interface StarGithubModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
  hasStarredLocally: boolean;
}

export const StarGithubModal: React.FC<StarGithubModalProps> = ({
  isOpen,
  onClose,
  project,
}) => {
  const { t } = useI18n();
  const [copied, setCopied] = React.useState(false);

  if (!isOpen || !project) return null;

  const repoName = project.githubUrl.replace('https://github.com/', '');

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(project.githubUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleOpenGithub = () => {
    window.open(project.githubUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative bg-[#121212] border border-white/10 rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-2xl shadow-black/80 text-center overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow effect behind star */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/5 transition-colors cursor-pointer z-10"
          aria-label={t('starModal.close')}
        >
          <X className="w-4 h-4" />
        </button>

        {/* Star Icon Badge */}
        <div className="relative inline-flex items-center justify-center mb-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400/20 via-yellow-500/10 to-amber-600/20 border border-amber-400/30 flex items-center justify-center shadow-lg shadow-amber-500/10 animate-bounce">
            <Star className="w-8 h-8 text-amber-400 fill-amber-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.8)]" />
          </div>
          <Sparkles className="w-4 h-4 text-amber-300 absolute -top-1 -right-1 animate-pulse" />
        </div>

        <h3 className="font-sora text-xl sm:text-2xl font-bold text-white mb-2">
          {t('starModal.title')}
        </h3>

        <p className="text-white/70 font-inter text-sm mb-6 leading-relaxed">
          {t('starModal.body', { name: project.name })}
        </p>

        {/* GitHub Repository Box */}
        <div className="bg-[#181818] rounded-xl p-3.5 border border-white/10 flex items-center justify-between mb-6 text-left">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="p-2 rounded-lg bg-white/5 text-white/80 shrink-0">
              <Github className="w-4 h-4" />
            </div>
            <div className="overflow-hidden">
              <div className="text-[11px] font-mono text-white/40 uppercase tracking-wider">{t('starModal.repo')}</div>
              <div className="text-xs font-mono text-white font-semibold truncate">
                {repoName}
              </div>
            </div>
          </div>

          <button
            onClick={handleCopyLink}
            className="p-2 rounded-lg hover:bg-white/5 text-white/60 hover:text-white transition-colors shrink-0 cursor-pointer"
            title={t('starModal.copy')}
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleOpenGithub}
            className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-sora font-bold px-5 py-3 rounded-xl text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/20 active:scale-95 cursor-pointer"
          >
            <Star className="w-4 h-4 fill-black" />
            <span>{t('starModal.openGithub')}</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-80" />
          </button>

          <button
            onClick={onClose}
            className="px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white font-mono text-xs border border-white/10 transition-colors cursor-pointer"
          >
            {t('starModal.done')}
          </button>
        </div>

        <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] font-mono text-white/40">
          <Heart className="w-3 h-3 text-red-400 fill-red-400/40" />
          <span>{t('starModal.thanks')}</span>
        </div>
      </div>
    </div>
  );
};
