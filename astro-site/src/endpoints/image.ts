import type { APIRoute } from 'astro';

// All site images are built from trusted repository assets. Runtime image
// transformation is disabled, including requests for remote or AVIF sources.
export const GET: APIRoute = () => new Response('Not Found', { status: 404 });
