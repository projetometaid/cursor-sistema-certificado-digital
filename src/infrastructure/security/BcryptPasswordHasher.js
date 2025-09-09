const bcrypt = require('bcryptjs');

class BcryptPasswordHasher {
  constructor(rounds = Number(process.env.BCRYPT_ROUNDS || 10)){
    this.rounds = rounds;
  }
  async hash(plain){ return bcrypt.hash(plain, this.rounds); }
  async verify(plain, hash){ return bcrypt.compare(plain, hash); }
}

module.exports = BcryptPasswordHasher;


