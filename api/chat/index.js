const https = require('https');

const ENDPOINT = 'kemen-mok2fbgi-swedencentral.cognitiveservices.azure.com';
const DEPLOYMENT = 'gpt-4o';
const API_VERSION = '2025-01-01-preview';
const API_KEY = '9BAbISFp3GiOmr9sxHEXgRv4B02GXdqNVHGseqh7DaxA7OlHSlbHJQQJ99CDACfhMk5XJ3w3AAAAACOGPgDR';

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

  const body = JSON.stringify(req.body);
  const path = `/openai/deployments/${DEPLOYMENT}/chat/completions?api-version=${API_VERSION}`;

  try {
    const result = await new Promise((resolve, reject) => {
      const options = {
        hostname: ENDPOINT,
        path: path,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': API_KEY,
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
