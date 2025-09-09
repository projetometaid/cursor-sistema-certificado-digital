### Migração para Clean Architecture (mapa rápido)

- Endpoints mantidos: `POST /auth/register`, `POST /auth/login`, `GET /orders`, `POST /orders`, `POST /webhooks/safe2pay`, `GET /health`.
- Compatibilidade: caminhos antigos em `src/backend/**` têm reexports para os novos módulos.

### Mapeamento de caminhos (antigo → novo)
- `src/backend/server.js` → `src/main/server.js` e `src/main/container.js`
- `src/backend/routes/{auth,orders,webhooks}.js` → `src/interface/http/routes/{auth,orders,webhooks}.js`
- `src/backend/services/{auth.service.js,orders.service.js}` → `src/core/usecases/{RegisterUserUseCase,LoginUseCase,CreateOrderUseCase,ListOrdersUseCase,MarkOrderPaidUseCase}.js`
- `src/backend/utils/{hash.js,tokens.js}` → `src/shared/utils/{hash.js,tokens.js}`
- `src/backend/data/localStore.js` → `src/infrastructure/db/localStore.js` (reexport em `src/backend/data/localStore.js`)
- `src/backend/integrations/safe2pay/Safe2PayHybrid.js` → `src/infrastructure/integrations/safe2pay/Safe2PayHybrid.js` (reexport em `src/backend/integrations/safe2pay/Safe2PayHybrid.js`)
- `src/backend/integrations/protocolo/apis.js` → `src/infrastructure/integrations/safeweb/protocolApis.js` (reexport em `src/backend/integrations/protocolo/apis.js`)
- `src/backend/proxies/{assertiva-proxy.js,safeweb-proxy.js}` → `src/infrastructure/proxies/{assertiva-proxy.js,safeweb-proxy.js}`

### Organização final
- Core (regra de negócio): `src/core/{entities,ports,usecases}`
- Infra (detalhes técnicos): `src/infrastructure/{db,integrations,proxies,repositories}`
- Interface (HTTP): `src/interface/http/routes`
- Main (composition root): `src/main/{container.js,server.js}`
- Shared: `src/shared/utils/{hash,tokens}.js`

### Como rodar
- Servidor Clean: `npm run start:clean` (ou `npm run dev:clean`)
- Teste rápido: `npm run test:smoke:clean`

### Trocar JSON → Mongo (futuro)
- Substituir no `src/main/container.js` os repositórios `Json*Repository` por `Mongo*Repository` (quando implementados). Nenhuma rota/Use Case muda.

### Observações
- Contratos de resposta e chaves permanecem inalterados.
- Reexports em `src/backend/**` garantem que imports antigos sigam funcionando enquanto você atualiza referências.
