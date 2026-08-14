import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import roomsHandler from './api/rooms.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp'
};

const server = http.createServer(async (req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = parsedUrl.pathname;

  // 1. API Routes
  if (pathname.startsWith('/api/rooms')) {
    // Parse body for POST/PUT/PATCH
    let bodyData = '';
    req.on('data', chunk => {
      bodyData += chunk;
    });

    req.on('end', async () => {
      let body = {};
      if (bodyData) {
        try {
          body = JSON.parse(bodyData);
        } catch (e) {
          body = bodyData;
        }
      }

      // Mock Vercel req/res object
      const vercelReq = {
        method: req.method,
        query: Object.fromEntries(parsedUrl.searchParams),
        body: body,
        headers: req.headers
      };

      const vercelRes = {
        _status: 200,
        _headers: {},
        setHeader(name, value) {
          this._headers[name] = value;
          res.setHeader(name, value);
        },
        status(code) {
          this._status = code;
          return this;
        },
        json(data) {
          res.writeHead(this._status, {
            'Content-Type': 'application/json; charset=utf-8',
            ...this._headers
          });
          res.end(JSON.stringify(data));
        },
        end(data = '') {
          res.writeHead(this._status, this._headers);
          res.end(data);
        }
      };

      try {
        await roomsHandler(vercelReq, vercelRes);
      } catch (err) {
        console.error('Server error in API handler:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // 2. Static File Serving
  let filePath = path.join(__dirname, pathname === '/' ? 'index.html' : pathname);

  // If file doesn't exist, try serving index.html for SPA routing
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    if (fs.existsSync(path.join(filePath, 'index.html'))) {
      filePath = path.join(filePath, 'index.html');
    } else {
      filePath = path.join(__dirname, 'index.html');
    }
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('404 Not Found');
      } else {
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end(`500 Server Error: ${err.code}`);
      }
    } else {
      res.writeHead(200, {
        'Content-Type': contentType,
        'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=3600'
      });
      res.end(content);
    }
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Servidor Pote da Vergonha rodando em http://localhost:${PORT}`);
});
