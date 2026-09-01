import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { ALL_PROJECTS } from './data/projectsData';
import { Project, ProjectCategory, DownloadOption } from './types';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ProjectCard } from './components/ProjectCard';
import { ProjectDetailView } from './components/ProjectDetailView';
import { DownloadProgressModal } from './components/DownloadProgressModal';
import { StarGithubModal } from './components/StarGithubModal';
import { DocsModal } from './components/DocsModal';
import { ConnectModal } from './components/ConnectModal';
import { SavedProjectsDrawer } from './components/SavedProjectsDrawer';
import { triggerDirectDownload, ActiveDownload } from './utils/downloadHelper';
import { syncProjectsWithGitHub } from './services/githubService';
import { fetchGithubActivity, GithubActivityPayload } from './services/githubActivityService';
import {
  findProjectBySlug,
  getProjectPath,
  getSlugFromLocation,
} from './utils/projectSlug';
import { GitHubActivityStatus } from './components/GitHubActivityStatus';
import { useI18n, useLocalizedProjects } from './i18n/context';
import { Search, Filter, Monitor, Smartphone, Wrench, Shield, Star, Download, FolderArchive, ArrowUpDown, Globe, Github, CheckCircle2 } from 'lucide-react';

type HubFilter = ProjectCategory | 'Top Stars' | 'Most Downloads';

const STORAGE_SAVED_KEY = 'nrnworld_saved_projects_v1';
const STORAGE_STARRED_KEY = 'nrnworld_starred_projects_v1';
const GITGIT_BACKGROUND_VIDEO =
  'https://media.gitgit.me/background-videos/8fdbb0a4-43fc-4ffe-94d8-f7994fd813b5_1777587444217.mp4';
const BACKGROUND_VIDEO_PLAYBACK_RATE = 0.25;

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
  // Official nRnWorld project releases with live GitHub synchronization
  const [projects, setProjects] = useState<Project[]>(ALL_PROJECTS);
  const localizedProjects = useLocalizedProjects(projects);
  const [lastGithubSync, setLastGithubSync] = useState<Date | null>(null);
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
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<HubFilter>('All');
  const [fileTypeFilter, setFileTypeFilter] = useState<'all' | 'exe' | 'zip' | 'apk'>('all');
  const [sortBy, setSortBy] = useState<'featured' | 'downloads' | 'newest' | 'name' | 'stars'>('featured');
  const backgroundVideoRef = useRef<HTMLVideoElement>(null);

  const applyBackgroundVideoSpeed = useCallback((video: HTMLVideoElement) => {
    video.playbackRate = BACKGROUND_VIDEO_PLAYBACK_RATE;
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

  const handleOpenLive = (project: Project, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const url = project.liveDemoUrl || project.githubUrl;
    if (!url) return;
    window.open(url, '_blank', 'noopener,noreferrer');
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
    { label: 'Security', icon: <Shield className="w-3.5 h-3.5" /> },
    { label: 'Games' },
    { label: 'Top Stars', icon: <Star className="w-3.5 h-3.5" /> },
    { label: 'Most Downloads', icon: <Download className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="relative min-h-screen bg-[#0C1014] text-[#E0E0E0] selection:bg-blue-600 selection:text-white">
      <video
        ref={backgroundVideoRef}
        autoPlay
        loop
        muted
        playsInline
        className="fixed inset-0 z-0 h-full w-full object-cover pointer-events-none"
        src={GITGIT_BACKGROUND_VIDEO}
        aria-hidden="true"
        onLoadedMetadata={(event) => applyBackgroundVideoSpeed(event.currentTarget)}
        onCanPlay={(event) => applyBackgroundVideoSpeed(event.currentTarget)}
      />

      <div className="relative z-10 flex min-h-screen flex-col pt-14 sm:pt-16">
      {/* Top Navigation Bar */}
      <Navbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        savedProjects={savedProjectIds}
        allProjects={projects}
        onOpenSavedDrawer={() => setSavedDrawerOpen(true)}
        onOpenDocs={() => setDocsModalOpen(true)}
        onOpenConnect={() => setConnectModalOpen(true)}
        onResetView={handleBackToHub}
        activeView={selectedProject ? 'details' : 'hub'}
      />

      {/* Main View Router */}
      {selectedProject ? (
        <ProjectDetailView
          project={selectedProject}
          onBack={handleBackToHub}
          onDownload={handleDownload}
          onOpenLive={handleOpenLive}
          githubSynced={githubSynced}
          isSaved={savedProjectIds.includes(selectedProject.id)}
          onToggleSave={handleToggleSave}
          onOpenDocs={() => setDocsModalOpen(true)}
          isStarred={starredProjectIds.includes(selectedProject.id)}
          onToggleStar={handleToggleStar}
        />
      ) : (
        <main className="flex-grow w-full max-w-[1920px] mx-auto px-3 md:px-6 pb-24">
          {/* Hero Section */}
          <section className="py-10 sm:py-14 md:py-20 flex flex-col items-center text-center px-2">
            {/* Main Title */}
            <h1 className="font-sora text-2xl sm:text-4xl md:text-6xl font-black mb-3 sm:mb-4 text-white tracking-tight max-w-4xl leading-tight">
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

            <p className="font-inter text-sm sm:text-base md:text-lg text-white/60 max-w-2xl mx-auto leading-relaxed px-2">
              {t('hub.subtitle')}
            </p>

            <div className="mt-5 sm:mt-6 w-full max-w-3xl flex flex-col sm:flex-row items-stretch justify-center gap-3 sm:gap-4 px-1">
              <div className="flex items-center justify-center gap-3 bg-[#0e1626] px-4 py-2.5 sm:py-3 rounded-xl border border-blue-500/30 text-blue-300 shadow-md shadow-blue-950/40 font-mono text-xs text-white/70 shrink-0">
                <div className="flex flex-col items-center gap-1.5 shrink-0">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-black border border-white/10 flex items-center justify-center">
                    <Github className="w-5 h-5 sm:w-[22px] sm:h-[22px] text-white" />
                  </div>
                  <span className="text-[9px] sm:text-[10px] text-blue-300/80 text-center leading-tight max-w-[92px]">
                    {t('hub.githubDownloads')}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span className="font-sora text-xl sm:text-2xl font-bold text-white tabular-nums">
                    {githubSynced ? totalLiveDownloads.toLocaleString() : '…'}
                  </span>
                </div>
              </div>

              {githubActivity && (
                <div className="flex-1 min-w-0">
                  <GitHubActivityStatus
                    login={githubActivity.login}
                    days={githubActivity.days}
                    totalContributions={githubActivity.totalContributions}
                  />
                </div>
              )}
            </div>
          </section>

          {/* Search & Filter Bar Section */}
          <section className="mb-10">
            <div className="bg-[#121212] rounded-2xl p-4 md:p-5 flex flex-col gap-4 max-w-5xl mx-auto border border-white/5 shadow-xl shadow-black/50 overflow-hidden">
              {/* Search input */}
              <div className="relative w-full min-w-0">
                <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('hub.searchPlaceholderMobile')}
                  className="w-full bg-[#181818] border border-white/10 rounded-xl py-3 pl-11 pr-10 text-white placeholder:text-white/40 placeholder:font-mono text-sm focus:border-blue-500 focus:outline-none transition-colors sm:hidden"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('hub.searchPlaceholder')}
                  className="hidden sm:block w-full bg-[#181818] border border-white/10 rounded-xl py-3 pl-11 pr-10 text-white placeholder:text-white/40 placeholder:font-mono text-sm focus:border-blue-500 focus:outline-none transition-colors"
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
                        className={`shrink-0 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl font-mono text-[11px] sm:text-xs whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
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
            </div>

            {/* Secondary Controls Bar: Format filter & Sort */}
            <div className="flex flex-wrap items-center justify-between gap-3 max-w-5xl mx-auto mt-4 px-2 text-xs font-mono text-white/60">
              <div className="flex items-center gap-2">
                <span className="text-white/40">{t('hub.format')}</span>
                <button
                  onClick={() => setFileTypeFilter('all')}
                  className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${fileTypeFilter === 'all' ? 'bg-white/10 text-white font-bold' : 'hover:text-white'}`}
                >
                  {t('filters.all')}
                </button>
                <button
                  onClick={() => setFileTypeFilter('zip')}
                  className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${fileTypeFilter === 'zip' ? 'bg-blue-600/20 text-blue-400 font-bold border border-blue-500/30' : 'hover:text-white'}`}
                >
                  {t('filters.zip')}
                </button>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-white/50">
                  {t('hub.showing', { count: filteredProjects.length, total: projects.length })}
                </span>

                <div className="flex items-center gap-1.5 bg-[#121212] px-3 py-1.5 rounded-lg border border-white/10">
                  <ArrowUpDown className="w-3.5 h-3.5 text-blue-400" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                    className="bg-transparent border-none text-xs text-white focus:outline-none cursor-pointer"
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
            <section className="grid grid-cols-1 min-[400px]:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
              {filteredProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  githubSynced={githubSynced}
                  onSelect={handleSelectProject}
                  onOpenLive={handleOpenLive}
                  isSaved={savedProjectIds.includes(project.id)}
                  onToggleSave={handleToggleSave}
                  isStarred={starredProjectIds.includes(project.id)}
                  onToggleStar={handleToggleStar}
                />
              ))}
            </section>
          )}
        </main>
      )}

      {/* Footer */}
      <Footer
        onOpenConnect={() => setConnectModalOpen(true)}
      />

      {/* Active Download Progress Modal / Toast */}
      <DownloadProgressModal
        download={activeDownload}
        onClose={() => setActiveDownload(null)}
      />

      {/* Star GitHub Modal */}
      <StarGithubModal
        isOpen={starModalOpen}
        onClose={() => setStarModalOpen(false)}
        project={starModalProject}
        hasStarredLocally={starModalProject ? starredProjectIds.includes(starModalProject.id) : false}
      />

      {/* Installation Docs Modal */}
      <DocsModal
        isOpen={docsModalOpen}
        onClose={() => setDocsModalOpen(false)}
      />

      {/* Connect & Creator Modal */}
      <ConnectModal
        isOpen={connectModalOpen}
        onClose={() => setConnectModalOpen(false)}
      />

      {/* Saved Projects Drawer */}
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
      </div>
    </div>
  );
}
