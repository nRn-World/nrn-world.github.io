import React from 'react';

interface IconProps {
  className?: string;
}

export const GitHubMarkIcon: React.FC<IconProps> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 98 96" aria-hidden="true">
    <path
      fill="currentColor"
      fillRule="evenodd"
      clipRule="evenodd"
      d="M48.854 0C21.839 0 0 22 0 49.217c0 21.756 13.993 40.172 33.405 46.69 2.427.49 2.714-.973 2.714-2.16 0-1.04-.035-4.197-.055-7.993-13.568 2.956-16.416-5.44-16.416-5.44-2.219-5.627-5.423-7.127-5.423-7.127-4.436-3.03.336-2.97.336-2.97 4.907.34 7.486 5.038 7.486 5.038 4.358 7.462 11.43 5.303 14.214 4.05.444-3.15 1.705-5.303 3.102-6.523-10.828-1.233-22.223-5.414-22.223-24.117 0-5.33 1.892-9.68 4.993-13.09-.5-1.23-2.2-6.17.475-12.87 0 0 4.075-1.305 13.356 5.002 3.873-1.082 8.025-1.622 12.154-1.642 4.129.02 8.281.56 12.162 1.642 9.275-6.307 13.345-5.002 13.345-5.002 2.68 6.7.98 11.64.48 12.87 3.103 3.41 4.99 7.76 4.99 13.09 0 18.78-11.415 22.87-22.267 24.08 1.75 1.51 3.31 4.48 3.31 9.03 0 6.52-.06 11.78-.06 13.39 0 1.31.25 2.66 2.71 2.16C84.007 89.39 98 70.974 98 49.217 98 22 76.135 0 48.854 0z"
    />
  </svg>
);

export const InstagramGlyphIcon: React.FC<IconProps> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
    <defs>
      <linearGradient id="instagram-brand-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#FEDA75" />
        <stop offset="25%" stopColor="#FA7E1E" />
        <stop offset="50%" stopColor="#D62976" />
        <stop offset="75%" stopColor="#962FBF" />
        <stop offset="100%" stopColor="#4F5BD5" />
      </linearGradient>
    </defs>
    <rect x="2" y="2" width="20" height="20" rx="5" fill="url(#instagram-brand-gradient)" />
    <circle cx="12" cy="12" r="4.25" fill="none" stroke="#fff" strokeWidth="1.75" />
    <circle cx="17.4" cy="6.6" r="1.15" fill="#fff" />
  </svg>
);
