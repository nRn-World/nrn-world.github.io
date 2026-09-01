import React, { useMemo } from 'react';
import { Github } from 'lucide-react';
import { useI18n } from '../i18n/context';
import type { ContributionDay } from '../services/githubActivityService';

const LEVEL_COLORS: Record<number, string> = {
  0: 'rgba(255,255,255,0.12)',
  1: '#0e4429',
  2: '#006d32',
  3: '#26a641',
  4: '#39d353',
};

const WEEKS_TO_SHOW = 22;

interface GitHubActivityStatusProps {
  login: string;
  days: ContributionDay[];
  totalContributions: number;
}

export const GitHubActivityStatus: React.FC<GitHubActivityStatusProps> = ({
  login,
  days,
  totalContributions,
}) => {
  const { t } = useI18n();

  const visibleDays = useMemo(() => {
    const sliceStart = Math.max(0, days.length - WEEKS_TO_SHOW * 7);
    return days.slice(sliceStart);
  }, [days]);

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
      className="group flex items-center gap-2.5 sm:gap-3 bg-[#0d1117] hover:bg-[#111820] border border-white/10 hover:border-white/20 rounded-xl px-3 py-2 transition-all shadow-lg shadow-black/30 w-full h-full min-h-[48px]"
      title={t('hub.githubActivityTitle', {
        count: totalContributions.toLocaleString(),
        login,
      })}
    >
      <div className="flex items-center gap-2.5 sm:gap-3 shrink-0 min-w-0">
        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-black border border-white/10 flex items-center justify-center shrink-0">
          <Github className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
        </div>
        <div className="min-w-0 text-left">
          <div className="font-sora text-sm font-bold text-white truncate group-hover:text-blue-400 transition-colors">
            {login}
          </div>
          <div className="font-mono text-[10px] sm:text-xs text-white/45">GitHub</div>
        </div>
      </div>

      <div
        className="ml-auto flex items-end gap-[3px] overflow-hidden"
        aria-label={t('hub.githubActivityTitle', {
          count: totalContributions.toLocaleString(),
          login,
        })}
      >
        {weekColumns.map((week, weekIndex) => (
          <div key={weekIndex} className="flex flex-col gap-[3px]">
            {week.map((day) => (
              <span
                key={day.date}
                className="w-[9px] h-[9px] sm:w-[10px] sm:h-[10px] rounded-[2px]"
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
