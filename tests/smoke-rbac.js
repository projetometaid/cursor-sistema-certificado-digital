const http = require('http');

function req(method, path, body, token){
  return new Promise((resolve,reject)=>{
    const data = body? Buffer.from(JSON.stringify(body)) : null;
    const headers = { 'Content-Type':'application/json' };
    if(token) headers['Authorization'] = `Bearer ${token}`;
    const opts = { hostname:'localhost', port:3000, path, method, headers };
    const r = http.request(opts, res=>{ let buf=''; res.on('data',d=>buf+=d); res.on('end',()=>{ try{ resolve({ status:res.statusCode, json: JSON.parse(buf||'{}') }); }catch(e){ resolve({ status:res.statusCode, text:buf }); } }); });
    r.on('error', reject);
    if(data) r.write(data);
    r.end();
  });
}

(async()=>{
  const email = `rbac_${Date.now()}@example.com`;
  let r = await req('POST','/auth/register',{ fullName:'RBAC Test', email, password:'12345678', role:'provider' });
  if(r.status !== 201) throw new Error('register_failed');
  r = await req('POST','/auth/login',{ email, password:'12345678' });
  if(r.status !== 200) throw new Error('login_failed');
  const token = r.json.accessToken;
  const userId = r.json.user.id;
  // Access protected route
  r = await req('GET', `/users/${userId}`, null, token);
  console.log('GET profile status', r.status, r.json);
  if(r.status !== 200) throw new Error('get_profile_failed');
  // Toggle scheduling self
  r = await req('PATCH', `/users/${userId}/scheduling`, { enabled:true }, token);
  if(r.status !== 200) throw new Error('toggle_scheduling_failed');
  console.log('OK');
})().catch(e => { console.error(e); process.exit(1); });


