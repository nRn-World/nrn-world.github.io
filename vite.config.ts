import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';
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
    plugins: [react(), tailwindcss(), githubApiPlugin()],
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
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
