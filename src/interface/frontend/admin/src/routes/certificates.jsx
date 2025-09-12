import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/Card.jsx';
import Button from '../components/Button.jsx';
import { api } from '../lib/api.js';

export default function Certificates(){
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load(){
    const res = await api.request('/certificates');
    if(res.status===200) setItems(res.json.items||[]);
    setLoading(false);
  }
  useEffect(()=>{ load(); },[]);

  async function onDelete(id){
    if(!confirm('Excluir este cadastro?')) return;
    const res = await api.request(`/certificates/${id}`, { method:'DELETE' });
    if(res.status===200) load();
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold">Certificados</h2>
        <Button onClick={()=> navigate('/admin/certificates/new')}>Novo certificado</Button>
      </div>
      {loading? <div>Carregando…</div> : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-left text-slate-600">
              <tr>
                <th className="py-2 pr-4">ID</th>
                <th className="py-2 pr-4">Produto</th>
                <th className="py-2 pr-4">Protocolo</th>
                <th className="py-2 pr-4">Ações</th>
              </tr>
            </thead>
            <tbody>
              {items.map(it => (
                <tr key={it.id} className="border-t">
                  <td className="py-2 pr-4">{it.id}</td>
                  <td className="py-2 pr-4">{it.product||'—'}</td>
                  <td className="py-2 pr-4">{it.protocolo||'—'}</td>
                  <td className="py-2 pr-4">
                    <button className="text-red-600" onClick={()=> onDelete(it.id)}>Excluir</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}


