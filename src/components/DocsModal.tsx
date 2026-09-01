import React, { useEffect } from 'react';
import { X, ShieldCheck, Laptop, CheckCircle2, FileArchive } from 'lucide-react';
import { useI18n } from '../i18n/context';

interface DocsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DocsModal: React.FC<DocsModalProps> = ({ isOpen, onClose }) => {
  const { t } = useI18n();

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
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

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="docs-modal-title"
    >
      <div
        className="bg-[#121212] rounded-2xl max-w-3xl w-full border border-white/10 p-6 md:p-8 my-8 shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-6 right-6 p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors cursor-pointer z-10"
          aria-label={t('docs.close')}
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1 text-blue-400 font-mono text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" /> {t('docs.badge')}
          </div>
          <h3 id="docs-modal-title" className="font-sora text-2xl font-black text-white">
            {t('docs.title')}
          </h3>
          <p className="text-white/60 text-sm mt-1 font-inter">
            {t('docs.subtitle')}
          </p>
        </div>

        <div className="space-y-6 text-sm text-white/70 font-inter">
          {/* Windows .ZIP Guide */}
          <div className="bg-[#181818] p-5 rounded-xl border border-white/5">
            <div className="flex items-center gap-3 mb-3 text-white font-sora font-bold">
              <div className="p-2 rounded-lg bg-blue-600/20 text-blue-400">
                <FileArchive className="w-4 h-4" />
              </div>
              <span>{t('docs.zipTitle')}</span>
            </div>
            <ol className="list-decimal list-inside space-y-2 text-xs md:text-sm pl-2 leading-relaxed">
              <li>{t('docs.zipStep1')}</li>
              <li>{t('docs.zipStep2')}</li>
              <li>{t('docs.zipStep3')}</li>
              <li>{t('docs.zipStep4')}</li>
              <li>
                {t('docs.zipStep5Intro')}
                <div className="mt-1 ml-4 p-2.5 bg-[#0A0A0A] rounded-lg border border-white/10 font-mono text-xs text-blue-400">
                  {t('docs.zipStep5Action')}
                </div>
              </li>
            </ol>
          </div>

          {/* Portable & CLI */}
          <div className="bg-[#181818] p-5 rounded-xl border border-white/5">
            <div className="flex items-center gap-3 mb-3 text-white font-sora font-bold">
              <div className="p-2 rounded-lg bg-blue-600/20 text-blue-400">
                <Laptop className="w-4 h-4" />
              </div>
              <span>{t('docs.portableTitle')}</span>
            </div>
            <p className="text-xs md:text-sm leading-relaxed mb-3">
              {t('docs.portableBody')}
            </p>
            <div className="p-3 bg-[#0A0A0A] rounded-lg border border-white/10 font-mono text-xs text-white/80">
              # For Linux & macOS terminal binaries:<br />
              <span className="text-blue-400">chmod +x ./vortex-cli-linux-amd64</span><br />
              <span className="text-blue-400">./vortex-cli-linux-amd64 --help</span>
            </div>
          </div>

          {/* Integrity Check */}
          <div className="bg-[#181818] p-5 rounded-xl border border-white/5">
            <div className="flex items-center gap-3 mb-2 text-white font-sora font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{t('docs.verifyTitle')}</span>
            </div>
            <p className="text-xs text-white/70 leading-relaxed">
              {t('docs.verifyBody')}
            </p>
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="bg-white/5 hover:bg-white/10 text-white/70 hover:text-white px-5 py-2 rounded-xl text-sm font-mono transition-colors cursor-pointer"
          >
            {t('docs.close')}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-xl text-sm font-bold transition-all active:scale-95 shadow-lg shadow-blue-900/30 cursor-pointer"
          >
            {t('docs.gotIt')}
          </button>
        </div>
      </div>
    </div>
  );
};
