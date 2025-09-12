import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/Card.jsx';
import { api } from '../lib/api.js';

export default function CertificateNew(){
  const navigate = useNavigate();
  const [product, setProduct] = useState('ECPF_A1'); // ECPF_A1 | ECNPJ_A1
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [statusMsg, setStatusMsg] = useState('');

  // Campos comuns / e-CPF
  const [cpf, setCpf] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [cep, setCep] = useState('');
  const [logradouro, setLogradouro] = useState('');
  const [complemento, setComplemento] = useState('');
  const [numero, setNumero] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [pis, setPis] = useState('');
  const [cei, setCei] = useState('');
  const [caepf, setCaepf] = useState('');
  const [nomeAuto, setNomeAuto] = useState('');
  const [biometriaOk, setBiometriaOk] = useState(null); // true | false | null
  const [cnh, setCnh] = useState('');

  // Campos e-CNPJ específicos
  const [cnpj, setCnpj] = useState('');
  const [cpfResponsavel, setCpfResponsavel] = useState('');
  const [cepPessoa, setCepPessoa] = useState('');
  const [logradouroPessoa, setLogradouroPessoa] = useState('');
  const [complementoPessoa, setComplementoPessoa] = useState('');
  const [numeroPessoa, setNumeroPessoa] = useState('');
  const [bairroPessoa, setBairroPessoa] = useState('');
  const [cidadePessoa, setCidadePessoa] = useState('');
  const [estadoPessoa, setEstadoPessoa] = useState('');
  const [pisJ, setPisJ] = useState('');
  const [ceiJ, setCeiJ] = useState('');
  const [biometriaOkJ, setBiometriaOkJ] = useState(null);
  const [nomeRespAuto, setNomeRespAuto] = useState('');
  const [razaoAuto, setRazaoAuto] = useState('');
  // Endereço empresa (separado do endereço da pessoa)
  const [cepEmpresa, setCepEmpresa] = useState('');
  const [logradouroEmpresa, setLogradouroEmpresa] = useState('');
  const [complementoEmpresa, setComplementoEmpresa] = useState('');
  const [numeroEmpresa, setNumeroEmpresa] = useState('');
  const [bairroEmpresa, setBairroEmpresa] = useState('');
  const [cidadeEmpresa, setCidadeEmpresa] = useState('');
  const [estadoEmpresa, setEstadoEmpresa] = useState('');
  const [repLegalOk, setRepLegalOk] = useState(null);

  // Mask helpers
  const onlyDigits = (v='') => String(v).replace(/\D+/g,'');
  const maskCPF = (v='') => {
    const d = onlyDigits(v).slice(0,11);
    return d.replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  };
  const maskDate = (v='') => {
    const d = onlyDigits(v).slice(0,8);
    if(d.length<=2) return d;
    if(d.length<=4) return d.replace(/(\d{2})(\d{1,2})/, '$1/$2');
    return d.replace(/(\d{2})(\d{2})(\d{1,4})/, '$1/$2/$3');
  };
  const maskCEP = (v='') => {
    const d = onlyDigits(v).slice(0,8);
    if(d.length<=2) return d;
    if(d.length<=5) return d.replace(/(\d{2})(\d{1,3})/, '$1.$2');
    return d.replace(/(\d{2})(\d{3})(\d{1,3})/, '$1.$2-$3');
  };
  const maskUF = (v='') => String(v).toUpperCase().slice(0,2);
  const maskPhone = (v='') => {
    const d = onlyDigits(v).slice(0,11);
    if(d.length<=10) return d.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3').trim();
    return d.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3').trim();
  };
  const maskPIS = (v='') => {
    const d = onlyDigits(v).slice(0,11);
    return d.replace(/(\d{3})(\d{5})(\d{2})(\d{0,1})/, '$1.$2.$3.$4');
  };
  const maskCEI = (v='') => {
    const d = onlyDigits(v).slice(0,12);
    return d.replace(/(\d{2})(\d{3})(\d{5})(\d{2})/, '$1.$2.$3/$4');
  };
  const maskCAEPF = (v='') => {
    const d = onlyDigits(v).slice(0,14);
    return d.replace(/(\d{3})(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3/$4-$5');
  };
  const maskCNPJ = (v='') => {
    const d = onlyDigits(v).slice(0,14);
    return d.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  };
  const maskCNH = (v='') => onlyDigits(v).slice(0,11);
  const toISODate = (ddmmyyyy='') => {
    const d = onlyDigits(ddmmyyyy);
    if(d.length!==8) return null;
    const dd=d.slice(0,2), mm=d.slice(2,4), yy=d.slice(4);
    return `${yy}-${mm}-${dd}`;
  };
  const cepDigits = (masked='') => onlyDigits(masked);

  // Helpers CEP
  async function fetchViaCep(d){
    try{ const r = await fetch(`${import.meta.env.VITE_API_BASE_URL||''}/integrations/viacep/${d}`); const j = await r.json(); return j && !j.error ? j : null; }catch{ return null; }
  }
  async function handleCepBlur(){
    if(product!=='ECPF_A1') return; const d = cepDigits(cep); if(d.length!==8) return; const j = await fetchViaCep(d); if(j){ setLogradouro(j.logradouro||''); setBairro(j.bairro||''); setCidade(j.localidade||''); setEstado(j.uf||''); }
  }
  async function handleCepPessoaBlur(){
    if(product!=='ECNPJ_A1') return; const d = cepDigits(cepPessoa); if(d.length!==8) return; const j = await fetchViaCep(d); if(j){ setLogradouroPessoa(j.logradouro||''); setBairroPessoa(j.bairro||''); setCidadePessoa(j.localidade||''); setEstadoPessoa(j.uf||''); }
  }

  // Explicit handlers (executed on blur)
  async function handleCpfBlur(){
    if(product!=='ECPF_A1') return;
    const d = onlyDigits(cpf);
    if(d.length!==11) return;
    try{
      // biometria
      const rb = await fetch(`${import.meta.env.VITE_API_BASE_URL||''}/integrations/biometria`,{ method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({ cpf: d }) });
      const jb = await rb.json();
      setBiometriaOk(!!jb?.temBiometria);
      setStatusMsg(jb?.temBiometria? 'Biometria válida (videoconferência habilitada)':'Não existe biometria cadastrada');
      // assertiva
      const ra = await fetch(`${import.meta.env.VITE_API_BASE_URL||''}/integrations/assertiva/cpf`,{ method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({ cpf: d }) });
      const ja = await ra.json();
      if(ja?.dataNascimento){ const [y,m,dd] = String(ja.dataNascimento).split('-'); setDataNascimento(`${dd}/${m}/${y}`); }
      // safeweb consulta prévia cpf
      const iso = toISODate(ja?.dataNascimento? `${ja.dataNascimento.slice(8,10)}/${ja.dataNascimento.slice(5,7)}/${ja.dataNascimento.slice(0,4)}` : dataNascimento);
      if(iso){
        const rs = await fetch(`${import.meta.env.VITE_API_BASE_URL||''}/integrations/safeweb/consulta-previa-cpf`,{ method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({ cpf: d, dataNascimento: iso }) });
        const js = await rs.json();
        if(js?.Mensagem) setNomeAuto(js.Mensagem);
      }
    }catch(_){ /* ignore */ }
  }

  async function handleCpfRespBlur(){
    if(product!=='ECNPJ_A1') return;
    const d = onlyDigits(cpfResponsavel);
    if(d.length!==11) return;
    try{
      const rb = await fetch(`${import.meta.env.VITE_API_BASE_URL||''}/integrations/biometria`,{ method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({ cpf: d }) });
      const jb = await rb.json(); setBiometriaOkJ(!!jb?.temBiometria);
      const ra = await fetch(`${import.meta.env.VITE_API_BASE_URL||''}/integrations/assertiva/cpf`,{ method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({ cpf: d }) });
      const ja = await ra.json();
      if(ja?.dataNascimento){ const [y,m,dd] = String(ja.dataNascimento).split('-'); setDataNascimento(`${dd}/${m}/${y}`); }
      if(ja?.nome){ setNomeRespAuto(ja.nome); }
      // Safeweb consulta prévia CPF (preenche nome oficial quando a data estiver disponível)
      const iso = toISODate(ja?.dataNascimento? `${ja.dataNascimento.slice(8,10)}/${ja.dataNascimento.slice(5,7)}/${ja.dataNascimento.slice(0,4)}` : dataNascimento);
      if(iso){
        const rs = await fetch(`${import.meta.env.VITE_API_BASE_URL||''}/integrations/safeweb/consulta-previa-cpf`,{ method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({ cpf: d, dataNascimento: iso }) });
        const js = await rs.json(); if(js?.nome || js?.Mensagem) setNomeRespAuto(js.nome || js.Mensagem);
      }
    }catch(_){ /* ignore */ }
  }

  async function handleCnpjBlur(){
    if(product!=='ECNPJ_A1') return;
    const dcnpj = onlyDigits(cnpj);
    const dcpf = onlyDigits(cpfResponsavel);
    const iso = toISODate(dataNascimento);
    if(dcnpj.length!==14 || dcpf.length!==11 || !iso) return;
    try{
      const s = await fetch(`${import.meta.env.VITE_API_BASE_URL||''}/integrations/safeweb/consulta-previa-cnpj`,{ method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({ cnpj: dcnpj, cpfResponsavel: dcpf, dataNascimento: iso }) });
      const sj = await s.json();
      setRepLegalOk(!!(sj?.representanteLegal || sj?.codigo===0));
      if(sj?.razaoSocial || sj?.RazaoSocial){ setRazaoAuto(sj.razaoSocial || sj.RazaoSocial); }
      const br = await fetch(`${import.meta.env.VITE_API_BASE_URL||''}/integrations/externos/cnpj/${dcnpj}`);
      const bj = await br.json();
      if(bj && !bj.error){
        const cepEmp = (bj?.cep||'').replace(/\D+/g,'');
        setCepEmpresa(cepEmp ? cepEmp.replace(/(\d{2})(\d{3})(\d{1,3})/, '$1.$2-$3') : '');
        setLogradouroEmpresa(bj?.logradouro||'');
        setNumeroEmpresa(bj?.numero||'');
        setBairroEmpresa(bj?.bairro||'');
        setCidadeEmpresa(bj?.municipio||'');
        setEstadoEmpresa(bj?.uf||'');
      }
    }catch(_){ /* ignore */ }
  }

  // Consulta prévia ao sair da data: e-CPF (preenche nomeAuto)
  async function handleDobBlurECpf(){
    if(product!=='ECPF_A1') return; const d = onlyDigits(cpf); const iso = toISODate(dataNascimento); if(d.length!==11 || !iso) return;
    try{ const rs = await fetch(`${import.meta.env.VITE_API_BASE_URL||''}/integrations/safeweb/consulta-previa-cpf`,{ method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({ cpf: d, dataNascimento: iso }) }); const js = await rs.json(); if(js?.nome || js?.Mensagem) setNomeAuto(js.nome || js.Mensagem); }catch(_){ }
  }
  // Consulta prévia ao sair da data: e-CNPJ (nome do responsável)
  async function handleDobBlurECnpj(){
    if(product!=='ECNPJ_A1') return; const d = onlyDigits(cpfResponsavel); const iso = toISODate(dataNascimento); if(d.length!==11 || !iso) return;
    try{ const rs = await fetch(`${import.meta.env.VITE_API_BASE_URL||''}/integrations/safeweb/consulta-previa-cpf`,{ method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({ cpf: d, dataNascimento: iso }) }); const js = await rs.json(); if(js?.nome || js?.Mensagem) setNomeRespAuto(js.nome || js.Mensagem); }catch(_){ }
  }

  // e-CNPJ: quando a Data de Nascimento mudar (manual ou via Assertiva), roda consulta prévia para preencher Nome do responsável
  useEffect(()=>{ (async()=>{
    if(product!=='ECNPJ_A1') return;
    const d = onlyDigits(cpfResponsavel);
    const iso = toISODate(dataNascimento);
    if(d.length!==11 || !iso) return;
    try{
      const rs = await fetch(`${import.meta.env.VITE_API_BASE_URL||''}/integrations/safeweb/consulta-previa-cpf`,{ method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({ cpf: d, dataNascimento: iso }) });
      const js = await rs.json();
      if(js?.nome || js?.Mensagem) setNomeRespAuto(js.nome || js.Mensagem);
    }catch(_){ /* ignore */ }
  })(); },[product, cpfResponsavel, dataNascimento]);

  // e-CPF: trigger biometria on cpf input
  useEffect(()=>{ (async()=>{
    if(product!=='ECPF_A1') return;
    setBiometriaOk(null);
    const d = onlyDigits(cpf);
    if(d.length!==11) return;
    try{
      const res = await fetch('http://127.0.0.1:3003/api/validar-biometria',{ method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({ cpf: d }) });
      const j = await res.json();
      setBiometriaOk(!!j?.temBiometria);
      setStatusMsg(j?.temBiometria? 'Biometria válida (videoconferência habilitada)':'Não existe biometria cadastrada');
    }catch(_){ setBiometriaOk(null); }
  })(); },[product, cpf]);

  // e-CPF: after CPF, fetch DOB from Assertiva and validate CPF on Safeweb
  useEffect(()=>{ (async()=>{
    if(product!=='ECPF_A1') return;
    const d = onlyDigits(cpf);
    if(d.length!==11) return;
    try{
      // Assertiva → data de nascimento
      const a = await fetch('http://127.0.0.1:3001/api/cpf',{ method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({ cpf: d }) });
      const aj = await a.json();
      if(aj?.dataNascimento){
        const [y,m,dd] = String(aj.dataNascimento).split('-');
        setDataNascimento(`${dd}/${m}/${y}`);
      }
      // Safeweb consulta prévia CPF
      const iso = toISODate(dataNascimento || `${aj?.dataNascimento?.slice(8,10)}/${aj?.dataNascimento?.slice(5,7)}/${aj?.dataNascimento?.slice(0,4)}`);
      if(iso){
        const s = await fetch('http://127.0.0.1:3003/api/consulta-previa-cpf',{ method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({ cpf: d, dataNascimento: iso }) });
        const sj = await s.json();
        if(sj?.Mensagem){ setNomeAuto(sj.Mensagem); }
      }
    }catch(_){ /* ignore */ }
  })(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ },[product, cpf]);

  // e-CPF: quando a Data de Nascimento estiver preenchida, roda consulta prévia para preencher Nome
  useEffect(()=>{ (async()=>{
    if(product!=='ECPF_A1') return;
    const d = onlyDigits(cpf);
    const iso = toISODate(dataNascimento);
    if(d.length!==11 || !iso) return;
    try{
      const rs = await fetch(`${import.meta.env.VITE_API_BASE_URL||''}/integrations/safeweb/consulta-previa-cpf`,{ method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({ cpf: d, dataNascimento: iso }) });
      const js = await rs.json();
      if(js?.nome || js?.Mensagem) setNomeAuto(js.nome || js.Mensagem);
    }catch(_){ /* ignore */ }
  })(); },[product, cpf, dataNascimento]);

  // e-CPF: CEP auto-preenche endereço via ViaCEP
  useEffect(()=>{ (async()=>{
    if(product!=='ECPF_A1') return;
    const d = cepDigits(cep);
    if(d.length!==8) return;
    try{
      const r = await fetch(`https://viacep.com.br/ws/${d}/json/`);
      const j = await r.json();
      if(!j?.erro){ setLogradouro(j.logradouro||''); setBairro(j.bairro||''); setCidade(j.localidade||''); setEstado(j.uf||''); }
    }catch(_){ }
  })(); },[product, cep]);

  // e-CNPJ: CEP do responsável auto-preenche endereço via ViaCEP
  useEffect(()=>{ (async()=>{
    if(product!=='ECNPJ_A1') return;
    const d = cepDigits(cepPessoa);
    if(d.length!==8) return;
    try{
      const r = await fetch(`https://viacep.com.br/ws/${d}/json/`);
      const j = await r.json();
      if(!j?.erro){
        setLogradouroPessoa(j.logradouro||'');
        setBairroPessoa(j.bairro||'');
        setCidadePessoa(j.localidade||'');
        setEstadoPessoa(j.uf||'');
      }
    }catch(_){ }
  })(); },[product, cepPessoa]);

  // e-CNPJ: biometria on cpfResponsavel
  useEffect(()=>{ (async()=>{
    if(product!=='ECNPJ_A1') return;
    setBiometriaOkJ(null);
    const d = onlyDigits(cpfResponsavel);
    if(d.length!==11) return;
    try{
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL||''}/integrations/biometria`,{ method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({ cpf: d }) });
      const j = await res.json();
      setBiometriaOkJ(!!j?.temBiometria);
    }catch(_){ setBiometriaOkJ(null); }
  })(); },[product, cpfResponsavel]);

  // e-CNPJ: após CPF, obter DOB via Assertiva
  useEffect(()=>{ (async()=>{
    if(product!=='ECNPJ_A1') return;
    const d = onlyDigits(cpfResponsavel);
    if(d.length!==11) return;
    try{
      const a = await fetch('http://127.0.0.1:3001/api/cpf',{ method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({ cpf: d }) });
      const aj = await a.json();
      if(aj?.dataNascimento){ const [y,m,dd] = String(aj.dataNascimento).split('-'); setDataNascimento(`${dd}/${m}/${y}`); }
      if(aj?.nome){ setNomeRespAuto(aj.nome); }
    }catch(_){ }
  })(); },[product, cpfResponsavel]);

  // e-CNPJ: após CNPJ, consulta prévia CNPJ e preenche dados da empresa e endereço
  useEffect(()=>{ (async()=>{
    if(product!=='ECNPJ_A1') return;
    const dcnpj = onlyDigits(cnpj);
    const dcpf = onlyDigits(cpfResponsavel);
    const iso = toISODate(dataNascimento);
    if(dcnpj.length!==14 || dcpf.length!==11 || !iso) return;
    try{
      // Safeweb consulta prévia CNPJ
      const s = await fetch(`${import.meta.env.VITE_API_BASE_URL||''}/integrations/safeweb/consulta-previa-cnpj`,{ method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({ cnpj: dcnpj, cpfResponsavel: dcpf, dataNascimento: iso }) });
      const sj = await s.json();
      setRepLegalOk(!!(sj?.representanteLegal || sj?.codigo===0));
      if(sj?.razaoSocial || sj?.RazaoSocial){ setRazaoAuto(sj.razaoSocial || sj.RazaoSocial); }
      // Empresa via provider interno
      const br = await fetch(`${import.meta.env.VITE_API_BASE_URL||''}/integrations/externos/cnpj/${dcnpj}`);
      const bj = await br.json();
      if(bj && !bj.error){
        const cepEmp = (bj?.cep||'').replace(/\D+/g,'');
        if(cepEmp){ setCepEmpresa(cepEmp.replace(/(\d{2})(\d{3})(\d{1,3})/, '$1.$2-$3')); }
        if(bj?.logradouro) setLogradouroEmpresa(bj.logradouro);
        if(bj?.numero) setNumeroEmpresa(bj.numero);
        if(bj?.bairro) setBairroEmpresa(bj.bairro);
        if(bj?.municipio) setCidadeEmpresa(bj.municipio);
        if(bj?.uf) setEstadoEmpresa(bj.uf);
      }
    }catch(_){ }
  })(); },[product, cnpj, cpfResponsavel, dataNascimento]);

  async function onSubmit(e){
    e.preventDefault(); setError(''); setLoading(true); setResult(null);
    try{
      if(product === 'ECPF_A1'){
        // Exclusividade CEI/CAEPF
        if(cei && caepf){ setLoading(false); setError('Informe apenas CEI ou CAEPF (não ambos)'); return; }
        // CNH obrigatória se biometria negativa
        if(biometriaOk===false && maskCNH(cnh).length!==11){ setLoading(false); setError('Informe a CNH (11 dígitos)'); return; }
        const body = { cpf, email, telefone, cep, numero, dataNascimento, cnh: biometriaOk===false? cnh : undefined };
        const r = await api.request('/protocols/ecpf', { method:'POST', body });
        setLoading(false);
        if(r.status===201 && r.json?.ok){
          setResult(r.json);
          // Persist minimal certificate record
          await api.request('/certificates', { method:'POST', body: { product:'ECPF_A1', protocolo: r.json.protocolo, payload: body } });
          return;
        }
        setError(r.json?.error || 'Falha ao gerar protocolo');
      } else {
        const body = { cnpj, cpfResponsavel, email, telefone, cepPessoa, numeroPessoa, dataNascimento, cnh: biometriaOkJ===false? cnh : undefined };
        const r = await api.request('/protocols/ecnpj', { method:'POST', body });
        setLoading(false);
        if(r.status===201 && r.json?.ok){
          setResult(r.json);
          await api.request('/certificates', { method:'POST', body: { product:'ECNPJ_A1', protocolo: r.json.protocolo, payload: body } });
          return;
        }
        setError(r.json?.error || 'Falha ao gerar protocolo');
      }
    }catch(err){ setLoading(false); setError('Erro de conexão'); }
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold">Novo certificado</h2>
      </div>

      <form onSubmit={onSubmit} className="grid gap-4 max-w-3xl">
        <div>
          <div className="text-sm font-medium mb-2">Produto</div>
          <div className="flex gap-4 text-sm">
            <label className="inline-flex items-center gap-2">
              <input type="radio" name="produto" checked={product==='ECPF_A1'} onChange={()=> setProduct('ECPF_A1')} />
              <span>e-CPF A1</span>
            </label>
            <label className="inline-flex items-center gap-2">
              <input type="radio" name="produto" checked={product==='ECNPJ_A1'} onChange={()=> setProduct('ECNPJ_A1')} />
              <span>e-CNPJ A1</span>
            </label>
          </div>
        </div>

        {product==='ECPF_A1' ? (
          <div className="grid gap-3 md:grid-cols-2">
            <div className="md:col-span-2 text-slate-600 text-sm">Preencha os dados para gerar protocolo de e-CPF.</div>
            <div>
              <label className="block text-sm mb-1" htmlFor="cpf">CPF</label>
              <div className="flex items-center gap-2">
                <input id="cpf" className="w-full font-mono" placeholder="___.___.___-__" value={cpf} onChange={e=>{ const v=maskCPF(e.target.value); setCpf(v); if(onlyDigits(v).length===11) setTimeout(handleCpfBlur, 0); }} onBlur={handleCpfBlur} required />
                <button type="button" className="btn-secondary px-2 py-1 text-xs" onClick={handleCpfBlur}>Consultar</button>
              </div>
              {biometriaOk===true && <div className="text-green-600 text-xs mt-1">Biometria OK (videoconferência)</div>}
              {biometriaOk===false && (
                <div className="text-red-600 text-xs mt-1">Não existe biometria cadastrada.
                  <div className="mt-2">
                    <label className="block text-sm mb-1" htmlFor="cnh">CNH (obrigatório)</label>
                    <input id="cnh" className="w-full font-mono" placeholder="___________" value={cnh} onChange={e=>setCnh(maskCNH(e.target.value))} />
                  </div>
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm mb-1" htmlFor="dataNascimento">Data de nascimento</label>
              <input id="dataNascimento" type="text" placeholder="__/__/____" className="w-full font-mono" value={dataNascimento} onChange={e=>setDataNascimento(maskDate(e.target.value))} onBlur={handleDobBlurECpf} required />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm mb-1" htmlFor="nomeAuto">Nome completo</label>
              <input id="nomeAuto" className="w-full" value={nomeAuto} readOnly placeholder="preenchido automaticamente" />
            </div>
            <div className="md:col-span-2 text-sm text-slate-600">Endereço</div>
            <div>
              <label className="block text-sm mb-1" htmlFor="cep">CEP</label>
              <input id="cep" className="w-full font-mono" placeholder="__.___-___" value={cep} onChange={e=>{ const v=maskCEP(e.target.value); setCep(v); if(cepDigits(v).length===8) setTimeout(handleCepBlur,0); }} onBlur={handleCepBlur} required />
            </div>
            <div>
              <label className="block text-sm mb-1" htmlFor="logradouro">Logradouro</label>
              <input id="logradouro" className="w-full" value={logradouro} onChange={e=>setLogradouro(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm mb-1" htmlFor="complemento">Complemento</label>
              <input id="complemento" className="w-full" value={complemento} onChange={e=>setComplemento(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm mb-1" htmlFor="numero">Número</label>
              <input id="numero" className="w-full" value={numero} onChange={e=>setNumero(e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm mb-1" htmlFor="bairro">Bairro</label>
              <input id="bairro" className="w-full" value={bairro} onChange={e=>setBairro(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm mb-1" htmlFor="cidade">Cidade</label>
              <input id="cidade" className="w-full" value={cidade} onChange={e=>setCidade(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm mb-1" htmlFor="estado">Estado</label>
              <input id="estado" className="w-full" value={estado} onChange={e=>setEstado(e.target.value)} />
            </div>
            <div className="md:col-span-2 text-sm text-slate-600">Contato</div>
            <div>
              <label className="block text-sm mb-1" htmlFor="telefone">Telefone</label>
              <input id="telefone" className="w-full font-mono" placeholder="(__) _____-____" value={telefone} onChange={e=>setTelefone(maskPhone(e.target.value))} required />
            </div>
            <div>
              <label className="block text-sm mb-1" htmlFor="email">E-mail</label>
              <input id="email" type="email" className="w-full" value={email} onChange={e=>setEmail(e.target.value)} required />
            </div>
            <div className="md:col-span-2 text-sm text-slate-600">Documentos complementares</div>
            <div>
              <label className="block text-sm mb-1" htmlFor="pis">PIS</label>
              <input id="pis" className="w-full font-mono" value={pis} onChange={e=>setPis(maskPIS(e.target.value))} placeholder="___._____.__.__" />
            </div>
            <div>
              <label className="block text-sm mb-1" htmlFor="cei">CEI</label>
              <input id="cei" className="w-full font-mono" value={cei} onChange={e=>setCei(maskCEI(e.target.value))} placeholder="__.___ ._____/__" />
            </div>
            <div>
              <label className="block text-sm mb-1" htmlFor="caepf">CAEPF</label>
              <input id="caepf" className="w-full font-mono" value={caepf} onChange={e=>setCaepf(maskCAEPF(e.target.value))} placeholder="___.___.___/___-__" />
            </div>
            <div className="md:col-span-2 text-xs text-slate-500">Informe apenas CEI ou CAEPF (um deles)</div>
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            <div className="md:col-span-2 text-slate-600 text-sm">Preencha os dados para gerar protocolo de e-CNPJ.</div>
            <div>
              <label className="block text-sm mb-1" htmlFor="cpfResponsavel">CPF</label>
              <div className="flex items-center gap-2">
                <input id="cpfResponsavel" className="w-full font-mono" placeholder="___.___.___-__" value={cpfResponsavel} onChange={e=>{ const v=maskCPF(e.target.value); setCpfResponsavel(v); if(onlyDigits(v).length===11) setTimeout(handleCpfRespBlur, 0); }} onBlur={handleCpfRespBlur} required />
                <button type="button" className="btn-secondary px-2 py-1 text-xs" onClick={handleCpfRespBlur}>Consultar</button>
              </div>
              {biometriaOkJ===true && <div className="text-green-600 text-xs mt-1">Biometria OK (videoconferência)</div>}
              {biometriaOkJ===false && (
                <div className="text-red-600 text-xs mt-1">Não existe biometria cadastrada.
                  <div className="mt-2">
                    <label className="block text-sm mb-1" htmlFor="cnhJ">CNH (obrigatório)</label>
                    <input id="cnhJ" className="w-full font-mono" placeholder="___________" value={cnh} onChange={e=>setCnh(maskCNH(e.target.value))} />
                  </div>
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm mb-1" htmlFor="dataNascimento2">Data de nascimento</label>
              <input id="dataNascimento2" type="text" placeholder="__/__/____" className="w-full font-mono" value={dataNascimento} onChange={e=>setDataNascimento(maskDate(e.target.value))} onBlur={handleDobBlurECnpj} required />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm mb-1" htmlFor="nomeRespAuto">Nome completo</label>
              <input id="nomeRespAuto" className="w-full" value={nomeRespAuto} readOnly placeholder="preenchido automaticamente" />
            </div>
            <div className="md:col-span-2 text-sm text-slate-600">Endereço do responsável (CEP do CPF)</div>
            <div>
              <label className="block text-sm mb-1" htmlFor="cepPessoa">CEP</label>
              <input id="cepPessoa" className="w-full font-mono" placeholder="__.___-___" value={cepPessoa} onChange={e=>{ const v=maskCEP(e.target.value); setCepPessoa(v); if(cepDigits(v).length===8) setTimeout(handleCepPessoaBlur,0); }} onBlur={handleCepPessoaBlur} required />
            </div>
            <div>
              <label className="block text-sm mb-1" htmlFor="logradouroPessoa">Logradouro</label>
              <input id="logradouroPessoa" className="w-full" value={logradouroPessoa} onChange={e=>setLogradouroPessoa(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm mb-1" htmlFor="complementoPessoa">Complemento</label>
              <input id="complementoPessoa" className="w-full" value={complementoPessoa} onChange={e=>setComplementoPessoa(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm mb-1" htmlFor="numeroPessoa">Número</label>
              <input id="numeroPessoa" className="w-full" value={numeroPessoa} onChange={e=>setNumeroPessoa(e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm mb-1" htmlFor="bairroPessoa">Bairro</label>
              <input id="bairroPessoa" className="w-full" value={bairroPessoa} onChange={e=>setBairroPessoa(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm mb-1" htmlFor="cidadePessoa">Cidade</label>
              <input id="cidadePessoa" className="w-full" value={cidadePessoa} onChange={e=>setCidadePessoa(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm mb-1" htmlFor="estadoPessoa">Estado</label>
              <input id="estadoPessoa" className="w-full" value={estadoPessoa} onChange={e=>setEstadoPessoa(e.target.value)} />
            </div>
            <div className="md:col-span-2 text-sm text-slate-600">Dados da empresa (preenchidos via Receita)</div>
            <div>
              <label className="block text-sm mb-1" htmlFor="cnpj">CNPJ</label>
              <div className="flex items-center gap-2">
                <input id="cnpj" className="w-full font-mono" placeholder="__.___.___/____-__" value={cnpj} onChange={e=>{ const v=maskCNPJ(e.target.value); setCnpj(v); if(onlyDigits(v).length===14) setTimeout(handleCnpjBlur, 0); }} onBlur={handleCnpjBlur} required />
                <button type="button" className="btn-secondary px-2 py-1 text-xs" onClick={handleCnpjBlur}>Consultar</button>
              </div>
              {repLegalOk===true && <div className="text-green-600 text-xs mt-1">Representante legal confirmado</div>}
              {repLegalOk===false && <div className="text-red-600 text-xs mt-1">CPF não é representante legal</div>}
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm mb-1" htmlFor="razaoAuto">Razão social</label>
              <input id="razaoAuto" className="w-full" value={razaoAuto} readOnly placeholder="preenchido automaticamente" />
            </div>
            <div>
              <label className="block text-sm mb-1" htmlFor="cepEmpresa">CEP</label>
              <input id="cepEmpresa" className="w-full font-mono" placeholder="__.___-___" value={cepEmpresa} readOnly />
            </div>
            <div>
              <label className="block text-sm mb-1" htmlFor="logradouroEmpresa">Logradouro</label>
              <input id="logradouroEmpresa" className="w-full" value={logradouroEmpresa} readOnly />
            </div>
            <div>
              <label className="block text-sm mb-1" htmlFor="complementoEmpresa">Complemento</label>
              <input id="complementoEmpresa" className="w-full" value={complementoEmpresa} readOnly />
            </div>
            <div>
              <label className="block text-sm mb-1" htmlFor="numeroEmpresa">Número</label>
              <input id="numeroEmpresa" className="w-full" value={numeroEmpresa} readOnly />
            </div>
            <div>
              <label className="block text-sm mb-1" htmlFor="bairroEmpresa">Bairro</label>
              <input id="bairroEmpresa" className="w-full" value={bairroEmpresa} readOnly />
            </div>
            <div>
              <label className="block text-sm mb-1" htmlFor="cidadeEmpresa">Cidade</label>
              <input id="cidadeEmpresa" className="w-full" value={cidadeEmpresa} readOnly />
            </div>
            <div>
              <label className="block text-sm mb-1" htmlFor="estadoEmpresa">Estado</label>
              <input id="estadoEmpresa" className="w-full" value={estadoEmpresa} readOnly />
            </div>
            <div className="md:col-span-2 text-sm text-slate-600">Contato</div>
            <div>
              <label className="block text-sm mb-1" htmlFor="telefone2">Telefone</label>
              <input id="telefone2" className="w-full font-mono" placeholder="(__) _____-____" value={telefone} onChange={e=>setTelefone(maskPhone(e.target.value))} required />
            </div>
            <div>
              <label className="block text-sm mb-1" htmlFor="email2">E-mail</label>
              <input id="email2" type="email" className="w-full" value={email} onChange={e=>setEmail(e.target.value)} required />
            </div>
            <div className="md:col-span-2 text-sm text-slate-600">Documentos complementares</div>
            <div>
              <label className="block text-sm mb-1" htmlFor="pisJ">PIS</label>
              <input id="pisJ" className="w-full font-mono" value={pisJ} onChange={e=>setPisJ(maskPIS(e.target.value))} placeholder="___._____.__.__" />
            </div>
            <div>
              <label className="block text-sm mb-1" htmlFor="ceiJ">CEI</label>
              <input id="ceiJ" className="w-full font-mono" value={ceiJ} onChange={e=>setCeiJ(maskCEI(e.target.value))} placeholder="__.___ ._____/__" />
            </div>
          </div>
        )}

        {error && <div className="text-red-600 text-sm" role="alert">{error}</div>}

        <div className="flex gap-2 mt-2">
          <button type="button" className="btn-secondary px-4 py-2" onClick={()=> navigate('/admin/certificates')}>Cancelar</button>
          <button type="submit" className="btn-primary px-4 py-2" disabled={loading}>{loading? 'Gerando…':'Gerar protocolo'}</button>
        </div>
      </form>

      {result && (
        <div className="mt-4 p-3 border rounded bg-slate-50">
          <div className="font-medium mb-1">Protocolo gerado</div>
          <div className="text-sm">Número: <b>{result.protocolo}</b></div>
          {result.pix && (
            <div className="mt-2 text-sm">
              <div className="font-medium">Pagamento (PIX)</div>
              <div>Valor: R$ {result.pix?.dados?.valor || '—'}</div>
              {result.pix?.dados?.qrCode && <div className="text-xs break-all">QR Code: {result.pix.dados.qrCode}</div>}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}


