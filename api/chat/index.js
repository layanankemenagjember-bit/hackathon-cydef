const https = require('https');

module.exports = async function (context, req) {
  context.res = {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Content-Type': 'application/json'
    }
  };

  if (req.method === 'OPTIONS') {
    context.res.status = 200;
    context.res.body = '';
    return;
  }

  const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
  const deployment = process.env.AZURE_OPENAI_DEPLOYMENT || 'gpt-4o';
  const apiVersion = process.env.AZURE_OPENAI_API_VERSION || '2025-01-01-preview';
  const apiKey = process.env.AZURE_OPENAI_KEY;

  if (!apiKey || !endpoint) {
    context.res.status = 500;
    context.res.body = JSON.stringify({ error: 'Missing Azure config', endpoint: !!endpoint, key: !!apiKey });
    return;
  }

  const body = JSON.stringify(req.body);
  const path = `/openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`;

  try {
    const result = await new Promise((resolve, reject) => {
      const options = {
        hostname: endpoint,
        path: path,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': apiKey,
          'Content-Length': Buffer.byteLength(body)
        }
      };

      const azureReq = https.request(options, res => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve({ status: res.statusCode, body: data }));
      });

      azureReq.on('error', err => reject(err));
      azureReq.write(body);
      azureReq.end();
    });

    context.res.status = result.status;
    context.res.body = result.body;
  } catch (err) {
    context.res.status = 500;
    context.res.body = JSON.stringify({ error: err.message });
  }
};
