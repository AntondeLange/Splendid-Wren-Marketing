// Local verification harness: serves the built Vercel output with production headers.
// Never reads .env files or contacts SMTP. Only mocked unit tests may send mail.
import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname } from 'node:path';
import { pathToFileURL } from 'node:url';
import { Socket } from 'node:net';
process.env.SMTP_USER = '';
process.env.SMTP_PASS = '';
process.env.SMTP_HOST = '127.0.0.1';
process.env.SMTP_PORT = '1';
process.env.GA4_API_SECRET = '';
// Independent safety boundary even if a build ever embeds provider credentials.
// This harness needs inbound HTTP only; reject every outbound TCP connection.
Socket.prototype.connect = function () { throw new Error('Outbound TCP is disabled in browser verification'); };
const root = resolve('.vercel/output/static');
const config = JSON.parse(await readFile('../vercel.json', 'utf8'));
const { default: app } = await import(pathToFileURL(resolve('.vercel/output/functions/_render.func/.vercel/output/server/entry.mjs')));
const mime = { '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript', '.xml': 'application/xml', '.png': 'image/png', '.ico': 'image/x-icon', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.webm': 'video/webm', '.mp3': 'audio/mpeg' };
http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://127.0.0.1:4321');
    for (const { key, value } of config.headers.find(entry => entry.source === '/(.*)').headers) res.setHeader(key, value);
    if (url.pathname !== '/' && url.pathname.endsWith('/')) { res.writeHead(308, { Location: url.pathname.slice(0, -1) + url.search }); res.end(); return; }
    let file = resolve(root, '.' + decodeURIComponent(url.pathname));
    if (!file.startsWith(root + '/') && file !== root) throw new Error('Invalid path');
    for (const candidate of [file, file + '.html', resolve(file, 'index.html')]) {
      try {
        if (!(await stat(candidate)).isFile()) continue;
        res.setHeader('content-type', mime[extname(candidate)] || 'application/octet-stream');
        res.end(await readFile(candidate)); return;
      } catch { /* Try the next static route. */ }
    }
    const body = req.method === 'GET' || req.method === 'HEAD' ? undefined : req;
    const response = await app.fetch(new Request(url, { method: req.method, headers: req.headers, body, ...(body ? { duplex: 'half' } : {}) }));
    res.statusCode = response.status;
    response.headers.forEach((value, key) => res.setHeader(key, value));
    res.end(Buffer.from(await response.arrayBuffer()));
  } catch (error) { console.error(error); res.writeHead(500); res.end('Verification server error'); }
}).listen(4321, '127.0.0.1', () => console.log('Built-output verification server on http://127.0.0.1:4321'));
