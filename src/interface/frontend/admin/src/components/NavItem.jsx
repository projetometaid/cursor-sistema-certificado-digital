import { NavLink } from 'react-router-dom';

export default function NavItem({ to, icon, label, collapsed }){
  return (
    <NavLink to={to} className={({isActive})=>`flex items-center gap-3 px-3 py-2 rounded-md ${isActive? 'bg-blue-50 text-blue-600' : 'hover:bg-slate-50'}`} aria-label={collapsed? label: undefined}>
      <span className="shrink-0" aria-hidden>{icon}</span>
      {!collapsed && <span>{label}</span>}
    </NavLink>
  );
}


