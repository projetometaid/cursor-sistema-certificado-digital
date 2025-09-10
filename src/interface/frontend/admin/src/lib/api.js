const baseURL = import.meta.env.VITE_API_BASE_URL || '';

async function request(path, { method='GET', headers={}, body } = {}){
  const token = sessionStorage.getItem('accessToken');
  const res = await fetch(`${baseURL}${path}`, { method, headers: { 'Content-Type':'application/json', ...(token? { Authorization:`Bearer ${token}` } : {}), ...headers }, body: body? JSON.stringify(body): undefined });
  if(res.status === 401){
    const refreshed = await refreshToken();
    if(refreshed){
      const token2 = sessionStorage.getItem('accessToken');
      const res2 = await fetch(`${baseURL}${path}`, { method, headers: { 'Content-Type':'application/json', ...(token2? { Authorization:`Bearer ${token2}` } : {}), ...headers }, body: body? JSON.stringify(body): undefined });
      return parse(res2);
    }
  }
  return parse(res);
}

async function parse(res){
  const txt = await res.text();
  try{ return { status: res.status, json: JSON.parse(txt||'{}') }; } catch{ return { status: res.status, text: txt }; }
}

async function refreshToken(){
  const refresh = sessionStorage.getItem('refreshToken');
  if(!refresh) return false;
  try{
    const res = await fetch(`${baseURL}/auth/refresh`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ refreshToken: refresh }) });
    const json = await res.json();
    if(res.ok && json?.accessToken){ sessionStorage.setItem('accessToken', json.accessToken); return true; }
  }catch(_){ }
  sessionStorage.removeItem('accessToken'); sessionStorage.removeItem('refreshToken');
  return false;
}

export const api = { request };
