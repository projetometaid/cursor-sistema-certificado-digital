import { useNavigate } from 'react-router-dom';
import Card from '../components/Card.jsx';

export default function CertificateNew(){
  const navigate = useNavigate();
  return (
    <Card>
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold">Novo certificado</h2>
      </div>
      <div className="text-slate-600 text-sm mb-4">Formulário para criar pedido e associar pagamento e agendamento (em breve)</div>
      <div className="flex gap-2">
        <button className="btn-secondary px-4 py-2" onClick={()=> navigate('/admin/certificates')}>Voltar</button>
      </div>
    </Card>
  );
}


