import React, { useState, useEffect } from 'react';
import { X, Github, Mail, Send, Check, Globe, MessageSquare } from 'lucide-react';
import { CONTACT_EMAIL } from '../constants/contact';
import { ALL_PROJECTS } from '../data/projectsData';
import { useI18n } from '../i18n/context';

interface ConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ConnectModal: React.FC<ConnectModalProps> = ({ isOpen, onClose }) => {
  const { t } = useI18n();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

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

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const subject = encodeURIComponent(t('connect.mailSubject'));
    const body = encodeURIComponent(
      `${message.trim()}\n\n---\nReply to: ${email.trim() || t('connect.replyNotProvided')}`
    );
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;

    setSent(true);
    setTimeout(() => {
      setSent(false);
      setMessage('');
      setEmail('');
      onClose();
    }, 2000);
  };

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="connect-modal-title"
    >
      <div
        className="bg-[#121212] rounded-2xl max-w-xl w-full border border-white/10 p-6 md:p-8 my-8 shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-6 right-6 p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors cursor-pointer z-10"
          aria-label={t('connect.close')}
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1 text-blue-400 font-mono text-xs font-bold uppercase tracking-wider">
            <Globe className="w-4 h-4" /> <span>{t('connect.network')}</span>
          </div>
          <h3 id="connect-modal-title" className="font-sora text-2xl font-black text-white">
            {t('connect.title')}
          </h3>
          <p className="text-white/60 text-sm mt-1 font-inter">
            {t('connect.subtitle')}
          </p>
        </div>

        {/* Status indicator badge */}
        <div className="bg-[#181818] p-4 rounded-xl border border-white/5 flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="relative">
              <span className="w-3 h-3 rounded-full bg-emerald-500 block"></span>
              <span className="w-3 h-3 rounded-full bg-emerald-400 absolute inset-0 animate-ping opacity-75"></span>
            </div>
            <div>
              <div className="font-sora text-sm font-bold text-white">{t('connect.statusTitle')}</div>
              <div className="font-mono text-xs text-white/60">{t('connect.statusSubtitle', { count: ALL_PROJECTS.length })}</div>
            </div>
          </div>
          <div className="font-mono text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded font-bold">
            {t('connect.operational')}
          </div>
        </div>

        {/* Creator Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
          <a
            href="https://github.com/nRn-World?tab=repositories"
            target="_blank"
            rel="noreferrer"
            className="p-3.5 bg-[#181818] rounded-xl border border-white/5 hover:border-blue-500/50 transition-all flex items-center gap-3 group cursor-pointer"
          >
            <div className="p-2 rounded-lg bg-white/5 group-hover:bg-blue-600/20 text-blue-400 transition-colors">
              <Github className="w-5 h-5" />
            </div>
            <div>
              <div className="font-sora text-xs font-bold text-white">{t('connect.githubTitle')}</div>
              <div className="font-mono text-[11px] text-white/60">{t('connect.githubHandle')}</div>
            </div>
          </a>

          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="p-3.5 bg-[#181818] rounded-xl border border-white/5 hover:border-blue-500/50 transition-all flex items-center gap-3 group cursor-pointer"
          >
            <div className="p-2 rounded-lg bg-white/5 group-hover:bg-blue-600/20 text-blue-400 transition-colors">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="font-sora text-xs font-bold text-white">{t('connect.emailTitle')}</div>
              <div className="font-mono text-[11px] text-white/60 truncate max-w-[140px]">{CONTACT_EMAIL}</div>
            </div>
          </a>
        </div>

        {/* Message / Feedback Form */}
        <form onSubmit={handleSendMessage} className="space-y-4">
          <div className="font-sora text-sm font-bold text-white flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-blue-400" />
            <span>{t('connect.formTitle')}</span>
          </div>

          <div>
            <label className="block font-mono text-xs text-white/70 mb-1">{t('connect.emailLabel')}</label>
            <input
              type="email"
              placeholder={t('connect.emailPlaceholder')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#181818] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block font-mono text-xs text-white/70 mb-1">{t('connect.messageLabel')}</label>
            <textarea
              required
              rows={3}
              placeholder={t('connect.messagePlaceholder')}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full bg-[#181818] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="bg-white/5 hover:bg-white/10 px-4 py-2 rounded-lg text-sm text-white/70 hover:text-white transition-colors cursor-pointer"
            >
              {t('connect.close')}
            </button>
            <button
              type="submit"
              disabled={sent}
              className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-xl text-sm font-bold transition-all active:scale-95 shadow-lg shadow-blue-900/30 flex items-center gap-2 cursor-pointer"
            >
              {sent ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>{t('connect.sent')}</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>{t('connect.submit')}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
