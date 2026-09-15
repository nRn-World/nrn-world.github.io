'use client';

import { lazy, Suspense, useEffect, useState, type ComponentType } from 'react';

const SPLINE_SCENE =
  'https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode';

type SplineProps = {
  scene: string;
  className?: string;
};

const Spline = lazy(() =>
  import('@splinetool/react-spline').then((m) => ({
    default: m.default as ComponentType<SplineProps>,
  }))
);

function shouldSkipSpline(): boolean {
  if (typeof window === 'undefined') return true;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return true;
  const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  if (conn?.saveData) return true;
  return false;
}

interface SplineSceneProps {
  scene?: string;
  className?: string;
}

/** Lazy Spline on all viewports — no eager HTML preload. */
export function SplineScene({ scene = SPLINE_SCENE, className }: SplineSceneProps) {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (shouldSkipSpline()) return;

    let cancelled = false;
    const enable = () => {
      if (!cancelled) setEnabled(true);
    };

    // Start quickly so the robot appears in mobile preview / first paint window
    if (typeof window.requestIdleCallback === 'function') {
      const id = window.requestIdleCallback(enable, { timeout: 400 });
      return () => {
        cancelled = true;
        window.cancelIdleCallback(id);
      };
    }

    const t = window.setTimeout(enable, 50);
    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
  }, []);

  if (!enabled) {
    return <div className={className} aria-hidden="true" />;
  }

  return (
    <Suspense fallback={<div className={className} aria-hidden="true" />}>
      <Spline scene={scene} className={className} />
    </Suspense>
  );
}

export { SPLINE_SCENE };
