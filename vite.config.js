import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  ssgOptions: {
    // Prerender each route to its own directory (/blog/<slug>/index.html) for
    // clean trailing-slash URLs that match the canonical tags.
    dirStyle: 'nested',
    script: 'async',
    formatting: 'minify',
  },
});
