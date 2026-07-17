import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30_000,
  use: { trace: 'retain-on-failure' },
  webServer: [
    { command: 'CONTENT_SOURCE=fixture PREVIEW_MODE=false PUBLIC_SITE_URL=http://127.0.0.1:4321 pnpm --filter @domus/public-web dev --host 127.0.0.1 --port 4321', url: 'http://127.0.0.1:4321/healthz', reuseExistingServer: true },
    { command: 'CONTENT_SOURCE=fixture PREVIEW_MODE=true PREVIEW_SITE_URL=http://127.0.0.1:4322 pnpm --filter @domus/public-web dev --host 127.0.0.1 --port 4322', url: 'http://127.0.0.1:4322/healthz', reuseExistingServer: true }
  ]
});

