const crypto = require('crypto');

function sha256Hex(value){
  return crypto.createHash('sha256').update(value).digest('hex');
}

function hashEmail(email){
  if(!email) return undefined;
  const norm = String(email).trim().toLowerCase();
  return sha256Hex(norm);
}

function hashPhone(phone){
  if(!phone) return undefined;
  const digits = String(phone).replace(/\D/g,'');
  return sha256Hex(digits);
}

function normalizeAddress(addr){
  if(!addr) return undefined;
  return {
    city: addr.city,
    state: addr.state,
    zip: addr.zip
  };
}

module.exports = { hashEmail, hashPhone, normalizeAddress };


