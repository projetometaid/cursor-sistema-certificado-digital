/**
 * SCRIPT DE INICIALIZAÇÃO AUTOMÁTICA
 * 
 * Inicia todos os serviços necessários e executa o fluxo completo
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * CONFIGURAÇÕES
 */
const CONFIG = {
    PORTA_SAFEWEB: 3002,
    TEMPO_ESPERA_SERVICOS: 5000, // 5 segundos
    DADOS_CLIENTE_PADRAO: {
        nome: "Cliente Teste",
        cpf: "38601836801", // CPF do Leandro para teste
        dataNascimento: "1989-01-28",
        email: "teste@certificadocampinas.com.br",
        telefone: "19997888810",
        cep: "13070064",
        numero: "104"
    }
};

/**
 * UTILITÁRIOS
 */
function log(emoji, mensagem) {
    console.log(`${emoji} ${mensagem}`);
}

function aguardar(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * VERIFICAR PRÉ-REQUISITOS
 */
async function verificarPreRequisitos() {
    log('🔍', 'Verificando pré-requisitos...');
    
    // Verificar .env
    if (!fs.existsSync('.env')) {
        throw new Error('Arquivo .env não encontrado');
    }
    
    // Verificar pasta Safeweb
    if (!fs.existsSync('API Safeweb')) {
        throw new Error('Pasta "API Safeweb" não encontrada');
    }
    
    // Copiar .env para Safeweb se necessário
    const envSafeweb = path.join('API Safeweb', '.env');
    if (!fs.existsSync(envSafeweb)) {
        fs.copyFileSync('.env', envSafeweb);
        log('📋', '.env copiado para pasta Safeweb');
    }
    
    log('✅', 'Pré-requisitos verificados');
}

/**
 * INICIAR SERVIÇO SAFEWEB
 */
async function iniciarServicoSafeweb() {
    log('🚀', 'Iniciando serviço Safeweb...');
    
    return new Promise((resolve, reject) => {
        const processo = spawn('node', ['safeweb-proxy.js'], {
            cwd: 'API Safeweb',
            stdio: 'pipe'
        });
        
        let servicoIniciado = false;
        
        processo.stdout.on('data', (data) => {
            const output = data.toString();
            
            if (output.includes('Proxy Safeweb iniciado')) {
                servicoIniciado = true;
                log('✅', 'Serviço Safeweb iniciado na porta 3002');
                resolve(processo);
            }
        });
        
        processo.stderr.on('data', (data) => {
            console.error('Erro Safeweb:', data.toString());
        });
        
        processo.on('error', (error) => {
            reject(new Error(`Erro ao iniciar Safeweb: ${error.message}`));
        });
        
        // Timeout
        setTimeout(() => {
            if (!servicoIniciado) {
                processo.kill();
                reject(new Error('Timeout ao iniciar serviço Safeweb'));
            }
        }, 10000);
    });
}

/**
 * TESTAR CONECTIVIDADE
 */
async function testarConectividade() {
    log('🧪', 'Testando conectividade...');
    
    try {
        const response = await fetch(`http://localhost:${CONFIG.PORTA_SAFEWEB}/api/test`);
        
        if (response.ok) {
            log('✅', 'Serviço Safeweb respondendo');
            return true;
        } else {
            throw new Error(`Serviço retornou: ${response.status}`);
        }
    } catch (error) {
        throw new Error(`Erro de conectividade: ${error.message}`);
    }
}

/**
 * EXECUTAR FLUXO COMPLETO
 */
async function executarFluxoCompleto() {
    log('🎯', 'Executando fluxo completo...');
    
    try {
        // Importar função do exemplo
        const { executarFluxoCompleto } = require('./exemplo-gerar-protocolo-simples');
        
        const resultado = await executarFluxoCompleto();
        
        log('🎉', 'Fluxo executado com sucesso!');
        log('📋', `Protocolo: ${resultado.protocolo}`);
        log('💳', `Pagamento: ${resultado.pagamento}`);
        log('🔗', `Referência: ${resultado.referencia}`);
        
        return resultado;
        
    } catch (error) {
        throw new Error(`Erro no fluxo: ${error.message}`);
    }
}

/**
 * GERAR DADOS DE TESTE
 */
function gerarDadosTeste() {
    log('📝', 'Configurando dados de teste...');
    
    // Ler arquivo exemplo
    const arquivoExemplo = 'exemplo-gerar-protocolo-simples.js';
    let conteudo = fs.readFileSync(arquivoExemplo, 'utf8');
    
    // Substituir dados do cliente
    const dadosAtuais = /const DADOS_CLIENTE = \{[\s\S]*?\};/;
    const novosDados = `const DADOS_CLIENTE = ${JSON.stringify(CONFIG.DADOS_CLIENTE_PADRAO, null, 4)};`;
    
    conteudo = conteudo.replace(dadosAtuais, novosDados);
    
    // Salvar arquivo temporário
    const arquivoTemp = 'exemplo-temp.js';
    fs.writeFileSync(arquivoTemp, conteudo);
    
    log('✅', 'Dados de teste configurados');
    return arquivoTemp;
}

/**
 * LIMPAR RECURSOS
 */
function limparRecursos(processos, arquivosTemp) {
    log('🧹', 'Limpando recursos...');
    
    // Finalizar processos
    processos.forEach(processo => {
        if (processo && !processo.killed) {
            processo.kill();
        }
    });
    
    // Remover arquivos temporários
    arquivosTemp.forEach(arquivo => {
        if (fs.existsSync(arquivo)) {
            fs.unlinkSync(arquivo);
        }
    });
}

/**
 * FUNÇÃO PRINCIPAL
 */
async function iniciarSistemaCompleto() {
    console.log('🚀 INICIALIZADOR AUTOMÁTICO - PROTOCOLO REAL + PAGAMENTO');
    console.log('=' .repeat(60));
    
    const processos = [];
    const arquivosTemp = [];
    
    try {
        // 1. Verificar pré-requisitos
        await verificarPreRequisitos();
        
        // 2. Iniciar serviço Safeweb
        const processoSafeweb = await iniciarServicoSafeweb();
        processos.push(processoSafeweb);
        
        // 3. Aguardar estabilização
        log('⏳', `Aguardando ${CONFIG.TEMPO_ESPERA_SERVICOS/1000}s para estabilização...`);
        await aguardar(CONFIG.TEMPO_ESPERA_SERVICOS);
        
        // 4. Testar conectividade
        await testarConectividade();
        
        // 5. Configurar dados de teste
        const arquivoTemp = gerarDadosTeste();
        arquivosTemp.push(arquivoTemp);
        
        // 6. Executar fluxo completo
        const resultado = await executarFluxoCompleto();
        
        // 7. Mostrar resultado final
        console.log('\n' + '='.repeat(60));
        console.log('🎊 SISTEMA EXECUTADO COM SUCESSO!');
        console.log('='.repeat(60));
        console.log('📊 RESULTADOS:');
        console.log(`   📋 Protocolo Safeweb: ${resultado.protocolo}`);
        console.log(`   💳 Pagamento Safe2Pay: ${resultado.pagamento}`);
        console.log(`   🔗 Referência: ${resultado.referencia}`);
        console.log('\n🔍 VERIFICAÇÃO:');
        console.log(`   • Busque no painel Safe2Pay pela referência: ${resultado.referencia}`);
        console.log(`   • Confirme que a transação está vinculada ao protocolo`);
        console.log('\n✅ Sistema funcionando perfeitamente!');
        
        return resultado;
        
    } catch (error) {
        console.error('\n💥 ERRO NA INICIALIZAÇÃO:', error.message);
        
        console.log('\n🔧 SOLUÇÕES:');
        console.log('   1. Verificar arquivo .env configurado');
        console.log('   2. Verificar credenciais Safeweb e Safe2Pay');
        console.log('   3. Executar: node validar-configuracao.js');
        console.log('   4. Verificar logs de erro acima');
        
        throw error;
        
    } finally {
        // Limpar recursos
        setTimeout(() => {
            limparRecursos(processos, arquivosTemp);
            log('👋', 'Recursos limpos. Sistema finalizado.');
        }, 2000);
    }
}

/**
 * MODO INTERATIVO
 */
function modoInterativo() {
    console.log('🎮 MODO INTERATIVO');
    console.log('=' .repeat(30));
    console.log('1. Executar fluxo completo automaticamente');
    console.log('2. Apenas validar configurações');
    console.log('3. Apenas iniciar serviços');
    console.log('4. Sair');
    console.log('');
    
    const readline = require('readline');
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    
    rl.question('Escolha uma opção (1-4): ', async (opcao) => {
        rl.close();
        
        switch (opcao) {
            case '1':
                await iniciarSistemaCompleto();
                break;
            case '2':
                const { executarValidacao } = require('./validar-configuracao');
                await executarValidacao();
                break;
            case '3':
                await verificarPreRequisitos();
                await iniciarServicoSafeweb();
                console.log('✅ Serviços iniciados. Pressione Ctrl+C para finalizar.');
                break;
            case '4':
                console.log('👋 Saindo...');
                process.exit(0);
                break;
            default:
                console.log('❌ Opção inválida');
                process.exit(1);
        }
    });
}

// Executar se chamado diretamente
if (require.main === module) {
    // Verificar argumentos
    const args = process.argv.slice(2);
    
    if (args.includes('--help') || args.includes('-h')) {
        console.log('📖 USO:');
        console.log('   node iniciar-sistema.js          # Modo interativo');
        console.log('   node iniciar-sistema.js --auto   # Execução automática');
        console.log('   node iniciar-sistema.js --help   # Esta ajuda');
        process.exit(0);
    }
    
    if (args.includes('--auto')) {
        // Modo automático
        iniciarSistemaCompleto()
            .then(() => {
                console.log('\n🎉 Execução automática concluída!');
                process.exit(0);
            })
            .catch(() => {
                process.exit(1);
            });
    } else {
        // Modo interativo
        modoInterativo();
    }
}

module.exports = {
    iniciarSistemaCompleto,
    verificarPreRequisitos,
    iniciarServicoSafeweb,
    testarConectividade
};
