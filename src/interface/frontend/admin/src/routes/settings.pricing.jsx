import { useEffect, useState } from 'react';
import Card from '../components/Card.jsx';

const defaultProducts = [
  { id: 'ECPF_A1', name: 'e-CPF A1', cost: '', price: '' },
  { id: 'ECNPJ_A1', name: 'e-CNPJ A1', cost: '', price: '' }
];

export default function Pricing(){
  const [items, setItems] = useState(defaultProducts);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(()=>{ setSaved(false); }, [items]);

  function updateField(idx, field, value){
    setItems(prev => prev.map((p,i)=> i===idx? { ...p, [field]: value } : p));
  }

  async function onSubmit(e){
    e.preventDefault(); setSaving(true);
    // Por enquanto apenas mantém em memória; integração com API virá depois
    setTimeout(()=>{ setSaving(false); setSaved(true); }, 300);
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold">Configuração • Tabela de preço</h2>
      </div>
      <form onSubmit={onSubmit} className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="text-left text-slate-600">
            <tr>
              <th className="py-2 pr-4">Produto</th>
              <th className="py-2 pr-4">Preço de custo (R$)</th>
              <th className="py-2 pr-4">Preço de venda (R$)</th>
            </tr>
          </thead>
          <tbody>
            {items.map((p,idx)=> (
              <tr key={p.id} className="border-t">
                <td className="py-2 pr-4 font-medium">{p.name}</td>
                <td className="py-2 pr-4">
                  <input type="number" step="0.01" min="0" className="w-40" value={p.cost} onChange={e=>updateField(idx,'cost',e.target.value)} placeholder="0,00" />
                </td>
                <td className="py-2 pr-4">
                  <input type="number" step="0.01" min="0" className="w-40" value={p.price} onChange={e=>updateField(idx,'price',e.target.value)} placeholder="0,00" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-4 flex items-center gap-3">
          <button type="submit" className="btn-primary px-4 py-2" disabled={saving}>{saving? 'Salvando…':'Salvar'}</button>
          {saved && <span className="text-green-600 text-sm">Salvo</span>}
        </div>
      </form>
      <div className="text-slate-500 text-xs mt-3">Observação: estes valores serão utilizados no fluxo de Certificados.</div>
    </Card>
  );
}


