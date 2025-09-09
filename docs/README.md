# Backend (estrutura canônica)

Organização dos artefatos de backend. Padrão pensado para manter separação de responsabilidades e imports previsíveis.

## Pastas

- proxies: servidores proxy locais para isolar autenticação/calls a parceiros
  - proxies/assertiva-proxy.js: proxy Assertiva V3 (consulta CPF, token OAuth2)
  - proxies/safeweb-proxy.js: proxy Safeweb (token, consulta prévia, protocolo)
- integrations: SDKs/adapters de integrações e utilitários puros
  - integrations/safe2pay/Safe2PayHybrid.js: criação de PIX/Boleto (SDK + custom)
  - integrations/protocolo/apis.js: integrações puras (Assertiva, Safeweb, ViaCEP, ReceitaWS) e fluxos auxiliares
- services: regras de negócio (montagem de payloads, validações, orquestração)
- routes: rotas HTTP caso seja exposto um servidor local (Express)

## Convenções

- Variáveis sensíveis em config/.env (não versionar) e exemplos em config/.env.example
- Imports usando caminhos a partir de src/backend para evitar confusões pós-refactor
- Tipos de emissão Safeweb:
  - Add/1: presencial
  - Add/3: videoconferência (padrão utilizado pelo proxy)

## Atalhos (scripts)

- start:safeweb: inicia proxies/safeweb-proxy.js
- start:assertiva: inicia proxies/assertiva-proxy.js

## Arquivos correlatos

- fluxo_integrado.js (raiz): orquestrador CLI (Assertiva → Biometria → Consulta Prévia → Protocolo → PIX)
- scripts/executar-com-config.js: fluxo e-CPF com config JSON
- scripts/gerar-ecnpj-com-pix.js: fluxo e-CNPJ + PIX
