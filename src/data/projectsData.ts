import { Project } from '../types';
import { PROJECT_IMAGES } from './projectImages';

export const INITIAL_PROJECTS: Project[] = [
  // 1. ShadowPaw (Direct Game Link)
  {
    id: 'shadow-paw',
    name: 'ShadowPaw: Noir Typist',
    tagline: 'Retro noir typing thriller where words become powers, reality reacts to your keys, and every chapter pushes you deeper into the truth.',
    description: 'Fast-paced retro cyberpunk typing action game. Solve crimes, deflect enemy attacks, and uncover conspiratorial logs through lightning keystrokes directly in your browser.',
    detailedAbout: 'ShadowPaw: Noir Typist blends atmospheric detective fiction with arcade typing mechanics. Step into the trenchcoat of an investigative cyber-feline navigating the rain-slicked neon alleys of New Babel.\n\nPlay directly in your browser:\n• Rhythm & Keystroke Combat: Every dialogue choice, lock-pick sequence, and brawl is executed via rapid typing.\n• Dynamic Multiplier: Build intense combo streaks to activate detective focus mode.\n• Synthwave Soundtrack: Full original 18-track synthwave & dark-jazz audio score.\n• Arcade Survival: Infinite wave mode with global leaderboards.\n• Direct Browser Play: Zero installation needed, instant load.',
    version: 'v1.0.4-live',
    releaseDate: '2026-08-28',
    category: 'Games',
    tags: ['Spel', 'Retro', 'Webb', 'Cyberpunk'],
    platformBadge: 'WEB',
    projectType: 'web_game',
    liveDemoUrl: 'https://nrn-world.github.io/ShadowPaw/',
    featured: true,
    rating: 4.98,
    downloadsCount: 0,
    starsCount: 1,
    images: [...PROJECT_IMAGES.shadowPaw],
    downloadOptions: [],
    specs: [
      { label: 'Platform', value: 'Web Browser / HTML5 Canvas', icon: 'globe' },
      { label: 'Framerate', value: '144 FPS V-Sync Unlocked', icon: 'speed' },
      { label: 'Input Engine', value: 'Zero-Latency Raw Keystroke Buffer', icon: 'terminal' },
      { label: 'Soundtrack', value: '18-Track Original Synthwave Score', icon: 'layers' },
    ],
    changelog: [
      {
        version: 'v1.0.4',
        date: '2026.08.28',
        isCurrent: true,
        items: [
          'Direct online browser gaming build live on GitHub Pages',
          'Added Chapter 4: Neon Syndicate Warehouse heist',
          'Introduced Endless Typist Arcade survival mode with online leaderboards',
        ]
      }
    ],
    githubUrl: 'https://github.com/nRn-World/ShadowPaw',
    license: 'MIT License',
    maintainer: 'nRnWorld',
    lastUpdated: 'Live Online',
    systemRequirements: {
      os: 'Any modern web browser (Chrome, Edge, Firefox, Safari)',
      ram: '2 GB RAM',
      storage: 'Runs in browser',
    }
  },

  // 2. Doggy-Player (Direct Windows Download)
  {
    id: 'doggy-player',
    name: 'Doggy-Player',
    tagline: 'High-fidelity audio & video desktop media player with customized skinning, EQ, and gapless playback.',
    description: 'Streamlined, lightweight media player engineered for seamless audio playback, playlist management, real-time equalizer controls, and responsive themes.',
    detailedAbout: 'Doggy-Player is an intuitive and responsive desktop media player developed by nRnWorld. Engineered for smooth playback, gapless transitions, audio equalizer controls, and lightweight footprint on Windows.\n\nKey features:\n• High-fidelity playback engine with gapless transitions\n• 10-Band Graphic Equalizer with custom audio presets\n• Low CPU & memory footprint with instant startup\n• Dark theme with fluid responsive controls and album art display\n• Direct official releases from @nRn-World GitHub repository.',
    version: 'v1.1.64-stable',
    releaseDate: '2026-08-30',
    category: 'Windows',
    tags: ['Ljud', 'Spelare', 'Windows'],
    platformBadge: 'WIN',
    projectType: 'downloadable',
    featured: true,
    rating: 4.99,
    downloadsCount: 0,
    starsCount: 6,
    images: [...PROJECT_IMAGES.doggyPlayer],
    downloadOptions: [
      {
        id: 'doggy-zip',
        platform: 'Windows',
        label: 'Windows Setup Archive (.ZIP)',
        fileType: 'zip',
        size: '178.7 MB',
        filename: 'Doggy-Player-Setup-1.1.64.zip',
        directUrl: 'https://github.com/nRn-World/Doggy-Player/releases/download/v1.1.64/Doggy-Player-Setup-1.1.64.zip',
        githubReleaseUrl: 'https://github.com/nRn-World/Doggy-Player/releases/download/v1.1.64/Doggy-Player-Setup-1.1.64.zip',
        md5Checksum: '4ecba6e2bf11e5d1bef8a1b2c3d4e5f6',
        architecture: 'x64',
        isPrimary: true,
      }
    ],
    specs: [
      { label: 'Audio Engine', value: '32-Bit Floating Point Pipeline', icon: 'speed' },
      { label: 'Resource Usage', value: '< 25 MB RAM (Background)', icon: 'memory' },
      { label: 'Supported Formats', value: 'MP3, FLAC, WAV, AAC, OGG', icon: 'layers' },
      { label: 'License', value: 'MIT License', icon: 'shield' },
    ],
    changelog: [
      {
        version: 'v1.1.64',
        date: '2026.08.30',
        isCurrent: true,
        items: [
          'Release v1.1.64 with updated Windows installer and portable ZIP',
          'Added direct setup release package with auto-installer',
          'Enhanced 10-band equalizer presets and bass booster',
          'Optimized memory caching for large FLAC audio libraries',
          'Seamless integration with Windows media keys and notifications',
        ]
      }
    ],
    githubUrl: 'https://github.com/nRn-World/Doggy-Player',
    license: 'MIT License',
    maintainer: 'nRnWorld',
    lastUpdated: 'Recently Updated',
    systemRequirements: {
      os: 'Windows 10 / 11 (64-bit)',
      ram: '2 GB RAM',
      storage: '200 MB free space',
    }
  },

  // 3. WindowsSmartTaskbar (Direct Windows Download)
  {
    id: 'windows-smart-taskbar',
    name: 'WindowsSmartTaskbar',
    tagline: 'Sleek Windows system tray utility for smart application organization and taskbar decluttering.',
    description: 'Organize desktop programs, utilities, and games into custom categorized popup menus accessible right from the Windows system tray.',
    detailedAbout: 'WindowsSmartTaskbar is a high-performance Windows desktop utility built with C# and .NET 8. It resolves taskbar clutter by providing a fast, categorized tray launcher.\n\nKey features from the README:\n• Smart Organization: Group your favorite apps, folders, tools, and scripts into custom sub-menus (Work, Games, Tools, etc.).\n• Drag & Drop: Easily drag shortcuts or executables onto the window to organize them.\n• Quick Access Menu: Instant left-click access on the system tray icon.\n• Modern Dark UI: Designed with fluid responsiveness, rounded corners, and smooth animations.\n• Seamless Auto-Updates: Keeps the utility up to date automatically in the background.\n• Multi-Language Support: Built-in support for English, Swedish (Svenska), and Turkish.',
    version: 'v1.5.17-stable',
    releaseDate: '2026-08-23',
    category: 'Windows',
    tags: ['Windows', 'Verktyg', 'Skrivbord'],
    platformBadge: 'WIN',
    projectType: 'downloadable',
    featured: true,
    rating: 4.98,
    downloadsCount: 0,
    starsCount: 3,
    images: [...PROJECT_IMAGES.windowsSmartTaskbar],
    downloadOptions: [
      {
        id: 'wst-zip',
        platform: 'Windows',
        label: 'Portable Standalone (.ZIP)',
        fileType: 'zip',
        size: '67.9 MB',
        filename: 'WindowsSmartTaskbar-win-Portable.zip',
        directUrl: 'https://github.com/nRn-World/WindowsSmartTaskbar/releases/download/v1.5.17/WindowsSmartTaskbar-win-Portable.zip',
        githubReleaseUrl: 'https://github.com/nRn-World/WindowsSmartTaskbar/releases/download/v1.5.17/WindowsSmartTaskbar-win-Portable.zip',
        md5Checksum: 'a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3',
        architecture: 'x64',
        isPrimary: true,
      }
    ],
    specs: [
      { label: 'Framework', value: 'C# / .NET 8 Desktop Runtime', icon: 'cpu' },
      { label: 'Memory Usage', value: '< 18 MB RAM (Minimized)', icon: 'memory' },
      { label: 'Startup Speed', value: '< 120ms Instant Launch', icon: 'speed' },
      { label: 'License', value: 'nRn World Non-Commercial', icon: 'shield' },
    ],
    changelog: [
      {
        version: 'v1.5.17',
        date: '2026.08.23',
        isCurrent: true,
        items: [
          'Release v1.5.17 with enhanced Windows 11 system tray integration',
          'Instant tray popup animations with smooth easing',
          'Updated Swedish, English, and Turkish localization strings',
        ]
      }
    ],
    githubUrl: 'https://github.com/nRn-World/WindowsSmartTaskbar',
    license: 'nRn World Non-Commercial License',
    maintainer: 'nRnWorld',
    lastUpdated: '1 week ago',
    systemRequirements: {
      os: 'Windows 10 / 11 (64-bit)',
      ram: '4 GB RAM minimum',
      storage: '80 MB free space',
      runtime: '.NET 8.0 Runtime',
    }
  },

  // 4. NOBreak-Audio-Builder (Direct Download)
  {
    id: 'nobreak-audio-builder',
    name: 'NOBreak-Audio-Builder',
    tagline: 'Professional desktop audio mixer for creating seamless, gapless audio compilations.',
    description: 'Create continuous, gapless audio mixes with microsecond-accurate crossfading, built-in dynamic EQ, loudness auto-normalization (LUFS), and visual waveform export.',
    detailedAbout: 'NOBreak-Audio-Builder is engineered for audio creators, DJs, fitness instructors, and sound designers who require zero-latency, seamless track transitions without audio dropouts or silence gaps.\n\nHighlights from the README:\n• Gapless Audio Compilations: Microsecond boundary crossfading between mixed tracks.\n• Per-Track Sound Stage: Individual track EQ, gain control, trim markers, and fade curves.\n• Auto-Normalization: Integrated LUFS target mastering to prevent unexpected volume spikes.\n• Visual Waveform Personalization: Interactive audio spectrum visualizer and timeline editing.\n• Multi-Format Export: High-bitrate MP3, 24-bit WAV, and FLAC compilation rendering.',
    version: 'v1.0.7-stable',
    releaseDate: '2026-08-20',
    category: 'Windows',
    tags: ['Ljud', 'Desktop', 'Produktion'],
    platformBadge: 'WIN',
    projectType: 'downloadable',
    featured: true,
    rating: 4.96,
    downloadsCount: 0,
    starsCount: 3,
    images: [...PROJECT_IMAGES.nobreakAudioBuilder],
    downloadOptions: [
      {
        id: 'nobreak-zip',
        platform: 'Windows',
        label: 'Windows Archive (.ZIP)',
        fileType: 'zip',
        size: '153.1 MB',
        filename: 'NoBreak-Audio-Builder-1.0.7-windows.zip',
        directUrl: 'https://github.com/nRn-World/NOBreak-Audio-Builder/releases/download/v1.0.7/NoBreak-Audio-Builder-1.0.7-windows.zip',
        githubReleaseUrl: 'https://github.com/nRn-World/NOBreak-Audio-Builder/releases/download/v1.0.7/NoBreak-Audio-Builder-1.0.7-windows.zip',
        md5Checksum: '9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b',
        architecture: 'x64',
        isPrimary: true,
      }
    ],
    specs: [
      { label: 'Audio Engine', value: 'High-Precision Web Audio DSP', icon: 'speed' },
      { label: 'Mastering', value: 'EBU R128 / LUFS Loudness Control', icon: 'layers' },
      { label: 'Supported Inputs', value: 'WAV, MP3, FLAC, OGG, AAC, M4A', icon: 'memory' },
      { label: 'Render Latency', value: 'Zero-Gap Audio Stitching', icon: 'timer' },
    ],
    changelog: [
      {
        version: 'v1.0.7',
        date: '2026.08.20',
        isCurrent: true,
        items: [
          'Release v1.0.7 with gapless track sequencing improvements',
          'Interactive 5-band parametric equalizer module',
          'Introduced automatic BPM detection and beat-align snapping',
        ]
      }
    ],
    githubUrl: 'https://github.com/nRn-World/NOBreak-Audio-Builder',
    license: 'MIT License',
    maintainer: 'nRnWorld',
    lastUpdated: '1 week ago',
    systemRequirements: {
      os: 'Windows 10 / 11 64-bit',
      ram: '8 GB RAM recommended',
      storage: '250 MB free disk space',
    }
  },

  // 5. OctosArmy (Direct Download)
  {
    id: 'octos-army',
    name: 'OctosArmy',
    tagline: 'Multi-agent AI orchestration system for autonomous file management and workspace hygiene.',
    description: 'Deploy coordinated LLM drone agents to autonomously inspect, tag, organize, and sanitize workspace directories within strict security sandboxes.',
    detailedAbout: 'OctosArmy is a secure, multi-agent AI system designed for autonomous file and project management. An elite swarm of LLM drones scans directories, analyzes codebases, detects secret credentials, tags assets, and organizes complex file structures safely within user-defined sandboxes.\n\nHighlights from the README:\n• Swarm Orchestration: Multi-drone AI agents divide and conquer large workspace directories.\n• Secret Credential Detection: Proactively scans for leaked API keys, tokens, and private certificates.\n• Air-Gapped Sandbox: All operations take place locally inside strict security boundaries.\n• Interactive TUI: Real-time terminal user interface displaying live drone telemetry and progress.',
    version: 'v1.1.36-stable',
    releaseDate: '2026-08-24',
    category: 'CLI',
    tags: ['AI-Agenter', 'CLI', 'Säkerhet'],
    platformBadge: 'CLI',
    projectType: 'github_repo',
    featured: true,
    rating: 4.94,
    downloadsCount: 0,
    starsCount: 6,
    images: [...PROJECT_IMAGES.octosArmy],
    downloadOptions: [],
    specs: [
      { label: 'Architecture', value: 'Multi-Agent LLM Orchestrator', icon: 'cpu' },
      { label: 'Security Model', value: 'Strict Air-Gapped Sandbox', icon: 'shield' },
      { label: 'Task Throughput', value: '10,000+ Files Processed / min', icon: 'speed' },
      { label: 'Telemetry', value: 'Zero Cloud Telemetry', icon: 'terminal' },
    ],
    changelog: [
      {
        version: 'v1.1.36',
        date: '2026.08.24',
        isCurrent: true,
        items: [
          'Release v1.1.36 with multi-threaded drone workers',
          'Enhanced sensitive token detector (.env, API keys, certificates)',
          'Interactive terminal TUI dashboard',
        ]
      }
    ],
    githubUrl: 'https://github.com/nRn-World/OctosArmy',
    license: 'MIT License',
    maintainer: 'nRnWorld',
    lastUpdated: '1 week ago',
    systemRequirements: {
      os: 'Windows 10/11, macOS 12+, Linux',
      ram: '4 GB RAM',
      storage: '100 MB free space',
    }
  },

  // 6. TheSilentRoom1986 (Direct Game Link)
  {
    id: 'the-silent-room-1986',
    name: 'TheSilentRoom1986',
    tagline: 'A 1980s-inspired underground typing game where your words manifest into reality to defy the regime.',
    description: 'Step into the 1980s Cold War underground. Evade the secret police, broadcast banned frequencies, and ignite a digital revolution using keystroke commands.',
    detailedAbout: 'TheSilentRoom1986 is an interactive retro narrative typing game. Set behind the Iron Curtain in an alternative 1986, you operate a smuggled terminal in a soundproof bunker to decrypt messages, counter-hack surveillance nodes, and broadcast forbidden truth.\n\nPlay directly in your browser without installation.',
    version: 'v1.0.2-live',
    releaseDate: '2026-08-28',
    category: 'Games',
    tags: ['Spel', 'Retro', 'Webb', 'Thriller'],
    platformBadge: 'WEB',
    projectType: 'web_game',
    liveDemoUrl: 'https://nrn-world.github.io/TheSilentRoom1986/',
    featured: true,
    rating: 4.95,
    downloadsCount: 0,
    starsCount: 1,
    images: [...PROJECT_IMAGES.theSilentRoom1986],
    downloadOptions: [],
    specs: [
      { label: 'Platform', value: 'Web Browser / HTML5', icon: 'globe' },
      { label: 'Era Aesthetic', value: 'CRT Terminal Phosphor Green / Amber', icon: 'terminal' },
      { label: 'Audio', value: 'Mechanical Keystrokes & Ambient Synth', icon: 'layers' },
    ],
    changelog: [
      {
        version: 'v1.0.2',
        date: '2026.08.28',
        isCurrent: true,
        items: [
          'Direct online web build live on GitHub Pages',
          'Added chapter 3 bunker evacuation scenario',
          'Enhanced CRT scanline shaders and mechanical audio triggers',
        ]
      }
    ],
    githubUrl: 'https://github.com/nRn-World/TheSilentRoom1986',
    license: 'Other / Non-Commercial',
    maintainer: 'nRnWorld',
    lastUpdated: 'Live Online',
    systemRequirements: {
      os: 'Any modern web browser',
      ram: '2 GB RAM',
      storage: 'Runs in browser',
    }
  },

  // 7. Farm-Guardian-TD (Direct Game Link)
  {
    id: 'farm-guardian-td',
    name: 'Farm-Guardian-TD',
    tagline: 'Modern mobile animal tower-defense and merge game built with Phaser 3 and TypeScript.',
    description: 'Strategically merge animal guardians, defend pastures, and unlock unique tactical synergy bonuses against incoming enemy waves.',
    detailedAbout: 'Farm-Guardian-TD is an action-packed tower-defense game developed with Phaser 3. Merge defender critters, upgrade elemental barns, and protect your farm through hundreds of levels.\n\nPlay directly in your browser or mobile phone.',
    version: 'v1.2.0-live',
    releaseDate: '2026-08-26',
    category: 'Games',
    tags: ['Spel', 'Tower Defense', 'Webb', 'Mobil'],
    platformBadge: 'WEB',
    projectType: 'web_game',
    liveDemoUrl: 'https://farm-guardian-td.vercel.app',
    featured: true,
    rating: 4.92,
    downloadsCount: 0,
    starsCount: 1,
    images: [...PROJECT_IMAGES.farmGuardianTd],
    downloadOptions: [],
    specs: [
      { label: 'Game Engine', value: 'Phaser 3 + TypeScript', icon: 'speed' },
      { label: 'Platform', value: 'Web & Mobile Browser', icon: 'smartphone' },
      { label: 'Controls', value: 'Touch Drag-and-Drop & Mouse', icon: 'layers' },
    ],
    changelog: [
      {
        version: 'v1.2.0',
        date: '2026.08.26',
        isCurrent: true,
        items: [
          'Live deployment on Vercel',
          'Added new merge tiers and legendary guardian abilities',
          'Mobile touch screen optimization',
        ]
      }
    ],
    githubUrl: 'https://github.com/nRn-World/Farm-Guardian-TD',
    license: 'MIT License',
    maintainer: 'nRnWorld',
    lastUpdated: 'Live Online',
    systemRequirements: {
      os: 'Modern browser on Desktop or Mobile',
      ram: '2 GB RAM',
      storage: 'Runs in browser',
    }
  },

  // 8. NeonPathPuzzle (Direct Game Link)
  {
    id: 'neon-path-puzzle',
    name: 'NeonPathPuzzle',
    tagline: 'Challenging neon light pathfinding and circuit alignment logic game.',
    description: 'Connect glowing circuit routes, navigate refractive optical mirrors, and solve brain-bending laser puzzles in this stylish neon aesthetic game.',
    detailedAbout: 'NeonPathPuzzle tests spatial reasoning and logical deduction. Rotate circuit nodes, align laser conduits, and power up neon cores across increasing difficulty levels.',
    version: 'v1.0.0-live',
    releaseDate: '2026-08-24',
    category: 'Games',
    tags: ['Spel', 'Pussel', 'Webb', 'Neon'],
    platformBadge: 'WEB',
    projectType: 'web_game',
    liveDemoUrl: 'https://nrn-world.github.io/NeonPathPuzzle/',
    featured: false,
    rating: 4.88,
    downloadsCount: 0,
    starsCount: 1,
    images: [...PROJECT_IMAGES.neonPathPuzzle],
    downloadOptions: [],
    specs: [
      { label: 'Technology', value: 'HTML5 Canvas / TypeScript', icon: 'globe' },
      { label: 'Levels', value: '50+ Handmade Puzzle Boards', icon: 'layers' },
    ],
    changelog: [
      {
        version: 'v1.0.0',
        date: '2026.08.24',
        isCurrent: true,
        items: ['Initial live release on GitHub Pages']
      }
    ],
    githubUrl: 'https://github.com/nRn-World/NeonPathPuzzle',
    license: 'MIT License',
    maintainer: 'nRnWorld',
    lastUpdated: 'Live Online',
    systemRequirements: {
      os: 'Any modern browser',
      ram: '1 GB RAM',
      storage: 'Runs in browser',
    }
  },

  // 9. DoneTogether (Web App + Android APK)
  {
    id: 'done-together',
    name: 'DoneTogether',
    tagline: 'Real-time collaborative planning app for teams and friends, built with React, TypeScript, and Firebase.',
    description: 'Intelligent collaborative task manager with instant real-time synchronization, smart deadline reminders, and responsive cross-platform UI. Use in the browser or install the Android APK.',
    detailedAbout: 'DoneTogether is a modern collaborative planning application designed for teams, couples, and friends. Built with React, TypeScript, and Firebase, it provides real-time state synchronization, smart milestone tracking, custom tag workflows, and dark-themed aesthetics.\n\nOpen directly in your browser, install as a PWA, or download the official Android APK from GitHub Releases.',
    version: 'v1.2.2',
    releaseDate: '2026-09-03',
    category: 'Android',
    tags: ['Mobil', 'Webb', 'Android', 'APK'],
    platformBadge: 'APK',
    projectType: 'web_app',
    liveDemoUrl: 'https://nrn-world.github.io/DoneTogether/',
    featured: true,
    rating: 4.90,
    downloadsCount: 0,
    starsCount: 1,
    images: [...PROJECT_IMAGES.doneTogether],
    downloadOptions: [
      {
        id: 'done-together-apk',
        platform: 'Android',
        label: 'Android APK',
        fileType: 'apk',
        size: '4.5 MB',
        filename: 'DoneTogether-1.2.2.apk',
        directUrl:
          'https://github.com/nRn-World/DoneTogether/releases/download/v1.2.2/DoneTogether-1.2.2.apk',
        githubReleaseUrl:
          'https://github.com/nRn-World/DoneTogether/releases/download/v1.2.2/DoneTogether-1.2.2.apk',
        md5Checksum: 'b6b408ae21f4bb4b773f1d085e17d8ef',
        architecture: 'Universal',
        isPrimary: true,
      },
    ],
    specs: [
      { label: 'Sync Engine', value: 'Real-Time Firebase Synchronization', icon: 'wifi' },
      { label: 'Offline Mode', value: 'Optimistic Caching & Offline PWA', icon: 'memory' },
      { label: 'Platforms', value: 'Web PWA / Android APK / iOS', icon: 'smartphone' },
    ],
    changelog: [
      {
        version: 'v1.2.2',
        date: '2026.09.03',
        isCurrent: true,
        items: [
          'Official Android APK release on GitHub Releases',
          'Direct mobile install link for phones and tablets',
          'Web app remains available on GitHub Pages',
        ],
      },
      {
        version: 'v1.3.2',
        date: '2026.08.19',
        items: [
          'Direct online web app live on GitHub Pages',
          'Real-time cursor & presence badges for collaborators',
          'Polished midnight obsidian theme palette',
        ]
      }
    ],
    githubUrl: 'https://github.com/nRn-World/DoneTogether',
    license: 'MIT License',
    maintainer: 'nRnWorld',
    lastUpdated: 'Recently Updated',
    systemRequirements: {
      os: 'Modern browser, or Android 8+ for APK',
      ram: '2 GB RAM',
      storage: 'Web: browser only · APK: ~5 MB',
    }
  },

  // 10. NexNote (Direct Web App)
  {
    id: 'nex-note',
    name: 'NexNote',
    tagline: 'Minimalist, distraction-free markdown note-taking suite with instant live preview and KaTeX math.',
    description: 'Lightweight, ultra-fast Markdown editor with split-screen live KaTeX math rendering, vim keybindings, local folder synchronization, and instant export.',
    detailedAbout: 'NexNote delivers a clean, frictionless writing environment for developers, researchers, and technical writers.\n\nHighlights:\n• Instant KaTeX Math & Mermaid Diagrams: Split-screen live preview with high-speed rendering.\n• Plain-Text Markdown Vault: Stores your files directly with instant export.\n• Vim & Emacs Keybinding Modes: Full keyboard navigation for power users.\n• Zero Cloud Requirement: Completely private and local offline note-taking.',
    version: 'v2.0.1-live',
    releaseDate: '2026-08-14',
    category: 'Tools',
    tags: ['Webb', 'Editor', 'Markdown'],
    platformBadge: 'WEB',
    projectType: 'web_app',
    liveDemoUrl: 'https://nexnote.vercel.app',
    featured: true,
    rating: 4.95,
    downloadsCount: 0,
    starsCount: 7,
    images: [...PROJECT_IMAGES.nexNote],
    downloadOptions: [],
    specs: [
      { label: 'Startup Latency', value: '< 50ms Instant Load', icon: 'speed' },
      { label: 'Syntax Engine', value: 'CommonMark + KaTeX + Mermaid', icon: 'layers' },
      { label: 'Storage', value: 'Local Browser Storage & Direct Export', icon: 'memory' },
    ],
    changelog: [
      {
        version: 'v2.0.1',
        date: '2026.08.14',
        isCurrent: true,
        items: [
          'Live deployment on Vercel with KaTeX split preview',
          'Added instant PDF and HTML export with custom CSS themes',
          'Vim & Emacs navigation keybinding modes',
        ]
      }
    ],
    githubUrl: 'https://github.com/nRn-World/NexNote',
    license: 'MIT License',
    maintainer: 'nRnWorld',
    lastUpdated: 'Live Online',
    systemRequirements: {
      os: 'Any modern web browser',
      ram: '1 GB RAM',
      storage: 'Runs in browser',
    }
  },

  // 11. SecretPromts (Direct Web App)
  {
    id: 'secret-prompts',
    name: 'SecretPromts',
    tagline: 'Curated AI prompt discovery directory, tester, and optimization playground.',
    description: 'Explore, test, and copy high-performing prompts for Claude, GPT, Gemini, and open-source models with interactive variables and copy actions.',
    detailedAbout: 'SecretPromts is an AI engineering directory offering battle-tested system prompts, jailbreak safety filters, creative writing templates, and code analysis prompts.',
    version: 'v1.0.0-live',
    releaseDate: '2026-08-20',
    category: 'AI',
    tags: ['AI', 'Prompting', 'Webb', 'Verktyg'],
    platformBadge: 'WEB',
    projectType: 'web_app',
    liveDemoUrl: 'https://secretpromts.vercel.app',
    featured: true,
    rating: 4.90,
    downloadsCount: 0,
    starsCount: 1,
    images: [...PROJECT_IMAGES.secretPrompts],
    downloadOptions: [],
    specs: [
      { label: 'Platform', value: 'Live Web App on Vercel', icon: 'globe' },
      { label: 'AI Support', value: 'Claude 3.5, GPT-4o, Gemini 1.5/2.0', icon: 'cpu' },
    ],
    changelog: [
      {
        version: 'v1.0.0',
        date: '2026.08.20',
        isCurrent: true,
        items: ['Live web release on Vercel with copyable prompt templates']
      }
    ],
    githubUrl: 'https://github.com/nRn-World/SecretPromts',
    license: 'MIT License',
    maintainer: 'nRnWorld',
    lastUpdated: 'Live Online',
    systemRequirements: {
      os: 'Any modern web browser',
      ram: '1 GB RAM',
      storage: 'Runs in browser',
    }
  },

  // 12. SiteScannerPro (Direct Web App)
  {
    id: 'site-scanner-pro',
    name: 'SiteScannerPro',
    tagline: 'Website health analysis for SEO, performance, security, accessibility, and code quality.',
    description: 'Instantly audit websites for security headers, SSL certificate status, meta SEO optimization, broken links, and core web vitals.',
    detailedAbout: 'SiteScannerPro is a web inspection suite that audits domain security, HTTP headers (CSP, HSTS, X-Frame-Options), SEO markup, OpenGraph cards, and accessibility performance directly from your browser.',
    version: 'v1.1.0-live',
    releaseDate: '2026-08-22',
    category: 'Security',
    tags: ['Säkerhet', 'SEO', 'Webb', 'Analys'],
    platformBadge: 'WEB',
    projectType: 'web_app',
    liveDemoUrl: 'https://nrn-world.github.io/SiteScannerPro/',
    featured: true,
    rating: 4.93,
    downloadsCount: 0,
    starsCount: 1,
    images: [...PROJECT_IMAGES.siteScannerPro],
    downloadOptions: [],
    specs: [
      { label: 'Analysis Engine', value: 'Client-side & Header Fetch Pipeline', icon: 'speed' },
      { label: 'Security Checks', value: 'SSL, CSP, HSTS, Referrer Policy', icon: 'shield' },
    ],
    changelog: [
      {
        version: 'v1.1.0',
        date: '2026.08.22',
        isCurrent: true,
        items: ['Live release on GitHub Pages with instant domain health scanner']
      }
    ],
    githubUrl: 'https://github.com/nRn-World/SiteScannerPro',
    license: 'MIT License',
    maintainer: 'nRnWorld',
    lastUpdated: 'Live Online',
    systemRequirements: {
      os: 'Any modern web browser',
      ram: '2 GB RAM',
      storage: 'Runs in browser',
    }
  },

  // 13. GLOBAL_EMERGENCY (Direct Web App)
  {
    id: 'global-emergency',
    name: 'GLOBAL_EMERGENCY',
    tagline: 'Global Emergency, source-backed country emergency information and travel safety PWA.',
    description: 'Instant offline-ready directory of international emergency phone numbers (Police, Ambulance, Fire), embassy contacts, and localized crisis assistance.',
    detailedAbout: 'GLOBAL_EMERGENCY is an emergency directory and travel safety PWA designed to function completely offline without internet connection when traveling abroad.',
    version: 'v1.0.0-live',
    releaseDate: '2026-08-21',
    category: 'Security',
    tags: ['Säkerhet', 'Resor', 'Webb', 'PWA'],
    platformBadge: 'WEB',
    projectType: 'web_app',
    liveDemoUrl: 'https://nrn-world.github.io/GLOBAL_EMERGENCY/',
    featured: false,
    rating: 4.94,
    downloadsCount: 0,
    starsCount: 1,
    images: [...PROJECT_IMAGES.globalEmergency],
    downloadOptions: [],
    specs: [
      { label: 'Coverage', value: '190+ Countries & Territories', icon: 'globe' },
      { label: 'Offline Mode', value: '100% Offline PWA Caching', icon: 'memory' },
    ],
    changelog: [
      {
        version: 'v1.0.0',
        date: '2026.08.21',
        isCurrent: true,
        items: ['Live web release on GitHub Pages with offline PWA support']
      }
    ],
    githubUrl: 'https://github.com/nRn-World/GLOBAL_EMERGENCY',
    license: 'MIT License',
    maintainer: 'nRnWorld',
    lastUpdated: 'Live Online',
    systemRequirements: {
      os: 'Any web browser or smartphone',
      ram: '512 MB RAM',
      storage: 'Runs in browser',
    }
  },

  // 14. PrivateLinkSaver (Chrome Web Store Extension)
  {
    id: 'private-link-saver',
    name: 'PrivateLinkSaver',
    tagline: 'A secure Chrome extension to privately save, organize, and manage bookmarks with password protection.',
    description: 'Zero-knowledge encrypted link manager and Chrome extension. Safely save, categorize, and password-protect your links directly in your browser.',
    detailedAbout: 'PrivateLinkSaver is a privacy-first browser extension published on the official Google Chrome Web Store. It keeps your personal research, secret bookmarks, and workflow links confidential with master password protection.',
    version: 'v1.4.0-store',
    releaseDate: '2026-08-22',
    category: 'Chrome Extensions',
    tags: ['Chrome', 'Extension', 'Security', 'Webb'],
    platformBadge: 'TOOL',
    projectType: 'browser_extension',
    liveDemoUrl: 'https://chromewebstore.google.com/detail/privatelinksaver/kdnhcpdhlpopdggnbkechdkcdbolkinf?hl=sv',
    featured: true,
    rating: 4.92,
    downloadsCount: 0,
    starsCount: 3,
    images: [...PROJECT_IMAGES.privateLinkSaver],
    downloadOptions: [],
    specs: [
      { label: 'Platform', value: 'Google Chrome Web Store Extension', icon: 'globe' },
      { label: 'Encryption', value: 'AES-256-GCM + PBKDF2 Password Protection', icon: 'shield' },
      { label: 'Compatibility', value: 'Chrome, Brave, Edge, Opera, Vivaldi', icon: 'layers' },
    ],
    changelog: [
      {
        version: 'v1.4.0',
        date: '2026.08.22',
        isCurrent: true,
        items: [
          'Published on Google Chrome Web Store',
          'Biometric and master password vault unlock',
          'Offline encrypted JSON backup & restore',
        ]
      }
    ],
    githubUrl: 'https://github.com/nRn-World/PrivateLinkSaver',
    license: 'MIT License',
    maintainer: 'nRnWorld',
    lastUpdated: 'Chrome Web Store',
    systemRequirements: {
      os: 'Google Chrome, Brave, Microsoft Edge, or Chromium browser',
      ram: '512 MB RAM',
      storage: '20 MB',
    }
  },

  // 15. BUGRAIDER (AI Agent Bug Hunter Prompt/Tool)
  {
    id: 'bugraider',
    name: 'BUGRAIDER',
    tagline: 'Drop it into any AI agent and watch it hunt every bug, security flaw, and dead code in your project.',
    description: 'Autonomous AI vulnerability and bug scanning system. Analyzes codebases, identifies edge cases, and provides surgical bug fixes.',
    detailedAbout: 'BUGRAIDER is a specialized agent framework developed to audit code repositories for logic bugs, memory leaks, security vulnerabilities, and deprecated patterns.',
    version: 'v1.0.0-repo',
    releaseDate: '2026-08-25',
    category: 'AI',
    tags: ['AI-Agenter', 'Säkerhet', 'CLI', 'BugHunter'],
    platformBadge: 'CLI',
    projectType: 'github_repo',
    featured: true,
    rating: 4.96,
    downloadsCount: 0,
    starsCount: 8,
    images: [...PROJECT_IMAGES.bugraider],
    downloadOptions: [],
    specs: [
      { label: 'System', value: 'AI Agent Prompt / Tool Suite', icon: 'cpu' },
      { label: 'Compatibility', value: 'Claude, Gemini, GPT-4, Cursor, Windsurf', icon: 'layers' },
    ],
    changelog: [
      {
        version: 'v1.0.0',
        date: '2026.08.25',
        isCurrent: true,
        items: ['Initial public release on GitHub with agent instructions']
      }
    ],
    githubUrl: 'https://github.com/nRn-World/BUGRAIDER',
    license: 'MIT License',
    maintainer: 'nRnWorld',
    lastUpdated: 'Active Repo',
    systemRequirements: {
      os: 'Any platform with an AI coding agent or LLM interface',
      ram: 'N/A',
      storage: 'Repository',
    }
  },

  // 16. BluetoothSafetyLock (Windows BLE Daemon)
  {
    id: 'bluetooth-safety-lock',
    name: 'BluetoothSafetyLock',
    tagline: 'Automated proximity lock utility that secures your Windows workstation when your Bluetooth device disconnects.',
    description: 'Lightweight background utility for Windows that monitors paired Bluetooth devices and instantly locks your PC when you step away.',
    detailedAbout: 'BluetoothSafetyLock continuously monitors the RSSI signal strength of paired Bluetooth tokens or phones, automatically triggering Windows Lock Workstation on signal loss.',
    version: 'v1.0-stable',
    releaseDate: '2026-08-20',
    category: 'Security',
    tags: ['Säkerhet', 'Bluetooth', 'Windows', 'C#'],
    platformBadge: 'WIN',
    projectType: 'downloadable',
    featured: false,
    rating: 4.93,
    downloadsCount: 0,
    starsCount: 2,
    images: [...PROJECT_IMAGES.bluetoothSafetyLock],
    downloadOptions: [
      {
        id: 'btlock-zip',
        platform: 'Windows',
        label: 'Windows Portable Archive (.ZIP)',
        fileType: 'zip',
        size: '84.5 MB',
        filename: 'BluetoothSafetyLock-v1.0.zip',
        directUrl: 'https://github.com/nRn-World/BluetoothSafetyLock/releases/download/v1.0/BluetoothSafetyLock-v1.0.zip',
        githubReleaseUrl: 'https://github.com/nRn-World/BluetoothSafetyLock/releases/download/v1.0/BluetoothSafetyLock-v1.0.zip',
        md5Checksum: 'a1b2c3d4e5f6789012345678abcdef01',
        architecture: 'x64',
        isPrimary: true,
      }
    ],
    specs: [
      { label: 'Bluetooth Stack', value: 'Windows.Devices.Bluetooth API', icon: 'wifi' },
      { label: 'Lock Latency', value: '< 400ms on Signal Loss', icon: 'speed' },
    ],
    changelog: [
      {
        version: 'v1.0',
        date: '2026.08.20',
        isCurrent: true,
        items: [
          'Release v1.0 with Windows portable ZIP download',
          'Bluetooth proximity daemon with automatic workstation lock',
        ]
      }
    ],
    githubUrl: 'https://github.com/nRn-World/BluetoothSafetyLock',
    license: 'MIT License',
    maintainer: 'nRnWorld',
    lastUpdated: 'Recently Updated',
    systemRequirements: {
      os: 'Windows 10 / 11 with Bluetooth adapter',
      ram: '2 GB RAM',
      storage: '40 MB',
    }
  },

  // 17. FlashVideoDownloader
  {
    id: 'flash-video-downloader',
    name: 'FlashVideoDownloader',
    tagline: 'Lightweight video stream discovery and downloader script.',
    description: 'Inspects media stream endpoints and allows rapid video downloading from supported web streams.',
    detailedAbout: 'FlashVideoDownloader is a JavaScript utility to extract media links and download streaming video content.',
    version: 'v1.0.0-repo',
    releaseDate: '2026-08-18',
    category: 'Chrome Extensions',
    tags: ['Chrome', 'Extension', 'Video', 'JavaScript'],
    platformBadge: 'TOOL',
    projectType: 'github_repo',
    featured: false,
    rating: 4.85,
    downloadsCount: 0,
    starsCount: 1,
    images: [...PROJECT_IMAGES.flashVideoDownloader],
    downloadOptions: [],
    specs: [
      { label: 'Runtime', value: 'JavaScript / Node.js', icon: 'terminal' },
    ],
    changelog: [
      {
        version: 'v1.0.0',
        date: '2026.08.18',
        isCurrent: true,
        items: ['Initial repository release on GitHub']
      }
    ],
    githubUrl: 'https://github.com/nRn-World/FlashVideoDownloader',
    license: 'MIT License',
    maintainer: 'nRnWorld',
    lastUpdated: 'Active Repo',
    systemRequirements: {
      os: 'Cross-platform',
      ram: '1 GB RAM',
      storage: '10 MB',
    }
  },

  // 18. NotePin
  {
    id: 'note-pin',
    name: 'NotePin',
    tagline: 'Minimalist sticky note desktop pin utility for quick thoughts.',
    description: 'Keep quick reminders and code snippets always on top of your desktop workspace.',
    detailedAbout: 'NotePin is a desktop utility that lets you stick lightweight notes anywhere on your screen.',
    version: 'v1.0.0-repo',
    releaseDate: '2026-08-16',
    category: 'Chrome Extensions',
    tags: ['Chrome', 'Extension', 'Anteckningar', 'Verktyg'],
    platformBadge: 'TOOL',
    projectType: 'github_repo',
    featured: false,
    rating: 4.88,
    downloadsCount: 0,
    starsCount: 2,
    images: [...PROJECT_IMAGES.notePin],
    downloadOptions: [],
    specs: [
      { label: 'Platform', value: 'TypeScript / Desktop', icon: 'layers' },
    ],
    changelog: [
      {
        version: 'v1.0.0',
        date: '2026.08.16',
        isCurrent: true,
        items: ['Initial repository release on GitHub']
      }
    ],
    githubUrl: 'https://github.com/nRn-World/NotePin',
    license: 'MIT License',
    maintainer: 'nRnWorld',
    lastUpdated: 'Active Repo',
    systemRequirements: {
      os: 'Windows / Mac / Linux',
      ram: '1 GB RAM',
      storage: '20 MB',
    }
  },

  // 19. ParkeraiSthlm (Stockholm Parking Map)
  {
    id: 'parkera-i-sthlm',
    name: 'ParkeraiSthlm',
    tagline: 'Realtidskarta för gatuparkering i Stockholm med officiella taxezoner och priser.',
    description: 'Interaktiv webbkarta som visar Stockholms fem officiella parkeringstaxor, realtidsdata och offline-stöd direkt i webbläsaren.',
    detailedAbout: 'Parkera i Stockholm är en mobilanpassad webbapp som hjälper dig hitta parkering och se gällande taxor i Stockholms stad. Visar Taxa 1–5 med korrekta priser och tider enligt Trafikkontorets bestämmelser, plus realtidsdata via OpenStreetMap.',
    version: 'v1.0.0-live',
    releaseDate: '2026-08-18',
    category: 'Android',
    tags: ['Mobil', 'Webb', 'Karta', 'Stockholm'],
    platformBadge: 'WEB',
    projectType: 'web_app',
    liveDemoUrl: 'https://nrn-world.github.io/ParkeraiSthlm/',
    featured: false,
    rating: 4.89,
    downloadsCount: 0,
    starsCount: 0,
    images: [...PROJECT_IMAGES.parkeraISthlm],
    downloadOptions: [],
    specs: [
      { label: 'Map Engine', value: 'OpenStreetMap + React 19', icon: 'globe' },
      { label: 'Coverage', value: 'Stockholm Tax Zones 1–5', icon: 'layers' },
      { label: 'Offline', value: 'PWA Caching Support', icon: 'memory' },
    ],
    changelog: [
      {
        version: 'v1.0.0',
        date: '2026.08.18',
        isCurrent: true,
        items: ['Live release on GitHub Pages with interactive parking zone map']
      }
    ],
    githubUrl: 'https://github.com/nRn-World/ParkeraiSthlm',
    license: 'Non-Commercial',
    maintainer: 'nRnWorld',
    lastUpdated: 'Live Online',
    systemRequirements: {
      os: 'Modern browser on Desktop or Mobile',
      ram: '2 GB RAM',
      storage: 'Runs in browser',
    }
  }
];

export const ALL_PROJECTS: Project[] = INITIAL_PROJECTS;
