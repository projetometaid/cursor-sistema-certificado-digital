/**
 * SCRIPT DE VALIDAÇÃO - VERIFICAR CONFIGURAÇÕES
 * 
 * Valida se todas as configurações estão corretas antes de executar o fluxo
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');

/**
 * VALIDAÇÕES ESSENCIAIS
 */
async function validarConfiguracoes() {
    console.log('🔍 VALIDANDO CONFIGURAÇÕES DO SISTEMA...\n');
    
    let erros = [];
    let avisos = [];
    
    // 1. Verificar arquivo .env
    console.log('📁 Verificando arquivo .env...');
    if (!fs.existsSync('.env')) {
        erros.push('Arquivo .env não encontrado na raiz do projeto');
    } else {
        console.log('✅ Arquivo .env encontrado');
    }
    
    // 2. Verificar variáveis Safeweb
    console.log('\n🔐 Verificando credenciais Safeweb...');
    const safewebVars = [
        'SAFEWEB_USERNAME',
        'SAFEWEB_PASSWORD', 
        'SAFEWEB_BASE_URL',
        'SAFEWEB_CNPJ_AR'
    ];
    
    safewebVars.forEach(varName => {
        if (!process.env[varName]) {
            erros.push(`Variável ${varName} não encontrada no .env`);
        } else {
            console.log(`✅ ${varName}: ${process.env[varName].substring(0, 10)}...`);
        }
    });
    
    // 3. Verificar variáveis Safe2Pay
    console.log('\n💳 Verificando credenciais Safe2Pay...');
    const safe2payVars = [
        'SAFE2PAY_TOKEN',
        'SAFE2PAY_API_SECRET_KEY'
    ];
    
    safe2payVars.forEach(varName => {
        if (!process.env[varName]) {
            erros.push(`Variável ${varName} não encontrada no .env`);
        } else {
            console.log(`✅ ${varName}: ${process.env[varName].substring(0, 10)}...`);
        }
    });
    
    // 4. Verificar estrutura de pastas
    console.log('\n📁 Verificando estrutura de pastas...');
    const pastasEssenciais = [
        'src/backend/proxies',
        'src/backend/integrations/safe2pay',
        'src/backend/integrations/protocolo'
    ];
    
    pastasEssenciais.forEach(pasta => {
        if (!fs.existsSync(pasta)) {
            erros.push(`Pasta não encontrada: ${pasta}`);
        } else {
            console.log(`✅ Pasta encontrada: ${pasta}`);
        }
    });
    
    // 5. Verificar arquivos essenciais
    console.log('\n📄 Verificando arquivos essenciais...');
    const arquivosEssenciais = [
        'src/backend/proxies/safeweb-proxy.js',
        'src/backend/integrations/safe2pay/Safe2PayHybrid.js',
        'src/backend/integrations/protocolo/apis.js',
        'package.json'
    ];
    
    arquivosEssenciais.forEach(arquivo => {
        if (!fs.existsSync(arquivo)) {
            erros.push(`Arquivo não encontrado: ${arquivo}`);
        } else {
            console.log(`✅ Arquivo encontrado: ${arquivo}`);
        }
    });
    
    // 6. Verificar .env na pasta Safeweb
    // 6. (Removido) Cópia de .env para pastas antigas - agora centralizado em config/.env na raiz
    
    // 7. Testar conectividade APIs externas
    console.log('\n🌐 Testando conectividade APIs externas...');
    
    try {
        console.log('📍 Testando ViaCEP...');
        const cepResponse = await fetch('https://viacep.com.br/ws/01310100/json/');
        const cepData = await cepResponse.json();
        
        if (cepData.erro) {
            avisos.push('API ViaCEP retornou erro para CEP de teste');
        } else {
            console.log(`✅ ViaCEP funcionando: ${cepData.localidade}/${cepData.uf}`);
        }
    } catch (error) {
        avisos.push(`Erro ao testar ViaCEP: ${error.message}`);
    }
    
    // 8. Verificar dependências Node.js
    console.log('\n📦 Verificando dependências...');
    try {
        const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        const dependenciasEssenciais = [
            'express',
            'dotenv',
            'cors'
        ];
        
        dependenciasEssenciais.forEach(dep => {
            if (packageJson.dependencies && packageJson.dependencies[dep]) {
                console.log(`✅ Dependência encontrada: ${dep}`);
            } else {
                avisos.push(`Dependência não encontrada: ${dep}`);
            }
        });
    } catch (error) {
        erros.push(`Erro ao ler package.json: ${error.message}`);
    }
    
    return { erros, avisos };
}

/**
 * TESTAR SERVIÇO SAFEWEB
 */
async function testarServicoSafeweb() {
    console.log('\n🧪 TESTANDO SERVIÇO SAFEWEB...');
    
    try {
        const response = await fetch('http://localhost:3002/api/test');
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Serviço Safeweb funcionando:', data.message);
            return true;
        } else {
            console.log('❌ Serviço Safeweb retornou erro:', response.status);
            return false;
        }
    } catch (error) {
        console.log('❌ Serviço Safeweb não está rodando');
        console.log('💡 Para iniciar: cd "API Safeweb" && node safeweb-proxy.js');
        return false;
    }
}

/**
 * GERAR RELATÓRIO
 */
function gerarRelatorio(erros, avisos, safewebOk) {
    console.log('\n' + '='.repeat(60));
    console.log('📊 RELATÓRIO DE VALIDAÇÃO');
    console.log('='.repeat(60));
    
    if (erros.length === 0) {
        console.log('✅ CONFIGURAÇÃO VÁLIDA - Sistema pronto para uso!');
    } else {
        console.log('❌ PROBLEMAS ENCONTRADOS:');
        erros.forEach((erro, index) => {
            console.log(`   ${index + 1}. ${erro}`);
        });
    }
    
    if (avisos.length > 0) {
        console.log('\n⚠️ AVISOS:');
        avisos.forEach((aviso, index) => {
            console.log(`   ${index + 1}. ${aviso}`);
        });
    }
    
    console.log('\n🔧 STATUS DOS SERVIÇOS:');
    console.log(`   Safeweb (porta 3002): ${safewebOk ? '✅ Funcionando' : '❌ Não rodando'}`);
    
    if (erros.length === 0 && safewebOk) {
        console.log('\n🚀 PRÓXIMO PASSO:');
        console.log('   Execute: node exemplo-gerar-protocolo-simples.js');
    } else {
        console.log('\n🔧 AÇÕES NECESSÁRIAS:');
        if (erros.length > 0) {
            console.log('   1. Corrigir erros listados acima');
        }
        if (!safewebOk) {
            console.log('   2. Iniciar serviço Safeweb: cd "API Safeweb" && node safeweb-proxy.js');
        }
        console.log('   3. Executar validação novamente: node validar-configuracao.js');
    }
}

/**
 * FUNÇÃO PRINCIPAL
 */
async function executarValidacao() {
    console.log('🔍 VALIDADOR DE CONFIGURAÇÃO - PROTOCOLO REAL + PAGAMENTO');
    console.log('=' .repeat(60));
    
    try {
        // Validar configurações
        const { erros, avisos } = await validarConfiguracoes();
        
        // Testar serviço Safeweb
        const safewebOk = await testarServicoSafeweb();
        
        // Gerar relatório
        gerarRelatorio(erros, avisos, safewebOk);
        
        // Retornar status
        return {
            sucesso: erros.length === 0 && safewebOk,
            erros: erros.length,
            avisos: avisos.length,
            safewebOk
        };
        
    } catch (error) {
        console.error('\n💥 Erro durante validação:', error.message);
        return {
            sucesso: false,
            erro: error.message
        };
    }
}

// Executar se chamado diretamente
if (require.main === module) {
    executarValidacao()
        .then((resultado) => {
            if (resultado.sucesso) {
                console.log('\n🎉 VALIDAÇÃO CONCLUÍDA - Sistema pronto!');
                process.exit(0);
            } else {
                console.log('\n⚠️ VALIDAÇÃO FALHOU - Corrija os problemas acima');
                process.exit(1);
            }
        })
        .catch((error) => {
            console.error('\n💥 Erro na validação:', error);
            process.exit(1);
        });
}

module.exports = {
    validarConfiguracoes,
    testarServicoSafeweb,
    executarValidacao
};
