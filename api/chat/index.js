const https = require('https');

module.exports = async function (context, req) {
  // CORS headers
  context.res = {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Content-Type': 'application/json'
    }
  };

  // Handle preflight
  if (req.method === 'OPTIONS') {
    context.res.status = 200;
    context.res.body = '';
    return;
  }

  if (req.method !== 'POST') {
    context.res.status = 405;
    context.res.body = JSON.stringify({ error: 'Method not allowed' });
    return;
  }

  const AZURE_ENDPOINT = process.env.AZURE_OPENAI_ENDPOINT || 'kemen-mok2fbgi-swedencentral.cognitiveservices.azure.com';
  const AZURE_DEPLOYMENT = process.env.AZURE_OPENAI_DEPLOYMENT || 'gpt-4o';
  const AZURE_API_VERSION = process.env.AZURE_OPENAI_API_VERSION || '2025-01-01-preview';
  const AZURE_API_KEY = process.env.AZURE_OPENAI_KEY;

  if (!AZURE_API_KEY) {
    context.res.status = 500;
    context.res.body = JSON.stringify({ error: 'Azure OpenAI key not configured' });
    return;
  }

  const body = JSON.stringify(req.body);
  const path = `/openai/deployments/${AZURE_DEPLOYMENT}/chat/completions?api-version=${AZURE_API_VERSION}`;

  const result = await new Promise((resolve, reject) => {
    const options = {
      hostname: AZURE_ENDPOINT,
      path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': AZURE_API_KEY,
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
};
