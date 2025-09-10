export default function Index(){
  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
      <div className="bg-white rounded-xl p-4 shadow" style={{boxShadow: 'var(--shadow-md)'}}>Agendamentos do dia</div>
      <div className="bg-white rounded-xl p-4 shadow" style={{boxShadow: 'var(--shadow-md)'}}>Próximos</div>
      <div className="bg-white rounded-xl p-4 shadow" style={{boxShadow: 'var(--shadow-md)'}}>Status</div>
    </div>
  );
}


