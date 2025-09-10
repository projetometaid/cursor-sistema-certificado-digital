import { useAuth } from '../hooks/useAuth.js';

export default function Topbar(){
  const { user, logout } = useAuth();
  return (
    <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4">
      <div className="font-medium">Painel</div>
      <div className="flex items-center gap-3 text-sm text-slate-700">
        {user && <span>{user.fullName || user.email}</span>}
        <button onClick={logout} className="px-3 py-1 rounded-md border border-slate-200 hover:bg-slate-50">Sair</button>
      </div>
    </header>
  );
}


