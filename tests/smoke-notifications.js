const { buildContainer } = require('../src/main/container');

(async()=>{
  process.env.SENDGRID_API_KEY = process.env.SENDGRID_API_KEY || 'SG.invalid';
  process.env.SENDGRID_SENDER = process.env.SENDGRID_SENDER || 'no-reply@example.com';
  process.env.SENDGRID_SANDBOX = 'true';
  const container = buildContainer();
  const providerId = 'notif';
  await container.enableSchedulingForUser.execute({ providerId, enabled:true });
  await container.configureSchedulePolicy.execute({ providerId, policy: {
    enabled:true, timezone:'America/Sao_Paulo', workingDays:[1,2,3,4,5],
    shifts:[{start:'09:00', end:'10:00'}], slotDurationMinutes: 30,
    exceptions:{ holidays:[], blocks:[] }, maxConcurrentAppointments:1, bookingWindowDays:7
  }});
  const day = new Date(); day.setUTCHours(0,0,0,0); day.setUTCDate(day.getUTCDate()+1);
  const fromISO = day.toISOString(); const to = new Date(day); to.setUTCDate(to.getUTCDate()+1);
  const avail = await container.listAvailability.execute({ providerId, fromISO, toISO: to.toISOString() });
  const slot = avail.slots[0];
  const r = await container.bookAppointment.execute({ providerId, customer:{ name:'Cliente', email:'sandbox@example.com' }, startISO:slot.startISO, endISO:slot.endISO });
  console.log('booked', r.ok, r.appointment?.id);
  console.log('sendgrid sandbox', process.env.SENDGRID_SANDBOX);
  console.log('done');
})().catch(e => { console.error(e); process.exit(1); });


