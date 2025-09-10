const baseURL = import.meta.env.VITE_API_BASE_URL || '';

export async function login(email, password){
  const res = await fetch(`${baseURL}/auth/login`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email, password }) });
  const json = await res.json();
  if(res.ok && json?.accessToken){
    sessionStorage.setItem('accessToken', json.accessToken);
    if(json?.refreshToken) sessionStorage.setItem('refreshToken', json.refreshToken);
    return { ok:true };
  }
  return { ok:false, error: json?.errors?.[0] || 'login_failed' };
}

export function logout(){ sessionStorage.removeItem('accessToken'); sessionStorage.removeItem('refreshToken'); }


