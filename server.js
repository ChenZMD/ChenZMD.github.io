import http from 'http';
import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 8082;
const DIR = __dirname;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon'
};

// Cache strategy: HTML (no-cache for SW), assets (long cache), data (revalidate)
const CACHE_POLICY = {
  '.html': 'no-cache',
  '.js': 'public, max-age=31536000, immutable',
  '.css': 'public, max-age=31536000, immutable',
  '.json': 'public, max-age=3600',
  '.svg': 'public, max-age=86400',
  '.png': 'public, max-age=86400',
  '.jpg': 'public, max-age=86400',
  '.webp': 'public, max-age=86400'
};

// Gzip compression threshold - don't compress small files or already-compressed formats
const COMPRESSIBLE = new Set(['.html', '.js', '.css', '.json', '.svg']);
const MIN_COMPRESS_SIZE = 1024; // 1KB

function compress(res, data, encoding) {
  return new Promise((resolve) => {
    if (!encoding || !encoding.includes('gzip')) {
      resolve(data);
      return;
    }
    if (data.length < MIN_COMPRESS_SIZE) {
      resolve(data);
      return;
    }
    zlib.gzip(data, (err, compressed) => {
      if (err || compressed.length >= data.length) {
        resolve(data);
      } else {
        res.setHeader('Content-Encoding', 'gzip');
        resolve(compressed);
      }
    });
  });
}

const server = http.createServer(async (req, res) => {
  try {
    const urlPath = req.url === '/' ? '/dashboard.html' : req.url.split('?')[0];
    const filePath = path.join(DIR, decodeURIComponent(urlPath));
    
    // Security: prevent path traversal
    if (!filePath.startsWith(DIR)) {
      res.writeHead(403);
      res.end('Forbidden');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME[ext] || 'application/octet-stream';

    // Check if file exists
    if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not found');
      return;
    }

    const stat = fs.statSync(filePath);
    const lastModified = stat.mtime.toUTCString();
    const etag = `"${stat.size.toString(16)}-${stat.mtime.getTime().toString(16)}"`;

    // ETag support - return 304 if not modified
    if (req.headers['if-none-match'] === etag) {
      res.writeHead(304);
      res.end();
      return;
    }

    const data = fs.readFileSync(filePath);
    const encoding = req.headers['accept-encoding'] || '';

    // Set response headers
    const headers = {
      'Content-Type': contentType,
      'ETag': etag,
      'Last-Modified': lastModified,
      'Cache-Control': CACHE_POLICY[ext] || 'public, max-age=3600',
      'X-Content-Type-Options': 'nosniff'
    };

    // Compress if applicable
    const shouldCompress = COMPRESSIBLE.has(ext);
    const finalData = await compress(res, data, shouldCompress ? encoding : null);

    if (shouldCompress && encoding.includes('gzip') && finalData.length < data.length) {
      headers['Content-Encoding'] = 'gzip';
    }

    // Remove Content-Length when compressed (it changes)
    headers['Content-Length'] = finalData.length;

    res.writeHead(200, headers);
    res.end(finalData);
  } catch (err) {
    res.writeHead(500);
    res.end('Internal Server Error');
  }
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Server running at http://127.0.0.1:${PORT}/`);
  console.log(`Features: gzip compression, ETag caching, cache-control headers`);
});
