import { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Index from './routes/index.jsx';
import Login from './routes/login.jsx';
import Users from './routes/users.jsx';
import UserNew from './routes/users.new.jsx';
import Certificates from './routes/certificates.jsx';
import CertificateNew from './routes/certificates.new.jsx';
import Pricing from './routes/settings.pricing.jsx';
import Schedule from './routes/schedule.jsx';
import Appointments from './routes/appointments.jsx';
import Sidebar from './components/Sidebar.jsx';
import Topbar from './components/Topbar.jsx';

function Protected({ children }){
  const navigate = useNavigate();
  useEffect(()=>{
    const token = sessionStorage.getItem('accessToken');
    if(!token) navigate('/admin/login');
  }, [navigate]);
  return children;
}

export default function App(){
  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <main className="p-4">
          <Routes>
            <Route path="login" element={<Login />} />
            <Route path="" element={<Protected><Index /></Protected>} />
            <Route path="settings/users" element={<Protected><Users /></Protected>} />
            <Route path="settings/users/new" element={<Protected><UserNew /></Protected>} />
            <Route path="certificates" element={<Protected><Certificates /></Protected>} />
            <Route path="certificates/new" element={<Protected><CertificateNew /></Protected>} />
            <Route path="settings/pricing" element={<Protected><Pricing /></Protected>} />
            <Route path="settings/schedule" element={<Protected><Schedule /></Protected>} />
            <Route path="appointments" element={<Protected><Appointments /></Protected>} />
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}


