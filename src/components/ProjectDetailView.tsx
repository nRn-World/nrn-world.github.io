import React, { useState, useEffect, useMemo } from 'react';
import {
  ArrowLeft,
  Share2,
  Bookmark,
  Download,
  Terminal,
  Laptop,
  Smartphone,
  FolderArchive,
  Info,
  Cpu,
  History,
  Check,
  Copy,
  ExternalLink,
  Maximize2,
  ShieldCheck,
  Layers,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  HardDrive,
  Star,
  Gamepad2,
  Globe,
  GitFork,
} from 'lucide-react';
import { Project, DownloadOption } from '../types';
import { useI18n } from '../i18n/context';
import { isOnlineProjectType } from '../services/engagementService';
import { getProjectGalleryImages } from '../utils/projectImage';
import { getGithubContributeUrl } from '../utils/githubLinks';

interface ProjectDetailViewProps {
  project: Project;
  onBack: () => void;
  onDownload: (project: Project, option: DownloadOption) => void;
  githubSynced?: boolean;
  isSaved: boolean;
  onToggleSave: (projectId: string) => void;
  onOpenDocs: () => void;
  isStarred?: boolean;
  onToggleStar?: (project: Project) => void;
}

export const ProjectDetailView: React.FC<ProjectDetailViewProps> = ({
  project,
  onBack,
  onDownload,
  githubSynced = false,
  isSaved,
  onToggleSave,
  onOpenDocs,
  isStarred = false,
  onToggleStar,
}) => {
  const { t, localizeTag, localizeCategory } = useI18n();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [copiedClone, setCopiedClone] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);
  const [copiedMd5, setCopiedMd5] = useState<string | null>(null);
  const headingRef = React.useRef<HTMLHeadingElement>(null);

  const galleryImages = useMemo(
    () => getProjectGalleryImages(project.images ?? []),
    [project.images]
  );

  useEffect(() => {
    headingRef.current?.focus();
  }, [project.id]);

  useEffect(() => {
    setSelectedImageIndex(0);
    setLightboxOpen(false);
  }, [project.id]);

  useEffect(() => {
    if (selectedImageIndex >= galleryImages.length) {
      setSelectedImageIndex(0);
    }
  }, [galleryImages.length, selectedImageIndex]);

  useEffect(() => {
    if (!lightboxOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxOpen(false);
      if (galleryImages.length <= 1) return;
      if (e.key === 'ArrowLeft') {
        setSelectedImageIndex((prev) => (prev === 0 ? galleryImages.length - 1 : prev - 1));
      }
      if (e.key === 'ArrowRight') {
        setSelectedImageIndex((prev) => (prev === galleryImages.length - 1 ? 0 : prev + 1));
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [lightboxOpen, galleryImages.length]);
  const isWebGame = project.projectType === 'web_game';
  const isWebApp = project.projectType === 'web_app';
  const isBrowserExtension = project.projectType === 'browser_extension';
  const hasLiveUrl = Boolean(project.liveDemoUrl);
  const isOnline = isOnlineProjectType(project.projectType);
  const hasDownloads = project.downloadOptions.length > 0;
  const showLiveAction = hasLiveUrl && (isWebGame || isWebApp || isBrowserExtension);

  const goToPrevImage = () => {
    setSelectedImageIndex((prev) => (prev === 0 ? galleryImages.length - 1 : prev - 1));
  };

  const goToNextImage = () => {
    setSelectedImageIndex((prev) => (prev === galleryImages.length - 1 ? 0 : prev + 1));
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    }
  };

  const handleCopyClone = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`git clone ${project.githubUrl}.git`);
      setCopiedClone(true);
      setTimeout(() => setCopiedClone(false), 2000);
    }
  };

  const handleCopyMd5 = (md5: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(md5);
      setCopiedMd5(md5);
      setTimeout(() => setCopiedMd5(null), 2000);
    }
  };

  const getPlatformIcon = (platform: DownloadOption['platform'], fileType: DownloadOption['fileType']) => {
    if (fileType === 'apk' || platform === 'Android') {
      return <Smartphone className="w-5 h-5 text-blue-400" />;
    }
    if (fileType === 'zip') {
      return <FolderArchive className="w-5 h-5 text-white/70" />;
    }
    if (platform === 'Linux' || fileType === 'tar.gz' || fileType === 'AppImage') {
      return <Terminal className="w-5 h-5 text-blue-400" />;
    }
    return <Laptop className="w-5 h-5 text-white" />;
  };

  return (
    <div className="pt-8 pb-24 px-4 md:px-8 max-w-[1440px] mx-auto w-full animate-in fade-in duration-300">
      {/* Back Navigation Bar */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-white/70 hover:text-blue-400 font-mono text-sm transition-colors py-2 px-3 rounded-lg hover:bg-white/5 group cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>{t('detail.back')}</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onToggleStar && onToggleStar(project)}
            className={`border px-4 py-2 rounded-lg flex items-center gap-2 transition-all text-xs font-mono cursor-pointer ${
              isStarred
                ? 'bg-amber-500/15 border-amber-400/50 text-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.2)] font-bold'
                : 'bg-white/5 border-white/10 text-white hover:text-amber-300 hover:border-amber-400/40'
            }`}
            title={t('detail.starTitle')}
          >
            <Star className={`w-4 h-4 ${isStarred ? 'fill-amber-400 text-amber-400' : 'text-amber-400'}`} />
            <span>{(project.starsCount ?? 0).toLocaleString()} {isStarred ? t('detail.starred') : t('detail.starAction')}</span>
          </button>

          <button
            onClick={handleShare}
            className="bg-white/5 border border-white/10 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-white/10 transition-colors text-xs font-mono cursor-pointer"
            title={t('detail.shareTitle')}
          >
            {copiedShare ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span>{t('detail.copiedLink')}</span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4 text-white/70" />
                <span>{t('detail.share')}</span>
              </>
            )}
          </button>

          <button
            onClick={() => onToggleSave(project.id)}
            className={`bg-white/5 border border-white/10 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-white/10 transition-colors text-xs font-mono cursor-pointer ${
              isSaved ? 'text-blue-400 border-blue-500/40 bg-blue-600/10' : 'text-white'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-blue-400' : ''}`} />
            <span>{isSaved ? t('detail.saved') : t('detail.save')}</span>
          </button>
        </div>
      </div>

      {/* Header Area */}
      <header className="mb-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              {/* Category / Platform Pills */}
              {(project.tags?.length ? project.tags : [localizeCategory(project.category)]).map(
                (tag, idx) => (
                  <span
                    key={idx}
                    className="bg-[#181d33] text-[#7193f5] border border-[#2b3560] font-sans text-xs font-semibold px-3 py-1 rounded-full"
                  >
                    {localizeTag(tag)}
                  </span>
                )
              )}

              {/* Direct GitHub Link Button */}
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 px-3 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 text-white/80 hover:text-white font-mono text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                title={t('detail.githubTitle')}
              >
                <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
                <span>{t('detail.githubRepo')}</span>
              </a>

              <a
                href={getGithubContributeUrl(project.githubUrl)}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 px-3 rounded-full bg-emerald-500/10 hover:bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 hover:text-emerald-200 font-mono text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                title={t('detail.contributeTitle', { name: project.name })}
              >
                <GitFork className="w-3.5 h-3.5" />
                <span>{t('detail.contributeGithub')}</span>
              </a>
            </div>

            <h1
              ref={headingRef}
              tabIndex={-1}
              className="font-sora text-3xl md:text-5xl font-black text-white tracking-tight focus:outline-none"
            >
              {project.name}
            </h1>

            <p className="text-white/60 font-inter text-base md:text-lg mt-4 max-w-3xl leading-relaxed">
              {project.tagline || project.description}
            </p>
          </div>
        </div>
      </header>

      {/* Two Column Layout: Main (8 cols) & Sidebar (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Column (Left) */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          {/* Gallery Section – screenshots only (logo is hub-only) */}
          {galleryImages.length > 0 && (
          <section className="flex flex-col gap-4">
            <div className="w-full h-[min(70vh,520px)] min-h-[280px] rounded-2xl overflow-hidden relative group bg-[#0a0a0a] border border-white/5">
              <button
                type="button"
                onClick={() => setLightboxOpen(true)}
                className="absolute inset-0 z-0 flex items-center justify-center p-3 sm:p-6 cursor-zoom-in focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60"
                aria-label={t('detail.expand')}
              >
                <img
                  src={galleryImages[selectedImageIndex]}
                  alt={t('detail.screenshotAlt', { name: project.name })}
                  referrerPolicy="no-referrer"
                  draggable={false}
                  onError={(e) => {
                    const target = e.currentTarget;
                    const fallback = galleryImages[0];
                    if (fallback && target.src !== fallback) {
                      target.src = fallback;
                    }
                  }}
                  className="max-w-full max-h-full w-auto h-auto object-contain select-none"
                />
              </button>

              <div className="absolute bottom-4 right-4 z-10 pointer-events-none bg-black/75 backdrop-blur-md px-3 py-1.5 rounded-lg font-mono text-xs text-white border border-white/10 flex items-center gap-2 shadow-lg">
                <Maximize2 className="w-3.5 h-3.5 text-blue-400" />
                <span>{t('detail.expand')}</span>
              </div>

              {galleryImages.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      goToPrevImage();
                    }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white hover:bg-blue-600 transition-colors cursor-pointer"
                    aria-label={t('detail.prevImage')}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      goToNextImage();
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white hover:bg-blue-600 transition-colors cursor-pointer"
                    aria-label={t('detail.nextImage')}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            {galleryImages.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
                {galleryImages.map((img, idx) => (
                  <button
                    key={img}
                    type="button"
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`h-20 w-28 shrink-0 rounded-xl overflow-hidden transition-all relative cursor-pointer bg-[#0a0a0a] flex items-center justify-center p-1 ${
                      selectedImageIndex === idx
                        ? 'border-2 border-blue-500 shadow-md shadow-blue-900/30'
                        : 'border border-white/5 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={img}
                      alt={t('detail.thumbnailAlt', { index: idx + 1 })}
                      referrerPolicy="no-referrer"
                      draggable={false}
                      onError={(e) => {
                        const target = e.currentTarget;
                        const fallback = galleryImages[0];
                        if (fallback && target.src !== fallback) {
                          target.src = fallback;
                        }
                      }}
                      className="max-w-full max-h-full object-contain"
                    />
                  </button>
                ))}
              </div>
            )}
          </section>
          )}

          {/* About Section */}
          <section className="bg-[#121212] rounded-2xl p-6 md:p-8 border border-white/5">
            <h2 className="font-sora text-xl font-bold mb-6 flex items-center gap-3 border-b border-white/5 pb-4 text-white">
              <Info className="w-5 h-5 text-blue-400" />
              <span>{t('detail.about')}</span>
            </h2>
            <div className="space-y-4 text-white/70 font-inter text-sm md:text-base leading-relaxed whitespace-pre-line">
              {project.detailedAbout || project.description}
            </div>
          </section>

          {/* Technical Specifications Grid */}
          <section className="bg-[#121212] rounded-2xl p-6 md:p-8 border border-white/5">
            <h2 className="font-sora text-xl font-bold mb-6 flex items-center gap-3 border-b border-white/5 pb-4 text-white">
              <Cpu className="w-5 h-5 text-blue-400" />
              <span>{t('detail.specs')}</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {project.specs && project.specs.length > 0 ? (
                project.specs.map((spec, idx) => (
                  <div
                    key={idx}
                    className="bg-[#161616] p-4 rounded-xl flex items-start gap-4 border border-white/5 hover:border-white/10 transition-colors"
                  >
                    <div className="p-2 rounded-lg bg-blue-600/10 text-blue-400 mt-0.5">
                      <Layers className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-mono text-[11px] text-white/40 mb-1 uppercase tracking-wider">
                        {spec.label}
                      </div>
                      <div className="font-inter text-sm md:text-base font-semibold text-white">
                        {spec.value}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-white/50 text-sm">{t('detail.specsEmpty')}</div>
              )}
            </div>
          </section>

          {/* Change Log Section */}
          <section className="bg-[#121212] rounded-2xl p-6 md:p-8 border border-white/5">
            <h2 className="font-sora text-xl font-bold mb-6 flex items-center gap-3 border-b border-white/5 pb-4 text-white">
              <History className="w-5 h-5 text-blue-400" />
              <span>{t('detail.changelog')}</span>
            </h2>

            <div className="relative pl-6 border-l border-white/10 space-y-8">
              {project.changelog && project.changelog.length > 0 ? (
                project.changelog.map((log, idx) => (
                  <div key={idx} className="relative">
                    {/* Glowing pulse dot for current version */}
                    <div
                      className={`absolute w-3 h-3 rounded-full -left-[30px] top-1.5 ${
                        log.isCurrent
                          ? 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]'
                          : 'bg-[#1F1F1F] border border-white/20'
                      }`}
                    />

                    <div className="flex items-baseline gap-4 mb-2">
                      <span className="font-mono text-xs text-white/40">
                        {log.date}
                      </span>
                    </div>

                    <ul className="space-y-2 font-inter text-sm text-white/70">
                      {log.items.map((item, itemIdx) => (
                        <li key={itemIdx} className="flex items-start gap-2">
                          <span className="text-blue-400 mt-0.5">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))
              ) : (
                <div className="text-sm text-white/50">{t('detail.changelogEmpty')}</div>
              )}
            </div>
          </section>
        </div>

        {/* Sidebar (Right 4 cols) */}
        <div className="lg:col-span-4">
          <div className="sticky top-24 flex flex-col gap-6">
            {/* Action Center Widget */}
            <div className="bg-[#121212] rounded-2xl p-6 flex flex-col gap-6 border border-white/5 shadow-2xl shadow-black/80">
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <div>
                  <h3 className="font-sora text-lg font-bold text-white">
                    {showLiveAction
                      ? isWebGame
                        ? t('detail.playOnline')
                        : isBrowserExtension
                          ? t('detail.installExtension')
                          : t('detail.openWebApp')
                      : t('detail.downloadCenter')}
                  </h3>
                  <p className="text-xs text-white/50 font-mono mt-0.5">
                    {showLiveAction
                      ? t('detail.liveLinkHint')
                      : t('detail.downloadHint')}
                  </p>
                </div>
                <div className={`p-2.5 rounded-xl ${showLiveAction ? 'bg-emerald-600/15 text-emerald-400' : 'bg-blue-600/15 text-blue-400'}`}>
                  {showLiveAction ? (
                    isWebGame ? <Gamepad2 className="w-5 h-5" /> : <Globe className="w-5 h-5" />
                  ) : (
                    <Download className="w-5 h-5" />
                  )}
                </div>
              </div>

              {showLiveAction && (
                <div className="flex flex-col gap-3">
                  <a
                    href={project.liveDemoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-full text-white px-4 py-3 rounded-xl text-sm font-mono font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg cursor-pointer no-underline ${
                      isWebGame
                        ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-950/40'
                        : isBrowserExtension
                          ? 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-950/40'
                          : 'bg-blue-600 hover:bg-blue-500 shadow-blue-950/40'
                    }`}
                  >
                    {isWebGame ? (
                      <>
                        <Gamepad2 className="w-4 h-4" />
                        <span>{t('detail.playOnlineBtn')}</span>
                      </>
                    ) : isBrowserExtension ? (
                      <>
                        <ExternalLink className="w-4 h-4" />
                        <span>{t('detail.chromeStoreBtn')}</span>
                      </>
                    ) : (
                      <>
                        <Globe className="w-4 h-4" />
                        <span>{t('detail.openWebAppBtn')}</span>
                      </>
                    )}
                  </a>

                  <a
                    href={project.liveDemoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-[#181818] rounded-xl p-3 border border-white/5 hover:border-emerald-500/40 transition-all text-xs font-mono text-white/70 hover:text-emerald-300 flex items-center gap-2 break-all"
                  >
                    <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                    <span>{project.liveDemoUrl}</span>
                  </a>
                </div>
              )}

              {/* Download Packages List */}
              {hasDownloads && (
              <div className="flex flex-col gap-3">
                {project.downloadOptions.map((opt) => (
                  <div
                    key={opt.id}
                    className="bg-[#181818] rounded-xl p-4 border border-white/5 hover:border-blue-500/50 transition-all group"
                  >
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-3">
                        {getPlatformIcon(opt.platform, opt.fileType)}
                        <div>
                          <div className="font-inter text-sm font-semibold text-white flex items-center gap-1.5">
                            <span>{opt.label}</span>
                            {opt.isPrimary && (
                              <span className="text-[9px] font-mono bg-blue-600/20 text-blue-400 px-1.5 py-0.5 rounded font-bold uppercase">
                                {t('detail.recommended')}
                              </span>
                            )}
                          </div>
                          <div className="font-mono text-[11px] text-white/50 truncate max-w-[180px]">
                            {opt.filename}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => onDownload(project, opt)}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold hover:shadow-lg hover:shadow-blue-900/40 transition-all active:scale-95 flex items-center gap-1.5 shrink-0 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>{t('detail.get')}</span>
                      </button>
                    </div>

                    <div className="flex justify-between items-center font-mono text-xs text-white/40 pt-2 border-t border-white/5">
                      <div className="flex items-center gap-3">
                        <span>{opt.size}</span>
                        {githubSynced && typeof opt.downloadCount === 'number' && (
                          <span className="text-blue-300/80">
                            {t('detail.fileDownloadCount', {
                              count: opt.downloadCount.toLocaleString(),
                            })}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => handleCopyMd5(opt.md5Checksum)}
                        className="truncate ml-3 opacity-60 hover:opacity-100 hover:text-blue-400 transition-all flex items-center gap-1 max-w-[180px] cursor-pointer"
                        title={t('detail.md5Title')}
                      >
                        <span>{copiedMd5 === opt.md5Checksum ? t('detail.md5Copied') : t('detail.md5Prefix', { hash: opt.md5Checksum.substring(0, 10) })}</span>
                        <Copy className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  </div>
                ))}

                {/* Förtroendefaktorer och säkerhetsinformation (Avsnitt 8.5) */}
                <div className="rounded-xl border border-blue-500/20 bg-blue-950/20 p-3.5 flex flex-col gap-2 font-mono text-xs">
                  <div className="flex items-center gap-1.5 text-blue-400 font-bold">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Officiella och verifierade releaser</span>
                  </div>
                  <p className="font-inter text-[11px] text-white/70 leading-relaxed">
                    Byggs och signeras direkt via GitHub Actions från repots källkod under @nRn-World.
                  </p>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-1.5 border-t border-white/5 text-[10px] text-white/60">
                    <a
                      href={`https://www.virustotal.com/gui/search/${encodeURIComponent(project.name)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 hover:underline cursor-pointer"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Sök på VirusTotal</span>
                    </a>
                    <span>•</span>
                    <span className="text-white/60">
                      Windows SmartScreen: Klicka <strong className="text-white">"Mer information"</strong> → <strong className="text-white">"Kör ändå"</strong>
                    </span>
                  </div>
                </div>
              </div>
              )}

              {!showLiveAction && !hasDownloads && (
                <div className="text-sm text-white/50 font-inter">
                  {t('detail.noDownloads')}
                </div>
              )}

              {/* Extra Documentation & GitHub actions */}
              <div className="pt-4 border-t border-white/5 flex flex-col gap-3 font-mono text-xs">
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.06] p-3.5 flex flex-col gap-2.5">
                  <p className="font-inter text-[11px] sm:text-xs text-white/65 leading-relaxed text-center sm:text-left">
                    {t('detail.contributeInvite')}
                  </p>
                  <a
                    href={getGithubContributeUrl(project.githubUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full p-2.5 rounded-lg flex items-center justify-center gap-2 transition-all font-mono text-xs font-bold border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/15 text-emerald-300 cursor-pointer"
                    title={t('detail.contributeTitle', { name: project.name })}
                  >
                    <GitFork className="w-4 h-4" />
                    <span>{t('detail.contributeGithub')}</span>
                  </a>
                </div>

                <button
                  onClick={() => onToggleStar && onToggleStar(project)}
                  className={`w-full p-2.5 rounded-lg flex items-center justify-center gap-2 transition-all font-mono text-xs font-bold border cursor-pointer ${
                    isStarred
                      ? 'bg-amber-500/20 border-amber-400/50 text-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.25)]'
                      : 'bg-amber-500/10 hover:bg-amber-500/15 border-amber-500/30 text-amber-300'
                  }`}
                >
                  <Star className={`w-4 h-4 ${isStarred ? 'fill-amber-400 text-amber-400' : 'text-amber-400'}`} />
                  <span>{isStarred ? t('detail.starred') : t('detail.starAction')} ({(project.starsCount ?? 0).toLocaleString()})</span>
                </button>

                <button
                  onClick={onOpenDocs}
                  className="text-white/70 hover:text-blue-400 flex items-center gap-2 transition-colors text-left cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4 text-blue-400" />
                  <span>{t('detail.installGuide')}</span>
                </button>

                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-white/70 hover:text-blue-400 flex items-center gap-2 transition-colors"
                >
                  <ExternalLink className="w-4 h-4 text-blue-400" />
                  <span>{t('detail.sourceCode')}</span>
                </a>

                {/* Git Clone Snippet */}
                <div className="bg-[#0A0A0A] p-3 rounded-lg border border-white/10 flex items-center justify-between text-[11px] text-white/70">
                  <span className="truncate font-mono mr-2 text-white/80">
                    git clone {project.githubUrl}.git
                  </span>
                  <button
                    onClick={handleCopyClone}
                    className="p-1 hover:text-white text-white/60 transition-colors shrink-0 cursor-pointer"
                    title={t('detail.cloneCopy')}
                  >
                    {copiedClone ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Metadata Card */}
            <div className="bg-[#121212] rounded-2xl p-6 border border-white/5 space-y-4 font-inter text-sm">
              <div className="flex justify-between border-b border-white/5 pb-2.5">
                <span className="text-white/50 font-mono text-xs">{t('detail.license')}</span>
                <span className="text-white font-medium">{project.license}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2.5">
                <span className="text-white/50 font-mono text-xs">{t('detail.maintainer')}</span>
                <span className="text-white font-medium">{project.maintainer}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2.5">
                <span className="text-white/50 font-mono text-xs">{t('detail.lastUpdated')}</span>
                <span className="text-white font-medium">{project.lastUpdated}</span>
              </div>
              <div className="flex justify-between items-center border-b border-white/5 pb-2.5">
                <span className="text-white/50 font-mono text-xs flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  {isOnline ? t('detail.githubStars') : t('detail.githubDownloads')}
                </span>
                <span className="text-blue-400 font-mono font-bold">
                  {githubSynced
                    ? (isOnline
                        ? (project.starsCount ?? 0)
                        : project.downloadsCount
                      ).toLocaleString()
                    : '…'}
                </span>
              </div>

              {project.systemRequirements && (
                <div className="pt-3 border-t border-white/5 text-xs text-white/60 space-y-1 font-mono">
                  <div className="text-white font-semibold mb-1">{t('detail.systemRequirements')}</div>
                  <div>{t('detail.os', { os: project.systemRequirements.os })}</div>
                  <div>{t('detail.ram', { ram: project.systemRequirements.ram })}</div>
                  <div>{t('detail.space', { storage: project.systemRequirements.storage })}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen Lightbox Modal */}
      {lightboxOpen && galleryImages.length > 0 && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-3 sm:p-6"
          onClick={() => setLightboxOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label={t('detail.lightboxAlt')}
        >
          <div
            className="relative w-full max-w-[min(96vw,1400px)] max-h-[92vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            {galleryImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={goToPrevImage}
                  className="absolute left-0 sm:-left-12 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/70 border border-white/10 text-white hover:bg-blue-600 transition-colors cursor-pointer z-10"
                  aria-label={t('detail.prevImage')}
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  type="button"
                  onClick={goToNextImage}
                  className="absolute right-0 sm:-right-12 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/70 border border-white/10 text-white hover:bg-blue-600 transition-colors cursor-pointer z-10"
                  aria-label={t('detail.nextImage')}
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
            <img
              src={galleryImages[selectedImageIndex]}
              alt={t('detail.lightboxAlt')}
              referrerPolicy="no-referrer"
              draggable={false}
              onError={(e) => {
                const target = e.currentTarget;
                const fallback = galleryImages[0];
                if (fallback && target.src !== fallback) {
                  target.src = fallback;
                }
              }}
              className="max-w-full max-h-[82vh] w-auto h-auto object-contain rounded-lg"
            />
            <div className="flex items-center gap-4 mt-4 text-xs font-mono text-white/70">
              <span>{t('detail.lightboxCounter', { current: selectedImageIndex + 1, total: galleryImages.length })}</span>
              <button
                onClick={() => setLightboxOpen(false)}
                className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded-lg cursor-pointer"
              >
                {t('detail.lightboxClose')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
