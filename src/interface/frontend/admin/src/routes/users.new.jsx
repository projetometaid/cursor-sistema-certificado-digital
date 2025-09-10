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
  // Campos de política de agenda
  const [workingDays, setWorkingDays] = useState([1,2,3,4,5]); // seg-sex
  const [shiftStart, setShiftStart] = useState('09:00');
  const [shiftEnd, setShiftEnd] = useState('18:00');
  const [lunchStart, setLunchStart] = useState('12:00');
  const [lunchEnd, setLunchEnd] = useState('13:00');
  const [slotDurationMinutes, setSlotDurationMinutes] = useState(30);
  const [gapBetweenSlotsMinutes, setGapBetweenSlotsMinutes] = useState(0);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [previewSlots, setPreviewSlots] = useState([]);

  async function previewAvailability(userId){
    const now = new Date();
    const from = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const to = new Date(now.getFullYear(), now.getMonth(), now.getDate()+7).toISOString();
    const r = await api.request(`/schedules/${userId}/availability?fromISO=${encodeURIComponent(from)}&toISO=${encodeURIComponent(to)}`);
    if(r.status===200) setPreviewSlots(r.json?.slots||[]);
  }

  async function onSubmit(e){
    e.preventDefault(); setError(''); setSaving(true);
    const body = { fullName, email, password, role, schedulingEnabled, timezone };
    const res = await api.request('/users', { method:'POST', body });
    if(res.status===201 && res.json?.ok){
      try{
        const userId = res.json?.user?.id;
        if(schedulingEnabled && userId){
          await api.request(`/schedules/${userId}/enabled`, { method:'PUT', body: { enabled: true } });
          // monta shifts considerando intervalo de almoço (se válido)
          const toMin = (t)=>{ const [h,m] = String(t).split(':').map(Number); return h*60+m; };
          const hasLunch = lunchStart && lunchEnd && toMin(lunchStart) < toMin(lunchEnd) && toMin(shiftStart) < toMin(lunchStart) && toMin(lunchEnd) < toMin(shiftEnd);
          const shifts = hasLunch
            ? [{ start: shiftStart, end: lunchStart }, { start: lunchEnd, end: shiftEnd }]
            : [{ start: shiftStart, end: shiftEnd }];

          const policy = {
            enabled: true,
            timezone,
            workingDays,
            shifts,
            slotDurationMinutes: Number(slotDurationMinutes),
            gapBetweenSlotsMinutes: Number(gapBetweenSlotsMinutes)||0
          };
          await api.request(`/schedules/${userId}/policy`, { method:'PUT', body: policy });
          await previewAvailability(userId);
        }
        setSaving(false);
        navigate('/admin/users');
        return;
      } catch(err){
        setSaving(false);
        setError('Usuário criado, mas falhou configurar a agenda');
        return;
      }
    }
    setSaving(false);
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
        {schedulingEnabled && (
          <div className="border rounded-lg p-3 mt-1 bg-slate-50">
            <div className="mb-2 font-medium">Configuração da agenda</div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="block text-sm mb-1" htmlFor="timezone">Fuso horário</label>
                <input id="timezone" className="w-full" value={timezone} onChange={e=>setTimezone(e.target.value)} />
              </div>
              <div className="md:col-span-2">
                <div className="text-sm mb-1">Dias de trabalho</div>
                <div className="flex flex-wrap gap-3 text-sm">
                  {[
                    {v:0,l:'Dom'}, {v:1,l:'Seg'}, {v:2,l:'Ter'}, {v:3,l:'Qua'}, {v:4,l:'Qui'}, {v:5,l:'Sex'}, {v:6,l:'Sáb'}
                  ].map(d=> (
                    <label key={d.v} className="inline-flex items-center gap-1">
                      <input type="checkbox" checked={workingDays.includes(d.v)} onChange={(e)=>{
                        if(e.target.checked) setWorkingDays(prev=> Array.from(new Set([...prev,d.v])));
                        else setWorkingDays(prev=> prev.filter(x=>x!==d.v));
                      }} />
                      <span>{d.l}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm mb-1" htmlFor="shiftStart">Início do expediente</label>
                <input id="shiftStart" type="time" className="w-full" value={shiftStart} onChange={e=>setShiftStart(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm mb-1" htmlFor="shiftEnd">Fim do expediente</label>
                <input id="shiftEnd" type="time" className="w-full" value={shiftEnd} onChange={e=>setShiftEnd(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm mb-1" htmlFor="lunchStart">Início do almoço</label>
                <input id="lunchStart" type="time" className="w-full" value={lunchStart} onChange={e=>setLunchStart(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm mb-1" htmlFor="lunchEnd">Fim do almoço</label>
                <input id="lunchEnd" type="time" className="w-full" value={lunchEnd} onChange={e=>setLunchEnd(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm mb-1" htmlFor="slotDurationMinutes">Duração do slot (min)</label>
                <input id="slotDurationMinutes" type="number" min="5" step="5" className="w-full" value={slotDurationMinutes} onChange={e=>setSlotDurationMinutes(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm mb-1" htmlFor="gapBetweenSlotsMinutes">Intervalo entre slots (min)</label>
                <input id="gapBetweenSlotsMinutes" type="number" min="0" step="5" className="w-full" value={gapBetweenSlotsMinutes} onChange={e=>setGapBetweenSlotsMinutes(e.target.value)} />
              </div>
            </div>
          </div>
        )}
        <div className="flex gap-2 mt-2">
          <button type="button" className="btn-secondary px-4 py-2" onClick={()=>navigate('/admin/users')}>Cancelar</button>
          <button type="submit" className="btn-primary px-4 py-2" disabled={saving}>{saving? 'Salvando…' : 'Salvar'}</button>
        </div>
      </form>
      {previewSlots.length>0 && (
        <div className="mt-4 text-sm">
          <div className="font-medium mb-1">Prévia (próximos 7 dias)</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {previewSlots.slice(0,8).map((s,idx)=> (
              <div key={idx} className="p-2 rounded border bg-white">
                <div><b>Início:</b> {new Date(s.startISO).toLocaleString()}</div>
                <div><b>Fim:</b> {new Date(s.endISO).toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}


