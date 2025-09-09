const path = require('path');
const fs = require('fs');

// Carrega .env da raiz ou de config/.env
(function loadEnv() {
  const candidates = [
    path.resolve(process.cwd(), '.env'),
    path.resolve(__dirname, '.env')
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) {
      require('dotenv').config({ path: p });
      break;
    }
  }
})();

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  apiPort: process.env.PORT || 3000,
  frontendOrigin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173',
  // Safe2Pay
  safe2payToken: process.env.SAFE2PAY_TOKEN,
  safe2paySecret: process.env.SAFE2PAY_API_SECRET_KEY,
  // DB toggle (futuro): quando true, conecta no Mongo antes de subir o server
  useMongo: String(process.env.USE_MONGO || 'false').toLowerCase() === 'true'
};

module.exports = { env };


