import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login(){
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  async function onSubmit(e){
    e.preventDefault(); setError('');
    try{
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL||''}/auth/login`,{ method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email, password })});
      const json = await res.json();
      if(!res.ok || !json?.accessToken){ setError('Credenciais inválidas'); return; }
      sessionStorage.setItem('accessToken', json.accessToken);
      if(json.refreshToken) sessionStorage.setItem('refreshToken', json.refreshToken);
      navigate('/admin');
    }catch(err){ setError('Falha ao conectar'); }
  }
  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <form onSubmit={onSubmit} className="bg-white p-6 rounded-xl w-full max-w-sm" style={{boxShadow:'var(--shadow-md)'}}>
        <h1 className="text-xl font-semibold mb-4">Entrar</h1>
        {error && <div role="alert" className="text-red-600 text-sm mb-2">{error}</div>}
        <label className="block text-sm mb-1" htmlFor="email">E-mail</label>
        <input id="email" type="email" className="w-full mb-3" value={email} onChange={e=>setEmail(e.target.value)} required />
        <label className="block text-sm mb-1" htmlFor="password">Senha</label>
        <input id="password" type="password" className="w-full mb-4" value={password} onChange={e=>setPassword(e.target.value)} required />
        <button className="btn-primary px-4 py-2 w-full" type="submit">Entrar</button>
      </form>
    </div>
  );
}


