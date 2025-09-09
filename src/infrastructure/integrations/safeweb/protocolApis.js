/**
 * INTEGRAÇÕES PURAS - Sem Layout/DOM
 * Apenas as 4 APIs funcionando de forma limpa
 */

// ===== CONFIGURAÇÕES =====
const API_CONFIG = {
    ASSERTIVA: 'http://localhost:3001',
    SAFEWEB: 'http://localhost:3003',
    VIACEP: 'https://viacep.com.br/ws',
    RECEITAWS: 'https://www.receitaws.com.br/v1'
};

// ===== HTTP Helpers (https/http nativos) =====
const http = require('http');
const https = require('https');
const { URL } = require('url');

function requestJson(method, urlString, bodyObj) {
    return new Promise((resolve, reject) => {
        const u = new URL(urlString);
        const isHttps = u.protocol === 'https:';
        const lib = isHttps ? https : http;
        const payload = bodyObj ? Buffer.from(JSON.stringify(bodyObj)) : null;
        const req = lib.request(
            {
                hostname: u.hostname,
                port: u.port || (isHttps ? 443 : 80),
                path: `${u.pathname}${u.search}`,
                method,
                headers: {
                    'Content-Type': 'application/json',
                    ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {})
                }
            },
            (res) => {
                let data = '';
                res.on('data', (d) => (data += d));
                res.on('end', () => {
                    try {
                        const json = data ? JSON.parse(data) : {};
                        resolve({ ok: res.statusCode >= 200 && res.statusCode < 300, status: res.statusCode, json });
                    } catch (e) {
                        resolve({ ok: res.statusCode >= 200 && res.statusCode < 300, status: res.statusCode, text: data });
                    }
                });
            }
        );
        req.on('error', reject);
        if (payload) req.write(payload);
        req.end();
    });
}

async function safewebFetch(path, init) {
    const bases = [API_CONFIG.SAFEWEB];
    let lastErr;
    for (const base of bases) {
        try {
            const url = `${base}${path}`;
            const method = (init?.method || 'GET').toUpperCase();
            const body = init?.body ? JSON.parse(init.body) : undefined;
            const res = await requestJson(method, url, body);
            return {
                ok: res.ok,
                status: res.status,
                async json() { return res.json; }
            };
        } catch (e) {
            lastErr = e;
        }
    }
    throw lastErr || new Error('Safeweb fetch failed');
}

// ===== UTILITÁRIOS DE DADOS =====
const clean = {
    cpf: cpf => cpf.replace(/\D/g, ''),
    cnpj: cnpj => cnpj.replace(/\D/g, ''),
    cep: cep => cep.replace(/\D/g, ''),
    phone: phone => phone.replace(/\D/g, ''),
    dateToISO(date) {
        if (!date) return null;
        const raw = String(date);
        // DD/MM/YYYY
        if (raw.includes('/')) {
            const [d, m, y] = raw.split('/');
            return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
        }
        // YYYY-MM-DD[THH:MM:SS]
        if (raw.includes('-')) {
            return raw.split('T')[0];
        }
        // DDMMYYYY ou YYYYMMDD
        const only = raw.replace(/\D/g, '');
        if (only.length === 8) {
            // assume DDMMYYYY
            const dd = only.slice(0,2), mm = only.slice(2,4), yy = only.slice(4);
            return `${yy}-${mm}-${dd}`;
        }
        return raw;
    },
    // alias de compatibilidade
    date(date) { return clean.dateToISO(date); }
};

// ===== 1. INTEGRAÇÃO ASSERTIVA =====
const assertiva = {
    async consultarCPF(cpf) {
        const cleanCPF = clean.cpf(cpf);
        
        const response = await requestJson('POST', `${API_CONFIG.ASSERTIVA}/api/cpf`, { cpf: cleanCPF });
        if (!response.ok) throw new Error(`Assertiva HTTP ${response.status}`);
        const data = response.json;
        
        return {
            success: data.success,
            cpf: cleanCPF,
            dataNascimento: data.dataNascimento ? clean.date(data.dataNascimento) : null,
            encontrado: data.encontrado
        };
    }
};

// ===== 2. INTEGRAÇÃO SAFEWEB =====
const safeweb = {
    async validarBiometria(cpf) {
        const cleanCPF = clean.cpf(cpf);
        const response = await safewebFetch(`/api/validar-biometria`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cpf: cleanCPF })
        });
        if (!response.ok) throw new Error(`Safeweb Biometria HTTP ${response.status}`);
        const data = await response.json();
        return { success: !!data.success, cpf: cleanCPF, temBiometria: !!data.temBiometria };
    },
    async validarCPF(cpf, dataNascimento) {
        const cleanCPF = clean.cpf(cpf);
        const dt = clean.dateToISO(dataNascimento);
        
        const response = await safewebFetch(`/api/consulta-previa-cpf`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                cpf: cleanCPF, 
                dataNascimento: dt 
            })
        });
        
        if (!response.ok) throw new Error(`Safeweb CPF HTTP ${response.status}`);
        
        const data = await response.json();
        const codigo = data.codigo ?? data.Codigo;
        const mensagem = data.mensagem ?? data.Mensagem;
        return {
            success: !!data.success,
            cpf: cleanCPF,
            codigo,
            nome: mensagem,
            valido: !!data.success && codigo === 0
        };
    },

    async validarCNPJ(cnpj, cpfResponsavel, dataNascimento) {
        const cleanCNPJ = clean.cnpj(cnpj);
        const cleanCPF = clean.cpf(cpfResponsavel);
        const isoDate = clean.dateToISO(dataNascimento);
        
        const response = await safewebFetch(`/api/consulta-previa-cnpj`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                cnpj: cleanCNPJ,
                cpfResponsavel: cleanCPF,
                dataNascimento: isoDate
            })
        });
        
        if (!response.ok) throw new Error(`Safeweb CNPJ HTTP ${response.status}`);
        
        const data = await response.json();
        const codigo = data.codigo ?? data.Codigo;
        const mensagem = data.mensagem ?? data.Mensagem;
        return {
            success: !!data.success,
            cnpj: cleanCNPJ,
            cpfResponsavel: cleanCPF,
            codigo,
            razaoSocial: mensagem,
            representanteLegal: !!data.success && codigo === 0
        };
    },

    async gerarProtocolo(dadosProtocolo) {
        const response = await safewebFetch(`/api/gerar-protocolo`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dadosProtocolo)
        });
        
        if (!response.ok) throw new Error(`Safeweb Protocolo HTTP ${response.status}`);
        
        const data = await response.json();
        
        return {
            success: data.success,
            protocolo: data.protocolo,
            error: data.error
        };
    }
};

// ===== 3. INTEGRAÇÃO VIACEP =====
const viacep = {
    async consultarCEP(cep) {
        const cleanCEP = clean.cep(cep);
        
        const response = await requestJson('GET', `${API_CONFIG.VIACEP}/${cleanCEP}/json/`);
        if (!response.ok) throw new Error(`ViaCEP HTTP ${response.status}`);
        const data = response.json;
        
        if (data.erro) throw new Error('CEP não encontrado');
        
        return {
            cep: cleanCEP,
            logradouro: data.logradouro,
            complemento: data.complemento,
            bairro: data.bairro,
            localidade: data.localidade,
            uf: data.uf,
            ibge: data.ibge,
            gia: data.gia,
            ddd: data.ddd,
            siafi: data.siafi
        };
    }
};

// ===== 4. INTEGRAÇÃO RECEITAWS =====
const receitaws = {
    async consultarCNPJ(cnpj) {
        const cleanCNPJ = clean.cnpj(cnpj);
        
        // 1) Tenta ReceitaWS
        try {
            const response = await requestJson('GET', `${API_CONFIG.RECEITAWS}/cnpj/${cleanCNPJ}`);
            if (response.ok) {
                const data = response.json;
                if (data && data.status !== 'ERROR') {
                    return {
                        cnpj: cleanCNPJ,
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
                        cep: data.cep,
                        telefone: data.telefone,
                        email: data.email,
                        atividade_principal: data.atividade_principal,
                        atividades_secundarias: data.atividades_secundarias,
                        qsa: data.qsa
                    };
                }
            }
        } catch (_) {
            // ignora e tenta fallback
        }

        // 2) Fallback: BrasilAPI
        const respB = await requestJson('GET', `https://brasilapi.com.br/api/cnpj/v1/${cleanCNPJ}`);
        if (!respB.ok) throw new Error(`BrasilAPI HTTP ${respB.status}`);
        const b = respB.json;
        return {
            cnpj: cleanCNPJ,
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
            cep: b.cep,
            telefone: b.ddd_telefone_1 || b.telefone || undefined,
            email: b.email,
            atividade_principal: b.cnae_fiscal_descricao ? [{ text: b.cnae_fiscal_descricao, code: b.cnae_fiscal }] : [],
            atividades_secundarias: Array.isArray(b.cnaes_secundarios) ? b.cnaes_secundarios.map(x => ({ code: x.codigo, text: x.descricao })) : [],
            qsa: Array.isArray(b.qsa) ? b.qsa : []
        };
    }
};

// ===== FLUXOS INTEGRADOS =====
const fluxos = {
    // Fluxo completo e-CPF
    async eCPF(cpf) {
        console.log('🔍 Iniciando fluxo e-CPF para:', cpf);
        
        // 1. Buscar data na Assertiva
        const assertivaResult = await assertiva.consultarCPF(cpf);
        console.log('✅ Assertiva:', assertivaResult);
        
        if (!assertivaResult.success || !assertivaResult.dataNascimento) {
            throw new Error('Data de nascimento não encontrada na Assertiva');
        }
        
        // 2. Validar na Safeweb
        const safewebResult = await safeweb.validarCPF(cpf, assertivaResult.dataNascimento);
        console.log('✅ Safeweb:', safewebResult);
        
        if (!safewebResult.valido) {
            throw new Error('CPF inválido na Receita Federal');
        }
        
        return {
            cpf: assertivaResult.cpf,
            dataNascimento: assertivaResult.dataNascimento,
            nome: safewebResult.nome,
            validoRFB: true
        };
    },

    // Fluxo completo e-CNPJ
    async eCNPJ(cnpj, cpfResponsavel) {
        console.log('🏢 Iniciando fluxo e-CNPJ para:', cnpj, 'CPF:', cpfResponsavel);
        
        // 1. Buscar data do responsável na Assertiva
        const assertivaResult = await assertiva.consultarCPF(cpfResponsavel);
        console.log('✅ Assertiva (CPF responsável):', assertivaResult);
        
        if (!assertivaResult.success || !assertivaResult.dataNascimento) {
            throw new Error('Data de nascimento do responsável não encontrada');
        }
        
        // 2. Validar CPF do responsável na Safeweb
        const cpfResult = await safeweb.validarCPF(cpfResponsavel, assertivaResult.dataNascimento);
        console.log('✅ Safeweb (CPF responsável):', cpfResult);
        
        if (!cpfResult.valido) {
            throw new Error('CPF do responsável inválido na Receita Federal');
        }
        
        // 3. Validar representante legal na Safeweb
        const cnpjResult = await safeweb.validarCNPJ(cnpj, cpfResponsavel, assertivaResult.dataNascimento);
        console.log('✅ Safeweb (Representante legal):', cnpjResult);
        
        if (!cnpjResult.representanteLegal) {
            throw new Error('CPF não é representante legal da empresa');
        }
        
        // 4. Consultar dados da empresa na ReceitaWS (opcional)
        let empresaData = null;
        try {
            empresaData = await receitaws.consultarCNPJ(cnpj);
            console.log('✅ ReceitaWS (dados da empresa):', empresaData);
        } catch (error) {
            console.log('⚠️ ReceitaWS não disponível:', error.message);
        }
        
        return {
            cnpj: cnpjResult.cnpj,
            cpfResponsavel: cnpjResult.cpfResponsavel,
            dataNascimento: assertivaResult.dataNascimento,
            nomeResponsavel: cpfResult.nome,
            razaoSocial: cnpjResult.razaoSocial,
            representanteLegal: true,
            dadosEmpresa: empresaData
        };
    },

    // Fluxo de geração de protocolo
    async gerarProtocolo(tipo, dadosValidados, cep) {
        console.log('📋 Gerando protocolo', tipo);
        
        // 1. Buscar dados do CEP
        const cepData = await viacep.consultarCEP(cep);
        console.log('✅ ViaCEP:', cepData);
        
        // 2. Preparar dados do protocolo
        const protocolData = tipo === 'ecpf' 
            ? prepararProtocoloECPF(dadosValidados, cepData)
            : prepararProtocoloECNPJ(dadosValidados, cepData);
        
        // 3. Gerar protocolo na Safeweb
        const protocolResult = await safeweb.gerarProtocolo(protocolData);
        console.log('✅ Protocolo gerado:', protocolResult);
        
        return protocolResult;
    }
};

// ===== PREPARAÇÃO DE DADOS PARA PROTOCOLO =====
function prepararProtocoloECPF(dados, cep) {
    return {
        CnpjAR: "24398727000137",
        idProduto: "37341",
        Nome: dados.nome,
        CPF: dados.cpf,
        DataNascimento: dados.dataNascimento,
        CandidataRemocaoACI: false,
        DocumentoIdentidade: { TipoDocumento: 1, Numero: "000000000", Emissor: "SSP" },
        Contato: { DDD: "19", Telefone: "999999999", Email: "teste@teste.com" },
        Endereco: {
            Logradouro: cep.logradouro,
            Numero: "104",
            Bairro: cep.bairro,
            UF: cep.uf,
            Cidade: cep.localidade,
            CodigoIbgeMunicipio: cep.ibge,
            CodigoIbgeUF: "35",
            CEP: cep.cep
        },
        ClienteNotaFiscal: {
            Bairro: cep.bairro,
            Cep: cep.cep,
            Cidade: cep.localidade,
            CidadeCodigo: cep.ibge,
            Email1: "teste@teste.com",
            Endereco: cep.logradouro,
            Numero: "104",
            UF: cep.uf,
            UFCodigo: "35",
            Pais: "Brasil",
            PaisCodigoAlpha3: "BRA",
            IE: "",
            Sacado: dados.nome,
            Documento: dados.cpf
        }
    };
}

function prepararProtocoloECNPJ(dados, cep) {
    return {
        CnpjAR: "24398727000137",
        idProduto: "37342",
        RazaoSocial: dados.razaoSocial,
        NomeFantasia: dados.razaoSocial,
        CNPJ: dados.cnpj,
        Titular: {
            Nome: dados.nomeResponsavel,
            CPF: dados.cpfResponsavel,
            DataNascimento: dados.dataNascimento,
            NIS: "",
            Contato: { DDD: "19", Telefone: "999999999", Email: "teste@teste.com" },
            Endereco: {
                Logradouro: cep.logradouro,
                Numero: "104",
                Bairro: cep.bairro,
                UF: cep.uf,
                Cidade: cep.localidade,
                CodigoIbgeMunicipio: cep.ibge,
                CodigoIbgeUF: "35",
                CEP: cep.cep
            },
            DocumentoIdentidade: { TipoDocumento: 1, Numero: "000000000", Emissor: "SSP" }
        },
        Contato: { DDD: "19", Telefone: "999999999", Email: "teste@teste.com" },
        Endereco: {
            Logradouro: cep.logradouro,
            Numero: "104",
            Bairro: cep.bairro,
            UF: cep.uf,
            Cidade: cep.localidade,
            CodigoIbgeMunicipio: cep.ibge,
            CodigoIbgeUF: "35",
            CEP: cep.cep
        },
        ClienteNotaFiscal: {
            Bairro: cep.bairro,
            Cep: cep.cep,
            Cidade: cep.localidade,
            CidadeCodigo: cep.ibge,
            Email1: "teste@teste.com",
            Endereco: cep.logradouro,
            Numero: "104",
            UF: cep.uf,
            UFCodigo: "35",
            Pais: "Brasil",
            PaisCodigoAlpha3: "BRA",
            IE: "",
            Sacado: dados.razaoSocial,
            Documento: dados.cnpj
        }
    };
}

// ===== EXPORTAR PARA USO =====
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { assertiva, safeweb, viacep, receitaws, fluxos, clean };
} else {
    window.Integrations = { assertiva, safeweb, viacep, receitaws, fluxos, clean };
}
