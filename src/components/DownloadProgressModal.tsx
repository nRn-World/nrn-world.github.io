import React from 'react';
import { Download, CheckCircle2, ShieldCheck, X } from 'lucide-react';
import { ActiveDownload } from '../utils/downloadHelper';
import { useI18n } from '../i18n/context';

interface DownloadProgressModalProps {
  download: ActiveDownload | null;
  onClose: () => void;
}

export const DownloadProgressModal: React.FC<DownloadProgressModalProps> = ({
  download,
  onClose,
}) => {
  const { t } = useI18n();

  if (!download) return null;

  const isComplete = download.status === 'completed';
  const isVerifying = download.status === 'verifying';
  const speedValue = download.speed.replace(' MB/s', '');

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md w-full animate-in slide-in-from-bottom-5 duration-300">
      <div className="bg-[#121212] rounded-2xl p-5 border border-blue-500/30 shadow-2xl shadow-black/90">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${isComplete ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-600/20 text-blue-400'}`}>
              {isComplete ? (
                <CheckCircle2 className="w-5 h-5 animate-bounce" />
              ) : (
                <Download className="w-5 h-5 animate-pulse" />
              )}
            </div>
            <div>
              <h4 className="font-sora text-sm font-bold text-white line-clamp-1">
                {isComplete ? t('downloadModal.complete') : t('downloadModal.downloading')}
              </h4>
              <p className="font-mono text-xs text-white/50 truncate max-w-[240px]">
                {download.option.filename}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2 mb-3">
          <div className="w-full bg-[#1A1A1A] h-2 rounded-full overflow-hidden border border-white/5">
            <div
              className={`h-full transition-all duration-150 rounded-full ${
                isComplete
                  ? 'bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)]'
                  : 'bg-gradient-to-r from-blue-600 to-blue-400 shadow-[0_0_12px_rgba(59,130,246,0.6)]'
              }`}
              style={{ width: `${download.progress}%` }}
            />
          </div>

          <div className="flex justify-between items-center font-mono text-[11px] text-white/70">
            <span>
              {t('downloadModal.progress', { received: download.receivedMB, total: download.totalMB })}
            </span>
            <span>
              {isVerifying ? t('downloadModal.verifying') : isComplete ? t('downloadModal.verified') : t('downloadModal.speed', { speed: speedValue })}
            </span>
          </div>
        </div>

        {/* Verification Check / MD5 */}
        <div className="bg-[#181818] rounded-xl p-2.5 border border-white/5 flex items-center justify-between text-xs font-mono text-white/80">
          <div className="flex items-center gap-1.5 truncate mr-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="truncate">{t('downloadModal.md5Label', { hash: download.option.md5Checksum.substring(0, 16) })}</span>
          </div>
          {isComplete && (
            <span className="text-emerald-400 font-bold shrink-0">{t('downloadModal.pass')}</span>
          )}
        </div>

        {/* Action Tip */}
        {isComplete && (
          <div className="mt-3 pt-3 border-t border-white/10 text-xs text-white/70 flex items-center justify-between">
            <span className="text-[11px]">{t('downloadModal.savedHint')}</span>
            <button
              onClick={onClose}
              className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer"
            >
              {t('downloadModal.done')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
