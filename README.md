# 🏆 Sistema Completo de Certificados Digitais

## 📋 Visão Geral

Sistema completo para venda de certificados digitais e-CPF e e-CNPJ com integração total entre:
- **API Safeweb**: Geração de protocolos reais com documentos adicionais (CEI/CAEPF)
- **API Assertiva**: Consulta de CPF e data de nascimento automática
- **Safe2Pay**: Pagamentos via PIX e Boleto com rastreabilidade total
- **ViaCEP**: Auto-preenchimento de endereços
- **ReceitaWS**: Dados de empresas (CNPJ)

## 🎯 Funcionalidades Implementadas

### ✅ **Protocolos Reais**
- **e-CPF A1** com CEI (12 dígitos) ou CAEPF (14 dígitos)
- **e-CNPJ A1** com CEI da empresa
- **Validação de exclusividade**: CEI OU CAEPF (nunca ambos)
- **Geração via API Safeweb** com dados reais

### ✅ **Pagamentos Reais**
- **PIX** com QR Code e chave PIX
- **Boleto bancário** com linha digitável
- **Protocolo como referência única** para rastreabilidade
- **Integração Safe2Pay** com SDK oficial

### ✅ **Validações Automáticas**
- **Biometria**: Verifica se CPF pode emitir por videoconferência
- **CPF/CNPJ**: Validação na Receita Federal via Safeweb
- **Data de nascimento**: Consulta automática na Assertiva
- **Representante legal**: Validação CNPJ x CPF responsável
- **Endereços**: Auto-preenchimento via ViaCEP

## 📁 Estrutura do Projeto

```
sistema-certificado-digital/
├── README.md
├── .env                            # Configurações (CONFIGURE PRIMEIRO!)
├── package.json
├── src/
│   └── backend/
│       ├── proxies/
│       │   ├── assertiva-proxy.js  # Proxy Assertiva (3001)
│       │   └── safeweb-proxy.js    # Proxy Safeweb (3002)
│       └── integrations/
│           ├── safe2pay/
│           │   └── Safe2PayHybrid.js
│           └── protocolo/
│               └── apis.js
├── scripts/
│   ├── validar-configuracao.js
│   ├── iniciar-sistema.js
│   ├── executar-com-config.js
│   └── gerar-ecnpj-com-pix.js
├── config/
│   └── .env.example
├── docs/
│   ├── README_DETALHADO.md
│   ├── GUIA_EXECUCAO_RAPIDA.md
│   └── ANALISE_DOCUMENTACAO_SAFEWEB.md
├── tests/
└── dist/
```

## ⚡ Início Rápido (5 minutos)

### 1️⃣ **Instalar Dependências**
```bash
cd sistema-certificado-digital
npm install
```

### 2️⃣ **Configurar Credenciais**
Edite o arquivo `.env` com suas credenciais:
```bash
# API ASSERTIVA V3
ASSERTIVA_CLIENT_ID=seu_client_id_aqui
ASSERTIVA_SECRET=seu_secret_aqui

# API SAFEWEB
SAFEWEB_USERNAME=seu_usuario_safeweb
SAFEWEB_PASSWORD=sua_senha_safeweb
SAFEWEB_CNPJ_AR=seu_cnpj_ar

# SAFE2PAY
SAFE2PAY_TOKEN=seu_token_safe2pay
SAFE2PAY_API_SECRET_KEY=sua_chave_secreta
```

### 3️⃣ **Validar Configuração**
```bash
node scripts/validar-configuracao.js
```

### 4️⃣ **Iniciar Proxies**
```bash
# Terminal 1: API Assertiva
node src/backend/proxies/assertiva-proxy.js

# Terminal 2: API Safeweb
SAFEWEB_AUTH_URL="https://pss.safewebpss.com.br/Service/Microservice/Shared/HubAutenticacao/Autenticacoes/api/autorizacao/token" \
  node src/backend/proxies/safeweb-proxy.js
```

### 5️⃣ **Testar Sistema**
```bash
# Teste completo: Protocolo + Boleto
node testes/teste-fluxo-completo-protocolo-boleto.js
```

## 🔧 Configuração Detalhada

### 📋 **Credenciais Necessárias**

#### **API Assertiva V3**
- **Client ID**: Obtido no painel Assertiva
- **Secret**: Chave secreta da API
- **Função**: Consulta CPF e data de nascimento

#### **API Safeweb**
- **Username**: Usuário de integração
- **Password**: Senha de acesso
- **CNPJ AR**: CNPJ da Autoridade Registradora
- **Função**: Geração de protocolos e validações RFB

#### **Safe2Pay**
- **Token**: Token de acesso à API
- **Secret Key**: Chave secreta para autenticação
- **Função**: Pagamentos PIX e Boleto

### 🌐 **Portas dos Serviços**
- **3001**: Proxy API Assertiva
- **3002**: Proxy API Safeweb
- **APIs externas**: HTTPS (443)

## 🧪 Testes Disponíveis

### **1. Teste e-CPF com Documentos**
```bash
node testes/teste-ecpf-caepf-cei.js
```
**Testa:**
- ✅ Protocolo e-CPF com CAEPF (14 dígitos)
- ✅ Protocolo e-CPF com CEI (12 dígitos)  
- ✅ Validação de exclusividade (CAEPF OU CEI)

### **2. Teste e-CNPJ com CEI**
```bash
node testes/teste-ecnpj-cei.js
```
**Testa:**
- ✅ Protocolo e-CNPJ com CEI da empresa
- ✅ Protocolo e-CNPJ sem CEI (opcional)

### **3. Teste Fluxo Completo**
```bash
node testes/teste-fluxo-completo-protocolo-boleto.js
```
**Testa:**
- ✅ Protocolo real via Safeweb
- ✅ Boleto real via Safe2Pay
- ✅ Rastreabilidade protocolo → pagamento

## 🎯 Fluxos de Negócio

### **📄 Fluxo e-CPF**
1. **Cliente digita CPF**
2. **Sistema valida biometria** (videoconferência?)
3. **Consulta data nascimento** (Assertiva - automático)
4. **Valida CPF na RFB** (Safeweb - automático)
5. **Cliente preenche**: CEP, telefone, email
6. **Campos opcionais**: CEI ou CAEPF
7. **Gera protocolo** real via Safeweb
8. **Cria pagamento** (PIX/Boleto) via Safe2Pay

### **🏢 Fluxo e-CNPJ**
1. **Cliente digita CPF** do responsável
2. **Sistema valida biometria** (videoconferência?)
3. **Consulta data nascimento** (Assertiva - automático)
4. **Cliente digita CNPJ**
5. **Valida representante legal** (Safeweb - automático)
6. **Busca dados empresa** (ReceitaWS - automático)
7. **Cliente preenche**: dados complementares
8. **Campo opcional**: CEI da empresa
9. **Gera protocolo** real via Safeweb
10. **Cria pagamento** com opções de pagador

## 💳 Opções de Pagamento

### **Para e-CPF:**
- **Mesmo CPF**: Usar dados do protocolo
- **Outro pagador**: Informar novos dados

### **Para e-CNPJ:**
- **Pessoa Física**: Usar CPF do responsável
- **Pessoa Jurídica**: Usar CNPJ da empresa
- **Outro pagador**: Matriz paga filial, etc.

## 🔍 Validações Implementadas

### **Cenário Ideal (APIs funcionando):**
- ✅ **Biometria automática**: Via Safeweb
- ✅ **Data nascimento automática**: Via Assertiva  
- ✅ **Validação RFB automática**: Via Safeweb
- ✅ **Dados empresa automáticos**: Via ReceitaWS
- ✅ **Endereço automático**: Via ViaCEP

### **Cenário Degradado (APIs fora):**
- ⚠️ **Campos manuais**: Usuario preenche tudo
- ⚠️ **Validações básicas**: Formato e obrigatoriedade
- ⚠️ **Protocolo ainda funciona**: Safeweb principal

## 📊 Rastreabilidade Total

### **Fluxo de Dados:**
```
👤 Cliente
  ↓
📋 Protocolo Safeweb (ex: 1008800374)
  ↓  
💳 Pagamento Safe2Pay (ex: 136513566)
  ↓
🔗 Referência: 1008800374
  ↓
📄 Documento: CAEPF/CEI
```

### **Consultas no Painel:**
- **Safe2Pay**: Buscar por referência = protocolo
- **Safeweb**: Acompanhar status do protocolo
- **Logs**: Rastreamento completo nos proxies

## 🚨 Troubleshooting

### **Erro: "Cannot find module"**
```bash
npm install
```

### **Erro: "ECONNREFUSED"**
```bash
# Verificar se proxies estão rodando
node src/backend/proxies/assertiva-proxy.js
SAFEWEB_AUTH_URL="https://pss.safewebpss.com.br/Service/Microservice/Shared/HubAutenticacao/Autenticacoes/api/autorizacao/token" \
  node src/backend/proxies/safeweb-proxy.js
```

### **Erro: "Invalid credentials"**
```bash
# Verificar arquivo .env
node scripts/validar-configuracao.js
```

### **Erro: "CPF não encontrado"**
- Verificar se CPF é válido
- Assertiva pode estar fora (domingo)
- Usar dados de teste fornecidos

## 📞 Suporte

### **Dados de Teste Validados:**
- **CPF**: 38601836801 (Leandro Albertini)
- **Data**: 28/01/1989
- **CEP**: 13070064 (Campinas/SP)
- **CAEPF**: 12345678901234 (14 dígitos)
- **CEI**: 123456789012 (12 dígitos)

### **Logs Detalhados:**
Todos os proxies geram logs detalhados para debug.

---

## 🚀 Próximos Passos

### **Para o Próximo Agente:**
1. **Criar formulário web** com os campos obrigatórios
2. **Implementar validações automáticas** conforme fluxos
3. **Interface responsiva** para desktop/mobile
4. **Integrar com este sistema** via APIs dos proxies
5. **Opções de pagador** para flexibilidade

### **Campos Obrigatórios por Tipo:**

#### **e-CPF:**
- CPF (validação automática)
- CEP (auto-preenchimento)
- Telefone, Email
- CEI/CAEPF (opcional)

#### **e-CNPJ:**
- CPF responsável (validação automática)
- CNPJ (validação representante legal)
- Dados complementares
- CEI empresa (opcional)

**🎯 Sistema pronto para produção com protocolos e pagamentos reais!**
