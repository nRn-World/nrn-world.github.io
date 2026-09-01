export type ProjectCategory = 
  | 'All'
  | 'Windows'
  | 'Android'
  | 'Tools'
  | 'CLI'
  | 'AI'
  | 'Security'
  | 'Games';

export type PlatformBadge = 'WIN' | 'APK' | 'CLI' | 'TOOL' | 'CROSS' | 'LINUX' | 'MACOS' | 'WEB';

export interface DownloadOption {
  id: string;
  platform: 'Windows' | 'Android' | 'macOS' | 'Linux' | 'Universal';
  label: string;
  fileType: 'exe' | 'zip' | 'apk' | 'dmg' | 'AppImage' | 'deb' | 'tar.gz';
  size: string;
  filename: string;
  directUrl?: string;
  githubReleaseUrl?: string;
  md5Checksum: string;
  architecture?: string;
  isPrimary?: boolean;
  downloadCount?: number;
}

export interface TechnicalSpec {
  label: string;
  value: string;
  icon?: string;
}

export interface ChangelogEntry {
  version: string;
  date: string;
  items: string[];
  isCurrent?: boolean;
}

export interface Project {
  id: string;
  name: string;
  tagline: string;
  description: string;
  detailedAbout: string;
  version: string;
  releaseDate: string;
  category: ProjectCategory;
  platformBadge: PlatformBadge;
  featured?: boolean;
  rating?: number;
  downloadsCount: number;
  starsCount?: number;
  tags?: string[];
  liveDemoUrl?: string;
  projectType?: 'downloadable' | 'web_game' | 'web_app' | 'browser_extension' | 'github_repo';
  images: string[];
  downloadOptions: DownloadOption[];
  specs: TechnicalSpec[];
  changelog: ChangelogEntry[];
  githubUrl: string;
  license: string;
  maintainer: string;
  lastUpdated: string;
  githubPushedAt?: string;
  systemRequirements?: {
    os: string;
    ram: string;
    storage: string;
    runtime?: string;
  };
  isCustom?: boolean;
}

export interface FilterState {
  searchQuery: string;
  category: ProjectCategory;
  fileTypeFilter: 'all' | 'exe' | 'zip' | 'apk' | 'cli';
  sortBy: 'featured' | 'downloads' | 'newest' | 'name';
}
