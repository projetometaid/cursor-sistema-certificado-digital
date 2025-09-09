const { env } = require('../../config/settings');
const { hashPassword, comparePassword } = require('../shared/utils/hash');
const { signToken } = require('../shared/utils/tokens');
const JsonOrderRepository = require('../infrastructure/repositories/json/JsonOrderRepository');
const JsonUserRepository = require('../infrastructure/repositories/json/JsonUserRepository');
const RegisterUserUseCase = require('../core/usecases/RegisterUserUseCase');
const LoginUseCase = require('../core/usecases/LoginUseCase');
const CreateOrderUseCase = require('../core/usecases/CreateOrderUseCase');
const ListOrdersUseCase = require('../core/usecases/ListOrdersUseCase');
const MarkOrderPaidUseCase = require('../core/usecases/MarkOrderPaidUseCase');
function validateOrderInput(body){
  const errors = [];
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body?.customer?.email||'');
  if(!['eCPF','eCNPJ'].includes(body?.type)) errors.push('type inválido');
  if(!emailOk) errors.push('email inválido');
  return errors;
}
function buildContainer(){
  const orderRepository = new JsonOrderRepository();
  const userRepository = new JsonUserRepository();
  // Analytics wiring
  const { getEnv } = require('../shared/config/env');
  const analyticsEnv = getEnv();
  let analytics = { publish: async ()=>{} };
  if (analyticsEnv.ANALYTICS_PROVIDER === 'ga4' || analyticsEnv.ANALYTICS_PROVIDER === 'multi') {
    const Ga4MeasurementPublisher = require('../infrastructure/analytics/Ga4MeasurementPublisher');
    analytics = new Ga4MeasurementPublisher({
      measurementId: analyticsEnv.GA4_MEASUREMENT_ID,
      apiSecret: analyticsEnv.GA4_API_SECRET
    });
  }
  const registerUser = RegisterUserUseCase({ userRepository, hashPassword });
  const loginUser = LoginUseCase({ userRepository, comparePassword, signToken });
  const createOrder = CreateOrderUseCase({ orderRepository, validate: validateOrderInput, analytics });
  const listOrders = ListOrdersUseCase({ orderRepository });
  const markOrderPaid = MarkOrderPaidUseCase({ orderRepository, analytics });
  return { env, registerUser, loginUser, createOrder, listOrders, markOrderPaid, analytics };
}
module.exports = { buildContainer };
