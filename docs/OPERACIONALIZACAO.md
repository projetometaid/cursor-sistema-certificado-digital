# 📘 Operacionalização: Geração de Protocolo (Safeweb) + PIX (Safe2Pay)

Este documento registra, de forma prática e reproduzível, como geramos protocolos (e-CPF/e-CNPJ) via Safeweb e criamos pagamentos PIX no Safe2Pay utilizando o número do protocolo como referência.

## 1) Pré-requisitos

- .env configurado na raiz com:
  - `SAFEWEB_USERNAME`, `SAFEWEB_PASSWORD`, `SAFEWEB_CNPJ_AR`, `SAFEWEB_CODIGO_PARCEIRO` (opcional)
  - `SAFEWEB_AUTH_URL` (podemos sobrescrever por comando)
  - `SAFE2PAY_TOKEN`, `SAFE2PAY_API_SECRET_KEY`
- Proxy Safeweb iniciável em `localhost:3002`.

## 2) Iniciar Proxy Safeweb

Comando utilizado (autenticação via Hub Autenticação):

```bash
cd "api-safeweb" \
  && SAFEWEB_AUTH_URL="https://pss.safewebpss.com.br/Service/Microservice/Shared/HubAutenticacao/Autenticacoes/api/autorizacao/token" \
  node safeweb-proxy.js
```

Observações aplicadas no proxy (`api-safeweb/safeweb-proxy.js`):
- Cache de token ativado.
- Injeção de `CodigoParceiro` quando presente no .env.
- Endpoint usado por padrão para criação de solicitações: `Add/3` (videoconferência).

## 3) Geração de e-CPF + PIX

Arquivo de configuração com os dados do cliente:

```json
{
  "cliente": {
    "nome": "Leandro Albertini",
    "cpf": "38601836801",
    "dataNascimento": "1989-01-28",
    "email": "leandro.albertini@certificadocampinas.com.br",
    "telefone": "19997888810",
    "endereco": { "cep": "13070064", "numero": "104" }
  },
  "certificado": { "tipo": "e-CPF", "produto": "A1", "valor": 199.99 },
  "pagamento": { "tipo_preferido": "PIX", "vencimento_boleto_dias": 30 }
}
```

Execução do fluxo integrado (gera protocolo + cria PIX referenciando o protocolo):

```bash
node scripts/executar-com-config.js
```

Ajuste realizado para Safe2Pay:
- Corrigido import em `scripts/executar-com-config.js` de `./safe2pay/Safe2PayHybrid` para `../safe2pay/Safe2PayHybrid`.

Resultados (exemplos reais gerados):
- Protocolo e-CPF: `1008805312` → PIX ID: `136578181` → QR: https://images.safe2pay.com.br/pix/29820e63135e4d69a91af83daeb99020.png
- Protocolo e-CPF: `1008805315` → PIX ID: `136578318` → QR: https://images.safe2pay.com.br/pix/f9ed0e35b05c4ad0b1b8c0547bf65622.png

## 4) Geração de e-CNPJ + PIX

Script criado para fluxo e-CNPJ (gera protocolo e cria PIX): `scripts/gerar-ecnpj-com-pix.js`

Características do script:
- Consulta ViaCEP para endereço.
- (Opcional) Consulta CNPJ na ReceitaWS para obter razão social.
- Autentica na Safeweb, lista produtos do AR por tipo de emissão e seleciona idProduto correto.
- Envia solicitação para `Add/3` com `CandidataRemocaoACI: false`, e injeta `CodigoParceiro` se presente.
- Cria PIX no Safe2Pay usando `Reference = protocolo`.

Comando:

```bash
node scripts/gerar-ecnpj-com-pix.js
```

Resultados (exemplo real gerado):
- Protocolo e-CNPJ: `1008805363` → PIX ID: `136580828` → QR: https://images.safe2pay.com.br/pix/7abdcb525c0e49998274750f649cf0ce.png

Notas importantes para e-CNPJ:
- A listagem de produtos usa o endpoint:
  - `GET /Service/Microservice/Shared/Product/api/GetListProdutoByAR/{idTipoEmissao}/{CnpjAR}`
  - Para videoconferência usamos `idTipoEmissao = 3`.
- Exemplo de idProduto obtido: `37342` (videoconferência e-CNPJ A1 para a AR).

## 5) Verificações rápidas

- Teste do proxy Safeweb:

```bash
curl -s http://localhost:3002/api/test
```

- Conferência no Safe2Pay: buscar pela referência (= número do protocolo).

## 6) Troubleshooting curto

- `Produto não foi localizado` (Safeweb 400): alinhar `idTipoEmissao` e `idProduto` via listagem de produtos por AR; confirmar `CodigoParceiro` quando exigido.
- `500` ao gerar e-CNPJ: garantir endpoint `Add/3` (videoconferência) e payload com campos obrigatórios.
- `Cannot find module './safe2pay/Safe2PayHybrid'`: usar caminho `../safe2pay/Safe2PayHybrid` em scripts na pasta `scripts/`.

## 7) Próximas atualizações deste documento

- Registrar novos protocolos/PIX gerados.
- Detalhar mapeamento de `idTipoEmissao` ↔️ produtos da AR.
- Adicionar seções de rollback/logs e automações de CI/CD.


