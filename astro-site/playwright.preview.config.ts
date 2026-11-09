import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests/browser', testMatch: '**/*.spec.ts', workers: 1, timeout: 60000,
  use: { baseURL: process.env.SWM_PREVIEW_URL, headless: true, trace: 'off' },
  reporter: [['list'], ['json', { outputFile: 'test-results/preview-browser-results.json' }]],
});
