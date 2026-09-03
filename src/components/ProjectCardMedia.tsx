import React, { useCallback, useMemo, useState } from 'react';
import { Monitor } from 'lucide-react';
import {
  isBrandStyleImage,
  pickCardCoverImage,
  PROJECT_CARD_ASPECT,
} from '../utils/projectImage';

interface ProjectCardMediaProps {
  images: string[];
  projectName: string;
  isHovered: boolean;
  previewAlt: (index: number) => string;
  /** Above-the-fold cards: eager load + high fetch priority for LCP. */
  priority?: boolean;
}

export const ProjectCardMedia: React.FC<ProjectCardMediaProps> = ({
  images,
  projectName,
  isHovered,
  previewAlt,
  priority = false,
}) => {
  const [failedCover, setFailedCover] = useState(false);

  const coverSrc = useMemo(() => pickCardCoverImage(images), [images]);

  const handleError = useCallback(() => {
    setFailedCover(true);
  }, []);

  if (!coverSrc || failedCover) {
    return (
      <div
        className={`relative w-full ${PROJECT_CARD_ASPECT} overflow-hidden bg-gradient-to-br from-[#141a24] to-[#0a0e14] border-b border-white/5 flex items-center justify-center`}
      >
        <Monitor className="w-8 h-8 text-white/15" aria-hidden />
        <span className="sr-only">{projectName}</span>
      </div>
    );
  }

  const isBrand = isBrandStyleImage(coverSrc) || coverSrc.includes('opengraph.githubassets.com');

  return (
    <div
      className={`relative w-full ${PROJECT_CARD_ASPECT} overflow-hidden bg-[#0a0e14] border-b border-white/5`}
    >
      {/* Dekorativ CSS-glow som ersätter tunga dubblerade bilder */}
      <div
        aria-hidden="true"
        className="absolute inset-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(188,19,254,0.14),rgba(59,130,246,0.08)_55%,transparent_80%)] pointer-events-none"
      />

      <img
        src={coverSrc}
        alt={previewAlt(1)}
        width={280}
        height={187}
        referrerPolicy="no-referrer"
        onError={handleError}
        className={`absolute inset-0 w-full h-full transition-transform duration-700 ease-out ${
          isBrand
            ? `object-contain p-1.5 drop-shadow-lg ${isHovered ? 'scale-105' : ''}`
            : `object-cover object-center ${isHovered ? 'scale-[1.08]' : 'scale-100'}`
        }`}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
        decoding={priority ? 'sync' : 'async'}
      />

      <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-[#121212]/10 to-black/30 pointer-events-none" />
    </div>
  );
};
