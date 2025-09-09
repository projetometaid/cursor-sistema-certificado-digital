## Analytics Tracking (Backend) — GA4/Ads

### Eventos de domínio
- LeadSubmitted: generate_lead (GA4)
- ProtocolGenerated: add_payment_info (GA4)
- PaymentInitiated: add_payment_info (GA4)
- PaymentSucceeded: purchase (transaction_id = protocolId)
- PaymentFailed: purchase_failed (custom)

### Campos esperados
- protocolId, value, currency, paymentMethod, status
- customer.email_hash (SHA-256 lowercase/trim)
- customer.phone_hash (SHA-256 dígitos)
- customer.address.{city,state,zip} (sem número/complemento)
- consent.{ad_user_data,ad_personalization}
- source.{channel,campaign,gclid}

### Destinos
- GA4 Measurement Protocol (default)
- Google Ads (opcional, Enhanced Conversions/CAPI)

### Onde dispara
- LeadSubmitted: CreateOrderUseCase (após salvar, antes de cobrança)
- ProtocolGenerated: ao finalizar geração do protocolo
- PaymentInitiated: na criação do PIX
- PaymentSucceeded/Failed: Webhook de pagamento

### Configuração
- ANALYTICS_PROVIDER=ga4|ads|multi|none (default: ga4)
- GA4_MEASUREMENT_ID, GA4_API_SECRET
- ADS_CONVERSION_ID (opcional), ADS_API_SECRET (opcional)

### Exemplo de payload (PaymentSucceeded)
```json
{
  "protocolId": "1008812093",
  "transactionId": "1008812093",
  "value": 120.0,
  "currency": "BRL",
  "paymentMethod": "pix",
  "status": "succeeded",
  "customer": {
    "email_hash": "<sha256>",
    "phone_hash": "<sha256>",
    "address": { "city": "CAMPINAS", "state": "SP", "zip": "13070064" }
  },
  "consent": { "ad_user_data": true, "ad_personalization": true },
  "source": { "channel": "paid", "campaign": "ecnpj-a1", "gclid": "..." }
}
```


