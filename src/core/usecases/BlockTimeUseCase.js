module.exports = function BlockTimeUseCase({ schedulePolicyRepository }){
  return {
    async execute({ providerId, startISO, endISO, reason }){
      const policy = await schedulePolicyRepository.findByProviderId(providerId);
      if(!policy) return { ok:false, error:'policy_not_found' };
      const blocks = Array.isArray(policy?.exceptions?.blocks) ? policy.exceptions.blocks.slice() : [];
      blocks.push({ startISO, endISO, reason });
      await schedulePolicyRepository.upsert({ providerId, patch: { exceptions: { ...policy.exceptions, blocks } } });
      return { ok:true };
    }
  };
};


