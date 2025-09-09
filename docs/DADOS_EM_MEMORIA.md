# Armazenamento em Memória (JSON) — Referência Rápida

Este documento lista tudo o que está sendo persistido localmente (arquivos JSON), onde fica, quem escreve/lê e o formato dos dados. Serve para não perdermos o contexto até migrar para MongoDB.

## Onde fica

- Diretório base: `src/backend/data/`
- Utilitário de armazenamento: `src/backend/data/localStore.js`
  - Cria os arquivos sob demanda
  - Operações: `getAll`, `saveItem`, `findOne`, `updateWhere`, `createId`

Arquivos envolvidos:
- `src/backend/data/users.json`  → usuários (auth)
- `src/backend/data/orders.json` → pedidos
- `src/backend/data/payments.json` → pagamentos (criado no primeiro uso)

## Quem usa

- Usuários (auth): `src/backend/services/auth.service.js`
  - Registros e login via rotas `POST /auth/register` e `POST /auth/login`
- Pedidos: `src/backend/services/orders.service.js`
  - Lista/cria via rotas `GET /orders` e `POST /orders`
- Pagamentos: `src/backend/services/payments.service.js`
  - Criação de PIX/Boleto p/ um pedido; usa `Safe2PayHybrid`
  - Webhook atualiza pedido via `POST /webhooks/safe2pay`

## Formatos dos dados (JSON)

### users.json (auth)
```json
{
  "id": "uuid",
  "name": "string",
  "email": "string",
  "passwordHash": "string-bcrypt"
}
```
- Observação: senhas são armazenadas como hash (bcrypt).

### orders.json (pedidos)
```json
{
  "id": "uuid",
  "type": "eCPF|eCNPJ",
  "customer": {
    "name": "string",
    "email": "string",
    "cpf": "string?",
    "cnpj": "string?",
    "phone": "string?"
  },
  "address": {
    "cep": "string?",
    "street": "string?",
    "number": "string?",
    "complement": "string?",
    "district": "string?",
    "city": "string?",
    "state": "string?"
  },
  "documents": {
    "caepf": "string?",
    "cei": "string?"
  },
  "protocolId": "string|null",
  "paymentRef": "string|null",
  "status": "created|awaiting_payment|paid|failed|canceled",
  "createdAt": "ISO-8601"
}
```

### payments.json (pagamentos)
```json
{
  "id": "uuid",
  "orderId": "uuid",
  "method": "PIX|BOLETO",
  "gateway": "Safe2Pay",
  "txId": "string|null",
  "reference": "string",
  "status": "pending|paid|failed|refunded|canceled",
  "payload": {},
  "createdAt": "ISO-8601"
}
```
- `reference` normalmente = número do protocolo (Safeweb)
- `payload` guarda a resposta crua do gateway (auditoria/debug)

## Operações de alto nível

- Criar usuário: `POST /auth/register`
- Login: `POST /auth/login` (retorna JWT)
- Criar pedido: `POST /orders` (gera registro e status inicial)
- Listar pedidos: `GET /orders`
- Webhook Safe2Pay: `POST /webhooks/safe2pay` (atualiza status por referência)

## Toggle para MongoDB (futuro)

- Variável em `config/settings.js`:
  - `USE_MONGO=false` (padrão): mantém armazenamento local (JSON)
  - `USE_MONGO=true`: tenta `connectMongo()` antes de subir a API; se falhar, segue em memória
- Conexão (stub): `src/backend/db/mongo.js`
- Estratégia de migração: manter contratos dos services e trocar `localStore` por repositórios Mongoose, sem mudar as rotas

## Dicas de manutenção

- Para “resetar” o ambiente local, limpe os arquivos `.json` em `src/backend/data/`
- Faça backup dos `.json` antes de mudanças estruturais nos schemas
- Logs de integração (Safeweb/Safe2Pay) continuam nos proxies integrais

## Segurança

- `passwordHash` é bcrypt (não armazenamos senha pura)
- Adicionar no `.env`: `JWT_SECRET` (já suportado em `tokens.js`) para assinar os JWTs

---
Este documento acompanha o estado atual “em memória” e serve como checklist durante a evolução para MongoDB.
