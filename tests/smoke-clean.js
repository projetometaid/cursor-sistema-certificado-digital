const http = require('http');

function req(method, path, body){
  return new Promise((resolve,reject)=>{
    const data = body? Buffer.from(JSON.stringify(body)) : null;
    const opts = { hostname:'localhost', port:3000, path, method, headers:{ 'Content-Type':'application/json' } };
    const r = http.request(opts, res=>{ let buf=''; res.on('data',d=>buf+=d); res.on('end',()=>{ try{ resolve({ status:res.statusCode, json: JSON.parse(buf||'{}') }); }catch(e){ resolve({ status:res.statusCode, text:buf }); } }); });
    r.on('error', reject);
    if(data) r.write(data);
    r.end();
  });
}

(async()=>{
  const results = [];
  results.push({ step:'health', ...(await req('GET','/health')) });
  const email = `smoke_${Date.now()}@example.com`;
  results.push({ step:'register', ...(await req('POST','/auth/register',{ name:'Smoke', email, password:'123456' })) });
  const login = await req('POST','/auth/login',{ email, password:'123456' });
  results.push({ step:'login', ...login });
  results.push({ step:'createOrder', ...(await req('POST','/orders',{ type:'eCPF', customer:{ email:'cliente-smoke@example.com', cpf:'12345678901' }, documents:{} })) });
  const ref = results.at(-1).json?.payment?.reference || results.at(-1).json?.order?.id;
  results.push({ step:'webhook', ...(await req('POST','/webhooks/safe2pay',{ Reference: ref, Status: 'Paid' })) });
  console.log(JSON.stringify({ ok:true, results }, null, 2));
})();
