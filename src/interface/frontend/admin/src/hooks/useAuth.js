import { useEffect, useState } from 'react';
import { api } from '../lib/api.js';
import { logout as doLogout } from '../lib/auth.js';

export function useAuth(){
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(()=>{ (async()=>{
    try{
      const res = await api.request('/users/me');
      if(res.status===200) setUser(res.json.user||null);
    } finally { setLoading(false); }
  })(); },[]);
  function logout(){ doLogout(); window.location.href='/admin/login'; }
  return { user, loading, logout };
}
