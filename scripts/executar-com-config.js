/**
 * EXECUTAR FLUXO COM CONFIGURAÇÃO JSON
 * 
 * Script que lê configurações do arquivo config-cliente.json
 * e executa o fluxo completo de protocolo + pagamento
 */

require('dotenv').config();
const fs = require('fs');

/**
 * CARREGAR CONFIGURAÇÕES
 */
function carregarConfiguracoes() {
    console.log('📋 Carregando configurações...');
    
    try {
        if (!fs.existsSync('config-cliente.json')) {
            throw new Error('Arquivo config-cliente.json não encontrado');
        }
        
        const config = JSON.parse(fs.readFileSync('config-cliente.json', 'utf8'));
        
        console.log('✅ Configurações carregadas:');
        console.log(`   👤 Cliente: ${config.cliente.nome}`);
        console.log(`   📄 CPF: ${config.cliente.cpf}`);
        console.log(`   📧 Email: ${config.cliente.email}`);
        console.log(`   💰 Valor: R$ ${config.certificado.valor}`);
        
        return config;
        
    } catch (error) {
        console.error('❌ Erro ao carregar configurações:', error.message);
        throw error;
    }
}

/**
 * VALIDAR DADOS DO CLIENTE
 */
function validarDadosCliente(cliente) {
    console.log('🔍 Validando dados do cliente...');
    
    const erros = [];
    
    // Validar campos obrigatórios
    if (!cliente.nome || cliente.nome.length < 3) {
        erros.push('Nome deve ter pelo menos 3 caracteres');
    }
    
    if (!cliente.cpf || cliente.cpf.length !== 11) {
        erros.push('CPF deve ter 11 dígitos');
    }
    
    if (!cliente.email || !cliente.email.includes('@')) {
        erros.push('Email deve ser válido');
    }
    
    if (!cliente.telefone || cliente.telefone.length < 10) {
        erros.push('Telefone deve ter pelo menos 10 dígitos');
    }
    
    if (!cliente.endereco.cep || cliente.endereco.cep.length !== 8) {
        erros.push('CEP deve ter 8 dígitos');
    }
    
    if (!cliente.dataNascimento || !cliente.dataNascimento.match(/^\d{4}-\d{2}-\d{2}$/)) {
        erros.push('Data de nascimento deve estar no formato YYYY-MM-DD');
    }
    
    if (erros.length > 0) {
        console.error('❌ Erros de validação:');
        erros.forEach((erro, index) => {
            console.error(`   ${index + 1}. ${erro}`);
        });
        throw new Error('Dados do cliente inválidos');
    }
    
    console.log('✅ Dados do cliente válidos');
}

/**
 * GERAR PROTOCOLO COM CONFIGURAÇÃO
 */
async function gerarProtocoloComConfig(config) {
    console.log('\n📋 GERANDO PROTOCOLO COM CONFIGURAÇÃO...');
    
    try {
        const cliente = config.cliente;
        
        // 1. Consultar CEP
        console.log('📍 Consultando CEP:', cliente.endereco.cep);
        const cepResponse = await fetch(`https://viacep.com.br/ws/${cliente.endereco.cep}/json/`);
        const cepData = await cepResponse.json();
        
        if (cepData.erro) {
            throw new Error('CEP não encontrado');
        }
        
        console.log('✅ CEP encontrado:', cepData.localidade, '/', cepData.uf);
        
        // 2. Preparar dados para Safeweb
        const dadosProtocolo = {
            CnpjAR: process.env.SAFEWEB_CNPJ_AR || "24398727000137",
            idProduto: "37341", // e-CPF A1
            Nome: cliente.nome,
            CPF: cliente.cpf,
            DataNascimento: cliente.dataNascimento,
            CandidataRemocaoACI: false,
            DocumentoIdentidade: { 
                TipoDocumento: 1, 
                Numero: "123456789", 
                Emissor: "SSP" 
            },
            Contato: { 
                DDD: cliente.telefone.substring(0, 2), 
                Telefone: cliente.telefone.substring(2), 
                Email: cliente.email 
            },
            Endereco: {
                Logradouro: cepData.logradouro,
                Numero: cliente.endereco.numero,
                Bairro: cepData.bairro,
                UF: cepData.uf,
                Cidade: cepData.localidade,
                CodigoIbgeMunicipio: cepData.ibge,
                CodigoIbgeUF: "35", // SP
                CEP: cepData.cep.replace('-', '')
            },
            ClienteNotaFiscal: {
                Bairro: cepData.bairro,
                Cep: cepData.cep.replace('-', ''),
                Cidade: cepData.localidade,
                CidadeCodigo: cepData.ibge,
                Email1: cliente.email,
                Endereco: cepData.logradouro,
                Numero: cliente.endereco.numero,
                UF: cepData.uf,
                UFCodigo: "35",
                Pais: "Brasil",
                PaisCodigoAlpha3: "BRA",
                IE: "",
                Sacado: cliente.nome,
                Documento: cliente.cpf
            }
        };
        
        // 3. Chamar API Safeweb
        console.log('🔄 Enviando para API Safeweb...');
        const safewebResponse = await fetch('http://localhost:3002/api/gerar-protocolo', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dadosProtocolo)
        });
        
        if (!safewebResponse.ok) {
            throw new Error(`Erro API Safeweb: ${safewebResponse.status}`);
        }
        
        const resultado = await safewebResponse.json();
        
        if (!resultado.success) {
            throw new Error(`Erro ao gerar protocolo: ${resultado.error}`);
        }
        
        const protocoloNumero = resultado.protocolo.protocolo || resultado.protocolo;
        
        console.log('✅ PROTOCOLO GERADO:', protocoloNumero);
        
        return {
            numero: protocoloNumero,
            cliente: cliente,
            endereco: cepData,
            config: config
        };
        
    } catch (error) {
        console.error('❌ Erro ao gerar protocolo:', error.message);
        throw error;
    }
}

/**
 * CRIAR PAGAMENTO COM CONFIGURAÇÃO
 */
async function criarPagamentoComConfig(protocolo) {
    console.log('\n💳 CRIANDO PAGAMENTO COM CONFIGURAÇÃO...');
    
    try {
        // Importar sistema Safe2Pay
        const Safe2PayHybrid = require('../src/backend/integrations/safe2pay/Safe2PayHybrid');
        const safe2pay = new Safe2PayHybrid();
        
        const config = protocolo.config;
        const cliente = protocolo.cliente;
        
        const dadosPagamento = {
            valor: config.certificado.valor,
            cliente: {
                nome: cliente.nome,
                cpf: cliente.cpf,
                email: cliente.email,
                telefone: cliente.telefone,
                endereco: {
                    cep: protocolo.endereco.cep,
                    rua: protocolo.endereco.logradouro,
                    numero: cliente.endereco.numero,
                    complemento: cliente.endereco.complemento || '',
                    bairro: protocolo.endereco.bairro,
                    cidade: protocolo.endereco.localidade,
                    estado: protocolo.endereco.uf
                }
            },
            produto: {
                codigo: 'ECPF_A1',
                descricao: `Certificado Digital ${config.certificado.tipo} ${config.certificado.produto} - Protocolo: ${protocolo.numero}`
            },
            referencia: protocolo.numero, // ✅ PROTOCOLO COMO REFERÊNCIA
            callbackUrl: "https://webhook.site/certificado-config"
        };
        
        console.log('🎯 Protocolo como referência:', protocolo.numero);
        console.log('💰 Valor:', `R$ ${config.certificado.valor}`);
        console.log('📱 Tipo preferido:', config.pagamento.tipo_preferido);
        
        let resultado;
        
        if (config.pagamento.tipo_preferido === 'PIX') {
            resultado = await safe2pay.criarPix(dadosPagamento);
        } else {
            const diasVencimento = config.pagamento.vencimento_boleto_dias || 30;
            dadosPagamento.vencimento = new Date(Date.now() + diasVencimento * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR');
            resultado = await safe2pay.criarBoleto(dadosPagamento);
        }
        
        if (resultado.sucesso) {
            console.log('✅ PAGAMENTO CRIADO:', resultado.dados.id);
            console.log('🔗 Referência:', protocolo.numero);
            
            return {
                id: resultado.dados.id,
                tipo: config.pagamento.tipo_preferido,
                valor: resultado.dados.valor,
                referencia: protocolo.numero,
                qrCode: resultado.dados.qrCode || null,
                url: resultado.dados.url || null
            };
        } else {
            throw new Error(`Erro ao criar pagamento: ${resultado.erro}`);
        }
        
    } catch (error) {
        console.error('❌ Erro ao criar pagamento:', error.message);
        throw error;
    }
}

/**
 * FUNÇÃO PRINCIPAL
 */
async function executarFluxoComConfig() {
    console.log('🚀 EXECUTANDO FLUXO COM CONFIGURAÇÃO JSON');
    console.log('=' .repeat(60));
    
    try {
        // 1. Carregar configurações
        const config = carregarConfiguracoes();
        
        // 2. Validar dados
        validarDadosCliente(config.cliente);
        
        // 3. Gerar protocolo
        const protocolo = await gerarProtocoloComConfig(config);
        
        // 4. Criar pagamento
        const pagamento = await criarPagamentoComConfig(protocolo);
        
        // 5. Resumo final
        console.log('\n🎉 FLUXO EXECUTADO COM SUCESSO!');
        console.log('=' .repeat(60));
        console.log('📊 RESULTADOS:');
        console.log(`   👤 Cliente: ${config.cliente.nome}`);
        console.log(`   📋 Protocolo: ${protocolo.numero}`);
        console.log(`   💳 Pagamento: ${pagamento.id}`);
        console.log(`   💰 Valor: R$ ${pagamento.valor}`);
        console.log(`   🎯 Referência: ${pagamento.referencia}`);
        console.log(`   📱 Tipo: ${pagamento.tipo}`);
        
        if (pagamento.qrCode) {
            console.log(`   🔗 QR Code: ${pagamento.qrCode}`);
        }
        
        console.log('\n🔍 VERIFICAÇÃO:');
        console.log(`   • Busque no painel Safe2Pay pela referência: ${protocolo.numero}`);
        console.log(`   • Confirme que a transação ${pagamento.id} está vinculada`);
        
        return {
            protocolo: protocolo.numero,
            pagamento: pagamento.id,
            referencia: pagamento.referencia,
            config: config
        };
        
    } catch (error) {
        console.error('\n💥 ERRO NO FLUXO:', error.message);
        console.error('\n📋 VERIFICAÇÕES:');
        console.error('   • Arquivo config-cliente.json configurado?');
        console.error('   • Dados do cliente válidos?');
        console.error('   • Serviço Safeweb rodando na porta 3002?');
        console.error('   • Credenciais Safe2Pay corretas?');
        throw error;
    }
}

// Executar se chamado diretamente
if (require.main === module) {
    executarFluxoComConfig()
        .then((resultado) => {
            console.log('\n✅ SUCESSO! Fluxo executado com configuração JSON.');
            console.log('🎯 Rastreabilidade garantida:', resultado.referencia);
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n❌ FALHA na execução com configuração.');
            process.exit(1);
        });
}

module.exports = {
    carregarConfiguracoes,
    validarDadosCliente,
    gerarProtocoloComConfig,
    criarPagamentoComConfig,
    executarFluxoComConfig
};
