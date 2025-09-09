const { Router } = require('express');

// Usa integrações já existentes
const integrations = require('../../../infrastructure/integrations/safeweb/protocolApis');
const Safe2PayHybrid = require('../../../backend/integrations/safe2pay/Safe2PayHybrid');

module.exports = function buildProtocolsRouter() {
  const router = Router();

  // Helper: converte dados do ViaCEP para o formato esperado pela Safeweb
  async function mapViaCepToSafewebAddress(cep, numero) {
    try {
      const cepData = await integrations.viacep.consultarCEP(String(cep));
      const cleanedCep = String(cep).replace(/\D/g, '');
      const toUpper = (v) => (v ? String(v).toUpperCase() : '—');
      const ibgeMunicipio = String(cepData?.ibge || '');
      const ibgeUF = ibgeMunicipio ? ibgeMunicipio.slice(0, 2) : '35';
      const uf = toUpper(cepData?.uf || 'SP');
      const cidade = toUpper(cepData?.localidade || '—');
      const bairro = toUpper(cepData?.bairro || '—');
      const logradouro = toUpper(cepData?.logradouro || '—');
      const numeroStr = String(numero || 'S/N');

      return {
        main: {
          Logradouro: logradouro,
          Numero: numeroStr,
          Bairro: bairro,
          UF: uf,
          Cidade: cidade,
          CodigoIbgeMunicipio: ibgeMunicipio,
          CodigoIbgeUF: ibgeUF,
          CEP: cleanedCep
        },
        invoice: (email, razao, doc) => ({
          Bairro: bairro,
          Cep: cleanedCep,
          Cidade: cidade,
          CidadeCodigo: ibgeMunicipio,
          Email1: email,
          Endereco: logradouro,
          Numero: numeroStr,
          UF: uf,
          UFCodigo: ibgeUF,
          Pais: 'Brasil',
          PaisCodigoAlpha3: 'BRA',
          IE: '',
          Sacado: razao,
          Documento: doc
        })
      };
    } catch (_) {
      return null;
    }
  }

  // Helper: monta payload e-CNPJ Safeweb (usa address.main e address.invoice)
  function buildEcnpjPayload(params) {
    const {
      cnpj,
      razao,
      fantasia,
      cpfResponsavel,
      nomeResponsavel,
      dataNascimentoISO,
      email,
      telefone,
      address
    } = params;

    const mainAddr = address.main;
    const invoice = address.invoice(email, razao, String(cnpj).replace(/\D/g, ''));

    return {
      CnpjAR: '24398727000137',
      idProduto: '37342',
      RazaoSocial: razao,
      NomeFantasia: fantasia || razao,
      CNPJ: String(cnpj).replace(/\D/g, ''),
      Titular: {
        Nome: nomeResponsavel || '—',
        CPF: String(cpfResponsavel).replace(/\D/g, ''),
        DataNascimento: dataNascimentoISO,
        NIS: '',
        Contato: {
          DDD: String(telefone || '').replace(/\D/g, '').slice(0, 2) || '11',
          Telefone: String(telefone || '').replace(/\D/g, '').slice(2) || '999999999',
          Email: email
        },
        Endereco: mainAddr,
        DocumentoIdentidade: { TipoDocumento: 1, Numero: '000000000', Emissor: 'SSP' }
      },
      Contato: {
        DDD: String(telefone || '').replace(/\D/g, '').slice(0, 2) || '11',
        Telefone: String(telefone || '').replace(/\D/g, '').slice(2) || '999999999',
        Email: email
      },
      Endereco: mainAddr,
      ClienteNotaFiscal: invoice,
      CandidataRemocaoACI: false
    };
  }

  // Helper: criar PIX com referência (Safe2Pay)
  async function createPix(valor, payer, protocolo) {
    const s2p = new Safe2PayHybrid();
    return s2p.criarPix({
      valor,
      cliente: payer,
      produto: { codigo: 'ECNPJ_A1', descricao: 'Certificado Digital e-CNPJ A1' },
      referencia: protocolo,
      callbackUrl: 'http://localhost:3000/webhooks/safe2pay'
    });
  }

  // POST /protocols/ecpf → cpf, email, telefone, cep, numero, nome, dataNascimento?
  router.post('/ecpf', async (req, res) => {
    try {
      const { cpf, email, telefone, cep, numero, nome, dataNascimento } = req.body || {};
      if (!cpf || !email || !telefone || !cep || !numero) {
        return res.status(400).json({ ok: false, error: 'cpf, email, telefone, cep, numero são obrigatórios' });
      }

      // 0) Verificar biometria primeiro
      const bio = await integrations.safeweb.validarBiometria(cpf);
      if (!bio?.temBiometria) {
        return res.status(400).json({ ok: false, error: 'CPF sem biometria cadastrada no PSBio' });
      }

      // 1) Data de nascimento: usa a enviada, senão busca Assertiva
      let dobISO = null;        // YYYY-MM-DD
      let dobDDMMYYYY = null;   // DDMMYYYY (para consulta prévia)

      if (dataNascimento) {
        const raw = String(dataNascimento);
        const digits = raw.replace(/\D/g, '');
        if (digits.length === 8) {
          // assume DDMMYYYY
          const dd = digits.slice(0, 2);
          const mm = digits.slice(2, 4);
          const yyyy = digits.slice(4);
          dobDDMMYYYY = `${dd}${mm}${yyyy}`;
          dobISO = `${yyyy}-${mm}-${dd}`;
        } else if (digits.length >= 8) {
          // tenta YYYYMMDD*
          const yyyy = digits.slice(0, 4);
          const mm = digits.slice(4, 6);
          const dd = digits.slice(6, 8);
          dobISO = `${yyyy}-${mm}-${dd}`;
          dobDDMMYYYY = `${dd}${mm}${yyyy}`;
        } else if (raw.includes('-')) {
          // YYYY-MM-DD
          const [y, m, d] = raw.split('T')[0].split('-');
          dobISO = `${y}-${m}-${d}`;
          dobDDMMYYYY = `${d}${m}${y}`;
        } else if (raw.includes('/')) {
          // DD/MM/YYYY
          const [d, m, y] = raw.split('/');
          dobISO = `${y}-${m}-${d}`;
          dobDDMMYYYY = `${d}${m}${y}`;
        }
      }

      if (!dobISO || !dobDDMMYYYY) {
        const a = await integrations.assertiva.consultarCPF(cpf);
        if (!a?.success || !a?.dataNascimento) {
          return res.status(400).json({ ok: false, error: 'Data de nascimento não encontrada na Assertiva' });
        }
        dobISO = a.dataNascimento; // já vem YYYY-MM-DD
        const [y, m, d] = dobISO.split('-');
        dobDDMMYYYY = `${d}${m}${y}`;
      }

      // 2) ViaCEP → endereço
      const cepData = await integrations.viacep.consultarCEP(String(cep));

      // 3) Safeweb → consulta prévia CPF (usa DD/MM/YYYY)
      const [yy, mm, dd] = dobISO.split('-');
      const dobBR = `${dd}/${mm}/${yy}`;
      const v = await integrations.safeweb.validarCPF(cpf, dobBR);
      if (!v?.valido) {
        return res.status(400).json({ ok: false, error: 'CPF inválido na RFB' });
      }

      // 4) Montar payload protocolo (ajustando campos do helper)
      const payload = {
        CnpjAR: process.env.SAFEWEB_CNPJ_AR,
        idProduto: process.env.SAFEWEB_ID_PRODUTO_ECPF || '37341',
        Nome: nome || v.nome || '—',
        CPF: integrations.clean.cpf(cpf),
        DataNascimento: dobISO,
        CandidataRemocaoACI: false,
        DocumentoIdentidade: { TipoDocumento: 1, Numero: '000000000', Emissor: 'SSP' },
        Contato: { DDD: String(telefone).replace(/\D/g, '').slice(0, 2), Telefone: String(telefone).replace(/\D/g, '').slice(2), Email: email },
        Endereco: {
          Logradouro: cepData.logradouro,
          Numero: String(numero),
          Bairro: cepData.bairro,
          UF: cepData.uf,
          Cidade: cepData.localidade,
          CodigoIbgeMunicipio: cepData.ibge,
          CodigoIbgeUF: '35',
          CEP: String(cep).replace(/\D/g, '')
        },
        ClienteNotaFiscal: {
          Bairro: cepData.bairro,
          Cep: String(cep).replace(/\D/g, ''),
          Cidade: cepData.localidade,
          CidadeCodigo: cepData.ibge,
          Email1: email,
          Endereco: cepData.logradouro,
          Numero: String(numero),
          UF: cepData.uf,
          UFCodigo: '35',
          Pais: 'Brasil',
          PaisCodigoAlpha3: 'BRA',
          IE: '',
          Sacado: nome || v.nome || '—',
          Documento: integrations.clean.cpf(cpf)
        }
      };

      // 5) Gerar protocolo
      const pr = await integrations.safeweb.gerarProtocolo(payload);
      if (!pr?.success) {
        return res.status(502).json({ ok: false, error: pr?.error || 'Falha ao gerar protocolo' });
      }
      const protocolo = pr.protocolo?.protocolo || pr.protocolo || '—';

      // 6) Criar PIX com referência = protocolo
      const payer = {
        nome: nome || v.nome || '—',
        cpf: integrations.clean.cpf(cpf),
        email,
        telefone: String(telefone).replace(/\D/g, ''),
        endereco: {
          cep: String(cep).replace(/\D/g, ''),
          rua: cepData.logradouro,
          numero: String(numero),
          complemento: '',
          bairro: cepData.bairro,
          cidade: cepData.localidade,
          estado: cepData.uf
        }
      };
      const s2p = new Safe2PayHybrid();
      const pix = await s2p.criarPix({
        valor: 120.0,
        cliente: payer,
        produto: { codigo: 'ECPF_A1', descricao: 'Certificado Digital e-CPF A1' },
        referencia: protocolo,
        callbackUrl: 'http://localhost:3000/webhooks/safe2pay'
      });

      return res.status(201).json({ ok: true, protocolo, pix });
    } catch (e) {
      return res.status(500).json({ ok: false, error: e?.message || 'erro interno' });
    }
  });

  // POST /protocols/ecnpj → cnpj, cpfResponsavel, email, telefone, cepPessoa, numeroPessoa
  router.post('/ecnpj', async (req, res) => {
    try {
      const { cnpj, cpfResponsavel, email, telefone, cepPessoa, numeroPessoa } = req.body || {};
      if (!cnpj || !cpfResponsavel || !email || !telefone || !cepPessoa || !numeroPessoa) {
        return res.status(400).json({ ok: false, error: 'cnpj, cpfResponsavel, email, telefone, cepPessoa, numeroPessoa são obrigatórios' });
      }

      // 1) Dados da empresa (Provider consolidado: ReceitaWS → BrasilAPI)
      const { consultarCNPJ } = require('../../../infrastructure/integrations/externos/cnpjProvider');
      const empresa = await consultarCNPJ(String(cnpj));
      const razao = empresa?.nome || empresa?.fantasia || '—';
      // Endereço via ViaCEP (obrigatório)
      const addrMap = await mapViaCepToSafewebAddress(cepPessoa, numeroPessoa);
      if (!addrMap) return res.status(400).json({ ok: false, error: 'CEP inválido' });

      // 2) Precisamos do CPF e data do responsável para consulta prévia
      if (!cpfResponsavel) {
        return res.status(400).json({ ok: false, error: 'cpfResponsavel é obrigatório para consulta prévia' });
      }
      const a = await integrations.assertiva.consultarCPF(cpfResponsavel);
      if (!a?.success || !a?.dataNascimento) {
        return res.status(400).json({ ok: false, error: 'Data de nascimento do responsável não encontrada na Assertiva' });
      }

      // 3) Safeweb → validações (CPF e CNPJ)
      const cpfOk = await integrations.safeweb.validarCPF(cpfResponsavel, a.dataNascimento);
      if (!cpfOk?.valido) return res.status(400).json({ ok: false, error: 'CPF responsável inválido na RFB' });
      const cnpjOk = await integrations.safeweb.validarCNPJ(cnpj, cpfResponsavel, a.dataNascimento);
      if (!cnpjOk?.representanteLegal) {
        return res.status(400).json({ ok: false, error: 'CPF não é representante legal na RFB' });
      }

      // 4) Montar payload do protocolo e-CNPJ via helper
      const cnpjAR = process.env.SAFEWEB_CNPJ_AR;
      if (!cnpjAR) return res.status(500).json({ ok: false, error: 'SAFEWEB_CNPJ_AR não configurado' });
      const payload = buildEcnpjPayload({
        cnpj,
        razao,
        fantasia: empresa?.fantasia,
        cpfResponsavel,
        nomeResponsavel: cpfOk?.nome,
        dataNascimentoISO: a.dataNascimento,
        email: email || empresa?.email || 'contato@empresa.com',
        telefone,
        address: addrMap
      });
      payload.CnpjAR = cnpjAR;

      // 5) Gerar protocolo
      const pr = await integrations.safeweb.gerarProtocolo(payload);
      if (!pr?.success) return res.status(502).json({ ok: false, error: pr?.error || 'Falha ao gerar protocolo' });
      const protocolo = pr.protocolo?.protocolo || pr.protocolo || '—';

      // 6) Criar PIX (referência = protocolo)
      const pix = await createPix(120.0, {
        nome: razao,
        cpf: String(cnpj).replace(/\D/g,''),
        email: email || empresa?.email || 'contato@empresa.com',
        telefone: String(telefone||'').replace(/\D/g,''),
        endereco: {
          cep: addrMap.main.CEP,
          rua: addrMap.main.Logradouro,
          numero: addrMap.main.Numero,
          complemento: '',
          bairro: addrMap.main.Bairro,
          cidade: addrMap.main.Cidade,
          estado: addrMap.main.UF
        }
      }, protocolo);

      return res.status(201).json({ ok: true, protocolo, pix });
    } catch (e) {
      return res.status(500).json({ ok: false, error: e.message });
    }
  });

  // POST /protocols/ecnpj/full → cpf, cnpj, cepPessoa, numeroPessoa, email, telefone, nome?
  router.post('/ecnpj/full', async (req, res) => {
    try {
      const { cpf, cnpj, cepPessoa, numeroPessoa, email, telefone, nome } = req.body || {};
      if (!cpf || !cnpj || !cepPessoa || !numeroPessoa || !email || !telefone) {
        return res.status(400).json({ ok: false, error: 'cpf, cnpj, cepPessoa, numeroPessoa, email, telefone são obrigatórios' });
      }

      // 1) Biometria
      const bio = await integrations.safeweb.validarBiometria(cpf);
      if (!bio?.temBiometria) {
        return res.status(400).json({ ok: false, error: 'CPF sem biometria no PSBio' });
      }

      // 2) Assertiva → data nascimento
      const a = await integrations.assertiva.consultarCPF(cpf);
      if (!a?.success || !a?.dataNascimento) return res.status(400).json({ ok: false, error: 'Data de nascimento não encontrada na Assertiva' });

      // 3) Consulta prévia CPF
      const cpfOk = await integrations.safeweb.validarCPF(cpf, a.dataNascimento);
      if (!cpfOk?.valido) return res.status(400).json({ ok: false, error: 'CPF inválido na RFB' });

      // 4) Consulta prévia CNPJ (representante legal)
      const cnpjOk = await integrations.safeweb.validarCNPJ(cnpj, cpf, a.dataNascimento);
      if (!cnpjOk?.representanteLegal) return res.status(400).json({ ok: false, error: 'CPF não é representante legal' });

      // 5) Endereços (ViaCEP)
      const addrMap = await mapViaCepToSafewebAddress(cepPessoa, numeroPessoa);
      if (!addrMap) return res.status(400).json({ ok: false, error: 'CEP inválido' });
      const { consultarCNPJ } = require('../../../infrastructure/integrations/externos/cnpjProvider');
      const empresa = await consultarCNPJ(String(cnpj));
      const titularEndereco = addrMap.main;

      // 6) Protocolo e-CNPJ (endereços + dados validados)
      const payload = buildEcnpjPayload({
        cnpj,
        razao: empresa?.nome || cnpjOk?.razaoSocial || '—',
        fantasia: empresa?.fantasia || empresa?.nome || '—',
        cpfResponsavel: cpf,
        nomeResponsavel: nome || cpfOk?.nome || '—',
        dataNascimentoISO: a.dataNascimento,
        email,
        telefone,
        address: addrMap
      });
      payload.CnpjAR = process.env.SAFEWEB_CNPJ_AR;
      payload.idProduto = process.env.SAFEWEB_ID_PRODUTO_ECNPJ || '37342';

      const pr = await integrations.safeweb.gerarProtocolo(payload);
      if (!pr?.success) return res.status(502).json({ ok: false, error: pr?.error || 'Falha ao gerar protocolo' });
      const protocolo = pr.protocolo?.protocolo || pr.protocolo || '—';

      const pix = await createPix(120.0, {
        nome: empresa?.nome || '—',
        cpf: String(cnpj).replace(/\D/g, ''),
        email,
        telefone: String(telefone).replace(/\D/g, ''),
        endereco: {
          cep: addrMap.main.CEP,
          rua: addrMap.main.Logradouro,
          numero: addrMap.main.Numero,
          complemento: '',
          bairro: addrMap.main.Bairro,
          cidade: addrMap.main.Cidade,
          estado: addrMap.main.UF
        }
      }, protocolo);

      return res.status(201).json({ ok: true, protocolo, pix });
    } catch (e) {
      return res.status(500).json({ ok: false, error: e?.message || 'erro interno' });
    }
  });

  // POST /protocols/consulta_previa_cnpj → cnpj, cpf, dataNascimento? → retorna status da RFB (representante legal)
  router.post('/consulta_previa_cnpj', async (req, res) => {
    try {
      const { cnpj, cpf, dataNascimento } = req.body || {};
      if (!cnpj || !cpf) {
        return res.status(400).json({ ok: false, error: 'cnpj e cpf são obrigatórios' });
      }

      // normaliza/recupera data
      let dobISO = null;
      if (dataNascimento) {
        const raw = String(dataNascimento);
        const digits = raw.replace(/\D/g, '');
        if (raw.includes('-')) dobISO = raw.split('T')[0];
        else if (raw.includes('/')) { const [d,m,y] = raw.split('/'); dobISO = `${y}-${m}-${d}`; }
        else if (digits.length === 8) { const dd=digits.slice(0,2), mm=digits.slice(2,4), yy=digits.slice(4); dobISO = `${yy}-${mm}-${dd}`; }
      }
      if (!dobISO) {
        const a = await integrations.assertiva.consultarCPF(cpf);
        if (!a?.success || !a?.dataNascimento) return res.status(400).json({ ok:false, error:'Data de nascimento não encontrada na Assertiva' });
        dobISO = a.dataNascimento;
      }

      const r = await integrations.safeweb.validarCNPJ(cnpj, cpf, dobISO);
      return res.json({ ok: true, resultado: r });
    } catch (e) {
      return res.status(500).json({ ok: false, error: e?.message || 'erro interno' });
    }
  });

  return router;
};


