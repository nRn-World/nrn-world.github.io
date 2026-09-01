import React from 'react';
import { Search, Bookmark, Menu, X, Github } from 'lucide-react';
import { Project } from '../types';
import { useI18n } from '../i18n/context';
import { LanguageSwitcher } from './LanguageSwitcher';

interface NavbarProps {
  onSearchChange: (query: string) => void;
  searchQuery: string;
  savedProjects: string[];
  allProjects: Project[];
  onOpenSavedDrawer: () => void;
  onOpenDocs: () => void;
  onOpenConnect: () => void;
  onResetView: () => void;
  activeView: 'hub' | 'details';
}

export const Navbar: React.FC<NavbarProps> = ({
  onSearchChange,
  searchQuery,
  savedProjects,
  allProjects,
  onOpenSavedDrawer,
  onOpenDocs,
  onOpenConnect,
  onResetView,
  activeView,
}) => {
  const { t } = useI18n();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <nav className="fixed top-0 w-full z-50 bg-[#0D0D0D]/95 backdrop-blur-2xl border-b border-white/5 safe-area-top">
      <div className="flex justify-between items-center gap-2 sm:gap-4 h-14 sm:h-16 px-3 sm:px-4 md:px-8 max-w-[1440px] mx-auto">
        {/* Brand — always show full nRnWorld */}
        <button
          onClick={onResetView}
          className="flex items-center gap-2 sm:gap-2.5 text-left group cursor-pointer min-w-0 flex-1"
        >
          <img
            src="/logo.gif"
            alt=""
            aria-hidden
            className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg object-cover shadow-lg shadow-blue-900/20 group-hover:scale-105 transition-transform shrink-0"
          />
          <span className="text-[15px] sm:text-xl md:text-2xl font-black tracking-tight text-white leading-none whitespace-nowrap">
            n<span className="text-blue-500">R</span>n{t('navbar.brandWorld')}
          </span>
        </button>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-white/50 ml-4">
          <button
            onClick={onResetView}
            className={`pb-1 transition-colors cursor-pointer ${
              activeView === 'hub'
                ? 'text-white border-b-2 border-blue-500 font-semibold'
                : 'hover:text-white'
            }`}
          >
            {t('navbar.allProjects')}
          </button>
          <button
            onClick={onOpenDocs}
            className="hover:text-white transition-colors cursor-pointer"
          >
            {t('navbar.installationGuide')}
          </button>
          <button
            onClick={onOpenConnect}
            className="hover:text-white transition-colors cursor-pointer"
          >
            {t('navbar.creatorNetwork')}
          </button>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Active Projects Counter Badge */}
          <div className="hidden lg:flex items-center px-3.5 py-1.5 bg-white/5 rounded-full border border-white/10 text-xs text-white/70 font-mono">
            <span className="text-blue-400 font-bold mr-1.5">{allProjects.length}</span> {t('navbar.projects')}
          </div>

          {/* Quick Search Input */}
          <div className="hidden lg:flex items-center bg-[#1A1A1A] rounded-lg px-3 py-1.5 border border-white/10 focus-within:border-blue-500 transition-colors">
            <Search className="w-4 h-4 text-white/50 mr-2" />
            <input
              type="text"
              placeholder={t('navbar.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="bg-transparent border-none text-xs text-white placeholder:text-white/40 focus:outline-none w-40 font-mono"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="text-xs text-white/50 hover:text-white ml-1 font-mono"
              >
                ✕
              </button>
            )}
          </div>

          {/* GitHub Repositories Link */}
          <a
            href="https://github.com/nRn-World?tab=repositories"
            target="_blank"
            rel="noreferrer"
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 border border-white/10 text-xs font-mono tracking-wider hover:border-blue-500/50 hover:text-blue-400 transition-all"
            title={t('navbar.githubTitle')}
          >
            <Github className="w-3.5 h-3.5 text-white/70" />
            <span>{t('navbar.github')}</span>
          </a>

          {/* Bookmarked / Saved Items — desktop/tablet only */}
          <button
            onClick={onOpenSavedDrawer}
            className="relative hidden sm:flex p-1.5 sm:p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 transition-colors cursor-pointer shrink-0"
            title={t('navbar.saved')}
          >
            <Bookmark className="w-4 h-4" />
            {savedProjects.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[1rem] h-4 px-0.5 bg-blue-600 text-white text-[9px] font-mono rounded-full flex items-center justify-center font-bold leading-none ring-2 ring-[#0D0D0D]">
                {savedProjects.length}
              </span>
            )}
          </button>

          <LanguageSwitcher />

          {/* Connect Button — desktop only; mobile uses hamburger menu */}
          <button
            onClick={onOpenConnect}
            className="hidden md:flex p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-all text-xs font-bold px-4 items-center gap-2 cursor-pointer shadow-lg shadow-blue-900/20"
          >
            {t('navbar.contact')}
          </button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 sm:p-2 text-white/80 hover:bg-white/5 rounded-lg border border-white/5 shrink-0"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0D0D0D] border-b border-white/5 px-4 py-4 space-y-3">
          <div className="flex items-center bg-[#1A1A1A] rounded-lg px-3 py-2 border border-white/10">
            <Search className="w-4 h-4 text-white/50 mr-2" />
            <input
              type="text"
              placeholder={t('navbar.searchMobile')}
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="bg-transparent border-none text-sm text-white placeholder:text-white/40 focus:outline-none w-full font-mono"
            />
          </div>
          <div className="flex flex-col gap-2 pt-2 border-t border-white/5">
            <button
              onClick={() => {
                onResetView();
                setMobileMenuOpen(false);
              }}
              className="text-left text-blue-400 font-medium py-1.5 text-sm"
            >
              {t('navbar.allProjectsCount', { count: allProjects.length })}
            </button>
            <button
              onClick={() => {
                onOpenSavedDrawer();
                setMobileMenuOpen(false);
              }}
              className="text-left text-white/70 hover:text-white py-1.5 text-sm flex items-center gap-2"
            >
              <Bookmark className="w-4 h-4" />
              {t('navbar.saved')}
              {savedProjects.length > 0 && (
                <span className="ml-auto min-w-[1.25rem] h-5 px-1 bg-blue-600 text-white text-[10px] font-mono rounded-full flex items-center justify-center font-bold">
                  {savedProjects.length}
                </span>
              )}
            </button>
            <button
              onClick={() => {
                onOpenDocs();
                setMobileMenuOpen(false);
              }}
              className="text-left text-white/70 hover:text-white py-1.5 text-sm"
            >
              {t('navbar.mobileGuide')}
            </button>
            <a
              href="https://github.com/nRn-World?tab=repositories"
              target="_blank"
              rel="noreferrer"
              className="text-left text-white/70 hover:text-blue-400 py-1.5 text-sm flex items-center gap-2"
            >
              <Github className="w-4 h-4" />
              {t('navbar.mobileGithub')}
            </a>
            <button
              onClick={() => {
                onOpenConnect();
                setMobileMenuOpen(false);
              }}
              className="text-left text-white/70 hover:text-white py-1.5 text-sm"
            >
              {t('navbar.contact')}
            </button>
            <button
              onClick={() => {
                onOpenConnect();
                setMobileMenuOpen(false);
              }}
              className="text-left text-white/70 hover:text-white py-1.5 text-sm"
            >
              {t('navbar.creatorNetwork')}
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};
