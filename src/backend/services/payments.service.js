const { getAll, saveItem, createId } = require('../data/localStore');
const Safe2PayHybrid = require('../integrations/safe2pay/Safe2PayHybrid');

async function getOrderById(id) {
  const orders = await getAll('orders');
  return orders.find(o => o.id === id) || null;
}

async function createPaymentForOrder(orderId, method = 'PIX') {
  const order = await getOrderById(orderId);
  if (!order) return { ok: false, error: 'Pedido não encontrado' };

  const s2p = new Safe2PayHybrid();
  const valor = parseFloat(process.env.DEFAULT_ORDER_AMOUNT || '199.99');

  const dadosPagamento = {
    valor,
    cliente: {
      nome: order.customer?.name || 'Cliente',
      cpf: order.customer?.cpf || order.customer?.cnpj || '',
      email: order.customer?.email || 'email@exemplo.com',
      telefone: order.customer?.phone || '11999999999',
      endereco: {
        cep: order.address?.cep || '',
        rua: order.address?.street || '',
        numero: order.address?.number || '0',
        complemento: order.address?.complement || '',
        bairro: order.address?.district || '',
        cidade: order.address?.city || '',
        estado: order.address?.state || ''
      }
    },
    produto: { codigo: order.type, descricao: `Certificado ${order.type}` },
    referencia: order.paymentRef || order.protocolId || order.id,
    callbackUrl: 'https://webhook.site/certificado-config'
  };

  let result;
  if (String(method).toUpperCase() === 'PIX') {
    result = await s2p.criarPix(dadosPagamento);
  } else {
    result = await s2p.criarBoleto(dadosPagamento);
  }

  if (!result?.sucesso) return { ok: false, error: result?.erro || 'Falha ao criar pagamento' };

  const payment = {
    id: createId(),
    orderId: order.id,
    method: String(method).toUpperCase(),
    gateway: 'Safe2Pay',
    txId: result.dados?.id || null,
    reference: result.dados?.referencia || dadosPagamento.referencia,
    status: result.dados?.status || 'pending',
    payload: result,
    createdAt: new Date().toISOString()
  };
  await saveItem('payments', payment);

  return { ok: true, payment, gatewayResponse: result };
}

module.exports = { createPaymentForOrder };


