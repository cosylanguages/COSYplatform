const http = require('http');
const fs = require('fs');
const path = require('path');

function getContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case '.html': return 'text/html; charset=utf-8';
    case '.js':
    case '.mjs': return 'application/javascript; charset=utf-8';
    case '.css': return 'text/css; charset=utf-8';
    case '.json': return 'application/json; charset=utf-8';
    default: return 'text/plain';
  }
}

function startStaticServer(rootDir) {
  const targetDir = rootDir || path.join(__dirname, '../..');
  const server = http.createServer((req, res) => {
    let cleanPath = decodeURIComponent(req.url.split('?')[0]).replace(/^\//, '');
    if (!cleanPath) cleanPath = 'index.html';

    const filePath = path.join(targetDir, cleanPath);

    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      res.writeHead(200, { 'Content-Type': getContentType(filePath) });
      res.end(fs.readFileSync(filePath));
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
    }
  });

  return new Promise((resolve, reject) => {
    server.listen(0, '127.0.0.1', () => {
      const port = server.address().port;
      resolve({ server, port });
    });
  });
}

module.exports = { startStaticServer, getContentType };
