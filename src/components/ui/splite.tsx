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

function canLoadSpline(): boolean {
  if (typeof window === 'undefined') return false;
  if (window.matchMedia('(max-width: 767px)').matches) return false;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  if (conn?.saveData) return false;
  return true;
}

interface SplineSceneProps {
  scene?: string;
  className?: string;
}

/** Desktop-only, idle-deferred Spline — never on the mobile critical path. */
export function SplineScene({ scene = SPLINE_SCENE, className }: SplineSceneProps) {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (!canLoadSpline()) return;

    let cancelled = false;
    const enable = () => {
      if (!cancelled) setEnabled(true);
    };

    if (typeof window.requestIdleCallback === 'function') {
      const id = window.requestIdleCallback(enable, { timeout: 2000 });
      return () => {
        cancelled = true;
        window.cancelIdleCallback(id);
      };
    }

    const t = window.setTimeout(enable, 800);
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
