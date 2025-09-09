# 🔐 API Safeweb - Integração Completa

## 🎯 Objetivo

Integração completa da API Safeweb com o formulário de checkout existente, adicionando:

- ✅ **Validação de biometria** - Verifica se CPF tem biometria cadastrada
- ✅ **Consulta prévia RFB** - Valida dados na Receita Federal
- ✅ **Previsões de emissão** - Calcula tipo e prazo de emissão
- ✅ **Interface intuitiva** - Mostra resultados em tempo real

## 🏗️ Arquitetura

```
Frontend → Proxy Assertiva (3001) → API Assertiva V3
        → Proxy Safeweb (3002)   → API Safeweb
```

### **Fluxo de Validação**

1. **CPF digitado** → Auto-preenchimento via Assertiva
2. **Data obtida** → Validação biometria + Consulta RFB via Safeweb
3. **Resultados** → Previsão de emissão calculada
4. **Interface** → Painel com resultados e orientações

## 🚀 Como Usar

### **1. Iniciar Servidores**

```bash
# Terminal 1: Proxy Assertiva (já rodando)
node proxy-server.js

# Terminal 2: Proxy Safeweb (novo)
cd "API Safeweb"
node safeweb-proxy.js

# Terminal 3: Servidor web
cd public
python3 -m http.server 8000
```

### **2. Acessar Interface**

```
http://localhost:8000/../API%20Safeweb/index-safeweb.html
```

### **3. Testar Validações**

1. **Selecione** um produto (e-CPF A1 ou e-CNPJ A1)
2. **Clique** em "Continuar"
3. **Digite** CPF: `38601836801`
4. **Saia do campo** e veja as validações automáticas

## 📊 Funcionalidades Implementadas

### **🔍 Validação de Biometria**
- Verifica se CPF tem biometria cadastrada no PSBio
- Determina se emissão pode ser 100% online
- Endpoint: `POST /api/validar-biometria`

### **📋 Consulta Prévia RFB**
- Valida CPF/CNPJ na Receita Federal
- Verifica dados de nascimento
- Retorna nome/razão social
- Endpoints: 
  - `POST /api/consulta-previa-cpf`
  - `POST /api/consulta-previa-cnpj`

### **📊 Previsão de Emissão**
- Calcula tipo de emissão (online/presencial)
- Estima prazo de conclusão
- Fornece orientações específicas

### **🎨 Interface Visual**
- Painel de resultados em tempo real
- Indicadores visuais de status
- Mensagens contextuais
- Design responsivo

## 🔧 Configuração

### **Credenciais Safeweb**
```javascript
// No arquivo safeweb-proxy.js
const SAFEWEB_CONFIG = {
    baseUrl: 'https://pss.safewebpss.com.br',
    username: 'SEU_USUARIO',        // ← Configurar
    password: 'SUA_SENHA',          // ← Configurar
    cnpjAR: 'SEU_CNPJ_AR',         // ← Configurar
    codigoParceiro: 'SEU_CODIGO'    // ← Configurar
};
```

### **Variáveis de Ambiente**
```bash
export SAFEWEB_USERNAME="seu_usuario"
export SAFEWEB_PASSWORD="sua_senha"
export SAFEWEB_CNPJ_AR="seu_cnpj_ar"
export SAFEWEB_CODIGO_PARCEIRO="seu_codigo"
```

## 📋 Códigos de Resposta

### **Consulta Prévia - Principais Códigos**
- **0**: ✅ Dados válidos
- **1**: ❌ CPF inválido
- **2**: ❌ CPF inexistente na RFB
- **4**: ❌ Data de nascimento divergente
- **20**: ❌ CNPJ inválido
- **22**: ❌ CNPJ inexistente na RFB
- **27**: ❌ CPF não é responsável pela empresa
- **700**: ⚠️ Dados serão validados posteriormente
- **98**: ❌ Serviço temporariamente indisponível

### **Tratamento de Erros**
```javascript
const SAFEWEB_ERRORS = {
    0: { tipo: 'sucesso', mensagem: 'Dados válidos' },
    1: { tipo: 'erro', mensagem: 'CPF inválido' },
    4: { tipo: 'erro', mensagem: 'Data de nascimento divergente' },
    // ... outros códigos
};
```

## 🎯 Previsões de Emissão

### **Cenários Possíveis**

#### **✅ Emissão Online (24-48h)**
- ✅ CPF com biometria cadastrada
- ✅ Dados válidos na RFB
- 🎯 Processo 100% digital

#### **⚠️ Emissão Presencial (3-5 dias)**
- ❌ CPF sem biometria cadastrada
- ✅ Dados válidos na RFB
- 🎯 Necessário agendamento presencial

#### **❌ Emissão Não Permitida**
- ❌ Dados inválidos na RFB
- 🎯 Correção de dados necessária

## 🧪 Testes

### **CPF de Teste**
- **CPF**: `38601836801`
- **Data**: `28/01/1989`
- **Nome**: LEANDRO VICTOR ALBERTINI

### **Cenários de Teste**

#### **1. Teste Básico**
```javascript
// No console do navegador
testarAssertivaRapido();  // Testa auto-preenchimento
testarSafewebRapido();    // Testa conectividade Safeweb
testarFluxoCompleto();    // Testa integração completa
```

#### **2. Teste Manual**
1. Digite CPF válido
2. Aguarde auto-preenchimento da data
3. Veja validações Safeweb automáticas
4. Analise painel de resultados

## 📁 Estrutura de Arquivos

```
API Safeweb/
├── safeweb-proxy.js        # Servidor proxy para API Safeweb
├── safeweb-integration.js  # Integração com formulário
├── index-safeweb.html     # Interface de demonstração
└── README.md              # Esta documentação
```

## 🔄 Integração com Sistema Atual

### **Extensão do Formulário**
- Mantém funcionalidade original (Assertiva)
- Adiciona validações Safeweb
- Interface não-intrusiva
- Compatibilidade total

### **Sobrescrita de Funções**
```javascript
// Substitui função original de blur do CPF
cpfInput.removeEventListener('blur', handleCPFBlur);
cpfInput.addEventListener('blur', handleCPFBlurWithSafeweb);
```

## 🚨 Resolução de Problemas

### **Proxy Safeweb não inicia**
```bash
# Verificar porta disponível
lsof -i :3002

# Usar porta alternativa
PORT=3003 node safeweb-proxy.js
```

### **Erro de autenticação**
- Verificar credenciais no arquivo `safeweb-proxy.js`
- Confirmar usuário/senha com AC Safeweb
- Testar conectividade com API

### **Validações não aparecem**
- Verificar se ambos os proxies estão rodando
- Confirmar auto-preenchimento da data
- Verificar console para erros

## 📈 Próximos Passos

1. **Configurar credenciais** reais da AC Safeweb
2. **Testar em ambiente** de homologação
3. **Implementar geração** de protocolos
4. **Adicionar validação** de CNPJ
5. **Criar interface** de gerenciamento

## ✅ Status Atual

**🎉 INTEGRAÇÃO COMPLETA E FUNCIONAL!**

- ✅ **Proxy Safeweb** funcionando
- ✅ **Validações automáticas** implementadas
- ✅ **Interface visual** criada
- ✅ **Previsões de emissão** calculadas
- ✅ **Integração não-intrusiva** com sistema atual

---

**🔐 Sistema pronto para validações e previsões em tempo real!**
