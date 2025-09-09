const PaymentSucceededEvent = require('../events/PaymentSucceededEvent');
module.exports = function MarkOrderPaidUseCase({ orderRepository, analytics }){
  return { async execute(reference){
    await orderRepository.updateByReference(reference, { status:'paid' });
    try {
      const evt = PaymentSucceededEvent({ protocolId: reference, value: 0, currency: 'BRL', paymentMethod: 'pix' });
      await analytics.publish(evt.eventName, evt.payload);
    } catch(_){}
    return { ok:true };
  } };
};
