import { useEffect, useMemo, useState } from 'react';
import { api } from '../lib/api.js';

function fmtYMD(d){ const y=d.getFullYear(); const m=String(d.getMonth()+1).padStart(2,'0'); const day=String(d.getDate()).padStart(2,'0'); return `${y}-${m}-${day}`; }
function startOfMonth(d){ return new Date(d.getFullYear(), d.getMonth(), 1); }
function endOfMonth(d){ return new Date(d.getFullYear(), d.getMonth()+1, 0); }
function weekday(d){ return (d.getDay()+6)%7; /* 0=Mon ... 6=Sun */ }

export default function Schedule(){
  const [providerId, setProviderId] = useState('');
  const [policy, setPolicy] = useState(null);
  const [month, setMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);
  const [blockStart, setBlockStart] = useState('09:00');
  const [blockEnd, setBlockEnd] = useState('12:00');
  const [loading, setLoading] = useState(false);
  const days = useMemo(()=>{
    const start = startOfMonth(month);
    const end = endOfMonth(month);
    const arr = [];
    for(let d=new Date(start); d<=end; d.setDate(d.getDate()+1)){
      arr.push(new Date(d));
    }
    return arr;
  },[month]);

  async function loadMine(){
    const me = await api.request('/users/me');
    if(me.status===200) setProviderId(me.json.user.id);
  }

  async function loadPolicy(){
    if(!providerId) return;
    setLoading(true);
    const r = await api.request(`/schedules/${providerId}/policy`);
    setLoading(false);
    if(r.status===200){ setPolicy(r.json.policy); }
  }

  useEffect(()=>{ if(providerId) loadPolicy(); },[providerId]);

  function mergeExceptions(cur, next){
    const holidays = Array.from(new Set([...(cur?.exceptions?.holidays||[]).map(h=>h.date), ...(next.holidays||[])]));
    const blocks = [ ...(cur?.exceptions?.blocks||[]), ...(next.blocks||[]) ];
    return { holidays: holidays.map(date=>({ date })), blocks };
  }

  async function applyHoliday(day){
    if(!providerId) return;
    const next = { holidays: [fmtYMD(day)] };
    const newPolicy = { ...(policy||{ enabled:true, timezone:'America/Sao_Paulo', workingDays:[1,2,3,4,5], shifts:[] }), exceptions: mergeExceptions(policy, next) };
    const r = await api.request(`/schedules/${providerId}/policy`, { method:'PUT', body: newPolicy });
    if(r.status===200){ setPolicy(r.json.policy); }
  }

  async function applyBlock(day){
    if(!providerId) return;
    const ymd = fmtYMD(day);
    const startISO = new Date(`${ymd}T${blockStart}:00.000Z`).toISOString();
    const endISO = new Date(`${ymd}T${blockEnd}:00.000Z`).toISOString();
    const next = { blocks: [{ startISO, endISO }] };
    const newPolicy = { ...(policy||{ enabled:true, timezone:'America/Sao_Paulo', workingDays:[1,2,3,4,5], shifts:[] }), exceptions: mergeExceptions(policy, next) };
    const r = await api.request(`/schedules/${providerId}/policy`, { method:'PUT', body: newPolicy });
    if(r.status===200){ setPolicy(r.json.policy); }
  }

  function prevMonth(){ setMonth(new Date(month.getFullYear(), month.getMonth()-1, 1)); }
  function nextMonth(){ setMonth(new Date(month.getFullYear(), month.getMonth()+1, 1)); }

  return (
    <div className="bg-white rounded-xl p-4" style={{boxShadow:'var(--shadow-md)'}}>
      <h2 className="font-semibold mb-3">Agenda - Bloqueios por dia/horário</h2>
      <div className="flex gap-2 items-end mb-4">
        <div>
          <label className="block text-sm mb-1" htmlFor="provider">Provider ID</label>
          <input id="provider" className="w-56" value={providerId} onChange={e=>setProviderId(e.target.value)} placeholder="id do usuário" />
        </div>
        <button className="btn-secondary px-3 py-2" onClick={loadPolicy} disabled={!providerId || loading}>{loading? 'Carregando…':'Carregar'}</button>
        <button className="btn-secondary px-3 py-2" onClick={loadMine}>Minha agenda</button>
      </div>

      {policy && (
        <div className="mb-4 text-sm text-slate-600">Timezone: {policy.timezone} | Dias úteis: {(policy.workingDays||[]).join(', ')}</div>
      )}

      <div className="flex items-center justify-between mb-2">
        <button className="btn-secondary px-2 py-1" onClick={prevMonth}>Anterior</button>
        <div className="font-medium">{month.toLocaleDateString(undefined,{ month:'long', year:'numeric' })}</div>
        <button className="btn-secondary px-2 py-1" onClick={nextMonth}>Próximo</button>
      </div>

      <div className="grid grid-cols-7 gap-2 text-center text-sm mb-2">
        {['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'].map(d=> <div key={d} className="font-medium text-slate-600">{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-2">
        {/* offset do primeiro dia */}
        {Array.from({length: weekday(startOfMonth(month))}).map((_,i)=> <div key={'o'+i} />)}
        {days.map((d)=>{
          const ymd = fmtYMD(d);
          const isWeekend = [5,6].includes(weekday(d));
          const isHoliday = policy?.exceptions?.holidays?.some(h=>h.date===ymd);
          return (
            <button key={ymd} className={`border rounded p-2 min-h-20 text-left ${isWeekend?'bg-slate-50':''} ${isHoliday?'bg-red-50 border-red-200':''}`} onClick={()=> setSelectedDay(d)}>
              <div className="text-xs text-slate-500">{d.getDate()}</div>
              {isHoliday && <div className="text-[10px] mt-1 text-red-600">Bloqueio dia inteiro</div>}
            </button>
          );
        })}
      </div>

      {selectedDay && (
        <div className="mt-4 p-3 border rounded bg-slate-50">
          <div className="flex items-center justify-between">
            <div className="font-medium">Configurar {selectedDay.toLocaleDateString()}</div>
            <button className="text-sm" onClick={()=> setSelectedDay(null)}>Fechar</button>
          </div>
          <div className="mt-2 flex flex-wrap gap-3 items-end">
            <button className="btn-secondary px-3 py-2" onClick={()=> applyHoliday(selectedDay)}>Bloquear dia inteiro</button>
            <div>
              <label className="block text-sm mb-1" htmlFor="blockStart">Início</label>
              <input id="blockStart" type="time" value={blockStart} onChange={e=>setBlockStart(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm mb-1" htmlFor="blockEnd">Fim</label>
              <input id="blockEnd" type="time" value={blockEnd} onChange={e=>setBlockEnd(e.target.value)} />
            </div>
            <button className="btn-primary px-4 py-2" onClick={()=> applyBlock(selectedDay)}>Bloquear período</button>
            <button className="btn-secondary px-3 py-2" onClick={()=>{ setBlockStart('08:00'); setBlockEnd('12:00'); }}>Período da manhã</button>
            <button className="btn-secondary px-3 py-2" onClick={()=>{ setBlockStart('13:00'); setBlockEnd('18:00'); }}>Período da tarde</button>
          </div>
        </div>
      )}
    </div>
  );
}


