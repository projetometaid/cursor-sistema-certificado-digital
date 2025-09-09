const { saveItem, getAll, updateWhere, createId } = require('../data/localStore');

const ORDERS_COLLECTION = 'orders';

async function listOrders() {
  const items = await getAll(ORDERS_COLLECTION);
  return { ok: true, items };
}

async function createOrder(payload) {
  const errors = [];
  if (!payload?.type) errors.push('type obrigatório (eCPF|eCNPJ)');
  if (!payload?.customer?.email) errors.push('email do cliente obrigatório');
  if (errors.length) return { ok: false, errors };

  const order = {
    id: createId(),
    type: payload.type,
    customer: payload.customer || {},
    address: payload.address || {},
    documents: payload.documents || {},
    protocolId: payload.protocolId || null,
    paymentRef: payload.paymentRef || payload.protocolId || null,
    status: 'awaiting_payment',
    createdAt: new Date().toISOString()
  };
  await saveItem(ORDERS_COLLECTION, order);
  return { ok: true, order };
}

async function updateOrderByReference(reference, patch) {
  await updateWhere(ORDERS_COLLECTION, o => o.paymentRef === reference, patch);
  return { ok: true };
}

module.exports = { listOrders, createOrder, updateOrderByReference };


