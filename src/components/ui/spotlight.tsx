'use client';

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { motion, useSpring, useTransform, type SpringOptions } from 'framer-motion';
import { cn } from '@/lib/utils';

type SpotlightProps = {
  className?: string;
  size?: number;
  springOptions?: SpringOptions;
  fill?: string;
};

/**
 * Mjuk vit rund glow som följer musen (som i Spline/Aceternity-demon).
 * Ser ut som en soft ring/orb — inte en stor vit blob.
 */
export function Spotlight({
  className,
  size = 240,
  springOptions = { bounce: 0, stiffness: 280, damping: 32 },
  fill = '#ffffff',
}: SpotlightProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [parentElement, setParentElement] = useState<HTMLElement | null>(null);

  const mouseX = useSpring(0, springOptions);
  const mouseY = useSpring(0, springOptions);

  const spotlightLeft = useTransform(mouseX, (x) => `${x - size / 2}px`);
  const spotlightTop = useTransform(mouseY, (y) => `${y - size / 2}px`);

  useEffect(() => {
    if (!containerRef.current) return;
    const parent = containerRef.current.parentElement;
    if (!parent) return;
    parent.style.position = 'relative';
    parent.style.overflow = 'hidden';
    setParentElement(parent);
  }, []);

  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      if (!parentElement) return;
      const { left, top } = parentElement.getBoundingClientRect();
      mouseX.set(event.clientX - left);
      mouseY.set(event.clientY - top);
      setIsHovered(true);
    },
    [mouseX, mouseY, parentElement]
  );

  const handleMouseEnter = useCallback(() => setIsHovered(true), []);
  const handleMouseLeave = useCallback(() => setIsHovered(false), []);

  useEffect(() => {
    if (!parentElement) return;

    parentElement.addEventListener('mousemove', handleMouseMove);
    parentElement.addEventListener('mouseenter', handleMouseEnter);
    parentElement.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      parentElement.removeEventListener('mousemove', handleMouseMove);
      parentElement.removeEventListener('mouseenter', handleMouseEnter);
      parentElement.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [parentElement, handleMouseMove, handleMouseEnter, handleMouseLeave]);

  return (
    <motion.div
      ref={containerRef}
      aria-hidden
      className={cn(
        'pointer-events-none absolute z-20 rounded-full transition-opacity duration-200',
        isHovered ? 'opacity-100' : 'opacity-0',
        className
      )}
      style={{
        width: size,
        height: size,
        left: spotlightLeft,
        top: spotlightTop,
        // Soft white orb / “ring” — ljus kärna, mjuk ytterkant
        background: `
          radial-gradient(circle at center,
            ${fill} 0%,
            rgba(255,255,255,0.55) 18%,
            rgba(255,255,255,0.18) 42%,
            rgba(255,255,255,0.05) 62%,
            transparent 78%
          )
        `,
        filter: 'blur(18px)',
        mixBlendMode: 'screen',
      }}
    />
  );
}
