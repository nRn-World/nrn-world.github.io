import React from 'react';
import { Locale } from '../i18n/types';

// Small inline SVG flags (emoji flags do not render on Windows). Language ↔ flag is a convention:
// English = United Kingdom, Arabic = United Arab Emirates.
function starPoints(cx: number, cy: number, outer: number, inner: number): string {
  return Array.from({ length: 10 }, (_, i) => {
    const r = i % 2 === 0 ? outer : inner;
    const angle = ((-90 + i * 36) * Math.PI) / 180;
    return `${(cx + r * Math.cos(angle)).toFixed(2)},${(cy + r * Math.sin(angle)).toFixed(2)}`;
  }).join(' ');
}

const FLAGS: Record<Locale, React.ReactNode> = {
  en: (
    <>
      <rect width="60" height="40" fill="#012169" />
      <path d="M0 0L60 40M60 0L0 40" stroke="#fff" strokeWidth="8" />
      <path d="M0 0L60 40M60 0L0 40" stroke="#C8102E" strokeWidth="3" />
      <path d="M30 0V40M0 20H60" stroke="#fff" strokeWidth="12" />
      <path d="M30 0V40M0 20H60" stroke="#C8102E" strokeWidth="7" />
    </>
  ),
  sv: (
    <>
      <rect width="60" height="40" fill="#006AA7" />
      <rect x="18" width="8" height="40" fill="#FECC00" />
      <rect y="16" width="60" height="8" fill="#FECC00" />
    </>
  ),
  tr: (
    <>
      <rect width="60" height="40" fill="#E30A17" />
      <circle cx="23" cy="20" r="10" fill="#fff" />
      <circle cx="26" cy="20" r="8" fill="#E30A17" />
      <polygon points={starPoints(35, 20, 5, 2)} fill="#fff" />
    </>
  ),
  es: (
    <>
      <rect width="60" height="40" fill="#AA151B" />
      <rect y="10" width="60" height="20" fill="#F1BF00" />
    </>
  ),
  fr: (
    <>
      <rect width="20" height="40" fill="#0055A4" />
      <rect x="20" width="20" height="40" fill="#fff" />
      <rect x="40" width="20" height="40" fill="#EF4135" />
    </>
  ),
  ar: (
    <>
      <rect width="60" height="13.4" fill="#00732F" />
      <rect y="13.3" width="60" height="13.4" fill="#fff" />
      <rect y="26.6" width="60" height="13.4" fill="#000" />
      <rect width="15" height="40" fill="#CE1126" />
    </>
  ),
};

export const Flag: React.FC<{ locale: Locale; className?: string }> = ({ locale, className = '' }) => (
  <svg
    viewBox="0 0 60 40"
    className={`w-5 h-[14px] rounded-[2px] ring-1 ring-white/20 shrink-0 ${className}`}
    aria-hidden="true"
    focusable="false"
  >
    {FLAGS[locale]}
  </svg>
);
