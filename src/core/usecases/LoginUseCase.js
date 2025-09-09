const { normalizeEmail } = require('../../shared/utils/email-normalize');

module.exports = function LoginUseCase({ userRepository, passwordHasher, authTokenService }){
  return {
    async execute({ email, password }){
      const user = await userRepository.findByEmail(normalizeEmail(email));
      if(!user) return { ok:false, errors:['credenciais inválidas'] };
      const ok = await passwordHasher.verify(password, user.passwordHash);
      if(!ok) return { ok:false, errors:['credenciais inválidas'] };
      const accessToken = authTokenService.signAccess({ sub:user.id, role:user.role });
      const refreshToken = authTokenService.signRefresh({ sub:user.id });
      if(userRepository.updateWhere){ try { await userRepository.updateWhere(user.id, { lastLoginAt: new Date().toISOString() }); } catch(_){} }
      return { ok:true, accessToken, refreshToken, user:{ id:user.id, fullName:user.fullName, email:user.email, role:user.role } };
    }
  };
};
