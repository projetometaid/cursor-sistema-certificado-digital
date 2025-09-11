import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/Card.jsx';
import { api } from '../lib/api.js';

export default function CertificateNew(){
  const navigate = useNavigate();
  const [product, setProduct] = useState('ECPF_A1'); // ECPF_A1 | ECNPJ_A1
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

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
    const d = onlyDigits(v).slice(0,7); // solicitado 7
    return d;
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

  async function onSubmit(e){
    e.preventDefault(); setError(''); setLoading(true); setResult(null);
    try{
      if(product === 'ECPF_A1'){
        // Exclusividade CEI/CAEPF
        if(cei && caepf){ setLoading(false); setError('Informe apenas CEI ou CAEPF (não ambos)'); return; }
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
            </div>
            <div>
              <label className="block text-sm mb-1" htmlFor="dataNascimento">Data de nascimento</label>
              <input id="dataNascimento" type="text" placeholder="__/__/____" className="w-full font-mono" value={dataNascimento} onChange={e=>setDataNascimento(maskDate(e.target.value))} required />
            </div>
            <div className="md:col-span-2 text-sm text-slate-600">Endereço</div>
            <div>
              <label className="block text-sm mb-1" htmlFor="cep">CEP</label>
              <input id="cep" className="w-full font-mono" placeholder="_______" value={cep} onChange={e=>setCep(maskCEP(e.target.value))} required />
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
              <input id="estado" className="w-full font-mono" placeholder="__" value={estado} onChange={e=>setEstado(maskUF(e.target.value))} />
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
              <input id="cepPessoa" className="w-full font-mono" placeholder="_______" value={cepPessoa} onChange={e=>setCepPessoa(maskCEP(e.target.value))} required />
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
              <input id="estadoPessoa" className="w-full font-mono" placeholder="__" value={estadoPessoa} onChange={e=>setEstadoPessoa(maskUF(e.target.value))} />
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


