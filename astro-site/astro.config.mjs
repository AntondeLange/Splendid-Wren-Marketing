// @ts-check
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://splendidwrenmarketing.com.au',
  adapter: vercel(),
  trailingSlash: 'never',
  vite: {
    plugins: [tailwindcss()],
  },
});
