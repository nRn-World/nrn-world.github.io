import React, { useState } from 'react';
import { ArrowUpRight, CalendarDays, ChevronDown, Mic, Newspaper, Play, Youtube } from 'lucide-react';
import podcastEpisode from '../data/podcastEpisode.json';
import skeppatInterview from '../data/skeppatInterview.json';
import { useI18n } from '../i18n/context';

const { videoId, startSeconds, channelUrl, thumbnail } = podcastEpisode;
const WATCH_URL = `https://www.youtube.com/watch?v=${videoId}&t=${startSeconds}s`;
const PLAY_URL = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`;
const PRELOAD_URL = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=0&rel=0&modestbranding=1`;
const TOPIC_KEYS = ['topic1', 'topic2', 'topic3', 'topic4', 'topic5'] as const;
const INTERVIEW_NUMBERS = [1, 2, 3, 4, 5, 6] as const;

/**
 * Press block: the podcast episode and the Skeppat interview, quoted here and expandable to the
 * full Q&A in the visitor's language.
 *
 * The YouTube player is not mounted until the pointer or keyboard focus reaches the poster, and
 * then only as a silent, invisible player so it is warm when needed. Our own high-resolution
 * poster stays on screen until the visitor presses the round play button — YouTube's paused
 * player only shows a low-resolution frame, so it is never used as the still image. Playback
 * itself always requires that click. youtube-nocookie is allowed in frame-src by the CSP in
 * vercel.json.
 */
export const PressSection: React.FC = () => {
  const { t } = useI18n();
  const [playing, setPlaying] = useState(false);
  const [preloaded, setPreloaded] = useState(false);
  const [interviewOpen, setInterviewOpen] = useState(false);

  return (
    <section
      aria-labelledby="press-title"
      className="mx-auto mb-2 mt-12 w-full max-w-6xl min-w-0 px-1 lg:max-w-[1500px]"
    >
      <div className="mb-5 flex flex-col gap-2 px-1 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
        <div className="min-w-0">
          <p className="mb-2 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em] text-blue-400">
            <Mic className="size-3.5 shrink-0" aria-hidden />
            {t('press.eyebrow')}
          </p>
          <h2 id="press-title" className="font-sora text-3xl font-extrabold text-white sm:text-4xl">
            {t('press.title')}
          </h2>
        </div>
        <p className="max-w-md text-sm leading-relaxed text-white/60 sm:text-right">
          {t('press.subtitle')}
        </p>
      </div>

      <div className="grid min-w-0 overflow-hidden rounded-[28px] border border-white/10 bg-[#0D0D0D]/95 shadow-2xl shadow-black/60 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        {/* Player: crisp poster until the play button is pressed. On lg the column fills the row
            height so a taller details column cannot leave a black gap underneath. */}
        <div className="relative aspect-video min-w-0 overflow-hidden bg-black lg:aspect-auto lg:h-full lg:min-h-[380px]">
          {playing ? (
            <iframe
              src={PLAY_URL}
              title={t('podcast.episodeTitle')}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
              className="absolute inset-0 size-full border-0"
            />
          ) : (
            <>
              {/* Silent, invisible player, warmed up while the pointer is on the poster. */}
              {preloaded && (
                <iframe
                  src={PRELOAD_URL}
                  title=""
                  aria-hidden
                  tabIndex={-1}
                  allow="clipboard-write; encrypted-media; picture-in-picture"
                  referrerPolicy="strict-origin-when-cross-origin"
                  className="pointer-events-none absolute inset-0 size-full border-0 opacity-0"
                />
              )}
              <div
                onPointerEnter={() => setPreloaded(true)}
                onFocus={() => setPreloaded(true)}
                className="absolute inset-0 bg-gradient-to-br from-[#1b1b1b] via-[#111111] to-black"
              >
                <img
                  src={thumbnail}
                  alt=""
                  width={1280}
                  height={720}
                  fetchPriority="low"
                  decoding="async"
                  className="absolute inset-0 size-full object-cover"
                />
                <span
                  aria-hidden
                  className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/45"
                />
                <span
                  aria-hidden
                  className="absolute left-3 top-3 flex items-center gap-2 rounded-full bg-black/70 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur sm:left-4 sm:top-4"
                >
                  <Youtube className="size-3.5 text-red-500" />
                  {t('podcast.show')}
                </span>
                <span
                  aria-hidden
                  className="absolute bottom-3 right-3 rounded-md bg-black/80 px-2 py-1 font-mono text-[11px] text-white/90 sm:bottom-4 sm:right-4"
                >
                  {t('podcast.length')}
                </span>
                <span
                  aria-hidden
                  className="absolute bottom-3 left-3 font-mono text-[11px] uppercase tracking-[0.18em] text-white/75 sm:bottom-4 sm:left-4"
                >
                  {t('podcast.playHint')}
                </span>
                <button
                  type="button"
                  onClick={() => setPlaying(true)}
                  onPointerEnter={() => setPreloaded(true)}
                  onFocus={() => setPreloaded(true)}
                  aria-label={t('podcast.playLabel')}
                  className="absolute left-1/2 top-1/2 flex size-16 -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/10 ring-1 ring-white/30 backdrop-blur-md transition duration-300 hover:scale-105 hover:bg-blue-600 hover:ring-blue-400 sm:size-20"
                >
                  <Play className="size-7 translate-x-[2px] fill-white text-white sm:size-8" aria-hidden />
                </button>
              </div>
            </>
          )}
        </div>

        {/* Episode details */}
        <div className="flex min-w-0 flex-col gap-4 p-5 sm:p-6 md:p-7">
          <div className="flex flex-wrap items-center gap-2 font-mono text-[11px] text-white/60">
            <span className="flex items-center gap-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 px-2.5 py-1 font-semibold text-blue-300">
              <Mic className="size-3" aria-hidden />
              {t('podcast.show')}
            </span>
            <span className="flex items-center gap-1.5">
              <CalendarDays className="size-3.5" aria-hidden />
              {t('podcast.published')}
            </span>
          </div>

          <h3 className="font-sora text-xl font-bold leading-snug text-white sm:text-2xl">
            {t('podcast.episodeTitle')}
          </h3>

          <p className="text-sm leading-relaxed text-white/65">{t('podcast.description')}</p>

          <div>
            <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.18em] text-white/40">
              {t('podcast.topicsTitle')}
            </p>
            <ul className="grid gap-2 text-[13px] leading-relaxed text-white/70">
              {TOPIC_KEYS.map((key) => (
                <li key={key} className="flex items-start gap-2">
                  <span aria-hidden className="mt-[7px] size-1.5 shrink-0 rounded-full bg-blue-500" />
                  <span>{t(`podcast.${key}`)}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-auto flex flex-wrap items-center gap-2 pt-2">
            <a
              href={WATCH_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white no-underline transition-colors hover:bg-blue-500"
            >
              <Youtube className="size-4" aria-hidden />
              {t('podcast.watch')}
            </a>
            <a
              href={channelUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2.5 text-sm font-medium text-white/85 no-underline transition-colors hover:bg-white/10 hover:text-white"
            >
              {t('podcast.channel')}
              <ArrowUpRight className="size-4" aria-hidden />
            </a>
          </div>
        </div>
      </div>

      {/* Skeppat interview: quote first, the full Q&A expands in place */}
      <article className="mt-4 rounded-[28px] border border-white/10 bg-[#0D0D0D]/95 p-5 shadow-2xl shadow-black/60 sm:p-6">
        <div className="flex flex-wrap items-center gap-2 font-mono text-[11px] text-white/60">
          <a
            href={skeppatInterview.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-2.5 py-1 font-semibold text-white/85 no-underline transition-colors hover:border-blue-500/40 hover:text-white"
          >
            <Newspaper className="size-3" aria-hidden />
            {skeppatInterview.outlet}
          </a>
          <span className="flex items-center gap-1.5">
            <CalendarDays className="size-3.5" aria-hidden />
            {t('press.skeppat.published')}
          </span>
          <span className="text-white/45">{skeppatInterview.label}</span>
        </div>

        <blockquote className="mt-3 border-l-2 border-blue-500/60 pl-4 font-sora text-lg font-semibold leading-snug text-white sm:text-xl">
          ”{t('press.interview.quote')}”
        </blockquote>

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
          <button
            type="button"
            onClick={() => setInterviewOpen((open) => !open)}
            aria-expanded={interviewOpen}
            aria-controls="skeppat-interview"
            className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-500"
          >
            {interviewOpen ? t('press.skeppat.collapse') : t('press.skeppat.expand')}
            <ChevronDown
              className={`size-4 transition-transform ${interviewOpen ? 'rotate-180' : ''}`}
              aria-hidden
            />
          </button>
          <a
            href={skeppatInterview.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-white/70 no-underline transition-colors hover:text-white"
          >
            {t('press.skeppat.readOriginal')}
            <ArrowUpRight className="size-4" aria-hidden />
          </a>
        </div>

        {interviewOpen && (
          <div id="skeppat-interview" className="mt-5 border-t border-white/10 pt-5">
            <p className="text-sm leading-relaxed text-white/60">{t('press.interview.intro')}</p>
            <dl className="mt-5 grid gap-5">
              {INTERVIEW_NUMBERS.map((n) => (
                <div key={n}>
                  <dt className="font-sora text-sm font-bold leading-snug text-white sm:text-base">
                    {t(`press.interview.q${n}`)}
                  </dt>
                  <dd className="mt-1.5 text-sm leading-relaxed text-white/70">
                    {t(`press.interview.a${n}`)}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        )}
      </article>
    </section>
  );
};
