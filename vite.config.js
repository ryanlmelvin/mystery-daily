import { defineConfig } from 'vite';
export default defineConfig({ base: './', server: { port: 4331, strictPort: true, watch: { usePolling: true, interval: 300 } } });
