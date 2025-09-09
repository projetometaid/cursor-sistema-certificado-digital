# 🎯 Guia para o Próximo Agente - Formulário de Compra

## 📋 Objetivo

Criar um formulário web responsivo para venda de certificados digitais e-CPF e e-CNPJ com validações automáticas e integração total com o sistema backend já implementado.

## 🏗️ Arquitetura do Sistema Atual

### **Backend Funcionando (100%):**
- ✅ **API Assertiva** (porta 3001): Consulta CPF e data nascimento
- ✅ **API Safeweb** (porta 3002): Protocolos reais + validações RFB
- ✅ **Safe2Pay**: PIX e Boleto com rastreabilidade
- ✅ **Integrações**: ViaCEP, ReceitaWS

### **Endpoints Disponíveis:**
```javascript
// API Assertiva (localhost:3001)
POST /api/cpf
GET  /api/test

// API Safeweb (localhost:3002)  
POST /api/validar-biometria
POST /api/consulta-previa-cpf
POST /api/consulta-previa-cnpj
POST /api/gerar-protocolo
GET  /api/test
```

## 🎨 Interface a Ser Criada

### **Página 1: Seleção de Produto**
```html
┌─────────────────────────────────────┐
│  🏆 Certificado Digital Campinas    │
├─────────────────────────────────────┤
│                                     │
│  📄 e-CPF A1        🏢 e-CNPJ A1   │
│  ┌─────────────┐    ┌─────────────┐ │
│  │ Pessoa      │    │ Empresa     │ │
│  │ Física      │    │             │ │
│  │ R$ 199,99   │    │ R$ 299,99   │ │
│  │ [Selecionar]│    │ [Selecionar]│ │
│  └─────────────┘    └─────────────┘ │
└─────────────────────────────────────┘
```

### **Página 2A: Formulário e-CPF**
```html
┌─────────────────────────────────────┐
│  📄 Certificado e-CPF A1            │
├─────────────────────────────────────┤
│                                     │
│  CPF: [___.___.___-__] 🔍          │
│  ↳ ✅ Pode emitir por videoconf.    │
│  ↳ ✅ João da Silva (RFB)           │
│                                     │
│  CEP: [_____-___] 🔍               │
│  ↳ ✅ Rua ABC, Cidade/UF            │
│                                     │
│  Telefone: [(__) _____-____]        │
│  Email: [________________]          │
│                                     │
│  📋 Documentos Adicionais (opcional)│
│  ○ Nenhum                          │
│  ○ CEI: [____________] (12 dígitos) │
│  ○ CAEPF: [______________] (14 díg.)│
│                                     │
│  [Continuar para Pagamento] 💳      │
└─────────────────────────────────────┘
```

### **Página 2B: Formulário e-CNPJ**
```html
┌─────────────────────────────────────┐
│  🏢 Certificado e-CNPJ A1           │
├─────────────────────────────────────┤
│                                     │
│  CPF Responsável: [___.___.___-__] 🔍│
│  ↳ ✅ Pode emitir por videoconf.    │
│  ↳ ✅ João da Silva (RFB)           │
│                                     │
│  CNPJ: [__.___.___.____/____-__] 🔍 │
│  ↳ ✅ João é representante legal    │
│  ↳ ✅ Empresa ABC LTDA              │
│                                     │
│  CEP: [_____-___] 🔍               │
│  ↳ ✅ Rua XYZ, Cidade/UF            │
│                                     │
│  Telefone: [(__) _____-____]        │
│  Email: [________________]          │
│                                     │
│  📋 CEI Empresa (opcional)          │
│  CEI: [____________] (12 dígitos)   │
│                                     │
│  [Continuar para Pagamento] 💳      │
└─────────────────────────────────────┘
```

### **Página 3: Seleção de Pagador**
```html
┌─────────────────────────────────────┐
│  💳 Dados do Pagador                │
├─────────────────────────────────────┤
│                                     │
│  Quem irá pagar?                    │
│                                     │
│  ○ Mesmo CPF do certificado         │
│    João da Silva (***.***.***-01)  │
│                                     │
│  ○ Outra pessoa/empresa             │
│    [Preencher novos dados]          │
│                                     │
│  ┌─ Se e-CNPJ ─────────────────────┐ │
│  │ ○ Pessoa Física (CPF)           │ │
│  │ ○ Pessoa Jurídica (CNPJ)        │ │
│  │ ○ Outro pagador                 │ │
│  └─────────────────────────────────┘ │
│                                     │
│  [Continuar] ➡️                     │
└─────────────────────────────────────┘
```

### **Página 4: Pagamento**
```html
┌─────────────────────────────────────┐
│  💰 Finalizar Pagamento             │
├─────────────────────────────────────┤
│                                     │
│  📋 Protocolo: 1008800374           │
│  📄 e-CPF A1 + CAEPF               │
│  👤 João da Silva                   │
│  💰 R$ 199,99                       │
│                                     │
│  Forma de pagamento:                │
│  ┌─────────────┐  ┌─────────────┐   │
│  │ 📱 PIX      │  │ 🧾 Boleto   │   │
│  │ Instantâneo │  │ 30 dias     │   │
│  │ [Gerar QR]  │  │ [Gerar]     │   │
│  └─────────────┘  └─────────────┘   │
│                                     │
│  [Finalizar Compra] ✅              │
└─────────────────────────────────────┘
```

## 🔧 Implementação Técnica

### **1. Validações Automáticas**

#### **Validação de CPF:**
```javascript
async function validarCPF(cpf) {
    try {
        // 1. Validar biometria
        const biometria = await fetch('http://localhost:3002/api/validar-biometria', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cpf })
        });
        
        // 2. Buscar data nascimento (automático)
        const assertiva = await fetch('http://localhost:3001/api/cpf', {
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cpf })
        });
        
        // 3. Validar na RFB (se tiver data)
        if (assertiva.dataNascimento) {
            const rfb = await fetch('http://localhost:3002/api/consulta-previa-cpf', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    cpf, 
                    dataNascimento: assertiva.dataNascimento 
                })
            });
        }
        
        return {
            temBiometria: biometria.temBiometria,
            dataNascimento: assertiva.dataNascimento,
            nome: rfb?.mensagem,
            validoRFB: rfb?.valido
        };
        
    } catch (error) {
        // Modo degradado: pedir dados manuais
        return { modoManual: true };
    }
}
```

#### **Validação de CNPJ:**
```javascript
async function validarCNPJ(cnpj, cpfResponsavel, dataNascimento) {
    try {
        // 1. Validar representante legal
        const safeweb = await fetch('http://localhost:3002/api/consulta-previa-cnpj', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cnpj, cpfResponsavel, dataNascimento })
        });
        
        // 2. Buscar dados da empresa
        const empresa = await fetch(`https://www.receitaws.com.br/v1/cnpj/${cnpj}`);
        
        return {
            representanteLegal: safeweb.valido,
            razaoSocial: empresa.nome,
            nomeFantasia: empresa.fantasia,
            endereco: empresa // dados completos
        };
        
    } catch (error) {
        return { modoManual: true };
    }
}
```

### **2. Fluxo de Estados**

#### **Estado do Formulário:**
```javascript
const formState = {
    produto: 'ecpf', // 'ecpf' | 'ecnpj'
    cliente: {
        cpf: '',
        nome: '',
        dataNascimento: '',
        telefone: '',
        email: '',
        endereco: {},
        documentoAdicional: { tipo: null, numero: '' }
    },
    empresa: { // só para e-CNPJ
        cnpj: '',
        razaoSocial: '',
        nomeFantasia: '',
        endereco: {},
        cei: ''
    },
    pagador: {
        tipo: 'mesmo', // 'mesmo' | 'outro' | 'pf' | 'pj'
        dados: {}
    },
    validacoes: {
        temBiometria: false,
        validoRFB: false,
        representanteLegal: false,
        modoManual: false
    },
    protocolo: null,
    pagamento: null
};
```

### **3. Componentes React/Vue Sugeridos**

#### **Componente CPFInput:**
```jsx
function CPFInput({ value, onChange, onValidate }) {
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState(null);
    
    const handleBlur = async () => {
        if (value.length === 11) {
            setLoading(true);
            const result = await validarCPF(value);
            setStatus(result);
            onValidate(result);
            setLoading(false);
        }
    };
    
    return (
        <div>
            <input 
                value={value}
                onChange={onChange}
                onBlur={handleBlur}
                placeholder="000.000.000-00"
                mask="999.999.999-99"
            />
            {loading && <span>🔍 Validando...</span>}
            {status?.temBiometria && <span>✅ Pode emitir por videoconferência</span>}
            {status?.nome && <span>✅ {status.nome} (RFB)</span>}
            {status?.modoManual && <span>⚠️ Preencha os dados manualmente</span>}
        </div>
    );
}
```

#### **Componente DocumentoAdicional:**
```jsx
function DocumentoAdicional({ tipo, numero, onChange }) {
    return (
        <div>
            <h4>📋 Documentos Adicionais (opcional)</h4>
            <label>
                <input 
                    type="radio" 
                    name="documento" 
                    value="nenhum"
                    checked={!tipo}
                    onChange={() => onChange(null, '')}
                />
                Nenhum
            </label>
            <label>
                <input 
                    type="radio" 
                    name="documento" 
                    value="cei"
                    checked={tipo === 'cei'}
                    onChange={() => onChange('cei', '')}
                />
                CEI (12 dígitos)
                {tipo === 'cei' && (
                    <input 
                        value={numero}
                        onChange={(e) => onChange('cei', e.target.value)}
                        placeholder="000000000000"
                        maxLength={12}
                    />
                )}
            </label>
            <label>
                <input 
                    type="radio" 
                    name="documento" 
                    value="caepf"
                    checked={tipo === 'caepf'}
                    onChange={() => onChange('caepf', '')}
                />
                CAEPF (14 dígitos)
                {tipo === 'caepf' && (
                    <input 
                        value={numero}
                        onChange={(e) => onChange('caepf', e.target.value)}
                        placeholder="00000000000000"
                        maxLength={14}
                    />
                )}
            </label>
        </div>
    );
}
```

## 🎯 Regras de Negócio Críticas

### **1. Validações Obrigatórias**
- ✅ **CPF válido** e com biometria para videoconferência
- ✅ **Data nascimento** automática (Assertiva) ou manual
- ✅ **Validação RFB** via Safeweb obrigatória
- ✅ **Representante legal** para e-CNPJ obrigatório

### **2. Campos Opcionais**
- ⚠️ **CEI/CAEPF** para e-CPF (máximo 1)
- ⚠️ **CEI empresa** para e-CNPJ
- ⚠️ **Dados complementares** se APIs fora

### **3. Modo Degradado**
Se APIs estiverem fora:
- 📝 **Formulário completo** com todos os campos
- ⚠️ **Validações básicas** (formato, obrigatório)
- 🔄 **Protocolo ainda funciona** (Safeweb é principal)

### **4. Opções de Pagador**
- **e-CPF**: Mesmo CPF ou outro pagador
- **e-CNPJ**: PF responsável, PJ empresa, ou outro pagador
- **Flexibilidade**: Matriz paga filial, etc.

## 📱 Responsividade

### **Desktop (1200px+):**
- Layout em 2 colunas
- Formulário à esquerda, resumo à direita
- Validações em tempo real

### **Tablet (768px-1199px):**
- Layout em 1 coluna
- Campos maiores
- Resumo fixo no topo

### **Mobile (320px-767px):**
- Layout vertical
- Campos full-width
- Navegação por etapas

## 🚀 Tecnologias Sugeridas

### **Frontend:**
- **React** ou **Vue.js** para componentes
- **Tailwind CSS** para estilização rápida
- **React Hook Form** para validações
- **Axios** para requisições HTTP

### **Validações:**
- **Yup** ou **Zod** para schemas
- **React Input Mask** para máscaras
- **SweetAlert2** para alertas bonitos

### **Estado:**
- **Context API** ou **Zustand** para estado global
- **React Query** para cache de APIs
- **LocalStorage** para persistência

## 📋 Checklist de Implementação

### **Fase 1: Estrutura Base**
- [ ] Setup do projeto (React/Vue)
- [ ] Roteamento entre páginas
- [ ] Layout responsivo base
- [ ] Componentes de formulário

### **Fase 2: Validações**
- [ ] Integração com APIs (localhost:3001, 3002)
- [ ] Validação automática de CPF
- [ ] Validação automática de CNPJ
- [ ] Auto-preenchimento de endereços

### **Fase 3: Fluxos**
- [ ] Fluxo e-CPF completo
- [ ] Fluxo e-CNPJ completo
- [ ] Seleção de pagador
- [ ] Geração de protocolo

### **Fase 4: Pagamento**
- [ ] Integração Safe2Pay
- [ ] PIX com QR Code
- [ ] Boleto com linha digitável
- [ ] Confirmação de pagamento

### **Fase 5: UX/UI**
- [ ] Loading states
- [ ] Error handling
- [ ] Modo degradado
- [ ] Testes responsivos

## 🎯 Resultado Esperado

Um formulário web que:
- ✅ **Valida automaticamente** CPF/CNPJ
- ✅ **Preenche dados** via APIs
- ✅ **Gera protocolos reais** via Safeweb
- ✅ **Cria pagamentos reais** via Safe2Pay
- ✅ **Funciona em modo degradado** se APIs fora
- ✅ **É responsivo** para todos os dispositivos
- ✅ **Tem UX excelente** com validações em tempo real

**🚀 Sistema completo pronto para produção!**
