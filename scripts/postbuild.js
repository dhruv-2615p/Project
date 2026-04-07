// Runs after `npm run build` to add Express server files to the build folder
const fs = require('fs');
const path = require('path');

const buildDir = path.join(__dirname, '..', 'build');

const serverJs = `const express = require('express');
const path = require('path');
const http = require('http');
const app = express();
const PORT = process.env.PORT || 8080;

const AUTH_PORT = process.env.AUTH_PORT || 8081;
const AI_PORT = process.env.AI_PORT || 8000;

// Zero-dependency reverse proxy
function createProxy(port) {
  return function (req, res) {
    const options = {
      hostname: '127.0.0.1',
      port: port,
      path: req.originalUrl,
      method: req.method,
      headers: { ...req.headers, host: '127.0.0.1:' + port },
    };
    const proxyReq = http.request(options, (proxyRes) => {
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      proxyRes.pipe(res, { end: true });
    });
    proxyReq.on('error', (err) => {
      console.error('Proxy error (' + port + '):', err.message);
      if (!res.headersSent) {
        res.writeHead(502, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Service unavailable' }));
      }
    });
    req.pipe(proxyReq, { end: true });
  };
}

// Proxy API requests to backend services
app.use('/api/auth', createProxy(AUTH_PORT));
app.use('/api/tickets', createProxy(AUTH_PORT));
app.use('/api/admin', createProxy(AUTH_PORT));
app.use('/api/ai', createProxy(AI_PORT));
app.use('/health', createProxy(AI_PORT));

// Serve static files
app.use(express.static(path.join(__dirname)));

// SPA fallback for client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log('Frontend server with API proxy running on port ' + PORT);
  console.log('  Auth/Ticket proxy -> 127.0.0.1:' + AUTH_PORT);
  console.log('  AI proxy          -> 127.0.0.1:' + AI_PORT);
});
`;

const packageJson = JSON.stringify({
  name: 'ai-support-frontend',
  version: '1.0.0',
  engines: { node: '20.x' },
  scripts: { start: 'node server.js' },
  dependencies: { express: '^4.18.2' }
}, null, 2);

fs.writeFileSync(path.join(buildDir, 'server.js'), serverJs);
fs.writeFileSync(path.join(buildDir, 'package.json'), packageJson);

console.log('postbuild: server.js and package.json written to build/');
