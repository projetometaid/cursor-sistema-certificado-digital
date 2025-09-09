const { rangesOverlap } = require('../../shared/utils/time');

module.exports = function BookAppointmentUseCase({ schedulePolicyRepository, appointmentRepository, calendarProvider, idFactory, holdRepository }){
  return {
    async execute({ providerId, customer, serviceId, startISO, endISO, holdId }){
      const policy = await schedulePolicyRepository.findByProviderId(providerId);
      if(!policy?.enabled) return { ok:false, error:'scheduling_disabled' };
      const exist = await appointmentRepository.listByProviderBetween(providerId, startISO, endISO);
      const overlapping = exist.filter(a => a.status==='booked' && rangesOverlap(a.startISO, a.endISO, startISO, endISO));
      if(overlapping.length >= (policy.maxConcurrentAppointments||1)) return { ok:false, error:'slot_unavailable' };
      // if holdId provided, release it on success
      const id = idFactory ? idFactory() : (require('crypto').randomUUID ? require('crypto').randomUUID() : require('crypto').randomBytes(16).toString('hex'));
      const appt = { id, providerId, customer, serviceId, startISO, endISO, status:'booked' };
      await appointmentRepository.save(appt);
      try { await calendarProvider?.createEvent?.({ id, providerId, startISO, endISO, title: customer?.name || 'Atendimento' }); } catch(_){ }
      if(holdId && holdRepository){ try { await holdRepository.release(holdId); } catch(_){} }
      return { ok:true, appointment: appt };
    }
  };
};


