// Generates a reviewable GitHub Pages artifact. Does not publish or call GitHub.
// After approval, upload this directory with an approved Pages deployment workflow.
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
const destination = resolve(process.argv[2] || '/tmp/splendid-wren-pages-retirement');
const site = 'https://splendidwrenmarketing.com.au';
const prefix = '/Splendid-Wren-Marketing';
const sitemap = await readFile('astro-site/.vercel/output/static/sitemap.xml', 'utf8');
const paths = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => new URL(match[1]).pathname);
await mkdir(destination, { recursive: true });
const escape = value => value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;');
const html = path => `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,follow"><link rel="canonical" href="${site}${path}"><title>Splendid Wren Marketing has moved</title><script defer src="${prefix}/redirect.js"></script></head><body><main><h1>Our website has moved</h1><p>Visit <a id="destination" href="${site}${escape(path)}">Splendid Wren Marketing${path === '/' ? '' : ' — ' + escape(path)}</a>.</p><p>If you selected a package, choose it again on the contact form if your browser does not redirect automatically.</p></main></body></html>\n`;
for (const path of paths) {
  const dir = resolve(destination, '.' + path); await mkdir(dir, { recursive: true });
  await writeFile(resolve(dir, 'index.html'), html(path));
  if (path !== '/') await writeFile(resolve(destination, '.' + path + '.html'), html(path));
}
await writeFile(resolve(destination, '404.html'), html('/'));
await writeFile(resolve(destination, '.nojekyll'), '');
await writeFile(resolve(destination, 'redirect.js'), `(() => {
  const allowed = new Set(${JSON.stringify(paths)});
  let path = location.pathname.replace(/^\\/Splendid-Wren-Marketing(?=\\/|$)/, '').replace(/\\/index\\.html$/, '/').replace(/\\.html$/, '').replace(/\\/$/, '') || '/';
  if (!allowed.has(path)) path = '/';
  const target = new URL(path, '${site}');
  const selected = new URLSearchParams(location.search).get('package');
  if (path === '/contact' && ['Wren Lite', 'Momentum', 'Elevate'].includes(selected)) target.searchParams.set('package', selected);
  if (/^#[a-zA-Z0-9_-]+$/.test(location.hash)) target.hash = location.hash;
  document.querySelector('#destination').href = target.href;
  location.replace(target.href);
})();\n`);
console.log(`Prepared ${paths.length} mapped routes and 404 fallback at ${destination}. Nothing published.`);
