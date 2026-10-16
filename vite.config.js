import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// Base path: VITE_BASE wins; on GitHub Actions it becomes "/<repo>/" (Pages project site); otherwise "/".
const repoBase = () => (process.env.GITHUB_ACTIONS && process.env.GITHUB_REPOSITORY ? `/${process.env.GITHUB_REPOSITORY.split('/')[1]}/` : '/');
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    base: env.VITE_BASE || repoBase(),
    plugins: [react()],
    build: {
      rollupOptions: {
        output: { manualChunks: { react: ['react', 'react-dom', 'react-router-dom'], supabase: ['@supabase/supabase-js'] } },
      },
    },
    test: { environment: 'node', include: ['src/**/*.test.{js,jsx}'] },
  };
});
