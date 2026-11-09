// @ts-check
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://splendidwrenmarketing.com.au',
  adapter: vercel({ imageService: false, maxDuration: 60 }),
  // Local repository images only. Never authorize arbitrary remote decoder inputs.
  image: {
    domains: [],
    remotePatterns: [],
    service: {
      build: { entrypoint: 'astro/assets/services/sharp' },
      runtime: { entrypoint: './src/lib/runtime-images.ts' },
    },
    endpoint: { route: '/_image', entrypoint: './src/endpoints/image.ts' },
  },
  trailingSlash: 'never',
  vite: {
    // Keep the consent bootstrap external so script-src self remains sufficient.
    build: { assetsInlineLimit: 0 },
    plugins: [tailwindcss()],
  },
});
