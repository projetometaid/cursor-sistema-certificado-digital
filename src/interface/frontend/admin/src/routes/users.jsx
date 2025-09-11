import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/Card.jsx';
import Button from '../components/Button.jsx';
import { api } from '../lib/api.js';

export default function Users(){
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  useEffect(()=>{ (async()=>{
    const res = await api.request('/users');
    if(res.status===200) setData(res.json.users||[]);
    setLoading(false);
  })(); },[]);
  return (
    <Card>
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold">Usuários</h2>
        <Button onClick={()=> navigate('/admin/settings/users/new')}>Novo usuário</Button>
      </div>
      {loading ? <div>Carregando…</div> : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-left text-slate-600">
              <tr><th className="py-2 pr-4">Nome</th><th className="py-2 pr-4">E-mail</th><th className="py-2 pr-4">Role</th><th className="py-2 pr-4">Agenda</th></tr>
            </thead>
            <tbody>
              {data.map(u => (
                <tr key={u.id} className="border-t">
                  <td className="py-2 pr-4">{u.fullName||'—'}</td>
                  <td className="py-2 pr-4">{u.email}</td>
                  <td className="py-2 pr-4">{u.role}</td>
                  <td className="py-2 pr-4">{u.schedulingEnabled? 'Ativo' : 'Desligado'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}


