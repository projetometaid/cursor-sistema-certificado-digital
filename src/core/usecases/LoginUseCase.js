module.exports = function LoginUseCase({ userRepository, comparePassword, signToken }){
  return {
    async execute({ email, password }){
      const user = await userRepository.findByEmail(email);
      if(!user) return { ok:false, errors:['credenciais inválidas'] };
      const ok = await comparePassword(password, user.passwordHash);
      if(!ok) return { ok:false, errors:['credenciais inválidas'] };
      const token = signToken({ sub:user.id, email:user.email });
      return { ok:true, token, user:{ id:user.id, name:user.name, email:user.email } };
    }
  };
};
