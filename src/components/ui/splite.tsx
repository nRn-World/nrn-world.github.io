'use client';

import Spline from '@splinetool/react-spline';

const SPLINE_SCENE =
  'https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode';

// Börja hämta scenen direkt när modulen laddas (före första paint)
if (typeof window !== 'undefined') {
  void fetch(SPLINE_SCENE, { mode: 'cors', credentials: 'omit' }).catch(() => {});
}

interface SplineSceneProps {
  scene?: string;
  className?: string;
}

export function SplineScene({ scene = SPLINE_SCENE, className }: SplineSceneProps) {
  return <Spline scene={scene} className={className} />;
}

export { SPLINE_SCENE };
