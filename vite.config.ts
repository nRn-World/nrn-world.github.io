import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';
import { handleGithubStatsRequest } from './server/github-stats-api.mjs';
import { handleGithubActivityRequest } from './server/github-activity-api.mjs';
import { handleContactRequest } from './server/contact-api.mjs';

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
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), githubApiPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
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
