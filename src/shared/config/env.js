// Centraliza variáveis de ambiente relacionadas a Analytics
function getEnv() {
  return {
    ANALYTICS_PROVIDER: process.env.ANALYTICS_PROVIDER || 'ga4', // ga4 | ads | multi | none
    // GA4 Measurement Protocol
    GA4_MEASUREMENT_ID: process.env.GA4_MEASUREMENT_ID,
    GA4_API_SECRET: process.env.GA4_API_SECRET,
    // Google Ads (opcional)
    ADS_CONVERSION_ID: process.env.ADS_CONVERSION_ID,
    ADS_API_SECRET: process.env.ADS_API_SECRET
  };
}

module.exports = { getEnv };


