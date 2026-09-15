'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface TypingEffectProps {
  texts?: string[];
  className?: string;
  rotationInterval?: number;
  typingSpeed?: number;
}

const DEMO = ['Design', 'Development', 'Marketing'];

export const TypingEffect = ({
  texts = DEMO,
  className,
  rotationInterval = 3000,
  typingSpeed = 150,
}: TypingEffectProps) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isInView, setIsInView] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const safeTexts = texts.length > 0 ? texts : DEMO;
  const currentText = safeTexts[currentTextIndex % safeTexts.length];

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') {
      setIsInView(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '40px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isInView) return;

    if (charIndex < currentText.length) {
      const typingTimeout = setTimeout(() => {
        setDisplayedText((prev) => prev + currentText.charAt(charIndex));
        setCharIndex((prev) => prev + 1);
      }, typingSpeed);
      return () => clearTimeout(typingTimeout);
    }

    const changeLabelTimeout = setTimeout(() => {
      setDisplayedText('');
      setCharIndex(0);
      setCurrentTextIndex((prev) => (prev + 1) % safeTexts.length);
    }, rotationInterval);
    return () => clearTimeout(changeLabelTimeout);
  }, [
    charIndex,
    currentText,
    isInView,
    typingSpeed,
    rotationInterval,
    safeTexts.length,
  ]);

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative inline-flex items-center justify-center text-center text-4xl font-bold',
        className
      )}
    >
      <span className="min-h-[1.25em]">{displayedText}</span>
      <span
        aria-hidden
        className="ml-1 h-[1em] w-0.5 shrink-0 rounded-sm bg-current animate-pulse"
      />
    </div>
  );
};

export default TypingEffect;
