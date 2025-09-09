/**
 * Safeweb Proxy (reconstruído)
 * Endpoints:
 *  - GET  /api/test
 *  - POST /api/validar-biometria { cpf }
 *  - POST /api/consulta-previa-cpf { cpf, dataNascimento }
 *  - POST /api/consulta-previa-cnpj { cnpj, cpfResponsavel, dataNascimento }
 *  - POST /api/gerar-protocolo  { ...payloadSafeweb }
 */

const http = require('http');
const https = require('https');
const url = require('url');
const path = require('path');
const fs = require('fs');

// Load .env from multiple candidates (root/config)
(() => {
  const candidates = [
    path.resolve(__dirname, '../../..', '.env'),
    path.resolve(__dirname, '../../../config/.env'),
    path.resolve(process.cwd(), '.env')
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) { require('dotenv').config({ path: p }); break; }
  }
})();

const SAFEWEB = {
  username: process.env.SAFEWEB_USERNAME,
  password: process.env.SAFEWEB_PASSWORD,
  cnpjAR: process.env.SAFEWEB_CNPJ_AR,
  codigoParceiro: process.env.SAFEWEB_CODIGO_PARCEIRO,
  baseHost: 'pss.safewebpss.com.br',
  authUrl: process.env.SAFEWEB_AUTH_URL || 'https://pss.safewebpss.com.br/Service/Microservice/Shared/HubAutenticacao/Autenticacoes/api/autorizacao/token'
};

const APP = { port: Number(process.env.SAFEWEB_PROXY_PORT || 3003), host: '0.0.0.0' };

function reqHttps(options, bodyStr) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (d) => (data += d));
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject);
    if (bodyStr) req.write(bodyStr);
    req.end();
  });
}

let tokenCache = { token: null, exp: 0 };
async function getToken(force = false) {
  if (force) tokenCache = { token: null, exp: 0 };
  if (tokenCache.token && Date.now() < tokenCache.exp - 300000) return tokenCache.token;
  const basic = Buffer.from(`${SAFEWEB.username}:${SAFEWEB.password}`).toString('base64');
  const u = new URL(SAFEWEB.authUrl);
  const { status, body } = await reqHttps({
    hostname: u.hostname,
    port: 443,
    path: u.pathname,
    method: 'POST',
    headers: { Authorization: `Basic ${basic}`, 'Content-Type': 'application/json' }
  });
  if (status !== 200) throw new Error(`Auth ${status}: ${body}`);
  const json = JSON.parse(body);
  if (!json.tokenAcesso) throw new Error('tokenAcesso ausente');
  tokenCache = { token: json.tokenAcesso, exp: Date.now() + (json.expiraEm || 3600) * 1000 };
  return tokenCache.token;
}

async function validarBiometria(cpf, token) {
  const clean = String(cpf).replace(/\D/g, '');
  let { status, body } = await reqHttps({
    hostname: SAFEWEB.baseHost,
    port: 443,
    path: `/Service/Microservice/Shared/Partner/api/ValidateBiometry/${clean}`,
    method: 'GET',
    headers: { Authorization: token }
  });
  if (status === 401) {
    const fresh = await getToken(true);
    ({ status, body } = await reqHttps({
      hostname: SAFEWEB.baseHost,
      port: 443,
      path: `/Service/Microservice/Shared/Partner/api/ValidateBiometry/${clean}`,
      method: 'GET',
      headers: { Authorization: fresh }
    }));
  }
  if (status !== 200) throw new Error(`Biometria ${status}: ${body}`);
  try { const j = JSON.parse(body); return !!j; } catch { return body.trim() === 'true'; }
}

async function consultaPreviaCPF(cpf, dataNasc, token) {
  const payload = JSON.stringify({ CPF: String(cpf).replace(/\D/g, ''), DocumentoTipo: '1', DtNascimento: dataNasc });
  let { status, body } = await reqHttps({
    hostname: SAFEWEB.baseHost,
    port: 443,
    path: '/Service/Microservice/Shared/ConsultaPrevia/api/RealizarConsultaPrevia',
    method: 'POST',
    headers: { Authorization: token, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) }
  }, payload);
  if (status === 401) {
    const fresh = await getToken(true);
    ({ status, body } = await reqHttps({
      hostname: SAFEWEB.baseHost,
      port: 443,
      path: '/Service/Microservice/Shared/ConsultaPrevia/api/RealizarConsultaPrevia',
      method: 'POST',
      headers: { Authorization: fresh, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) }
    }, payload));
  }
  if (status !== 200) throw new Error(`ConsultaCPF ${status}: ${body}`);
  return JSON.parse(body);
}

async function consultaPreviaCNPJ(cnpj, cpf, dataNasc, token) {
  const payload = JSON.stringify({ CNPJ: String(cnpj).replace(/\D/g, ''), CPF: String(cpf).replace(/\D/g, ''), DocumentoTipo: '2', DtNascimento: dataNasc });
  let { status, body } = await reqHttps({
    hostname: SAFEWEB.baseHost,
    port: 443,
    path: '/Service/Microservice/Shared/ConsultaPrevia/api/RealizarConsultaPrevia',
    method: 'POST',
    headers: { Authorization: token, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) }
  }, payload);
  if (status === 401) {
    const fresh = await getToken(true);
    ({ status, body } = await reqHttps({
      hostname: SAFEWEB.baseHost,
      port: 443,
      path: '/Service/Microservice/Shared/ConsultaPrevia/api/RealizarConsultaPrevia',
      method: 'POST',
      headers: { Authorization: fresh, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) }
    }, payload));
  }
  if (status !== 200) throw new Error(`ConsultaCNPJ ${status}: ${body}`);
  return JSON.parse(body);
}

async function emitirCertificadoOnline(numeroSerie, idProduto, cnpjAR, token) {
  const pathEmitir = `/Service/Microservice/Shared/Partner/api/EmitirCertificadoOnline/${encodeURIComponent(numeroSerie)}/${encodeURIComponent(idProduto)}/${encodeURIComponent(cnpjAR)}`;
  const { status, body } = await reqHttps({
    hostname: SAFEWEB.baseHost,
    port: 443,
    path: pathEmitir,
    method: 'GET',
    headers: { Authorization: token }
  });
  if (status !== 200) throw new Error(`EmitirCertificadoOnline ${status}: ${body}`);
  try { return JSON.parse(body); } catch { return body; }
}

async function gerarProtocolo(payload, token) {
  if (SAFEWEB.codigoParceiro && !payload.CodigoParceiro) payload.CodigoParceiro = SAFEWEB.codigoParceiro;
  const isECNPJ = !!(payload && payload.CNPJ);
  const addPath = isECNPJ ? '/Service/Microservice/Shared/Partner/api/Add/5' : '/Service/Microservice/Shared/Partner/api/Add/3';

  // 1) Primeira tentativa: enviar direto (sem Protocolo) quando e-CNPJ
  const doAdd = async (p) => {
    const dataStr = JSON.stringify(p);
    try {
      console.log('[SAFEWEB][Add] Path:', addPath, 'Len:', dataStr.length);
      console.log('[SAFEWEB][Add] Payload:', dataStr.slice(0, 2000));
    } catch (_) {}
    return reqHttps({
      hostname: SAFEWEB.baseHost,
      port: 443,
      path: addPath,
      method: 'POST',
      headers: { Authorization: token, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(dataStr) }
    }, dataStr);
  };

  let { status, body } = await doAdd(payload);
  try { console.log('[SAFEWEB][Add] Status:', status); } catch (_) {}

  // 2) Fallback inteligente: se e-CNPJ e falhou, tenta EmitirCertificadoOnline para obter Protocolo e reenvia
  if (status !== 200 && isECNPJ) {
    try {
      const numeroSerie = String(payload.numeroSerie || '0');
      const idProduto = String(payload.idProduto || '');
      const cnpjAR = String(payload.CnpjAR || SAFEWEB.cnpjAR || '');
      const emitirOut = await emitirCertificadoOnline(numeroSerie, idProduto, cnpjAR, token);
      let protocoloPre = null;
      try {
        const emitirJson = typeof emitirOut === 'string' ? JSON.parse(emitirOut) : emitirOut;
        protocoloPre = emitirJson?.Protocolo || emitirJson?.protocolo || null;
      } catch (_) {
        if (typeof emitirOut === 'string') {
          const m = emitirOut.match(/\b\d{6,}\b/);
          if (m) protocoloPre = m[0];
        }
      }
      if (protocoloPre) {
        payload.Protocolo = String(protocoloPre);
        ({ status, body } = await doAdd(payload));
        try { console.log('[SAFEWEB][Add][retry-with-Protocolo] Status:', status); } catch (_) {}
      }
    } catch (_) {
      // ignora e deixa o erro original seguir
    }
  }

  // 3) Último recurso: se ainda falhou e era e-CNPJ, tentar Add/3 (alguns ambientes aceitam)
  if (status !== 200 && isECNPJ) {
    const dataStr = JSON.stringify(payload);
    ({ status, body } = await reqHttps({
      hostname: SAFEWEB.baseHost,
      port: 443,
      path: '/Service/Microservice/Shared/Partner/api/Add/3',
      method: 'POST',
      headers: { Authorization: token, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(dataStr) }
    }, dataStr));
  }

  if (status !== 200) {
    try { console.error('[SAFEWEB][Add][error]', status, body); } catch (_) {}
    throw new Error(`Add ${status}: ${body}`);
  }
  try { return JSON.parse(body); } catch { return { protocolo: body.trim() }; }
}

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.writeHead(200); res.end(); return; }

  const parsed = url.parse(req.url, true);
  const pathn = parsed.pathname;

  if (req.method === 'GET' && pathn === '/api/test') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, message: 'Proxy Safeweb funcionando', timestamp: new Date().toISOString() }));
    return;
  }

  if (req.method === 'POST' && pathn === '/api/validar-biometria') {
    let body = '';
    req.on('data', (c) => (body += c));
    req.on('end', async () => {
      try {
        const { cpf } = JSON.parse(body || '{}');
        const token = await getToken();
        const ok = await validarBiometria(cpf, token);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, cpf, temBiometria: ok }));
      } catch (e) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: e.message }));
      }
    });
    return;
  }

  if (req.method === 'POST' && pathn === '/api/consulta-previa-cpf') {
    let body = '';
    req.on('data', (c) => (body += c));
    req.on('end', async () => {
      try {
        const { cpf, dataNascimento } = JSON.parse(body || '{}');
        const token = await getToken();
        const out = await consultaPreviaCPF(cpf, dataNascimento, token);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, ...out }));
      } catch (e) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: e.message }));
      }
    });
    return;
  }

  if (req.method === 'POST' && pathn === '/api/consulta-previa-cnpj') {
    let body = '';
    req.on('data', (c) => (body += c));
    req.on('end', async () => {
      try {
        const { cnpj, cpfResponsavel, dataNascimento } = JSON.parse(body || '{}');
        const token = await getToken();
        const out = await consultaPreviaCNPJ(cnpj, cpfResponsavel, dataNascimento, token);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, ...out }));
      } catch (e) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: e.message }));
      }
    });
    return;
  }

  if (req.method === 'POST' && pathn === '/api/gerar-protocolo') {
    let body = '';
    req.on('data', (c) => (body += c));
    req.on('end', async () => {
      try {
        const payload = JSON.parse(body || '{}');
        const token = await getToken();
        const out = await gerarProtocolo(payload, token);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, protocolo: out }));
      } catch (e) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: e.message }));
      }
    });
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Endpoint não encontrado' }));
});

server.listen(APP.port, APP.host, () => {
  console.log(`[SAFEWEB] Proxy em http://${APP.host}:${APP.port}`);
});

