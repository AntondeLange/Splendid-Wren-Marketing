import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests/browser', workers: 1, timeout: 45000,
  use: { baseURL: 'http://127.0.0.1:4321', headless: true },
  webServer: { command: 'node tests/serve-built.mjs', url: 'http://127.0.0.1:4321', reuseExistingServer: false },
  reporter: [['list'], ['json', { outputFile: 'test-results/browser-results.json' }]],
});
