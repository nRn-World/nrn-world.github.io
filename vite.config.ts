import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { gzipSync } from 'node:zlib';
import {defineConfig, type Plugin} from 'vite';

/**
 * Dev-only gzip. Vite ships every module uncompressed, which means a cold
 * reload of this app pushes ~3.2 MB over the wire before React can render
 * anything (the visible symptom is a long blank/white page). The production
 * build is compressed by the host, so only the dev/preview server needs this.
 */
function devCompressionPlugin(): Plugin {
  const COMPRESSIBLE = /\.(js|mjs|cjs|ts|tsx|jsx|css|json|html|svg|map)(\?|$)/;
  return {
    name: 'dev-compression',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const accept = req.headers['accept-encoding'] || '';
        if (!/\bgzip\b/.test(accept) || !COMPRESSIBLE.test(req.url || '')) {
          next();
          return;
        }
        const write = res.write.bind(res);
        const end = res.end.bind(res);
        const chunks: Buffer[] = [];
        let decided = false;

        const canCompress = () =>
          res.statusCode === 200 &&
          !res.getHeader('content-encoding') &&
          !res.getHeader('content-length');

        (res as any).write = (chunk: any, ...rest: any[]) => {
          if (decided) return write(chunk, ...rest);
          if (chunk) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
          return true;
        };
        (res as any).end = (chunk?: any, ...rest: any[]) => {
          if (decided) return end(chunk, ...rest);
          decided = true;
          if (chunk) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
          const body = Buffer.concat(chunks);
          // Only worth it for bodies big enough to actually save bytes.
          if (body.length < 1024 || !canCompress()) return end(body);
          const zipped = gzipSync(body, { level: 6 });
          res.setHeader('Content-Encoding', 'gzip');
          res.setHeader('Vary', 'Accept-Encoding');
          res.setHeader('Content-Length', String(zipped.length));
          return end(zipped);
        };
        next();
      });
    },
  };
}
import { handleGithubStatsRequest } from './server/github-stats-api.mjs';
import { handleGithubActivityRequest } from './server/github-activity-api.mjs';
import { handleContactRequest } from './server/contact-api.mjs';
import { handleEngagementRequest } from './server/engagement-api.mjs';

function githubApiPlugin() {
  return {
    name: 'github-api',
    configureServer(server) {
      server.middlewares.use('/api/github-stats', (req, res) => {
        void handleGithubStatsRequest(req, res);
      });
      server.middlewares.use('/api/github-activity', (req, res) => {
        void handleGithubActivityRequest(req, res);
      });
      server.middlewares.use('/api/contact', (req, res) => {
        void handleContactRequest(req, res);
      });
      server.middlewares.use('/api/engagement', (req, res) => {
        void handleEngagementRequest(req, res);
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use('/api/github-stats', (req, res) => {
        void handleGithubStatsRequest(req, res);
      });
      server.middlewares.use('/api/github-activity', (req, res) => {
        void handleGithubActivityRequest(req, res);
      });
      server.middlewares.use('/api/contact', (req, res) => {
        void handleContactRequest(req, res);
      });
      server.middlewares.use('/api/engagement', (req, res) => {
        void handleEngagementRequest(req, res);
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), githubApiPlugin(), devCompressionPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    build: {
      target: 'es2020',
      cssCodeSplit: true,
      modulePreload: {
        resolveDependencies(filename, deps) {
          // Never preload Spline on the critical path (desktop-only lazy load)
          return deps.filter(
            (dep) => !dep.includes('spline') && !dep.includes('physics')
          );
        },
      },
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('@splinetool')) return 'spline';
              if (id.includes('framer-motion') || id.includes('/motion/')) return 'motion';
              if (id.includes('canvas-confetti')) return 'confetti';
              if (id.includes('react-dom') || id.includes('/react/')) return 'react-vendor';
              if (id.includes('lucide-react')) return 'icons';
            }
          },
        },
      },
    },
    server: {
      port: 3000,
      strictPort: true,
      host: true,
      // Vite 6 blocks requests whose Host header it does not recognise (403
      // "Blocked request"), which broke the proxied preview / tunnelled
      // dev URLs. allowedHosts: true only relaxes that Host check for this
      // local dev server; it does not affect the production build.
      allowedHosts: true,
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch:
        process.env.DISABLE_HMR === 'true'
          ? null
          : {
              // The prebuild regenerates these files (GitHub stats, sitemaps,
              // RSS, llms.txt). Watching them made every reload trigger a
              // forced page reload while they were being rewritten, which is
              // what produced the repeated white flashes. None of them are
              // imported by the app, so the dev server does not need them.
              ignored: [
                '**/public/github-*.json',
                '**/public/sitemap*.xml',
                '**/public/rss.xml',
                '**/public/llms.txt',
                '**/.arena/**',
              ],
            },
    },
  };
});
