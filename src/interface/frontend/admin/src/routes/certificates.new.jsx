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
  const [razaoAuto, setRazaoAuto] = useState('');

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

  // e-CNPJ: biometria on cpfResponsavel
  useEffect(()=>{ (async()=>{
    if(product!=='ECNPJ_A1') return;
    setBiometriaOkJ(null);
    const d = onlyDigits(cpfResponsavel);
    if(d.length!==11) return;
    try{
      const res = await fetch('http://127.0.0.1:3003/api/validar-biometria',{ method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({ cpf: d }) });
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
      const s = await fetch('http://127.0.0.1:3003/api/consulta-previa-cnpj',{ method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({ cnpj: dcnpj, cpfResponsavel: dcpf, dataNascimento: iso }) });
      await s.json();
      // BrasilAPI empresa
      const br = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${dcnpj}`);
      const bj = await br.json();
      setRazaoAuto(bj?.razao_social||'');
      setCepPessoa((bj?.cep||'').replace(/\D+/g,'').replace(/(\d{2})(\d{3})(\d{1,3})/, '$1.$2-$3'));
      setLogradouroPessoa(bj?.logradouro||'');
      setNumeroPessoa(bj?.numero||'');
      setBairroPessoa(bj?.bairro||'');
      setCidadePessoa(bj?.municipio||'');
      setEstadoPessoa(bj?.uf||'');
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
        const body = { cpf, email, telefone, cep, numero, dataNascimento };
        const r = await api.request('/protocols/ecpf', { method:'POST', body });
        setLoading(false);
        if(r.status===201 && r.json?.ok){ setResult(r.json); return; }
        setError(r.json?.error || 'Falha ao gerar protocolo');
      } else {
        const body = { cnpj, cpfResponsavel, email, telefone, cepPessoa, numeroPessoa, dataNascimento };
        const r = await api.request('/protocols/ecnpj', { method:'POST', body });
        setLoading(false);
        if(r.status===201 && r.json?.ok){ setResult(r.json); return; }
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
              <input id="cpf" className="w-full font-mono" placeholder="___.___.___-__" value={cpf} onChange={e=>setCpf(maskCPF(e.target.value))} required />
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
              <input id="dataNascimento" type="text" placeholder="__/__/____" className="w-full font-mono" value={dataNascimento} onChange={e=>setDataNascimento(maskDate(e.target.value))} required />
            </div>
            {nomeAuto && (
              <div className="md:col-span-2">
                <label className="block text-sm mb-1" htmlFor="nomeAuto">Nome</label>
                <input id="nomeAuto" className="w-full" value={nomeAuto} readOnly />
              </div>
            )}
            <div className="md:col-span-2 text-sm text-slate-600">Endereço</div>
            <div>
              <label className="block text-sm mb-1" htmlFor="cep">CEP</label>
              <input id="cep" className="w-full font-mono" placeholder="__.___-___" value={cep} onChange={e=>setCep(maskCEP(e.target.value))} required />
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
              <input id="cpfResponsavel" className="w-full font-mono" placeholder="___.___.___-__" value={cpfResponsavel} onChange={e=>setCpfResponsavel(maskCPF(e.target.value))} required />
            </div>
            <div>
              <label className="block text-sm mb-1" htmlFor="dataNascimento2">Data de nascimento</label>
              <input id="dataNascimento2" type="text" placeholder="__/__/____" className="w-full font-mono" value={dataNascimento} onChange={e=>setDataNascimento(maskDate(e.target.value))} required />
            </div>
            <div>
              <label className="block text-sm mb-1" htmlFor="cnpj">CNPJ</label>
              <input id="cnpj" className="w-full font-mono" placeholder="__.___.___/____-__" value={cnpj} onChange={e=>setCnpj(maskCNPJ(e.target.value))} required />
            </div>
            <div className="md:col-span-2 text-sm text-slate-600">Endereço</div>
            <div>
              <label className="block text-sm mb-1" htmlFor="cepPessoa">CEP</label>
              <input id="cepPessoa" className="w-full font-mono" placeholder="__.___-___" value={cepPessoa} onChange={e=>setCepPessoa(maskCEP(e.target.value))} required />
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


