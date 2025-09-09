# ⚡ Instalação Rápida - Sistema de Certificados Digitais

## 🚀 Início em 5 Minutos

### **1. Pré-requisitos**
- ✅ **Node.js** 16+ instalado
- ✅ **npm** ou **yarn**
- ✅ **Credenciais** das APIs (Assertiva, Safeweb, Safe2Pay)

### **2. Download e Setup**
```bash
# Baixar o sistema (se via Git)
git clone <repositorio>
cd sistema-certificado-digital

# OU extrair pasta compactada
cd sistema-certificado-digital
```

### **3. Instalar Dependências**
```bash
npm install
```

### **4. Configurar Credenciais**
```bash
# Copiar arquivo de exemplo
cp .env.example .env

# Editar com suas credenciais
nano .env
# ou
code .env
```

**Configure estas variáveis obrigatórias:**
```bash
# API Assertiva
ASSERTIVA_CLIENT_ID=seu_client_id_aqui
ASSERTIVA_SECRET=seu_secret_aqui

# API Safeweb  
SAFEWEB_USERNAME=seu_usuario_aqui
SAFEWEB_PASSWORD=sua_senha_aqui
SAFEWEB_CNPJ_AR=seu_cnpj_ar_aqui

# Safe2Pay
SAFE2PAY_TOKEN=seu_token_aqui
SAFE2PAY_API_SECRET_KEY=sua_chave_aqui
```

### **5. Validar Configuração**
```bash
npm run validate
```

### **6. Iniciar Sistema**
```bash
npm start
```

### **7. Testar Funcionamento**
```bash
# Teste completo (protocolo + boleto)
npm run test:completo

# Ou testes individuais
npm run test:ecpf    # e-CPF com CEI/CAEPF
npm run test:ecnpj   # e-CNPJ com CEI
```

## ✅ Verificação de Sucesso

Se tudo funcionou, você verá:

```
🎉 TODOS OS TESTES EXECUTADOS COM SUCESSO!
📊 RESUMO FINAL:
   📋 Protocolo com CAEPF: 1008800374
   💳 Boleto: 136513566
   🔗 Referência: 1008800374
```

## 🔧 Comandos Úteis

### **Gerenciamento do Sistema:**
```bash
npm start           # Iniciar sistema completo
npm stop            # Parar sistema
npm run validate    # Validar configuração
```

### **Testes:**
```bash
npm run test:all      # Todos os testes
npm run test:ecpf     # Teste e-CPF
npm run test:ecnpj    # Teste e-CNPJ  
npm run test:completo # Fluxo completo
```

### **Serviços Individuais:**
```bash
npm run assertiva    # Só API Assertiva (porta 3001)
npm run safeweb      # Só API Safeweb (porta 3002)
```

### **Logs em Tempo Real:**
```bash
npm run logs:assertiva  # Logs API Assertiva
npm run logs:safeweb    # Logs API Safeweb
```

## 🌐 URLs dos Serviços

Após iniciar o sistema:
- **API Assertiva**: http://localhost:3001
- **API Safeweb**: http://localhost:3002

### **Endpoints de Teste:**
```bash
# Testar conectividade
curl http://localhost:3001/api/test
curl http://localhost:3002/api/test
```

## 🚨 Problemas Comuns

### **Erro: "Cannot find module"**
```bash
# Instalar dependências
npm install
```

### **Erro: "ECONNREFUSED"**
```bash
# Verificar se serviços estão rodando
npm start
```

### **Erro: "Invalid credentials"**
```bash
# Verificar arquivo .env
npm run validate
```

### **Erro: "Port already in use"**
```bash
# Parar sistema anterior
npm stop

# Ou matar processos manualmente
kill -9 $(lsof -t -i:3001)
kill -9 $(lsof -t -i:3002)
```

### **APIs Externas Fora (domingo/feriado)**
- ⚠️ **Assertiva**: Pode estar fora aos domingos
- ✅ **Safeweb**: Funciona 24/7
- ✅ **Safe2Pay**: Funciona 24/7
- ✅ **Sistema**: Funciona em modo degradado

## 📁 Estrutura de Arquivos

```
sistema-certificado-digital/
├── 📄 README.md              # Documentação principal
├── 📄 INSTALACAO.md          # Este arquivo
├── 📄 .env                   # Suas credenciais
├── 📄 package.json           # Dependências
├── 🚀 iniciar-sistema.sh     # Script de inicialização
├── 🛑 parar-sistema.sh       # Script para parar
├── 
├── 🔧 api-assertiva/         # Proxy API Assertiva
├── 🔧 api-safeweb/           # Proxy API Safeweb
├── 💳 safe2pay/              # Integração Safe2Pay
├── 🔗 protocolo/             # Integrações puras
├── 📚 documentacao/          # Docs completas
├── 🧪 testes/                # Testes automatizados
└── 🚀 scripts/               # Scripts utilitários
```

## 🎯 Próximos Passos

### **Para Desenvolvedores:**
1. ✅ **Sistema funcionando** - protocolos e pagamentos reais
2. 📝 **Criar formulário web** - seguir `GUIA_PROXIMO_AGENTE.md`
3. 🎨 **Interface responsiva** - desktop/mobile
4. 🔗 **Integrar com APIs** - usar endpoints localhost:3001/3002

### **Para Produção:**
1. 🔒 **HTTPS** obrigatório
2. 🛡️ **Firewall** nas portas dos proxies
3. 📊 **Monitoramento** de logs
4. 🔄 **Backup** das configurações

## 📞 Suporte

### **Dados de Teste Válidos:**
- **CPF**: 38601836801 (Leandro Albertini)
- **Data**: 28/01/1989  
- **CEP**: 13070064 (Campinas/SP)
- **CAEPF**: 12345678901234 (14 dígitos)
- **CEI**: 123456789012 (12 dígitos)

### **Documentação Completa:**
- `README.md` - Visão geral completa
- `GUIA_PROXIMO_AGENTE.md` - Para criar formulário web
- `documentacao/` - Docs técnicas detalhadas

---

## 🎊 Sistema Pronto!

**Após seguir estes passos, você terá um sistema completo funcionando com:**
- ✅ **Protocolos reais** via Safeweb
- ✅ **Pagamentos reais** via Safe2Pay  
- ✅ **Validações automáticas** via Assertiva
- ✅ **Rastreabilidade total** protocolo → pagamento
- ✅ **Documentos adicionais** CEI/CAEPF

**🚀 Pronto para criar o formulário web e colocar em produção!**
