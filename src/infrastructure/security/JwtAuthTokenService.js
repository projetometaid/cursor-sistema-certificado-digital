const jwt = require('jsonwebtoken');

class JwtAuthTokenService {
  constructor({ secret = process.env.JWT_SECRET || 'dev-secret', accessTtl = process.env.ACCESS_TTL || '15m', refreshTtl = process.env.REFRESH_TTL || '7d' } = {}){
    this.secret = secret; this.accessTtl = accessTtl; this.refreshTtl = refreshTtl;
  }
  signAccess(payload){ return jwt.sign(payload, this.secret, { expiresIn: this.accessTtl }); }
  signRefresh(payload){ return jwt.sign(payload, this.secret, { expiresIn: this.refreshTtl }); }
  verifyAccess(token){ try{ return jwt.verify(token, this.secret); } catch{ return null; } }
  verifyRefresh(token){ try{ return jwt.verify(token, this.secret); } catch{ return null; } }
}

module.exports = JwtAuthTokenService;


