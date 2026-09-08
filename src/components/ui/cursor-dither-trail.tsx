'use client';

import React, { useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface CursorDitherTrailProps {
  /** Primär färg (HEX). */
  trailColor?: string;
  /** Sekundär färg (HEX) — blandas med trailColor för vit+blå effekt. */
  secondaryColor?: string;
  dotSize?: number;
  fadeDuration?: number;
  className?: string;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const int = parseInt(hex.replace('#', ''), 16);
  return {
    r: (int >> 16) & 255,
    g: (int >> 8) & 255,
    b: int & 255,
  };
}

/**
 * Fluid dither-svans som följer musen.
 * Vit + blå som standard.
 */
export function CursorDitherTrail({
  trailColor = '#FFFFFF',
  secondaryColor = '#3B82F6',
  dotSize = 4,
  fadeDuration = 800,
  className = 'w-full h-full',
}: CursorDitherTrailProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (typeof window !== 'undefined') {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      if (window.matchMedia('(hover: none)').matches) return;
    }

    let width = canvas.clientWidth || window.innerWidth;
    let height = canvas.clientHeight || window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const onResize = () => {
      width = canvas.clientWidth || window.innerWidth;
      height = canvas.clientHeight || window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };
    window.addEventListener('resize', onResize);

    const primary = hexToRgb(trailColor);
    const secondary = hexToRgb(secondaryColor);
    // 2×2 Bayer-matris för dither-känsla
    const bayer = [0, 2, 3, 1];

    const paintDot = (x: number, y: number) => {
      const bx = (x / dotSize) & 1;
      const by = (y / dotSize) & 1;
      const threshold = bayer[by * 2 + bx] / 4;
      // Växla vit/blå utifrån dither + lätt slump
      const useSecondary = Math.random() * 0.55 + threshold * 0.45 > 0.48;
      const c = useSecondary ? secondary : primary;
      ctx.fillStyle = `rgba(${c.r},${c.g},${c.b},1)`;
      ctx.fillRect(x, y, dotSize, dotSize);
    };

    let rafId = 0;
    let lastTime = performance.now();
    let alive = true;

    const fadeStep = (now: number) => {
      if (!alive) return;
      const delta = now - lastTime;
      lastTime = now;
      const fadeAlpha = Math.min(delta / fadeDuration, 0.35);
      ctx.fillStyle = `rgba(0,0,0,${fadeAlpha})`;
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillRect(0, 0, width, height);
      ctx.globalCompositeOperation = 'source-over';
      rafId = requestAnimationFrame(fadeStep);
    };
    rafId = requestAnimationFrame(fadeStep);

    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = Math.floor((e.clientX - rect.left) / dotSize) * dotSize;
      const y = Math.floor((e.clientY - rect.top) / dotSize) * dotSize;
      // Lite tjockare svans: måla runt pekaren
      paintDot(x, y);
      paintDot(x + dotSize, y);
      paintDot(x, y + dotSize);
      paintDot(x - dotSize, y);
    };
    window.addEventListener('mousemove', onMove, { passive: true });

    return () => {
      alive = false;
      cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('resize', onResize);
    };
  }, [trailColor, secondaryColor, dotSize, fadeDuration]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={cn('pointer-events-none fixed inset-0 z-[90]', className)}
    />
  );
}

export default CursorDitherTrail;
