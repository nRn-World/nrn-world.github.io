import React, { useEffect, useRef, useState } from 'react';
import './animated-download-button.css';

/** Matchar CSS: Open-texten visas efter 3.5s + 0.4s animation. */
const OPEN_READY_MS = 3900;

interface AnimatedDownloadButtonProps {
  idleLabel: string;
  doneLabel: string;
  title?: string;
  /** Mindre variant så knappen får plats på de täta projektkorten. */
  compact?: boolean;
  onActivate: () => void;
}

type ButtonPhase = 'idle' | 'animating' | 'ready';

export const AnimatedDownloadButton: React.FC<AnimatedDownloadButtonProps> = ({
  idleLabel,
  doneLabel,
  title,
  compact = false,
  onActivate,
}) => {
  const [checked, setChecked] = useState(false);
  const [phase, setPhase] = useState<ButtonPhase>('idle');
  const readyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (readyTimerRef.current) clearTimeout(readyTimerRef.current);
    };
  }, []);

  const stopCardNav = (event: React.SyntheticEvent) => {
    event.stopPropagation();
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (phase === 'idle') {
      setChecked(true);
      setPhase('animating');
      readyTimerRef.current = setTimeout(() => {
        setPhase('ready');
        readyTimerRef.current = null;
      }, OPEN_READY_MS);
      return;
    }

    // Håll knappen i checked-läge under animation och Open-läge.
    setChecked(true);

    if (phase === 'ready') {
      onActivate();
    }
  };

  const ariaLabel =
    phase === 'ready'
      ? title || doneLabel
      : phase === 'animating'
        ? idleLabel
        : title || idleLabel;

  return (
    <div
      className={`dl-container${compact ? ' dl-container--compact' : ''}`}
      onClick={stopCardNav}
      onMouseDown={stopCardNav}
    >
      <label
        className={`dl-label${phase === 'ready' ? ' dl-label--ready' : ''}`}
        title={phase === 'ready' ? (title || doneLabel) : title}
      >
        <input
          type="checkbox"
          className="dl-input"
          checked={checked}
          aria-label={ariaLabel}
          onChange={handleChange}
        />
        <span className="dl-circle">
          <svg
            className="dl-icon"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
              d="M12 19V5m0 14-4-4m4 4 4-4"
            />
          </svg>
          <div className="dl-square" />
        </span>
        <p className="dl-title">{idleLabel}</p>
        <p className="dl-title">{doneLabel}</p>
      </label>
    </div>
  );
};
