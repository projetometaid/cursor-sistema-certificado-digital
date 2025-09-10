import { useNavigate } from 'react-router-dom';
import Card from '../components/Card.jsx';
import Button from '../components/Button.jsx';

export default function Certificates(){
  const navigate = useNavigate();
  return (
    <Card>
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold">Certificados</h2>
        <Button onClick={()=> navigate('/admin/certificates/new')}>Novo certificado</Button>
      </div>
      <div className="text-slate-600 text-sm">Lista de pedidos e protocolos (em breve)</div>
    </Card>
  );
}


