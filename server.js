const https = require('https');
const http = require('http');

// ===== KONFIGURASI AZURE =====
// Di Railway: set via Environment Variables (jangan hardcode di sini)
const ENDPOINT = process.env.AZURE_OPENAI_ENDPOINT || 'kemen-mok2fbgi-swedencentral.cognitiveservices.azure.com';
const DEPLOYMENT = process.env.AZURE_OPENAI_DEPLOYMENT || 'gpt-4o';
const API_VERSION = process.env.AZURE_OPENAI_API_VERSION || '2025-01-01-preview';
const API_KEY = process.env.AZURE_OPENAI_KEY || '';

// Railway menyediakan PORT otomatis via environment variable
const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  // CORS headers — izinkan akses dari Static Web Apps
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight OPTIONS
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Health check endpoint — Railway butuh ini untuk monitoring
  if (req.method === 'GET' && req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'ok',
      service: 'CyDef-GR Azure OpenAI Proxy',
      endpoint: ENDPOINT,
      deployment: DEPLOYMENT,
      key_configured: !!API_KEY
    }));
    return;
  }

  // Main chat endpoint
  if (req.method === 'POST' && req.url === '/chat') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      if (!API_KEY) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'AZURE_OPENAI_KEY tidak dikonfigurasi di Railway' }));
        return;
      }

      const azurePath = `/openai/deployments/${DEPLOYMENT}/chat/completions?api-version=${API_VERSION}`;

      const options = {
        hostname: ENDPOINT,
        path: azurePath,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': API_KEY,
          'Content-Length': Buffer.byteLength(body)
        }
      };

      const azureReq = https.request(options, azureRes => {
        let data = '';
        azureRes.on('data', chunk => data += chunk);
        azureRes.on('end', () => {
          res.writeHead(azureRes.statusCode, { 'Content-Type': 'application/json' });
          res.end(data);
        });
      });

      azureReq.on('error', err => {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      });

      azureReq.write(body);
      azureReq.end();
    });
    return;
  }

  // 404 untuk route lain
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found', available: ['/chat'] }));
});

server.listen(PORT, () => {
  console.log('');
  console.log('================================');
  console.log('  CyDef-GR Proxy - AKTIF');
  console.log('  Port: ' + PORT);
  console.log('  Azure: ' + ENDPOINT);
  console.log('  Key: ' + (API_KEY ? '✓ Configured' : '✗ MISSING!'));
  console.log('================================');
});
