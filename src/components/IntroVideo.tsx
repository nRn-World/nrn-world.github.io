import React, { useRef, useState } from 'react';
import { Volume2 } from 'lucide-react';

// Welcome video above the project showcase. Small file (1.5 MB), preloaded so play starts at once.
// First hover starts it; after that the visitor controls it with the normal player controls.
export const IntroVideo: React.FC = () => {
  const ref = useRef<HTMLVideoElement>(null);
  const autoStarted = useRef(false);
  const [silent, setSilent] = useState(false);

  const startOnHover = () => {
    const video = ref.current;
    if (!video || autoStarted.current) return;
    autoStarted.current = true;
    // Browsers only allow sound after the visitor has clicked something on the page. Until then
    // hover plays muted, and the "sound" button (a real click) restarts it from the top with audio.
    video.play().catch(() => {
      video.muted = true;
      video.play().catch(() => {});
    });
  };

  const soundOn = () => {
    const video = ref.current;
    if (!video) return;
    video.muted = false;
    video.currentTime = 0;
    video.play().catch(() => {});
  };

  return (
    <section aria-label="Welcome video" className="relative mx-auto mt-4 w-full max-w-[560px] px-1 md:mt-8">
      <video
        ref={ref}
        onMouseEnter={startOnHover}
        onEnded={(e) => e.currentTarget.load()}
        onVolumeChange={(e) => setSilent(e.currentTarget.muted)}
        className="aspect-square w-full rounded-3xl border border-white/10 bg-black shadow-xl shadow-black/50"
        src="/media/intro-3.mp4"
        poster="/media/intro-3-poster.jpg"
        controls
        playsInline
        preload="auto"
        width={1080}
        height={1080}
      />
      {silent && (
        <button
          type="button"
          onClick={soundOn}
          className="absolute right-4 top-4 flex cursor-pointer items-center gap-2 rounded-full bg-black/70 px-4 py-2 text-sm font-semibold text-white backdrop-blur transition hover:bg-black/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
        >
          <Volume2 className="size-4" aria-hidden="true" />
          Sound on
        </button>
      )}
    </section>
  );
};
