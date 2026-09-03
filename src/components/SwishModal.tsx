import React, { useEffect, useState } from 'react';
import { X, Copy, Check, Heart } from 'lucide-react';
import { useI18n } from '../i18n/context';

const SWISH_NUMBER = '0702202027';
const SWISH_QR_PAYLOAD = `C${SWISH_NUMBER};0;Tack nRnWorld;1`;

interface SwishModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SwishModal: React.FC<SwishModalProps> = ({ isOpen, onClose }) => {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);

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

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(SWISH_QR_PAYLOAD)}`;

  const handleCopyNumber = async () => {
    try {
      await navigator.clipboard.writeText(SWISH_NUMBER);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = SWISH_NUMBER;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="swish-modal-title"
    >
      <div
        className="bg-[#121212] rounded-2xl max-w-md w-full border border-white/10 p-6 md:p-8 my-8 shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-6 right-6 p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors cursor-pointer z-10"
          aria-label={t('swish.close')}
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <img
            src="/swish-logo.png"
            alt="Swish"
            width={80}
            height={30}
            className="h-8 w-20 object-contain"
            loading="lazy"
            decoding="async"
          />
          <div>
            <h3 id="swish-modal-title" className="font-sora text-xl font-black text-white">
              {t('swish.title')}
            </h3>
            <p className="text-white/50 text-xs font-mono mt-0.5">{t('swish.subtitle')}</p>
          </div>
        </div>

        <p className="text-sm text-white/70 font-inter leading-relaxed mb-6">
          {t('swish.body')}
        </p>

        <div className="bg-[#181818] rounded-xl border border-white/10 p-5 flex flex-col items-center text-center">
          <img
            src={qrImageUrl}
            alt={t('swish.qrAlt')}
            width={240}
            height={240}
            className="rounded-lg bg-white p-2 mb-4"
          />
          <p className="text-xs text-white/50 font-mono mb-2">{t('swish.qrHint')}</p>

          <div className="flex items-center gap-2 bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3 w-full justify-center">
            <Heart className="w-4 h-4 text-pink-400 shrink-0" />
            <span className="font-mono text-lg font-bold text-white tracking-wide">{SWISH_NUMBER}</span>
            <button
              type="button"
              onClick={handleCopyNumber}
              className="p-1.5 rounded-md hover:bg-white/10 text-white/50 hover:text-blue-400 transition-colors cursor-pointer ml-1"
              title={copied ? t('swish.copied') : t('swish.copy')}
              aria-label={t('swish.copy')}
            >
              {copied ? (
                <Check className="w-4 h-4 text-emerald-400" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-xl text-sm font-bold transition-all active:scale-95 shadow-lg shadow-blue-900/30 cursor-pointer"
          >
            {t('swish.close')}
          </button>
        </div>
      </div>
    </div>
  );
};
