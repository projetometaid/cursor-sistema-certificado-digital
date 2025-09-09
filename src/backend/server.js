const express = require('express');
const cors = require('cors');
const { env } = require('../../config/settings');
const { authRouter } = require('./routes/auth');
let connectMongo;
try {
  // Lazy optional import para futuro uso
  ({ connectMongo } = require('./db/mongo'));
} catch (_) {}

// In-memory store (substitui Mongo por enquanto)
const store = {
  orders: [],
  payments: []
};

function createId() {
  return Math.random().toString(36).slice(2);
}

// Services
function isEmail(v = '') {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}
function isCPF(v = '') { return /^\d{11}$/.test(String(v).replace(/\D/g, '')); }
function isCNPJ(v = '') { return /^\d{14}$/.test(String(v).replace(/\D/g, '')); }

function validateOrderInput(body) {
  const errors = [];
  if (!['eCPF', 'eCNPJ'].includes(body.type)) errors.push('type inválido');
  if (!body.customer?.email || !isEmail(body.customer.email)) errors.push('email inválido');
  if (body.type === 'eCPF' && !isCPF(body.customer?.cpf)) errors.push('cpf inválido');
  if (body.type === 'eCNPJ' && !isCNPJ(body.customer?.cnpj)) errors.push('cnpj inválido');
  const { caepf, cei } = body.documents || {};
  if (caepf && cei) errors.push('Informe CAEPF OU CEI, não ambos');
  return errors;
}

async function createOrder(input) {
  const errors = validateOrderInput(input);
  if (errors.length) return { ok: false, errors };
  const order = {
    id: createId(),
    ...input,
    status: 'awaiting_payment',
    paymentRef: input.protocolId || undefined,
    createdAt: new Date().toISOString()
  };
  store.orders.push(order);
  return { ok: true, order };
}

async function getOrder(id) {
  const order = store.orders.find(o => o.id === id);
  if (!order) return { ok: false, error: 'Pedido não encontrado' };
  return { ok: true, order };
}

async function markOrderPaidByReference(reference) {
  const order = store.orders.find(o => o.paymentRef === reference);
  if (!order) return { ok: false, error: 'Pedido não encontrado pela referência' };
  order.status = 'paid';
  return { ok: true, order };
}

// Payments (placeholder; pode integrar Safe2PayHybrid depois)
async function createPaymentForOrder(order, method = 'PIX') {
  const response = { id: createId(), reference: order.paymentRef || order.id, status: 'pending' };
  const payment = {
    id: createId(),
    orderId: order.id,
    method,
    gateway: 'Safe2Pay',
    txId: response.id,
    reference: response.reference,
    status: response.status,
    payload: response,
    createdAt: new Date().toISOString()
  };
  store.payments.push(payment);
  return { ok: true, payment, gatewayResponse: response };
}

// Routers
const app = express();
app.use(express.json({ limit: '1mb' }));
app.use(cors({ origin: env.frontendOrigin, credentials: true }));

// Mount auth routes (register/login)
app.use('/auth', authRouter);

app.get('/health', (_, res) => res.json({ ok: true }));

app.post('/orders', async (req, res) => {
  const { ok, errors, order } = await createOrder(req.body);
  if (!ok) return res.status(400).json({ ok, errors });
  const pay = await createPaymentForOrder(order, req.body.paymentMethod || 'PIX');
  res.status(201).json({ ok: true, order, payment: pay.payment, gateway: pay.gatewayResponse });
});

app.get('/orders/:id', async (req, res) => {
  const { ok, error, order } = await getOrder(req.params.id);
  if (!ok) return res.status(404).json({ ok: false, error });
  res.json({ ok: true, order });
});

app.post('/webhooks/safe2pay', async (req, res) => {
  const reference = req.body?.Reference || req.body?.reference;
  const status = String(req.body?.Status || '').toLowerCase();
  if (!reference) return res.status(400).json({ ok: false, error: 'Sem referência' });
  if (status === 'paid' || status === 'approved') {
    const { ok, error } = await markOrderPaidByReference(reference);
    if (!ok) return res.status(404).json({ ok: false, error });
  }
  res.json({ ok: true });
});

async function start() {
  if (env.useMongo && typeof connectMongo === 'function') {
    try {
      await connectMongo();
    } catch (e) {
      console.log('[DB] Falha ao conectar no Mongo, seguindo em memória:', e.message);
    }
  }
  app.listen(env.apiPort, () => {
    console.log(`[API] Rodando em http://localhost:${env.apiPort}`);
  });
}

start();

module.exports = app;


