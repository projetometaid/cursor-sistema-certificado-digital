/**
 * Gera protocolo e-CNPJ e cria PIX usando o número do protocolo como referência
 */

require('dotenv').config();

async function main() {
    try {
        const fs = require('fs');
        const path = require('path');
        const Safe2PayHybrid = require('../src/backend/integrations/safe2pay/Safe2PayHybrid');
        const { receitaws } = require('../src/backend/integrations/protocolo/apis.js');
        const https = require('https');

        // Dados base (reaproveita config-cliente.json)
        const configPath = path.join(process.cwd(), 'config-cliente.json');
        if (!fs.existsSync(configPath)) throw new Error('config-cliente.json não encontrado');
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        const cliente = config.cliente;

        // Parâmetros solicitados
        const cnpjEmpresa = '24398727000137';
        const cep = '13070064';
        const numeroEndereco = '104';

        console.log('📍 Consultando CEP:', cep);
        const cepRes = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const cepData = await cepRes.json();
        if (cepData.erro) throw new Error('CEP não encontrado');

        // Tentar obter razão social via ReceitaWS (opcional)
        let razaoSocial = 'Empresa';
        try {
            const empresaData = await receitaws.consultarCNPJ(cnpjEmpresa);
            razaoSocial = empresaData.nome || empresaData.fantasia || razaoSocial;
        } catch (_) {}

        // Obter token Safeweb
        async function obterToken() {
            const authUrl = process.env.SAFEWEB_AUTH_URL || 'https://pss.safewebpss.com.br/Service/Microservice/Shared/HubAutenticacao/Autenticacoes/api/autorizacao/token';
            const credentials = Buffer.from(`${process.env.SAFEWEB_USERNAME}:${process.env.SAFEWEB_PASSWORD}`).toString('base64');
            const urlObj = new URL(authUrl);
            return new Promise((resolve, reject) => {
                const options = {
                    hostname: urlObj.hostname,
                    port: 443,
                    path: urlObj.pathname,
                    method: 'POST',
                    headers: { 'Authorization': `Basic ${credentials}`, 'Content-Type': 'application/json' }
                };
                const req = https.request(options, (res) => {
                    let data = '';
                    res.on('data', (c) => data += c);
                    res.on('end', () => {
                        try {
                            const parsed = JSON.parse(data);
                            if (res.statusCode === 200 && parsed.tokenAcesso) return resolve(parsed.tokenAcesso);
                            reject(new Error(`Auth falhou: ${res.statusCode} - ${data}`));
                        } catch (e) {
                            reject(new Error('Falha ao parsear token'));
                        }
                    });
                });
                req.on('error', (e) => reject(e));
                req.end();
            });
        }

        // Listar produtos por AR e tipo de emissão
        async function listarProdutos(idTipoEmissao, cnpjAR, token) {
            const pathProducts = `/Service/Microservice/Shared/Product/api/GetListProdutoByAR/${idTipoEmissao}/${cnpjAR}`;
            return new Promise((resolve, reject) => {
                const options = {
                    hostname: 'pss.safewebpss.com.br',
                    port: 443,
                    path: pathProducts,
                    method: 'GET',
                    headers: { 'Authorization': token }
                };
                const req = https.request(options, (res) => {
                    let data = '';
                    res.on('data', (c) => data += c);
                    res.on('end', () => {
                        if (res.statusCode === 200) {
                            try { resolve(JSON.parse(data)); } catch (e) { reject(new Error('Falha parse produtos')); }
                        } else {
                            reject(new Error(`Produtos ${res.statusCode} - ${data}`));
                        }
                    });
                });
                req.on('error', (e) => reject(e));
                req.end();
            });
        }

        // Descobrir idProduto e-CNPJ A1 (emissão presencial: 1)
        console.log('🛒 Listando produtos e-CNPJ para AR...');
        const token = await obterToken();
        const produtos = await listarProdutos(3, process.env.SAFEWEB_CNPJ_AR || '24398727000137', token);
        let produtoSelecionado = produtos.find(p => String(p.ProdutoTipo).toLowerCase().includes('e-cnpj') && String(p.ProdutoModelo).toUpperCase() === 'A1') || produtos[0];
        console.log('🆔 idProduto selecionado:', produtoSelecionado?.idProduto);
        if (!produtoSelecionado) throw new Error('Nenhum produto e-CNPJ encontrado para este AR');

        // Montar payload e-CNPJ com idProduto encontrado
        const dadosProtocolo = {
            CnpjAR: process.env.SAFEWEB_CNPJ_AR || '24398727000137',
            idProduto: String(produtoSelecionado.idProduto),
            CodigoParceiro: process.env.SAFEWEB_CODIGO_PARCEIRO || undefined,
            CandidataRemocaoACI: false,
            RazaoSocial: razaoSocial,
            NomeFantasia: razaoSocial,
            CNPJ: cnpjEmpresa,
            Titular: {
                Nome: cliente.nome,
                CPF: cliente.cpf,
                DataNascimento: cliente.dataNascimento,
                NIS: '',
                Contato: {
                    DDD: cliente.telefone.substring(0, 2),
                    Telefone: cliente.telefone.substring(2),
                    Email: cliente.email
                },
                Endereco: {
                    Logradouro: cepData.logradouro,
                    Numero: numeroEndereco,
                    Bairro: cepData.bairro,
                    UF: cepData.uf,
                    Cidade: cepData.localidade,
                    CodigoIbgeMunicipio: cepData.ibge,
                    CodigoIbgeUF: '35',
                    CEP: cep.replace('-', '')
                },
                DocumentoIdentidade: { TipoDocumento: 1, Numero: '123456789', Emissor: 'SSP' }
            },
            Contato: {
                DDD: cliente.telefone.substring(0, 2),
                Telefone: cliente.telefone.substring(2),
                Email: cliente.email
            },
            Endereco: {
                Logradouro: cepData.logradouro,
                Numero: numeroEndereco,
                Bairro: cepData.bairro,
                UF: cepData.uf,
                Cidade: cepData.localidade,
                CodigoIbgeMunicipio: cepData.ibge,
                CodigoIbgeUF: '35',
                CEP: cep.replace('-', '')
            },
            ClienteNotaFiscal: {
                Bairro: cepData.bairro,
                Cep: cep.replace('-', ''),
                Cidade: cepData.localidade,
                CidadeCodigo: cepData.ibge,
                Email1: cliente.email,
                Endereco: cepData.logradouro,
                Numero: numeroEndereco,
                UF: cepData.uf,
                UFCodigo: '35',
                Pais: 'Brasil',
                PaisCodigoAlpha3: 'BRA',
                IE: '',
                Sacado: razaoSocial,
                Documento: cnpjEmpresa
            }
        };

        console.log('🔄 Enviando para API Safeweb (e-CNPJ)...');
        const resp = await fetch('http://localhost:3002/api/gerar-protocolo', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dadosProtocolo)
        });
        if (!resp.ok) throw new Error(`Erro API Safeweb: ${resp.status}`);
        const resultado = await resp.json();
        if (!resultado.success) throw new Error(resultado.error || 'Falha ao gerar protocolo');
        const protocolo = resultado.protocolo.protocolo || resultado.protocolo;
        console.log('✅ Protocolo e-CNPJ gerado:', protocolo);

        // Criar PIX com referência = protocolo
        const safe2pay = new Safe2PayHybrid();
        const dadosPagamento = {
            valor: config.certificado.valor,
            cliente: {
                nome: cliente.nome,
                cpf: cliente.cpf,
                email: cliente.email,
                telefone: cliente.telefone,
                endereco: {
                    cep: cep,
                    rua: cepData.logradouro,
                    numero: numeroEndereco,
                    complemento: cliente.endereco.complemento || '',
                    bairro: cepData.bairro,
                    cidade: cepData.localidade,
                    estado: cepData.uf
                }
            },
            produto: {
                codigo: 'ECNPJ_A1',
                descricao: `Certificado Digital e-CNPJ A1 - Protocolo: ${protocolo}`
            },
            referencia: protocolo,
            callbackUrl: 'https://webhook.site/certificado-config'
        };

        const pix = await safe2pay.criarPix(dadosPagamento);
        if (!pix.sucesso) throw new Error(pix.erro || 'Falha ao criar PIX');

        console.log('🎉 Sucesso!');
        console.log('📋 Protocolo:', protocolo);
        console.log('💳 Pagamento (PIX) ID:', pix.dados.id);
        console.log('🎯 Referência:', pix.dados.referencia);
        if (pix.dados.qrCode) console.log('🔗 QR Code:', pix.dados.qrCode);
    } catch (err) {
        console.error('❌ Erro:', err.message);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = { main };


