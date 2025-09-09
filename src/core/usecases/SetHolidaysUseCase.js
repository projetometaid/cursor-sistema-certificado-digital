module.exports = function SetHolidaysUseCase({ schedulePolicyRepository }){
  return {
    async execute({ providerId, holidays }){
      const policy = await schedulePolicyRepository.findByProviderId(providerId);
      if(!policy) return { ok:false, error:'policy_not_found' };
      await schedulePolicyRepository.upsert({ providerId, patch: { exceptions: { ...policy.exceptions, holidays } } });
      return { ok:true };
    }
  };
};


