import { useEffect, useState } from 'react';

export function useSidebar(){
  const [collapsed, setCollapsed] = useState(false);
  useEffect(()=>{ setCollapsed(localStorage.getItem('sidebar:collapsed')==='1'); },[]);
  function toggle(){ setCollapsed(v=>{ const next = !v; localStorage.setItem('sidebar:collapsed', next?'1':'0'); return next; }); }
  return { collapsed, toggle };
}


