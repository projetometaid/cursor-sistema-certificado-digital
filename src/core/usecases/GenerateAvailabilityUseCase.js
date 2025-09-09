const { addMinutesISO, buildDateOnDay, getWeekday } = require('../../shared/utils/time');
const { applyExceptions } = require('../policies/SlottingRules');

module.exports = function GenerateAvailabilityUseCase({ schedulePolicyRepository, appointmentRepository, availabilityRepository, holdRepository }){
  return {
    async execute({ providerId, fromISO, toISO }){
      const policy = await schedulePolicyRepository.findByProviderId(providerId);
      if(!policy || !policy.enabled) return { ok:true, slots: [] };
      const cached = availabilityRepository?.get ? await availabilityRepository.get(providerId, fromISO, toISO) : null;
      if(cached?.slots) return { ok:true, slots: cached.slots };
      const slots = [];
      let cursor = new Date(fromISO);
      const end = new Date(toISO);
      while(cursor <= end){
        const dayISO = cursor.toISOString();
        const weekday = getWeekday(dayISO);
        if(policy.workingDays.includes(weekday)){
          for(const wnd of policy.shifts||[]){
            const wndStart = buildDateOnDay(dayISO, wnd.start);
            const wndEnd = buildDateOnDay(dayISO, wnd.end);
            let s = wndStart;
            while(new Date(s) < new Date(wndEnd)){
              const e = addMinutesISO(s, policy.slotDurationMinutes);
              if(new Date(e) <= new Date(wndEnd)){
                slots.push({ startISO: s, endISO: e, providerId, capacity: policy.maxConcurrentAppointments });
              }
              s = addMinutesISO(s, policy.slotDurationMinutes);
            }
          }
        }
        cursor.setUTCDate(cursor.getUTCDate()+1);
        cursor.setUTCHours(0,0,0,0);
      }
      const refined = applyExceptions({ slots, holidays: policy?.exceptions?.holidays, blocks: policy?.exceptions?.blocks });
      const existing = await appointmentRepository.listByProviderBetween(providerId, fromISO, toISO);
      const activeHolds = holdRepository ? await holdRepository.listActiveByProviderBetween(providerId, fromISO, toISO) : [];
      const result = refined.filter(slot => {
        const count = existing.filter(a => a.status === 'booked' && !(new Date(a.endISO) <= new Date(slot.startISO) || new Date(a.startISO) >= new Date(slot.endISO))).length;
        const held = activeHolds.some(h => !(new Date(h.endISO) <= new Date(slot.startISO) || new Date(h.startISO) >= new Date(slot.endISO)));
        return !held && count < (policy.maxConcurrentAppointments || 1);
      });
      if(availabilityRepository?.set) await availabilityRepository.set(providerId, fromISO, toISO, result);
      return { ok:true, slots: result };
    }
  };
};


