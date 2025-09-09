### 09/09/2025 - 15h09m - Google (Backend Analytics)

Objetivo: Adicionar rastreamento profissional (GA4/Ads) no backend seguindo Clean Architecture, sem frontend.

Campos disponíveis para os eventos:
- protocolId, value, currency, paymentMethod, status
- customer.email, customer.phone, customer.address.{city,state,zip}
- consent.{ad_user_data,ad_personalization}, source.{channel,campaign,gclid}

Privacidade: no publisher, aplicar hashEmail (SHA-256 lowercase/trim), hashPhone (SHA-256 dígitos) e enviar apenas address.{city,state,zip} (sem número/complemento).

1) Core — Contrato e Eventos (já adicionados)
- Porta: `src/core/ports/AnalyticsPublisher.js`
- Eventos (factories com normalização):
  - `src/core/events/LeadSubmittedEvent.js`
  - `src/core/events/ProtocolGeneratedEvent.js`
  - `src/core/events/PaymentInitiatedEvent.js`
  - `src/core/events/PaymentSucceededEvent.js`
  - `src/core/events/PaymentFailedEvent.js`

2) Shared — Privacidade e Config (já adicionados)
- `src/shared/privacy/pii.js`
  - hashEmail(email): SHA-256(lowercase/trim)
  - hashPhone(phone): SHA-256(somente dígitos)
  - normalizeAddress({city,state,zip})
- `src/shared/config/env.js` lê envs:
  - GA4_MEASUREMENT_ID, GA4_API_SECRET
  - ADS_CONVERSION_ID (opcional), ADS_API_SECRET (opcional)
  - ANALYTICS_PROVIDER = ga4 | ads | multi | none (default: ga4)
- Incluir no `.env` local (exemplo):
  - ANALYTICS_PROVIDER=ga4
  - GA4_MEASUREMENT_ID=G-XXXXXXX
  - GA4_API_SECRET=xxxxxxxx

3) Infrastructure — HTTP Client e Publishers (já adicionados)
- HTTP resiliente: `src/infrastructure/http/httpClient.js` (timeout 10s, 3 retries com jitter, circuit-breaker por host)
- GA4 Publisher: `src/infrastructure/analytics/Ga4MeasurementPublisher.js`
  - Mapeia domínio → GA4: LeadSubmitted→generate_lead; ProtocolGenerated→add_payment_info; PaymentInitiated→add_payment_info; PaymentSucceeded→purchase (transaction_id=protocolId); PaymentFailed→purchase_failed
  - Envia via Measurement Protocol: POST `https://www.google-analytics.com/mp/collect` com measurement_id, api_secret, client_id/user_id
  - Observação: falhas de publish não quebram o fluxo (logam apenas com DEBUG)
- (Opcional futuro) Ads: `GoogleAdsConversionPublisher.js` (não implementado aqui)

4) Main — Wiring no Container (já integrado)
- `src/main/container.js`:
  - Lê `ANALYTICS_PROVIDER` e instancia `Ga4MeasurementPublisher` (ou no futuro Ads/multi)
  - Expõe `container.analytics`

5) Interface/Use Cases — Disparo de Eventos (parcialmente integrado)
- Implementado:
  - LeadSubmitted: `src/core/usecases/CreateOrderUseCase.js` (após salvar o pedido)
  - PaymentSucceeded: `src/core/usecases/MarkOrderPaidUseCase.js` (webhook Safe2Pay)
- Pontos para a próxima IA completar (seguir os exemplos acima e NUNCA acoplar lógica GA no use case):
  - ProtocolGenerated: ao concluir geração de protocolo (ex.: retorno de `/protocols/ecpf` e `/protocols/ecnpj`), disparar `ProtocolGeneratedEvent`
  - PaymentInitiated: na criação do PIX (retorno de Safe2Pay), disparar `PaymentInitiatedEvent`
- Sempre publishe via `container.analytics.publish(eventName, payload)`

6) Health e Tests (próximos passos)
- GET `/health`: opcional expor `analytics: ok|circuit_open` (não obrigatório para funcionamento)
- Tests sugeridos:
  - `tests/core/analytics/analytics.publisher.contract.spec.js`: valida shape dos publishes (mock)
  - `tests/infrastructure/analytics/ga4.publisher.spec.js`: valida mapeamento e retry

7) Documentação (já criada)
- `docs/analytics-tracking.md`: mapeamentos, payloads e locais de disparo

Como executar (passo a passo)
1. Configurar `.env` com:
   - ANALYTICS_PROVIDER=ga4
   - GA4_MEASUREMENT_ID=G-XXXXXXX
   - GA4_API_SECRET=xxxxxxxx
2. Subir API: `node src/main/server.js`
3. Criar pedido (dispara LeadSubmitted):
   - POST `http://localhost:3000/orders`
   - body:
```json
{
  "type": "eCPF",
  "customer": {
    "email": "user@example.com",
    "phone": "(11) 99999-0000",
    "address": { "city": "CAMPINAS", "state": "SP", "zip": "13070000" }
  },
  "value": 120.0,
  "currency": "BRL",
  "consent": { "ad_user_data": true, "ad_personalization": true },
  "source": { "channel": "paid", "campaign": "ecnpj-a1", "gclid": "TEST-GCLID" }
}
```
4. Simular pagamento aprovado (dispara PaymentSucceeded):
   - POST `http://localhost:3000/webhooks/safe2pay` com `{ "Reference": "<protocolId>", "Status": "PAID" }`
5. (A ser feito pela próxima IA) Disparar em protocolo/PIX:
   - Após gerar protocolo: publicar `ProtocolGeneratedEvent`
   - Após criar PIX: publicar `PaymentInitiatedEvent`

Checklist de validação
- ANALYTICS_PROVIDER=ga4 no `.env`
- container.analytics presente no `container`
- CreateOrderUseCase publica LeadSubmitted
- Webhook Safe2Pay publica PaymentSucceeded/Failed
- PII hasheado (email/phone) e endereço sem número/complemento
- docs/analytics-tracking.md OK

Notas para a próxima IA
- Respeitar DIP: não injetar GA/Ads direto nos use cases; use a porta `AnalyticsPublisher`
- Reaproveitar `pii.js` para hashing antes de qualquer envio
- Não alterar comportamento de negócios se GA falhar; logar apenas em DEBUG


