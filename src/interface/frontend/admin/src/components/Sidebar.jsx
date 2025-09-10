import { useSidebar } from '../hooks/useSidebar.js';
import { Home, Users, Calendar, Clock, LogOut, ChevronLeft, ChevronRight, Shield } from 'lucide-react';
import NavItem from './NavItem.jsx';

export default function Sidebar(){
  const { collapsed, toggle } = useSidebar();
  return (
    <aside className={`bg-white border-r border-slate-200 ${collapsed? 'w-16' : 'w-64'} transition-all`} aria-label="Barra lateral">
      <div className="h-14 flex items-center justify-between px-3">
        <div className="font-semibold">{collapsed? 'A' : 'Admin'}</div>
        <button aria-label="Alternar sidebar" aria-expanded={!collapsed} onClick={toggle} className="p-1 rounded hover:bg-slate-100">
          {collapsed? <ChevronRight size={18}/> : <ChevronLeft size={18}/>}
        </button>
      </div>
      <nav className="p-2">
        <NavItem to="/admin" icon={<Home size={18}/>} label="Dashboard" collapsed={collapsed} />
        <NavItem to="/admin/certificates" icon={<Shield size={18}/>} label="Certificados" collapsed={collapsed} />
        <NavItem to="/admin/users" icon={<Users size={18}/>} label="Usuários" collapsed={collapsed} />
        <NavItem to="/admin/schedule" icon={<Calendar size={18}/>} label="Agenda" collapsed={collapsed} />
        <NavItem to="/admin/appointments" icon={<Clock size={18}/>} label="Agendamentos" collapsed={collapsed} />
        <NavItem to="/admin/login" icon={<LogOut size={18}/>} label="Sair" collapsed={collapsed} />
      </nav>
    </aside>
  );
}


