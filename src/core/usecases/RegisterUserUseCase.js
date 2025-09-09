const { normalizeEmail } = require('../../shared/utils/email-normalize');

module.exports = function RegisterUserUseCase({ userRepository, passwordHasher }){
  return {
    async execute({ fullName, email, password, role, timezone, schedulingEnabled }){
      const errors = [];
      if(!email) errors.push('email obrigatório');
      if(!password) errors.push('senha obrigatória');
      if(errors.length) return { ok:false, errors };
      const emailNorm = normalizeEmail(email);
      const exists = await userRepository.findByEmail(emailNorm);
      if(exists) return { ok:false, errors:['email já cadastrado'] };
      const now = new Date().toISOString();
      const user = {
        id: cryptoId(),
        fullName: fullName||'',
        email: emailNorm,
        phone: '',
        role: role || 'provider',
        schedulingEnabled: Boolean(schedulingEnabled)||false,
        timezone: timezone || 'America/Sao_Paulo',
        status: 'active',
        passwordHash: await passwordHasher.hash(password),
        createdAt: now,
        updatedAt: now,
        lastLoginAt: null,
        consent: null,
        metadata: null
      };
      const saved = await userRepository.save(user);
      return { ok:true, user: { id:saved.id, fullName:saved.fullName, email:saved.email, role:saved.role } };
    }
  };
};
function cryptoId(){ try { return require('crypto').randomUUID(); } catch { return require('crypto').randomBytes(16).toString('hex'); } }
