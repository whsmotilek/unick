import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config';

// Юнит-тесты — только src; e2e (Playwright) запускаются отдельно через `npm run e2e`
export default mergeConfig(viteConfig, defineConfig({
  test: {
    include: ['src/**/*.test.{ts,tsx}'],
    exclude: ['node_modules/**', 'dist/**', 'e2e/**'],
  },
}));
