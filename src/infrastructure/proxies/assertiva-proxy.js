/**
 * Servidor proxy Node.js para API Assertiva V3
 * Consulta de CPF e auto-preenchimento de data de nascimento
 */

const http = require('http');
const https = require('https');
const url = require('url');

// Carregar variáveis de ambiente da raiz do projeto
require('dotenv').config({ path: '../.env' });

// Configurações Assertiva
const assertiva = {
    clientId: process.env.ASSERTIVA_CLIENT_ID,
    secret: process.env.ASSERTIVA_SECRET,
    baseUrl: process.env.ASSERTIVA_BASE_URL || 'https://api.assertivasolucoes.com.br',
    tokenUrl: process.env.ASSERTIVA_TOKEN_URL || 'https://api.assertivasolucoes.com.br/oauth2/v3/token'
};

const app = {
    port: process.env.ASSERTIVA_PROXY_PORT || 3001,
    host: 'localhost'
};

// Cache de token
let tokenCache = {
    token: null,
    expiresAt: null
};

// Validar configurações
function validateConfig() {
    if (!assertiva.clientId || !assertiva.secret) {
        console.error('❌ Configurações Assertiva incompletas no .env');
        console.error('   Necessário: ASSERTIVA_CLIENT_ID e ASSERTIVA_SECRET');
        return false;
    }
    return true;
}

// Função para obter token OAuth2
function obterTokenAssertiva() {
    return new Promise((resolve, reject) => {
        // Verificar cache
        if (tokenCache.token && tokenCache.expiresAt && Date.now() < tokenCache.expiresAt) {
            console.log('🔑 Usando token Assertiva em cache');
            resolve(tokenCache.token);
            return;
        }

        console.log('🔑 Obtendo novo token Assertiva...');

        const credentials = Buffer.from(`${assertiva.clientId}:${assertiva.secret}`).toString('base64');
        
        const payload = 'grant_type=client_credentials';

        const options = {
            hostname: 'api.assertivasolucoes.com.br',
            port: 443,
            path: '/oauth2/v3/token',
            method: 'POST',
            headers: {
                'Authorization': `Basic ${credentials}`,
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(payload)
            }
        };

        const req = https.request(options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                try {
                    const response = JSON.parse(data);
                    
                    if (res.statusCode === 200 && response.access_token) {
                        // Cache do token (expires_in em segundos)
                        const expiresIn = response.expires_in || 3600;
                        tokenCache.token = response.access_token;
                        tokenCache.expiresAt = Date.now() + (expiresIn * 1000) - 60000; // 1 min de margem
                        
                        console.log('✅ Token Assertiva obtido com sucesso');
                        resolve(response.access_token);
                    } else {
                        console.error('❌ Erro ao obter token Assertiva:', response);
                        reject(new Error(`Erro de autenticação: ${response.error_description || 'Token inválido'}`));
                    }
                } catch (error) {
                    console.error('❌ Erro ao processar resposta do token:', error);
                    reject(error);
                }
            });
        });

        req.on('error', (error) => {
            console.error('❌ Erro na requisição do token:', error);
            reject(error);
        });

        req.write(payload);
        req.end();
    });
}

// Função para consultar CPF na Assertiva
function consultarCPFAssertiva(cpf, token) {
    return new Promise((resolve, reject) => {
        const cleanCpf = cpf.replace(/\D/g, '');
        
        console.log('🔍 Consultando CPF na Assertiva:', cleanCpf);

        const options = {
            hostname: 'api.assertivasolucoes.com.br',
            port: 443,
            path: `/v3/cpf/${cleanCpf}`,
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        };

        const req = https.request(options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                try {
                    const response = JSON.parse(data);
                    
                    console.log('📊 Resposta Assertiva:', {
                        status: res.statusCode,
                        cpf: cleanCpf,
                        encontrado: response.found || false,
                        dataNascimento: response.birth_date || null
                    });

                    if (res.statusCode === 200) {
                        resolve({
                            success: true,
                            cpf: cleanCpf,
                            encontrado: response.found || false,
                            dataNascimento: response.birth_date || null,
                            nome: response.name || null
                        });
                    } else {
                        resolve({
                            success: false,
                            cpf: cleanCpf,
                            encontrado: false,
                            dataNascimento: null,
                            erro: response.message || 'CPF não encontrado'
                        });
                    }
                } catch (error) {
                    console.error('❌ Erro ao processar resposta CPF:', error);
                    reject(error);
                }
            });
        });

        req.on('error', (error) => {
            console.error('❌ Erro na consulta CPF:', error);
            reject(error);
        });

        req.end();
    });
}

// Servidor HTTP
const server = http.createServer((req, res) => {
    // Headers CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    const parsedUrl = url.parse(req.url, true);
    const path = parsedUrl.pathname;

    // Endpoint de teste
    if (path === '/api/test' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            success: true,
            message: 'Proxy Assertiva funcionando!',
            timestamp: new Date().toISOString(),
            config: {
                baseUrl: assertiva.baseUrl,
                hasCredentials: !!(assertiva.clientId && assertiva.secret)
            }
        }));
        return;
    }

    // Endpoint para consulta de CPF
    if (path === '/api/cpf' && req.method === 'POST') {
        let body = '';

        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', async () => {
            try {
                const { cpf } = JSON.parse(body);

                if (!cpf) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'CPF é obrigatório' }));
                    return;
                }

                console.log('🚀 Iniciando consulta CPF Assertiva:', cpf);

                // Obter token
                const token = await obterTokenAssertiva();

                // Consultar CPF
                const resultado = await consultarCPFAssertiva(cpf, token);

                const response = {
                    success: resultado.success,
                    cpf: resultado.cpf,
                    encontrado: resultado.encontrado,
                    dataNascimento: resultado.dataNascimento,
                    nome: resultado.nome,
                    timestamp: new Date().toISOString()
                };

                if (!resultado.success) {
                    response.erro = resultado.erro;
                }

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(response));

            } catch (error) {
                console.error('❌ Erro na consulta CPF:', error);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    success: false,
                    error: error.message,
                    timestamp: new Date().toISOString()
                }));
            }
        });
        return;
    }

    // Rota não encontrada
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
        error: 'Endpoint não encontrado',
        availableEndpoints: [
            'GET /api/test',
            'POST /api/cpf'
        ]
    }));
});

// Inicializar servidor
if (!validateConfig()) {
    process.exit(1);
}

server.listen(app.port, app.host, () => {
    console.log('🔧 Configurações Assertiva:');
    console.log(`   Client ID: ${assertiva.clientId ? assertiva.clientId.substring(0, 20) + '...' : 'NÃO CONFIGURADO'}`);
    console.log(`   Base URL: ${assertiva.baseUrl}`);
    
    console.log('\n🚀 Proxy Assertiva iniciado!');
    console.log(`📍 URL: http://${app.host}:${app.port}`);
    console.log('🔗 Endpoints:');
    console.log('  • POST /api/cpf');
    console.log('  • GET  /api/test');
    
    console.log('\n🎯 Integração com API Assertiva V3 funcionando!');
});

// Tratamento de erros
process.on('uncaughtException', (error) => {
    console.error('💥 Erro não capturado:', error);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('💥 Promise rejeitada:', reason);
});
