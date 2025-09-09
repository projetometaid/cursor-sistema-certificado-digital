const { env } = require('../../config/settings');
// legacy hash/token kept for backward compatibility, new services below
const JsonOrderRepository = require('../infrastructure/repositories/json/JsonOrderRepository');
const JsonUserRepository = require('../infrastructure/repositories/json/JsonUserRepository');
// Scheduling infra
const SchedulePolicyRepositoryImpl = require('../infrastructure/repositories/SchedulePolicyRepositoryImpl');
const AppointmentRepositoryImpl = require('../infrastructure/repositories/AppointmentRepositoryImpl');
const HoldRepositoryImpl = require('../infrastructure/repositories/HoldRepositoryImpl');
const LocalCalendarProvider = require('../infrastructure/calendar/LocalCalendarProvider');
const SendGridEmailProvider = require('../infrastructure/notifications/SendGridEmailProvider');
const RegisterUserUseCase = require('../core/usecases/RegisterUserUseCase');
const LoginUseCase = require('../core/usecases/LoginUseCase');
// Security services (new)
const BcryptPasswordHasher = require('../infrastructure/security/BcryptPasswordHasher');
const JwtAuthTokenService = require('../infrastructure/security/JwtAuthTokenService');
const CreateOrderUseCase = require('../core/usecases/CreateOrderUseCase');
const ListOrdersUseCase = require('../core/usecases/ListOrdersUseCase');
const MarkOrderPaidUseCase = require('../core/usecases/MarkOrderPaidUseCase');
// Scheduling use cases
const EnableSchedulingForUserUseCase = require('../core/usecases/EnableSchedulingForUserUseCase');
const ConfigureSchedulePolicyUseCase = require('../core/usecases/ConfigureSchedulePolicyUseCase');
const GenerateAvailabilityUseCase = require('../core/usecases/GenerateAvailabilityUseCase');
const ListAvailabilityUseCase = require('../core/usecases/ListAvailabilityUseCase');
const BookAppointmentUseCase = require('../core/usecases/BookAppointmentUseCase');
const BlockTimeUseCase = require('../core/usecases/BlockTimeUseCase');
const SetHolidaysUseCase = require('../core/usecases/SetHolidaysUseCase');
const CreateHoldUseCase = require('../core/usecases/CreateHoldUseCase');
const ReleaseHoldUseCase = require('../core/usecases/ReleaseHoldUseCase');
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
  const passwordHasher = new BcryptPasswordHasher();
  const authTokenService = new JwtAuthTokenService();
  const schedulePolicyRepository = new SchedulePolicyRepositoryImpl();
  const appointmentRepository = new AppointmentRepositoryImpl();
  const holdRepository = new HoldRepositoryImpl();
  const calendarProvider = new LocalCalendarProvider();
  const notificationPublisher = new SendGridEmailProvider({});
  const { createId } = require('../infrastructure/db/localStore');
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
  const registerUser = RegisterUserUseCase({ userRepository, passwordHasher });
  const loginUser = LoginUseCase({ userRepository, passwordHasher, authTokenService });
  const createOrder = CreateOrderUseCase({ orderRepository, validate: validateOrderInput, analytics });
  const listOrders = ListOrdersUseCase({ orderRepository });
  const markOrderPaid = MarkOrderPaidUseCase({ orderRepository, analytics });
  // Scheduling wiring
  const enableSchedulingForUser = EnableSchedulingForUserUseCase({ userRepository, schedulePolicyRepository });
  const configureSchedulePolicy = ConfigureSchedulePolicyUseCase({ schedulePolicyRepository });
  const generateAvailability = GenerateAvailabilityUseCase({ schedulePolicyRepository, appointmentRepository, holdRepository });
  const listAvailability = ListAvailabilityUseCase({ availabilityGenerator: generateAvailability });
  const bookAppointment = BookAppointmentUseCase({ schedulePolicyRepository, appointmentRepository, calendarProvider, idFactory: createId, holdRepository, notificationPublisher });
  const blockTime = BlockTimeUseCase({ schedulePolicyRepository });
  const setHolidays = SetHolidaysUseCase({ schedulePolicyRepository });
  const createHold = CreateHoldUseCase({ schedulePolicyRepository, appointmentRepository, holdRepository });
  const releaseHold = ReleaseHoldUseCase({ holdRepository });
  return { env, registerUser, loginUser, createOrder, listOrders, markOrderPaid, analytics,
    authTokenService, userRepository, notificationPublisher,
    // scheduling
    enableSchedulingForUser, configureSchedulePolicy, generateAvailability, listAvailability, bookAppointment, blockTime, setHolidays,
    createHold, releaseHold,
    // repos exposed for simple operations
    appointmentRepository, schedulePolicyRepository, holdRepository
  };
}
module.exports = { buildContainer };
