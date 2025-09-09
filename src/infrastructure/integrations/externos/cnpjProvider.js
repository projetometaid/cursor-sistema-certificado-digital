const https = require('https');

function httpsGetJson(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, (res) => {
      let data = '';
      res.on('data', (d) => (data += d));
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, json });
        } catch (e) {
          reject(e);
        }
      });
    });
    req.on('error', reject);
  });
}

async function consultarCNPJ(cnpjRaw) {
  const cnpj = String(cnpjRaw).replace(/\D/g, '');

  // 1) Tenta ReceitaWS
  try {
    const { status, json } = await httpsGetJson(`https://www.receitaws.com.br/v1/cnpj/${cnpj}`);
    if (status === 200 && json && json.status !== 'ERROR') {
      return normalizeReceita(json, cnpj);
    }
  } catch (_) {}

  // 2) Fallback BrasilAPI
  const { status: stB, json: b } = await httpsGetJson(`https://brasilapi.com.br/api/cnpj/v1/${cnpj}`);
  if (stB !== 200 || !b) throw new Error(`BrasilAPI HTTP ${stB}`);
  return normalizeBrasilApi(b, cnpj);
}

function normalizeReceita(data, cnpj) {
  return {
    cnpj,
    nome: data.nome,
    fantasia: data.fantasia,
    situacao: data.situacao,
    tipo: data.tipo,
    porte: data.porte,
    natureza_juridica: data.natureza_juridica,
    logradouro: data.logradouro,
    numero: data.numero,
    complemento: data.complemento,
    bairro: data.bairro,
    municipio: data.municipio,
    uf: data.uf,
    cep: (data.cep || '').replace(/\D/g, ''),
    telefone: data.telefone,
    email: data.email,
    atividade_principal: data.atividade_principal,
    atividades_secundarias: data.atividades_secundarias,
    qsa: data.qsa
  };
}

function normalizeBrasilApi(b, cnpj) {
  return {
    cnpj,
    nome: b.razao_social,
    fantasia: b.nome_fantasia,
    situacao: b.descricao_situacao_cadastral || b.situacao_cadastral || undefined,
    tipo: b.descricao_identificador_matriz_filial || undefined,
    porte: b.porte || undefined,
    natureza_juridica: b.natureza_juridica || undefined,
    logradouro: b.logradouro,
    numero: b.numero,
    complemento: b.complemento,
    bairro: b.bairro,
    municipio: b.municipio,
    uf: b.uf,
    cep: (b.cep || '').replace(/\D/g, ''),
    telefone: b.ddd_telefone_1 || b.telefone || undefined,
    email: b.email,
    atividade_principal: b.cnae_fiscal_descricao ? [{ text: b.cnae_fiscal_descricao, code: b.cnae_fiscal }] : [],
    atividades_secundarias: Array.isArray(b.cnaes_secundarios) ? b.cnaes_secundarios.map((x) => ({ code: x.codigo, text: x.descricao })) : [],
    qsa: Array.isArray(b.qsa) ? b.qsa : []
  };
}

module.exports = { consultarCNPJ };


