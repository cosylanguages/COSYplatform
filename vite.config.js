import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// VITE_BASE: "/" for a custom domain, "/<repo>/" for GitHub Pages project sites.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    base: env.VITE_BASE || '/',
    plugins: [react()],
    build: {
      rollupOptions: {
        output: { manualChunks: { react: ['react', 'react-dom', 'react-router-dom'], supabase: ['@supabase/supabase-js'] } },
      },
    },
    test: { environment: 'node', include: ['src/**/*.test.js'] },
  };
});
