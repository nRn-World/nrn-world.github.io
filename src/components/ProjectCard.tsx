import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Terminal,
  Smartphone,
  Monitor,
  Wrench,
  Bookmark,
  ArrowUpRight,
  Star,
  Github,
  Gamepad2,
  Globe,
  ExternalLink,
  GitFork,
  Info,
} from 'lucide-react';
import { Project } from '../types';
import { useI18n } from '../i18n/context';
import { ProjectCardMedia } from './ProjectCardMedia';
import { isOnlineProjectType } from '../services/engagementService';
import { getProjectGalleryImages } from '../utils/projectImage';
import { getGithubContributeUrl } from '../utils/githubLinks';

interface ProjectCardProps {
  project: Project;
  githubSynced?: boolean;
  onSelect: (project: Project) => void;
  onOpenLive: (project: Project, e: React.MouseEvent) => void;
  isSaved: boolean;
  onToggleSave: (projectId: string, e: React.MouseEvent) => void;
  isStarred?: boolean;
  onToggleStar?: (project: Project, e: React.MouseEvent) => void;
}

const HOVER_INFO_DELAY_MS = 5000;

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  githubSynced = false,
  onSelect,
  onOpenLive,
  isSaved,
  onToggleSave,
  isStarred = false,
  onToggleStar,
}) => {
  const { t, localizeTag, localizeCategory } = useI18n();
  const [isHovered, setIsHovered] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [hoverInfoReady, setHoverInfoReady] = useState(false);
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showInfoOverlay = infoOpen || hoverInfoReady;

  useEffect(() => {
    return () => {
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    };
  }, []);

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    hoverTimerRef.current = setTimeout(() => {
      setHoverInfoReady(true);
    }, HOVER_INFO_DELAY_MS);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setHoverInfoReady(false);
    setInfoOpen(false);
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
  };

  const handleToggleInfo = (e: React.MouseEvent) => {
    e.stopPropagation();
    setInfoOpen((prev) => !prev);
  };

  const getBadgeIcon = (badge: Project['platformBadge']) => {
    switch (badge) {
      case 'WEB':
        return <Globe className="w-3 h-3 text-emerald-400" />;
      case 'WIN':
        return <Monitor className="w-3 h-3 text-blue-400" />;
      case 'APK':
        return <Smartphone className="w-3 h-3 text-emerald-400" />;
      case 'CLI':
        return <Terminal className="w-3 h-3 text-amber-400" />;
      case 'TOOL':
      default:
        return <Wrench className="w-3 h-3 text-purple-400" />;
    }
  };

  const handleOpenGithub = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(project.githubUrl, '_blank', 'noopener,noreferrer');
  };

  const handleOpenLiveDemo = (e: React.MouseEvent) => {
    onOpenLive(project, e);
  };

  const isOnline = isOnlineProjectType(project.projectType);
  const statLabelKey = isOnline ? 'projectCard.githubStars' : 'projectCard.githubDownloads';
  const statCount = isOnline ? (project.starsCount ?? 0) : project.downloadsCount;

  const tagSource =
    project.tags && project.tags.length > 0 ? project.tags : [localizeCategory(project.category)];

  const displayTags = tagSource.slice(0, 2);
  const hoverTags = tagSource.slice(0, 4);

  const hoverSpecs = project.specs.slice(0, 2);

  const hoverGalleryImages = useMemo(
    () => getProjectGalleryImages(project.images ?? []).slice(0, 6),
    [project.images]
  );

  return (
    <article
      onClick={() => onSelect(project)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="bg-[#121212] rounded-xl border border-white/5 hover:border-blue-500/50 transition-all duration-300 flex flex-col cursor-pointer group relative overflow-hidden shadow-md shadow-black/40 hover:shadow-blue-950/20"
      id={`project-card-${project.id}`}
    >
      <div className="relative">
        <ProjectCardMedia
          images={project.images ?? []}
          projectName={project.name}
          isHovered={isHovered}
          previewAlt={(index) => t('projectCard.previewAlt', { name: project.name, index })}
        />

        <div className="absolute top-1.5 right-1.5 flex items-center gap-1 z-30">
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (onToggleStar) onToggleStar(project, e);
            }}
            className={`p-1 rounded-md bg-black/75 backdrop-blur-md border transition-all flex items-center gap-1 font-mono text-[10px] cursor-pointer ${
              isStarred
                ? 'text-amber-400 border-amber-400/50 bg-amber-500/10'
                : 'border-white/10 text-white/70 hover:text-amber-300'
            }`}
            title={t('projectCard.starTitle')}
          >
            <Star className={`w-3 h-3 ${isStarred ? 'fill-amber-400 text-amber-400' : 'text-amber-400'}`} />
            <span className="hidden sm:inline">{(project.starsCount ?? 0).toLocaleString()}</span>
          </button>

          <button
            onClick={(e) => onToggleSave(project.id, e)}
            className={`p-1 rounded-md bg-black/75 backdrop-blur-md border border-white/10 hover:border-blue-500/50 transition-colors ${
              isSaved ? 'text-blue-400' : 'text-white/60 hover:text-white'
            }`}
            title={isSaved ? t('projectCard.removeSaved') : t('projectCard.saveProject')}
          >
            <Bookmark className={`w-3 h-3 ${isSaved ? 'fill-blue-400' : ''}`} />
          </button>

          <div
            className="bg-black/75 backdrop-blur-md p-1 rounded-md border border-white/10 text-white/90 flex items-center"
            title={project.platformBadge}
          >
            {getBadgeIcon(project.platformBadge)}
          </div>
        </div>
      </div>

      {/* Info overlay — after 5s hover or via info button */}
      <div
        className={`absolute inset-0 z-20 flex flex-col p-3 sm:p-3.5 bg-gradient-to-b from-[#0c1014]/30 via-[#0c1014]/96 to-[#0c1014] backdrop-blur-md border transition-all duration-300 ease-out pointer-events-none overflow-y-auto overscroll-contain ${
          showInfoOverlay
            ? 'opacity-100 border-blue-500/40'
            : 'opacity-0 border-blue-500/0 invisible hidden'
        }`}
        aria-hidden={!showInfoOverlay}
      >
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-sora text-sm font-bold text-white leading-tight line-clamp-2">
            {project.name}
          </h3>
          <span className="shrink-0 font-mono text-[9px] text-blue-300/90 bg-blue-500/10 border border-blue-500/25 px-1.5 py-0.5 rounded">
            {project.version}
          </span>
        </div>

        <p className="font-inter text-[11px] text-white/75 leading-relaxed line-clamp-2 mb-2">
          {project.tagline}
        </p>

        {hoverGalleryImages.length > 0 && (
          <div className="grid grid-cols-3 gap-1.5 mb-2">
            {hoverGalleryImages.map((src, idx) => (
              <div
                key={`${src}-${idx}`}
                className="aspect-[4/3] rounded-md overflow-hidden border border-white/15 bg-[#0a0e14] shadow-inner"
              >
                <img
                  src={src}
                  alt={t('projectCard.previewAlt', { name: project.name, index: idx + 1 })}
                  className="w-full h-full object-cover object-center"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
              </div>
            ))}
          </div>
        )}

        {project.description !== project.tagline && hoverGalleryImages.length === 0 && (
          <p className="font-inter text-[10px] text-white/50 leading-relaxed line-clamp-2 mb-2">
            {project.description}
          </p>
        )}

        <div className="flex flex-wrap gap-1 mb-2">
          {hoverTags.map((tag, idx) => (
            <span
              key={idx}
              className="bg-[#1f2648] text-[#6e8ffb] border border-[#2e3966] text-[9px] font-medium px-1.5 py-0.5 rounded-full"
            >
              {localizeTag(tag)}
            </span>
          ))}
          <span className="bg-white/5 text-white/55 border border-white/10 text-[9px] font-mono px-1.5 py-0.5 rounded-full">
            {localizeCategory(project.category)}
          </span>
        </div>

        {hoverSpecs.length > 0 && hoverGalleryImages.length < 4 && (
          <ul className="space-y-1 mb-2">
            {hoverSpecs.map((spec) => (
              <li
                key={spec.label}
                className="flex items-baseline justify-between gap-2 text-[9px] font-mono text-white/45"
              >
                <span className="text-white/35 shrink-0">{spec.label}</span>
                <span className="text-white/65 text-right truncate">{spec.value}</span>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-auto pt-2 border-t border-white/10 flex items-center justify-between gap-2">
          <span className="text-[9px] font-mono text-emerald-400/90 truncate">
            {githubSynced ? t(statLabelKey, { count: statCount.toLocaleString() }) : '…'}
          </span>
          <span className="text-[9px] font-mono text-blue-400/80 shrink-0">
            {t('projectCard.hoverHint')}
          </span>
        </div>
      </div>

      <div className="p-2.5 sm:p-3 flex flex-col flex-grow min-h-0">
        <div className="flex items-start justify-between gap-1 mb-1">
          <h3 className="font-sora text-xs sm:text-sm font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-1 leading-tight">
            {project.name}
          </h3>
          <ArrowUpRight className="w-3.5 h-3.5 text-white/40 group-hover:text-blue-400 shrink-0" />
        </div>

        <p className="font-inter text-[10px] sm:text-[11px] text-white/45 line-clamp-1 mb-2 leading-snug">
          {project.description}
        </p>

        <div className="flex items-center justify-between gap-1 mb-2 min-h-[22px] relative z-30">
          <div className="flex flex-wrap items-center gap-1 min-w-0">
            {displayTags.map((tag, idx) => (
              <span
                key={idx}
                className="bg-[#1f2648] text-[#6e8ffb] border border-[#2e3966] text-[9px] sm:text-[10px] font-medium px-1.5 py-0.5 rounded-full truncate max-w-[72px]"
              >
                {localizeTag(tag)}
              </span>
            ))}
          </div>
          <div className="flex items-center shrink-0 rounded-lg border border-[#29345e] bg-[#141a2e] p-0.5 shadow-sm shadow-black/20">
            <button
              type="button"
              onClick={handleToggleInfo}
              className={`p-1.5 rounded-md transition-all cursor-pointer ${
                infoOpen
                  ? 'bg-blue-600/25 text-blue-300'
                  : 'text-white/55 hover:text-blue-300 hover:bg-white/5'
              }`}
              title={infoOpen ? t('projectCard.hideInfo') : t('projectCard.showInfo')}
              aria-label={infoOpen ? t('projectCard.hideInfo') : t('projectCard.showInfo')}
              aria-pressed={infoOpen}
            >
              <Info className="w-3 h-3" />
            </button>
            <span className="w-px h-3.5 bg-[#29345e] shrink-0" aria-hidden />
            <button
              type="button"
              onClick={handleOpenGithub}
              className="p-1.5 rounded-md text-[#8ea4df] hover:text-white hover:bg-white/5 transition-all cursor-pointer"
              title={t('projectCard.githubOpen', { name: project.name })}
              aria-label={t('projectCard.githubOpen', { name: project.name })}
            >
              <Github className="w-3 h-3" />
            </button>
            <span className="w-px h-3.5 bg-[#29345e] shrink-0" aria-hidden />
            <a
              href={getGithubContributeUrl(project.githubUrl)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="p-1.5 rounded-md text-emerald-400/90 hover:text-emerald-300 hover:bg-emerald-500/10 transition-all cursor-pointer"
              title={t('projectCard.contributeTitle', { name: project.name })}
              aria-label={t('projectCard.contributeGithub')}
            >
              <GitFork className="w-3 h-3" />
            </a>
          </div>
        </div>

        <div className="flex items-center text-[9px] sm:text-[10px] font-mono text-white/50 mb-1.5 px-0.5">
          <span className="w-1 h-1 rounded-full bg-emerald-400 shrink-0 mr-1" />
          <span className="truncate text-blue-300/80">
            {githubSynced ? t(statLabelKey, { count: statCount.toLocaleString() }) : '…'}
          </span>
        </div>

        <div className="mt-auto pt-1.5 border-t border-white/5 -mx-2.5 sm:-mx-3 px-2 sm:px-2.5 pb-2 sm:pb-2.5">
          {project.projectType === 'web_game' ? (
            <button
              onClick={handleOpenLiveDemo}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-2 py-1.5 rounded-md text-[10px] sm:text-[11px] font-mono font-bold flex items-center justify-center gap-1 w-full transition-all active:scale-95 cursor-pointer"
              title={t('projectCard.playOnlineTitle', { name: project.name })}
            >
              <Gamepad2 className="w-3 h-3 shrink-0" />
              <span className="truncate">{t('projectCard.playOnline')}</span>
            </button>
          ) : project.projectType === 'web_app' ? (
            <button
              onClick={handleOpenLiveDemo}
              className="bg-blue-600 hover:bg-blue-500 text-white px-2 py-1.5 rounded-md text-[10px] sm:text-[11px] font-mono font-bold flex items-center justify-center gap-1 w-full transition-all active:scale-95 cursor-pointer"
              title={t('projectCard.openWebAppTitle', { name: project.name })}
            >
              <Globe className="w-3 h-3 shrink-0" />
              <span className="truncate">{t('projectCard.openWebApp')}</span>
            </button>
          ) : project.projectType === 'browser_extension' ? (
            <button
              onClick={handleOpenLiveDemo}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-2 py-1.5 rounded-md text-[10px] sm:text-[11px] font-mono font-bold flex items-center justify-center gap-1 w-full transition-all active:scale-95 cursor-pointer"
              title={t('projectCard.chromeStoreTitle')}
            >
              <ExternalLink className="w-3 h-3 shrink-0" />
              <span className="truncate">{t('projectCard.chromeStore')}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSelect(project);
              }}
              className="bg-[#1a203b] hover:bg-[#242c52] text-white border border-[#29345e] px-2 py-1.5 rounded-md text-[10px] sm:text-[11px] font-mono font-bold flex items-center justify-center gap-1 w-full transition-all active:scale-95 cursor-pointer"
            >
              <ArrowUpRight className="w-3 h-3 shrink-0" />
              <span className="truncate">{t('projectCard.viewDetails')}</span>
            </button>
          )}
        </div>
      </div>
    </article>
  );
};
