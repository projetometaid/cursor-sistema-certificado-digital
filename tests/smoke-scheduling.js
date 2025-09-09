const { buildContainer } = require('../src/main/container');

function nextWeekday(targetDay){
  const now = new Date();
  const date = new Date(now); date.setUTCHours(0,0,0,0);
  const current = date.getUTCDay();
  let delta = targetDay - current; if(delta <= 0) delta += 7;
  date.setUTCDate(date.getUTCDate()+delta);
  return date;
}

(async()=>{
  const container = buildContainer();
  const providerId = 'ana';
  await container.enableSchedulingForUser.execute({ providerId, enabled:true });
  await container.configureSchedulePolicy.execute({ providerId, policy: {
    enabled: true,
    timezone: 'America/Sao_Paulo',
    workingDays: [1,2,3,4,5],
    shifts: [{ start:'08:30', end:'12:30' }, { start:'13:30', end:'17:30' }],
    slotDurationMinutes: 10,
    gapBetweenSlotsMinutes: 0,
    exceptions: { holidays: [], blocks: [] },
    maxConcurrentAppointments: 1,
    bookingWindowDays: 30
  }});
  const day = nextWeekday(3); // Wednesday
  const fromISO = day.toISOString();
  const to = new Date(day); to.setUTCDate(to.getUTCDate()+1); const toISO = to.toISOString();
  const avail = await container.listAvailability.execute({ providerId, fromISO, toISO });
  if(!avail.ok) throw new Error('availability_not_ok');
  console.log('[SCHED] slots', avail.slots.length);
  if(avail.slots.length === 0) throw new Error('no_slots_generated');
  // Pick a mid-day slot to minimize conflicts
  const mid = Math.floor(avail.slots.length/2);
  const slot = avail.slots[mid];
  // Create hold for 1 minute
  const policy = await container.schedulePolicyRepository.findByProviderId(providerId);
  console.log('[SCHED] policy exists?', !!policy, 'enabled?', policy?.enabled);
  const hold = await container.createHold.execute({ providerId, startISO:slot.startISO, endISO:slot.endISO, ttlMinutes:1 });
  if(!hold.ok) { console.error('[SCHED] hold error', hold); throw new Error('hold_failed'); }
  // Availability should now exclude the held slot
  const avail2 = await container.listAvailability.execute({ providerId, fromISO, toISO });
  console.log('[SCHED] slots after hold', avail2.slots.length);
  const booked = await container.bookAppointment.execute({ providerId, customer:{ name:'Teste' }, startISO:slot.startISO, endISO:slot.endISO, holdId:hold.hold.id });
  if(!booked.ok) throw new Error('booking_failed');
  console.log('[SCHED] booked', booked.appointment.id);
  console.log('OK');
})().catch(e => { console.error(e); process.exit(1); });


