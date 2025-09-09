const SendGridEmailProvider = require('../src/infrastructure/notifications/SendGridEmailProvider');

function arg(name, def){
  const idx = process.argv.indexOf(`--${name}`);
  return idx> -1 ? process.argv[idx+1] : def;
}

(async()=>{
  const to = arg('to', process.env.SENDGRID_TO || 'sandbox@example.com');
  const subject = arg('subject', 'Teste de agendamento');
  const html = arg('html', '<p>Agendamento de teste – SendGrid</p>');
  const apiKey = process.env.SENDGRID_API_KEY;
  const sender = process.env.SENDGRID_SENDER || 'no-reply@example.com';
  const sandbox = String(process.env.SENDGRID_SANDBOX||'true').toLowerCase()==='true';
  if(!apiKey){ console.error('Falta SENDGRID_API_KEY'); process.exit(1); }
  const provider = new SendGridEmailProvider({ apiKey, sender, sandbox });
  const res = await provider.publish('email', { to, subject, html, category:'appointment', customArgs:{ test:true } }, { idempotencyKey: `manual-${Date.now()}` });
  console.log(JSON.stringify(res, null, 2));
})().catch(e=>{ console.error(e); process.exit(1); });


