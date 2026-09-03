import React, { useState, useEffect, useRef } from 'react';
import { X, Github, Mail, Send, Check, Globe, MessageSquare, AlertCircle } from 'lucide-react';
import { CONTACT_EMAIL, WEB3FORMS_ACCESS_KEY } from '../constants/contact';
import { ALL_PROJECTS } from '../data/projectsData';
import { useI18n } from '../i18n/context';

interface ConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const ConnectModal: React.FC<ConnectModalProps> = ({ isOpen, onClose }) => {
  const { t } = useI18n();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [link, setLink] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const [errorDetail, setErrorDetail] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

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

  useEffect(() => {
    if (!isOpen) {
      setSent(false);
      setSending(false);
      setErrorKey(null);
      setErrorDetail(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const resolveErrorMessage = (code: string) => {
    switch (code) {
      case 'email_required':
        return t('connect.emailRequired');
      case 'name_required':
        return t('connect.nameRequired');
      case 'email_invalid':
        return t('connect.emailInvalid');
      case 'message_required':
        return t('connect.messageRequired');
      case 'email_not_configured':
        return t('connect.sendErrorConfig');
      case 'activation_required':
        return t('connect.activationRequired');
      case 'rate_limited':
        return t('connect.rateLimited');
      case 'send_blocked':
        return t('connect.sendBlocked');
      default:
        return t('connect.sendError');
    }
  };

  const resetForm = () => {
    setName('');
    setEmail('');
    setLink('');
    setMessage('');
  };

  const submitViaServerFallback = async (payload: {
    name: string;
    email: string;
    link: string;
    message: string;
  }): Promise<'ok' | 'activation_required' | 'failed'> => {
    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        ...payload,
        subject: t('connect.mailSubject'),
      }),
    });

    const data = await response.json().catch(() => ({}));

    if (response.ok && data.ok === true) {
      return 'ok';
    }

    if (data.error === 'activation_required') {
      return 'activation_required';
    }

    return 'failed';
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorKey(null);
    setErrorDetail(null);

    const form = formRef.current;
    const formName =
      (form?.querySelector('input[name="name"]') as HTMLInputElement | null)?.value ?? name;
    const formEmail =
      (form?.querySelector('input[name="email"]') as HTMLInputElement | null)?.value ?? email;
    const formLink =
      (form?.querySelector('input[name="link"]') as HTMLInputElement | null)?.value ?? link;
    const formMessage =
      (form?.querySelector('textarea[name="message"]') as HTMLTextAreaElement | null)?.value ??
      message;

    const trimmedName = formName.trim();
    const trimmedEmail = formEmail.trim();
    const trimmedLink = formLink.trim();
    const trimmedMessage = formMessage.trim();

    if (!trimmedName) {
      setErrorKey('name_required');
      return;
    }

    if (!trimmedEmail) {
      setErrorKey('email_required');
      return;
    }

    if (!EMAIL_RE.test(trimmedEmail)) {
      setErrorKey('email_invalid');
      return;
    }

    if (!trimmedMessage) {
      setErrorKey('message_required');
      return;
    }

    setSending(true);

    const payload = {
      name: trimmedName,
      email: trimmedEmail,
      link: trimmedLink,
      message: trimmedMessage,
    };

    const web3formsBody: Record<string, string> = {
      access_key: WEB3FORMS_ACCESS_KEY,
      subject: t('connect.mailSubject'),
      name: trimmedName,
      email: trimmedEmail,
      replyto: trimmedEmail,
      message: trimmedMessage,
      botcheck: '',
    };
    if (trimmedLink) {
      web3formsBody.link = trimmedLink;
    }

    const handleSuccess = () => {
      setSent(true);
      setTimeout(() => {
        setSent(false);
        resetForm();
        onClose();
      }, 2000);
    };

    try {
      if (!WEB3FORMS_ACCESS_KEY) {
        const fallback = await submitViaServerFallback(payload);
        if (fallback === 'ok') {
          handleSuccess();
          return;
        }
        setErrorKey(fallback === 'activation_required' ? 'activation_required' : 'send_failed');
        return;
      }

      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(web3formsBody),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || data.success !== true) {
        console.error('Web3Forms error:', data);
        const fallback = await submitViaServerFallback(payload).catch(() => 'failed' as const);
        if (fallback === 'ok') {
          handleSuccess();
          return;
        }

        if (fallback === 'activation_required') {
          setErrorKey('activation_required');
          return;
        }

        if (response.status === 429) {
          setErrorKey('rate_limited');
          return;
        }

        setErrorKey('send_failed');
        if (typeof data.message === 'string' && data.message.trim()) {
          setErrorDetail(data.message.trim());
        }
        return;
      }

      handleSuccess();
    } catch (error) {
      console.error('Contact form network error:', error);
      try {
        const fallback = await submitViaServerFallback(payload);
        if (fallback === 'ok') {
          handleSuccess();
          return;
        }
        if (fallback === 'activation_required') {
          setErrorKey('activation_required');
          return;
        }
      } catch {
        // ignore secondary failure
      }
      setErrorKey('send_blocked');
    } finally {
      setSending(false);
    }
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

        <form ref={formRef} onSubmit={handleSendMessage} className="space-y-4">
          <input type="checkbox" name="botcheck" className="hidden" style={{ display: 'none' }} tabIndex={-1} autoComplete="off" />
          <div className="font-sora text-sm font-bold text-white flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-blue-400" />
            <span>{t('connect.formTitle')}</span>
          </div>

          <div>
            <label className="block font-mono text-xs text-white/70 mb-1">
              {t('connect.nameLabel')} <span className="text-blue-400">*</span>
            </label>
            <input
              type="text"
              name="name"
              required
              autoComplete="name"
              placeholder={t('connect.namePlaceholder')}
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errorKey) setErrorKey(null);
              }}
              className="w-full bg-[#181818] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block font-mono text-xs text-white/70 mb-1">
              {t('connect.emailLabel')} <span className="text-blue-400">*</span>
            </label>
            <input
              type="email"
              name="email"
              required
              autoComplete="email"
              placeholder={t('connect.emailPlaceholder')}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errorKey) setErrorKey(null);
              }}
              className="w-full bg-[#181818] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block font-mono text-xs text-white/70 mb-1">
              {t('connect.linkLabel')}
            </label>
            <input
              type="text"
              name="link"
              inputMode="url"
              autoComplete="url"
              placeholder={t('connect.linkPlaceholder')}
              value={link}
              onChange={(e) => {
                setLink(e.target.value);
                if (errorKey) setErrorKey(null);
              }}
              className="w-full bg-[#181818] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block font-mono text-xs text-white/70 mb-1">
              {t('connect.messageLabel')} <span className="text-blue-400">*</span>
            </label>
            <textarea
              name="message"
              required
              rows={3}
              placeholder={t('connect.messagePlaceholder')}
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                if (errorKey) setErrorKey(null);
              }}
              className="w-full bg-[#181818] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          {errorKey && (
            <div className="flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                {resolveErrorMessage(errorKey)}
                {errorDetail ? ` (${errorDetail})` : ''}
              </span>
            </div>
          )}

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
              disabled={sent || sending}
              className="bg-blue-600 hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed text-white px-5 py-2 rounded-xl text-sm font-bold transition-all active:scale-95 shadow-lg shadow-blue-900/30 flex items-center gap-2 cursor-pointer"
            >
              {sent ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>{t('connect.sent')}</span>
                </>
              ) : sending ? (
                <span>{t('connect.sending')}</span>
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
