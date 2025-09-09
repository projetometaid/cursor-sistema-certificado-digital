const AnalyticsPublisher = require('../../core/ports/AnalyticsPublisher');
const { requestWithRetry } = require('../http/httpClient');

class Ga4MeasurementPublisher extends AnalyticsPublisher {
  constructor({ measurementId, apiSecret }){
    super();
    this.measurementId = measurementId;
    this.apiSecret = apiSecret;
  }

  mapEventName(domainName){
    switch(domainName){
      case 'LeadSubmitted': return 'generate_lead';
      case 'ProtocolGenerated': return 'add_payment_info';
      case 'PaymentInitiated': return 'add_payment_info';
      case 'PaymentSucceeded': return 'purchase';
      case 'PaymentFailed': return 'purchase_failed';
      default: return domainName;
    }
  }

  buildEvent(domainName, payload){
    const name = this.mapEventName(domainName);
    const params = { ...payload };
    if (domainName === 'PaymentSucceeded') {
      params.transaction_id = payload.protocolId;
    }
    return { name, params };
  }

  async publish(eventName, payload, context = {}){
    if (!this.measurementId || !this.apiSecret) return;
    const base = 'https://www.google-analytics.com/mp/collect';
    const url = `${base}?measurement_id=${encodeURIComponent(this.measurementId)}&api_secret=${encodeURIComponent(this.apiSecret)}`;

    const userId = payload?.protocolId || undefined;
    const clientId = context?.clientId || undefined;
    const events = [ this.buildEvent(eventName, payload) ];

    const body = { client_id: clientId || 'backend-client', user_id: userId, events };
    try {
      await requestWithRetry('POST', url, body);
    } catch (e) {
      // swallow errors in analytics path, avoid breaking business flow
      if (process.env.DEBUG) console.error('[GA4] publish error', e.message);
    }
  }
}

module.exports = Ga4MeasurementPublisher;


