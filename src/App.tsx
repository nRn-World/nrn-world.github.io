import React, { useState, useEffect, useMemo, useRef, useCallback, lazy, Suspense } from 'react';
import { ALL_PROJECTS } from './data/projectsData';
import { Project, ProjectCategory, DownloadOption } from './types';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ProjectCard } from './components/ProjectCard';
import { triggerDirectDownload, ActiveDownload } from './utils/downloadHelper';
import { syncProjectsWithGitHub, mergeGithubStatsPayload, type GithubStatsPayload } from './services/githubService';
import { fetchGithubActivity, GithubActivityPayload } from './services/githubActivityService';
import {
  findProjectBySlug,
  getProjectPath,
  getSlugFromLocation,
} from './utils/projectSlug';
import { updatePageSeo } from './utils/seoMeta';
import { GitHubActivityStatus } from './components/GitHubActivityStatus';
import { useI18n, useLocalizedProjects } from './i18n/context';
import { Search, Filter, Monitor, Smartphone, Wrench, Shield, Star, Download, FolderArchive, ArrowUpDown, Globe, Github, CheckCircle2, Puzzle } from 'lucide-react';
import githubStatsSnapshot from './data/githubStatsSeed.json';

const ProjectDetailView = lazy(() =>
  import('./components/ProjectDetailView').then((m) => ({ default: m.ProjectDetailView }))
);
const DownloadProgressModal = lazy(() =>
  import('./components/DownloadProgressModal').then((m) => ({ default: m.DownloadProgressModal }))
);
const StarGithubModal = lazy(() =>
  import('./components/StarGithubModal').then((m) => ({ default: m.StarGithubModal }))
);
const DocsModal = lazy(() =>
  import('./components/DocsModal').then((m) => ({ default: m.DocsModal }))
);
const ConnectModal = lazy(() =>
  import('./components/ConnectModal').then((m) => ({ default: m.ConnectModal }))
);
const AboutModal = lazy(() =>
  import('./components/AboutModal').then((m) => ({ default: m.AboutModal }))
);
const SavedProjectsDrawer = lazy(() =>
  import('./components/SavedProjectsDrawer').then((m) => ({ default: m.SavedProjectsDrawer }))
);

type HubFilter = ProjectCategory | 'Top Stars' | 'Most Downloads';

const STORAGE_SAVED_KEY = 'nrnworld_saved_projects_v1';
const STORAGE_STARRED_KEY = 'nrnworld_starred_projects_v1';
const GITGIT_BACKGROUND_VIDEO =
  'https://media.gitgit.me/background-videos/8fdbb0a4-43fc-4ffe-94d8-f7994fd813b5_1777587444217.mp4';
const BACKGROUND_VIDEO_PLAYBACK_RATE = 0.25;

const SEEDED_PROJECTS = mergeGithubStatsPayload(
  ALL_PROJECTS,
  githubStatsSnapshot as GithubStatsPayload
);
const SNAPSHOT_SYNCED =
  (githubStatsSnapshot as GithubStatsPayload).successCount > 0
    ? new Date((githubStatsSnapshot as GithubStatsPayload).fetchedAt)
    : null;

function getGithubActivityTimestamp(project: Project): number {
  if (project.githubPushedAt) {
    const ts = new Date(project.githubPushedAt).getTime();
    if (!Number.isNaN(ts)) return ts;
  }
  const releaseTs = new Date(project.releaseDate).getTime();
  return Number.isNaN(releaseTs) ? 0 : releaseTs;
}

export default function App() {
  const { t, localizeCategory } = useI18n();
  // Official nRnWorld project releases — seeded from build-time GitHub snapshot to avoid CLS
  const [projects, setProjects] = useState<Project[]>(SEEDED_PROJECTS);
  const localizedProjects = useLocalizedProjects(projects);
  const [lastGithubSync, setLastGithubSync] = useState<Date | null>(SNAPSHOT_SYNCED);
  const [githubActivity, setGithubActivity] = useState<GithubActivityPayload | null>(null);
  const githubSynced = lastGithubSync !== null;

  // Sync projects with live GitHub stats on mount
  useEffect(() => {
    let isMounted = true;

    async function loadGithubStats() {
      try {
        const result = await syncProjectsWithGitHub(ALL_PROJECTS);
        if (isMounted && result.successCount > 0) {
          setProjects(result.projects);
          setLastGithubSync(new Date());
        }
      } catch (err) {
        console.warn('GitHub stats sync notice:', err);
      }
    }

    loadGithubStats();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadGithubActivity() {
      try {
        const payload = await fetchGithubActivity();
        if (isMounted && payload) {
          setGithubActivity(payload);
        }
      } catch (err) {
        console.warn('GitHub activity sync notice:', err);
      }
    }

    loadGithubActivity();
    return () => {
      isMounted = false;
    };
  }, []);

  // Selected project for full detail page
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Keep selectedProject in sync with updated & localized projects list
  useEffect(() => {
    if (selectedProject) {
      const updated = localizedProjects.find((p) => p.id === selectedProject.id);
      if (updated) {
        setSelectedProject(updated);
      }
    }
  }, [projects, localizedProjects]);

  // Search and filters
  const [searchQuery, setSearchQuery] = useState(() => {
    try {
      return new URLSearchParams(window.location.search).get('q') ?? '';
    } catch {
      return '';
    }
  });
  const [selectedCategory, setSelectedCategory] = useState<HubFilter>('All');
  const [fileTypeFilter, setFileTypeFilter] = useState<'all' | 'exe' | 'zip' | 'apk'>('all');
  const [sortBy, setSortBy] = useState<'featured' | 'downloads' | 'newest' | 'name' | 'stars'>('featured');
  const backgroundVideoRef = useRef<HTMLVideoElement>(null);
  const [backgroundVideoSrc, setBackgroundVideoSrc] = useState<string | undefined>(undefined);

  const applyBackgroundVideoSpeed = useCallback((video: HTMLVideoElement) => {
    video.playbackRate = BACKGROUND_VIDEO_PLAYBACK_RATE;
  }, []);

  // Background video: desktop only, long defer — avoid competing with LCP / cache audits.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (window.matchMedia('(max-width: 767px)').matches) return;
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    if (conn?.saveData) return;

    let cancelled = false;
    const loadVideo = () => {
      if (!cancelled) setBackgroundVideoSrc(GITGIT_BACKGROUND_VIDEO);
    };

    const onInteract = () => {
      loadVideo();
      cleanupInteract();
    };
    const cleanupInteract = () => {
      window.removeEventListener('pointerdown', onInteract);
      window.removeEventListener('keydown', onInteract);
      window.removeEventListener('scroll', onInteract);
    };

    window.addEventListener('pointerdown', onInteract, { once: true, passive: true });
    window.addEventListener('keydown', onInteract, { once: true });
    window.addEventListener('scroll', onInteract, { once: true, passive: true });

    const timeoutId = window.setTimeout(loadVideo, 15000);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
      cleanupInteract();
    };
  }, []);

  // Total GitHub download count across all repositories
  const totalLiveDownloads = useMemo(() => {
    return projects.reduce((sum, p) => sum + (p.downloadsCount || 0), 0);
  }, [projects]);

  // Bookmarks
  const [savedProjectIds, setSavedProjectIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_SAVED_KEY);
      return saved ? JSON.parse(saved) : ['windows-smart-taskbar', 'nobreak-audio-builder'];
    } catch {
      return ['windows-smart-taskbar', 'nobreak-audio-builder'];
    }
  });

  // Starred projects
  const [starredProjectIds, setStarredProjectIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_STARRED_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Modals & Drawers
  const [activeDownload, setActiveDownload] = useState<ActiveDownload | null>(null);
  const [starModalProject, setStarModalProject] = useState<Project | null>(null);
  const [starModalOpen, setStarModalOpen] = useState(false);
  const [docsModalOpen, setDocsModalOpen] = useState(false);
  const [connectModalOpen, setConnectModalOpen] = useState(false);
  const [aboutModalOpen, setAboutModalOpen] = useState(false);
  const [savedDrawerOpen, setSavedDrawerOpen] = useState(false);

  // Save bookmarked IDs to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_SAVED_KEY, JSON.stringify(savedProjectIds));
    } catch (e) {
      console.error('Failed to save bookmark IDs', e);
    }
  }, [savedProjectIds]);

  // Save starred IDs to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_STARRED_KEY, JSON.stringify(starredProjectIds));
    } catch (e) {
      console.error('Failed to save star IDs', e);
    }
  }, [starredProjectIds]);

  // Path routing (e.g. /thesilentroom1986)
  useEffect(() => {
    const syncRoute = () => {
      const legacyHash = window.location.hash.replace('#', '').trim();
      if (legacyHash) {
        const fromHash = findProjectBySlug(projects, legacyHash) ?? projects.find((p) => p.id === legacyHash);
        if (fromHash) {
          const path = getProjectPath(fromHash);
          history.replaceState(null, '', path);
          setSelectedProject(fromHash);
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        }
      }

      const slug = getSlugFromLocation();
      if (slug) {
        const found = findProjectBySlug(projects, slug);
        if (found) {
          setSelectedProject(found);
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        }
        history.replaceState(null, '', '/');
      }

      setSelectedProject(null);
    };

    syncRoute();
    window.addEventListener('popstate', syncRoute);
    return () => window.removeEventListener('popstate', syncRoute);
  }, [projects]);

  useEffect(() => {
    updatePageSeo(selectedProject);
  }, [selectedProject]);

  const handleSelectProject = (project: Project) => {
    setSelectedProject(project);
    history.pushState(null, '', getProjectPath(project));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToHub = () => {
    setSelectedProject(null);
    history.pushState(null, '', '/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleSave = (projectId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSavedProjectIds((prev) =>
      prev.includes(projectId) ? prev.filter((id) => id !== projectId) : [...prev, projectId]
    );
  };

  const handleClearSaved = () => {
    setSavedProjectIds([]);
  };

  const handleToggleStar = (project: Project, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const isAlreadyStarred = starredProjectIds.includes(project.id);
    if (!isAlreadyStarred) {
      setStarredProjectIds((prev) => [...prev, project.id]);
    }
    // Always open GitHub Star dialog so user can easily star it on GitHub too
    setStarModalProject(project);
    setStarModalOpen(true);
  };

  const handleDownload = (project: Project, option: DownloadOption, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    triggerDirectDownload(project, option, (progressState) => {
      setActiveDownload(progressState);
    });
  };

  // Filter and sort computation
  const filteredProjects = useMemo(() => {
    return localizedProjects.filter((p) => {
      // Category / quick filter
      if (
        selectedCategory !== 'All' &&
        selectedCategory !== 'Top Stars' &&
        selectedCategory !== 'Most Downloads' &&
        p.category !== selectedCategory
      ) {
        return false;
      }

      // File type filter (.zip)
      if (fileTypeFilter !== 'all') {
        const hasFileType = p.downloadOptions.some((d) => d.fileType === fileTypeFilter);
        if (!hasFileType) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = p.name.toLowerCase().includes(q);
        const matchDesc = p.description.toLowerCase().includes(q);
        const matchTag = p.tagline?.toLowerCase().includes(q);
        const matchCategory = p.category.toLowerCase().includes(q);
        const matchFiles = p.downloadOptions.some((d) =>
          d.filename.toLowerCase().includes(q) || d.fileType.toLowerCase().includes(q)
        );
        if (!matchName && !matchDesc && !matchTag && !matchCategory && !matchFiles) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      const effectiveSort =
        selectedCategory === 'Top Stars'
          ? 'stars'
          : selectedCategory === 'Most Downloads'
            ? 'downloads'
            : sortBy;

      if (effectiveSort === 'featured') {
        if (selectedCategory === 'All') {
          return getGithubActivityTimestamp(b) - getGithubActivityTimestamp(a);
        }
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return b.downloadsCount - a.downloadsCount;
      }
      if (effectiveSort === 'downloads') {
        return b.downloadsCount - a.downloadsCount;
      }
      if (effectiveSort === 'stars') {
        return (b.starsCount || 0) - (a.starsCount || 0);
      }
      if (effectiveSort === 'newest') {
        return getGithubActivityTimestamp(b) - getGithubActivityTimestamp(a);
      }
      if (effectiveSort === 'name') {
        return a.name.localeCompare(b.name);
      }
      return 0;
    });
  }, [localizedProjects, selectedCategory, fileTypeFilter, searchQuery, sortBy]);

  const categories: { label: HubFilter; icon?: React.ReactNode }[] = [
    { label: 'All' },
    { label: 'Windows', icon: <Monitor className="w-3.5 h-3.5" /> },
    { label: 'Android', icon: <Smartphone className="w-3.5 h-3.5" /> },
    { label: 'Tools', icon: <Wrench className="w-3.5 h-3.5" /> },
    { label: 'Chrome Extensions', icon: <Puzzle className="w-3.5 h-3.5" /> },
    { label: 'Security', icon: <Shield className="w-3.5 h-3.5" /> },
    { label: 'Games' },
    { label: 'Top Stars', icon: <Star className="w-3.5 h-3.5" /> },
    { label: 'Most Downloads', icon: <Download className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="relative min-h-screen bg-[#0C1014] text-[#E0E0E0] selection:bg-blue-600 selection:text-white overflow-x-hidden max-w-full">
      <video
        ref={backgroundVideoRef}
        autoPlay
        loop
        muted
        playsInline
        preload="none"
        className="fixed inset-0 z-0 h-full w-full object-cover pointer-events-none"
        src={backgroundVideoSrc}
        aria-hidden="true"
        onLoadedMetadata={(event) => applyBackgroundVideoSpeed(event.currentTarget)}
        onCanPlay={(event) => applyBackgroundVideoSpeed(event.currentTarget)}
      />

      <div className="relative z-10 flex min-h-screen flex-col pt-14 sm:pt-16 overflow-x-hidden max-w-full">
        {/* Skip to main content link (WCAG 2.4.1) */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-lg focus:font-bold focus:shadow-xl focus:outline-none"
        >
          {t('navbar.allProjects')}
        </a>

        {/* Top Navigation Bar */}
        <Navbar
          savedProjects={savedProjectIds}
          allProjects={projects}
          onOpenSavedDrawer={() => setSavedDrawerOpen(true)}
          onOpenDocs={() => setDocsModalOpen(true)}
          onOpenConnect={() => setConnectModalOpen(true)}
          onOpenAbout={() => setAboutModalOpen(true)}
          onResetView={handleBackToHub}
          activeView={selectedProject ? 'details' : 'hub'}
        />

        {/* Main View Router */}
        {selectedProject ? (
          <div id="main-content" tabIndex={-1} className="focus:outline-none flex-grow">
            <Suspense fallback={<div className="min-h-[50vh]" aria-hidden />}>
              <ProjectDetailView
                project={selectedProject}
                onBack={handleBackToHub}
                onDownload={handleDownload}
                githubSynced={githubSynced}
                isSaved={savedProjectIds.includes(selectedProject.id)}
                onToggleSave={handleToggleSave}
                onOpenDocs={() => setDocsModalOpen(true)}
                isStarred={starredProjectIds.includes(selectedProject.id)}
                onToggleStar={handleToggleStar}
              />
            </Suspense>
          </div>
        ) : (
          <main id="main-content" tabIndex={-1} className="flex-grow w-full max-w-[1920px] mx-auto px-3 md:px-6 pb-24 min-w-0 overflow-x-hidden focus:outline-none">
          {/* Hero Section */}
          <section className="py-4 sm:py-5 md:py-7 lg:py-8 flex flex-col items-center text-center px-2 min-w-0 max-w-full overflow-hidden">
            <h1 className="font-sora text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-[4.25rem] font-black mb-2 md:mb-3 text-white tracking-tight max-w-5xl leading-[1.05]">
              <span className="inline-flex items-center justify-center flex-wrap gap-x-1">
                <span>
                  n<span className="text-blue-500">R</span>nW
                  <Globe className="w-[0.75em] h-[0.75em] text-blue-400 mx-[0.02em] inline-block align-[-0.1em] animate-[spin_20s_linear_infinite]" />
                  rld
                </span>
                <span className="text-blue-500 font-bold animate-[slash-blink_1s_step-end_infinite]">/</span>
                <span>{t('hub.title')}</span>
              </span>
            </h1>

            <p className="font-inter text-sm sm:text-base md:text-lg text-white/65 max-w-2xl mx-auto leading-relaxed px-2">
              {t('hub.subtitle')}
            </p>

            <div className="mt-3 md:mt-4 w-full max-w-3xl flex flex-col sm:flex-row items-stretch justify-center gap-2 sm:gap-2.5 px-1 min-w-0">
              <div className="flex items-center justify-center gap-2.5 bg-[#0e1626] px-3 py-2 rounded-xl border border-blue-500/30 text-blue-300 shadow-md shadow-blue-950/40 font-mono text-xs text-white/70 w-full sm:w-auto sm:shrink-0">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-black border border-white/10 flex items-center justify-center shrink-0">
                  <Github className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div className="flex flex-col items-start text-left min-w-0">
                  <span className="text-[9px] sm:text-[10px] text-blue-300/80 leading-tight">
                    {t('hub.githubDownloads')}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="relative flex h-1.5 w-1.5 shrink-0">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                    </span>
                    <span className="font-sora text-lg sm:text-xl font-bold text-white tabular-nums leading-none">
                      {githubSynced ? totalLiveDownloads.toLocaleString() : '…'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex-1 min-w-0 min-h-[4.5rem] sm:min-h-[4.75rem]">
                {githubActivity ? (
                  <GitHubActivityStatus
                    login={githubActivity.login}
                    days={githubActivity.days}
                    totalContributions={githubActivity.totalContributions}
                  />
                ) : null}
              </div>
            </div>
          </section>

          {/* Search & Filter Bar Section */}
          <section className="mb-2 md:mb-2.5">
            <div className="bg-[#121212] rounded-2xl p-2.5 md:p-3 flex flex-col gap-2 md:gap-2.5 max-w-5xl mx-auto border border-white/5 shadow-xl shadow-black/50 overflow-hidden">
              {/* Search input */}
              <div className="relative w-full min-w-0">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('hub.searchPlaceholderMobile')}
                  className="w-full bg-[#181818] border border-white/10 rounded-xl py-2.5 pl-10 pr-10 text-white placeholder:text-white/40 placeholder:font-mono text-sm focus:border-blue-500 focus:outline-none transition-colors sm:hidden"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('hub.searchPlaceholder')}
                  className="hidden sm:block w-full bg-[#181818] border border-white/10 rounded-xl py-2 md:py-2.5 pl-10 pr-10 text-white placeholder:text-white/40 placeholder:font-mono text-sm focus:border-blue-500 focus:outline-none transition-colors"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-white/50 hover:text-white p-1 cursor-pointer"
                  >
                    {t('hub.clear')}
                  </button>
                )}
              </div>

              {/* Category Filter Pills — egen rad med horisontell scroll */}
              <div className="relative w-full min-w-0">
                <div className="flex gap-2 w-full min-w-0 overflow-x-auto pb-1 scrollbar-hide filter-pill-scroll">
                  {categories.map((cat) => {
                    const isActive = selectedCategory === cat.label;
                    const filterLabel =
                      cat.label === 'Top Stars'
                        ? t('filters.topStars')
                        : cat.label === 'Most Downloads'
                          ? t('filters.mostDownloads')
                          : localizeCategory(cat.label);

                    return (
                      <button
                        key={cat.label}
                        onClick={() => {
                          setSelectedCategory(cat.label);
                          if (cat.label === 'Top Stars') setSortBy('stars');
                          else if (cat.label === 'Most Downloads') setSortBy('downloads');
                          else if (cat.label === 'All') setSortBy('featured');
                        }}
                        className={`shrink-0 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl font-mono text-[11px] sm:text-xs whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                          isActive
                            ? 'bg-blue-600 text-white font-bold shadow-lg shadow-blue-900/30'
                            : 'bg-white/5 hover:bg-white/10 text-white/60 hover:text-white border border-white/5'
                        }`}
                      >
                        {cat.icon}
                        <span>{filterLabel}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Format filter & Sort — inside card to save vertical space */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/5 text-[11px] sm:text-xs font-mono text-white/60">
                <div className="flex items-center gap-2">
                  <span className="text-white/70">{t('hub.format')}</span>
                  <button
                    onClick={() => setFileTypeFilter('all')}
                    className={`px-2 py-1 min-h-[28px] rounded-md transition-colors cursor-pointer ${fileTypeFilter === 'all' ? 'bg-white/10 text-white font-bold' : 'hover:text-white'}`}
                  >
                    {t('filters.all')}
                  </button>
                  <button
                    onClick={() => setFileTypeFilter('zip')}
                    className={`px-2 py-1 min-h-[28px] rounded-md transition-colors cursor-pointer ${fileTypeFilter === 'zip' ? 'bg-blue-600/20 text-blue-400 font-bold border border-blue-500/30' : 'hover:text-white'}`}
                  >
                    {t('filters.zip')}
                  </button>
                </div>

                <div className="flex items-center gap-2 sm:gap-3">
                  <span className="text-white/60 hidden sm:inline">
                    {t('hub.showing', { count: filteredProjects.length, total: projects.length })}
                  </span>

                  <div className="flex items-center gap-1.5 bg-[#181818] px-2 py-1 rounded-lg border border-white/10 min-h-[28px]">
                    <ArrowUpDown className="w-3 h-3 text-blue-400" />
                    <select
                      aria-label="Sortera projekt"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                      className="bg-transparent border-none text-[11px] sm:text-xs text-white focus:outline-none cursor-pointer"
                    >
                      <option value="featured" className="bg-[#121212]">{t('sort.featured')}</option>
                      <option value="stars" className="bg-[#121212]">{t('sort.stars')}</option>
                      <option value="downloads" className="bg-[#121212]">{t('sort.downloads')}</option>
                      <option value="newest" className="bg-[#121212]">{t('sort.newest')}</option>
                      <option value="name" className="bg-[#121212]">{t('sort.name')}</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Project Grid */}
          {filteredProjects.length === 0 ? (
            <div className="bg-[#121212] rounded-2xl p-12 text-center max-w-xl mx-auto my-12 border border-white/5 shadow-xl shadow-black/40">
              <Search className="w-12 h-12 text-white/30 mx-auto mb-4" />
              <h3 className="font-sora text-xl font-bold text-white mb-2">{t('hub.emptyTitle')}</h3>
              <p className="text-sm text-white/60 font-inter mb-6">
                {t('hub.emptyMessage', { query: searchQuery, category: localizeCategory(selectedCategory) })}
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                  setFileTypeFilter('all');
                }}
                className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-mono text-xs font-bold transition-colors cursor-pointer shadow-lg shadow-blue-900/30"
              >
                {t('hub.resetFilters')}
              </button>
            </div>
          ) : (
            <section aria-label="Projektkatalog" className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 gap-2 md:gap-2.5">
              <h2 className="sr-only">Projektkatalog</h2>
              {filteredProjects.map((project, index) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  githubSynced={githubSynced}
                  onSelect={handleSelectProject}
                  isSaved={savedProjectIds.includes(project.id)}
                  onToggleSave={handleToggleSave}
                  isStarred={starredProjectIds.includes(project.id)}
                  onToggleStar={handleToggleStar}
                  imagePriority={index < 2}
                />
              ))}
            </section>
          )}
        </main>
      )}

      {/* Footer */}
      <Footer
        onOpenConnect={() => setConnectModalOpen(true)}
        onOpenAbout={() => setAboutModalOpen(true)}
      />

      <Suspense fallback={null}>
        <DownloadProgressModal
          download={activeDownload}
          onClose={() => setActiveDownload(null)}
        />
        <StarGithubModal
          isOpen={starModalOpen}
          onClose={() => setStarModalOpen(false)}
          project={starModalProject}
          hasStarredLocally={starModalProject ? starredProjectIds.includes(starModalProject.id) : false}
        />
        <DocsModal
          isOpen={docsModalOpen}
          onClose={() => setDocsModalOpen(false)}
        />
        <ConnectModal
          isOpen={connectModalOpen}
          onClose={() => setConnectModalOpen(false)}
        />
        <AboutModal
          isOpen={aboutModalOpen}
          onClose={() => setAboutModalOpen(false)}
        />
        <SavedProjectsDrawer
          isOpen={savedDrawerOpen}
          onClose={() => setSavedDrawerOpen(false)}
          savedProjectIds={savedProjectIds}
          allProjects={projects}
          githubSynced={githubSynced}
          onSelectProject={handleSelectProject}
          onRemoveSaved={handleToggleSave}
          onClearAll={handleClearSaved}
        />
      </Suspense>
      </div>
    </div>
  );
}
