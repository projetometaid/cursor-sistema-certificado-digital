module.exports = function ReleaseHoldUseCase({ holdRepository }){
  return {
    async execute({ holdId }){
      const ok = await holdRepository.release(holdId);
      return { ok };
    }
  };
};


