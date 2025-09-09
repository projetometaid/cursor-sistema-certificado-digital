module.exports = function EnableSchedulingForUserUseCase({ userRepository, schedulePolicyRepository }){
  return {
    async execute({ providerId, enabled }){
      if(typeof enabled !== 'boolean') return { ok:false, error:'enabled must be boolean' };
      const user = await userRepository.findById ? userRepository.findById(providerId) : null;
      if(!user) return { ok:false, error:'user_not_found' };
      await schedulePolicyRepository.upsert({ providerId, patch: { enabled } });
      return { ok:true };
    }
  };
};


