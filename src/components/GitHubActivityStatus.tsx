import React, { useEffect, useMemo, useState } from 'react';
import { Github } from 'lucide-react';
import { useI18n } from '../i18n/context';
import type { ContributionDay } from '../services/githubActivityService';
import { cn } from '@/lib/utils';

const LEVEL_COLORS: Record<number, string> = {
  0: 'rgba(255,255,255,0.12)',
  1: '#0e4429',
  2: '#006d32',
  3: '#26a641',
  4: '#39d353',
};

const MAX_WEEKS = 22;

function getWeeksToShow(width: number, compact: boolean): number {
  if (compact) {
    if (width < 400) return 8;
    if (width < 520) return 10;
    return 14;
  }
  if (width < 380) return 8;
  if (width < 480) return 12;
  if (width < 640) return 16;
  return MAX_WEEKS;
}

interface GitHubActivityStatusProps {
  login: string;
  days: ContributionDay[];
  totalContributions: number;
  compact?: boolean;
  className?: string;
}

export const GitHubActivityStatus: React.FC<GitHubActivityStatusProps> = ({
  login,
  days,
  totalContributions,
  compact = false,
  className,
}) => {
  const { t } = useI18n();
  const [weeksToShow, setWeeksToShow] = useState(() =>
    typeof window !== 'undefined' ? getWeeksToShow(window.innerWidth, compact) : compact ? 8 : 12
  );

  useEffect(() => {
    const update = () => setWeeksToShow(getWeeksToShow(window.innerWidth, compact));
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [compact]);

  const visibleDays = useMemo(() => {
    const sliceStart = Math.max(0, days.length - weeksToShow * 7);
    return days.slice(sliceStart);
  }, [days, weeksToShow]);

  const weekColumns = useMemo(() => {
    const columns: ContributionDay[][] = [];
    for (let i = 0; i < visibleDays.length; i += 7) {
      columns.push(visibleDays.slice(i, i + 7));
    }
    return columns;
  }, [visibleDays]);

  return (
    <a
      href={`https://github.com/${login}`}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'group flex items-center gap-1.5 bg-[#0d1117] hover:bg-[#111820] border border-white/10 hover:border-white/20 rounded-lg transition-all shadow-md shadow-black/30 w-full max-w-full min-w-0 overflow-hidden',
        compact ? 'gap-2 rounded-xl px-2.5 py-2' : 'gap-2 sm:gap-2.5 rounded-xl px-2.5 sm:px-3 py-2 shadow-lg min-h-[48px] h-full',
        className
      )}
      title={t('hub.githubActivityTitle', {
        count: totalContributions.toLocaleString(),
        login,
      })}
    >
      <div className={cn('flex items-center min-w-0 shrink', compact ? 'gap-2' : 'gap-2 sm:gap-2.5')}>
        <div
          className={cn(
            'rounded-md bg-black border border-white/10 flex items-center justify-center shrink-0',
            compact ? 'w-7 h-7 rounded-lg' : 'w-8 h-8 sm:w-9 sm:h-9 rounded-lg'
          )}
        >
          <Github className={cn('text-white', compact ? 'w-3.5 h-3.5' : 'w-4 h-4 sm:w-5 sm:h-5')} />
        </div>
        <div className="min-w-0 text-left">
          <div
            className={cn(
              'font-sora font-bold text-white truncate group-hover:text-blue-400 transition-colors',
              compact ? 'text-xs leading-tight' : 'text-sm'
            )}
          >
            {login}
          </div>
          <div className={cn('font-mono text-white/45', compact ? 'text-[10px]' : 'text-[10px] sm:text-xs')}>
            GitHub
          </div>
        </div>
      </div>

      <div
        className={cn('ml-auto flex items-end overflow-hidden shrink-0', compact ? 'gap-[2px]' : 'gap-[2px] sm:gap-[3px]')}
        aria-label={t('hub.githubActivityTitle', {
          count: totalContributions.toLocaleString(),
          login,
        })}
      >
        {weekColumns.map((week, weekIndex) => (
          <div key={weekIndex} className={cn('flex flex-col', compact ? 'gap-[2px]' : 'gap-[2px] sm:gap-[3px]')}>
            {week.map((day) => (
              <span
                key={day.date}
                className={cn(
                  'rounded-[2px]',
                  compact ? 'w-[6px] h-[6px]' : 'w-[7px] h-[7px] sm:w-[9px] sm:h-[9px] md:w-[10px] md:h-[10px]'
                )}
                style={{ backgroundColor: LEVEL_COLORS[day.level] ?? LEVEL_COLORS[0] }}
                title={t('hub.githubActivityDay', {
                  count: day.count,
                  date: day.date,
                })}
              />
            ))}
          </div>
        ))}
      </div>
    </a>
  );
};
