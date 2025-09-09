const https = require('https');

class SendGridEmailProvider {
  constructor({ apiKey, sender, sandbox = false } = {}){
    this.apiKey = apiKey || process.env.SENDGRID_API_KEY;
    this.sender = sender || process.env.SENDGRID_SENDER || 'no-reply@example.com';
    this.sandbox = sandbox || (String(process.env.SENDGRID_SANDBOX||'false').toLowerCase() === 'true');
    this.sentKeys = new Set();
  }
  async publish(kind, payload, options = {}){
    if(kind !== 'email') return { ok:false };
    const idk = options.idempotencyKey;
    if(idk && this.sentKeys.has(idk)) return { ok:true, messageId:'deduped' };
    const body = this._buildBody(payload);
    if(this.sandbox){ body.mail_settings = { sandbox_mode: { enable: true } }; }
    const res = await this._send(body);
    if(idk && res.ok) this.sentKeys.add(idk);
    return res;
  }
  _buildBody({ to, subject, templateId, variables, html, category, customArgs }){
    const baseTo = Array.isArray(to)? to.map(e=>({email:e})) : [{ email: to }];
    const personalization = templateId ? { to: baseTo, dynamic_template_data: variables||{} } : { to: baseTo };
    const personalizations = [ personalization ];
    const content = html ? [{ type:'text/html', value: html }] : undefined;
    const body = {
      from: { email: this.sender },
      personalizations,
      subject,
      categories: category ? [category] : undefined,
      custom_args: customArgs,
      content
    };
    if(templateId){ body.template_id = templateId; }
    return body;
  }
  _send(body){
    return new Promise((resolve,reject)=>{
      const data = Buffer.from(JSON.stringify(body));
      const req = https.request({
        hostname: 'api.sendgrid.com',
        path: '/v3/mail/send',
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'Content-Length': data.length
        }
      }, res=>{
        let buf=''; res.on('data',d=>buf+=d); res.on('end',()=>{
          const ok = res.statusCode>=200 && res.statusCode<300;
          const messageId = res.headers['x-message-id'] || undefined;
          resolve({ ok, messageId, status: res.statusCode, body: buf });
        });
      });
      req.on('error', reject);
      req.write(data); req.end();
    });
  }
}

module.exports = SendGridEmailProvider;


