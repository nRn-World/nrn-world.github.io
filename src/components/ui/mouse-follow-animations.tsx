'use client';

import { motion, useMotionValue, useSpring } from 'framer-motion';
import React, { useEffect } from 'react';
import { cn } from '@/lib/utils';

const SPRING = {
  mass: 0.1,
  damping: 10,
  stiffness: 131,
};

const SimpleMouseFollow = () => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const opacity = useMotionValue(0);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const bounds = e.currentTarget.getBoundingClientRect();
    x.set(e.clientX - bounds.left);
    y.set(e.clientY - bounds.top);
  };

  return (
    <div
      onPointerMove={handlePointerMove}
      onPointerEnter={() => opacity.set(1)}
      onPointerLeave={() => opacity.set(0)}
      className="rounded-4xl bg-background mt-20 size-[500px] cursor-none overflow-hidden"
    >
      <motion.div
        style={{ x, y, opacity }}
        className="rounded-4xl size-5 bg-[#ccc]"
      />
    </div>
  );
};

type SpringMouseFollowProps = {
  className?: string;
  /** Default vit (promten hade orange). */
  colorClassName?: string;
  sizeClassName?: string;
  children?: React.ReactNode;
};

const SpringMouseFollow = ({
  className,
  colorClassName = 'bg-white',
  sizeClassName = 'size-10',
  children,
}: SpringMouseFollowProps) => {
  const xSpring = useSpring(0, SPRING);
  const ySpring = useSpring(0, SPRING);
  const opacitySpring = useSpring(0, SPRING);
  const scaleSpring = useSpring(0, SPRING);

  return (
    <div
      onPointerMove={(e) => {
        const bounds = e.currentTarget.getBoundingClientRect();
        xSpring.set(e.clientX - bounds.left);
        ySpring.set(e.clientY - bounds.top);
      }}
      onPointerEnter={() => {
        opacitySpring.set(1);
        scaleSpring.set(1);
      }}
      onPointerLeave={() => {
        opacitySpring.set(0);
        scaleSpring.set(0);
      }}
      className={cn('relative overflow-hidden', className)}
    >
      <motion.div
        aria-hidden
        style={{
          x: xSpring,
          y: ySpring,
          opacity: opacitySpring,
          scale: scaleSpring,
        }}
        className={cn('pointer-events-none absolute left-0 top-0 z-30 rounded-full', sizeClassName, colorClassName)}
      />
      {children}
    </div>
  );
};

type GlobalSpringMouseFollowProps = {
  colorClassName?: string;
  sizeClassName?: string;
};

/**
 * Samma spring-musföljare som i promten, men över hela viewporten.
 * Vit istället för orange.
 */
const GlobalSpringMouseFollow = ({
  colorClassName = 'bg-white',
  sizeClassName = 'size-10',
}: GlobalSpringMouseFollowProps) => {
  const xSpring = useSpring(0, SPRING);
  const ySpring = useSpring(0, SPRING);
  const opacitySpring = useSpring(0, SPRING);
  const scaleSpring = useSpring(0, SPRING);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (window.matchMedia('(hover: none)').matches) return;

    const onMove = (e: PointerEvent) => {
      xSpring.set(e.clientX);
      ySpring.set(e.clientY);
      opacitySpring.set(1);
      scaleSpring.set(1);
    };

    const onLeave = () => {
      opacitySpring.set(0);
      scaleSpring.set(0);
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    document.documentElement.addEventListener('mouseleave', onLeave);

    return () => {
      window.removeEventListener('pointermove', onMove);
      document.documentElement.removeEventListener('mouseleave', onLeave);
    };
  }, [xSpring, ySpring, opacitySpring, scaleSpring]);

  return (
    <motion.div
      aria-hidden
      style={{
        x: xSpring,
        y: ySpring,
        opacity: opacitySpring,
        scale: scaleSpring,
      }}
      className={cn(
        'pointer-events-none fixed left-0 top-0 z-[90] -ml-5 -mt-5 rounded-full shadow-[0_0_18px_rgba(255,255,255,0.4)]',
        sizeClassName,
        colorClassName
      )}
    />
  );
};

const Skiper61 = () => {
  return (
    <section className="h-screen w-full snap-y snap-mandatory overflow-y-scroll">
      <div className="flex h-screen w-full snap-start flex-col items-center justify-center px-5">
        <div className="grid content-start justify-items-center gap-6 text-center">
          <span className="after:to-foreground relative max-w-[12ch] text-xs uppercase leading-tight opacity-40 after:absolute after:left-1/2 after:top-full after:h-16 after:w-px after:bg-gradient-to-b after:from-transparent after:content-['']">
            Mouse follow simple
          </span>
        </div>
        <SimpleMouseFollow />
      </div>
      <div className="flex h-screen w-full snap-start flex-col items-center justify-center px-5">
        <div className="grid content-start justify-items-center gap-6 text-center">
          <span className="after:to-foreground relative max-w-[12ch] text-xs uppercase leading-tight opacity-40 after:absolute after:left-1/2 after:top-full after:h-16 after:w-px after:bg-gradient-to-b after:from-transparent after:content-['']">
            Mouse follow with Spring
          </span>
        </div>
        <SpringMouseFollow className="rounded-4xl bg-background mt-20 size-[500px]" />
      </div>
    </section>
  );
};

export { SimpleMouseFollow, Skiper61, SpringMouseFollow, GlobalSpringMouseFollow };
