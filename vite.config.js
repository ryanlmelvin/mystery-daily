import { execSync } from 'node:child_process';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import { buildServiceWorker } from './scripts/sw-build.mjs';

// The release shown in the menu: the commit being built, so a tester can tell which
// version is actually running.
function release() {
  const sha = process.env.GITHUB_SHA || (() => {
    try { return execSync('git rev-parse HEAD', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim(); } catch { return 'local'; }
  })();
  return sha.slice(0, 7);
}

const serviceWorker = () => {
  let outDir;
  let failed = false;
  return {
    name: 'penny-service-worker',
    apply: 'build',
    configResolved(config) { outDir = resolve(config.root, config.build.outDir); },
    buildEnd(error) { failed = !!error; },
    closeBundle() {
      if (failed) return; // never write a worker for a release that did not build
      const { version, files } = buildServiceWorker(outDir);
      console.log(`sw.js ${version}: ${files.length} files precached`);
    },
  };
};

export default defineConfig({
  base: './',
  define: { __RELEASE__: JSON.stringify(release()) },
  build: { rollupOptions: { input: { main: 'index.html' } } },
  plugins: [serviceWorker()],
  server: { port: 4331, strictPort: true, watch: { usePolling: true, interval: 300 } },
});
