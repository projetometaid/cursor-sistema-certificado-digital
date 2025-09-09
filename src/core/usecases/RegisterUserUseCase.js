module.exports = function RegisterUserUseCase({ userRepository, hashPassword }){
  return {
    async execute({ name, email, password }){
      const errors = [];
      if(!email) errors.push('email obrigatório');
      if(!password) errors.push('senha obrigatória');
      if(errors.length) return { ok:false, errors };
      const exists = await userRepository.findByEmail(email);
      if(exists) return { ok:false, errors:['email já cadastrado'] };
      const user = { id: cryptoId(), name: name||'', email, passwordHash: await hashPassword(password) };
      const saved = await userRepository.save(user);
      return { ok:true, user: { id:saved.id, name:saved.name, email:saved.email } };
    }
  };
};
function cryptoId(){ try { return require('crypto').randomUUID(); } catch { return require('crypto').randomBytes(16).toString('hex'); } }
