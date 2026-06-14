import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  ssgOptions: {
    // Prerender the single route to static HTML; keep the static <head>.
    script: 'async',
    formatting: 'minify',
  },
});
