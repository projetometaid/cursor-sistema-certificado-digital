const https = require('https');
const http = require('http');

// Simple retry with jitter and per-host circuit breaker
const breakers = new Map(); // host -> { openUntil:number, failures:number }

function hostFromUrl(u){ try { return new URL(u).host; } catch { return ''; } }

async function requestJson(method, url, body, headers = {}, timeoutMs = 10000){
  const u = new URL(url);
  const isHttps = u.protocol === 'https:';
  const lib = isHttps ? https : http;
  const host = u.host;
  const br = breakers.get(host) || { openUntil: 0, failures: 0 };
  if (Date.now() < br.openUntil) throw new Error(`circuit_open for ${host}`);

  const payload = body ? Buffer.from(JSON.stringify(body)) : null;
  const options = {
    method,
    hostname: u.hostname,
    port: u.port || (isHttps ? 443 : 80),
    path: `${u.pathname}${u.search}`,
    headers: {
      'Content-Type': 'application/json',
      ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {}),
      ...headers
    },
    timeout: timeoutMs
  };

  return new Promise((resolve, reject) => {
    const req = lib.request(options, (res) => {
      let data = '';
      res.on('data', (d) => (data += d));
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          breakers.set(host, { openUntil: 0, failures: 0 });
          try { resolve({ ok: true, status: res.statusCode, json: JSON.parse(data) }); }
          catch { resolve({ ok: true, status: res.statusCode, text: data }); }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });
    req.on('error', (err) => reject(err));
    if (payload) req.write(payload);
    req.end();
  });
}

async function requestWithRetry(method, url, body, headers = {}, retries = 3){
  const host = hostFromUrl(url);
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await requestJson(method, url, body, headers);
    } catch (e) {
      if (attempt === retries) {
        // open circuit for 30s
        const br = breakers.get(host) || { openUntil: 0, failures: 0 };
        br.failures += 1;
        br.openUntil = Date.now() + 30000;
        breakers.set(host, br);
        throw e;
      }
      // jitter backoff
      const delay = Math.floor(200 * Math.pow(2, attempt) + Math.random() * 100);
      await new Promise(r => setTimeout(r, delay));
    }
  }
}

module.exports = { requestWithRetry };


