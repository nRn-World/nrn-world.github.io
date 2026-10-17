'use client';

import { Github, Globe } from 'lucide-react';
import { DitherOrbit } from '@/components/ui/dither-orbit';
import { Card } from '@/components/ui/card';
import { TypingEffect } from '@/components/ui/typing-effect';
import { GitHubActivityStatus } from '@/components/GitHubActivityStatus';
import type { ContributionDay } from '@/services/githubActivityService';

type SplineSceneBasicProps = {
  hubTitle: string;
  subtitle: string;
  downloadsLabel: string;
  totalDownloads: number | null;
  githubActivity: {
    login: string;
    days: ContributionDay[];
    totalContributions: number;
  } | null;
};

export function SplineSceneBasic({
  hubTitle,
  subtitle,
  downloadsLabel,
  totalDownloads,
  githubActivity,
}: SplineSceneBasicProps) {
  return (
    <Card className="w-full h-auto bg-black/[0.96] relative overflow-hidden border-0 shadow-none">
      <div className="flex flex-col-reverse relative z-10">
        {/* Text + widgets — krymper inte roboten på mobil */}
        <div className="shrink-0 md:flex-1 p-5 sm:p-6 md:p-8 mt-2 md:-mt-12 relative z-20 flex flex-col justify-center items-center">
          <div className="w-full max-w-md sm:max-w-2xl text-center">
            <h1 className="font-sora text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-tight text-white">
              n<span className="text-blue-500">R</span>nW
              <Globe className="w-[0.75em] h-[0.75em] text-blue-400 mx-[0.02em] inline-block align-[-0.1em] animate-[spin_20s_linear_infinite]" />
              rld{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400">
                {hubTitle.replace(/^nRnWorld\s*/, '')}
              </span>
            </h1>
            <TypingEffect
              texts={[subtitle]}
              typingSpeed={45}
              rotationInterval={2800}
              className="mt-3 sm:mt-4 w-full justify-center font-inter text-sm sm:text-base font-normal text-neutral-300 leading-relaxed"
            />

            {/* Kompakta GitHub-widgets — mindre mellanrum på mobil */}
            <div className="mt-4 flex flex-col sm:flex-row sm:items-stretch gap-2 w-full max-w-[26rem] sm:max-w-2xl mx-auto">
              <div className="flex items-center gap-2.5 bg-[#0e1626] px-2.5 py-2 rounded-xl border border-blue-500/30 text-blue-300 shadow-md shadow-blue-950/30 font-mono text-white/70 w-full sm:w-auto sm:shrink-0">
                <div className="w-7 h-7 rounded-lg bg-black border border-white/10 flex items-center justify-center shrink-0">
                  <Github className="w-3.5 h-3.5 text-white" />
                </div>
                <div className="flex flex-col items-start text-left min-w-0 flex-1">
                  <span className="text-xs text-blue-300/90 leading-tight whitespace-nowrap">
                    {downloadsLabel}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="relative flex h-1.5 w-1.5 shrink-0">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                    </span>
                    <span className="font-sora text-xl font-bold text-white tabular-nums leading-none">
                      {totalDownloads !== null ? totalDownloads.toLocaleString() : '…'}
                    </span>
                  </div>
                </div>
              </div>

              {githubActivity ? (
                <GitHubActivityStatus
                  compact
                  login={githubActivity.login}
                  days={githubActivity.days}
                  totalContributions={githubActivity.totalContributions}
                />
              ) : null}
            </div>
          </div>
        </div>

        {/* Porträtt + projekt i omloppsbana */}
        <div className="relative w-full shrink-0">
          <DitherOrbit className="relative w-full" />
        </div>
      </div>
    </Card>
  );
}
