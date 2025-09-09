const { buildContainer } = require('../src/main/container');
const SendGridEmailProvider = require('../src/infrastructure/notifications/SendGridEmailProvider');

function nextWeekday(targetDay){
  const now = new Date();
  const date = new Date(now); date.setUTCHours(0,0,0,0);
  const current = date.getUTCDay();
  let delta = targetDay - current; if(delta <= 0) delta += 7;
  date.setUTCDate(date.getUTCDate()+delta);
  return date;
}

function fmt(iso, tz='America/Sao_Paulo'){
  const d = new Date(iso);
  return new Intl.DateTimeFormat('pt-BR', { timeZone: tz, dateStyle:'short', timeStyle:'short' }).format(d);
}

(async()=>{
  const apiKey = process.env.SENDGRID_API_KEY;
  const sender = process.env.SENDGRID_SENDER || 'no-reply@example.com';
  if(!apiKey){ console.error('Falta SENDGRID_API_KEY'); process.exit(1); }
  const to = process.env.SENDGRID_TO || 'leandro.albertini@certificadocampinas.com.br';

  const container = buildContainer();
  const providerId = 'ana';
  await container.enableSchedulingForUser.execute({ providerId, enabled:true });
  await container.configureSchedulePolicy.execute({ providerId, policy: {
    enabled:true, timezone:'America/Sao_Paulo', workingDays:[1,2,3,4,5],
    shifts:[{ start:'08:30', end:'12:30' }, { start:'13:30', end:'17:30' }],
    slotDurationMinutes: 10, gapBetweenSlotsMinutes: 0,
    exceptions:{ holidays:[], blocks:[] }, maxConcurrentAppointments:1, bookingWindowDays:30
  }});

  // Simular protocolo (sem chamar integrações externas para não quebrar)
  const protocolId = (crypto.randomUUID ? crypto.randomUUID() : require('crypto').randomBytes(8).toString('hex')).slice(0,12).toUpperCase();

  // Escolher um slot disponível
  const day = nextWeekday(3);
  const fromISO = day.toISOString(); const toISO = new Date(day); toISO.setUTCDate(toISO.getUTCDate()+1);
  const avail = await container.listAvailability.execute({ providerId, fromISO, toISO: toISO.toISOString() });
  if(!avail.ok || avail.slots.length===0) throw new Error('sem_slots');
  const slot = avail.slots[Math.floor(avail.slots.length/2)];
  const booked = await container.bookAppointment.execute({ providerId, customer:{ name:'Leandro', email: to }, startISO:slot.startISO, endISO:slot.endISO });
  if(!booked.ok) throw new Error('booking_failed');

  // E-mail formalizando ciclo (HTML simples)
  const email = new SendGridEmailProvider({ apiKey, sender, sandbox: false });
  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.4">
      <h2>Protocolo: ${protocolId}</h2>
      <p>Seu agendamento foi confirmado.</p>
      <ul>
        <li>Data/Hora: ${fmt(slot.startISO)} - ${fmt(slot.endISO)}</li>
        <li>Provider: ${providerId}</li>
        <li>Appointment: ${booked.appointment.id}</li>
      </ul>
      <p>Se precisar remarcar ou cancelar, responda este e-mail.</p>
    </div>`;
  const res = await email.publish('email', { to, subject:`[${protocolId}] Agendamento confirmado`, html, category:'appointment', customArgs:{ appointmentId: booked.appointment.id, protocolId } }, { idempotencyKey: `${booked.appointment.id}-booked-mail` });
  console.log('protocol', protocolId);
  console.log('appointment', booked.appointment.id);
  console.log('email', res);
  console.log('OK');
})().catch(e=>{ console.error(e); process.exit(1); });


