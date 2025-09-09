const { rangesOverlap } = require('../../shared/utils/time');

module.exports = function CreateHoldUseCase({ schedulePolicyRepository, appointmentRepository, holdRepository }){
  return {
    async execute({ providerId, startISO, endISO, customer, ttlMinutes = 10 }){
      const policy = await schedulePolicyRepository.findByProviderId(providerId);
      if(!policy?.enabled) return { ok:false, error:'scheduling_disabled' };
      const fromISO = startISO, toISO = endISO;
      const existing = await appointmentRepository.listByProviderBetween(providerId, fromISO, toISO);
      const overlapsAppt = existing.some(a => a.status==='booked' && rangesOverlap(a.startISO, a.endISO, startISO, endISO));
      if(overlapsAppt) return { ok:false, error:'slot_unavailable' };
      const holds = await holdRepository.listActiveByProviderBetween(providerId, fromISO, toISO);
      const overlapsHold = holds.some(h => rangesOverlap(h.startISO, h.endISO, startISO, endISO));
      if(overlapsHold) return { ok:false, error:'slot_on_hold' };
      const expiresAt = new Date(new Date().getTime() + ttlMinutes*60000).toISOString();
      const hold = await holdRepository.create({ providerId, startISO, endISO, customer, expiresAt });
      return { ok:true, hold };
    }
  };
};


