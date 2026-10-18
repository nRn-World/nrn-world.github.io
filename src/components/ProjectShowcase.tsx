import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowRight, Bot, ChevronLeft, ChevronRight, ExternalLink, Gamepad2, Monitor, Puzzle, Smartphone, Wrench } from 'lucide-react';
import { Project, ProjectCategory } from '../types';
import { useI18n } from '../i18n/context';

// One horizontal rail of big cards per category (scroll-snap, arrows, counter + progress line).
const GROUPS: { key: ProjectCategory; icon: React.ReactNode; card: string; chip: string }[] = [
  { key: 'Chrome Extensions', icon: <Puzzle className="size-4" />, card: 'from-[#1e3a8a] to-[#1d4ed8]', chip: 'text-blue-300' },
  { key: 'AI', icon: <Bot className="size-4" />, card: 'from-[#4c1d95] via-[#6b21a8] to-[#9d174d]', chip: 'text-fuchsia-300' },
  { key: 'Windows', icon: <Monitor className="size-4" />, card: 'from-[#0f3f4f] to-[#0e7490]', chip: 'text-cyan-300' },
  { key: 'Tools', icon: <Wrench className="size-4" />, card: 'from-[#78350f] to-[#b45309]', chip: 'text-amber-300' },
  { key: 'Android', icon: <Smartphone className="size-4" />, card: 'from-[#14532d] to-[#15803d]', chip: 'text-emerald-300' },
  { key: 'Games', icon: <Gamepad2 className="size-4" />, card: 'from-[#7f1d1d] to-[#9f1239]', chip: 'text-rose-300' },
];

const pad2 = (n: number) => String(n).padStart(2, '0');

interface RailProps {
  group: (typeof GROUPS)[number];
  projects: Project[];
  onSelect: (project: Project) => void;
}

const Rail: React.FC<RailProps> = ({ group, projects, onSelect }) => {
  const { t, localizeCategory, dir } = useI18n();
  const railRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

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

  const go = (delta: number) => {
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
        tabIndex={0}
        role="region"
        aria-label={localizeCategory(group.key)}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-3 scrollbar-hide focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60 rounded-[28px]"
      >
        {projects.map((project, i) => {
          const tags = (project.tags ?? []).slice(0, 3);
          return (
            <article
              key={project.id}
              className={`relative grid min-h-[360px] w-[88vw] max-w-[760px] shrink-0 snap-start overflow-hidden rounded-[28px] bg-gradient-to-br p-5 text-white sm:p-7 md:min-h-[400px] md:w-[min(760px,72vw)] md:grid-cols-[1.2fr_1fr] md:gap-6 lg:w-[92%] lg:max-w-none ${group.card}`}
            >
              <div className="flex min-w-0 flex-col">
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

                <h4 className="mt-5 break-words font-sora text-[clamp(1.5rem,2.6vw,2.25rem)] font-extrabold leading-tight lg:text-[clamp(1.3rem,1.9vw,2rem)]">{project.name}</h4>
                <p className="mt-3 line-clamp-5 text-[15px] leading-relaxed text-white/90">{project.tagline}</p>

                <div className="mt-auto flex flex-wrap items-center gap-2.5 pt-6">
                  <button
                    type="button"
                    onClick={() => onSelect(project)}
                    className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-neutral-900 transition-transform hover:scale-[1.03]"
                  >
                    {t('showcase.view')}
                    <ArrowRight className="size-4" />
                  </button>
                  {project.liveDemoUrl && (
                    <a
                      href={project.liveDemoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-full border border-white/30 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/10"
                    >
                      {t('showcase.open')}
                      <ExternalLink className="size-3.5" />
                    </a>
                  )}
                </div>
              </div>

              <div className="mt-5 flex min-h-[180px] items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/10 md:mt-0">
                {project.images[0] && (
                  <img
                    src={project.images[0]}
                    alt={project.name}
                    loading="lazy"
                    className="h-auto max-h-[300px] w-full object-contain p-3 md:h-full"
                  />
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
    items: projects
      .filter((p) => p.category === group.key)
      .sort((a, b) => Number(!!b.featured) - Number(!!a.featured) || b.downloadsCount - a.downloadsCount),
  })).filter((r) => r.items.length > 0);

  if (rails.length === 0) return null;
  return (
    <section aria-labelledby="showcase-title" className="mx-auto mb-10 mt-4 w-full max-w-6xl min-w-0 px-1 md:mt-8 lg:max-w-[1500px]">
      <h2 id="showcase-title" className="font-sora text-3xl font-extrabold text-white sm:text-4xl">
        {t('showcase.title')}
      </h2>
      <p className="mb-8 mt-2 text-white/60">{t('showcase.subtitle')}</p>
      <div className="grid grid-cols-1 gap-x-8 gap-y-10 md:gap-y-12 lg:grid-cols-2">
        {rails.map(({ group, items }) => (
          <Rail key={group.key} group={group} projects={items} onSelect={onSelect} />
        ))}
      </div>
    </section>
  );
};
