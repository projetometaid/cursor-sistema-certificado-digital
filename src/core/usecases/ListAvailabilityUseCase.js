module.exports = function ListAvailabilityUseCase({ availabilityGenerator }){
  return {
    async execute({ providerId, fromISO, toISO }){
      return availabilityGenerator.execute({ providerId, fromISO, toISO });
    }
  };
};


