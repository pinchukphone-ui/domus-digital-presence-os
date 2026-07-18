import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30_000,
  use: { trace: 'retain-on-failure' },
  webServer: {
    command: 'pnpm exec tsx packages/testing/src/start-e2e-servers.ts',
    url: 'http://127.0.0.1:4321/healthz',
    reuseExistingServer: true,
    timeout: 120_000
  }
});
