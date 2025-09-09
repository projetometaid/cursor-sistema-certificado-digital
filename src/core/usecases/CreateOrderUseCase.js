const LeadSubmittedEvent = require('../events/LeadSubmittedEvent');
const { hashEmail, hashPhone, normalizeAddress } = require('../../shared/privacy/pii');

module.exports = function CreateOrderUseCase({ orderRepository, validate, analytics }){
  return {
    async execute(input){
      const errors = validate(input);
      if(errors.length) return { ok:false, errors };
      const order = { id: cryptoId(), ...input, status:'awaiting_payment', paymentRef: input.protocolId || undefined, createdAt: new Date().toISOString() };
      await orderRepository.save(order);
      try {
        const customer = input.customer || {};
        const evt = LeadSubmittedEvent({
          protocolId: order.paymentRef || order.id,
          value: Number(input?.value || 0),
          currency: input?.currency || 'BRL',
          customer: {
            email_hash: hashEmail(customer.email),
            phone_hash: hashPhone(customer.phone),
            address: normalizeAddress(customer.address)
          },
          consent: input?.consent,
          source: input?.source
        });
        await analytics.publish(evt.eventName, evt.payload);
      } catch(_){}
      return { ok:true, order };
    }
  };
};
function cryptoId(){ try { return require('crypto').randomUUID(); } catch { return require('crypto').randomBytes(16).toString('hex'); } }
