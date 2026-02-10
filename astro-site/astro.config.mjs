// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://splendidwrenmarketing.com.au',
  trailingSlash: 'never',
  vite: {
    plugins: [tailwindcss()],
  },
  redirects: {
    '/loader': '/loader.html',
    '/about.html': '/about',
    '/how-we-work.html': '/how-we-work',
    '/blog.html': '/blog',
    '/contact.html': '/contact',
    '/tools.html': '/tools',
    '/terms.html': '/terms',
    '/privacy.html': '/privacy',
  },
});
