require('dotenv').config();
const axios = require('axios');
const safe2pay = require('safe2pay');

/**
 * Safe2Pay Hybrid Service - Combina SDK oficial com implementação customizada
 * 
 * PIX: Implementação customizada (funciona perfeitamente)
 * Boletos: SDK oficial (mais robusto)
 * Consultas: Ambas as abordagens
 */
class Safe2PayHybrid {
    constructor() {
        // Configurar SDK oficial
        this.environment = safe2pay.environment.setApiKey(process.env.SAFE2PAY_TOKEN);
        
        // Configuração para implementação customizada
        this.customConfig = {
            baseURL: 'https://payment.safe2pay.com.br',
            headers: {
                'Content-Type': 'application/json',
                'X-API-KEY': process.env.SAFE2PAY_TOKEN
            },
            timeout: 30000
        };

        console.log('🔧 Safe2Pay Hybrid Service inicializado');
        console.log('   ✅ SDK oficial configurado');
        console.log('   ✅ Implementação customizada configurada');
    }

    /**
     * Cria PIX que aparece no relatório (PaymentMethod "6")
     */
    async criarPix(dados) {
        console.log('💳 Criando PIX que aparece no relatório...');

        try {
            const pixPayload = {
                IsSandbox: false,
                Application: dados.application || "Certificado Campinas",
                Vendor: dados.vendor || "Certificado Digital - Campinas",
                CallbackUrl: dados.callbackUrl || "https://webhook.site/certificado-campinas",
                PaymentMethod: "6", // PIX que gera DS - Duplicata de Serviço
                Reference: dados.referencia, // ✅ OBRIGATÓRIO: Protocolo como referência
                Customer: {
                    Name: dados.cliente.nome,
                    Identity: dados.cliente.cpf,
                    Phone: dados.cliente.telefone,
                    Email: dados.cliente.email,
                    Address: {
                        ZipCode: dados.cliente.endereco.cep,
                        Street: dados.cliente.endereco.rua,
                        Number: dados.cliente.endereco.numero,
                        Complement: dados.cliente.endereco.complemento || "",
                        District: dados.cliente.endereco.bairro,
                        CityName: dados.cliente.endereco.cidade,
                        StateInitials: dados.cliente.endereco.estado,
                        CountryName: "Brasil"
                    }
                },
                Products: [
                    {
                        Code: dados.produto?.codigo || "CERT_DIGITAL",
                        Description: dados.produto?.descricao || "Certificado Digital e-CPF A1",
                        UnitPrice: dados.valor,
                        Quantity: 1
                    }
                ]
            };

            console.log('📋 Criando PIX via /v2/payment...');

            const response = await axios.post('/v2/payment', pixPayload, this.customConfig);

            if (response.data.HasError) {
                throw new Error(`Erro PIX: ${response.data.Error}`);
            }

            const details = response.data.ResponseDetail;

            console.log('✅ PIX criado com sucesso!');
            console.log(`   🆔 ID: ${details.IdTransaction}`);
            console.log(`   💰 Valor: R$ ${dados.valor}`);
            console.log(`   📋 Referência: ${dados.referencia}`);
            console.log(`   🔗 QR Code: ${details.QrCode}`);

            return {
                sucesso: true,
                tipo: 'PIX',
                metodo: 'payment_method_6',
                dados: {
                    id: details.IdTransaction,
                    valor: dados.valor,
                    referencia: pixPayload.Reference,
                    qrCode: details.QrCode,
                    pixKey: details.Key,
                    status: details.Status,
                    statusMessage: details.Message,
                    criadoEm: new Date().toISOString(),
                    apareceRelatorio: true
                }
            };

        } catch (error) {
            console.error('❌ Erro ao criar PIX:', error.message);
            return {
                sucesso: false,
                tipo: 'PIX',
                metodo: 'payment_method_6',
                erro: error.message
            };
        }
    }

    /**
     * Cria Boleto usando SDK oficial (mais robusto)
     */
    async criarBoleto(dados) {
        console.log('🧾 Criando Boleto com SDK oficial...');
        
        try {
            const PaymentRequest = safe2pay.api.PaymentRequest;
            
            // Modelos do SDK
            const Transaction = safe2pay.model.transaction.Transaction;
            const Customer = safe2pay.model.general.Customer;
            const Product = safe2pay.model.general.Product;
            const Address = safe2pay.model.general.Address;
            const BankSlip = safe2pay.model.payment.Bankslip;

            // Criar transação
            const transaction = new Transaction();
            transaction.IsSandbox = false;
            transaction.Application = dados.application || "Certificado Campinas";
            transaction.Vendor = dados.vendor || "Certificado Digital - Campinas";
            transaction.CallbackUrl = dados.callbackUrl || "https://webhook.site/certificado-campinas";
            transaction.PaymentMethod = "1"; // Boleto bancário
            transaction.Reference = dados.referencia; // ✅ OBRIGATÓRIO: Protocolo como referência

            // Configurar boleto
            const bankslip = new BankSlip();
            bankslip.DueDate = dados.vencimento || this.calcularVencimento(30); // 30 dias
            bankslip.CancelAfterDue = false;
            bankslip.IsEnablePartialPayment = false;
            bankslip.PenaltyRate = dados.multa || 2.00;
            bankslip.InterestRate = dados.juros || 0.40;
            bankslip.Instruction = dados.instrucao || "Pagamento referente a Certificado Digital";
            bankslip.Message = dados.mensagens || [
                "Certificado Digital e-CPF A1",
                "Válido por 1 ano",
                "Suporte: (19) 99788-8810"
            ];

            transaction.PaymentObject = bankslip;

            // Adicionar produtos
            transaction.Products.push(new Product(
                dados.produto?.codigo || "CERT_DIGITAL",
                dados.produto?.descricao || "Certificado Digital e-CPF A1",
                dados.valor,
                1
            ));

            // Dados do endereço
            const address = new Address();
            address.ZipCode = dados.cliente.endereco.cep;
            address.Street = dados.cliente.endereco.rua;
            address.Number = dados.cliente.endereco.numero;
            address.Complement = dados.cliente.endereco.complemento || "";
            address.District = dados.cliente.endereco.bairro;
            address.StateInitials = dados.cliente.endereco.estado;
            address.CityName = dados.cliente.endereco.cidade;
            address.CountryName = "Brasil";

            // Dados do cliente
            const customer = new Customer();
            customer.Name = dados.cliente.nome;
            customer.Identity = dados.cliente.cpf;
            customer.Phone = dados.cliente.telefone;
            customer.Email = dados.cliente.email;
            customer.Address = address;

            transaction.Customer = customer;

            console.log('📋 Criando boleto via SDK...');
            const result = await PaymentRequest.Payment(transaction);

            if (result.HasError) {
                throw new Error(`Erro Boleto: ${result.Error}`);
            }

            const details = result.ResponseDetail;

            console.log('✅ Boleto criado com sucesso!');
            console.log(`   🆔 ID: ${details.IdTransaction}`);
            console.log(`   💰 Valor: R$ ${dados.valor}`);
            console.log(`   📋 Referência: ${dados.referencia}`);
            console.log(`   🏦 Banco: ${details.BankName}`);
            console.log(`   🔗 URL: ${details.BankSlipUrl}`);

            return {
                sucesso: true,
                tipo: 'BOLETO',
                metodo: 'sdk_oficial',
                dados: {
                    id: details.IdTransaction,
                    valor: dados.valor,
                    vencimento: details.DueDate,
                    banco: details.BankName,
                    numero: details.BankSlipNumber,
                    url: details.BankSlipUrl,
                    linhaDigitavel: details.DigitableLine,
                    codigoBarras: details.Barcode,
                    status: details.Status,
                    criadoEm: new Date().toISOString()
                }
            };

        } catch (error) {
            console.error('❌ Erro ao criar Boleto:', error.message);
            return {
                sucesso: false,
                tipo: 'BOLETO',
                metodo: 'sdk_oficial',
                erro: error.message
            };
        }
    }

    /**
     * Consulta transação (tenta ambas as abordagens)
     */
    async consultarTransacao(id) {
        console.log(`🔍 Consultando transação ID: ${id}...`);

        // Tentar primeiro com SDK oficial
        try {
            const TransactionRequest = safe2pay.api.TransactionRequest;
            const result = await TransactionRequest.Get(id);

            if (!result.HasError) {
                console.log('✅ Consulta via SDK oficial bem-sucedida');
                return {
                    sucesso: true,
                    metodo: 'sdk_oficial',
                    dados: result.ResponseDetail
                };
            }
        } catch (error) {
            console.log('⚠️ SDK oficial falhou, tentando implementação customizada...');
        }

        // Tentar com implementação customizada
        try {
            const response = await axios.get(`/v2/payment/${id}`, this.customConfig);
            
            if (!response.data.HasError) {
                console.log('✅ Consulta via implementação customizada bem-sucedida');
                return {
                    sucesso: true,
                    metodo: 'customizado',
                    dados: response.data.ResponseDetail
                };
            }
        } catch (error) {
            console.log('❌ Ambas as abordagens falharam na consulta');
        }

        return {
            sucesso: false,
            erro: 'Transação não encontrada em nenhuma das abordagens'
        };
    }

    /**
     * Cria pagamento (escolhe automaticamente o melhor método)
     */
    async criarPagamento(tipo, dados) {
        console.log(`🚀 Criando pagamento tipo: ${tipo.toUpperCase()}`);

        switch (tipo.toUpperCase()) {
            case 'PIX':
                return await this.criarPix(dados);
            
            case 'BOLETO':
                return await this.criarBoleto(dados);
            
            default:
                return {
                    sucesso: false,
                    erro: `Tipo de pagamento não suportado: ${tipo}`
                };
        }
    }

    /**
     * Utilitários
     */
    calcularVencimento(dias) {
        const data = new Date();
        data.setDate(data.getDate() + dias);
        return data.toLocaleDateString('pt-BR');
    }

    validarCPF(cpf) {
        return cpf && cpf.length >= 11;
    }

    formatarValor(valor) {
        return parseFloat(valor).toFixed(2);
    }

    /**
     * Exemplo de uso do sistema híbrido
     */
    async exemploUso() {
        console.log('📋 EXEMPLO DE USO DO SISTEMA HÍBRIDO\n');
        console.log('=' .repeat(60));

        // Dados do cliente (exemplo)
        const dadosCliente = {
            nome: "João da Silva",
            cpf: "12345678901",
            email: "joao@email.com",
            telefone: "11999999999",
            endereco: {
                cep: "01234567",
                rua: "Rua Exemplo",
                numero: "123",
                complemento: "Apto 45",
                bairro: "Centro",
                cidade: "São Paulo",
                estado: "SP"
            }
        };

        console.log('💳 EXEMPLO: Criando PIX');
        console.log('Dados necessários para PIX:');
        console.log('- valor: number');
        console.log('- cliente: objeto com dados completos');
        console.log('- produto (opcional): código e descrição');

        console.log('\n🧾 EXEMPLO: Criando Boleto');
        console.log('Dados necessários para Boleto:');
        console.log('- valor: number');
        console.log('- cliente: objeto com dados completos');
        console.log('- vencimento (opcional): data em DD/MM/AAAA');
        console.log('- produto (opcional): código e descrição');

        console.log('\n📊 MÉTODOS DISPONÍVEIS:');
        console.log('- criarPix(dados): Cria PIX que aparece no relatório');
        console.log('- criarBoleto(dados): Cria boleto bancário');
        console.log('- criarPagamento(tipo, dados): Método unificado');
        console.log('- consultarTransacao(id): Consulta status');

        console.log('\n✅ SISTEMA PRONTO PARA INTEGRAÇÃO!');
    }
}

module.exports = Safe2PayHybrid;
