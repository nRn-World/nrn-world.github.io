import React, { useState, useEffect, useMemo, useCallback, lazy, Suspense } from 'react';
import { ALL_PROJECTS } from './data/projectsData';
import { Project, ProjectCategory, DownloadOption } from './types';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ProjectCard } from './components/ProjectCard';
import { ProjectShowcase } from './components/ProjectShowcase';
import { triggerDirectDownload, ActiveDownload } from './utils/downloadHelper';
import { syncProjectsWithGitHub, mergeGithubStatsPayload, type GithubStatsPayload } from './services/githubService';
import { fetchGithubActivity, GithubActivityPayload } from './services/githubActivityService';
import {
  fetchEngagementPayload,
  getLiveEngagementKind,
  mergeEngagementIntoProjects,
  recordEngagement,
  type EngagementKind,
  type EngagementPayload,
} from './services/engagementService';
import {
  findProjectBySlug,
  getProjectPath,
  getSlugFromLocation,
} from './utils/projectSlug';
import { updatePageSeo } from './utils/seoMeta';
import { useI18n, useLocalizedProjects } from './i18n/context';
import { Search, Star, ArrowUpDown } from 'lucide-react';
import githubStatsSnapshot from './data/githubStatsSeed.json';
import { HudColumn } from './components/ui/hud-panels';
import { SplineSceneBasic } from './components/ui/spline-scene-basic';

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

// One ordering for the catalog and the showcase rails, so the sort choice applies to both.
function compareProjects(category: HubFilter, sortBy: 'featured' | 'downloads' | 'newest' | 'name' | 'stars') {
  return (a: Project, b: Project): number => {
    const effectiveSort = category === 'Top Stars' ? 'stars' : category === 'Most Downloads' ? 'downloads' : sortBy;
    if (effectiveSort === 'featured') {
      if (category === 'All') return getGithubActivityTimestamp(b) - getGithubActivityTimestamp(a);
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return b.downloadsCount - a.downloadsCount;
    }
    if (effectiveSort === 'downloads') return b.downloadsCount - a.downloadsCount;
    if (effectiveSort === 'stars') return (b.starsCount || 0) - (a.starsCount || 0);
    if (effectiveSort === 'newest') return getGithubActivityTimestamp(b) - getGithubActivityTimestamp(a);
    if (effectiveSort === 'name') return a.name.localeCompare(b.name);
    return 0;
  };
}

const STORAGE_SAVED_KEY = 'nrnworld_saved_projects_v1';
const STORAGE_STARRED_KEY = 'nrnworld_starred_projects_v1';
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
  const [baseProjects, setBaseProjects] = useState<Project[]>(SEEDED_PROJECTS);
  const [engagement, setEngagement] = useState<EngagementPayload | null>(null);
  const projects = useMemo(
    () => mergeEngagementIntoProjects(baseProjects, engagement),
    [baseProjects, engagement]
  );
  const localizedProjects = useLocalizedProjects(projects);
  const [lastGithubSync, setLastGithubSync] = useState<Date | null>(SNAPSHOT_SYNCED);
  const [githubActivity, setGithubActivity] = useState<GithubActivityPayload | null>(null);
  const githubSynced = lastGithubSync !== null;

  const bumpEngagement = useCallback((projectId: string, kind: EngagementKind) => {
    setEngagement((prev) => {
      const projectsMap = { ...(prev?.projects ?? {}) };
      const current = projectsMap[projectId] ?? {
        stars: 0,
        downloads: 0,
        plays: 0,
        opens: 0,
      };
      projectsMap[projectId] = {
        ...current,
        [kind]: (current[kind] ?? 0) + 1,
      };
      return {
        updatedAt: new Date().toISOString(),
        projects: projectsMap,
      };
    });
    void recordEngagement(projectId, kind).then((remote) => {
      if (!remote) return;
      setEngagement((prev) => {
        const projectsMap = { ...(prev?.projects ?? {}) };
        projectsMap[projectId] = remote;
        return {
          updatedAt: new Date().toISOString(),
          projects: projectsMap,
        };
      });
    });
  }, []);

  // Sync projects with live GitHub stats on mount
  useEffect(() => {
    let isMounted = true;

    async function loadGithubStats() {
      try {
        const result = await syncProjectsWithGitHub(ALL_PROJECTS);
        if (isMounted && result.successCount > 0) {
          setBaseProjects(result.projects);
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

  // Shared hub stars / downloads / plays visible to everyone online
  useEffect(() => {
    let isMounted = true;

    async function loadEngagement() {
      try {
        const payload = await fetchEngagementPayload();
        if (isMounted && payload) {
          setEngagement(payload);
        }
      } catch (err) {
        console.warn('Engagement sync notice:', err);
      }
    }

    loadEngagement();
    const intervalId = window.setInterval(loadEngagement, 60_000);
    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
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
  const applyBackgroundVideoSpeed = useCallback((video: HTMLVideoElement) => {
    video.playbackRate = BACKGROUND_VIDEO_PLAYBACK_RATE;
  }, []);

  // Bakgrundsvideo startas i index.html (desktop only). Här synkar vi bara playbackRate.
  useEffect(() => {
    const video = document.getElementById('site-bg-video') as HTMLVideoElement | null;
    if (!video) return;
    if (window.matchMedia('(max-width: 767px)').matches) return;
    applyBackgroundVideoSpeed(video);
    const onReady = () => applyBackgroundVideoSpeed(video);
    video.addEventListener('loadedmetadata', onReady);
    video.addEventListener('canplay', onReady);
    return () => {
      video.removeEventListener('loadedmetadata', onReady);
      video.removeEventListener('canplay', onReady);
    };
  }, [applyBackgroundVideoSpeed]);

  // Total GitHub download count across all repositories
  const totalLiveDownloads = useMemo(() => {
    return projects.reduce((sum, p) => sum + (p.downloadsCount || 0), 0);
  }, [projects]);

  // Bookmarks
  const [savedProjectIds, setSavedProjectIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_SAVED_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
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

  // Path routing: hub details at /p/:slug; root /RepoName is GitHub Pages project sites
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

      const parts = window.location.pathname.replace(/^\/+|\/+$/g, '').split('/');
      // Lowercase /sitescannerpro → /SiteScannerPro/ (GitHub Pages project site)
      if (parts.length === 1 && parts[0] && parts[0] !== 'p') {
        const fromRoot = findProjectBySlug(projects, parts[0]);
        if (fromRoot?.liveDemoUrl?.startsWith(window.location.origin)) {
          const repo = fromRoot.githubUrl.replace(/\/+$/, '').split('/').pop();
          if (repo && parts[0] !== repo) {
            window.location.replace(`/${repo}/`);
            return;
          }
        }
        // Short link /NewzLocal → project page (URL stays as typed)
        if (fromRoot && !fromRoot.liveDemoUrl?.startsWith(window.location.origin)) {
          setSelectedProject(fromRoot);
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
      bumpEngagement(project.id, 'stars');
    }
    // Open the GitHub Star dialog so the user can star it on GitHub too —
    // skipped for projects whose source repo is not public.
    if (!project.hideGithubLinks) {
      setStarModalProject(project);
      setStarModalOpen(true);
    }
  };

  const handleDownload = (project: Project, option: DownloadOption, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    bumpEngagement(project.id, 'downloads');
    triggerDirectDownload(project, option, (progressState) => {
      setActiveDownload(progressState);
    });
  };

  const handleLiveOpen = (project: Project, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    bumpEngagement(project.id, getLiveEngagementKind(project.projectType));
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
        const matchCategory = p.category.toLowerCase().includes(q) || localizeCategory(p.category).toLowerCase().includes(q);
        const matchFiles = p.downloadOptions.some((d) =>
          d.filename.toLowerCase().includes(q) || d.fileType.toLowerCase().includes(q)
        );
        if (!matchName && !matchDesc && !matchTag && !matchCategory && !matchFiles) {
          return false;
        }
      }

      return true;
    }).sort(compareProjects(selectedCategory, sortBy));
  }, [localizedProjects, selectedCategory, fileTypeFilter, searchQuery, sortBy, localizeCategory]);

  return (
    <div className="relative min-h-screen bg-transparent text-[#E0E0E0] selection:bg-blue-600 selection:text-white overflow-x-hidden max-w-full">

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
                onLiveOpen={handleLiveOpen}
                onCountDownload={(p) => bumpEngagement(p.id, 'downloads')}
                githubSynced={githubSynced}
                engagement={engagement}
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
          {/* Hero Section — text eager; Spline lazy desktop-only */}
          <section className="relative py-4 sm:py-5 md:py-7 lg:py-8 flex flex-col items-center px-2 min-w-0 max-w-full">
            <HudColumn />
            <div className="w-full max-w-5xl mx-auto min-w-0">
              <SplineSceneBasic
                hubTitle={t('hub.title')}
                subtitle={t('hub.subtitle')}
                downloadsLabel={t('hub.githubDownloads')}
                totalDownloads={githubSynced ? totalLiveDownloads : null}
                githubActivity={githubActivity}
              />
            </div>
          </section>

          {/* Showcase: one big card per project, one rail per category */}
          <ProjectShowcase projects={[...localizedProjects].sort(compareProjects('All', sortBy))} onSelect={handleSelectProject} />

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

          {/* Search results only: the showcase above already lists every project */}
          {searchQuery.trim() &&
            (filteredProjects.length === 0 ? (
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
              <section aria-label="Sökresultat" className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 gap-2 md:gap-2.5">
                {filteredProjects.map((project, index) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    githubSynced={githubSynced}
                    engagement={engagement}
                    onSelect={handleSelectProject}
                    isSaved={savedProjectIds.includes(project.id)}
                    onToggleSave={handleToggleSave}
                    isStarred={starredProjectIds.includes(project.id)}
                    onToggleStar={handleToggleStar}
                    onDownload={handleDownload}
                    onLiveOpen={handleLiveOpen}
                    onCountDownload={(p) => bumpEngagement(p.id, 'downloads')}
                    imagePriority={index < 2}
                  />
                ))}
              </section>
            ))}
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
