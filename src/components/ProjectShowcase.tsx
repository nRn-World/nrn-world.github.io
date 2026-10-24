import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, Download, ExternalLink, Gamepad2, Globe, Monitor, Puzzle, Smartphone } from 'lucide-react';
import { Project, ProjectCategory } from '../types';
import { useI18n } from '../i18n/context';
import { getProjectPath } from '../utils/projectSlug';

// One horizontal rail of big cards per category (scroll-snap, arrows, counter + progress line).
const GROUPS: { key: ProjectCategory; icon: React.ReactNode; card: string; chip: string }[] = [
  { key: 'Chrome Extensions', icon: <Puzzle className="size-4" />, card: 'from-[#1e3a8a] to-[#1d4ed8]', chip: 'text-blue-300' },
  { key: 'Websites', icon: <Globe className="size-4" />, card: 'from-[#4c1d95] via-[#6b21a8] to-[#9d174d]', chip: 'text-fuchsia-300' },
  { key: 'Windows', icon: <Monitor className="size-4" />, card: 'from-[#0f3f4f] to-[#0e7490]', chip: 'text-cyan-300' },
  { key: 'Android', icon: <Smartphone className="size-4" />, card: 'from-[#14532d] to-[#15803d]', chip: 'text-emerald-300' },
  { key: 'Games', icon: <Gamepad2 className="size-4" />, card: 'from-[#7f1d1d] to-[#9f1239]', chip: 'text-rose-300' },
];

const isStoreUrl = (url?: string) => Boolean(url && /chromewebstore\.google\.com|chrome\.google\.com\/webstore|addons\.mozilla\.org/.test(url));

const pad2 = (n: number) => String(n).padStart(2, '0');

const AUTO_SPEED = 28;      // px per second: slow drift
const PAUSE_AFTER_USE = 4000; // ms before the drift resumes after the visitor touched the rail
const PAUSE_AT_END = 1500;

interface RailProps {
  group: (typeof GROUPS)[number];
  projects: Project[];
  onSelect: (project: Project) => void;
}

const Rail: React.FC<RailProps> = ({ group, projects, onSelect }) => {
  const { t, localizeCategory, dir } = useI18n();
  const railRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [grabbing, setGrabbing] = useState(false);
  const hover = useRef(false);
  const pauseUntil = useRef(0);
  const drag = useRef<{ x: number; left: number; moved: boolean; id: number } | null>(null);
  const suppressClick = useRef(false);

  const update = useCallback(() => {
    const rail = railRef.current;
    const first = rail?.firstElementChild as HTMLElement | null;
    if (!rail || !first) return;
    const step = first.getBoundingClientRect().width + 16;
    setIndex(Math.min(projects.length - 1, Math.max(0, Math.round(Math.abs(rail.scrollLeft) / step))));
  }, [projects.length]);

  useEffect(() => {
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [update]);

  // Slow automatic drift (ping-pong). Pauses on hover, drag, touch, focus and when off screen.
  useEffect(() => {
    const rail = railRef.current;
    if (!rail || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let raf = 0;
    let last = performance.now();
    let pos = rail.scrollLeft;
    let lastSet = pos;
    let dir = 1;
    let visible = true;
    const io = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; });
    io.observe(rail);

    const tick = (now: number) => {
      const dt = Math.min(64, now - last) / 1000;
      last = now;
      const active = visible && !document.hidden && !hover.current && !drag.current && now > pauseUntil.current;
      if (active) {
        if (rail.style.scrollSnapType !== 'none') rail.style.scrollSnapType = 'none';
        if (Math.abs(rail.scrollLeft - lastSet) > 1.5) pos = rail.scrollLeft; // visitor moved it
        const max = rail.scrollWidth - rail.clientWidth;
        pos += dir * AUTO_SPEED * dt;
        if (pos >= max) { pos = max; dir = -1; pauseUntil.current = now + PAUSE_AT_END; }
        else if (pos <= 0) { pos = 0; dir = 1; pauseUntil.current = now + PAUSE_AT_END; }
        rail.scrollLeft = pos;
        lastSet = pos;
      } else if (rail.style.scrollSnapType === 'none' && !drag.current) {
        rail.style.scrollSnapType = ''; // back to the stylesheet's snap, card settles into place
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); io.disconnect(); rail.style.scrollSnapType = ''; };
  }, []);

  const touched = () => { pauseUntil.current = performance.now() + PAUSE_AFTER_USE; };

  // Mouse drag (touch and pen use the browser's native swipe).
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    touched();
    const rail = railRef.current;
    if (!rail || e.pointerType !== 'mouse' || e.button !== 0) return;
    drag.current = { x: e.clientX, left: rail.scrollLeft, moved: false, id: e.pointerId };
    rail.style.scrollSnapType = 'none';
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    const rail = railRef.current;
    if (!d || !rail) return;
    const dx = e.clientX - d.x;
    if (!d.moved && Math.abs(dx) > 5) {
      d.moved = true;
      rail.setPointerCapture(d.id); // only once it is a real drag, so plain clicks still reach the buttons
      setGrabbing(true);
    }
    if (d.moved) rail.scrollLeft = d.left - dx;
  };
  const endDrag = () => {
    const d = drag.current;
    const rail = railRef.current;
    if (!d || !rail) return;
    drag.current = null;
    if (d.moved) {
      suppressClick.current = true;
      setTimeout(() => { suppressClick.current = false; }, 0);
      if (rail.hasPointerCapture(d.id)) rail.releasePointerCapture(d.id);
    }
    setGrabbing(false);
    touched();
    rail.style.scrollSnapType = ''; // snap to the nearest card
  };

  const go = (delta: number) => {
    touched();
    const rail = railRef.current;
    const first = rail?.firstElementChild as HTMLElement | null;
    if (!rail || !first) return;
    rail.scrollBy({ left: delta * (first.getBoundingClientRect().width + 16), behavior: 'smooth' });
  };

  const total = projects.length;
  return (
    <div className="min-w-0">
      <div className="mb-3 flex items-end justify-between gap-4 px-1">
        <div className="flex min-w-0 items-center gap-3">
          <span className={`flex size-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 ${group.chip}`}>
            {group.icon}
          </span>
          <h3 className="truncate font-sora text-xl font-bold text-white sm:text-2xl">{localizeCategory(group.key)}</h3>
        </div>
        <div className="flex shrink-0 items-center gap-3 font-mono text-xs text-white/60">
          <span>
            <span className="text-white">{pad2(index + 1)}</span> / {pad2(total)}
          </span>
          <span aria-hidden className="hidden h-px w-24 bg-white/15 sm:block">
            <span className="block h-px bg-white transition-all duration-300" style={{ width: `${((index + 1) / total) * 100}%` }} />
          </span>
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => go(-1)}
              disabled={index === 0}
              aria-label={t('showcase.prev')}
              className="flex size-8 items-center justify-center rounded-full border border-white/15 text-white/80 transition-colors hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer disabled:cursor-default"
            >
              <ChevronLeft className={`size-4 ${dir === 'rtl' ? 'rotate-180' : ''}`} />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              disabled={index >= total - 1}
              aria-label={t('showcase.next')}
              className="flex size-8 items-center justify-center rounded-full border border-white/15 text-white/80 transition-colors hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer disabled:cursor-default"
            >
              <ChevronRight className={`size-4 ${dir === 'rtl' ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      <div
        ref={railRef}
        onScroll={update}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onMouseEnter={() => { hover.current = true; }}
        onMouseLeave={() => { hover.current = false; pauseUntil.current = performance.now() + 800; }}
        onClickCapture={(e) => { if (suppressClick.current) { e.preventDefault(); e.stopPropagation(); } }}
        onDragStart={(e) => e.preventDefault()}
        onWheel={touched}
        onFocus={touched}
        tabIndex={0}
        role="region"
        aria-label={localizeCategory(group.key)}
        className={`flex snap-x snap-mandatory gap-4 overflow-x-auto pb-3 scrollbar-hide focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60 rounded-[28px] ${grabbing ? 'cursor-grabbing select-none' : 'cursor-grab'}`}
      >
        {projects.map((project, i) => {
          const tags = (project.tags ?? []).slice(0, 3);
          return (
            <article
              key={project.id}
              className={`relative grid min-h-[360px] w-[88vw] max-w-[760px] shrink-0 snap-start overflow-hidden rounded-[28px] bg-gradient-to-br p-5 text-white sm:p-7 md:min-h-[400px] md:w-[min(760px,72vw)] md:grid-cols-[1.5fr_1fr] md:grid-rows-[1fr_auto] md:gap-x-6 md:gap-y-0 lg:w-[92%] lg:max-w-none ${group.card}`}
            >
              <div className="order-1 flex min-w-0 flex-col [container-type:inline-size]">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 flex-wrap gap-1.5">
                    {tags.map((tag) => (
                      <span key={tag} className="rounded-full bg-white/15 px-2.5 py-1 text-[12px] leading-none text-white/95 backdrop-blur-sm">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <span className="shrink-0 font-mono text-xs text-white/50">{pad2(i + 1)}</span>
                </div>

                <h4
                  className="mt-5 whitespace-nowrap font-sora font-extrabold leading-tight"
                  // namnet ska alltid rymmas på en rad: storlek = kolumnbredd / (antal tecken * ~0.66em)
                  style={{ fontSize: `min(2.25rem, ${(100 / (project.name.length * 0.66)).toFixed(2)}cqw)` }}
                >
                  {project.name}
                </h4>
                <p className="mt-3 line-clamp-5 text-[15px] leading-relaxed text-white/90">{project.tagline}</p>
              </div>

              <div className="order-3 mt-5 flex min-h-[180px] items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/10 md:order-2 md:mt-0">
                {project.images[0] && (
                  <img
                    src={project.images[0]}
                    alt={project.name}
                    loading="lazy"
                    draggable={false}
                    className="h-auto max-h-[300px] w-full object-contain p-3 md:h-full"
                  />
                )}
              </div>
              <div className="order-2 flex flex-nowrap items-center gap-2 pt-5 md:order-3 md:col-span-2">
                {!project.isReference && <a
                  href={getProjectPath(project)}
                  onClick={(e) => {
                    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
                    e.preventDefault();
                    onSelect(project);
                  }}
                  className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-full bg-white px-4 py-2 text-[13px] font-semibold text-neutral-900 no-underline transition-transform hover:scale-[1.03] sm:px-5 sm:py-2.5 sm:text-sm"
                >
                  {t('showcase.view')}
                  <ArrowRight className="size-4" />
                </a>}
                {project.liveDemoUrl && (
                  <a
                    href={project.liveDemoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 ${project.isReference ? 'bg-white font-semibold text-neutral-900' : 'border border-white/30 font-medium text-white hover:bg-white/10'} py-2 text-[13px] transition-colorssm:px-4 sm:py-2.5 sm:text-sm`}
                  >
                    {isStoreUrl(project.liveDemoUrl) ? 'Chrome Web Store' : t('showcase.open')}
                    {isStoreUrl(project.liveDemoUrl) ? <Download className="size-3.5" /> : <ExternalLink className="size-3.5" />}
                  </a>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
};

export const ProjectShowcase: React.FC<{ projects: Project[]; onSelect: (project: Project) => void }> = ({ projects, onSelect }) => {
  const { t } = useI18n();
  const rails = GROUPS.map((group) => ({
    group,
    items: projects.filter((p) => p.category === group.key), // order comes from the page's sort choice
  })).filter((r) => r.items.length > 0);

  if (rails.length === 0) return null;
  return (
    <section aria-labelledby="showcase-title" className="mx-auto mb-10 mt-4 w-full max-w-6xl min-w-0 px-1 md:mt-8 lg:max-w-[1500px]">
      <h2 id="showcase-title" className="text-center font-sora text-3xl font-extrabold text-white sm:text-4xl">
        {t('showcase.title')}
      </h2>
      <p className="mb-8 mt-2 text-center text-white/60">{t('showcase.subtitle')}</p>
      <div className="grid grid-cols-1 gap-x-8 gap-y-10 md:gap-y-12 lg:grid-cols-2">
        {rails.map(({ group, items }) => (
          <Rail key={group.key} group={group} projects={items} onSelect={onSelect} />
        ))}
        {/* Odd number of categories: the empty cell next to the last one holds the animated logo (two-column layout only) */}
        {rails.length % 2 === 1 && (
          <div className="hidden items-center justify-center lg:flex">
            <img
              src="/images/nrn-world-loop.webp"
              alt="nRn World"
              width={334}
              height={246}
              loading="lazy"
              draggable={false}
              className="h-auto w-full max-w-[460px] rounded-3xl border border-white/10 shadow-2xl shadow-blue-900/30"
            />
          </div>
        )}
      </div>
    </section>
  );
};
