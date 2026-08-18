import type { CollectionEntry } from 'astro:content';
import { getCollection } from 'astro:content';
import { buildAbsoluteUrl } from '../lib/site';

const STATIC_PATHS = [
  '/',
  '/about',
  '/how-we-work',
  '/blog',
  '/contact',
  '/small-business-marketing-consultant-australia',
  '/ai-marketing-support-small-business',
  '/brand-strategy-small-business',
  '/terms',
  '/privacy',
];

const getPostSlug = (post: CollectionEntry<'blog'>) => post.id.replace(/\.(md|mdx)$/i, '');

function escapeXml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

export async function GET() {
  const posts = (await getCollection('blog', ({ data }) => !data.draft)).sort(
    (a, b) => b.data.publishDate.getTime() - a.data.publishDate.getTime(),
  );

  const urls = [
    ...STATIC_PATHS.map((path) => ({
      loc: buildAbsoluteUrl(path),
      lastmod: null as string | null,
    })),
    ...posts.map((post) => ({
      loc: buildAbsoluteUrl(`/blog/${getPostSlug(post)}`),
      lastmod: (post.data.updatedDate ?? post.data.publishDate).toISOString(),
    })),
  ];

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (entry) => `  <url>
    <loc>${escapeXml(entry.loc)}</loc>${entry.lastmod ? `
    <lastmod>${entry.lastmod}</lastmod>` : ''}
  </url>`,
  )
  .join('\n')}
</urlset>`;

  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=0, must-revalidate',
    },
  });
}
