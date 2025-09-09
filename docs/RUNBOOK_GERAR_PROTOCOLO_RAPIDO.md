### Runbook: Gerar protocolo e-CPF e e-CNPJ rapidamente

Objetivo: passos mínimos para subir os serviços e gerar um protocolo válido de teste, de forma reproduzível por agentes (IA) e humanos.

#### 1) Pré‑requisitos
- **.env** configurado com credenciais válidas:
  - SAFEWEB_USERNAME, SAFEWEB_PASSWORD, SAFEWEB_CNPJ_AR, (opcional) SAFEWEB_CODIGO_PARCEIRO
  - ASSERTIVA_CLIENT_ID, ASSERTIVA_SECRET
  - (opcional para PIX) SAFE2PAY_TOKEN
- Node 18+ instalado.

#### 2) Iniciar serviços locais (proxies)
Em dois terminais separados:

```bash
node src/backend/proxies/assertiva-proxy.js
```

```bash
node src/backend/proxies/safeweb-proxy.js
```

Verifique saúde:

```bash
curl -s http://localhost:3001/api/test
curl -s http://localhost:3003/api/test
```

Se aparecer EADDRINUSE (porta ocupada):

```bash
pkill -f assertiva-proxy.js || true
pkill -f safeweb-proxy.js || true
```

---

#### 3) Opção A (recomendada): via API do sistema
Suba a API clean (Express):

```bash
npm run dev:clean
```

- e‑CPF (gera protocolo e cria PIX):

```bash
curl -sS -X POST http://localhost:3000/protocols/ecpf \
  -H 'Content-Type: application/json' \
  -d '{
    "cpf":"<CPF>",
    "email":"<email>",
    "telefone":"<somente_digitos>",
    "cep":"<CEP>",
    "numero":"<numero>",
    "nome":"<nome>",
    "dataNascimento":"<YYYY-MM-DD|DD/MM/YYYY>"
  }'
```

- e‑CNPJ (gera protocolo e cria PIX):

```bash
curl -sS -X POST http://localhost:3000/protocols/ecnpj \
  -H 'Content-Type: application/json' \
  -d '{
    "cnpj":"<CNPJ>",
    "cpfResponsavel":"<CPF>",
    "email":"<email>",
    "telefone":"<somente_digitos>",
    "cepPessoa":"<CEP>",
    "numeroPessoa":"<numero>"
  }'
```

Respostas esperadas (sucesso): `{ ok: true, protocolo, pix }`.

---

#### 4) Opção B: direto no proxy Safeweb (sem API)
Use quando quiser isolar a integração Safeweb.

1) Validar biometria (e‑CPF):

```bash
curl -sS -X POST http://localhost:3003/api/validar-biometria \
  -H 'Content-Type: application/json' \
  -d '{"cpf":"<CPF>"}'
```

2) Consulta prévia CPF/CNPJ:

```bash
curl -sS -X POST http://localhost:3003/api/consulta-previa-cpf \
  -H 'Content-Type: application/json' \
  -d '{"cpf":"<CPF>","dataNascimento":"<YYYY-MM-DD|DD/MM/YYYY>"}'
```

```bash
curl -sS -X POST http://localhost:3003/api/consulta-previa-cnpj \
  -H 'Content-Type: application/json' \
  -d '{"cnpj":"<CNPJ>","cpfResponsavel":"<CPF>","dataNascimento":"<YYYY-MM-DD>"}'
```

3) Gerar protocolo e‑CPF (payload mínimo):

```bash
curl -sS -X POST http://localhost:3003/api/gerar-protocolo \
  -H 'Content-Type: application/json' \
  -d '{
    "CnpjAR":"<SAFEWEB_CNPJ_AR>",
    "idProduto":"37341",
    "Nome":"<nome>",
    "CPF":"<CPF>",
    "DataNascimento":"<YYYY-MM-DD>",
    "CandidataRemocaoACI":false,
    "DocumentoIdentidade":{"TipoDocumento":1,"Numero":"000000000","Emissor":"SSP"},
    "Contato":{"DDD":"<DD>","Telefone":"<telefone>","Email":"<email>"},
    "Endereco":{
      "Logradouro":"<rua>","Numero":"<numero>","Bairro":"<bairro>",
      "UF":"<UF>","Cidade":"<cidade>",
      "CodigoIbgeMunicipio":"<ibge>","CodigoIbgeUF":"35","CEP":"<cep>"
    },
    "ClienteNotaFiscal":{
      "Bairro":"<bairro>","Cep":"<cep>","Cidade":"<cidade>",
      "CidadeCodigo":"<ibge>","Email1":"<email>","Endereco":"<rua>",
      "Numero":"<numero>","UF":"<UF>","UFCodigo":"35",
      "Pais":"Brasil","PaisCodigoAlpha3":"BRA","IE":"",
      "Sacado":"<nome>","Documento":"<CPF>"
    }
  }'
```

4) Gerar protocolo e‑CNPJ (payload mínimo):

```bash
curl -sS -X POST http://localhost:3003/api/gerar-protocolo \
  -H 'Content-Type: application/json' \
  -d '{
    "CnpjAR":"<SAFEWEB_CNPJ_AR>",
    "idProduto":"37342",
    "RazaoSocial":"<razao>",
    "NomeFantasia":"<fantasia>",
    "CNPJ":"<CNPJ>",
    "Titular":{
      "Nome":"<nome_resp>","CPF":"<CPF_resp>","DataNascimento":"<YYYY-MM-DD>",
      "NIS":"",
      "Contato":{"DDD":"<DD>","Telefone":"<telefone>","Email":"<email>"},
      "Endereco":{
        "Logradouro":"<rua>","Numero":"<numero>","Bairro":"<bairro>",
        "UF":"<UF>","Cidade":"<cidade>",
        "CodigoIbgeMunicipio":"<ibge>","CodigoIbgeUF":"35","CEP":"<cep>"
      },
      "DocumentoIdentidade":{"TipoDocumento":1,"Numero":"000000000","Emissor":"SSP"}
    },
    "Contato":{"DDD":"<DD>","Telefone":"<telefone>","Email":"<email>"},
    "Endereco":{
      "Logradouro":"<rua>","Numero":"<numero>","Bairro":"<bairro>",
      "UF":"<UF>","Cidade":"<cidade>",
      "CodigoIbgeMunicipio":"<ibge>","CodigoIbgeUF":"35","CEP":"<cep>"
    },
    "ClienteNotaFiscal":{
      "Bairro":"<bairro>","Cep":"<cep>","Cidade":"<cidade>",
      "CidadeCodigo":"<ibge>","Email1":"<email>","Endereco":"<rua>",
      "Numero":"<numero>","UF":"<UF>","UFCodigo":"35",
      "Pais":"Brasil","PaisCodigoAlpha3":"BRA","IE":"",
      "Sacado":"<razao>","Documento":"<CNPJ>"
    }
  }'
```

Saída esperada (sucesso): `{ "success": true, "protocolo": "<numero>" }`.

---

#### 5) Dicas rápidas
- Use CEP real para preencher endereço e IBGE (ViaCEP ajuda a obter `ibge`).
- Se o objetivo for apenas validar Safeweb, a Opção B é mais direta.
- Para acompanhar pagamento automático (PIX via Safe2Pay), prefira a Opção A, que já cria o PIX.


