import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/Card.jsx';
import { api } from '../lib/api.js';

export default function UserNew(){
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('provider');
  const [schedulingEnabled, setSchedulingEnabled] = useState(false);
  const [timezone, setTimezone] = useState('America/Sao_Paulo');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function onSubmit(e){
    e.preventDefault(); setError(''); setSaving(true);
    const body = { fullName, email, password, role, schedulingEnabled, timezone };
    const res = await api.request('/users', { method:'POST', body });
    setSaving(false);
    if(res.status===201 && res.json?.ok){ navigate('/admin/users'); return; }
    setError(res.json?.error||'Falha ao salvar');
  }

  return (
    <Card>
      <h2 className="font-semibold mb-3">Novo usuário</h2>
      {error && <div className="text-red-600 text-sm mb-2" role="alert">{error}</div>}
      <form onSubmit={onSubmit} className="grid gap-3 max-w-xl">
        <div>
          <label className="block text-sm mb-1" htmlFor="fullName">Nome completo</label>
          <input id="fullName" className="w-full" value={fullName} onChange={e=>setFullName(e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm mb-1" htmlFor="email">E-mail</label>
          <input id="email" type="email" className="w-full" value={email} onChange={e=>setEmail(e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm mb-1" htmlFor="password">Senha</label>
          <input id="password" type="password" className="w-full" value={password} onChange={e=>setPassword(e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm mb-1" htmlFor="role">Papel</label>
          <select id="role" className="w-full" value={role} onChange={e=>setRole(e.target.value)}>
            <option value="provider">Provider</option>
            <option value="admin">Admin</option>
            <option value="viewer">Viewer</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <input id="schedulingEnabled" type="checkbox" checked={schedulingEnabled} onChange={e=>setSchedulingEnabled(e.target.checked)} />
          <label htmlFor="schedulingEnabled">Habilitar agenda</label>
        </div>
        <div>
          <label className="block text-sm mb-1" htmlFor="timezone">Fuso horário</label>
          <input id="timezone" className="w-full" value={timezone} onChange={e=>setTimezone(e.target.value)} />
        </div>
        <div className="flex gap-2 mt-2">
          <button type="button" className="btn-secondary px-4 py-2" onClick={()=>navigate('/admin/users')}>Cancelar</button>
          <button type="submit" className="btn-primary px-4 py-2" disabled={saving}>{saving? 'Salvando…' : 'Salvar'}</button>
        </div>
      </form>
    </Card>
  );
}


