function LeadSubmittedEvent(input){
  const eventName = 'LeadSubmitted';
  const payload = normalize(input);
  return { eventName, payload };
}
function normalize(i={}){
  return {
    protocolId: String(i.protocolId||'').trim(),
    value: Number(i.value||0),
    currency: String(i.currency||'BRL'),
    paymentMethod: i.paymentMethod||undefined,
    status: i.status||'initiated',
    customer: {
      email_hash: i?.customer?.email_hash,
      phone_hash: i?.customer?.phone_hash,
      address: i?.customer?.address ? {
        city: i.customer.address.city,
        state: i.customer.address.state,
        zip: i.customer.address.zip
      } : undefined
    },
    consent: i?.consent ? {
      ad_user_data: !!i.consent.ad_user_data,
      ad_personalization: !!i.consent.ad_personalization
    } : undefined,
    source: i?.source ? {
      channel: i.source.channel,
      campaign: i.source.campaign,
      gclid: i.source.gclid
    } : undefined
  };
}
module.exports = LeadSubmittedEvent;


