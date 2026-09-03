<div align="center">

<img src="public/logo.webp" width="72" height="72" alt="nRnWorld logo" />

# nRnWorld · Project Hub

**The official software hub & direct-download portal for all nRnWorld (@nRn-World) open-source projects.**

[![Live Site](https://img.shields.io/badge/live-nrnworld.one-blue?style=for-the-badge&logo=vercel)](https://nrnworld.one)
[![GitHub Stars](https://img.shields.io/github/stars/nRn-World/nrnworld?style=for-the-badge&logo=github&color=yellow)](https://github.com/nRn-World/nrnworld/stargazers)
[![License: MIT](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)
[![Built with React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=for-the-badge&logo=vite)](https://vitejs.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org)

</div>

---

## ✨ Features

- 🎯 **19 open-source projects** — Windows utilities, AI agents, audio engines, games and web tools
- ⚡ **Live GitHub stats** — stars, downloads and release dates fetched at build time via GitHub CLI
- 🌍 **i18n** — full support for English, Swedish, Arabic, French, Spanish and Turkish
- 🔎 **Smart search & filters** — instant fuzzy search across all projects with category and format filters
- 📦 **Direct downloads** — verified installer binaries with MD5 checksum display and VirusTotal links
- 🤖 **AI-ready** — exposes `llms.txt`, Schema.org JSON-LD and structured metadata for AI agents and search engines
- ♿ **WCAG 2.1 AA** — skip-to-content, focus rings, semantic headings, aria-labels and 4.5:1 contrast throughout
- 🖼️ **Optimized images** — all 19 project covers converted to local WebP/SVG (5.27 MB → 246 KB, **-95%**)

---

## 🗂️ Projects

| # | Project | Category | Platform |
|---|---------|----------|----------|
| 1 | [ShadowPaw: Noir Typist](https://nrnworld.one/shadowpaw) | Games | Web |
| 2 | [Doggy-Player](https://nrnworld.one/doggyplayer) | Audio & Media | Windows |
| 3 | [Windows Smart Taskbar](https://nrnworld.one/windowssmarttaskbar) | Utilities | Windows |
| 4 | [NOBreak Audio Builder](https://nrnworld.one/nobreakaudibuilder) | Audio & Media | Windows |
| 5 | [OctosArmy](https://nrnworld.one/octosarmy) | Games | Windows |
| 6 | [The Silent Room 1986](https://nrnworld.one/thesilentroom1986) | Games | Windows |
| 7 | [Farm Guardian TD](https://nrnworld.one/farmguardiantd) | Games | Windows |
| 8 | [Neon Path Puzzle](https://nrnworld.one/neonpathpuzzle) | Games | Windows |
| 9 | [DoneTogether](https://nrnworld.one/donetogether) | Productivity | Windows |
| 10 | [NexNote](https://nrnworld.one/nexnote) | Productivity | Windows |
| 11 | [Secret Prompts](https://nrnworld.one/secretpromts) | AI & Automation | Windows |
| 12 | [Site Scanner Pro](https://nrnworld.one/sitescannerpro) | Dev Tools | Windows |
| 13 | [GLOBAL EMERGENCY](https://nrnworld.one/globalemergency) | Games | Windows |
| 14 | [Private Link Saver](https://nrnworld.one/privatelinksaver) | Utilities | Windows |
| 15 | [BUGRAIDER](https://nrnworld.one/bugraider) | Dev Tools | Windows |
| 16 | [Bluetooth Safety Lock](https://nrnworld.one/bluetoothsafetylock) | Security | Windows |
| 17 | [Flash Video Downloader](https://nrnworld.one/flashvideodownloader) | Utilities | Windows |
| 18 | [NotePin](https://nrnworld.one/notepin) | Productivity | Windows |
| 19 | [Parkera i Sthlm](https://nrnworld.one/parkeriasthlm) | AI & Automation | Web |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [React 19](https://react.dev) + [TypeScript 5.8](https://www.typescriptlang.org) |
| Bundler | [Vite 6](https://vitejs.dev) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com) |
| Animations | [Motion (Framer Motion)](https://motion.dev) |
| Icons | [Lucide React](https://lucide.dev) |
| Server | [Express](https://expressjs.com) (GitHub stats proxy + contact API) |
| Image optimization | [sharp](https://sharp.pixelplumbing.com) |
| Deployment | [Vercel](https://vercel.com) + [Cloudflare](https://cloudflare.com) |

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) >= 18
- [GitHub CLI (gh)](https://cli.github.com) — authenticated for live stats
- A `.env.local` file (copy from `.env.example`)

### Install & run

```bash
npm install
npm run dev
```

### Build for production

```bash
npm run build
```

The `prebuild` step automatically:
1. Fetches live GitHub stats (stars, downloads, release dates) for all 19 repos
2. Fetches GitHub contribution activity
3. Injects Schema.org JSON-LD into `index.html`

### Other scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start local dev server |
| `npm run build` | Production build (runs prebuild automatically) |
| `npm run lint` | TypeScript type-check |
| `npm run fetch:github-stats` | Manually refresh `public/github-stats.json` |
| `npm run fetch:github-activity` | Manually refresh `public/github-activity.json` |

---

## 📁 Project Structure

```
nRnWorld/
├── public/
│   ├── images/projects/   # Optimized WebP/SVG project covers
│   ├── github-stats.json  # Live GitHub data (generated at build)
│   ├── robots.txt         # Search engine & AI bot configuration
│   ├── sitemap.xml        # All 19 project routes
│   └── llms.txt           # Structured data for AI agents
├── scripts/
│   ├── fetch-github-stats.mjs    # GitHub API → github-stats.json
│   ├── fetch-github-activity.mjs
│   ├── generate-json-ld.mjs      # Schema.org JSON-LD injection
│   ├── generate-og-image.mjs     # OG image generation
│   └── optimize-covers.mjs       # WebP conversion pipeline
├── server/
│   ├── github-stats-api.mjs      # Live stats proxy endpoint
│   └── contact-api.mjs           # Contact form API
├── src/
│   ├── components/        # React components
│   ├── data/              # Project data & images
│   ├── i18n/              # Translations (en, sv, ar, fr, es, tr)
│   └── utils/             # SEO meta, project image, routing utils
└── vercel.json            # Security headers, caching, rewrites
```

---

## 🔒 Security & Performance

- **Security headers** — `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`
- **Asset caching** — `Cache-Control: public, max-age=31536000, immutable` for all hashed assets
- **API payload** — GitHub stats JSON trimmed from 1.78 MB to 50 KB at build time (-97%)
- **Image weight** — All project covers served as local WebP/SVG (95% reduction vs. raw GitHub assets)
- **Verified downloads** — MD5 checksums displayed inline; VirusTotal links on every project page

---

## 🤝 Contributing

All individual project repositories are open-source under MIT and accept contributions.
Visit each project's GitHub page linked from [nrnworld.one](https://nrnworld.one) to open issues or pull requests.

---

## 📄 License

This repository (the hub website itself) is released under the [MIT License](LICENSE).
Each hosted project has its own license — check the individual GitHub repository.

---

<div align="center">

Made with ♥ by **[@nRn-World](https://github.com/nRn-World)** · [nrnworld.one](https://nrnworld.one)

</div>
