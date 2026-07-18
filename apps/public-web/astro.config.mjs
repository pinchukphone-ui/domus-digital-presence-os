import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import react from '@astrojs/react';

const site = process.env.PREVIEW_MODE === 'true'
  ? (process.env.PREVIEW_SITE_URL ?? 'http://localhost:4322')
  : (process.env.PUBLIC_SITE_URL ?? 'http://localhost:4321');

export default defineConfig({
  site,
  output: 'server',
  adapter: node({ mode: 'standalone' }),
  integrations: [react()],
  server: { host: true, port: Number(process.env.PORT ?? 4321) },
  vite: { envPrefix: ['PUBLIC_'] }
});
