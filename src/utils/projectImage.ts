/** True for logos, icons and SVG assets that should use contain-fit instead of cover-crop. */
export function isBrandStyleImage(url: string): boolean {
  const path = decodeURIComponent(url);
  const file = path.split('/').pop() ?? '';
  return (
    /\/(logo|icon|maskable|favicon|app-icon)/i.test(path) ||
    /^logo/i.test(file) ||
    /-logo\.(png|jpg|jpeg|svg|webp)$/i.test(file) ||
    /\.svg(\?|$)/i.test(path)
  );
}

/** Pick the single cover image for project cards – always the first entry (project logo). */
export function pickCardCoverImage(images: string[]): string | undefined {
  return images[0];
}

/** Screenshots for the detail page – excludes logo/icon/cover used on the hub grid. */
export function getProjectGalleryImages(images: string[]): string[] {
  const cover = pickCardCoverImage(images);
  return images.filter((img) => {
    if (img === cover) return false;
    if (img.includes('opengraph.githubassets.com')) return false;
    if (isBrandStyleImage(img)) return false;
    return true;
  });
}

/** Hub grid thumbnail — slightly wider than tall to keep cards compact. */
export const PROJECT_CARD_ASPECT = 'aspect-[3/2]' as const;
