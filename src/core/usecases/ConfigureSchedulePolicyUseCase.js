module.exports = function ConfigureSchedulePolicyUseCase({ schedulePolicyRepository }){
  return {
    async execute({ providerId, policy }){
      if(!providerId || !policy) return { ok:false, error:'invalid_input' };
      await schedulePolicyRepository.upsert({ providerId, patch: { ...policy } });
      const saved = await schedulePolicyRepository.findByProviderId(providerId);
      return { ok:true, policy: saved };
    }
  };
};


